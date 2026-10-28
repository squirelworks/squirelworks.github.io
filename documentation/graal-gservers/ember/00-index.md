# /Ember/ — gserver atlas

Maps of every source dump and binary in this project. Drawn from the trees
under `graal gservers/`, the Reborn 2.4 package `/Phoenix/`, and the Python
rewrite `/Ash/`.

| File | What it is |
|---|---|
| `ATLAS.html` | Open in a browser. Mermaid architecture, flowcharts, packet maps |
| `01-lineage.md` | Dump genealogy: 1.3.x monolith → gs2emu → Phoenix → Ash |
| `02-architecture.md` | Class blueprint of TheDgtl-gs2emu and how Ash remaps it |
| `03-protocol.md` | Framing, gens 1–5, gchar packing, login, files |
| `04-algorithms.md` | Pseudocode for encryption, login, warp, listserver, RC, triggers, baddies |
| `05-blueprints.md` | On-disk world layout, account/level file formats, servers.txt |

Sources used (not copied):

- `TheDgtl-gs2emu-gserver-d3ecab4` — Reborn 2.x C++ (~18k lines)
- `sidrax-v1.4-srv-src-1.3.9`, `linuxgserver131`, `gservernwsrc`, `oldwin32-gserver1.39source`
- binaries `gserver_2.1.0` … `gserver_2.4.0`, `GServerRev29/31/51`
- `/Phoenix/` Reborn 2.4.0 package
- `/Ash/` Python rewrite
