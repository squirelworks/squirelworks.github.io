# Framework

Ember3.1 is the page. The host is whatever renders `<Playfield />` and serves the static URLs below.

## Host

Written against TanStack Start on React 19, Vite, and Tailwind v4. The route only mounts the page:

```tsx
import { Playfield } from "@/components/Playfield";

function Home() {
  return <Playfield />;
}
```

The page imports `react` and `lucide-react` (`Compass`, `Map`, `Minus`, `Plus`, `X`). It does not import the router, a database, or a server function. Parsing, painting, collision, and movement all run in the browser.

`theme.css` is the Tailwind v4 `@theme` block the class names expect. Paste it into the host stylesheet. Outfit is the display face. IBM Plex Mono is coordinates, file names, and the version eyebrow.

| Token | Value | Used for |
|---|---|---|
| `bg` | `#12110e` | Page, and the void painted around a board |
| `surface` | `#1c1b17` | HUD, atlas, read panel, map sheet |
| `raised` | `#26241e` | Atlas row hover |
| `fg` | `#efe8dc` | Text, sign marks, the you-are-here dot |
| `muted` | `#a39b8d` | Secondary line |
| `faint` | `#6f685e` | Eyebrow labels, tileset name |
| `line` | `#3a362e` | Borders |
| `accent` / `accent-fg` | `#d6d3cc` / `#12110e` | Atlas, Fly when on, joystick nub |
| `danger` | `#c46a5a` | A failed load, chest marks |

## Static files the page fetches

| URL | Shape |
|---|---|
| `/levels/index.json` | A JSON array of file names, not an object. `fetchCatalog` reads it as `string[]`. |
| `/levels/<file>` | Raw `.nw` or `.graal` bytes. The name is `encodeURIComponent`'d. |
| `/eg_tiles.png` | Default tileset. Classic size is 2048×512, 16×16 cells. |
| `/tiledef/types.bin` | 4096 bytes, one type per pics1 cell. Index is `y * 128 + x`. |
| `/avelan-map.png` | The 10×10 overview. The map sheet treats it as a 640×640 field. |

Copy Avelan `.nw` files to `public/levels/`, `index.json` to `public/levels/index.json`, `avelan-map.png` to `public/avelan-map.png`, `eg_tiles.png` to `public/eg_tiles.png`, and `types.bin` to `public/tiledef/types.bin`. Start is `avg-05.nw` at 10.5, 56.5 (Halebridge, inside the keep).

If the mask fetch misses, or the body is not exactly 4096 bytes, `loadTypes` uses the mask embedded in `src/game/tiledef.ts`. Do not rewrite `types.bin` to match a new drawing. Art does not encode blocking.

## What changed from Ember2

Ember2 walked Avelan with no body collision. Ember3.1 is that page plus three things:

- A tileset upload. The Tiles button takes a png, gif, or webp, rebuilds the void mask, and repaints the current board. Default stays `/eg_tiles.png`.
- The pics1 type-0 mask. Feet cannot enter type 20 or 22. Feet cell is `floor(x)`, `floor(y)`.
- Ctrl, or the Fly button, toggles flying. Flying ignores the mask so a bad warp cannot trap the walker. Ctrl again lands. Shift still runs.

Save key moved from Ember2's key to `ember31-avelan-v1`. An Ember2 save is not read.

## What it is not

It never dials a Graal server. A level's NPC block is shown as text when you press E or Space, or the Read button. It is not executed. Baddies are parsed and then ignored: they are not drawn and they do not move. Water, lava, swamp, chairs, and beds are types in the mask, and the walker still enters them. Only 20 and 22 stop the body, and only while not flying.

There is one player, stored in a ref, not in a server session. The only persistence is `localStorage`.