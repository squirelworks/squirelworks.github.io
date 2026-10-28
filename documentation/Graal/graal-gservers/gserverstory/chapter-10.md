# Chapter 10 — Ash, Which Does

Ash is the argument you can open.

Phoenix was the binary with a world moved in around it. Ash is new code, written from a comparison of the dumps, and the readme is blunt about the parentage. The protocol, the login, the encryption generations, the packet ids, the `GRACC001` accounts, the `GLEVNW01` boards, the file send, the warp: read out of TheDgtl's gs2emu. The older login and the level and NPC split: sidrax, the 1.31 linux dump, the Win32 1.39 tree, the Northwest source with its Pascal strings. The layout and the start level: copied from the Reborn binaries, because a client does not log into a class diagram. JustBurn, Matriark, and projectx were looked at and ignored. There was not enough source in them to argue with.

gs2emu was already a rewrite. The monolith became `TServer` and `TPlayer` and a thread per world. Ash is a second rewrite of that shape, in Python 3, cut down to the path a v2 client actually needs: log in, walk, talk, warp, pull files. The rest — the RC browser, the list clerk, the maps, the baddies, the trigger hacks, the NPC-Server query — lives in `extras.py`, the second week. Horses, weapon bytecode, and UPnP are still out. The readme says so, and points you back at Phoenix if you need the exact engine. Two houses, one dialect, and a written list of what the retelling refused.

---

Three files, and the mapping is the way in.

`protocol.py` is `CString` and `CEncryption` and `CFileQueue` without the header. `g_char` is `n + 32`. `g_short` is the seven-bit digits. `frame` is the naked big-endian short. `outbound_frame` is the generation switch: zlib for 3, bzip2 then encrypt for 4, a raw type byte and a size pick for 5. `inbound_unwrap` takes a `first` flag, because the first payload is zlib even when the shift will later choose generation 5. The version table at the bottom is `versions.txt` copied into a dict, `GNW28015` mapped to 40. If you want to see the costume from chapter 3 as something you could change and must not, this is the page.

`ashserver.py` is the world. `World` is `TServer`. `Player` is `TPlayer`, constructed as `PLTYPE_AWAIT`, codecs starting at generation 3 until the shift says otherwise. `handle_login` is `msgPLI_LOGIN`. `send_login_client` is the welcome. The packet dispatch is an if-elif chain where gs2emu had a 256-slot vtable. Unknown ids fall through. The corridor and the switch are the same table.

`extras.py` is the part the first login does not need. The list thread. The RC browser and the folder rights. Gmaps, bigmaps, group maps. Baddies, parsed from `BADDY` until `BADDYEND`, reset when `baddyrespawntime` has passed. Trigger actions. The NPC-Server query. A person reading Ash in order is reading the protocol in the order a client demands it, which is a better order than the header files, and a worse order than the history. The history is still on the shelf.

---

The scheduler is the disagreement you can see without a packet dump.

gs2emu gives each world a thread and then selects inside it for five milliseconds, one ear for the listen socket, the players, and the list. Ash accepts on a thread per world, hands each socket a daemon thread blocked in `recv` with a three-hundred-second timeout, runs the list on a thread of its own, and lets the main thread sleep one second and tick baddies. Same protocol, different chair for the clock. A bug that depends on two packets being handled in one select — a prop and a trigger arriving together, the broom running before the next read — will not reproduce here. A bug that depends on the bytes will. When Phoenix and Ash disagree about a client, that split is the first question. Is it the wire, or is it the day.

The street plan is the part that does not disagree. `servers.txt` with `servercount` and `server_1 = ash`. Port 14812, so it can be awake beside Phoenix's 14802. List name Ash. Description: rewritten gserver, classic v2 protocol, offline login. The same inner folders. The same start level. `staff = (Owner),YOURACCOUNT`, the same placeholder, the same `staffhead`. Groups on, the other trigger hacks off, `flaghack_movement` on. A v2 client pointed at either port is pointing at the same town plan. The clerk defaults to the same `listserver.graal.in:14900`.

Offline login is the choice the binary would not make. `offline_login` defaults to true. The account file is trusted. The grass does not wait on `SUCCESS`. If you turn it off and the list is up, Ash sends `SVO_VERIACC2` and polls for `list_verified`, and the welcome moves to the login thread instead of running inside the list handler. The word is the same. The chair is different. A night at a desk is a night Ash will open. Phoenix, on the other port, will quote the offline sentence until a clerk answers.

---

The seams are where a retelling admits it is a retelling.

gs2emu reads the account and password lengths in the login line with `readGUChar`, a gchar. Ash reads them with `read_u8`. The list reply's name length has the same split, and the Ash handler has a comment in it that is still talking to itself about which packet it is holding. Trust the C++ when a real client produces a name of the wrong length. The costume is the sort of thing a clean port "fixes," and the fix is the bug.

Ash does not join an UPnP thread, because it does not start one. The port forward is yours. It does not speak weapon bytecode. It does not keep horses. A level with a horse line will not grow a mount. The board, the links, the baddies, the signs it was willing to parse: those arrive. The rest of `TLevel`'s neighborhood is a room the rewrite has not furnished. `sendFile` exists, and the large-file path exists in the binary's sense only as far as the Python send was written. When a head fails, look at `foldersconfig.txt` before you look at the cipher. Empty asset folders are a choice both packages made, and both packages will fail the same way until you drop the client's files in `world/`.

What Ash owes you is that none of this is hidden. A generation-5 client arrives, the shift sets the codec, the key resets the iterator, and you can print the line. A baddy dies and the main thread stands it back up and you can read the comparison to `baddyrespawntime`. An RC that is not on the staff line is told it does not have RC rights, in a function you can step into. The binary does these things too. The binary does not let you watch.

---

How to use the retelling as a map:

Read `protocol.py` until the plus-thirty-two is boring. Then read `handle_login` beside `msgPLI_LOGIN`, and mark every field where the widths differ. Then read `serve_world` beside `TServer::operator()`, and notice that the five-millisecond comment has no Python equivalent, because the wait has moved into `recv`. Then read `extras.py` beside `TServerList.cpp` and `TPlayerRC.cpp` and `TPlayerNC.cpp`, and treat every missing case as a question rather than a flaw. A missing case is a page of the source you have not needed yet. The v2 path was the cut. The rest of the building is still on the shelf, waiting for a client that asks a question Ash does not answer.

Start it with `python3 ashserver.py` or `start_ash.sh`. Point the client at 14812. Rename the account file. Put the name on the staff line if you want the chair. The log will say rewritten gserver, protocol from gs2emu and the 1.3.x dumps, written again in Python 3. That sentence is the method. Comparison, then a second telling, then the places the telling had to choose.

Phoenix is what the protocol looks like compiled. Ash is what it looks like explained. Neither is the monolith, and neither is the act of reading the monolith. The next room is that act: which file to open first, which name to chase, and how not to drown in eighteen thousand lines before you have seen a login.

---

*End of chapter 10.*
