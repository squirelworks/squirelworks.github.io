# Diagrams

The prose for each of these is in [Framework](framework.md), [Architecture](architecture.md), [Levels](levels.md), and [Runtime](runtime.md).

## Modules

```mermaid
flowchart LR
  subgraph host [Host]
    Route["route renders Playfield"]
    Public["/levels and /eg_tiles.png"]
    Theme["theme.css tokens"]
  end
  subgraph ember [Ember]
    Page["playfield.tsx"]
    Move["move.ts"]
    World["world.ts"]
    Level["level.ts"]
  end
  Route --> Page
  Theme --> Page
  Page --> Move
  Page --> World
  World --> Level
  Public --> World
```

## Boot and the title card

```mermaid
flowchart TD
  startNode["Playfield mounts"] --> parallel["fetch catalog and tileset"]
  parallel --> mask["voidMask once"]
  mask --> house["fetch onlinestartlocal.graal"]
  house --> paint["paintBoard, stand at 30.5, 34.5"]
  paint --> card["Title card, movement frozen"]
  card --> enter["Enter the house"]
  card --> cont["Continue, if a save exists"]
  enter --> loop["Frame loop may step"]
  cont --> travel["travel to saved file and point"]
  travel --> loop
  parallel -->|fetch fails| banner["Danger banner, button stays disabled"]
```

## One frame

```mermaid
flowchart TD
  raf["requestAnimationFrame"] --> cap["dt = min 0.05, elapsed"]
  cap --> gate{"playing and not busy?"}
  gate -->|no| draw
  gate -->|yes| axes["axis of keys plus stick"]
  axes --> rate{"Shift or Run?"}
  rate -->|yes| fast["9.2 tiles per second"]
  rate -->|no| walk["4.6 tiles per second"]
  fast --> step["stepPosition"]
  walk --> step
  step --> locked{"door lock set?"}
  locked -->|yes| commit["clamp and store"]
  locked -->|no| hit{"smallest link contains the point?"}
  hit -->|no| commit
  hit -->|missing file| stuck["banner, commit, lock"]
  hit -->|file found| open["travel, do not commit this step"]
  commit --> release{"was locked, now outside every link?"}
  release -->|yes| clear["clear lock"]
  release -->|no| face
  clear --> face["facing and walk phase"]
  stuck --> face
  face --> draw["blit board, marks, hero"]
  open --> draw
  draw --> hud{"160 ms since HUD?"}
  hud -->|yes| copy["place, door, coordinates"]
  hud -->|no| saveQ
  copy --> saveQ{"2 s since save, and playing?"}
  saveQ -->|yes| disk["localStorage playerworld-v1"]
  saveQ -->|no| raf
  disk --> raf
```

## Door travel

```mermaid
flowchart TD
  call["travel file, point, from, link"] --> busy["busy = true, freeze stepping"]
  busy --> load["fetchLevel and paintBoard"]
  load -->|error| stay["keep the old board, lock, show the error"]
  load --> kind{"link provided, and nx or ny is -1?"}
  kind -->|yes| back{"destination has a link of area ≤ 12 back to from?"}
  back -->|yes| center["stand in that link, lock"]
  back -->|no| explicit
  kind -->|no| explicit["nx+0.5 and ny+0.5, or keep the old axis"]
  center --> snap["snapLit if the tile is void"]
  explicit --> snap
  snap --> on{"final point still inside a link?"}
  on -->|yes| lockOn["lock"]
  on -->|no| swap
  lockOn --> swap["replace Live, write save"]
  stay --> done["busy = false"]
  swap --> done
```

## Where a link sends you

```mermaid
flowchart LR
  raw["link dest string"] --> base["last path segment"]
  base --> exact{"exact file in the catalog?"}
  exact -->|yes| file["that file"]
  exact -->|no| stem{"stem of a .graal, else a .nw?"}
  stem -->|yes| file
  stem -->|no| missing["banner: no level named …"]
```

The rectangle test, before that lookup: among links that contain the point, the smallest `w * h` is the one that fires.

## Overworld around the start

The grid is `eg{a–y}-{01–25}`, columns A–Y, rows 01–25. You do not spawn on it. You spawn in the house, and the south door is the edge into K-10.

```mermaid
flowchart TB
  house["onlinestartlocal.graal · The house · spawn 30.5, 34.5"]
  up["onlinestartlocal-up.graal\nUpstairs"]
  k10["egk-10.graal\nEnigma K-10"]
  k09["egk-09.graal\nnorth"]
  k11["egk-11.graal\nsouth"]
  j10["egj-10.graal\nwest"]
  l10["egl-10.graal\neast"]
  house -->|"south door, reciprocal landing"| k10
  house --- up
  k10 --- k09
  k10 --- k11
  k10 --- j10
  k10 --- l10
```

Edge links on the overworld usually name the neighbor and a real `nx` or `ny`. Those use the explicit landing, not the reciprocal search. The reciprocal search is for a small door that left an axis as `-1`, which is the house door.

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
```

Void is not a special id. After the tileset is decoded, any of the 8192 cells whose sampled pixels average below 8 is marked empty, and `snapLit` will not leave you standing on it when a level opens.

## Screen

```mermaid
flowchart TB
  subgraph view [Viewport, h-dvh]
    canvas["canvas, the board and the hero"]
    hud["HUD: Playerworld, place, coordinates, door"]
    tools["zoom and Atlas"]
    joy["joystick, under md"]
    run["Run and Read, under md"]
    card["title card, z-30, until you enter"]
    atlas["atlas sheet, z-20"]
    read["read panel, z-10"]
  end
  canvas --- hud
  canvas --- tools
  canvas --- joy
  canvas --- run
```

The title card covers the board until Enter the house or Continue. The atlas covers it while you search. The read panel does not. You can still see the room behind a sign.