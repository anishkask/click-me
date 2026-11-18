# Click Me!

Format any link into a fun, clickable design. Paste a link, pick a shape, and copy it into your email. Every letter or symbol in the design is its own link.

**Try it:** https://anishkask.github.io/click-me/

## Features

- **Shapes:** heart, star, cat, bunny, paw, flower, butterfly and smiley
- **Lines and trails:** two diagonals, vertical, straight line, wave and zigzag
- **Characters:** spell your own text, or use hearts, stars, flowers, faces and music symbols
- **Color:** solid, gradient, rainbow, holographic or alternating, with a swatch palette
- **Layout:** three sizes, left or centered, optional underline
- **Fallback link:** an optional plain text link under the design, in case a mail app mangles the shape
- **Copy:** one button copies the design for pasting into an email, another copies the raw HTML
- **Preview:** switch the preview to a dark background to see how it looks on a dark inbox

## How to use

1. Paste your link into the **Link** box.
2. Pick a shape or a line under **Options**.
3. Choose the characters, colors, size and position.
4. Click **Copy link design**, then paste it into the compose window of your email app.

## Email compatibility

Designs are built from HTML tables with inline styles, which mail apps handle far better than spaces or CSS layout. Rendering still varies between clients, so send yourself a test before sending it to anyone else. Symbols use the recipient's system fonts, so a rare symbol may show as a box in older clients.

If your browser blocks the copy button, the design is selected for you. Press `Ctrl+C` (`Cmd+C` on Mac) to copy it.

## Run locally

There is no build step and no dependencies. Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
```

Then visit <http://localhost:8000>.

## Project structure

```
index.html       page markup
css/styles.css   styles
js/script.js     shapes, color logic, email HTML builder and UI
```

## Add a shape

Shapes live in the `SHAPES` object in `js/script.js`. Each one is a list of equal-length rows where `X` marks a clickable character and `.` marks a gap:

```js
diamond: {
  label: 'Diamond',
  rows: [
    '..X..',
    '.XXX.',
    'XXXXX',
    '.XXX.',
    '..X..',
  ],
},
```

New shapes appear in the picker automatically.

## Deployment

The site is static and is served by GitHub Pages from the `main` branch.

## License

[MIT](LICENSE)
