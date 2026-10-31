# Warrenpoint Undead

A zombie survival game set on the streets of Warrenpoint, playable on desktop, touch screens and in VR (WebXR, e.g. Meta Quest).

**Play:** serve this folder over http(s) and open `index.html`. With GitHub Pages turned on for this repo (Settings → Pages → deploy from `main`, root), the game runs at the Pages address, and VR works there because it's HTTPS.

```
Notes
- It must be served over http(s); double-clicking index.html from your
  disk won't work because browsers block module scripts on file://.
  To test locally:  python3 -m http.server  then open http://localhost:8000
- VR needs HTTPS (any normal web host or GitHub Pages is fine). Open the
  page in the Quest browser and press Enter VR.
- Fonts load from Google Fonts; if they're blocked the game falls back to
  system fonts and still works.
- Saved progress (credits, upgrades, best times, options) is stored in the
  browser on each device, per web address.
```

## Layout

| Path | What it is |
|---|---|
| `index.html` | The complete built game |
| `lib/three.module.js` | three.js r160, bundled so nothing loads from a CDN |
| `sounds/` | Sample voices, Mr Toasty's theme and *Rotor Rumble*, the bonus-round song (the game synthesises its audio live; these are reference copies) |
| `src/game.js`, `src/shell.html` | Game source and page/UI shell |
| `src/data.json` | Map data: buildings, terrain, streets |
| `src/port/` | Landmark and shopfront modules (already merged into `game.js`) |
| `src/music/` | *Rotor Rumble* composer script and MIDI |

## Rebuilding

```sh
mkdir -p build && python3 src/build.py
# then point index.html at the local engine:
{ echo '<!doctype html><html lang="en"><head><meta charset="utf-8">'; sed 's#https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js#./lib/three.module.js#g' build/warrenpoint-undead.html; echo '</html>'; } > index.html
```
