# Chapter 7 — The Staff Door

The other client does not want the grass. It wants the folder the grass lives in.

It arrives by the same hall as a person. Shift 1, `PLTYPE_RC`, generation 3, no key byte, so the version token is the next eight raw characters and you must not steal them. Or shift 6, `PLTYPE_RC2`, generation 5, and this one does take a key. The list, if the house is the C++ house, still has to say `SUCCESS`. The species check in the duplicate-account loop treats an RC as a different animal from a client, so the same account may sit in the grass and in the staff chair at once, and only a second RC will be told the account is already in use.

The gate is two lists, and they are not the same list.

`isStaff` reads the `staff` option in `serveroptions.txt`, splits on commas, and compares the account name without caring about case. Phoenix's readme tells you to put your account on that line. That is the guest list for the door. It is not the set of things you may do once inside. What you may do is `LOCALRIGHTS` on the account, a bitfield, `PLPERM_*` in `TAccount.h`. Warp-to is `0x00001`. Warp to a player is `0x00002`. Summon is `0x00004`. Update level, disconnect, view attributes, set attributes, set your own, reset them. Admin message. Set rights. Ban. Comments. Invisible. Modify staff account, `0x04000`, the bit that walked through an IP ban in chapter 4 and a player ban in chapter 5. Set server flags. Set server options. Set folder options. Set folder rights. NPC control, `0x80000`. `PLPERM_ANYRIGHT` is `0xFFFFFF`, the mask that means all of them, which is not quite the `0xFFFFF` the NPC-Server was handed, and the one-bit difference is the sort of thing you only notice when a script and a process disagree about a door.

`sendLogin`, before the RC welcome, asks both lists. Not staff, or not on the account's admin IP list and the list is not the wide-open `0.0.0.0`, and the attempt is written to the RC log and the socket is told it does not have RC rights. Ash checks staff and refuses with the same sentence. The IP list is the C++ house's extra lock. A name on the staff line is not enough if the account file says the chair may only be sat in from certain addresses.

---

The welcome is a chat line and a costume.

`sendLoginRC` sets the nick to the account name if none was loaded. It sets the level name to a single space, which is the same lie chapter 5 told you an RC receives when it asks for `PLPROP_CURLEVEL`. An RC is not standing anywhere. It sets the head image to `staffhead`, default `head25.png`, so the other staff, and the player list, can see the chair. It loads `config/rcmessage.txt` and sends it as `PLO_RC_CHAT`. Then it tells every other RC, `New RC:` and the account name. There is no board. There is no warp. The grass is not the product. The product is a socket that may now ask for options, accounts, and files, and will be refused per question if the bit is missing.

The refusals are dull and that is the design. Server options get and set require `PLPERM_SETSERVEROPTIONS`, and a client that somehow asks is refused for being a client. Folder config requires `PLPERM_SETFOLDEROPTIONS`. Disconnect requires `PLPERM_DISCONNECT`. Update level requires `PLPERM_UPDATELEVEL`. Admin messages require `PLPERM_ADMINMSG`. Flags require `PLPERM_SETSERVERFLAGS`. Viewing another player's attributes requires `PLPERM_VIEWATTRIBUTES`. Setting them requires `PLPERM_SETATTRIBUTES`, unless you are setting your own, which requires `PLPERM_SETSELFATTRIBUTES` instead. Resetting requires `PLPERM_RESETATTRIBUTES`. Deleting an account, or reading the account file through the RC, requires `PLPERM_MODIFYSTAFFACCOUNT`. The default account is named in a comment: only that bit may alter `defaultaccount`. A missing bit is not an error the client is argued with. The function returns, and the chair does not move.

Some options are staff-of-staff. The array `__admin` in `TPlayerRC.cpp` lists the keys a person without `PLPERM_MODIFYSTAFFACCOUNT` may not write: name, description, url, the ips and ports, max players, onlystaff, nofoldersconfig, the trigger hacks, the flag hacks, the share folder, the language. The public face of the world and the locks on the other doors are not ordinary options. They are the options that change who the directory thinks you are, and who may come in.

---

The files are the part the v2 client already knew, and the staff client knows as a browser.

A player asks with `PLI_WANTFILE`. `sendFile` asks the filesystem, and the filesystem is not a directory listing of `world/`. It is the index built from `foldersconfig.txt`. A line is a type and a glob. `head` and `heads/*`. `body` and `bodies/*.png`. `level` and `*.nw`. `file` and `ganis/*.gani`. Comments after `#` are cut. The type selects which `CFileSystem` receives the directory and the wildcard, and the same pair is also added to `filesystem[0]`, the general index. `find` walks the matching index without caring about case. If `nofoldersconfig` is on, the server falls back to adding `world` and any `sharefolder` list, and the typed indexes stay empty. The five-minute drum from chapter 2 resyncs these indexes, which is how a head dropped in the folder becomes a head the server will admit to having.

