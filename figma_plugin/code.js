/* PassGen Pro – UI Design Kit (v4)
 * Generates a complete, professional design system + a fully clickable
 * prototype for the PassGen password generator project.
 *
 * 15 frames produced (left → right, top → bottom):
 *   Row 0 : Cover, Design tokens
 *   Row 1 : Components, Strength matrix
 *   Row 2 : Desktop · Home · Initial, Desktop · Home · Generated, Desktop · Home · Copied
 *   Row 3 : Desktop · History · Filled, Desktop · History · Empty
 *   Row 4 : Mobile · Home · Initial, Mobile · Home · Generated, Mobile · Home · Copied,
 *           Mobile · History · Filled, Mobile · History · Empty, Tablet · Home
 *
 * Prototype links (≈ 30 reactions) for both desktop and mobile flows:
 *   GENERATE  : Home Initial ↔ Home Generated; Copied → Initial
 *   COPY      : Home (any)   → Home Copied (toast visible)
 *   HISTORY   : Home (any)   → Desktop · History · Filled (mobile → Mobile · History · Filled)
 *   BACK      : History (any) → Home Initial
 *   CLEAR     : History · Filled → History · Empty
 *   CTA       : History · Empty  → Home Initial
 *
 * After running, select Desktop · Home · Initial (or Mobile · Home · Initial) and press
 * ▶ Present in Figma to walk through the prototype.
 */

/* ---------- Design tokens ---------- */
var T = {
  c: {
    bg:           '#0A0B22',
    bgDeep:       '#06061A',
    surface:      '#11132E',
    surfaceSoft:  '#161A3D',
    surfaceDeep:  '#080820',
    surfaceRow:   '#0B0C28',
    border:       '#1E2147',
    borderSoft:   '#252861',
    accent:       '#6366F1',
    accentDeep:   '#2F119C',
    accentBright: '#4F2BE6',
    info:         '#0EA5E9',
    cyan:         '#22D3EE',
    text:         '#F8FAFC',
    textMuted:    '#9AA3C8',
    textDim:      '#6B7299',
    success:      '#22C55E',
    warning:      '#F59E0B',
    danger:       '#EF4444',
    danger2:      '#9F1F2C'
  },
  s: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 },
  r: { sm: 6, md: 10, lg: 14, xl: 20, pill: 999 },
  t: { h1: 44, h2: 32, h3: 24, h4: 20, body: 16, small: 13, micro: 11 }
};

var FONT_REG  = { family: 'Inter', style: 'Regular' };
var FONT_MED  = { family: 'Inter', style: 'Medium' };
var FONT_SEM  = { family: 'Inter', style: 'Semi Bold' };
var FONT_BOLD = { family: 'Inter', style: 'Bold' };

/* ---------- Generic helpers ---------- */
function hexToRgb(hex) {
  var n = parseInt(String(hex).replace('#', ''), 16);
  return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 };
}

function fill(hex, opacity) {
  var p = { type: 'SOLID', color: hexToRgb(hex) };
  if (typeof opacity === 'number') p.opacity = opacity;
  return [p];
}

function stroke(hex, opacity) {
  var p = { type: 'SOLID', color: hexToRgb(hex) };
  if (typeof opacity === 'number') p.opacity = opacity;
  return [p];
}

function frame(parent, name, x, y, w, h, color, radius) {
  var n = figma.createFrame();
  n.name = name;
  n.x = x;
  n.y = y;
  n.resize(w, h);
  n.fills = color ? fill(color) : [];
  n.cornerRadius = radius || 0;
  n.clipsContent = false;
  if (parent) parent.appendChild(n);
  return n;
}

function rect(parent, name, x, y, w, h, color, radius, opacity) {
  var n = figma.createRectangle();
  n.name = name;
  n.x = x;
  n.y = y;
  n.resize(w, h);
  n.fills = color ? fill(color, opacity) : [];
  n.cornerRadius = radius || 0;
  if (parent) parent.appendChild(n);
  return n;
}

function ellipse(parent, name, x, y, w, h, color, opacity) {
  var n = figma.createEllipse();
  n.name = name;
  n.x = x;
  n.y = y;
  n.resize(w, h);
  n.fills = color ? fill(color, opacity) : [];
  if (parent) parent.appendChild(n);
  return n;
}

function line(parent, name, x, y, w, color, weight, opacity) {
  return rect(parent, name, x, y, w, weight || 1, color, 999, opacity);
}

function text(parent, name, value, x, y, w, size, weight, color, align) {
  var n = figma.createText();
  n.name = name;
  n.x = x;
  n.y = y;
  n.resize(w, size + 6);
  var f = FONT_REG;
  if (weight === 'medium') f = FONT_MED;
  else if (weight === 'semi') f = FONT_SEM;
  else if (weight === 'bold') f = FONT_BOLD;
  n.fontName = f;
  n.characters = String(value);
  n.fontSize = size;
  n.lineHeight = { value: Math.round(size * 1.35), unit: 'PIXELS' };
  n.letterSpacing = { value: -1, unit: 'PERCENT' };
  n.fills = fill(color || T.c.text);
  n.textAlignHorizontal = align || 'LEFT';
  n.textAutoResize = 'HEIGHT';
  if (parent) parent.appendChild(n);
  return n;
}

function setStroke(node, color, weight) {
  node.strokes = stroke(color);
  node.strokeWeight = weight || 1;
  node.strokeAlign = 'INSIDE';
}

function shadow(node, blur, y, opacity) {
  node.effects = [{
    type: 'DROP_SHADOW',
    color: { r: 0, g: 0, b: 0, a: typeof opacity === 'number' ? opacity : 0.45 },
    offset: { x: 0, y: y || 16 },
    radius: blur || 32,
    spread: 0,
    visible: true,
    blendMode: 'NORMAL'
  }];
}

function glow(node, blur, color, opacity) {
  var existing = node.effects ? node.effects.slice() : [];
  existing.push({
    type: 'DROP_SHADOW',
    color: Object.assign({}, hexToRgb(color || T.c.accent), { a: typeof opacity === 'number' ? opacity : 0.55 }),
    offset: { x: 0, y: 0 },
    radius: blur || 32,
    spread: 0,
    visible: true,
    blendMode: 'NORMAL'
  });
  node.effects = existing;
}

