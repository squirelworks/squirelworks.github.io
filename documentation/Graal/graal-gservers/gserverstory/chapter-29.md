# Chapter 29 — The Chair's Catalog

`rchelp.txt` is twenty lines, and it is not the protocol. It is the list the chair is shown.

Phoenix's file says available commands for Graal Reborn GServer 2.4, then `/help`. `/open`, `/openacc`, `/opencomments`, `/openban`, `/openrights`, each with an account name: the windows chapter 7 gated on view attributes, the staff-account bit, comments, ban, and rights. `/reset` is the copy of `defaultaccount` over a name. `/refreshservermessage` reloads the HTML. `/updatelevel` and `/updatelevelall` reload levels from disk. `/restartserver` kicks and restarts. `/reloadserver` reloads the configuration. `/updateserverhq` sends the HQ letter again. `/reloadwordfilter`, `/reloadipbans`, `/reloadweapons`. `/find` with a wildcard. `/cachesubdirs` for a folder the index has not seen.

Each of these is real if a handler exists and the bit is held. Update level wants `PLPERM_UPDATELEVEL`. Rights and the account window want `PLPERM_MODIFYSTAFFACCOUNT`. A line in the help file does not grant the bit. A bit without a line in the help file is a door the catalog forgot to mention. Read the file against `TPlayerRC.cpp`, search for the command, and the pair is either a handler and a right or a sentence. The revision packages ship their own `rchelp.txt`. A command in Rev 51's list and not in Phoenix's is a claim about 2.17, not about 2.4. Match the catalog to the binary it was packed with.

One sentence the catalog does not list is still in the source. A guild message, built in `processChat` as an empty label and `Guild message:`, sent as a private message to every online member of the guild, then a chat line counting how many received it. Chapter 22 marked that label as residue because a string diff missed the escaped quotes. It is not residue. It is a command the help file never advertised. The binary and the dump both have it. A catalog is not a census.

Ash has a copy of the file and the browser in `extras.py`. A command that works in the chair on Phoenix and not on Ash is a handler the second week did not port, not a different protocol. The rights bits are the same stack.

---

This is the annex, and it is the end of what the gserver sources still had to teach.

Part 1 was the spine. Part 2 was the rooms. Part 3 is the five things those rooms named and did not open: the baddy and its roll, the link that is not a door unless the file exists, the three bans, the plugin hook that can eat a save, and the catalog that is shorter than the chair. Nothing after this is a missing chapter of the same book. The script runs in the client or the process. The process is not on this shelf. The client is still on the other side of the socket.

The folder is the same folder. The next packet is still the client's.

---

*End of chapter 29.*

*End of Part 3.*

*End of GServerStory.*
