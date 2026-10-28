# Chapter 1 — The Room With Many Engines

The client is the part people remember.

It is the window with the grass tiles and the little body, the hearts in the corner, the chat line that scrolls when someone in another town says something cruel or kind. The versions that stayed in the hands longest were the v2 clients, the ones from before the later official shapes. A person who grew up on those can still feel the difference in the feet: how a step landed, how a warp popped, how a level name arrived as a string and the board arrived as a square of tiles. The client is what you held. It is not what this room is about.

The room is about the thing that answered.

Somewhere, on a machine that did not have to look like a game at all, a process sat on a port and waited. When the client spoke, the process spoke back. When the client asked for a head image, the process found a file. When the client stepped onto a link, the process decided which level came next and who else was already standing in it. That process is a gserver. Everything else in the folder — the cute names, the staff lists, the start level called `onlinestartlocal.nw` — is furniture arranged around that wait.

You come into the archive at night because the folder is finally all in one place. The shelves are not chronological in the way a library would like. They are chronological in the way a hard drive is: whoever dumped a tree dumped a tree, and the labels are whatever the archive happened to be called.

On the low shelf, `linuxgserver131`. Beside it `sidrax-v1.4-srv-src-1.3.9`, `oldwin32-gserver1.39source`, `gservernwsrc`. These are source. You can open them. A little higher, the boxes that do not open into sentences: `gserver_2.1.0`, `gserver_2.2.0-fix`, `gserver_2.3.1`, `gserver_2.4.0`, and the packaged revisions `GServerRev29`, `GServerRev31`, `GServerRev51`. Those are engines wearing worlds. On a table by the door, two things that were built out of the shelves rather than dumped onto them. Phoenix, which is the 2.4.0 binary dressed as a world named Phoenix, listening on 14802, willing to speak to classic clients from 2.1.7 through 2.3.1. Ash, which is new code, Python, a world named ash, port 14812, written so that the same clients can log in without the binary. On the wall, pinned with tape, the maps from Ember: lineage, architecture, protocol, algorithms, the on-disk blueprint. The maps are not the engines. They are how you keep from getting lost between them.

You do not start with the maps. You start with the oldest habit in the room, because every later engine is an argument with it.

---

The 1.3.x servers were monoliths, and the word is not an insult. It is a shape.

`linuxgserver131` is a listen socket and a world, living together in `gserver.cpp`, with `pascalstrings.cpp` beside it and the usual zlib borrowed in to squeeze the bytes. Sidrax, a little later at 1.3.9, has started to let the world breathe into other files — `levels.cpp`, `npcs.cpp` — and has a MySQL door for accounts in `graal_mysql.cpp`. The Win32 1.39 tree is the same family with different manners. `gservernwsrc` carries the Northwest habit of objects and Pascal strings. None of them, if you stand in the doorway and listen, is running five worlds at once. One process, one world, one town. Login, movement, and chat still know each other's names because they grew up in the same file.

Strings on those servers were Pascal strings: a length byte, then the bytes. Not a C string hoping for a zero. Not yet the Graal packed integer that later code would become famous for. Encryption, when it was there, stopped at what the later engineers would call generation 3 — a dummy byte and zlib, the costume of secrecy more than the lock. Accounts were wherever the operator had put them. Sometimes a database. Sometimes a flat file dropped in a folder, the old habit of "put it in world/ and the server will notice."

If you only ever played, you would not feel this shape. The client did not care that the server was one file. It cared that a login line went out and a level came back. The shape matters only when you are trying to read the machine. In a monolith, the story of a step is a scroll. You find the accept, then you find the read, then you find a switch on a packet id, and the level code is a function call away, sometimes in the same morning of reading. That is the gift of 1.31. It is also why people outgrew it. A file that knows everything becomes a file you are afraid to touch.

You put a hand on `gserver.cpp` and do not open it yet. Opening it is a later chapter. Tonight you only need to know what kind of animal it is: one ear, one world, the game loop and the protocol still sharing a kitchen.

---

The rewrite already happened once, before anyone in this archive wrote Ash.

It is on the middle shelf under the name TheDgtl's gs2emu, a Reborn 2.x tree, on the order of eighteen thousand lines once you stop counting the vendored miniupnpc and the compression libraries. The people whose names ride with that engine — Joey, Nalin, and before them 39ster, and around them Agret, Beholder, Marlon, Pac — did the thing the monolith was asking for. They picked the town up out of `gserver.cpp` and set it down as types.

