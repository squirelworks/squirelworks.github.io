# Pseudocode

Close to the functions in `src/`. Names match. This is the control flow, not a second implementation.

## Resolve a door name

```
resolveDest(catalog, dest):
  base = last segment of dest, slashes normalized
  if catalog.exact has base.lower: return that file
  stem = base without .graal / .nw / .gmap
  return catalog.graalStem[stem] or catalog.nwStem[stem] or null
```

`.graal` wins over `.nw` when both stems exist. Avelan only has `.nw`.

## Smallest link under the feet

```
linkAt(level, x, y):
  best = null
  area = infinity
  for link in level.links:
    if x,y inside [link.x, link.x+w) × [link.y, link.y+h):
      if link.w * link.h < area:
        best = link
  return best
```

## Where that link puts you

```
doorArrival(fromFile, link, dest, catalog, px, py):
  if link.nx < 0 or link.ny < 0:
    back = first dest.links where
      other.w * other.h <= 12
      and resolveDest(other.dest) is fromFile
    if back: return center of back, lock = true
  return
    x = link.nx + 0.5 if link.nx >= 0 else px
    y = link.ny + 0.5 if link.ny >= 0 else py
    lock = false
```

## Arrival snap

```
snapLit(level, voids, x, y):
  if tile at floor(x), floor(y) is not void: return x, y
  for r in 1..28, Chebyshev ring:
    if that cell is in board and not void:
      return cell center
  return x, y

snapOpen(level, types, voids, x, y):
  same walk, but a cell is open only if it is not void
  and feetBlocked(types, tiles, cx+0.5, cy+0.5) is false
```

`snapOpen` runs even while flying. It is how a door into a wall still lands.

## Feet test

```
sheetIndex(tileId):
  col = floor(tileId / 512) * 16 + tileId mod 16
  row = floor(tileId / 16) mod 32
  return row * 128 + col

feetBlocked(types, tiles, x, y):
  tx, ty = floor(x), floor(y)
  if out of board: return true
  t = types[sheetIndex(tiles[ty * 64 + tx])]
  return t == 20 or t == 22
```

Out of range on the mask does not block. Out of board does.

## Boot

```
boot:
  catalog, image, types = await all of fetchCatalog, loadTileset, loadTypes
  voids = voidMask(image)
  level = await fetchLevel("avg-05.nw")
  live = { file, level, board: paintBoard(level, image),
           x: 10.5, y: 56.5, facing: down, lock: false }
  ready = true
  requestAnimationFrame(paint)
```

`loadTypes` returns the embedded 4096 bytes if `/tiledef/types.bin` is missing or the wrong length.

## The frame

```
paint(now):
  dt = min((now - last) / 1000, 0.05)
  if playing and not busy and live:
    move = axis(keys ∪ injected ∪ maybe Shift, stick)
    rate = 4.6 * (2 if Shift else 1)
    if move is not zero:
      next = stepPosition(live, move, dt, rate)
      link = null if live.lock else linkAt(live.level, next)
      if link:
        dest = resolveDest(catalog, link.dest)
        if dest: travel(dest, next, live.file, link)    # does not commit
        else: commit next, lock, banner
      else:
        blocked(p) = not flying and feetBlocked(types, tiles, p)
        if blocked(next):
          if not blocked(next.x, live.y): live.x = clamp(next.x)
          else if not blocked(live.x, next.y): live.y = clamp(next.y)
        else:
          live.x, live.y = clamp(next)
        if live.lock and linkAt(live) is null: live.lock = false
      live.facing = facingFrom(move, live.facing)
      live.walk += dt * (14 if sprint else 8)
  draw board window centered on live, then links, signs, npcs, chests, hero
  every 160ms: copy place, door hint, coordinates into React state
  every 2s while playing: writeSave
  requestAnimationFrame(paint)
```

`clamp` is `[0.2, 63.8]`.

## Travel

```
travel(file, x, y, fromFile, via):
  if busy: return
  busy = true
  try:
    level = await fetchLevel(file)
    board = paintBoard(level, tileset)
    aimed = via ? doorArrival(fromFile, via, level, catalog, x, y) : {x, y, lock: false}
    spot = snapLit(level, voids, aimed)
    open = snapOpen(level, types, voids, spot)
    live = { file, level, board, open.x, open.y,
             facing: kept, lock: aimed.lock or linkAt(open), walk: 0 }
    writeSave
  catch:
    banner = error
    if live: live.lock = true
  finally:
    busy = false
```

Atlas calls this with `via = null` and point 32, 32. Continue does the same with the saved point.

## Read

```
actorHere(level, x, y):
  best = null, bestD = 1.6
  for sign with text, npc, chest:
    d = distance from (x, y) to cell center
    if d < bestD: best = that record
  return best
```

E, Space, and Read call it. No hit sets the banner to "Nothing here to read." The script is displayed. It is not run.

## Tileset upload

```
applyTileset(file):
  image = load object URL
  on load:
    tileset = image
    voids = voidMask(image)          # types.bin is not touched
    if live: live.board = paintBoard(live.level, image)
```

The next frame shows the new board. Collision types stay on the old mask.