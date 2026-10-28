# Architecture

## Process model (gs2emu)

```
main()
  load servers.txt
  for i in 1..servercount:
      TServer(name = server_i)
      TServer.init(ip, port, localip, interface overrides)
      boost::thread(*server)          # one thread per world
  join all threads
```

`TServer::doMain` is the world loop:

1. If the calendar second flipped, `doTimedEvents`.
2. Socket manager wait (select) on:
   - listen socket
   - every TPlayer
   - listserver socket
3. Accept → `new TPlayer(sock)`, type `PLTYPE_AWAIT`.
4. Recv → player `doMain` (frame decode + parsePacket).
5. Send → `CFileQueue` drain.

Timed events (once per second):

- listserver ping (30s) and player sync (300s)
- each player: AP tick, inactivity, account save (300s), timeout (300s no data)
- each loaded level: horses expire, baddies respawn, board-change GC
- singleplayer level clones owned by a player

## Object roles

| Object | Owns | Notes |
|---|---|---|
| TServer | worlds of players, levels, maps, weapons, flags, filesystems | one per `servers.txt` slot |
| TPlayer | socket, codecs, account fields, current TLevel* | also *is* the RC and the NPC-Server |
| TAccount | GRACC001 field set | TPlayer inherits / embeds this in gs2emu |
| TLevel | 64×64 tiles, links, signs, chests, horses, baddies, NPCs | cached in server.levelList |
| TMap | name → (gx, gy) | BIGMAP txt rows or GMAP LEVELNAMES block |
| TServerList | one TCP client to listip:listport | newline packets, no zlib |
| CFileSystem[n] | foldersconfig globs | separate indexes for head/body/level/file |
| CFileQueue | outbound coalescing | compress + encrypt + length prefix |
| CEncryption | gen, key, iterator, limit | inbound and outbound are separate instances |

## Player types

Login packet: `type = 1 << gchar`.

| Shift | Flag | Wire gen |
|---|---|---|
| 0 | PLTYPE_CLIENT | 3 |
| 1 | PLTYPE_RC | 3 |
| 2 | PLTYPE_NPCSERVER | 3 |
| 4 | PLTYPE_CLIENT2 (2.19–2.21) | 4 |
| 5 | PLTYPE_CLIENT3 (2.22+) | 5 |
| 6 | PLTYPE_RC2 | 5 |

`PLTYPE_AWAIT = -1` until that packet is parsed.

## Packet dispatch

gs2emu builds a 256-slot vtable `TPLFunc[id] = &TPlayer::msgPLI_*`.
Unknown ids hit `msgPLI_NULL` (usually ignored, sometimes counted as invalid).

Ash does the same with an if/elif chain in `Player.handle_packet`.

## Filesystems

`foldersconfig.txt` lines:

```
head    heads/*
body    bodies/*.png
level   *.nw
file    ganis/*.gani
```

`CFileSystem::find(name)` walks the matching index, case-insensitive.
`PLI_WANTFILE` / `PLI_UPDATEFILE` use that find, then `PLO_FILE` with gint5
modtime + pstring name + bytes. Files &gt; 32KB use `PLO_LARGEFILESTART/SIZE/END`.
Clients before 2.1 omit modtime. Clients before 2.14 cannot take large files.

## Rights

Account `LOCALRIGHTS` is a bitfield (`PLPERM_*` in TAccount.h).
RC options, folder writes, disconnect, NPC control all test bits.
`staff=` in serveroptions.txt is a separate name list that gates RC login
together with `IPRANGE`.

## Ash threading

Different from gs2emu:

```
accept-thread per World
  accept
  spawn daemon thread → Player.loop
    recv, drain frames, handle packets
listserver thread
  connect / hello / pump SVI_* / ping
main thread
  tick_baddies once a second
```

Same protocol, different scheduler.
