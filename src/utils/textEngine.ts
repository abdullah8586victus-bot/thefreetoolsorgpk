// Text and Document Processing Engine

export interface TextStats {
  words: number;
  charactersWithSpaces: number;
  charactersNoSpaces: number;
  lines: number;
  paragraphs: number;
  sentences: number;
  readingTimeMinutes: number;
  speakingTimeMinutes: number;
}

export function computeTextStats(text: string): TextStats {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      words: 0,
      charactersWithSpaces: 0,
      charactersNoSpaces: 0,
      lines: 0,
      paragraphs: 0,
      sentences: 0,
      readingTimeMinutes: 0,
      speakingTimeMinutes: 0,
    };
  }

  const words = trimmed.split(/\s+/).filter(Boolean).length;
  const charactersWithSpaces = text.length;
  const charactersNoSpaces = text.replace(/\s/g, '').length;
  const lines = text.split(/\r\n|\r|\n/).length;
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
  const sentences = (text.match(/[^.!?]+[.!?]+(\s|$)/g) || []).length || (words > 0 ? 1 : 0);

  const readingTimeMinutes = Math.ceil(words / 200);
  const speakingTimeMinutes = Math.ceil(words / 130);

  return {
    words,
    charactersWithSpaces,
    charactersNoSpaces,
    lines,
    paragraphs,
    sentences,
    readingTimeMinutes,
    speakingTimeMinutes,
  };
}

export function convertCase(
  text: string,
  mode: 'upper' | 'lower' | 'title' | 'camel' | 'kebab' | 'snake' | 'pascal' | 'constant'
): string {
  if (!text) return '';

  switch (mode) {
    case 'upper':
      return text.toUpperCase();
    case 'lower':
      return text.toLowerCase();
    case 'title':
      return text.replace(
        /\w\S*/g,
        txt => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
      );
    case 'camel':
      return text
        .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
        .replace(/^[A-Z]/, c => c.toLowerCase());
    case 'pascal':
      return text
        .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
        .replace(/^[a-z]/, c => c.toUpperCase());
    case 'kebab':
      return text
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/[\s_]+/g, '-')
        .replace(/[^a-zA-Z0-9-]/g, '')
        .toLowerCase();
    case 'snake':
      return text
        .replace(/([a-z])([A-Z])/g, '$1_$2')
        .replace(/[\s-]+/g, '_')
        .replace(/[^a-zA-Z0-9_]/g, '')
        .toLowerCase();
    case 'constant':
      return text
        .replace(/([a-z])([A-Z])/g, '$1_$2')
        .replace(/[\s-]+/g, '_')
        .replace(/[^a-zA-Z0-9_]/g, '')
        .toUpperCase();
    default:
      return text;
  }
}

export function generateSlug(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function sortAndDeduplicateList(
  text: string,
  options: {
    sortMode: 'alpha-asc' | 'alpha-desc' | 'length' | 'none';
    removeDuplicates: boolean;
    trimLines: boolean;
    removeEmpty: boolean;
    addNumbers: boolean;
  }
): string {
  let lines = text.split('\n');

  if (options.trimLines) {
    lines = lines.map(l => l.trim());
  }

  if (options.removeEmpty) {
    lines = lines.filter(l => l.length > 0);
  }

  if (options.removeDuplicates) {
    lines = Array.from(new Set(lines));
  }

  if (options.sortMode === 'alpha-asc') {
    lines.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
  } else if (options.sortMode === 'alpha-desc') {
    lines.sort((a, b) => b.localeCompare(a, undefined, { numeric: true, sensitivity: 'base' }));
  } else if (options.sortMode === 'length') {
    lines.sort((a, b) => a.length - b.length);
  }

  if (options.addNumbers) {
    lines = lines.map((l, i) => `${i + 1}. ${l}`);
  }

  return lines.join('\n');
}

export function reverseStringContent(
  text: string,
  mode: 'characters' | 'words' | 'lines'
): string {
  if (mode === 'characters') {
    return text.split('').reverse().join('');
  }
  if (mode === 'words') {
    return text.split(/(\s+)/).reverse().join('');
  }
  if (mode === 'lines') {
    return text.split('\n').reverse().join('\n');
  }
  return text;
}

export function encodeHtmlEntities(text: string): string {
  return text.replace(/[&<>"']/g, match => {
    switch (match) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      case "'": return '&#39;';
      default: return match;
    }
  });
}

export function decodeHtmlEntities(text: string): string {
  const doc = new DOMParser().parseFromString(text, 'text/html');
  return doc.documentElement.textContent || '';
}

export function generateLoremIpsum(count: number, unit: 'paragraphs' | 'sentences' | 'words'): string {
  const wordsList = [
    'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
    'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
    'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
    'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
    'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
    'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
    'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
    'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum'
  ];

  function getSentence(): string {
    const len = 8 + Math.floor(Math.random() * 8);
    const chosen: string[] = [];
    for (let i = 0; i < len; i++) {
      chosen.push(wordsList[Math.floor(Math.random() * wordsList.length)]);
    }
    const str = chosen.join(' ');
    return str.charAt(0).toUpperCase() + str.slice(1) + '.';
  }

  function getParagraph(): string {
    const sCount = 4 + Math.floor(Math.random() * 4);
    const sentencesArr: string[] = [];
    for (let i = 0; i < sCount; i++) {
      sentencesArr.push(getSentence());
    }
    return sentencesArr.join(' ');
  }

  if (unit === 'words') {
    const res: string[] = [];
    for (let i = 0; i < count; i++) {
      res.push(wordsList[i % wordsList.length]);
    }
    return res.join(' ');
  }

  if (unit === 'sentences') {
    const res: string[] = [];
    for (let i = 0; i < count; i++) {
      res.push(getSentence());
    }
    return res.join(' ');
  }

  // paragraphs
  const paragraphs: string[] = [];
  for (let i = 0; i < count; i++) {
    paragraphs.push(getParagraph());
  }
  return paragraphs.join('\n\n');
}

export function computeSimpleDiff(oldText: string, newText: string): { type: 'same' | 'added' | 'removed'; text: string }[] {
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');
  const result: { type: 'same' | 'added' | 'removed'; text: string }[] = [];

  const maxLen = Math.max(oldLines.length, newLines.length);
  for (let i = 0; i < maxLen; i++) {
    const o = oldLines[i];
    const n = newLines[i];

    if (o === undefined) {
      result.push({ type: 'added', text: n });
    } else if (n === undefined) {
      result.push({ type: 'removed', text: o });
    } else if (o === n) {
      result.push({ type: 'same', text: o });
    } else {
      result.push({ type: 'removed', text: o });
      result.push({ type: 'added', text: n });
    }
  }

  return result;
}
