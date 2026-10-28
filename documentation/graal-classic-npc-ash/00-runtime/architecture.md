# Client NPC runtime

Classic Graal NPCs are client-side scripts. There is no separate server VM in these files. Flags, rupees, hearts, and inventory are whatever the local client believes.

## Layers

- **Level NPC** — lives at a tile in the current `.nw` / `.graal` level. Dies when the player leaves unless copied to the weapon bar.
- **Weapon NPC** — `toweapons -Name` pins the body onto the player. `isweapon` becomes true; `weaponfired` fires on use.
- **Put-NPC** — `putnpc script.txt,x,y` spawns another body at runtime (projectiles, loot, bombs).

## Tick model

Classic does **not** give a frame callback. Scripts request the next wake-up:

```
timeout = 0.05;   // seconds → ~20 Hz while the NPC exists
```

`if (timeout)` then runs. Common rates:
- 0.05 — AI, projectiles, HUD redraw
- 0.1–0.2 — shops, menus, particle FX
- 0.5–1.0 — idle roam, crop growth
- 0 — cancel heartbeat

## Persistence & authority

- `toweapons -Name` — cross-level weapon bar persistence
- `save[n]` — old account array (treated as durable inventory / gold / flags)
- `client.*` — per-player local flags (other players do not see them)
- `showimg` / `hideimg` — image IDs; conflicts common in the 300+ band used by HUDs and shops
- Hearts, rupees, `setplayerprop`, `setcharprop` — client-visible only

## Core events

- `playerenters` / `created` — level entry
- `playertouchsme` / `playerchats` — interaction
- `timeout` — scheduled wake
- `weaponfired` / `isweapon` — weapon bar
- `keydown` — direct input

See `event-model.md` for the full dictionary and dispatch flowchart, and `state-and-ids.md` for `this.*`, `client.*`, and image ID bands.
