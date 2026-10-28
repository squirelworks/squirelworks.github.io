# Larency pack architecture

tricxta HUD / inventory / shop / lockpick / ranger systems.

## Blueprint

```mermaid
flowchart LR
  Player -->|touch / chat| Shop
  Player -->|keydown| HUD
  HUD -->|showimg| Overlay
  Inventory -->|save[]| Account
  Lockpick -->|timeout| Tumblers
  Ranger -->|timeout| Seek
```

## Live loop

HUD and inventory redraw on a 0.05–0.1 timeout. Shop opens on `playertouchsme` or chat command, draws a grid, and waits for keydown or touch to buy/sell. Lockpicking is a separate NPC that runs a tumbler state machine until success or fail.

## Algorithms

- HUD frame: allocate overlay images, draw hearts/rupees/inventory slots each tick
- Inventory grid: map `save[]` slots to showimg positions
- Shop: price lookup, buy (deduct rupees, add item), sell (reverse)
- Lockpicking: tumbler alignment check on key or timeout
- Ranger: seek nearest player or waypoint, attack when in range

See the individual files for flowcharts and pseudocode.
