# Ember3.1 documentation

Asked for as Ember3.3. The project has no Ember3.3 tree, and Ember3 itself was never in the drop. This set describes the walker that is on disk: `artifacts/Ember3.1`. The title card, the HUD eyebrow, and the save key all say 3.1 (`ember31-avelan-v1`).

Ember3.1 is a top-down walker for Avelan. It is a React page plus four modules. It does not run NPC scripts, fight baddies, or open a socket. You walk, walls stop you, doors load the next file, and E reads whatever is standing nearby.

| Document | What it covers |
|---|---|
| [Framework](framework.md) | Host, files it fetches, what it deliberately does not do |
| [Architecture](architecture.md) | Modules, the live record, who owns each job |
| [Levels](levels.md) | `.nw` and `.graal` bytes, tiles, links, the Avelan grid |
| [Runtime](runtime.md) | Boot, the frame, doors, the mask, fly, save, the camera |
| [Diagrams](diagrams.md) | The same system as flowcharts |
| [Pseudocode](pseudocode.md) | Boot, the frame, travel, and the mask, in one place |

The short drop-in note is still [../README.md](../README.md). The pics1 type mask it loads is the tiledef plugin at `artifacts/tiledef`. Art sheets (`em_tiles.png` and later) are uploads; they are not compiled into the page.