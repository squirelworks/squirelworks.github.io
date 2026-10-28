# Architecture

Five files. One of them paints. The other four do not touch the DOM, except `world.ts`, which fetches and builds canvases.

```
src/playfield.tsx     the page, the frame loop, input, HUD, map, tileset upload
src/game/level.ts     bytes → ParsedLevel
src/game/world.ts     catalog, doors, tileset, board bitmap, void snap
src/game/move.ts      axes, sprint, facing
src/game/tiledef.ts   pics1 type mask, feet test, embedded fallback
```

`playfield.tsx` is the only file that touches the DOM and `localStorage`. `fetch` is in `world.ts` and `tiledef.ts`. `level.ts` and `move.ts` are pure.

## Who owns what

| Concern | Owner |
|---|---|
| Header sniff and tile bitstream | `parseLevelBytes` in `level.ts` |
| File name → real file | `resolveDest` in `world.ts` |
| Where a door should put you | `doorArrival`, then `snapLit`, then `snapOpen` |
| 64×64 bitmap of one level | `paintBoard`, cached on the live record |
| Which tile ids are black | `voidMask`, rebuilt when the tileset changes |
| Which tile ids stop the body | `types.bin` via `feetBlocked` |
| Position, facing, door lock | `Live` ref inside `Playfield` |
| Flying | `flying` ref. Ctrl and the Fly button flip it |
| Keyboard, stick, Run button | refs read by the frame, not React state |
| Place name, coordinates, door hint | React state, copied from the ref about 6 times a second |

The frame reads refs so a key repeat does not re-render the tree. React state is the HUD, the atlas, the read panel, the map, the title card, and the flying/tileset labels.

## The live record

```ts
type Live = {
  file: string;
  level: ParsedLevel;
  board: HTMLCanvasElement; // 1024×1024, painted once per visit, or on tileset upload
  x: number;                // tile coordinate, +x is right
  y: number;                // tile coordinate, +y is down
  facing: Facing;
  lock: boolean;            // standing on a door; do not re-fire it
  walk: number;             // phase for the bob
  moving: boolean;
};
```

Boot fills this with `avg-05.nw` at 10.5, 56.5, facing down, `playing` still false. The title card covers the board until Enter Halebridge or Continue.

Other refs the frame closes over:

| Ref | Holds |
|---|---|
| `catalog` | The file list and the three lookup maps |
| `tileset` | The current `HTMLImageElement` |
| `mask` | 8192-byte void mask, 1 if that tile id is black |
| `types` | 4096-byte pics1 mask |
| `keys` / `injected` / `stick` | Input. `injected` is the test hook |
| `flying` | When true, the feet test is skipped |
| `busy` | Set for the whole of `travel` |
| `playing` | False until Enter or Continue |
| `zoom` | 1 to 4, default 2. Camera scale, not a React render |

## Parsed level

`ParsedLevel` is the only shape the rest of the page sees. Tiles are a `Uint16Array` of length 4096, row-major, 64 wide. Links, signs, NPCs, chests, and baddies are arrays. Baddies are stored and never read again. Format is `GLEVNW01` for Avelan, or a `GR-V` / `Z3-V` header for an old `.graal`.

## Two masks, two jobs

They are not the same table, and a tileset upload only rebuilds one of them.

| Mask | Length | Built from | Used when |
|---|---|---|---|
| Void | 8192, indexed by tile id | Sampled pixels of the tileset. A cell whose sampled RGB averages below 8 is void | `snapLit` on arrival, so a door cannot leave you in the black margin |
| Types | 4096, indexed by sheet cell `y * 128 + x` | `types.bin`, or the embedded fallback | Every step, unless flying. Types 20 and 22 refuse the feet cell |

A wall drawn on a type-0 cell will not block. A floor drawn on a type-22 cell will. Uploading `em_tiles.png` repaints the board and refreshes the void mask. It does not retile the type mask.

## Drawing

`paintBoard` slices the tileset into 16×16 canvases, caches them by tile id, and blits a 1024×1024 board. The frame then copies a window of that bitmap into the viewport. Links are stroked, signs are pale marks, NPCs are dots, chests are danger squares. Baddies are not drawn.

The hero is `fillRect` in `drawHero`. It is not a tileset sprite. Facing picks the eye pixels. Walk phase bobs the body one pixel and swings the legs. Zoom scales the hero with the board.