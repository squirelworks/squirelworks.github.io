# 39ster 2.1 GServer — architecture

December 2006 open remake of the 1.39 Graal server, targeting Graal clients 2.*. Single-process Windows/POSIX C++ server. No script VM. No MySQL despite the readme. No `.nw` loader despite the stub.

## 1. System context

```
                    ┌────────────────────┐
   Graal 2.* player │  TCP :14822         │
   RC client        │  zlib frames        │──► win32Gserver.exe
                    └────────────────────┘
                              │
          ┌───────────────────┬──────────────────┐
          ▼                   ▼                   ▼
   data/** (maps,gifs)   accounts/<name>     Weapons.txt
   resolved by subdirs   save is a stub      INI catalog
```

External actors:

- **CLIENTPLAYER (0)** — game client. Login packet carries a scramble `key`. Every later inbound line drops one byte via LCG.
- **CLIENTRC (1)** — Remote Control client. Same framing, **no** scramble. RC opcodes 51–87 exist in the table; bodies are empty stubs.
- Filesystem only. Readme promised MySQL credentials; `loadAccount` hard-codes spawn.

## 2. Process and thread model

Two threads, shared heaps, no locks.

```
 main thread                         PlayerThread (CreateThread)
 ───────────                         ──────────────────────────
 WSAStartup / listen(14822)          while true:
 getSubDirs("data/")                   for p in playerList:
 LoadWeapons()                           p.mainLoop()
 loop every 1000 ms:                     if p.deleteme: delete p
   accept → newUsers                     Sleep(20)
   for p in newUsers: p.mainLoop()
   idle-kick playerList if nodatacount>300
   for map in LoadedMaps: animate()
   Sleep(1000)
   gameTime++
```

Implications:

- Handshake lives on the **1 Hz** main loop (`newUsers`). After `initialize` succeeds the player is moved to `playerList` and serviced at ~50 Hz.
- `CLevel::LoadedMaps`, `playerList`, `npcIds`, `weaponList` are unsynchronized globals.
- `tcpReceive` is non-blocking (`FIONBIO`) and drains until `WSAEWOULDBLOCK`.

## 3. Module blueprint

```
includes.h     platform includes
main.cpp/.h    listen, accept, idle kick, weapons INI, path walk
sockets.cpp/.h TCP listen/accept/recv/send wrappers
tools.cpp/.h   CList, CBuffer (GCHAR +32 / 7-bit), CStringList
ini.cpp/.h     Weapons.txt reader
player.cpp/.h  session, framing, scramble, opcode table, props, warp
level.cpp/.h   GR-V1 bitstream, links/baddies/npcs/chests/signs, animate
npc.cpp/.h     CNpc prop codec + CNpcWeapon catalog entry
zlib.h         vendored compressor
```

Ownership of global lists (`main.h`):

| List | Holds | Lifetime |
|---|---|---|
| `playerList` | logged-in `CPlayer*` | until disconnect / idle 300s |
| `newUsers` | accepted, not yet initialized | until login or `deleteme` |
| `playerIds` | slot table, holes kept as NULL | 0..n-1, reused |
| `subdirs` | recursive `data/` paths | process |
| `weaponList` | `CNpcWeapon*` | process + `Weapons.txt` |
| `CLevel::LoadedMaps` | every opened map, never unloaded | process |
| `npcIds` | every `CNpc*`, holes as NULL | process |

## 4. Class graph

```
CPlayer
  sock, key, iterator=0x04A80B38, id, type
  sendbuff → zlib → outgoing
  level : CLevel*
  enteredLevels : CEnteredLevel{level, time}
  openChests : COpenedChest{x,y,level}
  fileList, weaponSend, myWeapons
  msgFuncs[89]  →  msgLEVELWARP … msgEMPTY89

CLevel
  tiles[64*64] : short
  baddyids[256]
  links, boardchanges, baddies, npcs, players
  horses, chests, items, signs
  OpenMap(name)  cache-or-construct
  LoadGraal / LoadNW (NW body commented out)
  changeBoard / updateTiles / animate

CBaddy          id, x,y,type,mode,verses[3], power, respawn
CNpc            id, x,y, image, clientcode, saves[10], modtime[35]
CNpcWeapon      name, image, modtime, senddata
CLink           map, x,y,w,h, warpx, warpy
CBoardChange    x,y,w,h, data, previous, counter
CHorse / CChest / CItem
CBuffer / CList / CStringList / CIniReader
```