/* ---------- Atoms ---------- */
function lockIcon(parent, x, y, scale) {
  var s = scale || 1;
  var g = frame(parent, 'Icon / Lock', x, y, 36 * s, 40 * s, null, 0);
  var sh = frame(g, 'Shackle', 7 * s, 0, 22 * s, 22 * s, null, 13 * s);
  setStroke(sh, '#D9DFEF', 4 * s);
  rect(g, 'Body', 2 * s, 16 * s, 32 * s, 24 * s, '#F4C13D', 6 * s);
  rect(g, 'Body shine', 4 * s, 18 * s, 28 * s, 6 * s, '#FFE079', 3 * s);
  rect(g, 'Body keyhole', 14 * s, 22 * s, 8 * s, 12 * s, T.c.bg, 3 * s);
  ellipse(g, 'Notification dot', 26 * s, 26 * s, 14 * s, 14 * s, T.c.info);
  setStroke(g.children[g.children.length - 1], '#DFF3FF', 2 * s);
  return g;
}

function brandRow(parent, x, y, scale) {
  var s = scale || 1;
  var g = frame(parent, 'Brand', x, y, 200 * s, 44 * s, null, 0);
  lockIcon(g, 0, 2 * s, s);
  text(g, 'Brand name', 'PassGen', 46 * s, 2 * s, 160 * s, Math.round(28 * s), 'bold', T.c.text);
  return g;
}

function pillBtn(parent, name, label, x, y, w, h, bg, txtColor, fontSize) {
  var b = frame(parent, name, x, y, w, h, bg, T.r.lg);
  text(b, name + ' · label', label, 0, Math.round((h - (fontSize || 14)) / 2 - 1), w, fontSize || 14, 'bold', txtColor || T.c.text, 'CENTER');
  return b;
}

function ghostBtn(parent, name, label, x, y, w, h) {
  var b = frame(parent, name, x, y, w, h, null, T.r.lg);
  setStroke(b, T.c.borderSoft, 1);
  text(b, name + ' · label', label, 0, Math.round((h - 14) / 2 - 1), w, 14, 'bold', T.c.text, 'CENTER');
  return b;
}

function checkbox(parent, x, y, checked) {
  var size = 28;
  var box = rect(parent, checked ? 'Checkbox / On' : 'Checkbox / Off', x, y, size, size, checked ? T.c.accent : T.c.surfaceDeep, 8);
  if (!checked) setStroke(box, T.c.borderSoft, 1);
  if (checked) {
    var t1 = rect(parent, 'Check tick (-)', x + 6, y + 14, 7, 4, T.c.text, 999);
    t1.rotation = -45;
    var t2 = rect(parent, 'Check tick (\\)', x + 11, y + 18, 14, 4, T.c.text, 999);
    t2.rotation = -55;
  }
  return box;
}

function slider(parent, x, y, w, percent) {
  percent = Math.max(0, Math.min(100, percent || 30));
  var track = rect(parent, 'Slider track', x, y + 12, w, 8, T.c.surfaceDeep, 999);
  setStroke(track, T.c.border, 1);
  rect(parent, 'Slider active', x, y + 12, Math.round(w * percent / 100), 8, T.c.accent, 999);
  var thumbX = x + Math.round(w * percent / 100) - 16;
  var thumb = ellipse(parent, 'Slider thumb', thumbX, y, 32, 32, T.c.text);
  setStroke(thumb, T.c.accent, 3);
  glow(thumb, 18, T.c.accent, 0.6);
}

function infoDot(parent, x, y, color) {
  // NOTE: in Figma, ellipses are NOT containers (appendChild throws),
  // so we render the dot and the inner letter as siblings of `parent`.
  var d = ellipse(parent, 'Info dot', x, y, 24, 24, color);
  text(parent, 'Info dot · i', 'i', x, y + 3, 24, 14, 'bold', '#0B1224', 'CENTER');
  return d;
}

function strengthBadge(parent, x, y, label, color) {
  var w = label.length > 8 ? 130 : 110;
  var b = frame(parent, 'Strength badge / ' + label, x, y, w, 30, color, T.r.pill);
  text(b, 'Strength badge · text', label.toUpperCase(), 0, 7, w, 12, 'bold', '#06140A', 'CENTER');
  return b;
}

function toastNode(parent, x, y, msg, color) {
  color = color || T.c.success;
  var t = frame(parent, 'Toast / ' + msg, x, y, 240, 50, color, 14);
  // tick icon
  var dot = ellipse(t, 'Toast / icon', 14, 13, 24, 24, '#FFFFFF', 0.85);
  text(t, 'Toast / text', msg, 44, 16, 200, 14, 'bold', '#062012', 'LEFT');
  glow(t, 24, color, 0.45);
  return t;
}

/* ---------- Card pieces ---------- */
function cardBackground(parent, name, w, h) {
  var card = frame(parent, name, 0, 0, w, h, T.c.surface, 28);
  setStroke(card, T.c.border, 1);
  shadow(card, 64, 24, 0.55);
  ellipse(card, 'Glow / cyan', -120, h - 280, 240, 240, T.c.cyan, 0.18);
  ellipse(card, 'Glow / purple', w - 200, -120, 280, 280, T.c.accentBright, 0.22);
  return card;
}

/** Returns { history, api } */
function cardTopbar(parent, w, padX, mode) {
  var py = mode === 'mobile' ? 18 : 26;
  brandRow(parent, padX, py, mode === 'mobile' ? 0.85 : 1);
  var hbW = mode === 'mobile' ? 96 : 112;
  var hb = pillBtn(parent, 'Top / History pill', 'HISTORY', w - padX - hbW, py + 6, hbW, 36, T.c.surfaceSoft, T.c.text, 12);
  setStroke(hb, T.c.borderSoft, 1);
  var api = null;
  if (mode !== 'mobile') {
    api = ghostBtn(parent, 'Top / Settings', 'API', w - padX - hbW - 64, py + 6, 56, 36);
  }
  return { history: hb, api: api };
}

