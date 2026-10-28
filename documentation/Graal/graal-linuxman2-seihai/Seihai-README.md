# Seihai documentation

Seihai is a top-down adventure client. Boards are 64×64 tiles of 16 pixels. New files are `.seihai` (`SH-V1.xx`) and `.as` (`GLEVAS01`). Older `.graal` (`GR-V1.xx`) and `.nw` (`GLEVNW01`) boards still open.

The playable client lives next to this folder: `src/game/`, `src/components/graal-client.tsx`, and `src/styles.css`. These notes describe that source. They are not a second implementation.

| Document | What it covers |
|---|---|
| [Framework](framework.md) | Host stack, what Seihai itself is, and what it refuses to depend on |
| [Architecture](architecture.md) | Modules, data the engine owns, and how the screen talks to the sim |
| [Runtime](runtime.md) | Boot, the frame loop, and the order of one tick |
| [Boards](boards.md) | File pairs, header magics, tiles, and the five linked levels |
| [Systems](systems.md) | Movement, sword, bombs, arrows, push and pull, talk, shop, death, save |
| [Diagrams](diagrams.md) | The same flows as standalone charts |

Directions used everywhere: `0` south, `1` west, `2` east, `3` north. Hit points are half-hearts. Six hit points draw as three hearts.
