# State and image IDs

## Namespaces

- `this.*` — per-NPC instance (dies with the NPC or when the level unloads)
- `client.*` — per-player, persists across levels on this client only
- `save[n]` — old account array; treated as durable inventory, gold, flags
- `server.` — not present in these client scripts

## Common `this` fields

- `this.x` / `this.y` — tile position
- `this.dir` — facing
- `this.hp` / `this.state` — AI state machine
- `this.img` — allocated showimg ID

## Image ID bands (observed)

| Band | Typical use |
|---|---|
| 0–99 | level props, signs |
| 100–299 | player overlays, weapons |
| 300–499 | HUD, shops, menus (high conflict) |
| 500+ | FX, particles, temporary |

## Safe overlay allocate / teardown

```
// allocate
if (!this.img) {
  this.img = nextfreeimg();
  showimg this.img, x, y, sprite;
}
// teardown
if (this.img) {
  hideimg this.img;
  this.img = 0;
}
```

Gotcha: many scripts hard-code image numbers in the 300 band and collide when two HUDs or a shop and a HUD are open at once.
