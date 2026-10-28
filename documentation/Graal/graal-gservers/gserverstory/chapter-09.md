# Chapter 9 — Phoenix, Which Does Not Rewrite

Phoenix is the silence with the lights on.

Every function the last seven chapters named — `doMain`, `msgPLI_LOGIN`, `writeGChar`, `sendLogin`, the list clerk, the staff bits, the NPC query — lives in this house, and you cannot open it. The engine is `gserver2.exe`, Graal Reborn GServer 2.4.0, taken from the `gserver_2.4.0` box on the shelf. Joey and Nalin wrote that generation. It stands on 39ster's older work, and the readme names the hands around it: Agret, Beholder, Joey, Marlon, Nalin, Pac. Phoenix did not add a hand to that list. The readme says so in the first screen, and the sentence is the whole method. This is not a rewrite of the protocol. The working 2.4.0 binary is the engine. Everything around it — instance name, configs, staff layout, versions, messages, guild, rules — is Phoenix.

That is a different way to learn, and it is easy to mistake for emptiness. If Phoenix misbehaves, you do not grep a Python file. You compare it to `gserver_2.4.0`, then to the gs2emu source the binary was built from, then to the files that are actually Phoenix. Config is a dialect. The binary is the language. Chapter 2's five-millisecond select is running in there. Chapter 4's refusal, when the list is down, is running in there. You hear them as log lines and as the sentence the client shows, and you trust them because you have already read the functions they quote.

---

The package is a world wearing that binary.

`servers.txt` has `servercount = 1` and `server_1 = phoenix`. One process, one town, the sentence from chapter 2 with the count set to the smallest honest number. The overrides are commented: ip, port, local ip, interface. Uncomment them and you are using the side door `main.cpp` already knew. The world directory is `servers/phoenix/`, and the streets are the blueprint Ember drew. `accounts/`, `config/`, `documents/`, `execscripts/`, `guilds/`, `logs/`, `npcprops/`, `translations/`, `weapon_bytecode/`, `weapons/`, `world/`. The bytecode folder is a 2.4 hook the package does not use. An empty room is still a room the binary may look for.

The start level is `onlinestartlocal.nw`, the stock Reborn file. Heads, bodies, swords, shields, ganis, hats, images, and sounds are empty on purpose. Those files were never in the gserver packages. They live in the client you grew up with, or in a world extracted from one. Drop them under `world/` and keep `foldersconfig.txt` in sync, or chapter 7's find will fail and the client will be told the file send failed. The grass in the start level can arrive before any head does. A person with `head0.png` and an empty heads folder is a person the protocol has described and the disk has not yet dressed.

What was taken from where is written down, which is a kindness most packages skip. The engine, the UPnP license, the folder layout, the start level, the `-gr_movement` weapon, the options and the account format: `gserver_2.4.0`. The changelog and the trigger-action notes: 2.3.1 and 2.2.0. The earlier baseline: 2.1.0. Account files, staff rights, world folder names, the RC command list, the server-message pattern: the revision packages, 29 and 31 and 51, the 2.17 line. Guild file convention, the ip-bans placeholder, the habit of dropping files in `world/`: the 1.3.9 trees. Phoenix is a collation. The binary is one age. The furniture is several.

---

The choices are the part that is actually Phoenix.

The list name is Phoenix. The description says rise from the ashes, classic Graal v2, Reborn 2.4 engine. The port is 14802, in `serveroptions.txt` and in the commented override, so the world and the slot agree. The list clerk is `listserver.graal.in` on 14900, the same clerk chapter 6 described, and there is no `offline_login` because the binary does not have Ash's todo-completed. If the clerk is out, the client hears the login server is offline. Port-forward TCP 14802, or let 2.4 try UPnP on its own, the thread chapter 2 saw started in `init` and joined on the way down. Windows starts with `start_phoenix.bat`. Linux starts with `start_phoenix.sh`, which is wine running `gserver2.exe`, and says so. The engine is a Windows binary even when the folder is not on Windows. Do not click the X. That plea is in the binary's log, and it is about the flags and the accounts that have not been written since the last five-minute drum.

