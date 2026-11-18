(() => {
  'use strict';

  /* ------------------------------------------------------------------ *
   * Data
   * ------------------------------------------------------------------ */

  // Each shape is a grid of rows. "X" marks a clickable character.
  const SHAPES = {
    heart: {
      label: 'Heart',
      rows: [
        '.XXX...XXX.',
        'XXXXX.XXXXX',
        'XXXXXXXXXXX',
        'XXXXXXXXXXX',
        '.XXXXXXXXX.',
        '..XXXXXXX..',
        '...XXXXX...',
        '....XXX....',
        '.....X.....',
      ],
    },
    star: {
      label: 'Star',
      rows: [
        '.....X.....',
        '....XXX....',
        '....XXX....',
        'XXXXXXXXXXX',
        '.XXXXXXXXX.',
        '..XXXXXXX..',
        '..XXXXXXX..',
        '.XXXXXXXXX.',
        '.XXX...XXX.',
        'XX.......XX',
      ],
    },
    cat: {
      label: 'Cat',
      rows: [
        'XX.........XX',
        'XXX.......XXX',
        'XXXXXXXXXXXXX',
        'XXXXXXXXXXXXX',
        'XXX..XXX..XXX',
        'XXXXXXXXXXXXX',
        'XXXXXX.XXXXXX',
        '.XXXXXXXXXXX.',
        '..XXXXXXXXX..',
        '....XXXXX....',
      ],
    },
    bunny: {
      label: 'Bunny',
      rows: [
        '..XX...XX..',
        '..XX...XX..',
        '..XX...XX..',
        '..XX...XX..',
        '..XX...XX..',
        '.XXXXXXXXX.',
        'XXXXXXXXXXX',
        'XXX.XXX.XXX',
        'XXXXXXXXXXX',
        'XXXXX.XXXXX',
        '.XXXXXXXXX.',
        '..XXXXXXX..',
      ],
    },
    paw: {
      label: 'Paw',
      rows: [
        '...XX.XX...',
        '...XX.XX...',
        'XX.......XX',
        'XX.......XX',
        '...XXXXX...',
        '..XXXXXXX..',
        '.XXXXXXXXX.',
        '.XXXXXXXXX.',
        '.XXX...XXX.',
      ],
    },
    flower: {
      label: 'Flower',
      rows: [
        '......X......',
        '.....XXX.....',
        '....XXXXX....',
        '..XX.XXX.XX..',
        '.XXXX.X.XXXX.',
        '.XXXXXXXXXXX.',
        '.XXX.X.X.XXX.',
        '.....XXX.....',
        '...XXX.XXX...',
        '..XXXX.XXXX..',
        '..XXXX.XXXX..',
        '...XX...XX...',
      ],
    },
    butterfly: {
      label: 'Butterfly',
      rows: [
        'XXX...X...XXX',
        'XXXXX.X.XXXXX',
        'XXXXXXXXXXXXX',
        'XXXXXXXXXXXXX',
        '.XXXXXXXXXXX.',
        '..XXX.X.XXX..',
        '.XXXX.X.XXXX.',
        'XXXXX.X.XXXXX',
        'XXXX..X..XXXX',
        '.XX...X...XX.',
      ],
    },
    smiley: {
      label: 'Smiley',
      rows: [
        '...XXXXX...',
        '.XXXXXXXXX.',
        'XXXXXXXXXXX',
        'XXX.XXX.XXX',
        'XXX.XXX.XXX',
        'XXXXXXXXXXX',
        'XX.XXXXX.XX',
        'XXX.....XXX',
        '.XXXXXXXXX.',
        '...XXXXX...',
      ],
    },
  };

  // Lines place the nth of `count` characters at a [row, column] position.
  const LINES = {
    down: { label: 'Diagonal ↘', position: (i) => [i, i] },
    up: { label: 'Diagonal ↗', position: (i, count) => [count - 1 - i, i] },
    vertical: { label: 'Vertical', position: (i) => [i, 0] },
    line: { label: 'Straight line', position: (i) => [0, i] },
    wave: { label: 'Wave trail', position: (i) => [i, Math.round(2.5 + 2.5 * Math.sin(i * 0.85))] },
    zigzag: { label: 'Zigzag', position: (i) => [i, [0, 1, 2, 3, 2, 1][i % 6]] },
    squiggle: {
      label: 'Squiggle',
      position: (i) => [Math.round(1.5 + 1.5 * Math.sin(i * 0.9)), i],
    },
  };

  const SYMBOLS = ['♥', '❤︎', '♡', '★', '☆', '✦', '✧', '✿', '❀', '☘︎', '☾', '☺', '☻', '♪', '♫'];

  // Ordered around the color wheel: red through violet, then pink, crimson and black.
  const SWATCHES = [
    '#ff4d4d',
    '#ff9a3c',
    '#ffd23f',
    '#3ccf91',
    '#0a7f86',
    '#5db7ff',
    '#1d3f9a',
    '#0a1a3f',
    '#8b5cf6',
    '#ff6fb5',
    '#e11d6a',
    '#111111',
  ];

  const HOLOGRAPHIC_STOPS = ['#ff9ad5', '#c3a6ff', '#86d2ff', '#8cffdc', '#ffe89a', '#ff9ad5'];

  const SIZES = {
    s: { label: 'Small', width: 18, height: 20, font: 16 },
    m: { label: 'Medium', width: 24, height: 27, font: 22 },
    l: { label: 'Large', width: 32, height: 36, font: 30 },
  };

  const ALIGNMENTS = { left: 'Left', center: 'Center' };

  const LENGTH_RANGE = { min: 3, max: 16 };
  const DEFAULT_LETTERS = 'ILOVEYOU';
  const DIAGONAL_WEIGHT = 0.35;

  // `inputs` is how many custom colors the mode uses.
  const COLOR_MODES = [
    {
      id: 'solid',
      label: 'Solid',
      inputs: 1,
      preview: 'linear-gradient(90deg, #e11d6a, #e11d6a)',
      colorAt: (cell, s) => s.colorA,
    },
    {
      id: 'gradient',
      label: 'Gradient',
      inputs: 2,
      preview: 'linear-gradient(90deg, #e11d6a, #5db7ff)',
      colorAt: (cell, s) => mixColors(s.colorA, s.colorB, cell.t),
    },
    {
      id: 'rainbow',
      label: 'Rainbow',
      inputs: 0,
      preview: 'linear-gradient(90deg, #f33, #fb3, #3d6, #3bf, #74f, #f6c)',
      colorAt: (cell) => hslToHex(cell.t * 320, 85, 52),
    },
    {
      id: 'holographic',
      label: 'Holographic',
      inputs: 0,
      preview: 'linear-gradient(90deg, #ff9ad5, #c3a6ff, #86d2ff, #8cffdc, #ffe89a)',
      colorAt: (cell) => blendStops(HOLOGRAPHIC_STOPS, cell.t),
    },
    {
      id: 'alternate',
      label: 'Alternate',
      inputs: 2,
      preview: 'repeating-linear-gradient(90deg, #e11d6a 0 10px, #5db7ff 10px 20px)',
      colorAt: (cell, s) => (cell.alt ? s.colorB : s.colorA),
    },
  ];

  /* ------------------------------------------------------------------ *
   * State
   * ------------------------------------------------------------------ */

  const state = {
    link: '',
    layout: null,
    count: 8,
    fill: 'text',
    text: 'I love you',
    colorMode: 'solid',
    colorA: '#e11d6a',
    colorB: '#5db7ff',
    size: 'm',
    align: 'left',
    underline: false,
    fallback: false,
    fallbackText: "Can't tap the letters? Click here.",
  };

  /* ------------------------------------------------------------------ *
   * Color helpers
   * ------------------------------------------------------------------ */

  function hexToRgb(hex) {
    return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  }

  function rgbToHex(rgb) {
    return `#${rgb.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`;
  }

  function mixColors(from, to, t) {
    const a = hexToRgb(from);
    const b = hexToRgb(to);
    return rgbToHex(a.map((v, i) => v + (b[i] - v) * t));
  }

  function hslToHex(hue, saturation, lightness) {
    const s = saturation / 100;
    const l = lightness / 100;
    const a = s * Math.min(l, 1 - l);
    const channel = (n) => {
      const k = (n + hue / 30) % 12;
      return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    };
    return rgbToHex([channel(0) * 255, channel(8) * 255, channel(4) * 255]);
  }

  function blendStops(stops, t) {
    const position = Math.min(Math.max(t, 0), 0.9999) * (stops.length - 1);
    const index = Math.floor(position);
    return mixColors(stops[index], stops[index + 1], position - index);
  }

  /* ------------------------------------------------------------------ *
   * Layout helpers
   * ------------------------------------------------------------------ */

  function gridCells(rows) {
    const height = rows.length;
    const width = rows[0].length;
    const span = height - 1 + DIAGONAL_WEIGHT * (width - 1);
    const cells = [];

    rows.forEach((line, row) => {
      [...line].forEach((mark, col) => {
        if (mark !== 'X') return;
        cells.push({
          row,
          col,
          index: cells.length,
          t: (row + DIAGONAL_WEIGHT * col) / span,
          alt: (row + col) % 2,
        });
      });
    });

    return { cells, rows: height, cols: width };
  }

  function lineCells(position, count) {
    const cells = Array.from({ length: count }, (_, index) => {
      const [row, col] = position(index, count);
      return { row, col, index, t: index / (count - 1), alt: index % 2 };
    });

    return {
      cells,
      rows: Math.max(...cells.map((c) => c.row)) + 1,
      cols: Math.max(...cells.map((c) => c.col)) + 1,
    };
  }

  function cellsFor(layoutId, count) {
    return SHAPES[layoutId]
      ? gridCells(SHAPES[layoutId].rows)
      : lineCells(LINES[layoutId].position, count);
  }

  const isLine = () => Boolean(state.layout && LINES[state.layout]);

  function textCharacters() {
    const typed = [...state.text.replace(/\s+/g, '').toUpperCase()];
    return typed.length ? typed : [...DEFAULT_LETTERS];
  }

  function clampCount(n) {
    return Math.max(LENGTH_RANGE.min, Math.min(LENGTH_RANGE.max, n));
  }

  /* ------------------------------------------------------------------ *
   * Link helpers
   * ------------------------------------------------------------------ */

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  // Returns a usable URL, or an empty string if the input is not a web address.
  function normalizeLink(input) {
    const value = input.trim();
    if (!value) return '';
    if (/^(https?:\/\/|mailto:)/i.test(value)) return value;
    if (/\s/.test(value)) return '';
    if (/^[^/]+\.[a-z]{2,}/i.test(value) || /^localhost/i.test(value)) return `https://${value}`;
    return '';
  }

  /* ------------------------------------------------------------------ *
   * Email HTML
   * ------------------------------------------------------------------ */

  function cellHtml(cell, href, sizeSpec, characters) {
    const mode = COLOR_MODES.find((m) => m.id === state.colorMode);
    const color = mode.colorAt(cell, state);
    const symbol = state.fill === 'text' ? characters[cell.index % characters.length] : state.fill;
    const decoration = state.underline ? 'underline' : 'none';
    const font = `bold ${sizeSpec.font}px/${sizeSpec.height}px Arial,Helvetica,'Segoe UI Symbol',sans-serif`;

    return (
      `<td style="${boxStyle(sizeSpec)}text-align:center;font:${font};">` +
      `<a href="${href}" style="color:${color};text-decoration:${decoration};">${escapeHtml(symbol)}</a>` +
      '</td>'
    );
  }

  function boxStyle(sizeSpec) {
    return `width:${sizeSpec.width}px;height:${sizeSpec.height}px;padding:0;`;
  }

  function fallbackHtml(href, centered) {
    const text = state.fallbackText.trim();
    if (!state.fallback || !text) return '';

    const mode = COLOR_MODES.find((m) => m.id === state.colorMode);
    const color = mode.inputs === 0 ? '#1d3f9a' : state.colorA;
    const align = centered ? 'text-align:center;' : '';

    return (
      `<p style="margin:12px 0 0;font:14px Arial,Helvetica,sans-serif;${align}">` +
      `<a href="${href}" style="color:${color};">${escapeHtml(text)}</a></p>`
    );
  }

  function buildDesign() {
    if (!state.layout) return '';

    const sizeSpec = SIZES[state.size];
    const { cells, rows, cols } = cellsFor(state.layout, state.count);
    const byPosition = new Map(cells.map((cell) => [`${cell.row},${cell.col}`, cell]));
    const href = escapeHtml(normalizeLink(state.link) || '#');
    const characters = textCharacters();
    const centered = state.align === 'center';

    const tableAttrs = centered ? 'align="center" ' : '';
    const tableStyle = `border-collapse:collapse;${centered ? 'margin:0 auto;' : ''}`;

    let html = `<table role="presentation" cellpadding="0" cellspacing="0" border="0" ${tableAttrs}style="${tableStyle}">`;
    for (let row = 0; row < rows; row++) {
      html += '<tr>';
      for (let col = 0; col < cols; col++) {
        const cell = byPosition.get(`${row},${col}`);
        html += cell
          ? cellHtml(cell, href, sizeSpec, characters)
          : `<td style="${boxStyle(sizeSpec)}">&nbsp;</td>`;
      }
      html += '</tr>';
    }
    html += '</table>';

    return html + fallbackHtml(href, centered);
  }

  /* ------------------------------------------------------------------ *
   * DOM
   * ------------------------------------------------------------------ */

  const $ = (id) => document.getElementById(id);

  const el = {
    link: $('url'),
    linkHint: $('url-hint'),
    stage: $('stage'),
    out: $('out'),
    copyDesign: $('copy-design'),
    copyCode: $('copy-code'),
    message: $('msg'),
    darkStage: $('dark-stage'),
    codeBox: $('code-box'),
    code: $('code'),
    shapes: $('shapes'),
    lines: $('lines'),
    lengthRow: $('length-row'),
    length: $('length'),
    lengthOut: $('length-out'),
    fills: $('fills'),
    text: $('text'),
    colorModes: $('color-modes'),
    rowA: $('row-a'),
    rowB: $('row-b'),
    swatchesA: $('swatches-a'),
    swatchesB: $('swatches-b'),
    sizes: $('sizes'),
    aligns: $('aligns'),
    underline: $('underline'),
    fallback: $('fallback'),
    fallbackRow: $('fallback-row'),
    fallbackText: $('fallback-text'),
  };

  function createButton(className, value) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = className;
    button.dataset.value = value;
    return button;
  }

  const THUMB_SIZE = 46;
  const THUMB_MIN_CELLS = 6;

  // Every thumbnail uses the same square size, so lines, trails and shapes of
  // the same grid size match.
  function thumbnail(layoutId) {
    const { cells, rows, cols } = cellsFor(layoutId, THUMB_MIN_CELLS);
    const unit = THUMB_SIZE / Math.max(rows, THUMB_MIN_CELLS);
    const round = (value) => Number(value.toFixed(2));
    const squares = cells
      .map((c) => {
        const x = round(c.col * unit + unit * 0.1);
        const y = round(c.row * unit + unit * 0.1);
        const side = round(unit * 0.8);
        return `<rect x="${x}" y="${y}" width="${side}" height="${side}"/>`;
      })
      .join('');
    const width = round(cols * unit);
    const height = round(rows * unit);
    return (
      `<span class="thumb"><svg width="${width}" height="${height}" ` +
      `viewBox="0 0 ${width} ${height}" aria-hidden="true" fill="currentColor">${squares}</svg></span>`
    );
  }

  function mountLayoutTiles(host, entries) {
    Object.entries(entries).forEach(([id, { label }]) => {
      const tile = createButton('tile', id);
      tile.innerHTML = `${thumbnail(id)}<span>${label}</span>`;
      tile.addEventListener('click', () => {
        state.layout = id;
        if (LINES[id] && state.fill === 'text') state.count = clampCount(textCharacters().length);
        update();
      });
      host.appendChild(tile);
    });
  }

  function mountChips(host, entries, onPick) {
    entries.forEach(([value, label]) => {
      const chip = createButton('chip', value);
      chip.textContent = label;
      chip.addEventListener('click', () => {
        onPick(value);
        update();
      });
      host.appendChild(chip);
    });
  }

  function mountColorModes(host) {
    COLOR_MODES.forEach((mode) => {
      const tile = createButton('tile', mode.id);
      tile.innerHTML = `<span class="sw" style="background:${mode.preview}"></span><span>${mode.label}</span>`;
      tile.addEventListener('click', () => {
        state.colorMode = mode.id;
        update();
      });
      host.appendChild(tile);
    });
  }

  function mountSwatches(host, key) {
    SWATCHES.forEach((color) => {
      const swatch = createButton('swatch', color);
      swatch.style.background = color;
      swatch.setAttribute('aria-label', `Use ${color}`);
      swatch.addEventListener('click', () => {
        state[key] = color;
        update();
      });
      host.appendChild(swatch);
    });
  }

  function markPressed(host, isPressed) {
    host.querySelectorAll('button').forEach((button) => {
      button.setAttribute('aria-pressed', String(isPressed(button.dataset.value)));
    });
  }

  /* ------------------------------------------------------------------ *
   * Rendering
   * ------------------------------------------------------------------ */

  function renderLinkHint(link) {
    if (!state.link.trim()) {
      el.linkHint.textContent = 'Paste the web address your shape should open.';
    } else if (!link) {
      el.linkHint.textContent =
        "That doesn't look like a web address. Try something like https://example.com.";
    } else {
      el.linkHint.textContent = `Every character opens ${link}`;
    }
  }

  function renderPreview() {
    const link = normalizeLink(state.link);
    const html = buildDesign();

    el.out.innerHTML = html || '<p class="empty">Pick a shape in Options and it shows up here.</p>';
    el.code.value = html;
    el.copyDesign.disabled = !link || !html;
    el.copyCode.disabled = !link || !html;
    renderLinkHint(link);
  }

  function update() {
    markPressed(el.shapes, (v) => v === state.layout);
    markPressed(el.lines, (v) => v === state.layout);
    markPressed(el.fills, (v) => v === state.fill);
    markPressed(el.colorModes, (v) => v === state.colorMode);
    markPressed(el.sizes, (v) => v === state.size);
    markPressed(el.aligns, (v) => v === state.align);
    markPressed(el.swatchesA, (v) => v === state.colorA);
    markPressed(el.swatchesB, (v) => v === state.colorB);

    const inputs = COLOR_MODES.find((m) => m.id === state.colorMode).inputs;
    el.rowA.hidden = inputs < 1;
    el.rowB.hidden = inputs < 2;

    el.lengthRow.style.display = isLine() ? 'flex' : 'none';
    el.length.value = state.count;
    el.lengthOut.textContent = state.count;
    el.text.disabled = state.fill !== 'text';
    el.fallbackRow.hidden = !state.fallback;

    renderPreview();
  }

  /* ------------------------------------------------------------------ *
   * Copying
   * ------------------------------------------------------------------ */

  const flashTimers = new Map();

  function flashLabel(button, idleLabel, doneLabel) {
    button.textContent = doneLabel;
    clearTimeout(flashTimers.get(button));
    flashTimers.set(
      button,
      setTimeout(() => {
        button.textContent = idleLabel;
      }, 2200),
    );
  }

  function showMessage(text) {
    el.message.textContent = text;
  }

  function copyDesign() {
    const range = document.createRange();
    range.selectNodeContents(el.out);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);

    let copied = false;
    try {
      copied = document.execCommand('copy');
    } catch {
      copied = false;
    }

    if (copied) {
      selection.removeAllRanges();
      showMessage('');
      flashLabel(el.copyDesign, 'Copy link design', 'Copied!');
    } else {
      showMessage('Copying was blocked here. The shape is selected: press Ctrl+C (Cmd+C on Mac).');
    }
  }

  function copyCodeFallback() {
    el.codeBox.open = true;
    el.code.focus();
    el.code.select();

    let copied = false;
    try {
      copied = document.execCommand('copy');
    } catch {
      copied = false;
    }

    if (copied) onCodeCopied();
    else showMessage('Code selected below: press Ctrl+C (Cmd+C on Mac).');
  }

  function onCodeCopied() {
    showMessage('');
    flashLabel(el.copyCode, 'Copy HTML code', 'Copied!');
  }

  function copyCode() {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(el.code.value).then(onCodeCopied, copyCodeFallback);
    } else {
      copyCodeFallback();
    }
  }

  /* ------------------------------------------------------------------ *
   * Cursor sparkles
   * ------------------------------------------------------------------ */

  function enableSparkles() {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    const glyphs = ['✦', '✧', '★'];
    const colors = ['#ffffff', '#5db7ff', '#0a7f86', '#1d3f9a', '#8cffdc'];
    const pick = (list) => list[Math.floor(Math.random() * list.length)];
    const jitter = () => Math.random() * 10 - 5;
    const maxSparkles = 30;
    let lastSpawn = 0;
    let active = 0;

    document.addEventListener('mousemove', (event) => {
      const now = Date.now();
      if (now - lastSpawn < 45 || active >= maxSparkles) return;
      lastSpawn = now;
      active += 1;

      const sparkle = document.createElement('span');
      sparkle.className = 'spark';
      sparkle.textContent = pick(glyphs);
      sparkle.style.left = `${event.clientX + jitter()}px`;
      sparkle.style.top = `${event.clientY + jitter()}px`;
      sparkle.style.color = pick(colors);
      sparkle.style.fontSize = `${11 + Math.random() * 10}px`;
      sparkle.addEventListener('animationend', () => {
        sparkle.remove();
        active -= 1;
      });
      document.body.appendChild(sparkle);
    });
  }

  /* ------------------------------------------------------------------ *
   * Setup
   * ------------------------------------------------------------------ */

  function bindEvents() {
    el.link.addEventListener('input', (event) => {
      state.link = event.target.value;
      renderPreview();
    });

    el.text.addEventListener('input', (event) => {
      state.text = event.target.value;
      if (isLine()) {
        state.count = clampCount(textCharacters().length);
        el.length.value = state.count;
        el.lengthOut.textContent = state.count;
      }
      renderPreview();
    });

    el.length.addEventListener('input', (event) => {
      state.count = Number.parseInt(event.target.value, 10);
      el.lengthOut.textContent = state.count;
      renderPreview();
    });

    el.underline.addEventListener('change', (event) => {
      state.underline = event.target.checked;
      renderPreview();
    });

    el.fallback.addEventListener('change', (event) => {
      state.fallback = event.target.checked;
      update();
    });

    el.fallbackText.addEventListener('input', (event) => {
      state.fallbackText = event.target.value;
      renderPreview();
    });

    el.darkStage.addEventListener('change', (event) => {
      el.stage.classList.toggle('dark', event.target.checked);
    });

    // Placeholder links should not navigate while previewing.
    el.out.addEventListener('click', (event) => {
      const anchor = event.target.closest('a');
      if (anchor && anchor.getAttribute('href') === '#') event.preventDefault();
    });

    el.copyDesign.addEventListener('click', copyDesign);
    el.copyCode.addEventListener('click', copyCode);
  }

  function init() {
    mountLayoutTiles(el.shapes, SHAPES);
    mountLayoutTiles(el.lines, LINES);
    mountChips(el.fills, [['text', 'Text'], ...SYMBOLS.map((s) => [s, s])], (v) => {
      state.fill = v;
    });
    mountChips(
      el.sizes,
      Object.entries(SIZES).map(([id, s]) => [id, s.label]),
      (v) => {
        state.size = v;
      },
    );
    mountChips(el.aligns, Object.entries(ALIGNMENTS), (v) => {
      state.align = v;
    });
    mountColorModes(el.colorModes);
    mountSwatches(el.swatchesA, 'colorA');
    mountSwatches(el.swatchesB, 'colorB');

    el.text.value = state.text;
    el.fallbackText.value = state.fallbackText;

    bindEvents();
    enableSparkles();
    update();
  }

  init();
})();
