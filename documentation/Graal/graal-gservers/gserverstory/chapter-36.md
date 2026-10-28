# Chapter 36 — The Dash

A weapon's name is a sentence to the client, and the server does not read it.

The NPC weapon page gives three prefixes. A star means the player cannot delete the weapon. A dash hides it in the inventory. A name with a slash, `folder/weapon`, bags it under that folder for the inventory's sake. People have invented further prefixes. The page shrugs. The three are the ones the client agreed to.

This is why the clocks wear a dash. `-gr_movement` is a weapon so that it follows the player and runs, and a hidden one so that the inventory does not offer it as a thing to swing. `-gr_zlib_fix` is the same costume on a one-byte script. `-gr_exec_` plus a filename is the execscript disguise, hidden for the same reason. The image on the movement weapon is `wbomb1.png` because a hidden weapon still has to have a face in the file format. Nobody is meant to see the face.

The gserver stores the name as a string. `GRAWP001` has a `REALNAME` line. The account has a `WEAPON` line. `saveWeapon` sanitizes the filename and keeps the real name, so a slash that means a bag to the client becomes an underscore in the path and stays a slash in `REALNAME`. The prefix survives. Nothing in `TWeapon` branches on a leading dash or a leading star. A weapon the player cannot delete is a weapon the client will not offer a delete for. The server will still delete it if a trigger or the process says `gr.remweapon` or `NCI_WEAPONDEL`. The star is a courtesy in the inventory, not a right bit.

A bag is the same kind of courtesy. `Swords/Mid Sword` in the old `weapons.txt` is a name with a slash, and the client of that era filed it under Swords. The Reborn file is `weapon` plus the sanitized name plus `.txt`. The bag exists on the wire, in the name, and dies at the filesystem. Ash and Phoenix will both serve a weapon whose real name has a slash. Only the client will draw the bag.

The dash is the whole lesson of the prefix. A thing in the weapon list is not always a weapon. Sometimes it is a clock that had to wear a weapon's clothes to follow you, and the dash is how it asks not to be shown.

---

*End of chapter 36.*