## 5. Packet pipeline (one TCP stream)

```
recv bytes
  └─ while ≥ 2:
       u16 BE length = raw (readchar, NOT GCHAR)
       zlib-inflate next `length` bytes
       split inflated payload on 0x0A
         first line ever → initialize()   [no scramble]
         later lines     → parseMessage()
                             PLAYER: drop LCG byte, then opcode
                             RC:     opcode as-is
                           msgFuncs[opcode](rest)

outbound:
  SendPacket(buf) appends buf + '\n' into sendbuff
  if sendbuff ≥ 4096 or flush: zlib-compress, prefix u16 BE
  Sendoutgoing() writes outgoing in 1024-byte slices
```

File blobs are not the named enum. They are raw server bytes **100** (declared length) and **102** (mtime + name + body). Board tiles use **101** after a 100-header of `2 + 64*64*2`.

## 6. Level world model

A level is a 64×64 board of 16-bit tile indices plus five text/binary sections after the bitstream:

1. Links — space-separated `map x y w h [warpx warpy]`, skipped if target file missing
2. Baddies — raw `x,y,type` bytes then `verse0\verse1\verse2`, terminated by `x < 0`
3. NPCs — `x y image#script…`
4. Chests — `x y item signindex`
5. Signs — remaining newline strings

`OpenMap` never evicts. `animate()` on the 1 Hz tick:

- board-change undo when `counter` hits 0 (2×2 changes last 20 ticks)
- horse / item despawn packets
- baddy `DIE` → after 60 ticks `Reset()` and `SBADDYPROPS` blast

Leader: first player in `level->players` gets `ISLEADER`. On leave, slot 1 is promoted.

## 7. Account model (as written)

`loadAccount(pass)` ignores the password and writes:

```
x=y=32, level13.graal, nickname=Unknown, head0.png
rupees=999, arrows=10, bombs=99, hearts 3/3
glove/sword/shield=3, bombpower=77
```

`saveAccount` opens `accounts/<accountname>` and writes an **empty** `CBuffer`. Credentials were supposed to come from MySQL. Duplicate-login rule: if the existing session has `nodatacount > 30`, kick it; else reject the newcomer.

## 8. What is implemented vs stub

| Area | Status in 2.1 |
|---|---|
| TCP + zlib + scramble | working |
| Login / id / self+other props | working |
| GR-V1.01/02/03 tile decode | working |
| Warp + tile/link/sign/chest/npc/baddy send | working |
| WANTGIF + ops 100/102 | working |
| Board modify relay + 2×2 revert | working (tiles array not actually rewritten — see ALGORITHMS) |
| Bomb add relay | working (coords not re-encoded) |
| Baddy prop relay + DIE respawn | working |
| Open chest memory | working (per-player list) |
| Default + NPC weapons | partial (`bomb`,`bow` queued at construct; `ADDWEAPON2` writes Weapons.txt) |
| Chat / privmsg / flags / extras / arrows / horses / hurt | empty handlers |
| RC account editor 70–87 | empty handlers |
| `.nw` maps | constructor detects `.nw`, does not parse |
| Script VM | none — NPC `clientcode` is forwarded as a blob |

## 9. Compatibility contract for any rewrite

- Opcode integers in `player.h` stay frozen.
- GCHAR (`+32`, 7-bit groups) is the numeric wire codec. `writechar` / `readchar` are the raw escape hatch (frame length, raw tile shorts).
- PLAYER scramble is one deleted byte per **line**, iterator starts `0x04A80B38`, multiplier `0x8088405`.
- Tile send and file send (100/101/102) sit outside the named server enum and are still part of the client contract.
- Do not invent a GS2 VM on top of this tree until the relay layer is solid — that is GServer-v2 territory.
