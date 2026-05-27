#!/usr/bin/env python3
"""
Extract all legal documents from claude-for-legal-chile/normativa/
and generate a seed-data.json with embeddings for the Themis RAG system.

Reads markdown files with YAML frontmatter, categorizes by materia (specialty),
and generates embeddings using fastembed.
"""
import json
import os
import re
import sys

NORMATIVA_DIR = os.path.expanduser("~/claude-for-legal-chile/chile/normativa")
OUTPUT_FILE = os.path.expanduser("~/asistente-juridico/seed-data-big.json")

# Map materia keywords to our specialty system
MATERIA_MAP = {
    'civil': 'CIVIL',
    'obligaciones y contratos': 'CIVIL',
    'personas y familia': 'FAMILIAR',
    'derechos reales': 'CIVIL',
    'sucesiones': 'CIVIL',
    'prescripción': 'CIVIL',
    'penal': 'PENAL',
    'penal corporativo': 'PENAL',
    'penal económico': 'PENAL',
    'procesal penal': 'PENAL',
    'laboral': 'LABORAL',
    'seguridad social': 'LABORAL',
    'tributario': 'TRIBUTARIO',
    'familia': 'FAMILIAR',
    'procesal': 'CIVIL',
    'societario': 'CONTRATOS',
    'comercial': 'CONTRATOS',
    'consumidor': 'CONTRATOS',
    'contratos': 'CONTRATOS',
    'concursal': 'CONTRATOS',
    'administrativo': 'CIVIL',
    'transparencia': 'CIVIL',
    'compras públicas': 'CIVIL',
    'ambiental': 'CIVIL',
    'minero': 'CONTRATOS',
    'financiero': 'CONTRATOS',
    'privacidad': 'CIVIL',
    'orgánico judicial': 'CIVIL',
    'inmuebles': 'INMUEBLES',
    'propiedad': 'INMUEBLES',
    'urbanismo': 'INMUEBLES',
    'construcciones': 'INMUEBLES',
    'aguas': 'INMUEBLES',
    'minería': 'CONTRATOS',
    'seguros': 'CONTRATOS',
    'salud': 'CIVIL',
    'educación': 'CIVIL',
    'transporte': 'CIVIL',
    'telecomunicaciones': 'CONTRATOS',
    'cultura': 'CIVIL',
    'derechos humanos': 'CIVIL',
    'infancia': 'FAMILIAR',
    'adulto mayor': 'CIVIL',
    'género': 'FAMILIAR',
    'discapacidad': 'CIVIL',
    'mujer': 'FAMILIAR',
    'adopción': 'FAMILIAR',
    'extranjería': 'CIVIL',
    'defensa': 'CIVIL',
}

def parse_frontmatter(content):
    """Parse YAML-like frontmatter from markdown content."""
    lines = content.split('\n')
    if not lines or lines[0].strip() != '---':
        return {}, content
    
    end_idx = -1
    for i in range(1, len(lines)):
        if lines[i].strip() == '---':
            end_idx = i
            break
    
    if end_idx == -1:
        return {}, content
    
    fm_lines = lines[1:end_idx]
    body = '\n'.join(lines[end_idx+1:])
    
    fm = {}
    current_key = None
    current_list = []
    
    for line in fm_lines:
        # List item
        if line.startswith('  - ') and current_key:
            current_list.append(line.strip('  - '))
            continue
        elif line.startswith('- ') and not line.startswith('  '):
            # Top-level list item
            val = line.lstrip('- ')
            current_key = None
            continue
            
        match = re.match(r'^(\w[\w_]*):\s*(.*)', line)
        if match:
            if current_key and current_list:
                fm[current_key] = current_list
                current_list = []
            
            current_key = match.group(1)
            val = match.group(2).strip()
            
            if val.startswith('[') and val.endswith(']'):
                fm[current_key] = [v.strip().strip('"').strip("'") for v in val[1:-1].split(',') if v.strip()]
            elif val == '' or val == '[]':
                fm[current_key] = []
                current_list = []
            elif val:
                fm[current_key] = val
                current_key = None
    
    if current_key and current_list:
        fm[current_key] = current_list
    
    return fm, body


def extract_specialty(fm):
    """Determine the specialty from frontmatter materia field."""
    materias = fm.get('materia', [])
    if isinstance(materias, str):
        materias = [materias]
    
    for materia in materias:
        m_lower = materia.lower().strip()
        for key, spec in MATERIA_MAP.items():
            if key in m_lower:
                return spec
    
    # Default by filename
    filename = fm.get('slug', '')
    if 'trabajo' in filename or 'laboral' in filename:
        return 'LABORAL'
    if 'penal' in filename:
        return 'PENAL'
    if 'tributario' in filename or 'renta' in filename or 'iva' in filename:
        return 'TRIBUTARIO'
    if 'civil' in filename:
        return 'CIVIL'
    if 'familia' in filename or 'matrimonio' in filename or 'divorcio' in filename:
        return 'FAMILIAR'
    if 'comercio' in filename or 'sociedad' in filename or 'anonima' in filename:
        return 'CONTRATOS'
    if 'inmueble' in filename or 'copropri' in filename or 'arrend' in filename or 'urbano' in filename or 'urbanismo' in filename or 'constru' in filename:
        return 'INMUEBLES'
    
    return 'CIVIL'  # Default


