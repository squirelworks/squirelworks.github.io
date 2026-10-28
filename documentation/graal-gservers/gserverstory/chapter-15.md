# Chapter 15 — The Weapon Is a File

A weapon the account names is not yet a weapon. It is a line, `WEAPON -gr_movement`, and the line is a promise that a file exists.

The file lives in `weapons/`, and it is named `weapon` plus the weapon's name plus `.txt`. The header is `GRAWP001`. If the first line is anything else, `loadWeapon` returns nothing, the same door as `GRACC001` and `GLEVNW01`: a magic string, then a refusal. `REALNAME` is the name the client will be told, which can differ from the filename after the save has sanitized it. `IMAGE` is the picture. Between `SCRIPT` and `SCRIPTEND` is the script, one line at a time, and each line is stored with `0xA7` glued on the end instead of a newline. The section sign again, the same byte that joined an NPC's code in a level file, because a newline would end the packet and the script is going to become a packet.

`SCRIPTEND` has to be alone on its line. If the file contains the word and the parser never finds it as a line, the log says the weapon is malformed and says why. A script that swallowed its own end is a script the server will still try to hold, and the warning is the only courtesy.

The sample Phoenix ships is the whole lesson in fourteen lines. `GRAWP001`. `REALNAME -gr_movement`. `IMAGE wbomb1.png`. A script that begins `//#CLIENTSIDE`, writes `gr.x` and `gr.y` from the player's half-tile position, and sets a timeout of a twentieth of a second. `flaghack_movement` is on so this file has a reason to be in the account's weapon list. The image is `wbomb1.png`, the same image chapter 8's execscript disguise uses. A weapon that is really a clock, wearing a bomb's face.

---

Defaults are not files.

A `TWeapon` constructed with a signed char id asks `TLevelItem::getItemName` and marks itself default. `getWeaponPacket` for that kind is `PLO_DEFAULTWEAPON` and the id, not a script. Bomb and bow are this kind when the client invented them, and a file when someone wrote them down. `saveWeapon` refuses a default and refuses an empty name. The five-minute drum that saves weapons compares the memory modtime to the file modtime and writes only if memory is newer. A default has nothing to write. The capitalized names chapter 7 killed are the client's memory, not a file the drum can correct.

When a login cannot find a named weapon, chapter 5's welcome checks the default item id and, if it matches, feeds `msgPLI_WEAPONADD` a packet the server wrote to itself. The weapon is created in memory. It is not loaded from `weapons/`. A missing file and a default item are different failures, and only one of them grows an object.

The packet for a real weapon is `PLO_NPCWEAPONADD`. Name, a gchar length. A zero. Image, a gchar length. A one, then a raw short of the script length, then the script with the section signs still in it. The zero and the one are type markers, not counts you should add thirty-two to by instinct and not counts you should forget. The client script is what is sent. If an NPC-Server is connected, `updateWeapon` splits the script on `//#CLIENTSIDE`: the part before is the server script, the part after is the client script, and the packet carries only the client half. No NPC-Server, and the whole script is the client script. The marker is a cut, not a comment, once a process is in the building. The movement weapon's first line is that marker, so with an NPC-Server connected the process gets nothing before it and the client gets the clock.

---

Bytecode is the other body, and Phoenix's room for it is empty.

A `BYTECODE` line names a file. The file is loaded from `weapon_bytecode/`. If the script is also present, the log warns and says it is using bytecode. The script does not win. `getWeaponPacket` then changes shape: the same add, but the marker is 74 and the short length is 0, and then for each bytecode blob a `PLO_UNKNOWN197` with a header and a tokenized modtime, and a `PLO_RAWDATA` of the blob itself. The header is read as a gchar id, a gshort length, and four lines: type, name, an unknown, a hash. This is the wing chapter 12 said a later coat adds. The dump has the loader. The Phoenix folder has the directory and no files. A weapon that lists `BYTECODE` and finds nothing does not push an empty pair. The empty load is skipped. The room is a promise the package does not keep, on purpose.

`-gr_zlib_fix` is the opposite promise: a weapon with no file.

Chapter 5 watched `sendLoginClient` build it for versions 2.21 through 2.31. Name `-gr_zlib_fix`, a one-byte script that is a dash, the length as a raw short, sent as `PLO_NPCWEAPONADD`. It is not in `weapons/`. It is not in the account. It is a packet the welcome writes because those clients need a script-shaped correction and the file would be the wrong place to keep a version bug. Execscripts are the same idea from the other side: `gr.es` reads a file from `execscripts/`, replaces newlines with `0xA7`, and sends it under `-gr_exec_` plus the name, image `wbomb1.png`. A weapon can be a file, a default id, a welcome packet, or a trigger wearing a weapon's clothes. The client cannot tell. The server can, because it knows which constructor ran.

---

The save sanitizes the filename and not the real name.

Backslash and slash become underscores. Star becomes `@`. Colon becomes semicolon. Question mark becomes an exclamation. The `REALNAME` line keeps the weapon's actual name, so a weapon called something the filesystem will not hold can still introduce itself. The NPC-Server delete path uses the same replacements before it unlinks `weapons/weapon<name>.txt`. A script that deletes a weapon is deleting a file, and the five-minute drum will not resurrect it if memory was removed. A script that updates a weapon calls `updateWeapon`, which may save immediately. The file and the session can diverge for minutes, or not, depending on who edited.

Ash carries the add path far enough for a v2 client to hold a weapon and walk. The bytecode packet, type 74 and `PLO_UNKNOWN197`, is part of what the readme left out. If a weapon arrives as a script, you are on the path both houses share. If it arrives as a blob, you are on the path only the binary fully answers, and the empty directory in Phoenix is the clue that this package is not that path.

The account named the weapon. The file, or the default, or the welcome, made it a packet. The client runs it. The next room is what happens when the running touches the board: the bomb, the hit, the bush that drops, the gralats a death takes. The fight, and the drop.

---

*End of chapter 15.*
