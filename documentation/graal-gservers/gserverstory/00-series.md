# GServerStory

A novel of the engines.

This is a story told in the order a person actually learns a gserver: first the room of versions, then the loop, then the wire, then the files, then the doors that only staff and NPC-Servers use, then the rooms those doors named, then the line where the server stops being the author. Nothing in it is invented about the protocol. The names of files, classes, ports, and packet generations are the ones in this project.

The atlas it walks is `Ember/`. The engines it names live under `graal gservers/`, `Phoenix/`, and `Ash/`. Chapter 34 and Part 5 also use the Graal Bible, and they say so. The close is `command-index.md`, the overlap of `commands.rtf`, Shakaraja's 2008 guide, and the Bible's function lists.

Chapters 1–39 are written.

## Part 1 — the spine

| Chapter | Title | What it opens |
|---|---|---|
| 1 | The Room With Many Engines | Lineage: 1.3.x monolith, gs2emu, Phoenix, Ash |
| 2 | One Thread Per World | `servers.txt`, `TServer::doMain`, the select loop |
| 3 | Numbers That Had to Be Printable | gchar, gshort, gint, Pascal strings |
| 4 | The First Line | Login type, version token, encryption generations |
| 5 | Hearts, Tiles, and the Board | Props, `GLEVNW01`, links, baddies |
| 6 | The Quiet List | Listserver, `SVO_*` / `SVI_*`, offline login |
| 7 | The Staff Door | RC, rights bits, foldersconfig, file send |
| 8 | What the NPC Hears | NPC-Server, trigger actions, weapons |
| 9 | Phoenix, Which Does Not Rewrite | The 2.4.0 binary in a named world |
| 10 | Ash, Which Does | The Python retelling |
| 11 | How to Read the Source | A path through gs2emu, then the 1.3.x dumps |
| 12 | The Compiled Silence | What a binary still hides, and how to start looking |

## Part 2 — the rooms

| Chapter | Title | What it opens |
|---|---|---|
| 13 | The Level Name Lies | gmap, bigmap, groupmap, `.unknown`, `PLAYERWARP2` |
| 14 | The Person Between Sessions | `GRACC001`, the defaultaccount clone, the five-minute save |
| 15 | The Weapon Is a File | `GRAWP001`, `0xA7`, bytecode type 74 |
| 16 | The Fight and the Drop | bomb relay, hurt, death gralats, bush and vase and chest |
| 17 | The Mouth | jail levels, the PM limit, `config/rules.txt` |
| 18 | The Queue | `CFileQueue`, the 48 KB coalesce, bzip2, two buffers |
| 19 | What the Level Keeps | signs, the horse timeout, the item timeout |
| 20 | The Guild File and the Group Key | `guild<Name>.txt`, `triggerhack_groups` |
| 21 | The Version Forks | 1.41, 2.1, 2.14, 2.21–2.31, 2.3, 2.30 |
| 22 | What 2.4 Added | The string residue in `gserver2.exe` |
| 23 | One Function, Unnamed | The login string, walked without its name |
| 24 | What the Server Does Not Run | The line where the script leaves the process |

## Part 3 — the annex

| Chapter | Title | What it opens |
|---|---|---|
| 25 | The Baddy | Verses, the hurt image, the roll of twelve, the respawn |
| 26 | The Link | A rectangle that is not a door unless the file exists |
| 27 | Three Bans | `ipbans.txt`, the account flag, the filter verb |
| 28 | The Hook | `CPluginManager`, and a save the plugin can eat |
| 29 | The Chair's Catalog | `rchelp.txt` against the handlers |

## Part 4 — the server's side of the script

| Chapter | Title | What it opens |
|---|---|---|
| 30 | The String the Server Builds | `0xA7`, `//#CLIENTSIDE`, the 12255-byte clip |
| 31 | The Query Catalog | Every `NCI_` the switch handles, and the missing break |
| 32 | The Old Author | `npcs.cpp`, the interpreter Reborn removed |
| 33 | The Scripts That Are Here | `-gr_movement`, the zlib fix, the `gr.` list |

## The client, and the script-side names

| Chapter | Title | What it opens |
|---|---|---|
| 34 | The Client Runs It | Who steps the half after the marker. The Bible, not a client we opened |
| 35 | Three Scripts | Level NPC, weapon, class. `join` and `leave` |
| 36 | The Dash | `*`, `-`, `folder/`. Why the clocks are hidden |
| 37 | The Origin, from the Other Side | A weapon always passes `0, 0` and its own name |
| 38 | The Other Window | NPC-Control, `scripttime`, `scriptcalls` |

## The close

| Chapter | Title | What it opens |
|---|---|---|
| 39 | The Words for the Doors | The parts, then the index |

`command-index.md` is the glossary chapter 39 hands off to. A name in the classic RTF and the Graal Bible is a verb the language agreed on. The gserver still does not step it.
