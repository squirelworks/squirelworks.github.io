# Lineage of the dumps

## What is actually source

| Tree | Era | Shape | Lines (approx) |
|---|---|---|---|
| `linuxgserver131` | 1.31 | `gserver.cpp` monolith + GC headers | ~9k with zlib headers |
| `sidrax-v1.4-srv-src-1.3.9` | 1.3.9 | `gserver.cpp` + `levels.cpp` + `npcs.cpp` + MySQL | ~13k |
| `oldwin32-gserver1.39source` | 1.39 | same family, Win32 | similar |
| `gservernwsrc` | NW / 1.4-ish | objects + pascal strings | medium |
| `TheDgtl-gs2emu-gserver-d3ecab4` | Reborn 2.x | T* classes, premake, miniupnpc/zlib/bzip2 vendored | ~18k server/src |

## What is binary / world only

| Tree | Notes |
|---|---|
| `gserver_2.1.0`, `2.2.0-fix`, `2.3.1`, `2.4.0` | Reborn binaries + default worlds |
| `GServerRev29/31/51` | 2.17-line packaged servers |
| `gserver-134-win32`, `unlgserv119` | old exe + accounts |
| `JustBurn`, `Matriark`, `projectx` | worlds or incomplete trees |
| `/Phoenix/` | Reborn **2.4.0** `gserver2.exe`, world `servers/phoenix`, port **14802** |
| `/Ash/` | Python rewrite of the gs2emu protocol, world `servers/ash`, port **14812** |

## What changed between eras

1. **1.3.x monolith**
   - One listen socket, one world.
   - Login + movement + chat live in `gserver.cpp`.
   - Levels and NPCs split out later (`levels.cpp`, `npcs.cpp`).
   - Strings are Pascal (`length byte + bytes`) via `pascalstrings.cpp`.
   - Accounts often MySQL (`graal_mysql.cpp` in sidrax) or flat files.
   - Encryption is gen 3 at most (dummy-byte + zlib).

2. **gs2emu / Reborn 2.x**
   - `servers.txt` runs N worlds in one process.
   - Player is a typed object: client, RC, NPC-Server.
   - Encryption gens 3, 4, 5 keyed off login type byte.
   - File-backed `GRACC001` accounts, `GLEVNW01` levels.
   - RC file browser and option editors.
   - Listserver protocol (`SVO_*` / `SVI_*`).
   - Optional NPC-Server process.
   - Trigger-action “hacks” (`gr.addweapon`, …).

3. **Phoenix**
   - No source. Same engine as `gserver_2.4.0`.
   - Config-only package: staff, allowed versions 2.1.7–2.3.1, offline-friendly options.

4. **Ash**
   - New code. Same on-disk layout and wire protocol.
   - `protocol.py` = CString + CEncryption + CFileQueue.
   - `ashserver.py` = TServer + TPlayer + TAccount + TLevel.
   - `extras.py` = TServerList + TPlayerRC + TMap + TLevelBaddy + triggers + NC.
