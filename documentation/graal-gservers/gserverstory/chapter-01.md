# Chapter 1 — The Room With Many Engines

The client is the part people remember.

It is the window with the grass tiles and the little body, the hearts in the corner, the chat line that scrolls when someone speaks. The server is the thing that answers when the window asks. For a long time the server was one program, written by the people who made the client, and then it was not. The copies that survived are not one engine. They are a room of them.

The oldest one that is still source is a single file. In the linuxgserver131 tree the file is `gserver.cpp`. It is about nine thousand lines if you count the zlib headers that rode along with it. It listens on one socket. It has one world. The login, the movement, the chat, the levels and the NPCs all live in that one translation unit or in the helpers that sit next to it. The strings on the wire are Pascal strings: a length byte and then the bytes. The encryption, when it is on, is the third generation: a dummy byte inserted by a linear congruential generator, then zlib. Accounts are often in MySQL, or they are flat files. There is no `servers.txt`. There is no RC as a separate player type. There is no NPC-Server. The process is the world.

The next ones that are still source are the 1.3.9 trees. sidrax-v1.4-srv-src-1.3.9 and the oldwin32 one. They still have `gserver.cpp`, but the levels have moved to `levels.cpp` and the NPCs to `npcs.cpp`. The MySQL path is still there. The line count is around thirteen thousand. The shape is the same: one listen, one world, Pascal strings, gen-3 encryption at most.

Then there is gservernwsrc. It is the NW era. The objects are there. The strings are still Pascal. It is the bridge.

The rewrite is TheDgtl-gs2emu-gserver-d3ecab4. This is the Reborn 2.x engine. It is about eighteen thousand lines of server source. It is no longer a monolith. There is `TServer`, `TPlayer`, `TAccount`, `TLevel`, `TMap`, `TLevelBaddy`, `TServerList`, `CEncryption`, `CFileQueue`. There is `servers.txt` that names N worlds and runs them in one process, one thread per world. The player is a typed object. The login packet carries a type byte that chooses the encryption generation: 3 for the old clients, 4 for 2.19–2.21, 5 for 2.22 and later. Accounts are `GRACC001` text files. Levels are `GLEVNW01`. There is an RC file browser. There is a listserver. There is an optional NPC-Server. There are trigger-action hacks that let a script say `gr.addweapon` and have the server do it.

The binaries that ship that engine are the gserver_2.1.0 through gserver_2.4.0 packages, and the GServerRev29, 31 and 51 packages that are the 2.17 line. Phoenix is a config-only package of the 2.4.0 binary. It listens on port 14802. The world is `servers/phoenix`. Ash is a new Python program that speaks the same protocol and uses the same on-disk layout. It listens on 14812. The world is `servers/ash`.

That is the room. The atlas that maps it is Ember. The story that walks it starts here.