def slug_to_law_number(slug):
    """Extract law number from slug for display."""
    match = re.search(r'(\d+)', slug)
    if match:
        return match.group(1)
    return ''


def main():
    print("Scanning normativa directory...")
    
    docs = []
    categories = {}
    
    # Process codigos
    codigos_dir = os.path.join(NORMATIVA_DIR, 'codigos')
    for f in sorted(os.listdir(codigos_dir)):
        if not f.endswith('.md') or f == '00-indice.md':
            continue
        filepath = os.path.join(codigos_dir, f)
        with open(filepath, 'r', encoding='utf-8') as fh:
            content = fh.read()
        
        fm, body = parse_frontmatter(content)
        specialty = extract_specialty(fm)
        
        # Clean body - remove excessive whitespace
        body_clean = re.sub(r'\n{3,}', '\n\n', body).strip()
        
        if not body_clean:
            continue
        
        # Get law number
        slug = fm.get('slug', f.replace('.md', ''))
        law_num = slug_to_law_number(slug)
        
        doc = {
            'specialty': specialty,
            'code_name': fm.get('norma', fm.get('titulo_oficial', slug.replace('-', ' ').title())),
            'article_number': law_num,
            'title': f"Código: {fm.get('titulo_oficial', fm.get('norma', slug.replace('-', ' ').title()))}",
            'content': body_clean[:5000],  # Limit to 5000 chars
        }
        docs.append(doc)
        categories[specialty] = categories.get(specialty, 0) + 1
        print(f"  [{specialty}] {doc['code_name']}")
    
    # Process leyes
    leyes_dir = os.path.join(NORMATIVA_DIR, 'leyes')
    for f in sorted(os.listdir(leyes_dir)):
        if not f.endswith('.md') or f == '00-indice.md':
            continue
        filepath = os.path.join(leyes_dir, f)
        with open(filepath, 'r', encoding='utf-8') as fh:
            content = fh.read()
        
        fm, body = parse_frontmatter(content)
        specialty = extract_specialty(fm)
        
        body_clean = re.sub(r'\n{3,}', '\n\n', body).strip()
        if not body_clean:
            continue
        
        slug = fm.get('slug', f.replace('.md', ''))
        law_num = slug_to_law_number(slug)
        
        # If it's very long, split into sections by headings
        sections = re.split(r'\n(?=## )', body_clean)
        
        for i, section in enumerate(sections):
            section = section.strip()
            if len(section) < 100:
                continue
            
            # Extract section title
            sec_title = ''
            sec_match = re.match(r'## (.+)', section)
            if sec_match:
                sec_title = sec_match.group(1).strip()
            
            title = fm.get('titulo_oficial', slug.replace('-', ' ').title())
            if sec_title:
                title = f"{title} — {sec_title}"
            
            doc = {
                'specialty': specialty,
                'code_name': fm.get('norma', fm.get('titulo_oficial', slug.replace('-', ' ').title())),
                'article_number': law_num,
                'title': title,
                'content': section[:5000],
            }
            docs.append(doc)
        
        categories[specialty] = categories.get(specialty, 0) + 1
        print(f"  [{specialty}] {f} ({len(sections)} secciones)")
    
    print(f"\nTotal: {len(docs)} document sections across {len(categories)} specialties")
    for spec, count in sorted(categories.items()):
        print(f"  {spec}: {count}")
    
    # Now generate embeddings
    print("\n--- Generating embeddings with fastembed ---")
    print("Starting Python subprocess to generate embeddings...")
    
    # Import here to allow the extraction to work even if fastembed isn't installed
    try:
        from fastembed import TextEmbedding
        model = TextEmbedding(model_name="sentence-transformers/all-MiniLM-L6-v2")
        
        for i, doc in enumerate(docs):
            if i % 20 == 0:
                print(f"  Embedding {i+1}/{len(docs)}...")
            embedding = list(model.embed(doc['content']))[0].tolist()
            doc['embedding'] = embedding
        
        print("Embeddings generated successfully")
        
    except ImportError:
        print("fastembed not installed. To generate embeddings:")
        print("  pip install fastembed")
        print("  Then re-run this script")
        # Create docs without embeddings (just the text)
        for doc in docs:
            doc['embedding'] = []
    
    # Save to JSON
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(docs, f, ensure_ascii=False, indent=2)
    
    print(f"\nSaved to {OUTPUT_FILE}")
    print(f"Total documents: {len(docs)}")

if __name__ == '__main__':
    main()
