# Chapter 8 — What the NPC Hears

The third species does not want a body. It wants authorship.

Shift 2, `PLTYPE_NPCSERVER`, generation 3, no key byte. Chapter 4 already walked it through the hall: the password is compared to `ns_password` in `adminconfig.txt`, not sent to the list; a second one is refused because the comment wondered whether to boot the first and then did not; `adminRights` is set to `0xFFFFF`; a gshort at the end of the line is the port it will listen on, stored with `setNPCServer`. The nick, if none was loaded, becomes `NPC-Server (Server)`. The head becomes `staffhead`, the same `head25.png` the chair wears, so the player list has something to draw for a process. Server flags are pushed. The gmap list is pushed as `PLO_NC_CONTROL` with `NCO_GMAPLIST`. Then maps, then levels, then weapons.

The level push is not a polite index. `sendNC_Levels` calls `reload` on every loaded level before `NC_SendLevel`. A process joining the world refreshes the world. Players standing in those levels feel it. This is why you do not restart an NPC-Server on a crowded night and expect the grass to sit still.

Once it is in, clients are told. `PLO_HASNPCSERVER` went out at login to anyone who arrived after, and the point of that packet is in the comment: stop sending NPC props you have been editing. `setProps` forwards a prop stream to the NPC-Server unless the NPC-Server is the one setting them. The client was a co-author. The process is the author now, and the client has been demoted to a witness. An RC with `PLPERM_NPCCONTROL` may be told the address: `PLO_NPCSERVERADDR`, the id, the ip — `ns_ip`, or the socket's remote address if that option is `AUTO` — and the port. Everyone else does not get the address. The process is in the building. The door to it is a bit.

---

What it hears, after the push, is a query.

`msgPLI_NC_QUERY` returns immediately if the socket is not the NPC-Server. The first gchar is a type, and the switch is the job description. `NCI_NPCLOG` writes the rest of the line to the NPC log. `NCI_GETWEAPONS` sends the weapons again. `NCI_GETLEVELS` is a case that breaks without doing anything, a handled absence. `NCI_SENDPM` reads a gshort id and delivers a private message as if the process were a player, which is why it has an id searched from the same list. `NCI_SENDTORC` writes a line into the RC chat, so a script can speak in the staff room. `NCI_WEAPONADD` reads a name, an image, and the rest of the packet as code. A default weapon is not updated. An existing weapon is updated and the players holding it are told. A new one is constructed and added. `NCI_WEAPONDEL` deletes by name. `NCI_PLAYERPROPSSET` finds a player by gshort and calls `setProps` with the NPC-Server as the author, which is how a script changes a heart without the client having asked. `NCI_PLAYERWEAPONSGET` answers with `NCO_PLAYERWEAPONS` and a quoted, comma-separated list. `NCI_PLAYERPACKET` is the process handing the server a packet to deliver, a ventriloquism.

The weapon packet the process receives is the same shape the client received in chapter 5, minus the defaults. Name, image, script. Default weapons are skipped in `sendNC_Weapons` because the client already invented Bomb and Bow, and the server has spent two chapters killing them. A script on disk is text. On the wire, level NPC code was joined with `0xA7`, the section sign, so that newlines would not end the packet. The process has to know that a weapon is a file that became a string that became a packet, and that editing the string edits the file only if the add path saves it. Authorship is a round trip. Miss the save and the next restart resurrects the old lines.

---

There is a second way a script speaks, and it does not require the process to be in the building.

`PLI_TRIGGERACTION` reads a raw int NPC id, two gchars of position divided by two — half-tiles again — and the rest of the line as an action string. If an NPC-Server is connected, the action is forwarded to it as `PLO_TRIGGERACTION` with the player's id. It is also sent to the level, so other clients see the trigger. The process is not the only ear. It is the ear that can answer.

If the position is `0, 0`, the server may eat the action before anyone else hears it. These are the trigger hacks, and the name is the server's own. They exist so a script running in the old client can ask the server to do a thing the trigger packet was never designed to ask, by standing at the origin and saying a sentence that starts with `gr.`.

`triggerhack_weapons`, off unless the option says otherwise. `gr.addweapon` tokenizes on commas and adds every name after the first. `gr.deleteweapon` removes them. This is how a chest gives a sword when no NPC-Server is there to hand it over.

`triggerhack_execscript`, also off by default. `gr.es_clear`, `gr.es_set`, `gr.es_append` build a parameter list on the player. `gr.es` loads a file from `execscripts/`, strips carriage returns, replaces newlines with `0xA7`, substitutes `*PARM0` and its siblings, fills anything left with `0`, and sends the result as `PLO_NPCWEAPONADD` under the name `-gr_exec_` plus the file. The image is `wbomb1.png`. The target is an account name, or `ALLPLAYERS`. A script has been disguised as a weapon and handed to a client. The disguise is the point. The client knows how to run a weapon. It does not know it has been asked to run a file off the server's disk.

`triggerhack_guilds` appends or removes a line in `guilds/guild<Name>.txt`, account and optional nick. `triggerhack_groups` defaults to on, unlike the others, and is how a party shares an instance. Files, RC, props, levels: each hack is a bool in `serveroptions.txt`, and each one is also in the `__admin` list from chapter 7, so a staff member without the staff-account bit cannot turn them on from the chair. The hacks are powers. The powers are locked.

Ash carries the same sentences in `extras.py`. A trigger that starts with `gr.addweapon` is not forwarded as flavor text. It is executed, if the option is on. The Python house and the C++ house agree that `0, 0` is not a place on the board. It is a mode.

---

A level NPC, the kind written between `NPC` and `NPCEND` in a `GLEVNW01` file, is the other author, and it is local.

When no NPC-Server is connected, the client is allowed to edit NPC props, and the server relays `PLO_NPCPROPS` to the level if the NPC is actually standing there. The code joined with `0xA7` is the script. The image is the body. The coordinates are where it was put. This is the Graal a person remembers if they never ran a separate NPC process: bushes that talk, signs that are signs, a shopkeeper whose lines live in the level file. The NPC-Server is what happens when that is not enough. One process, one script host, weapons and classes and flags that outlive the level, a log of its own. The client is told to stop helping.

You can see the three species as three answers to the same socket.

A client wants the board and sends triggers. An RC wants the folder and sends option sets. An NPC-Server wants the script and sends queries. All three were `PLTYPE_AWAIT` for one line. All three wear generation 3 unless they are the newer client or the newer RC. The process is the only one that never asks the list, and the only one whose joining reloads the levels. Treat it as a player and you will try to warp it onto the grass. Treat it as staff and you will ask it for a file browser. It is a socket that was given a player's id so the private-message path would work, and a staff head so the list would have a face, and then handed the maps.

Phoenix runs this if you start the NPC-Server beside it and the password matches. The binary already knows the switch. Ash runs the query path in the extras, cut down to the sentences a v2 world actually needs. Neither of them invented the species. The monolith had NPCs in `npcs.cpp`. Reborn gave them a process and a port.

The next room is the house that does not rewrite any of this. Phoenix, which is the 2.4.0 binary, a world folder, and a decision about which clients are family.

---

*End of chapter 8.*
