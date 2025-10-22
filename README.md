# The Dark Triad — Static Site Kit

This package recreates the mystic atmosphere of [ccc.actor](https://ccc.actor) using plain HTML, CSS, and vanilla JavaScript.

## Getting started

1. **Open locally**: Double-click `index.html` or open it in your preferred browser. All assets are relative, so no build step is required.
2. **Replace the logo**:
   - Put your logo file anywhere in the project (for example `assets/img/logo.png`).
   - Edit `assets/img/logo.txt` so that it contains the relative path to that image. The script reads the text file and swaps the halo logo for your asset automatically.
3. **Configure background videos**:
   - Update `assets/video/video1.txt`, `video2.txt`, and `video3.txt` with the relative or absolute URL to your `.mp4` clips.
   - Videos should be high-contrast, dark atmospheric footage. They autoplay muted, loop, and switch in sequence when clicking the logo or the main title.
4. **Glyph vocabulary**:
   - Customise `assets/glyphs.json` to alter the symbols or the revealed labels. Each entry defines one interactive glyph button.

## Notes

- For best fidelity, host the site via a local server (`python -m http.server`) so that browsers allow `fetch` to read the `.txt` and `.json` files.
- The site includes layered effects (halo, animated grain, scanlines) and accessible keyboard interactions. Videos cross-fade with a 1 second transition.
- The login button links to Discord by default—feel free to update the URL.
