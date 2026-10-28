# Architecture

Four files. One of them paints. The other three are pure enough to test without a canvas.

```
src/playfield.tsx     the page, the frame loop, input, HUD
src/game/level.ts     bytes → ParsedLevel
src/game/world.ts     catalog, doors, tileset, board bitmap, void snap
src/game/move.ts      axes, sprint, facing
```

`playfield.tsx` is the only file that touches the DOM, `fetch` is in `world.ts`, and `localStorage` is in the page. `level.ts` and `move.ts` are pure.

## Who owns what

| Concern | Owner |
|---|---|
| Header sniff and tile bitstream | `parseLevelBytes` in `level.ts` |
| File name → real file | `resolveDest` in `world.ts` |
| Where a door should put you | `doorArrival`, then `snapLit` |
| 64×64 bitmap of one level | `paintBoard`, cached on the live state |
| Which tile ids are black | `voidMask`, built once from the tileset |
| Position, facing, door lock | `Live` ref inside `Playfield` |
| Keyboard, stick, Run button | refs read by the frame, not React state |
| Place name, coordinates, door hint | React state, copied from the ref about 6 times a second |

The frame reads refs so a key repeat does not re-render the tree. React state is the HUD, the atlas, the read panel, and the title card.

## The live record

```ts
type Live = {
  file: string;
  level: ParsedLevel;
  board: HTMLCanvasElement; // 1024×1024, painted once per visit
  x: number;                // tile coordinate, +x is right
  y: number;                // tile coordinate, +y is down
  facing: Facing;
  lock: boolean;            // standing on a door; do not re-fire it
  walk: number;             // phase for the bob
  moving: boolean;
};
```

Boot fills this with `onlinestartlocal.graal` at `(30.5, 34.5)` before the title card lets you move. `playing` stays false until Enter the house or Continue, so the first frames draw the room and do not walk.

## A level, after parsing

```ts
type ParsedLevel = {
  name: string;
  format: string;           // "GR-V1.03" or "GLEVNW01" or "text"
  tiles: Uint16Array;       // 64 * 64 ids, row-major
  links: LevelLink[];
  signs: LevelSign[];
  npcs: LevelNpc[];
  chests: LevelChest[];
  baddies: LevelBaddy[];    // kept, not drawn
  boardLines: number;
};
```

A link is an axis-aligned rectangle in tile units plus a destination file and an optional arrival cell. `nx` or `ny` of `-1` means "do not use this axis."

## Catalog

`buildCatalog` indexes every name three ways: the exact lower-case file, the stem of each `.graal`, and the stem of each `.nw`. `resolveDest` takes whatever a link wrote (`egk-10`, `egk-10.graal`, a path with backslashes) and returns the catalog's real file name. A `.graal` stem wins over a `.nw` stem when both exist. `GRMAP001` files are map lists, not boards, and `parseLevelBytes` refuses them.

## Names

`placeName` is the HUD title, not the file.

| File stem | Title |
|---|---|
| `onlinestartlocal` | The house |
| `onlinestartlocal-up` | Upstairs |
| `egk-10` | Enigma K-10 |
| anything else | the stem |

The overworld is the 25×25 grid `eg{a–y}-{01–25}`. The house is not on that grid. Its south door names `egk-10`.

## Drawing model

`paintBoard` draws each cell once into an offscreen 1024×1024 canvas (`64 * 16`). The frame then `drawImage`s a window of that bitmap into the viewport. Zoom is an integer from 1 to 4, default 2, and it is a source-rectangle scale, not a CSS transform. `imageSmoothingEnabled` is false.

Doors, signs, NPCs, chests, and the hero are stroked on top of that blit, in screen space, every frame. They are not baked into the board, so a new level does not need a second paint to show its actors.

The hero is drawn with `fillRect`. It is not a tileset sprite. Facing picks the eye pixels. Walk phase bobs the body one pixel and swings the legs.