/** Returns { box, copy } so callers can wire prototype reactions on the copy button. */
function passwordOutput(parent, x, y, w, sample, mode) {
  var h = mode === 'mobile' ? 78 : 92;
  var box = frame(parent, 'Password output', x, y, w, h, T.c.surfaceDeep, T.r.xl);
  setStroke(box, T.c.text, 2);
  glow(box, 28, T.c.info, 0.35);
  var fontSize = mode === 'mobile' ? 22 : 30;
  text(box, 'Output / value', sample, 22, Math.round((h - fontSize) / 2 - 2), w - 100, fontSize, 'bold', T.c.text, 'LEFT');
  var cb = frame(box, 'Output / copy button', w - 64, (h - 48) / 2, 48, 48, T.c.surface, 12);
  setStroke(cb, T.c.borderSoft, 1);
  var glyphBack = rect(cb, 'Copy glyph back', 14, 12, 18, 22, null, 4);
  setStroke(glyphBack, T.c.text, 2);
  var glyphFront = rect(cb, 'Copy glyph front', 18, 16, 18, 22, T.c.surface, 4);
  setStroke(glyphFront, T.c.text, 2);
  return { box: box, copy: cb };
}

function strengthLine(parent, x, y, w, label, desc, color) {
  var g = frame(parent, 'Strength line / ' + label, x, y, w, 56, null, 0);
  infoDot(g, 0, 6, color);
  text(g, 'Strength label', label, 36, 0, 220, 20, 'bold', color);
  text(g, 'Strength desc', desc, 36, 26, w - 36, 13, 'medium', T.c.textMuted);
  return g;
}

/** Returns { card, reset } */
function lengthCard(parent, x, y, w, length, mode) {
  var h = mode === 'mobile' ? 156 : 144;
  var card = frame(parent, 'Length card', x, y, w, h, T.c.surfaceRow, T.r.xl);
  setStroke(card, T.c.border, 1);
  text(card, 'Length / label', 'Password length', 24, 22, 240, 18, 'medium', T.c.text);
  var pill = frame(card, 'Length / pill', 24 + 200, 18, 36, 28, T.c.text, 999);
  text(pill, 'Length / value', String(length), 0, 5, 36, 16, 'bold', '#101327', 'CENTER');
  var reset;
  if (mode === 'mobile') {
    reset = pillBtn(card, 'Length / reset', 'RESET DEFAULTS', 24, 60, w - 48, 44, T.c.accentDeep, T.c.text, 13);
  } else {
    reset = pillBtn(card, 'Length / reset', 'RESET', w - 24 - 132, 16, 132, 44, T.c.accentDeep, T.c.text, 13);
  }
  var sy = mode === 'mobile' ? 116 : 86;
  slider(card, 24, sy, w - 48, Math.round((length - 6) / (32 - 6) * 100));
  text(card, 'Length / min', '6', 24, sy + 30, 30, 11, 'medium', T.c.textDim, 'LEFT');
  text(card, 'Length / max', '32', w - 24 - 30, sy + 30, 30, 11, 'medium', T.c.textDim, 'RIGHT');
  return { card: card, reset: reset };
}

function optionRow(parent, x, y, w, label, checked) {
  var row = frame(parent, 'Option / ' + label, x, y, w, 64, T.c.surfaceRow, T.r.lg);
  setStroke(row, T.c.border, 1);
  text(row, 'Option / label', label, 22, 21, w - 80, 18, 'medium', T.c.text);
  checkbox(row, w - 22 - 28, 18, checked);
  return row;
}

function generateBtn(parent, x, y, w) {
  var b = frame(parent, 'Generate button', x, y, w, 60, T.c.accentDeep, T.r.xl);
  glow(b, 22, T.c.accentBright, 0.5);
  text(b, 'Generate / label', 'GENERATE PASSWORD', 0, 21, w, 16, 'bold', T.c.text, 'CENTER');
  return b;
}

function metaCard(parent, x, y, w, label, value) {
  var m = frame(parent, 'Meta / ' + label, x, y, w, 64, T.c.surfaceRow, T.r.lg);
  setStroke(m, T.c.border, 1);
  text(m, 'Meta / label', label.toUpperCase(), 16, 12, w - 32, 11, 'bold', T.c.textMuted);
  text(m, 'Meta / value', value, 16, 30, w - 32, 16, 'bold', T.c.text);
  return m;
}

/* ---------- Pages ---------- */
function buildCover(x, y) {
  var w = 1440, h = 720;
  var f = frame(figma.currentPage, 'PassGen Pro · Cover', x, y, w, h, T.c.bg, 0);
  f.clipsContent = true;
  ellipse(f, 'Cover / glow purple', w - 320, -180, 520, 520, T.c.accentBright, 0.35);
  ellipse(f, 'Cover / glow cyan', -200, h - 320, 460, 460, T.c.cyan, 0.18);
  ellipse(f, 'Cover / glow indigo', w / 2 - 220, h / 2 - 200, 440, 440, T.c.accent, 0.10);
  var card = frame(f, 'Cover / card', 80, 80, w - 160, h - 160, null, 24);
  brandRow(card, 0, 0, 1.2);
  text(card, 'Cover / kicker', 'DESIGN KIT · v4 · CLICKABLE PROTOTYPE', 0, 64, 700, 12, 'bold', T.c.cyan);
  text(card, 'Cover / title', 'PassGen — secure password generator', 0, 90, w - 200, 64, 'bold', T.c.text);
  text(card, 'Cover / subtitle',
    'Design kit for the FastAPI + SQLite web app. 15 frames covering desktop / tablet / mobile, ' +
    'history (filled & empty), strength states, components and design tokens — wired into a clickable prototype.',
    0, 168, w - 240, 20, 'medium', T.c.textMuted);
  var stats = [
    ['REQUIREMENTS', 'Length 6–32 · A-Z · a-z · 0-9 · symbols'],
    ['STRENGTH', '4 levels · Weak → Very Strong'],
    ['CLIPBOARD', 'One-click copy with toast feedback'],
    ['HISTORY', 'SQLite persistence + REST API'],
    ['PROTOTYPE', 'Desktop & mobile flows, ~30 reactions']
  ];
  for (var i = 0; i < stats.length; i++) {
    var c = frame(card, 'Cover / stat ' + i, 0, 240 + i * 64, w - 240, 56, T.c.surface, T.r.lg);
    setStroke(c, T.c.border, 1);
    text(c, 'Cover / stat label', stats[i][0], 20, 9, 220, 11, 'bold', T.c.textMuted);
    text(c, 'Cover / stat value', stats[i][1], 20, 28, w - 280, 16, 'medium', T.c.text);
  }
  return f;
}

