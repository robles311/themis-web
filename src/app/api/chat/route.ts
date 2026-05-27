import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { SPECIALTY_PROMPTS, DEFAULT_PROMPT } from '@/lib/legal-prompts'
import { buildRagContext } from '@/lib/rag'

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { messages, specialty } = body

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array is required and must not be empty' },
        { status: 400 }
      )
    }

    for (const m of messages) {
      if (
        !m ||
        (m.role !== 'user' && m.role !== 'assistant') ||
        typeof m.content !== 'string' ||
        m.content.length === 0 ||
        m.content.length > 5000
      ) {
        return NextResponse.json(
          { error: 'Invalid message: role must be "user" or "assistant" and content must be a string up to 5000 chars' },
          { status: 400 }
        )
      }
    }

    // Load the appropriate system prompt based on specialty
    const specKey = specialty?.toUpperCase() as keyof typeof SPECIALTY_PROMPTS
    let systemPrompt = specKey && SPECIALTY_PROMPTS[specKey]
      ? SPECIALTY_PROMPTS[specKey]
      : DEFAULT_PROMPT

    // RAG: Inject relevant legal context from the knowledge base
    const lastUserMessage = [...messages]
      .reverse()
      .find((m: { role: string }) => m.role === 'user')
    if (lastUserMessage) {
      const ragContext = await buildRagContext(
        (lastUserMessage as { content: string }).content,
        specialty,
      )
      if (ragContext) {
        systemPrompt += `\n\nContexto legal relevante:\n${ragContext}`
      }
    }

    const apiKey = process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY
    const ollamaHost = process.env.OLLAMA_HOST || 'http://localhost:11434'
    // Provider selection priority:
    // 1. DeepSeek if key exists (default when available - most VPS have it)
    // 2. OpenAI if key exists and no DeepSeek key
    // 3. Ollama (local) as fallback
    const hasDeepSeek = !!process.env.DEEPSEEK_API_KEY
    const hasOpenAI = !!process.env.OPENAI_API_KEY
    const forceOllama = process.env.USE_OLLAMA === 'true'
    const useDeepSeek = hasDeepSeek && !forceOllama
    const useOpenAI = hasOpenAI && !hasDeepSeek && !forceOllama

    // Build messages array with system prompt
    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
    ]

    let apiUrl: string
    let apiHeaders: Record<string, string>
    let apiBody: Record<string, unknown>

    if (useDeepSeek) {
      apiUrl = 'https://api.deepseek.com/v1/chat/completions'
      apiHeaders = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      }
      apiBody = {
        model: 'deepseek-chat',
        messages: apiMessages,
        stream: true,
      }
    } else if (useOpenAI) {
      apiUrl = 'https://api.openai.com/v1/chat/completions'
      apiHeaders = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      }
      apiBody = {
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: apiMessages,
        stream: true,
      }
    } else {
      // Default: use Ollama (local, free)
      apiUrl = `${ollamaHost}/v1/chat/completions`
      apiHeaders = { 'Content-Type': 'application/json' }
      apiBody = {
        model: process.env.OLLAMA_MODEL || 'qwen2.5:7b',
        messages: apiMessages,
        stream: true,
      }
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: apiHeaders,
      body: JSON.stringify(apiBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Chat API provider error:', response.status, errorText)
      return NextResponse.json(
        { error: `AI provider error: ${response.status}` },
        { status: response.status }
      )
    }

    const stream = response.body
    if (!stream) {
      return NextResponse.json(
        { error: 'No response stream from AI provider' },
        { status: 500 }
      )
    }

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
