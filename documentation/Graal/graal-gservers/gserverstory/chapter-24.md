# Chapter 24 — What the Server Does Not Run

The script is in the building. The author is not.

A weapon file holds lines between `SCRIPT` and `SCRIPTEND`. A level file holds lines between `NPC` and `NPCEND`. An execscript is a file in `execscripts/`. All three become a string with `0xA7` where the newlines were, and the string is handed to someone. The someone is the client, or the NPC-Server process, and the gserver is the hand. Search the dump for an interpreter and you will not find one. `gr.es` lives in `TPlayer.cpp` as a trigger the server recognizes and repackages. It does not run the file it loads. It sends the file as a weapon. The only execution in that function is the string replace of `*PARM` and the construction of a packet.

`//#CLIENTSIDE` is the cut written down.

`updateWeapon`, and the NPC path beside it, splits on that marker when an NPC-Server is connected. The part before is the server script. The part after is the client script. The packet the player receives carries the client half. The process is sent the other half by the channels chapter 8 walked, weapons and classes and flags. No process connected, and the split does not happen: the whole script is the client script, because there is no other author in the room. The marker is a comment to a person reading the file and a blade to the server. A movement weapon whose first line is the marker gives the process nothing and the client the clock. That was chapter 15. It is also the rule.

The client half has a size the server bothers to warn about. Twelve thousand two hundred and fifty-five bytes. Over it, a printf: the clientside script of this NPC exceeds the limit. The server still holds the string. The warning is the server knowing the client's limit better than the client will, and saying so in the log where the client will not see it. A script that works in the editor and arrives truncated has met this number.

---

The trigger hacks are the exception, and they are not a language.

At tile `0, 0`, a sentence that starts with `gr.` may be eaten. Add a weapon. Delete a weapon. Append a guild line. Set a group key. Load an execscript and mail it. The verbs are a list in a function, each one gated by an option, most of them off. A sentence that is not on the list is forwarded. `PLO_TRIGGERACTION` to the level, and to the NPC-Server if one is connected, with the player's id. The server has recognized a few imperatives it was willing to perform so that a world without the process could still hand out a sword. Everything else is a letter to the author. Confuse the list for a scripting language and you will try to write `if` in a trigger and wait for a branch that never comes. The `if` runs in the client that sent the trigger, or in the process that will answer it.

Put NPC and delete NPC are the same border. With a process connected, both return immediately. The client has been demoted. Without a process, the client may place an NPC, and the code is loaded from a file, newlines replaced, and the object added to the level. The server stores the NPC. It does not step it. The next person to enter receives the props. The talking, if the NPC talks, is the client deciding that a sign-shaped script should speak. `testSign` is the closest the server comes to performing a script, and it is a distance check and a `PLO_SAY2`, not a virtual machine.

---

So the line is this.

If the question is how a packet becomes a person, a board, a file, a guild line, a group key, the gserver is the author and these chapters are the book. If the question is why the shopkeeper says the next line, the gserver is the shelf. The next line was chosen by a client interpreting a string, or by a process that accepted a query socket and was given the maps. The NPC-Server is not inside `gserver2.exe`. It is the third species, shift 2, a program you start beside the world, speaking `PLO_NC_CONTROL`. Ash relays the query. Phoenix will accept the process if the password matches. Neither one is the process.

This is why a script chapter would be a different book. The grammar of `if`, `timeout`, `#v`, the client-side verbs, the way a weapon's clock becomes a position: that grammar belongs to the client you grew up with, and to the NPC-Server the Reborn line split off so the client would stop editing. The archive on this shelf can show you the cut, the byte the newline became, the limit of 12255, the marker, the few `gr.` sentences the server stole so a world could live without the process. It cannot show you the shopkeeper deciding. The deciding was never compiled into the coat.

Part 1 was the spine: the morning, the costume, the login, the body, the clerk, the chair, the process, the two houses, the way to read, the way to start looking. Part 2 was the rooms the spine named: the map, the account, the weapon file, the fight, the mouth, the queue, the things a level keeps, the guild and the group, the version cuts, the residue in the binary, one unnamed function, and this line.

The client is still on the other side of the socket. The next packet is still the client's. The script in it, if it speaks, speaks somewhere this process will not follow.

---

*End of chapter 24.*

*End of Part 2.*
