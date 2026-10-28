# Chapter 13 — The Level Name Lies

A level is a room. A map is the lie you tell the client about which room it is in.

Chapter 5 already caught the lie in `getProp`. If the player is standing on a gmap, `PLPROP_CURLEVEL` sends the map name, not the level. The grass under their feet is still a file called something like `onlinestartlocal.nw`. The minimap, the player list, the other client's idea of where you are: those are told a different name, the name of the grid. The server keeps both. The client is allowed to know one of them, and which one depends on the kind of grid.

There are two kinds, and a flag that can be hung on either.

`MAPTYPE_BIGMAP` is 0. `MAPTYPE_GMAP` is 1. The header file is named `TMap.h` and the include guard says `TGMAP_H`, which is the sort of scar that means the gmap was the idea and the bigmap moved in later, or the other way around, and nobody renamed the door. `groupMap` is a bool on the same object. A group map is not a third type. It is one of the two types that has been told its levels are private.

`loadMaps` reads three options, and the three options do not load the same way.

`gmaps` is a list of names. Each name is given `.gmap` and loaded as `MAPTYPE_GMAP`. `maps` is a list of names loaded as written, as `MAPTYPE_BIGMAP`. `groupmaps` is a list of filenames, and the extension decides: `.txt` becomes a bigmap with the group flag, `.gmap` becomes a gmap with the group flag, anything else is skipped. A blank line that is only a carriage return is skipped in all three. A file that will not load is logged and deleted. The log tags them `[gmap]`, `[bigmap]`, `[group map]`. If you have ever stared at a startup log and wondered why one map printed and another did not, the extension and the option name are the whole answer.

---

A bigmap is a text file of rows.

`loadBigMap` finds the file through the file index, not the level index. Each line is `guntokenize`d and split on newlines, which is how a quoted name with a space survives. Each name is a cell. X increments across the row. Y increments at the end of the line. A cell whose name is only a carriage return is a blank: X still increments, so a hole in the town is a hole, not a place where the next level slides over. Width is the longest row. Height is the number of rows. There is no `WIDTH` line. The file is the grid.

A gmap is a file with a header.

`WIDTH` and `HEIGHT` are read and stored. `GENERATED` is read and ignored, with the comment that it is not really needed. `MAPIMG` and `MINIMAPIMG` are names of pictures. `NOAUTOMAPPING` is marked clientside only. `LOADFULLMAP` and `LOADATSTART` are marked not supported, and the load-at-start block is skipped until `LOADATSTARTEND` so the parser does not eat the rest of the file as nonsense. The levels live between `LEVELNAMES` and `LEVELNAMESEND`, in the same row language as the bigmap: untokenize, split, blank cells counted, X reset at the end of the line. The gmap is found through the level index, not the file index. Two filesystems. Two doors. A map dropped in the wrong folder is a map the option names and the find misses.

Both end as the same table. A level name points at an `SMapLevel` of `mapx` and `mapy`. `getLevelAt` walks the table for a coordinate. `getLevelX` and `getLevelY` look up a name. An empty table returns 0, which is a coordinate, and a missing name on a non-empty table is a find that the code does not check. A level named in the option and absent from the file is a quiet wrong zero. The grid is only as honest as the file.

---

The lie is told at warp, and it is told with a different packet.

If the client is 2.1 or newer and the level sits on a gmap, `setLevel` does not send `PLO_PLAYERWARP` and the level name. It sends `PLO_PLAYERWARP2`: half-tile X, half-tile Y, Z plus 50, then the gmap cell X, the gmap cell Y, then the map name. The client is being asked to stand in a cell of a picture, not in a file. Older clients, and anyone not on a gmap, get `PLO_PLAYERWARP` and the level name, the sentence chapter 5 already knows. `PLPROP_GMAPLEVELX` and `GMAPLEVELY` are the cell, kept so later sends can ask where you are without opening the file again.

This is why chapter 5's 2.31 workaround exists. The 2.31 client, and the 1.41 one, will not request the map file when `setmap` is used. `sendLoginClient` pushes every loaded bigmap at them with `msgPLI_WANTFILE`. A gmap has images named in the file. A bigmap is the file. A client that will not ask must be handed the grid or the minimap is a rumor.

Who hears you is the other half of the lie.

`sendPacketToLevel`, when there is no map, sends to people whose level pointer is the same level. A room. When there is a map, it sends to people on the same map whose cell is less than two steps away in X and less than two steps away in Y. Adjacent, including the diagonal, including your own cell. A gmap reads the other person's cell from their props. A bigmap looks the cell up from the level name. A person three cells east does not hear your chat, your bomb, your board change. They are on the same map and not in the neighborhood. The map is not a broadcast. It is a distance.

A singleplayer level refuses this. The send falls back to the room. A private clone does not leak across a grid just because the original file was listed in a gmap.

---

The group flag is how a neighborhood becomes an instance.

On warp, if the map says `isGroupMap` and the player has a group name, the level is not the shared one. It is the clone stored under `groupLevels[group][levelName]`, made on first visit, reused after. Chapter 2's five-minute drum deletes a group whose levels have all gone empty. An instance is a room that exists because someone is in it.

Before the clone is entered, anyone already drawn in the shared level is unmarked. The packet is a props lie: the level name, plus `.unknown`, length counted as the name plus one plus seven because `.unknown` is eight characters, and the coordinates. The other people are moved, on your client only, into a level that does not exist, so a cached neighbor does not remain standing in your instance. Then you are put in the clone. Two groups can stand in the same file and not see each other. The file did not split. The table did.

`triggerhack_groups` is the hack that defaults on, the one chapter 8 flagged. `gr.setgroup` and `gr.setlevelgroup` are how a script names the key the table is stored under. Without the hack, the flag on the map has nothing to put in the key. Without the flag, the hack has no map that cares. Both have to be true before a party is a place.

The group check in the send is the same key. If the map is a group map and the other person's group string differs, they are skipped, even if their cell is adjacent. Distance is not enough. Membership is the other axis. A person with no group and a person with a group are not neighbors, even on the same tile of the same file.

---

Ash loads the same three options and the same two files, in `extras.py`. A gmap is reread for `LEVELNAMES` if the first pass came back empty. A bigmap is rows. A name listed in `groupmaps` gets the flag hung on a map already loaded. The clone table and the `.unknown` unmarked-neighbor are the C++ house's careful version. The Python house has the grid. The instance, if you need it exact, is still the function in `setLevel`.

Phoenix has the options and an empty world. A map line in `serveroptions.txt` that names a file you have not dropped in `world/` is a log line at startup and a town that is only the start level. The binary will tell the lie the moment the file exists. It will not invent the grid.

You can stand in a start level and never meet this. The start level is a file. The moment two files are supposed to be one town, the level name stops being the truth and becomes a cell. The next room is the other file that lies less: the account, `GRACC001`, the person as a list of fields between sessions.

---

*End of chapter 13.*
