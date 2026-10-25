/**
 * Lightweight safe markdown renderer for tactical notes and descriptions.
 * Handles headings, bold, italic, bullet lists, blockquotes, and line breaks without external dependencies.
 */

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function renderMarkdown(raw: string): string {
  if (!raw || !raw.trim()) return '';

  const lines = raw.split(/\r?\n/);
  const output: string[] = [];
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Empty line closes list and adds spacing
    if (!trimmed) {
      if (inList) {
        output.push('</ul>');
        inList = false;
      }
      continue;
    }

    // Bullet list item (- or *)
    const listMatch = trimmed.match(/^[-*]\s+(.*)$/);
    if (listMatch) {
      if (!inList) {
        output.push('<ul class="list-disc list-inside space-y-1 my-1.5 opacity-90">');
        inList = true;
      }
      const itemContent = formatInline(escapeHtml(listMatch[1]));
      output.push(`<li>${itemContent}</li>`);
      continue;
    }

    if (inList) {
      output.push('</ul>');
      inList = false;
    }

    // Headings (###, ##, #)
    const h3Match = trimmed.match(/^###\s+(.*)$/);
    if (h3Match) {
      output.push(`<h4 class="text-xs font-bold text-base-content mt-2 mb-1 uppercase tracking-wide">${formatInline(escapeHtml(h3Match[1]))}</h4>`);
      continue;
    }
    const h2Match = trimmed.match(/^##\s+(.*)$/);
    if (h2Match) {
      output.push(`<h3 class="text-sm font-bold text-base-content mt-2.5 mb-1">${formatInline(escapeHtml(h2Match[1]))}</h3>`);
      continue;
    }
    const h1Match = trimmed.match(/^#\s+(.*)$/);
    if (h1Match) {
      output.push(`<h2 class="text-sm font-extrabold text-base-content mt-3 mb-1">${formatInline(escapeHtml(h1Match[1]))}</h2>`);
      continue;
    }

    // Blockquote (> )
    const quoteMatch = trimmed.match(/^>\s+(.*)$/);
    if (quoteMatch) {
      output.push(`<blockquote class="border-l-2 border-primary/70 pl-2.5 py-0.5 my-1.5 italic text-base-content/80 text-xs">${formatInline(escapeHtml(quoteMatch[1]))}</blockquote>`);
      continue;
    }

    // Standard paragraph line
    const formatted = formatInline(escapeHtml(trimmed));
    output.push(`<p class="leading-relaxed my-1">${formatted}</p>`);
  }

  if (inList) {
    output.push('</ul>');
  }

  return output.join('');
}

function formatInline(str: string): string {
  return str
    // Bold: **text** or __text__
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-base-content">$1</strong>')
    .replace(/__(.*?)__/g, '<strong class="font-bold text-base-content">$1</strong>')
    // Italic: *text* or _text_
    .replace(/\*(.*?)\*/g, '<em class="italic opacity-90">$1</em>')
    .replace(/_(.*?)_/g, '<em class="italic opacity-90">$1</em>')
    // Inline code: `code`
    .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-base-300 font-mono text-[11px]">$1</code>');
}
