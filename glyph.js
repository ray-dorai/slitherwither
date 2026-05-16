// glyph.js — Deterministic glyph generation and shareable card export

// ============================================================
// Hash function — turns a string into a stable 32-bit integer
// ============================================================
function hashString(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

// Seeded PRNG (mulberry32) — same seed → same sequence
function mulberry32(seed) {
  let a = seed >>> 0;
  return function() {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ============================================================
// Build a seed from the TEST DEFINITION (stable across takers)
// ============================================================
function seedFromTest(test) {
  // Use dimension names + question texts. Identical test → identical glyph.
  const sig = [
    ...test.dimensions.map(d => d.name),
    ...test.questions.map(q => q.text)
  ].join('|');
  return hashString(sig);
}

// ============================================================
// Glyph generator — builds an SVG <g> from a seed
// Returns { svgInner, viewBox } so we can embed in any container.
// ============================================================
function generateGlyph(seed, opts = {}) {
  const rand = mulberry32(seed);
  const size = 200;
  const cx = size / 2;
  const cy = size / 2;

  // Pick parameters from the seed.
  const symmetry = 3 + Math.floor(rand() * 6);      // 3–8 fold rotational symmetry
  const layers = 2 + Math.floor(rand() * 3);         // 2–4 concentric layers
  const baseRadius = 30 + rand() * 25;               // inner radius
  const innerStyle = Math.floor(rand() * 4);          // 0–3: center shape
  const lineWeight = 2 + Math.floor(rand() * 2);     // 2–3 px strokes
  const hasDots = rand() > 0.4;
  const hasRing = rand() > 0.3;

  const fg = opts.fg || '#0D0000';
  const bg = opts.bg || 'transparent';
  const accent = opts.accent || '#9FB85E';

  let parts = [];

  // Outer ring
  if (hasRing) {
    const ringR = 88 + rand() * 6;
    parts.push(`<circle cx="${cx}" cy="${cy}" r="${ringR}" fill="none" stroke="${fg}" stroke-width="${lineWeight}"/>`);
  }

  // Build one "arm" of the glyph, then rotate it `symmetry` times.
  // Each arm has multiple radial elements at different distances.
  const armElements = [];
  for (let layer = 0; layer < layers; layer++) {
    const r = baseRadius + layer * (15 + rand() * 12);
    const elementType = Math.floor(rand() * 5);

    if (elementType === 0) {
      // Petal: a small ellipse
      const w = 6 + rand() * 6;
      const h = 12 + rand() * 8;
      armElements.push(`<ellipse cx="${cx}" cy="${cy - r}" rx="${w}" ry="${h}" fill="${layer % 2 ? accent : fg}" stroke="${fg}" stroke-width="${lineWeight}"/>`);
    } else if (elementType === 1) {
      // Triangle
      const s = 8 + rand() * 6;
      const y = cy - r;
      armElements.push(`<polygon points="${cx},${y - s} ${cx - s},${y + s} ${cx + s},${y + s}" fill="${layer % 2 ? accent : 'none'}" stroke="${fg}" stroke-width="${lineWeight}"/>`);
    } else if (elementType === 2) {
      // Dot
      const radius = 4 + rand() * 4;
      armElements.push(`<circle cx="${cx}" cy="${cy - r}" r="${radius}" fill="${fg}"/>`);
    } else if (elementType === 3) {
      // Line/spoke
      const len = 10 + rand() * 12;
      armElements.push(`<line x1="${cx}" y1="${cy - r + len/2}" x2="${cx}" y2="${cy - r - len/2}" stroke="${fg}" stroke-width="${lineWeight + 1}" stroke-linecap="round"/>`);
    } else {
      // Diamond
      const s = 7 + rand() * 5;
      const y = cy - r;
      armElements.push(`<polygon points="${cx},${y - s} ${cx + s},${y} ${cx},${y + s} ${cx - s},${y}" fill="${layer % 2 ? 'none' : accent}" stroke="${fg}" stroke-width="${lineWeight}"/>`);
    }
  }

  // Rotate the arm around the center
  for (let i = 0; i < symmetry; i++) {
    const angle = (360 / symmetry) * i;
    parts.push(`<g transform="rotate(${angle} ${cx} ${cy})">${armElements.join('')}</g>`);
  }

  // Center shape
  if (innerStyle === 0) {
    parts.push(`<circle cx="${cx}" cy="${cy}" r="10" fill="${fg}"/>`);
    parts.push(`<circle cx="${cx}" cy="${cy}" r="5" fill="${bg === 'transparent' ? '#FFF6E0' : bg}"/>`);
  } else if (innerStyle === 1) {
    // Star burst
    let starPoints = [];
    const points = symmetry * 2;
    for (let i = 0; i < points; i++) {
      const a = (Math.PI * 2 * i) / points - Math.PI / 2;
      const r = i % 2 === 0 ? 14 : 6;
      starPoints.push(`${cx + Math.cos(a) * r},${cy + Math.sin(a) * r}`);
    }
    parts.push(`<polygon points="${starPoints.join(' ')}" fill="${fg}"/>`);
  } else if (innerStyle === 2) {
    parts.push(`<polygon points="${cx},${cy - 12} ${cx + 10},${cy + 8} ${cx - 10},${cy + 8}" fill="${fg}"/>`);
  } else {
    parts.push(`<rect x="${cx - 8}" y="${cy - 8}" width="16" height="16" fill="${fg}" transform="rotate(45 ${cx} ${cy})"/>`);
  }

  // Optional outer dots
  if (hasDots) {
    const dotR = 95;
    const dotCount = symmetry * 2;
    for (let i = 0; i < dotCount; i++) {
      const a = (Math.PI * 2 * i) / dotCount - Math.PI / 2;
      const x = cx + Math.cos(a) * dotR;
      const y = cy + Math.sin(a) * dotR;
      parts.push(`<circle cx="${x}" cy="${y}" r="2" fill="${fg}"/>`);
    }
  }

  return {
    svgInner: parts.join(''),
    viewBox: `0 0 ${size} ${size}`,
    size
  };
}

// Returns a full <svg> string ready to embed
function renderGlyphSVG(seed, opts) {
  const { svgInner, viewBox } = generateGlyph(seed, opts);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${svgInner}</svg>`;
}

// ============================================================
// Build a "title" word from the test signature — like a sigil name
// ============================================================
const SIGIL_SYLLABLES = [
  'sol', 'mir', 'kel', 'vor', 'tha', 'lyn', 'qui', 'rho', 'zen', 'fae',
  'um',  'ax',  'el',  'or',  'ith', 'arn', 'oss', 'eth', 'usk', 'oth'
];
function sigilName(seed) {
  const rand = mulberry32(seed ^ 0x9E3779B9);
  const syllables = 2 + Math.floor(rand() * 2);
  let out = '';
  for (let i = 0; i < syllables; i++) {
    out += SIGIL_SYLLABLES[Math.floor(rand() * SIGIL_SYLLABLES.length)];
  }
  return out.charAt(0).toUpperCase() + out.slice(1);
}

// ============================================================
// Render a complete shareable card as a single SVG, then to PNG
// ============================================================
function buildShareSVG({ test, scores, interpretation, glyphSeed, userName }) {
  const W = 1080;
  const H = 1080;
  const padding = 80;

  const glyph = generateGlyph(glyphSeed, {
    fg: '#0D0000',
    bg: '#FFF6E0',
    accent: '#9FB85E'
  });
  const sigil = sigilName(glyphSeed);

  // Test name — derive from first dimension or fall back
  const testName = test.dimensions.map(d => d.name).slice(0, 3).join(' / ') || 'Personality';

  // Top 4 dimensions by absolute score
  const sortedDims = test.dimensions
    .map(d => {
      const [min, max] = d.range;
      const score = scores[d.name] || 0;
      const pct = ((score - min) / (max - min)) * 100;
      return { name: d.name, score, pct };
    })
    .sort((a, b) => Math.abs(b.score) - Math.abs(a.score))
    .slice(0, 4);

  // Interpretation — wrap text manually for SVG
  const interpText = (interpretation || 'Unique results').slice(0, 200);
  const wrapped = wrapText(interpText, 42);

  // Build SVG
  const glyphSize = 360;
  const glyphX = (W - glyphSize) / 2;
  const glyphY = 140;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">`;

  // Background
  svg += `<rect width="${W}" height="${H}" fill="#FFD26A"/>`;

  // Inner paper card
  const cardMargin = 50;
  svg += `<rect x="${cardMargin}" y="${cardMargin}" width="${W - cardMargin*2}" height="${H - cardMargin*2}" rx="32" fill="#FFF6E0" stroke="#0D0000" stroke-width="6"/>`;

  // Header — sigil name (the glyph's "name")
  svg += `<text x="${W/2}" y="130" text-anchor="middle" font-family="Righteous, sans-serif" font-size="48" fill="#0D0000">${escapeXML(sigil)}</text>`;

  // Glyph (scale 200→360)
  const scale = glyphSize / 200;
  svg += `<g transform="translate(${glyphX} ${glyphY}) scale(${scale})">${glyph.svgInner}</g>`;

  // User name + test indicator
  const nameY = glyphY + glyphSize + 60;
  const displayName = userName || 'You';
  svg += `<text x="${W/2}" y="${nameY}" text-anchor="middle" font-family="Righteous, sans-serif" font-size="36" fill="#0D0000">${escapeXML(displayName)} · ${escapeXML(testName)}</text>`;

  // Interpretation text
  let interpY = nameY + 60;
  wrapped.forEach((line, i) => {
    svg += `<text x="${W/2}" y="${interpY + i * 32}" text-anchor="middle" font-family="Solway, serif" font-size="24" fill="#0D0000">${escapeXML(line)}</text>`;
  });
  interpY += wrapped.length * 32 + 20;

  // Mini dimension bars
  const barAreaWidth = 700;
  const barX = (W - barAreaWidth) / 2;
  const barLabelWidth = 220;
  const barTrackX = barX + barLabelWidth + 20;
  const barTrackWidth = barAreaWidth - barLabelWidth - 20;
  let barY = interpY + 10;

  sortedDims.forEach(d => {
    // Label
    svg += `<text x="${barX + barLabelWidth}" y="${barY + 18}" text-anchor="end" font-family="Solway, serif" font-size="22" fill="#0D0000">${escapeXML(d.name)}</text>`;
    // Track
    svg += `<rect x="${barTrackX}" y="${barY + 4}" width="${barTrackWidth}" height="20" rx="10" fill="#FFD26A" stroke="#0D0000" stroke-width="2"/>`;
    // Fill
    const fillW = Math.max(2, (d.pct / 100) * barTrackWidth);
    svg += `<rect x="${barTrackX}" y="${barY + 4}" width="${fillW}" height="20" rx="10" fill="#0D0000"/>`;
    barY += 40;
  });

  // Footer
  svg += `<text x="${W/2}" y="${H - 80}" text-anchor="middle" font-family="Righteous, sans-serif" font-size="22" fill="#0D0000">🐍 slitherwither</text>`;

  svg += `</svg>`;
  return svg;
}

function wrapText(text, maxChars) {
  const words = text.split(/\s+/);
  const lines = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > maxChars) {
      if (cur) lines.push(cur);
      cur = w;
    } else {
      cur = (cur + ' ' + w).trim();
    }
    if (lines.length >= 3) break;
  }
  if (cur && lines.length < 4) lines.push(cur);
  if (lines.length > 4) lines.length = 4;
  return lines;
}

function escapeXML(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// ============================================================
// SVG → PNG using canvas
// ============================================================
async function svgToPNG(svgString, width, height) {
  return new Promise((resolve, reject) => {
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      canvas.toBlob(b => resolve(b), 'image/png');
    };
    img.onerror = (e) => { URL.revokeObjectURL(url); reject(e); };
    img.src = url;
  });
}

async function downloadShareCard(payload) {
  const svg = buildShareSVG(payload);
  const blob = await svgToPNG(svg, 1080, 1080);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `slitherwither-${sigilName(payload.glyphSeed).toLowerCase()}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function shareCardWithNativeShare(payload) {
  const svg = buildShareSVG(payload);
  const blob = await svgToPNG(svg, 1080, 1080);
  const file = new File([blob], `slitherwither-${sigilName(payload.glyphSeed).toLowerCase()}.png`, { type: 'image/png' });

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: 'My SlitherWither result',
        text: `I'm ${sigilName(payload.glyphSeed)} — take the test:`
      });
      return true;
    } catch (e) {
      // user cancelled or share failed — fall back
    }
  }
  // Fallback: download
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return false;
}
