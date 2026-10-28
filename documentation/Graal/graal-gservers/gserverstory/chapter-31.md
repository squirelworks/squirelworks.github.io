# Chapter 31 — The Query Catalog

The process does not get a language. It gets a switch.

`msgPLI_NC_QUERY` returns if the socket is not the NPC-Server. The first gchar is the type. The types are `NCI_`, and they are not the same numbers as the `NCO_` replies. Inbound zero is a log line. Outbound zero is the player's weapon list. A decoder that uses one table will file a log as a weapon dump.

What the switch actually does:

`NCI_NPCLOG` writes the rest of the line to the NPC log. `NCI_GETWEAPONS` sends the weapons again, skipping defaults. `NCI_GETLEVELS` is a case that breaks. The levels were pushed at login, and the request is accepted and ignored. `NCI_SENDPM` delivers a private message as the process's id. `NCI_SENDTORC` writes into the RC chat. `NCI_WEAPONADD` updates or creates a weapon and will not touch a default. `NCI_WEAPONDEL` deletes by name, file included. `NCI_PLAYERPROPSSET` calls `setProps` on a player, with the process as the author. `NCI_PLAYERWEAPONSGET` answers `NCO_PLAYERWEAPONS` and a quoted list. `NCI_PLAYERPACKET` reads a gshort and a packet and calls that player's handler for the id, the ventriloquism. If the handler returns false, the player is deleted. The process can hand the server a packet the server will believe came from the person.

`NCI_PLAYERWEAPONADD` and `NCI_PLAYERWEAPONDEL` add and remove a name on a player's list. `NCI_LEVELGET` finds a level by the rest of the line and sends it. `NCI_NPCPROPSSET` sets props on an NPC and tells the level. `NCI_NPCWARP` moves an NPC to a level and a half-tile, and returns without moving if the NPC is a level NPC. A bush in the file cannot be warped. A process-made NPC can. The old level is told `PLO_NPCDEL2`. The new level is told the props.

`NCI_SENDRPGMESSAGE` sends `PLO_RPGWINDOW` to a 2.1-or-newer client, the text in quotes. Older clients do not get the window. `NCI_PLAYERFLAGSET` splits on `=` and sets a flag. `NCI_SAY2SIGN` sends `PLO_SAY2` with newlines turned into `#b`, the same costume a sign uses. `NCI_PLAYERSTATUSSET` ors or clears bits on the status, operation 0 to set and 1 to clear.

`NCI_PLAYERSTATUSSET` does not break. The next case is `NCI_NPCMOVE`, and a status set falls into it. A move reads an NPC id and four gshorts, start and delta, each one shifted and signed by the low bit. A status packet that is short will fail the NPC lookup and return. A status packet that is long enough to look like a move will move someone. The missing break is the kind of thing a catalog is for.

Outbound, the server pushes `NCO_GMAPLIST` at login, `NCO_PLAYERWEAPONS` on request, and the weapon add and delete notifications when the chair edits a person. The process is a client of a small protocol. The gserver is the server of it. The program that decides the next line of a shopkeeper is not in this switch. The switch is how that program, if you start one beside the world, is allowed to touch the world.

Ash relays the queries it implemented. A case this list has and Ash does not is a sentence the process can say that the retelling will not hear. The next chapter is the years when the interpreter was still in the same file as the listen socket.

---

*End of chapter 31.*
