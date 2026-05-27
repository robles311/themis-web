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

    const apiKey = process.env.DEEPSEEK_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'DEEPSEEK_API_KEY is not configured' },
        { status: 500 }
      )
    }

    // Build messages array with system prompt
    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
    ]

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: apiMessages,
        stream: true,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('DeepSeek API error:', response.status, errorText)
      return NextResponse.json(
        { error: `DeepSeek API error: ${response.status}` },
        { status: response.status }
      )
    }

    const stream = response.body
    if (!stream) {
      return NextResponse.json(
        { error: 'No response stream from DeepSeek' },
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