The allowed clients are the classic window. `GNW22122` through `GNW28015`, 2.1.7 through 2.3.1, uncommented. The G3D tokens for 3, 4, and 5 are present and commented. The 2.4 engine can speak to them. This package, by choice, does not. A person who grew up on the v2 client is the person the door was cut for. Chapter 4's warning still holds inside that window: 2.1.7 and 2.3.1 do not shift the same bit, and the binary will pick generation 3, 4, or 5 from the shift without asking Phoenix's opinion.

Staff is a placeholder you are told to replace. `staff = (Owner),YOURACCOUNT`. The parenthetical is not a guild. It is a label in the comma list, and `isStaff` will not match it to a person unless someone has named themselves that. Rename `accounts/YOURACCOUNT.txt` to the Graal account, and put that name on the staff line. The account file already has `IPRANGE *.*.*.*`, which is how the RC IP lock from chapter 7 is left open on a new package. `LOCALRIGHTS 1040383` is the full-rights mask the Reborn packages in this collection used. Folder rights already cover accounts, config, documents, guilds, logs, npcprops, translations, weapons for reading, and the world tree. The protected files are the ones chapter 7 listed, paired with the same bits: change staff account, set folder options, set server options. A new owner who only renames the file and forgets the staff line has an account the grass will accept and a chair the door will not.

The hacks are set the way chapter 8 described the defaults. Weapons, guilds, files, RC, execscript, props, and levels are off. Groups are on. `flaghack_movement` is on, and the weapon that uses it, `weapon-gr_movement.txt`, ships in `weapons/`. `flaghack_ip` is off, so `gr.ip` is not stuffed into a player's flags unless you turn it on. Execscripts exist as a folder and are quiet. The guild file is `guildPhoenix.txt`. Staff guilds on the player list include Phoenix, and also Ash and Ember, a small wave from this archive into a public list the binary will print as quotes and commas.

Unstick is the start level, at 30 and 30.5, half a tile off the account's own saved Y. Jail levels are named and empty until you add them: `police2.graal`, `police4.graal`. Death drops between 1 and 50 gralats. Hearts start at 3. AP is on, with the same refill ladder chapter 2 read out of the source. Bush items on, vases on, baddy items off, because a 1.41 client generates those itself and this package is not a 1.41 server. The options file is the binary's memory, written where you can edit it, reloaded on the five-minute drum for the versions, the message, and the bans.

---

How to read a house you cannot open:

Watch the log. `:: Loading servers.txt` and then `:: Starting server: phoenix` are `main.cpp`. A failure to listen is `init`. A new login line with a type and a version and an account is `msgPLI_LOGIN`, including the unknown-type sentence if a client shifts a bit the switch does not know. The login server is offline is the list check, not a mood. No level available is `warp` failing, which on a fresh package means the start level went missing, not that the protocol changed. A file send failed is the index. An RC that is told it has no rights is either missing from `staff` or missing `IPRANGE`. A large-file warning is the three-megabyte log in `sendFile`. None of these sentences were written by Phoenix. Phoenix chose to keep them.

When the log is not enough, the source on the shelf is the source. TheDgtl's gs2emu is the building. The 2.4 binary is a later coat of that building. They will disagree in small places — a bug fixed, a packet added, the weapon bytecode room — and the disagreement is the edge of what the dump can teach you about Phoenix. For the hall, the costume, the board, the list, the chair, and the NPC process, the dump is still the right book. Phoenix is what it looks like when that book is compiled, given a port, and told which clients are family.

Ash, on 14812, is the other argument, and it is an argument you can read. The next room is that argument: the same street plan, the same first line, a scheduler that does not select, and the places the retelling still does not match the binary.

---

*End of chapter 9.*