function buildTokens(x, y) {
  var w = 1440, h = 720;
  var f = frame(figma.currentPage, 'PassGen Pro · Design tokens', x, y, w, h, T.c.bg, 0);
  text(f, 'Tokens / kicker', 'DESIGN SYSTEM', 64, 56, 600, 12, 'bold', T.c.cyan);
  text(f, 'Tokens / title', 'Tokens — colors, type, radius, spacing', 64, 78, 1200, 36, 'bold', T.c.text);
  var groups = [
    ['Background', [['bg', T.c.bg], ['bgDeep', T.c.bgDeep], ['surface', T.c.surface], ['surfaceSoft', T.c.surfaceSoft], ['surfaceRow', T.c.surfaceRow]]],
    ['Brand',      [['accent', T.c.accent], ['accentDeep', T.c.accentDeep], ['accentBright', T.c.accentBright], ['info', T.c.info], ['cyan', T.c.cyan]]],
    ['Status',     [['success', T.c.success], ['warning', T.c.warning], ['danger', T.c.danger], ['border', T.c.border], ['borderSoft', T.c.borderSoft]]],
    ['Text',       [['text', T.c.text], ['textMuted', T.c.textMuted], ['textDim', T.c.textDim]]]
  ];
  for (var g = 0; g < groups.length; g++) {
    var label = groups[g][0];
    var items = groups[g][1];
    var gx = 64 + g * 320;
    text(f, 'Tokens / group ' + label, label, gx, 152, 280, 14, 'bold', T.c.textMuted);
    for (var i = 0; i < items.length; i++) {
      var iy = 184 + i * 64;
      var sw = rect(f, 'Swatch / ' + items[i][0], gx, iy, 56, 48, items[i][1], T.r.md);
      setStroke(sw, T.c.borderSoft, 1);
      text(f, 'Swatch label', items[i][0], gx + 70, iy + 4, 200, 13, 'semi', T.c.text);
      text(f, 'Swatch value', items[i][1].toUpperCase(), gx + 70, iy + 24, 200, 11, 'medium', T.c.textMuted);
    }
  }
  var ty = 530;
  text(f, 'Tokens / type group', 'TYPOGRAPHY · INTER', 64, ty, 400, 14, 'bold', T.c.textMuted);
  var typeItems = [
    ['Display 44 · Bold', 'PassGen', 36],
    ['H2 32 · Bold', 'Generate strong passwords', 30],
    ['H4 20 · Semi Bold', 'Password length', 22],
    ['Body 16 · Medium', 'Use uppercase, lowercase, digits and symbols.', 14],
    ['Small 13 · Medium', 'Saved to SQLite local database', 12]
  ];
  for (var k = 0; k < typeItems.length; k++) {
    text(f, 'Type / label', typeItems[k][0], 64, ty + 28 + k * 30, 280, 11, 'bold', T.c.textMuted);
    text(f, 'Type / sample', typeItems[k][1], 360, ty + 24 + k * 30, 800, typeItems[k][2], k === 0 ? 'bold' : (k <= 2 ? 'semi' : 'medium'), T.c.text);
  }
  return f;
}

function buildComponents(x, y) {
  var w = 1440, h = 820;
  var f = frame(figma.currentPage, 'PassGen Pro · Components', x, y, w, h, T.c.bg, 0);
  text(f, 'Comp / kicker', 'COMPONENTS', 64, 56, 600, 12, 'bold', T.c.cyan);
  text(f, 'Comp / title', 'UI library', 64, 78, 1200, 36, 'bold', T.c.text);

  text(f, 'Comp / sec buttons', 'BUTTONS', 64, 152, 200, 12, 'bold', T.c.textMuted);
  var bx = 64, by = 178;
  var pb = pillBtn(f, 'Btn / primary', 'GENERATE PASSWORD', bx, by, 260, 56, T.c.accentDeep, T.c.text, 14);
  glow(pb, 18, T.c.accentBright, 0.55);
  var sb = pillBtn(f, 'Btn / secondary', 'RESET', bx + 280, by, 140, 56, T.c.surface, T.c.text, 14);
  setStroke(sb, T.c.borderSoft, 1);
  pillBtn(f, 'Btn / danger', 'CLEAR', bx + 440, by, 140, 56, T.c.danger2, T.c.text, 14);
  ghostBtn(f, 'Btn / ghost', 'API', bx + 600, by, 140, 56);
  var hb = pillBtn(f, 'Btn / pill history', 'HISTORY', bx + 760, by, 140, 44, T.c.surfaceSoft, T.c.text, 12);
  setStroke(hb, T.c.borderSoft, 1);

  text(f, 'Comp / sec inputs', 'INPUTS · OUTPUTS', 64, 270, 280, 12, 'bold', T.c.textMuted);
  passwordOutput(f, 64, 296, 540, 'M7K5r;JM!q3X8aB#', 'desktop');
  passwordOutput(f, 64 + 560, 296, 460, 'p4ssw0rd', 'mobile');

  text(f, 'Comp / sec slider', 'LENGTH SLIDER', 64, 410, 280, 12, 'bold', T.c.textMuted);
  lengthCard(f, 64, 436, 540, 16, 'desktop');

  text(f, 'Comp / sec check', 'CHECKBOX OPTIONS', 64 + 560, 410, 280, 12, 'bold', T.c.textMuted);
  optionRow(f, 64 + 560, 436, 460, 'Uppercase (A–Z)', true);
  optionRow(f, 64 + 560, 506, 460, 'Lowercase (a–z)', true);
  optionRow(f, 64 + 560, 576, 460, 'Numbers (0–9)', true);
  optionRow(f, 64 + 560, 646, 460, 'Symbols (!@#$)', false);

  text(f, 'Comp / sec badges', 'STRENGTH STATES', 64, 622, 280, 12, 'bold', T.c.textMuted);
  strengthBadge(f, 64, 650, 'Weak', T.c.danger);
  strengthBadge(f, 200, 650, 'Medium', T.c.warning);
  strengthBadge(f, 336, 650, 'Strong', T.c.success);
  strengthBadge(f, 472, 650, 'Very Strong', T.c.success);

  text(f, 'Comp / sec toast', 'TOAST · COPIED', 64, 706, 280, 12, 'bold', T.c.textMuted);
  toastNode(f, 64, 730, 'Password copied');
  return f;
}