Miss the find, and the client gets `PLO_FILESENDFAILED` and the name. An empty load is the same failure. A file over three megabytes is sent anyway, with a warning in the log that large files are the cause of many bug reports. The packet budget is the interesting number. The header is counted as one byte for `PLO_FILE`, five for the modtime, one for the name length, the name, and a newline. If the body is over 32,000 bytes, the file is big. Clients before 2.14 cannot take a large file. For them the flag is forced off, and a body over 64,000 bytes fails outright. Clients before 2.1 are not sent the modtime, and the length math subtracts the five bytes so the `PLO_RAWDATA` size still matches. A big file is announced with `PLO_LARGEFILESTART` and the name, then `PLO_LARGEFILESIZE` as a gint5 — the five-byte costume, finally carrying a length — then chunks of 32,000, then `PLO_LARGEFILEEND`. Each chunk is a `PLO_RAWDATA` size and a `PLO_FILE`: gint5 modtime, gchar name length, name, bytes. The modtime is why a client can decide it already has the file. Forget it, and every login re-downloads the grass.

The staff browser is the same send, aimed at a person who asked for a folder rather than a head. Not every file is willing. `__protectedFiles` names `accounts/defaultaccount.txt`, `config/adminconfig.txt`, `config/allowedversions.txt`, `config/rchelp.txt`. `__importantFiles` is a longer list — folders, ip bans, the RC message, the rules, the server message, the server options — and each one is paired with the bit required to touch it. Folder rights on an account are a further list, a path and a wildcard and a right, so that one staff member may edit levels and another may not browse `accounts/`. The door is not a door. It is a stack of bits in front of a filesystem index.

---

Setting a player from the chair is where the old client's habits come back to bite.

`setPropsRC` skips a player-world string, reads a props blob, and feeds it to `setProps` with the RC as the author, so the NPC-Server path can tell the edit came from staff. Then it deletes every flag and every weapon on the client before writing the new lists. The bomb and the bow are hunted in both capitalizations. The comment in the middle of the function is not embarrassed: kill the bomb dead. If the new weapon list did not include it, `allowBomb` is cleared and `PLO_NPCWEAPONDEL` is sent for `Bomb`, because the client will put it back if you only deleted `bomb`. Chapter 5's welcome deleted those two names for the same reason. The staff path has simply learned that the client will try again the moment anyone edits the account. Chests are rebuilt from pairs of coordinates. Weapons are re-added, and a bomb that was intentionally in the new list is allowed through. A staff edit is a small rewrite of a person, and the rewrite has to speak the client's superstitions or the person stands up holding a bomb they were not given.

Warp from the chair, and from the client's own request, consults the bits too. Warp to a player, warp to a level, summon: each one checks `PLPERM_WARPTOPLAYER`, `PLPERM_WARPTO`, or `PLPERM_SUMMON`, unless `warptoforall` has opened the first two to everyone. A failed warp does not invent a level. `setLevel` sends `PLO_WARPFAILED` and the name. If the destination cannot be stood in, `warp` tries the level you came from, and if that is gone, the unstick level — `unstickmelevel`, default `onlinestartlocal.nw`, at `unstickmex` 30 and `unstickmey` 35. If the unstick level is also gone, the warp returns false, and a login warp that fails is the "no level available" from chapter 5. The start level is the last place the server knows how to put a person. An RC does not need it. A person whose every file has been deleted does.

---

Ash keeps this door in `extras.py`, not in the login path. The listserver, the RC browser, the folder rights, the file send: the second week of the protocol, after a v2 client can already walk. Phoenix keeps it in the binary, and in the files the binary expects — `rcmessage.txt`, `rchelp.txt`, the staff line, the rights on the account you renamed. A staff chair with no bits is a chair that can hear the RC chat and do nothing else. A bits field with no staff line is a field the door will not open to read.

You have, now, both clients the socket was willing to become. The person on the grass. The chair that can see the folder. There is a third species, shift 2, the one that does not ask the list and does not want a head image except the staff head it is given anyway. It wants the maps, the levels, and the weapons, and it wants them pushed, because it is about to be the author of the NPCs the client was told to stop editing.

That is the next room. What the NPC hears.

---

*End of chapter 7.*