`TServer` is the world. `TPlayer` is the socket that has become a person, or a staff client, or another process pretending to be a person. `TAccount` is the field set that begins with the magic `GRACC001`. `TLevel` is the sixty-four by sixty-four board, plus the links and signs and chests and horses and baddies that live on it. `TMap` is the argument that some levels are not islands but cells in a larger grid. `CString` is how integers and text are pushed onto the wire. `CEncryption` is the lock, and it is no longer one lock: generations 3, 4, and 5, chosen by the type byte of the login. `CFileQueue` is the courtesy of not sending every tiny packet alone. `CFileSystem` is the index behind `foldersconfig.txt`, so that a request for a head does not become a walk of the whole disk in a panic.

The sentence that changes the building is in `servers.txt`.

`servercount` can be more than one. Each `server_i` is a directory under `servers/`. The process loads the file, and for each name it constructs a `TServer`, calls `init` with whatever address and port the line overrides, and gives that world a thread. Then it waits on all of them. One binary, many towns. Phoenix and Ash both inherited this sentence even though only one of them inherited the binary. A server is no longer "the program." A server is a slot.

Inside the thread the world's day is small and repeating. If the calendar second has flipped, do the timed work: listserver ping, the slow player sync, an action-point tick, an inactivity check, an account save, the horses that should get off the board, the baddies that should stand back up. Then wait — a select, in the C++ engine — on the listen socket, on every player socket, on the listserver socket. If someone new arrives, they are not a player yet. They are `PLTYPE_AWAIT`, a socket in a hallway, until the first real packet says what species they are. If a socket has bytes, pull a frame, peel the encryption, hand the packet to a table of two hundred and fifty-six functions, one slot per id, unknown ids falling through to a null that usually shrugs. If the outbound queue has something, compress it, encrypt it, prefix the length, and let it go.

That is the whole day. Every feature you remember — warps, private messages, the remote control, the NPC server, the weapon you picked up — is a guest of that day, not a replacement for it.

You stand in front of the include directory and read the names the way you would read the spine of a field guide. `TLevelBaddy.h`. `TLevelHorse.h`. `TLevelLink.h`. `TLevelSign.h`. `TLevelChest.h`. The level is not a picture. It is a struct with a neighborhood. The picture is what the client paints after the struct has been spoken aloud in packets.

---

There is a family resemblance between the boxes that do not open.

`gserver_2.1.0` through `gserver_2.4.0` are Reborn binaries with default worlds beside them. The revision packages, 29 and 31 and 51, are the 2.17 line dressed as something an operator could drop on a machine: accounts, staff rights, a world folder, an RC command list, the pattern of a server message. You cannot read a sentence of their logic by opening them in an editor. You can read their manners. Where they put `accounts/`. What they expect in `serveroptions.txt`. Which client versions they were willing to shake hands with. A binary is a silence that still keeps house.

Phoenix is that silence, chosen on purpose.

It is not a rewrite. The readme in its folder says so in the first screen: engine Graal Reborn GServer 2.4.0, `gserver2.exe`, the working binary taken from `gserver_2.4.0`. The world instance is `servers/phoenix`. The list name is Phoenix. The port is 14802. The allowed clients are the classic v2 range, 2.1.7 through 2.3.1, which is a choice about who gets to come home. Staff is a line in `serveroptions.txt`. Offline-friendly options are a config, not a new protocol. When you start Phoenix you are not starting a new theory of Graal. You are starting the theory gs2emu already proved, with the furniture moved and the name on the door repainted.

That matters for how you learn. If Phoenix misbehaves, you do not grep a Python file. You compare it to `gserver_2.4.0`, then to the source of the engine it was built from, then to the configs that are actually Phoenix — the staff line, the version list, the start level, the message. Config is a dialect. The binary is the language.

---

Ash is the other argument, and it is an argument in public.

It sits on the table as `ashserver.py`, `protocol.py`, `extras.py`, a `servers.txt`, a world at `servers/ash`, port 14812. The readme is blunt about its parentage. The protocol, the login, the encryption generations, the packet ids, the `GRACC001` accounts, the `GLEVNW01` boards, the file send, the warp — those were read out of gs2emu. The older login and the level/NPC split were read out of sidrax and the 1.31 linux dump and the Win32 1.39 tree. The layout and the start level were copied from the Reborn binaries because a client does not log into a class diagram. It logs into a folder that looks like a world.