/**
 * Build a Home/generator screen (desktop, tablet or mobile).
 *
 * Returns:
 *   {
 *     frame:    Frame (the screen),
 *     card:     Frame (the inner card),
 *     history:  Node (HISTORY pill — clickable),
 *     copy:     Node (copy icon button — clickable),
 *     generate: Node (GENERATE PASSWORD primary button),
 *     reset:    Node (RESET secondary button)
 *   }
 *
 * `state` is one of { password, length, options, strength, score, toast }.
 */
function buildHomeScreen(name, x, y, mode, state) {
  state = state || {};
  var defaults = {
    password: 'M7K5r;JM!q3X8aB#',
    length: 16,
    options: { upper: true, lower: true, digits: true, symbols: true },
    strength: { label: 'Very Strong', color: T.c.success, desc: 'Excellent length and character diversity. Safe to use.' },
    score: 7,
    toast: null   // null | 'Password copied' | 'New password generated' | 'Defaults restored'
  };
  var s = {};
  for (var k in defaults) s[k] = state[k] != null ? state[k] : defaults[k];

  var dims = mode === 'mobile' ? [420, 900] : (mode === 'tablet' ? [820, 1180] : [1440, 1024]);
  var w = dims[0], h = dims[1];
  var f = frame(figma.currentPage, name, x, y, w, h, T.c.bg, 0);
  f.clipsContent = true;
  ellipse(f, 'Glow / cyan', -160, h * 0.55, 280, 280, T.c.cyan, 0.16);
  ellipse(f, 'Glow / purple', w - 220, -140, 320, 320, T.c.accentBright, 0.22);

  var cardW, cardH, cardX, cardY, padX;
  if (mode === 'mobile') {
    cardW = w - 24; cardH = h - 28; cardX = 12; cardY = 14; padX = 18;
  } else if (mode === 'tablet') {
    cardW = 720; cardH = h - 100; cardX = (w - cardW) / 2; cardY = 50; padX = 32;
  } else {
    cardW = 880; cardH = 880; cardX = (w - cardW) / 2; cardY = (h - cardH) / 2; padX = 32;
  }
  var card = cardBackground(f, 'PassGen / card', cardW, cardH);
  card.x = cardX; card.y = cardY;

  var top = cardTopbar(card, cardW, padX, mode);

  var outY = mode === 'mobile' ? 80 : 110;
  var out = passwordOutput(card, padX, outY, cardW - padX * 2, s.password, mode);

  var sy = out.box.y + out.box.height + 18;
  strengthLine(card, padX, sy, cardW - padX * 2, s.strength.label, s.strength.desc, s.strength.color);

  var ly = sy + 70;
  var lc = lengthCard(card, padX, ly, cardW - padX * 2, s.length, mode);

  var oy = ly + (mode === 'mobile' ? 156 : 144) + 14;
  var rowH = 64, rowGap = 10;
  var optionLabels = [
    ['Uppercase (A–Z)', !!s.options.upper],
    ['Lowercase (a–z)', !!s.options.lower],
    ['Numbers (0–9)', !!s.options.digits],
    ['Symbols (!@#$)', !!s.options.symbols]
  ];
  for (var i = 0; i < optionLabels.length; i++) {
    optionRow(card, padX, oy + i * (rowH + rowGap), cardW - padX * 2, optionLabels[i][0], optionLabels[i][1]);
  }

  var gy = oy + 4 * (rowH + rowGap) + 8;
  var gen = generateBtn(card, padX, gy, cardW - padX * 2);

  if (mode === 'desktop') {
    var my = gy + 76;
    var mw = (cardW - padX * 2 - 16) / 3;
    var charsetCount = (s.options.upper ? 1 : 0) + (s.options.lower ? 1 : 0) + (s.options.digits ? 1 : 0) + (s.options.symbols ? 1 : 0);
    metaCard(card, padX, my, mw, 'Length', String(s.length) + ' chars');
    metaCard(card, padX + mw + 8, my, mw, 'Charsets', charsetCount + ' selected');
    metaCard(card, padX + (mw + 8) * 2, my, mw, 'Score', s.score + ' / 7');
  }

  // Toast overlay (rendered inside the screen frame, above the card)
  if (s.toast) {
    var tw = 240, th = 50;
    var tx = (w - tw) / 2;
    var ty2 = h - th - (mode === 'mobile' ? 40 : 64);
    toastNode(f, tx, ty2, s.toast);
  }

  return {
    frame: f,
    card: card,
    history: top.history,
    copy: out.copy,
    generate: gen,
    reset: lc.reset
  };
}

