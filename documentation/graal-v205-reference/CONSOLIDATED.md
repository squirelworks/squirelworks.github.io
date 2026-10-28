# Graal Analysis — consolidated notes

Date: 2026-10-14, revised 2026-10-22

Cleaned notes derived from public server sources (GServer-v2, gs2lib, graal-serverlist, OpenGS1), observed packet shapes, format documentation, and behavior observed in client 2.05 rev 2. No decompile material.

## Formats

### Levels
- **GLEVNW01** (`.nw`) — text format. Header, `BOARD x y width layer tiledata` (2-char base64 tiles), `NPC` blocks, `LINK`/`SIGN`/`CHEST`/`BADDY` records.
- **GR-V1** (`.graal`) — binary format. 8-byte magic, then a 12-bit (1.00, 1.01) or 13-bit (1.02, 1.03) LSB-first tile bit stream with RLE and double-RLE control codes, then text sections for links, baddies, NPCs (`image#script`), chests, and signs. See `formats/level-binary.md`.
- **Z3-V1** (`.zelda`) — earlier binary. RLE board (11-bit for 1.02, 12-bit for 1.03/1.04). FileLink records until `#`, then binary computer records and coded signs. No NPCs or chests. Seihai loads the board; trailing records are not yet parsed.

### Tiles
- Tile id is a 12-bit value decoded from the 2-char base64 encoding into `pics1`.
- Collision table is 4096 bytes. Wall is `>= 20` (blocks). Water is `== 11` (does not block, changes display).
- `arrays.dat` first array is the passable-tile list (`nowall`). Tiles in that list get type 0; everything else gets type 22.
- Stamp id 0 is a 4×4 ground fill. Stamp id 1 is a hole and is not written. The 2×2 Bush stamp writes ids 2, 3, 18, 19.

### GANI
- `SPRITE`/`ANI`/`ANIEND`/`PLAYSOUND`/`DEFAULTATTR` blocks.
- `ANI` carries placements. A stepper advances the frame index.

### Maps
- **GRMAP001** (`.gmap`) — world map linking levels. Reader keys are in `formats/gmap.md`. 2.05 rev 2 has the `GRMAP001` string and a reader, but no static caller was found; its active path is `bigmap.txt`/`minimap.txt`.

## Protocol

### Framing
- Frame = u16be length + zlib body (zlib 1.1.2 in 2.05). Message = GCHAR id + payload + `\n`. Binary payloads go behind `PLO_RAWDATA` (100).
- **2.05 = gs2lib gen 3:** the client inserts one byte per message from the second message on. The iterator is seeded `0x04A80B38` and stepped `it = it*0x08088405 + key`. The byte `((it>>16)&0x7F)+0x20` goes in at 1-based position `(it&0xFFFF) % len + 1`, which can be 1 (before the id byte). Only the login line is clean. Server→client is plain zlib. The insertion is applied per message before the buffer is compressed.
- Full-frame partial XOR with the same LCG is gen 4/5 (2.19+ clients), not 2.05. See `protocol/codec-and-framing.md`.

### Login
- First line: GCHAR client type (0) + GCHAR key (`rand & 0x7F`, the old "random prefix") + `GNW#####` + GSTRING account + GSTRING password. Then `PLI_LANGUAGE` (37).
- Observed tokens: `GNW28015`, `GNW22122`, `GNW03014`, `GNW07080`, `GNW30123`.
- `GNW07080` = 1.39. `GNW03081` = 2.05 rev 2 (CLVER_2_052, pre-2.1 paths). `GNW22122` = 2.17, `GNW03014` = 2.22, `GNW28015` = 2.31. `GNW30123` is the 2.22/2.31 listserver token (see `protocol/client-versions.md`).

### Movement
- The short frames headed wire `"` are `PLI_PLAYERPROPS` (2) prop streams: 15 X, 16 Y, 17 SPRITE (GCHAR, half-tiles). Not f32.
- Position codecs: classic ×2 (props 15/16), precise ×16 (props 78/79, newer clients).
- Directions: 0 up, 1 left, 2 down, 3 right (corrected).

