# Runtime

One `requestAnimationFrame` loop, started at the end of boot. `dt` is capped at 50 ms so a stalled tab does not fling you across the board.

## Boot

```
fetch /levels/index.json, /eg_tiles.png, /tiledef/types.bin    in parallel
build the catalog, the void mask, and the type mask
fetch avg-05.nw
paint its board
stand at (10.5, 56.5), facing down, not yet playing
```

Until that finishes, Enter Halebridge is disabled and the card says what failed, in the danger color. The keep is drawn behind the card as soon as the board exists. You do not move until you choose Enter Halebridge or Continue.

Enter Halebridge sets `playing` and leaves you where boot put you. Continue calls the same travel used by the atlas, with the saved file and the saved point, and with no link. That skips the reciprocal-door rule, then still runs `snapLit` and `snapOpen`.

## The frame, when you are playing and not mid-travel

1. Union the keyboard set, the injected test set, and Shift if the Run button is held.
2. `axis` adds the stick and the keys. A and ArrowLeft decrease x. D and ArrowRight increase x. W and ArrowUp decrease y. S and ArrowDown increase y. If the vector is longer than 1, it is normalized. Diagonals are not faster than straight lines.
3. Rate is 4.6 tiles per second, or 9.2 while `running` sees ShiftLeft or ShiftRight.
4. `stepPosition` adds `move * rate * dt`.
5. If the door lock is clear, `linkAt` tests the new point. The smallest link that contains the point wins.
6. A hit with a resolved file calls `travel` and does not also commit the step. A hit with an unknown file shows the banner, commits the step, and locks.
7. No hit: try the new point against the type mask, unless flying. If the diagonal is blocked, keep the axis that is open (x first, then y). Commit what is open, clamped to `[0.2, 63.8]`. Out of board is blocked, so you cannot walk off the edge except through a link. If you were locked and the new cell is outside every link, the lock clears.
8. Facing follows the dominant axis. Walk phase advances at 8 per second, or 14 while sprinting.

Then the frame paints, whether or not you moved. HUD text is copied out of the ref about every 160 ms. Save is written about every 2 seconds, and again at the end of a successful travel.

## Opening a door

`travel` sets `busy`, which freezes stepping until the fetch settles. It loads the destination, paints a new board, and chooses a landing:

1. If this travel came from a link, and that link left `nx` or `ny` negative, search the destination for a link whose area is at most 12 tiles and whose destination resolves back to the file you just left. Stand in the center of that link and lock, so you do not immediately walk back through it.
2. Otherwise stand at `(nx + 0.5, ny + 0.5)` for each axis the link specified, and keep your old coordinate on an axis it left as `-1`. This path does not force the lock. The lock is set afterward if the landing cell is inside any link.
3. Atlas warps and Continue pass no link, so they stand on the requested point and lock only if that point is already inside a link.
4. `snapLit` then walks outward, Chebyshev radius up to 28, and moves you to the center of the nearest tile that is not void.
5. `snapOpen` does the same walk again, skipping tiles that are void or that `feetBlocked` refuses. Flying does not skip this. A door that opens into a wall still drops you on the nearest open cell.

A failed fetch leaves you where you were and sets the lock, so the same door does not retry every frame. The banner is the error, in the danger color.

## The type mask

Feet cell is `floor(x)`, `floor(y)`. Tile id at that cell is mapped with `sheetIndex` and looked up in the 4096-byte mask.

| Type | Meaning here | Body |
|---|---|---|
| 0 | ordinary | enter |
| 3 | chair | enter |
| 4, 5 | bed | enter |
| 6, 7 | swamp | enter |
| 8 | near water | enter |
| 11 | water | enter |
| 12 | lava | enter |
| 20 | throw-through / grate | block |
| 22 | wall | block |

Other types in the legend (2, 10, 21) also enter. Type 9 is not on this sheet. Ember3.1 does not slow you in swamp, swim you in water, or hurt you in lava. It only refuses 20 and 22. Throws are not implemented, so the throw-through distinction is unused.

Flying skips the feet test for the step. It does not skip doors, the clamp, or `snapOpen`.

## Camera

The board is 1024×1024 pixels. Zoom is 1, 2, 3, or 4, default 2, so one tile is 16, 32, 48, or 64 CSS pixels. The source window is `viewport / zoom`, centered on the player, clamped so it does not read past the board. Device pixel ratio scales the canvas backing store. Image smoothing is off.

Links, signs, NPCs, and chests are painted in viewport space on top of the board copy. The hero is painted at the player point. The joystick nub is a DOM node, moved from the stick ref.

## Input

| Control | Effect |
|---|---|
| WASD, arrows | Move. Arrows and Space are `preventDefault`'d |
| Shift, or Run | Sprint. Rate ×2 |
| Ctrl, or Fly | Toggle flying. Ignores key repeat |
| E, Space, or Read | Nearest sign, NPC, or chest within 1.6 tiles |
| Escape | Close atlas and map |
| Tiles | Upload a sheet. Rebuild void mask, repaint the current board |
| Map | Overview. Pins are labels, not warps |
| Atlas | Search the catalog, warp to 32, 32 of that file |
| + / − | Zoom 1–4 |

Focus in an input or textarea does not capture keys, so the atlas search box does not walk you. Blur clears the key set.

`window.__controlsTest` is written every playing frame: position, speed, and `setKeys` into the injected set. Yaw is always 0.

## Save

```json
{ "file": "avg-05.nw", "x": 10.5, "y": 56.5 }
```

Key is `ember31-avelan-v1`. A save whose file is not in the catalog is ignored by Continue. The title card shows Continue only if a parseable save exists.