function buildStrengthMatrix(x, y) {
  var w = 1440, h = 1024;
  var f = frame(figma.currentPage, 'PassGen Pro · Desktop · Strength states', x, y, w, h, T.c.bg, 0);
  f.clipsContent = true;
  ellipse(f, 'Glow / cyan', -120, h - 240, 280, 280, T.c.cyan, 0.14);
  ellipse(f, 'Glow / purple', w - 240, -120, 320, 320, T.c.accentBright, 0.20);
  text(f, 'Matrix / kicker', 'PASSWORD STRENGTH', 64, 56, 600, 12, 'bold', T.c.cyan);
  text(f, 'Matrix / title', 'Same screen — four strength states', 64, 78, 1200, 32, 'bold', T.c.text);
  var states = [
    { label: 'Weak',        color: T.c.danger,  desc: 'Use more characters and add different symbol types.', sample: 'abcdef',           length: 6,  score: 1 },
    { label: 'Medium',      color: T.c.warning, desc: 'Good start, but a longer password with more types is safer.', sample: 'abcdef12',  length: 8,  score: 4 },
    { label: 'Strong',      color: T.c.success, desc: 'Several character groups and a safe length.',          sample: 'aB3#kLm9',         length: 12, score: 6 },
    { label: 'Very Strong', color: T.c.success, desc: 'Excellent length and character diversity. Safe to use.', sample: 'M7K5r;JM!q3X8aB#', length: 16, score: 7 }
  ];
  var cardW = 620, cardH = 380;
  var startX = 64, startY = 144;
  for (var i = 0; i < states.length; i++) {
    var col = i % 2, row = Math.floor(i / 2);
    var cx = startX + col * (cardW + 32);
    var cy = startY + row * (cardH + 32);
    var c = frame(f, 'State / ' + states[i].label, cx, cy, cardW, cardH, T.c.surface, T.r.xl);
    setStroke(c, T.c.border, 1);
    shadow(c, 32, 16, 0.4);
    text(c, 'State title', states[i].label.toUpperCase(), 24, 24, 240, 12, 'bold', states[i].color);
    text(c, 'State name', 'PassGen · ' + states[i].label, 24, 44, cardW - 48, 24, 'bold', T.c.text);
    passwordOutput(c, 24, 88, cardW - 48, states[i].sample, 'desktop');
    strengthLine(c, 24, 200, cardW - 48, states[i].label, states[i].desc, states[i].color);
    var mw = (cardW - 48 - 16) / 3;
    metaCard(c, 24, 270, mw, 'Length', String(states[i].length));
    metaCard(c, 24 + mw + 8, 270, mw, 'Score', states[i].score + ' / 7');
    metaCard(c, 24 + (mw + 8) * 2, 270, mw, 'Status', states[i].label);
  }
  return f;
}

/**
 * Returns:
 *   { frame, back, clear, cta }
 *   `cta` is set only when empty=true (otherwise null).
 */
function buildHistoryDesktop(x, y, empty) {
  var w = 1440, h = 1024;
  var name = 'PassGen Pro · Desktop · History' + (empty ? ' (empty)' : ' (filled)');
  var f = frame(figma.currentPage, name, x, y, w, h, T.c.bg, 0);
  f.clipsContent = true;
  ellipse(f, 'Glow / cyan', -160, h - 280, 320, 320, T.c.cyan, 0.16);
  ellipse(f, 'Glow / purple', w - 240, -120, 340, 340, T.c.accentBright, 0.20);

  var cardW = 1180, cardH = 880;
  var card = cardBackground(f, 'PassGen / history card', cardW, cardH);
  card.x = (w - cardW) / 2; card.y = 72;

  var back = pillBtn(card, 'Back button', '← BACK', 32, 32, 120, 44, T.c.surfaceSoft, T.c.text, 12);
  setStroke(back, T.c.borderSoft, 1);
  brandRow(card, 172, 38, 0.85);
  text(card, 'History title', 'History', 0, 32, cardW, 26, 'bold', T.c.text, 'CENTER');
  text(card, 'History sub', 'Passwords saved in local SQLite database', 0, 60, cardW, 13, 'medium', T.c.textMuted, 'CENTER');
  var clear = pillBtn(card, 'Clear button', 'CLEAR', cardW - 32 - 132, 32, 132, 44, T.c.danger2, T.c.text, 12);

  var cta = null;
  if (empty) {
    var ec = frame(card, 'Empty state', 0, 130, cardW, cardH - 130, null, 0);
    var iconBox = frame(ec, 'Empty / icon', (cardW - 96) / 2, 80, 96, 96, T.c.surfaceRow, T.r.xl);
    setStroke(iconBox, T.c.borderSoft, 1);
    lockIcon(iconBox, 30, 28, 1);
    text(ec, 'Empty / title', 'History is empty', 0, 200, cardW, 28, 'bold', T.c.text, 'CENTER');
    text(ec, 'Empty / desc',
      'Generate the first password and it will appear on this page.',
      0, 234, cardW, 14, 'medium', T.c.textMuted, 'CENTER');
    cta = pillBtn(ec, 'Empty / cta', 'GENERATE PASSWORD', (cardW - 280) / 2, 280, 280, 56, T.c.accentDeep, T.c.text, 14);
    glow(cta, 18, T.c.accentBright, 0.5);
  } else {
    var table = frame(card, 'History / table', 24, 110, cardW - 48, cardH - 130, T.c.surfaceRow, T.r.xl);
    setStroke(table, T.c.border, 1);
    var headers = ['PASSWORD', 'LENGTH', 'TYPES', 'STRENGTH', 'DATE'];
    var xs = [24, 320, 416, 668, 880];
    var ws = [296, 96, 252, 200, 200];
    for (var i = 0; i < headers.length; i++) {
      text(table, 'Header / ' + headers[i], headers[i], xs[i], 22, ws[i], 11, 'bold', T.c.textMuted);
    }
    line(table, 'Header divider', 16, 56, table.width - 32, T.c.border, 1);
    var rows = [
      ['M7K5r;JM!q3X8aB#', '16', 'A-Z, a-z, 0-9, symbols', 'Very Strong', T.c.success, '2025-05-09 14:25'],
      ['qP4!xvA9zN_lwJ#a', '16', 'A-Z, a-z, 0-9, symbols', 'Very Strong', T.c.success, '2025-05-09 14:21'],
      ['FastApi#2025!Ok',  '15', 'A-Z, a-z, 0-9, symbols', 'Strong',      T.c.success, '2025-05-09 14:16'],
      ['hello12345',       '10', 'a-z, 0-9',               'Medium',      T.c.warning, '2025-05-09 14:02'],
      ['abcdef',           '6',  'a-z',                    'Weak',        T.c.danger,  '2025-05-09 13:58']
    ];
    var yy = 76;
    for (var r = 0; r < rows.length; r++) {
      text(table, 'Cell pwd', rows[r][0], xs[0], yy, ws[0], 16, 'semi', T.c.text);
      text(table, 'Cell length', rows[r][1], xs[1], yy, ws[1], 14, 'medium', T.c.text);
      text(table, 'Cell types', rows[r][2], xs[2], yy, ws[2], 13, 'medium', T.c.textMuted);
      text(table, 'Cell date', rows[r][5], xs[4], yy, ws[4], 13, 'medium', T.c.textMuted);
      strengthBadge(table, xs[3], yy - 4, rows[r][3], rows[r][4]);
      if (r < rows.length - 1) line(table, 'Row divider', 16, yy + 36, table.width - 32, T.c.border, 1);
      yy += 56;
    }
  }
  return { frame: f, back: back, clear: clear, cta: cta };
}

