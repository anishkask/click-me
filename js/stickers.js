(function () {
  'use strict';

  // Decorative pixel stickers for the empty space beside the tool.
  const PIXELS = {
    heart: ['.XX.XX.', 'XXXXXXX', 'XXXXXXX', '.XXXXX.', '..XXX..', '...X...'],
    star: [
      '....X....',
      '...XXX...',
      'XXXXXXXXX',
      '.XXXXXXX.',
      '..XXXXX..',
      '.XXX.XXX.',
      '.XX...XX.',
    ],
    sparkle: ['...X...', '...X...', '..XXX..', 'XXXXXXX', '..XXX..', '...X...', '...X...'],
    paw: [
      '..XX...XX..',
      '..XX...XX..',
      'XX..XXX..XX',
      'XX.XXXXX.XX',
      '...XXXXX...',
      '..XXXXXXX..',
      '..XXX.XXX..',
      '...XX.XX...',
    ],
    spiral: [
      '......XXXXXXXX...',
      '.....XX......XX..',
      '....XX........XX.',
      '....X...XXXX...XX',
      '...XX..XX..XX...X',
      '...X...X....XX..X',
      'X..X...X..X..X..X',
      'X..XX..XXXX..X..X',
      'X...X.......XX..X',
      'XX..XX......X...X',
      '.XX..XXX.XXXX..XX',
      '..X....XXX....XX.',
      '..XXX........XX..',
      '....XXX....XXX...',
      '......XXXXXX.....',
    ],
  };

  const PINK = '#e11d6a';
  const PURPLE = '#3b1a6b';
  const BLUE = '#1d3f9a';
  const SKY = '#5db7ff';
  const YELLOW = '#ffd23f';
  const TEAL = '#0a7f86';
  const EDGE = '#0a1a3f';

  // [side, shape, color, pixel size, left %, top % of the page, rotation]
  const LAYOUT = [
    ['left', 'heart', PINK, 8, 14, 1, -8],
    ['left', 'star', YELLOW, 7, 40, 15, 7],
    ['left', 'spiral', PURPLE, 6, 12, 29, -5],
    ['left', 'paw', PINK, 7, 36, 43, 9],
    ['left', 'sparkle', BLUE, 8, 16, 57, -6],
    ['left', 'heart', PURPLE, 8, 38, 71, 8],
    ['left', 'star', SKY, 7, 14, 85, -7],
    ['right', 'sparkle', PINK, 8, 38, 4, 6],
    ['right', 'paw', PURPLE, 7, 12, 18, -9],
    ['right', 'heart', TEAL, 8, 36, 32, 7],
    ['right', 'star', YELLOW, 7, 14, 46, -8],
    ['right', 'spiral', SKY, 6, 34, 60, 6],
    ['right', 'paw', BLUE, 7, 12, 74, -7],
    ['right', 'heart', PINK, 8, 38, 88, 8],
  ];

  const NS = 'http://www.w3.org/2000/svg';

  function sticker(shape, color, px, rotation) {
    const rows = PIXELS[shape];
    const pad = 4;
    const width = rows[0].length * px;
    const height = rows.length * px;
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('width', width + pad * 2 + 3);
    svg.setAttribute('height', height + pad * 2 + 3);
    svg.style.transform = `rotate(${rotation}deg)`;

    const cell = (x, y, fill, stroke, dx = 0, dy = 0) => {
      const rect = document.createElementNS(NS, 'rect');
      rect.setAttribute('x', x * px + pad + dx);
      rect.setAttribute('y', y * px + pad + dy);
      rect.setAttribute('width', px);
      rect.setAttribute('height', px);
      rect.setAttribute('fill', fill);
      if (stroke) {
        rect.setAttribute('stroke', stroke);
        rect.setAttribute('stroke-width', 8);
      }
      rect.setAttribute('shape-rendering', 'crispEdges');
      svg.appendChild(rect);
    };
    const eachCell = (fn) =>
      rows.forEach((row, y) =>
        [...row].forEach((char, x) => {
          if (char === 'X') fn(x, y);
        }),
      );

    eachCell((x, y) => cell(x, y, EDGE, null, 3, 3));
    eachCell((x, y) => cell(x, y, '#fff', '#fff'));
    eachCell((x, y) => cell(x, y, color));
    return svg;
  }

  function init() {
    const sides = {};
    ['left', 'right'].forEach((side) => {
      const column = document.createElement('div');
      column.className = `stickers stickers-${side}`;
      column.setAttribute('aria-hidden', 'true');
      document.body.appendChild(column);
      sides[side] = column;
    });

    LAYOUT.forEach(([side, shape, color, px, left, top, rotation]) => {
      const item = sticker(shape, color, px, rotation);
      const width = Number(item.getAttribute('width'));
      item.style.left = `min(${left}%, calc(100% - ${width + 8}px))`;
      item.style.top = `${top}%`;
      sides[side].appendChild(item);
    });
  }

  init();
})();
