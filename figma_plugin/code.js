/**
 * PassGen Pro — UI Design Kit (base version).
 *
 * На этом этапе плагин строит только базу дизайн-системы:
 *   • Cover (название проекта)
 *   • Design tokens (цветовая палитра + типография)
 *   • Components (типовые элементы: кнопки, чекбокс, ввод)
 *   • Strength matrix (4 уровня надёжности)
 *
 * Полные экраны Home / History / Mobile + рабочие prototype-связи
 * добавляются в следующем коммите (commit_12_figma_plugin_prototype_links).
 */

(function () {
  function hexToRgb(hex) {
    var n = hex.replace("#", "");
    return {
      r: parseInt(n.substring(0, 2), 16) / 255,
      g: parseInt(n.substring(2, 4), 16) / 255,
      b: parseInt(n.substring(4, 6), 16) / 255,
    };
  }
  function fill(hex, opacity) {
    return [{ type: "SOLID", color: hexToRgb(hex), opacity: opacity == null ? 1 : opacity }];
  }
  function frame(parent, name, x, y, w, h, color, radius) {
    var n = figma.createFrame();
    n.name = name;
    n.x = x;
    n.y = y;
    n.resize(w, h);
    n.fills = fill(color);
    if (radius) n.cornerRadius = radius;
    parent.appendChild(n);
    return n;
  }
  function rect(parent, name, x, y, w, h, color, radius) {
    var n = figma.createRectangle();
    n.name = name;
    n.x = x;
    n.y = y;
    n.resize(w, h);
    n.fills = fill(color);
    if (radius) n.cornerRadius = radius;
    parent.appendChild(n);
    return n;
  }
  function text(parent, value, x, y, w, size, weight, color) {
    var t = figma.createText();
    t.name = value.length > 32 ? value.substring(0, 32) : value;
    t.x = x;
    t.y = y;
    t.resize(w, size * 1.4);
    t.fontSize = size;
    t.fontName = { family: "Inter", style: weight || "Regular" };
    t.characters = value;
    t.fills = fill(color);
    parent.appendChild(t);
    return t;
  }

  var COLORS = {
    bg: "#0B1020",
    surface: "#141A2E",
    border: "#1E2640",
    text: "#E7ECFF",
    muted: "#8895C7",
    accent: "#7C5CFF",
    success: "#22C55E",
    warning: "#F59E0B",
    danger: "#EF4444",
  };

  function buildCover() {
    var f = frame(figma.currentPage, "PassGen Pro · Cover", 0, 0, 1440, 900, COLORS.bg);
    text(f, "PassGen Pro", 80, 320, 1280, 96, "Bold", COLORS.text);
    text(f, "UI Design Kit · base set", 80, 440, 1280, 28, "Regular", COLORS.muted);
    text(f, "Cover · Tokens · Components · Strength matrix", 80, 500, 1280, 22, "Regular", COLORS.muted);
    return f;
  }

  function buildTokens() {
    var f = frame(figma.currentPage, "PassGen Pro · Design tokens", 1520, 0, 1280, 900, COLORS.bg);
    text(f, "Design tokens", 60, 60, 1160, 36, "Bold", COLORS.text);
    var keys = Object.keys(COLORS);
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      var swatch = rect(f, "swatch · " + k, 60, 140 + i * 64, 96, 48, COLORS[k], 8);
      text(f, k, 180, 152 + i * 64, 240, 18, "Bold", COLORS.text);
      text(f, COLORS[k], 460, 152 + i * 64, 240, 18, "Regular", COLORS.muted);
    }
    return f;
  }

  function buildComponents() {
    var f = frame(figma.currentPage, "PassGen Pro · Components", 0, 1000, 1440, 720, COLORS.bg);
    text(f, "Components", 60, 60, 1320, 36, "Bold", COLORS.text);

    // primary button
    var btn = rect(f, "Button · primary", 60, 140, 200, 48, COLORS.accent, 12);
    text(f, "GENERATE", 60 + 50, 140 + 14, 200, 16, "Bold", "#FFFFFF");

    // ghost button
    rect(f, "Button · ghost · bg", 300, 140, 200, 48, COLORS.surface, 12);
    text(f, "RESET", 300 + 70, 140 + 14, 200, 16, "Bold", COLORS.text);

    // checkbox
    var cb = rect(f, "Checkbox · checked", 60, 240, 24, 24, COLORS.accent, 6);
    text(f, "Uppercase (A–Z)", 100, 244, 240, 16, "Regular", COLORS.text);

    // input
    rect(f, "Input · password", 60, 320, 600, 56, COLORS.surface, 14);
    text(f, "M7K5r;JM!q3X8aB#", 80, 336, 560, 22, "Bold", COLORS.text);
    return f;
  }

  function buildStrengthMatrix() {
    var f = frame(figma.currentPage, "PassGen Pro · Strength matrix", 1520, 1000, 1280, 720, COLORS.bg);
    text(f, "Strength matrix", 60, 60, 1160, 36, "Bold", COLORS.text);
    var levels = [
      { label: "Weak", color: COLORS.danger, desc: "score 0–2 · entropy < 30 bits" },
      { label: "Medium", color: COLORS.warning, desc: "score 3–4 · entropy 30–50" },
      { label: "Strong", color: COLORS.success, desc: "score 5–6 · entropy 50–80" },
      { label: "Very Strong", color: COLORS.accent, desc: "score 7 · entropy 80+" },
    ];
    for (var i = 0; i < levels.length; i++) {
      rect(f, "level · " + levels[i].label, 60, 140 + i * 120, 1160, 96, COLORS.surface, 16);
      rect(f, "level · " + levels[i].label + " · accent", 60, 140 + i * 120, 8, 96, levels[i].color);
      text(f, levels[i].label, 100, 156 + i * 120, 320, 22, "Bold", COLORS.text);
      text(f, levels[i].desc, 100, 192 + i * 120, 800, 16, "Regular", COLORS.muted);
    }
    return f;
  }

  (async function () {
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    await figma.loadFontAsync({ family: "Inter", style: "Bold" });

    buildCover();
    buildTokens();
    buildComponents();
    buildStrengthMatrix();

    figma.notify("PassGen Pro — base UI kit ready (4 frames). Press Shift+1 to fit all.");
    figma.closePlugin();
  })();
})();
