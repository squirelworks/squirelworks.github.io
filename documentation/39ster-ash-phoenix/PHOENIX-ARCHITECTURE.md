# Phoenix — file-by-file map of 39ster 2.1, and what replaces it

Source of truth for protocol:  
`39sters-2.1-Gserver/39ster's 2.1 Gserver/win32Gserver/`

Phoenix lives in `artifacts/Phoenix`. The 2006 tree is a museum. Do not edit it.

## Wire format (do not “clean up”)

1. TCP, default port **14822**.
2. Frame = `uint16 big-endian compressed length` + zlib payload.
3. Inflated payload is one or more messages separated by `0x0A` (`\n`).
4. First message after connect is **not** scrambled. Layout:

   `type:u8 [key:u8 if PLAYER] version:7or8bytes mystery:u8 namelen:u8 name passlen:u8 pass`

5. Later PLAYER messages: drop one byte using

   ```
   iterator starts at 0x04A80B38
   iterator = iterator * 0x8088405 + key
   pos = (iterator & 0xFFFF) % count + 1
   delete byte at index pos-1
   ```

   RC clients skip this.
6. Outgoing: append `\n`, zlib-compress when buffer ≥ 4KiB or on flush, prefix 2-byte BE length.

## 2006 files → Phoenix

| Old file | Lines | Owns | Phoenix |
|---|---|---|---|
| `includes.h` | 6 | WIN32 vs POSIX includes | `CMakeLists.txt` defs `PHOENIX_WINDOWS` / `PHOENIX_POSIX` |
| `main.cpp` / `main.h` | 258 / 36 | port 14822, listen loop 1s tick, `playerList`/`newUsers`/`playerIds`, `getSubDirs`/`getDataFile`, weapons INI, idle kick 300s, `gameTime++` | `src/main.cpp`, `src/server.cpp` (50ms tick) |
| `sockets.cpp` / `.h` | 111 / 14 | listen/accept/nonblock/recv-append/send | `src/net.cpp` |
| `tools.cpp` / `.h` | 465 / 85 | `CList`, `CBuffer` (writebyte3/5), `CStringList` | `src/buffer.cpp` (`std::vector`) |
| `ini.cpp` / `.h` | 94 / 30 | Weapons.txt reader | later `src/ini.cpp` — not in v0 |
| `player.h` | 422 | client/server opcodes, player props, RC opcodes, `CPlayer` | `include/phoenix/protocol.hpp`, `player.hpp` |
| `player.cpp` | 1401 | packet table `msgFuncs[89]`, scramble, login, warp, file send (ops 100/102), weapons, account stub | `src/player.cpp` — login + props + chat stub |
| `level.cpp` / `.h` | 451 / 111 | GR-V1.01/02/03 bitstream tiles 64×64, links, baddies, npcs, chests, signs, animate | `src/level.cpp` — GR-V1 tile decode + stub NW |
| `npc.cpp` / `.h` | 175 / 71 | NPC props 0–34, weapons (`CNpcWeapon`) | not yet (next) |
| `zlib.h` / `zconf.h` | vendored | compression | system `ZLIB::ZLIB` |

## Where packets are parsed (old)

- Framing + zlib: `CPlayer::mainLoop`
- First packet: `CPlayer::initialize`
- Later: `CPlayer::parseMessage` → `msgFuncs[opcode]`
- File push: `sendFiles` uses server ops **100** (length) and **102** (modtime + name + blob)
- Board tiles: op **101** raw `short[64*64]` after a 100-length header
- Accounts: `loadAccount` / `saveAccount` — **stub** in 2.1 (`x=y=32`, `level13.graal`, 999 rupees). Readme promised MySQL; it was never wired in this drop.

## Where accounts were supposed to live

- Runtime state files: `debug/accounts/<name>`
- Credentials: MySQL (readme only)
- Weapons catalog: `Weapons.txt` next to the binary

Phoenix v0 accepts any password and does not persist. Next milestone: `accounts/<name>.txt` with a version byte.

## Runtime layout Phoenix expects

```
Phoenix/
  phoenix            # binary
  data/              # levels, gifs, ganis (not in git if huge)
  accounts/          # saved characters
  docs/ARCHITECTURE.md
```

Point `data/` at a copy or symlink of the 2.1 `debug/data` tree when you want real maps.

## Rebuild order (what “done” means)

1. **v0 (this tree)** — listen, zlib frames, login, self props, empty/stub board, chat broadcast.
2. **v1** — full GR-V1 load (links, baddies, chests, signs, NPCs), warp, other-player props.
3. **v2** — WANTGIF / file serve, default weapons, account save/load.
4. **v3** — board modify, bombs/arrows/horses, hurt, flags.
5. **v4** — RC client, admin packets.
6. Only then: GS2 script VM (that is GServer-v2 territory; do not invent a VM in this tree until v3 is solid).

## Compatibility rules

- Opcode numbers in `protocol.hpp` stay frozen to `player.h`.
- Do not reuse EMPTY slots for new meaning without a version handshake.
- Tile send and file send opcodes 100/101/102 are part of the client contract even though they sit outside the named enum.