/** Returns { frame, back, clear, cta } */
function buildMobileHistory(x, y, empty) {
  var w = 420, h = 900;
  var name = 'PassGen Pro · Mobile · History' + (empty ? ' (empty)' : ' (filled)');
  var f = frame(figma.currentPage, name, x, y, w, h, T.c.bg, 0);
  f.clipsContent = true;
  ellipse(f, 'Glow / cyan', -120, h - 220, 240, 240, T.c.cyan, 0.16);
  ellipse(f, 'Glow / purple', w - 200, -120, 280, 280, T.c.accentBright, 0.20);
  var cardW = w - 24, cardH = h - 28;
  var card = cardBackground(f, 'Mobile history card', cardW, cardH);
  card.x = 12; card.y = 14;

  var back = pillBtn(card, 'Back button', '← BACK', 18, 18, 84, 36, T.c.surfaceSoft, T.c.text, 11);
  setStroke(back, T.c.borderSoft, 1);
  text(card, 'History title', 'History', 0, 22, cardW, 22, 'bold', T.c.text, 'CENTER');
  var clear = pillBtn(card, 'Clear button', 'CLEAR', cardW - 18 - 78, 18, 78, 36, T.c.danger2, T.c.text, 11);

  var cta = null;
  if (empty) {
    var ec = frame(card, 'Empty state', 0, 80, cardW, cardH - 80, null, 0);
    var iconBox = frame(ec, 'Empty / icon', (cardW - 96) / 2, 80, 96, 96, T.c.surfaceRow, T.r.xl);
    setStroke(iconBox, T.c.borderSoft, 1);
    lockIcon(iconBox, 30, 28, 1);
    text(ec, 'Empty / title', 'History is empty', 0, 200, cardW, 22, 'bold', T.c.text, 'CENTER');
    text(ec, 'Empty / desc', 'Generate your first password and it will appear here.', 18, 234, cardW - 36, 13, 'medium', T.c.textMuted, 'CENTER');
    cta = pillBtn(ec, 'Empty / cta', 'GENERATE PASSWORD', 18, 290, cardW - 36, 50, T.c.accentDeep, T.c.text, 13);
    glow(cta, 18, T.c.accentBright, 0.5);
  } else {
    var rows = [
      ['M7K5r;JM!q3X8aB#', 'Very Strong', T.c.success, '14:25 · 16 chars'],
      ['qP4!xvA9zN_lwJ#a', 'Very Strong', T.c.success, '14:21 · 16 chars'],
      ['FastApi#2025!Ok',  'Strong',      T.c.success, '14:16 · 15 chars'],
      ['hello12345',       'Medium',      T.c.warning, '14:02 · 10 chars'],
      ['abcdef',           'Weak',        T.c.danger,  '13:58 · 6 chars']
    ];
    var yy = 80;
    for (var i = 0; i < rows.length; i++) {
      var row = frame(card, 'Mobile row', 18, yy, cardW - 36, 88, T.c.surfaceRow, T.r.lg);
      setStroke(row, T.c.border, 1);
      text(row, 'Mobile / pwd', rows[i][0], 16, 14, row.width - 130, 16, 'semi', T.c.text);
      text(row, 'Mobile / meta', rows[i][3], 16, 42, row.width - 32, 12, 'medium', T.c.textMuted);
      strengthBadge(row, row.width - 130, 14, rows[i][1], rows[i][2]);
      yy += 100;
    }
  }
  return { frame: f, back: back, clear: clear, cta: cta };
}

/* ---------- Prototype links ---------- */
function linkClick(source, dest) {
  if (!source || !dest || typeof source.setReactionsAsync !== 'function') return Promise.resolve();
  return source.setReactionsAsync([
    {
      trigger: { type: 'ON_CLICK' },
      actions: [
        {
          type: 'NODE',
          destinationId: dest.id,
          navigation: 'NAVIGATE',
          transition: null,
          preserveScrollPosition: false
        }
      ]
    }
  ]).catch(function (err) { console.warn('PassGen prototype skipped:', err); });
}

/** Wire all four interactive buttons of a Home screen at once. */
function wireHome(home, links) {
  // links: { generate, copy, history, reset }
  var ps = [];
  if (links.generate) ps.push(linkClick(home.generate, links.generate));
  if (links.copy)     ps.push(linkClick(home.copy,     links.copy));
  if (links.history)  ps.push(linkClick(home.history,  links.history));
  if (links.reset)    ps.push(linkClick(home.reset,    links.reset));
  return Promise.all(ps);
}

/** Wire BACK / CLEAR / CTA on a History screen. */
function wireHistory(hist, links) {
  // links: { back, clear, cta, home }
  var ps = [];
  if (links.back  && hist.back)  ps.push(linkClick(hist.back,  links.back));
  if (links.clear && hist.clear) ps.push(linkClick(hist.clear, links.clear));
  if (links.cta   && hist.cta)   ps.push(linkClick(hist.cta,   links.cta));
  return Promise.all(ps);
}

