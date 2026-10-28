# Chapter 30 — The String the Server Builds

The server does not run the script. It does decide which half of the string exists.

`TNPC` is given an image, a position, and a script that has already had its newlines turned into `0xA7`. Before any split, two prefixes are stolen. If the script begins with the twelve characters `singleplayer`, the level is marked singleplayer and a flag remembers that this NPC modified the level. If it begins with the words that mark a sparring zone, the level is marked that, and the same flag. A script whose first line is a mode is not only a script. It is a configuration the loader was willing to read so the old files would still work.

Then the cut. If an NPC-Server is connected and the NPC did not just modify the level, the script is split on `//#CLIENTSIDE`. The part before is `serverScript`. The part after is `clientScript`. If the NPC did modify the level, both halves are the whole script, so the process and the client see the mode line. If no process is connected, there is no server half. `clientScript` is the whole string. Chapter 24 named the blade. This is the function that holds it.

`doJoins` runs on whichever halves exist. The readme's `join somefile;` is this: a line in the script names a file, and the file's text is pulled in through the filesystem before the string is stored. A script can be a directory of pieces. The join happens here, not in the client. A missing file is a join that did not happen, and the script continues without it.

`//#BLOCKPOSITIONUPDATES` is searched, not executed. If the relevant half contains it, `blockPositionUpdates` is set, and the level leader's position reports for this NPC are ignored. The marker is a comment to a person and a flag to the server, like the clientside cut. Comments are then stripped and each line trimmed, the section signs put back. `toWeaponName` looks through the client half for a weapon name to remember. The client half is measured against `0x2FDF`, 12255. Over it, a printf names the NPC or the weapon. The send clips to that length with a raw short. The process is sent the server half with a gint5 length and no clip. The client has a limit. The process does not, or rather the server does not enforce one.

The props are a person-shaped list for a thing that is not a person. Image, script, half-tile, power, gralats, arrows, bombs, glove, sword plus 30, shield plus 10, gani, a message clipped at 200, hurt deltas stored as the value times 32 plus 32, colors, nick, horse, head length plus 100. Sprite before 2.1 is the raw value. After, it is `sprite % 4`, and the comment says sprite is deprecated and now holds a direction. An NPC is packed like a player because the old client drew it like one.

This is as far as the server goes. The string is split, joined, trimmed, clipped, and stored. The next chapter is the socket that is allowed to ask for it back.

---

*End of chapter 30.*
