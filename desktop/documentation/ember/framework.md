# Framework

Ember is the page. The host is whatever renders `<Playfield />` and serves three static URLs.

## Host

The app this was written in is TanStack Start on React 19, Vite, and Tailwind v4. The route file only mounts the page:

```tsx
import { Playfield } from "@/components/Playfield";

function Home() {
  return <Playfield />;
}
```

Ember itself imports `react` and `lucide-react`. It does not import the router, a database, or a server function. Parsing, painting, and movement all run in the browser.

`theme.css` is the Tailwind v4 `@theme` block the class names expect. Paste it into the host stylesheet. The type is Outfit for the display face and IBM Plex Mono for coordinates and file names.

| Token | Value | Used for |
|---|---|---|
| `bg` | `#12110e` | Page and the void around a board |
| `surface` | `#1c1b17` | HUD, atlas, read panel |
| `raised` | `#26241e` | Atlas row hover |
| `fg` | `#efe8dc` | Text, sign marks |
| `muted` | `#a39b8d` | Secondary line |
| `faint` | `#6f685e` | Eyebrow labels |
| `line` | `#3a362e` | Borders |
| `accent` / `accent-fg` | `#d6d3cc` / `#12110e` | Atlas, Read, joystick nub |
| `danger` | `#c46a5a` | A failed load, chest marks |

## Static files the page fetches

| URL | Shape |
|---|---|
| `/levels/index.json` | A JSON array of file names, not an object. `fetchCatalog` reads it as `string[]`. |
| `/levels/<file>` | The raw `.graal` or `.nw` bytes. The name is `encodeURIComponent`'d. |
| `/eg_tiles.png` | The indexed tileset. Classic size is 2048×512, 16×16 cells. |

The archive those files come from is `oldeg`. Ember does not bundle it. Copy the `.graal` and `.nw` files into the host's `public/levels/`, write the array into `public/levels/index.json`, and copy `eg_tiles.png` to `public/eg_tiles.png`.

## What Ember is not

Ash, the client this was taken from, can dial a Graal server. Ember never does. A level's NPC block is shown as text when you press E. It is not executed. Baddies are parsed and then ignored: they are not drawn and they do not move. There is no wall collision. The only tiles that change where you stand are void tiles, and only at the moment a level opens.

There is one player, stored in a ref, not in a server session. The only persistence is `localStorage` key `playerworld-v1`.