/* ---------- Main ---------- */
/** Run a builder safely; on failure, log + skip so the rest still render. */
function safe(label, fn) {
  try {
    return fn();
  } catch (err) {
    console.error('PassGen Pro builder failed: ' + label, err);
    figma.notify('Skipped: ' + label + ' (' + (err && err.message ? err.message : err) + ')', { error: true });
    return null;
  }
}

function run() {
  Promise.all([
    figma.loadFontAsync(FONT_REG),
    figma.loadFontAsync(FONT_MED),
    figma.loadFontAsync(FONT_SEM),
    figma.loadFontAsync(FONT_BOLD)
  ]).then(function () {
    /* === Static design system === */
    var cover      = safe('Cover',          function () { return buildCover(0, 0); });
    var tokens     = safe('Tokens',         function () { return buildTokens(1500, 0); });
    var components = safe('Components',     function () { return buildComponents(0, 820); });
    var matrix     = safe('Strength matrix',function () { return buildStrengthMatrix(1500, 820); });

    /* === Desktop screens (3 home variants + 2 history variants) === */
    var dInit = safe('Desktop Home Initial',   function () {
      return buildHomeScreen('PassGen Pro · Desktop · Home · Initial', 0, 1900, 'desktop', { password: 'M7K5r;JM!q3X8aB#' });
    });
    var dGen  = safe('Desktop Home Generated', function () {
      return buildHomeScreen('PassGen Pro · Desktop · Home · Generated', 1500, 1900, 'desktop', { password: 'qP4!xvA9zN_lwJ#a' });
    });
    var dCop  = safe('Desktop Home Copied',    function () {
      return buildHomeScreen('PassGen Pro · Desktop · Home · Copied', 3000, 1900, 'desktop', { password: 'qP4!xvA9zN_lwJ#a', toast: 'Password copied' });
    });

    var dHistFilled = safe('Desktop History Filled', function () { return buildHistoryDesktop(0, 2980, false); });
    var dHistEmpty  = safe('Desktop History Empty',  function () { return buildHistoryDesktop(1500, 2980, true); });

    /* === Mobile screens (3 home + 2 history) === */
    var mInit = safe('Mobile Home Initial',    function () {
      return buildHomeScreen('PassGen Pro · Mobile · Home · Initial', 0, 4060, 'mobile', { password: 'aB3#kLm9' });
    });
    var mGen  = safe('Mobile Home Generated',  function () {
      return buildHomeScreen('PassGen Pro · Mobile · Home · Generated', 460, 4060, 'mobile', { password: 'qP4!xvA9zN' });
    });
    var mCop  = safe('Mobile Home Copied',     function () {
      return buildHomeScreen('PassGen Pro · Mobile · Home · Copied', 920, 4060, 'mobile', { password: 'qP4!xvA9zN', toast: 'Password copied' });
    });
    var mHistFilled = safe('Mobile History Filled', function () { return buildMobileHistory(1380, 4060, false); });
    var mHistEmpty  = safe('Mobile History Empty',  function () { return buildMobileHistory(1840, 4060, true); });

    /* === Tablet === */
    var tHome = safe('Tablet Home', function () {
      return buildHomeScreen('PassGen Pro · Tablet · Home', 2400, 4060, 'tablet', {});
    });

    /* === Prototype wiring (only between successfully created frames) === */
    var ps = [];
    if (dInit && dGen && dCop && dHistFilled) {
      ps.push(wireHome(dInit, { generate: dGen.frame,  copy: dCop.frame, history: dHistFilled.frame, reset: dInit.frame }));
      ps.push(wireHome(dGen,  { generate: dInit.frame, copy: dCop.frame, history: dHistFilled.frame, reset: dInit.frame }));
      ps.push(wireHome(dCop,  { generate: dInit.frame, copy: dCop.frame, history: dHistFilled.frame, reset: dInit.frame }));
    }
    if (dHistFilled && dHistEmpty && dInit) {
      ps.push(wireHistory(dHistFilled, { back: dInit.frame, clear: dHistEmpty.frame }));
      ps.push(wireHistory(dHistEmpty,  { back: dInit.frame, cta: dInit.frame }));
    }
    if (mInit && mGen && mCop && mHistFilled) {
      ps.push(wireHome(mInit, { generate: mGen.frame,  copy: mCop.frame, history: mHistFilled.frame, reset: mInit.frame }));
      ps.push(wireHome(mGen,  { generate: mInit.frame, copy: mCop.frame, history: mHistFilled.frame, reset: mInit.frame }));
      ps.push(wireHome(mCop,  { generate: mInit.frame, copy: mCop.frame, history: mHistFilled.frame, reset: mInit.frame }));
    }
    if (mHistFilled && mHistEmpty && mInit) {
      ps.push(wireHistory(mHistFilled, { back: mInit.frame, clear: mHistEmpty.frame }));
      ps.push(wireHistory(mHistEmpty,  { back: mInit.frame, cta: mInit.frame }));
    }
    if (tHome && dHistFilled) {
      ps.push(wireHome(tHome, { history: dHistFilled.frame, generate: tHome.frame, copy: tHome.frame, reset: tHome.frame }));
    }

    return Promise.all(ps).then(function () {
      var built = [];
      var add = function (n) { if (n) built.push(n.frame || n); };
      add(cover); add(tokens); add(components); add(matrix);
      add(dInit); add(dGen); add(dCop);
      add(dHistFilled); add(dHistEmpty);
      add(mInit); add(mGen); add(mCop);
      add(mHistFilled); add(mHistEmpty);
      add(tHome);
      figma.currentPage.selection = built;
      figma.viewport.scrollAndZoomIntoView(built);
      figma.notify('PassGen Pro: ' + built.length + '/15 frames generated. Press Shift+1 to fit all. Then select Desktop · Home · Initial and ▶ Present.');
    });
  }).catch(function (err) {
    console.error('PassGen Pro plugin error:', err);
    figma.notify('PassGen Pro plugin error: ' + (err && err.message ? err.message : err), { error: true });
  }).finally(function () {
    figma.closePlugin();
  });
}

run();
