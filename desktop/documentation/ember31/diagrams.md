# Diagrams

The same system as [Architecture](architecture.md) and [Runtime](runtime.md), drawn.

## Boot

```mermaid
flowchart TB
  start["mount Playfield"] --> parallel["fetch catalog, tileset, types.bin"]
  parallel --> masks["buildCatalog, voidMask, type mask or fallback"]
  masks --> level["fetch avg-05.nw"]
  level --> paint["paintBoard, stand at 10.5, 56.5"]
  paint --> card["title card, playing = false"]
  card --> enter["Enter Halebridge"]
  card --> cont["Continue, if a save parses"]
  enter --> loop["requestAnimationFrame"]
  cont --> travel["travel saved file, no link"]
  travel --> loop
  parallel -->|fetch fails| bad["banner in danger, Enter stays disabled"]
```

## One frame

```mermaid
flowchart TB
  raf["frame"] --> cap["dt = min(elapsed, 50ms)"]
  cap --> play{"playing and not busy?"}
  play -->|no| draw["paint board, marks, hero"]
  play -->|yes| axis["axis of keys, stick, Run"]
  axis --> step["stepPosition at 4.6 or 9.2"]
  step --> door{"lock clear and linkAt hits?"}
  door -->|resolved| travel["travel, do not commit"]
  door -->|missing file| miss["banner, commit, lock"]
  door -->|no| feet{"flying or feet open?"}
  feet -->|open| commit["commit, clamp 0.2..63.8"]
  feet -->|blocked| slide["keep the open axis, x then y"]
  commit --> unlock{"was locked and now outside every link?"}
  slide --> unlock
  unlock --> face["facingFrom, advance walk"]
  miss --> face
  face --> draw
  draw --> hud{"160ms since HUD copy?"}
  hud -->|yes| copy["place, door, coordinates"]
  hud -->|no| saveq
  copy --> saveq{"2s since save?"}
  saveq -->|yes| write["localStorage ember31-avelan-v1"]
  saveq -->|no| raf
  write --> raf
```

## Opening a door

```mermaid
flowchart TB
  hit["link hit, dest resolved"] --> busy["busy = true, banner Opening…"]
  busy --> fetch["fetchLevel, paintBoard"]
  fetch --> via{"came from a link?"}
  via -->|no| point["stand at the requested point"]
  via -->|yes| missing{"nx or ny is -1?"}
  missing -->|yes| back{"dest has a link ≤ 12 tiles back here?"}
  back -->|yes| center["center of that link, lock"]
  back -->|no| keep["nx+0.5 / ny+0.5, keep the free axis"]
  missing -->|no| keep
  point --> lit["snapLit: nearest non-void"]
  center --> lit
  keep --> lit
  lit --> open["snapOpen: nearest cell that is not void and not type 20/22"]
  open --> lock{"landing is inside a link?"}
  lock -->|yes| setlock["lock = true"]
  lock -->|no| clear["lock stays as aimed"]
  setlock --> done["busy = false, write save"]
  clear --> done
  fetch -->|error| stay["banner, lock = true, stay"]
```

## Where a link sends you

```mermaid
flowchart LR
  raw["link dest string"] --> base["last path segment"]
  base --> exact{"exact file in the catalog?"}
  exact -->|yes| file["that file"]
  exact -->|no| stem{"stem of a .graal, else a .nw?"}
  stem -->|yes| file
  stem -->|no| missing["banner: No level named …"]
```

The rectangle test, before that lookup: among links that contain the point, the smallest `w * h` is the one that fires.

## Feet against the mask

```mermaid
flowchart LR
  pos["x, y"] --> cell["tx = floor x, ty = floor y"]
  cell --> id["tiles[ty * 64 + tx]"]
  id --> sheet["col, row = tilePixel mapping"]
  sheet --> idx["index = row * 128 + col"]
  idx --> type["types[index]"]
  type --> block{"type is 20 or 22?"}
  block -->|yes| no["refuse, unless flying"]
  block -->|no| yes["enter"]
```

Void is a different test, and only on arrival. After the tileset is decoded, any of the 8192 ids whose sampled pixels average below 8 is marked empty. `snapLit` will not leave you standing on it when a level opens. Uploading a sheet rebuilds this mask and the board. It does not rebuild `types`.

## Avelan around the start

The grid is `av{a–j}-{01–10}`. You spawn in Halebridge, south side of the keep. The south gate is the edge out. Neighbor files depend on the link written in `avg-05.nw`; the usual overworld pattern is the four adjacent cells.

```mermaid
flowchart TB
  keep["avg-05.nw · Halebridge · spawn 10.5, 56.5"]
  north["avg-04.nw"]
  south["avg-06.nw · The Greywater"]
  west["avf-05.nw"]
  east["avh-05.nw"]
  keep --- north
  keep --- south
  keep --- west
  keep --- east
```

Named places elsewhere on the island: Highcairn `avf-03`, Westmere `avd-06`, Saltwharf `avf-09`, Cinderholm `avi-08`. The map pins those six. They are labels, not warps. Warping is the atlas.

## Tile id to a cell

```mermaid
flowchart LR
  pair["two alphabet chars"] --> id["hi * 64 + lo"]
  bits["12-bit or 13-bit packet"] --> id
  id --> col["col = floor id / 512 * 16 + id mod 16"]
  id --> row["row = floor id / 16 mod 32"]
  col --> px["source pixel col * 16, row * 16"]
  row --> px
  px --> blit["16×16 into the 1024×1024 board"]
  row --> mask["mask index row * 128 + col"]
  col --> mask
```

## Screen

```mermaid
flowchart TB
  subgraph view [Viewport, h-dvh]
    canvas["canvas, the board and the hero"]
    hud["HUD: Ember3.1, place, coordinates, door, tileset"]
    tools["zoom, Tiles, Fly, Map, Atlas"]
    joy["joystick, under md"]
    run["Run and Read, under md"]
    card["title card, z-30, until you enter"]
    atlas["atlas sheet, z-20"]
    map["map sheet, z-20"]
    read["read panel, z-10"]
  end
  canvas --- hud
  canvas --- tools
  canvas --- joy
  canvas --- run
```

The title card covers the board until Enter Halebridge or Continue. The atlas and the map cover it while they are open. The read panel does not. You can still see the room behind a sign.