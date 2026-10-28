# Chapter 33 — The Scripts That Are Here

Three scripts, and a list of sentences. That is the language as this archive is willing to hold it.

The first is `weapon-gr_movement.txt`, in Phoenix and in Ash and in the Reborn boxes. `GRAWP001`, real name `-gr_movement`, image `wbomb1.png`. The body begins `//#CLIENTSIDE`, then if the player enters or the timeout fires, and `gr.off` is not set, it writes `gr.x` and `gr.y` from the player's position plus a quarter, times two, divided by two. The timeout is a twentieth of a second. Chapter 21 said why. Pre-2.3 clients do not move smoothly unless something reports the position, and `flaghack_movement` turns those flags into prop packets. The weapon is a clock wearing a bomb's face. With an NPC-Server connected, the marker gives the process nothing before it and the client the clock. Without one, the client gets the whole file. The server runs neither half.

The second is not a file. `-gr_zlib_fix` is built in the welcome for versions 2.21 through 2.31, a one-byte script that is a dash. It exists because those clients needed a script-shaped correction. It is the smallest script in the building, and it means nothing if you read it.

The third is the execscript disguise. `gr.es` loads a file from `execscripts/`, strips carriage returns, replaces newlines with `0xA7`, substitutes `*PARM`, fills the rest with `0`, and sends it as a weapon named `-gr_exec_` plus the file, image `wbomb1.png`, to one account or to everyone. The folder is empty unless you put a file in it. The hack is off unless the option says otherwise. A script run by this path is a script you added, mailed as a weapon, run by the client.

The sentences the server will perform are the `gr.` list, and only at tile `0, 0`, and only if the option is on. Add and delete a weapon. The execscript family. Guild add, remove, and set. Group, level group, player group. Append and write a file. RC chat. Attribute sets. Update level. They are string prefixes in `msgPLI_TRIGGERACTION`. They are not the command table from `npcs.cpp`. A script that says `if` is waiting on the client. A script that says `gr.addweapon` at the origin is waiting on an option.

Nothing else in the packages is a worked example. `npcprops/` is empty. The bytecode room is empty. The old `weapons.txt` is a dump of an era, not a script this server will step. Part 4 is the edge chapter 24 drew, walked along rather than crossed: the string the server builds, the switch the process is given, the interpreter that used to live in-process, and the three scripts still on the disk.

The client is still where `timeout` means something. The process that would mean it on the server's behalf is still a program you start beside the world, and it is not in this folder. The next packet is still the client's.

---

*End of chapter 33.*

*End of Part 4.*

*End of GServerStory.*
