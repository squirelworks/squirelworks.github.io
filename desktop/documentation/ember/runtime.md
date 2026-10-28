# Runtime

One `requestAnimationFrame` loop, started at the end of boot. `dt` is capped at 50 ms so a stalled tab does not fling you across the board.

## Boot

```
fetch /levels/index.json  and  /eg_tiles.png     in parallel
build the catalog and the void mask
fetch onlinestartlocal.graal
paint its board
stand at (30.5, 34.5), facing down, not yet playing
```

Until that finishes, Enter the house is disabled and the card says what failed, in the danger color. The house is drawn behind the card as soon as the board exists. You do not move until you choose Enter the house or Continue.

Enter the house sets `playing` and leaves you where boot put you. Continue calls the same travel used by the atlas, with the saved file and the saved point, and with no link. That skips the reciprocal-door rule and then still runs `snapLit`.

## The frame, when you are playing and not mid-travel

1. Union the keyboard set, the injected test set, and Shift if the Run button is held.
2. `axis` adds the stick and the keys. A and ArrowLeft decrease x. D and ArrowRight increase x. W and ArrowUp decrease y. S and ArrowDown increase y. If the vector is longer than 1, it is normalized. Diagonals are not faster than straight lines.
3. Rate is `4.6` tiles per second, or `9.2` while `running` sees ShiftLeft or ShiftRight.
4. `stepPosition` adds `move * rate * dt`.
5. If the door lock is clear, `linkAt` tests the new point.
6. A hit with a resolved file calls `travel` and does not also commit the step. A hit with an unknown file shows the banner, commits the step, and locks.
7. No hit: commit the step, clamped to `[0.2, 63.8]`. If you were locked and the new cell is outside every link, the lock clears.
8. Facing follows the dominant axis. Walk phase advances at 8 per second, or 14 while sprinting.

Then the frame paints, whether or not you moved. See [Diagrams](diagrams.md).

## Opening a door

`travel` sets `busy`, which freezes stepping until the fetch settles. It loads the destination, paints a new board, and chooses a landing:

1. If this travel came from a link, and that link left `nx` or `ny` negative, search the destination for a link whose area is at most 12 tiles and whose destination resolves back to the file you just left. Stand in the center of that link and lock, so you do not immediately walk back through it.
2. Otherwise stand at `(nx + 0.5, ny + 0.5)` for each axis the link specified, and keep your old coordinate on an axis it left as `-1`. This path does not force the lock by itself.
3. `snapLit` looks at the tile under that point. If its id is void, search outward in a square ring up to 28 tiles and stand in the center of the nearest lit tile.
4. If the final point is still inside any link, lock anyway.

The new `Live` replaces the old one. Facing is kept. The save is written immediately. A failed fetch leaves you on the old board and locks, so the door does not retry every frame.

Atlas travel and Continue pass `via = null`, so step 1 does not run. Atlas always aims at `(32.5, 32.5)`, the middle of the board, and `snapLit` pulls that onto a floor tile if the middle is void.

The house-to-overworld case is step 1. The south door does not name a reliable cell on `egk-10`, and the matching small link on `egk-10` points back at the house, so you come out on that doorstep instead of in the black margin.

## Camera

The board is 1024×1024 pixels. The view is `cssWidth / zoom` by `cssHeight / zoom` of those pixels, centered on the player, then clamped so the window stays inside the board. At the east or south edge you see the last tiles, not a band of page background. The hero is drawn at `(x * 16 - origin) * zoom`, so the clamp moves the world and the hero together.

Zoom is an integer, 1 through 4. The buttons change both the ref the frame reads and the React number the buttons display.

## Input

| Input | Effect |
|---|---|
| W A S D, arrows | Move. A is left. D is right. |
| Shift, or hold Run | Double speed, faster bob. Run is `md:hidden`, next to Read. |
| Joystick | A vector in `-1..1`, added before normalization. Hidden from `md` up. |
| E, Space, or Read | Nearest sign, NPC, or chest within 1.6 tiles. Empty signs are skipped. |
| Escape | Close the atlas. |
| Atlas row | Close the atlas, start playing, travel to that file at `(32.5, 32.5)`. |

Keys are ignored while the target is an input or a textarea, so the atlas search box does not walk you. Arrow keys and Space call `preventDefault`. Blur clears the keyboard set. The stick zeros on pointer up.

The HUD under the place name is `floor(x), floor(y)`, then the door you are standing in (`Door · Enigma K-10`), then `WASD · Shift runs` once you are playing. It refreshes when 160 ms have passed, not every frame. A load error replaces that line and turns it danger-colored.

## Save

`playerworld-v1` is `{ file, x, y }` in `localStorage`. The frame writes it every 2 seconds while `playing` is set. `travel` writes it again on success. A broken JSON value is treated as no save, and Continue is not offered.

## Actors on screen

| Thing | Mark |
|---|---|
| Link | Pale rectangle, one pixel inset |
| Sign with text | Narrow upright bar |
| NPC | Small disc |
| Chest | Square in the danger color |
| Baddy | Not drawn |

Read shows the kind, a title (the NPC image name, or "Sign", or "Chest"), and the body in a `<pre>`. NPC script text can contain the newlines the parser put back. There is no "use" and no inventory.

## Test hook

While the loop runs it sets `window.__controlsTest` to `{ getX, getY, getSpeed, getYaw, setKeys }`. `getYaw` is always 0. This is a top-down walker, not a vehicle. `setKeys` replaces an injected set that is unioned with the real keyboard. It is how the page is driven without dispatching DOM key events. It is not a public API of the drop.