### Board
- `PLO_BOARDMODIFY` (7) / `PLI_BOARDMODIFY` (1): GCHAR x, y, w, h + w×h GSHORT tiles. `PLO_BOARDPACKET` (101, behind RAWDATA) = 4096 raw LE u16.
- Packet ids are settled: the 2.05 receive jump table matches gs2lib `PLO_*` 0–25, 27–48, 75, 100, 150, 151, 153–156, 165, 166, 168. Client senders cover 0–38 (minus 6, 25, 31), 80, 81. See `protocol/packet-ids.md`.

## NPC scripting

3,172 unique scripts scraped from 1,420 GR-V1 levels. Stored in `npc-library/npcs.json`. The scrape reported 3,187; 15 records were lost to truncated source pages (see `partial_pages` in `npcs.json` meta).

### Common events (by frequency)
| Event | Scripts |
|-------|--------:|
| `playerenters` | 2,268 |
| `playertouchsme` | 1,986 |
| `timeout` | 1,456 |
| `playerendsreading` | 1,123 |
| `compusdied` | 1,122 |
| `playertouchsother` | 1,074 |
| `wasshot` | 728 |
| `playersays` | 43 |

### Script shape
Scripts follow `image.gif#if (event) { body }`. Common commands: `hide`, `show`, `set`, `unset`, `say`, `setlevel`, `warp`, `hurt`. The 2.05 tables (161 commands, op = 600 + index, 600–760; 177 functions/vars) are in `npc-library/gs1-reference-205.md`.

### GS1 bytecode
The 2.05 client does **not** use bytecode. It parses script text into a tree and interprets that recursively. The OpenGS1 opcodes below belong to Seihai's own VM, a reimplementation.

Opcodes match OpenGS1: Push, Assign, ArrSet/Get, Add/Sub/Mul/Div/Mod/Pow, Inc/Dec, Call/CmdCall, Jmp/Jal/Ret, Eq/Lt/Gt/Lte/Gte, Not/And/Or, Jez/Jnz, Stop, DbgOut. Arithmetic, comparison, and jump execute. Call and array ops are no-ops until the command set is wired.

## Offline play

A local session can:
1. Load a GLEVNW01 `.nw`.
2. Decode tile ids and apply board modifies.
3. Reject moves onto wall tiles. Track water without blocking.
4. Parse LINK/SIGN/BADDY/CHEST. Decode binary sign text.
5. Step an optional walk GANI on every successful move.
6. Draw an ASCII or PPM view of the board and player.

## Version map

| Token | Build |
|-------|-------|
| `GNW07080` | 1.39 |
| `GNW03081` | 2.05 |
| `GNW22122` | 2.17 |
| `GNW28015` | 2.31 |
| `GNW03014` | 2.22 |
| `GNW30123` | 2.22/2.31 listserver token |

Filename builds: `Graal_2171` = 2.171, `Graal_222` = 2.22, `Graal_231` = 2.31. PE FileVersion is authoritative for editors.

## Precursor

Zelda Online (1997–98, Stefan Knorr) is the Java precursor. AWT applet client/server on port 14801, text-line lobby protocol, `.zelda` levels. Source is archived separately. Levels were analyzed and discarded.

## Reference notes added 2026-10-21

- `protocol/codec-and-framing.md`: G-types, frames, raw-data escape, encryption gens 1–6.
- `protocol/packet-ids.md`: full PLI/PLO tables with 2.05 coverage.
- `protocol/packet-layouts.md`: level, player, combat, navigation, and weapon payloads.
- `protocol/player-props.md`: PLPROP, NPCPROP, and BDPROP ids and encodings.
- `protocol/file-transfer.md`, `protocol/chat-pm-rc.md`, `protocol/listserver.md`, `protocol/udp-p2p.md` (2.05 peer UDP).
- `formats/level-binary.md`, `formats/gmap.md`.
- `npc-library/gs1-reference-205.md`, `client-internals/client-architecture-205.md`.