Ash is a second telling, not a translation line by line. Where gs2emu gives each world a thread and then selects inside it, Ash accepts on a thread and hands each player a daemon of their own, and keeps a separate thread for the listserver, and lets the main thread tick baddies once a second. Same protocol, different scheduler. If you learn only Ash, you will think a gserver is a handful of Python objects with an if-elif chain where a packet id lands. That is one true shape. If you learn only gs2emu, you will think a gserver is a vtable of member functions and a select loop. That is the other true shape. The wire does not care which one answered.

What Ash owes you, as a reader, is that the wire is visible. `protocol.py` is the place where `CString` and `CEncryption` and `CFileQueue` come back under new names and shorter tempers. `ashserver.py` is `TServer` and `TPlayer` and `TAccount` and `TLevel` without the header files. `extras.py` is the part the first login does not need and the second week does: the listserver, the RC browser, the NPC-Server, gmaps, baddies, the trigger-action hacks. You can watch a generation-5 client arrive, because the type byte shifts and the lock changes, and you can watch the server still agree.

Offline login is the courtesy both of the new houses extended. If the listserver at the far end — traditionally `listserver.graal.in` on 14900 — is not there, a world can still let a person in. The public directory is a convenience. The listen socket is the house.

---

By the time you have walked the four shapes, a sentence has become available that was not available at the door.

A gserver is a process that owns worlds. A world is a set of levels, a set of accounts, a listen port, and a population of sockets that have declared a type. A socket becomes a client, or a remote control, or an NPC-Server, according to the first packet, and the encryption generation rides with that declaration. Levels are files with a header — `GLEVNW01` in the Reborn file habit — and a board of tiles, and a margin of objects. Accounts are files with a header — `GRACC001` — and a scatter of fields a client will eventually see as props: nick, hearts, coordinates, the level they believe they are standing in. Between the file and the screen there is a packing rule older than the class names: integers folded into seven-bit digits and shifted into the printable range, so that a byte on the wire looks almost like text even when it is a number. The client you grew up with speaks that dialect. Every engine in this room, monolith or rewrite or binary or Python, is an attempt to answer it without embarrassing itself.

You can feel, now, why the folder looks redundant. It is not five copies of one program. It is one conversation recorded at four ages.

The monolith records the conversation as a long night in a single file. gs2emu records it as a building with named rooms and a thread per floor. The Reborn binaries record it as a machine that still runs, with the blueprints locked in the case. Phoenix records it as that machine, given a world and a port and a decision about which clients are family. Ash records it as a retelling in another language, close enough that a v2 client cannot tell the difference from the handshake alone, different enough that a reader can.

Ember, on the wall, is none of these. It is the margin note: which tree is source, which tree is a binary, which class owns the board, which packet is the login, which integer width is a file size. You will need the margin. You should not start there and stay there. A map that is never checked against a street becomes a rumor.

---

Before you leave the room you do one small thing, the way a person checks that a story is about a real town and not a mood.

You open `servers.txt` in Phoenix, and the one in Ash. Both of them know the word `servercount`. Both of them name a directory. The directories underneath have the same inner streets: `accounts/`, `config/`, `world/`, a place for weapons, a place for logs, a `serveroptions.txt` that says who may sit in the staff chair. An account file begins `GRACC001`. A level file begins `GLEVNW01`. The ports differ, 14802 and 14812, so they can be awake in the same night without stepping on each other. The list name differs. The language of the engine differs. The street plan does not.

That is the trick the later servers learned from the earlier ones, and the trick Ash learned from all of them. The client is loyal to a layout and a dialect, not to a compiler. If the folder looks like a world and the first line of the socket looks like a login, the grass arrives.

You turn the lamp down on the low shelf. `gserver.cpp` can wait until you know what you are looking for inside it. The include directory can wait until you want the select loop in your hands. The encryption classes can wait until a version token like `GNW28015` has been on the table between you and the code.

At the door you look back once. Four engines, one conversation. The client you remember is on the other side of a socket, still expecting someone to answer in printable numbers.

The next room is the loop itself: how a world spends a second, who it listens to, and why a new connection is not a player until it confesses.

---

*End of chapter 1.*
