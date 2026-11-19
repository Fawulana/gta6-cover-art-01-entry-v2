# gta6-cover-art-01-entry-v2

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

[![rank](https://make.fun/badge/gta6-cover-art-01/Fawulana/gta6-cover-art-01-entry-v2/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

[![reward](https://make.fun/badge/gta6-cover-art-01/Fawulana/gta6-cover-art-01-entry-v2/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

Vice Coast Cover Lab — an offline web app that turns your photos and a caption into a bold multi-panel GTA-style cover, exported as a PNG to share. A hero photo runs full-bleed or across a poster grid, three panels or nine panels fill the rest, two tilted snapshot prints overlap the hero layout, and a slashed title band with a striped setting sun carries the title in huge canvas lettering with a neon subtitle. Pick up to four sample photos (or upload your own), click any panel to select it, drag to move the photo, scroll to zoom, choose one of three layouts and four sunset/neon colour grades, edit the title and subtitle. Exports 1080×1080, 1080×1350 and 1920×1080. Everything runs in the browser; photos never leave your machine. All artwork is original or image-model-made — no Rockstar Games logo, artwork or font, and no font files at all: every letter is drawn with canvas text.

## How it works

`app/src/poster.js` (`drawPoster`, `renderPoster`) draws the cover: `zoneRects` places the hero, the panel grid or the nine-panel grid, `drawZonePhoto` cover-fits each photo with its zoom and pan, `drawStripedSun` raises the retro sun behind the band, `drawTitleBand` letters the title along the band's slope, and `drawPrint` frames the tilted snapshots. `app/src/tones.js` holds the four grades, `app/src/editor.js` wires the editor (panel select, drag, zoom, upload, export), and `app/src/scenes.js` sets up the fixed screenshot scenes.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080.

---

<sub>Entered on [make.fun](https://make.fun/?ref=fawulan&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards</sub>
