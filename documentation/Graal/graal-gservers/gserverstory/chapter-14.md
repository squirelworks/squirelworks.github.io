# Chapter 14 — The Person Between Sessions

The board is a place. The account is the person who left it.

It is a text file in `accounts/`, named for the account, and the first line must be `GRACC001`. If the file is empty, or the first line is anything else, `loadAccount` returns false and the welcome never becomes a body. The header is not a comment. It is the same kind of door as `GLEVNW01` on a level: eight characters, or in this case nine, that decide whether the rest of the file is a person. Phoenix's owner file and Ash's owner file both begin that way. A dump from the 2.17 packages begins that way. The format outlived the coats.

The name is not the `NAME` line. The load skips `NAME`. The name is the argument, which is the filename without `.txt`, which is what the client typed. The save writes `NAME` back out from the object, so the line and the file agree after the first write. Until then they can disagree, and the filename wins. Rename `YOURACCOUNT.txt` to your Graal account, as both readmes say, because the server will not read the `NAME` inside and correct the door.

A missing file is not a failure. It is a birth.

`findi` looks for `account.txt` without caring about case. If the find is empty, the path becomes `accounts/defaultaccount.txt` and a flag remembers that this person was cloned. The default is parsed. Then, if the options exist, `startlevel`, `startx`, and `starty` override the file — defaults `onlinestartlocal.nw`, 30, 30.5, the same tile the unstick level uses. Then, unless the account is load-only, `saveAccount` writes a new file under the real name and adds it to the account index. The first login is a copy. Every login after is the copy. Edit `defaultaccount.txt` if you want the next stranger to arrive a certain shape. Edit the named file if you want this person to.

`reset` is the copy done on purpose. It loads `defaultaccount` over the object, puts the old name back, and saves. That is what an RC attribute reset is willing to do to a life: keep the name, restore the template. The template is a person-shaped file. Treat it as one.

---

The fields are a line each, a word, a space, the rest.

`NICK` is the shown name, unless the load was told to ignore it, which is what an RC login asks. `COMMUNITYNAME` is read, and then a line you are invited to comment out if you ever mean to use community names sets it back to the account name. The save writes the account name and leaves `communityName` commented in the source. The field is a relic that the file still has a slot for. `GUILD` is read in the same family. `LEVEL`, `X`, `Y`, `Z` are where they stood. The load also computes `x2 = x * 16`, the pixel coordinate chapter 5 sends to a 2.30 client, so the file's tile and the newer prop are born together.

`MAXHP` is hearts. `HP` is the current heart, a float, so a half can live here even though the wire will double it. `RUPEES` is the gralat count. `ANI` is the gani, often `idle`. `ARROWS`, `BOMBS`, `GLOVEP`, `SHIELDP`, `SWORDP`, `BOWP`. `BOW` is the image, and it may be empty. `HEAD`, `BODY`, `SWORD`, `SHIELD` are filenames, `head0.png` and `body.png` and `sword1.png` until someone changes them. `COLORS` is five numbers separated by commas. `SPRITE` is the direction. `STATUS` is the bitfield, and the sample says 21, which is a particular set of bits and not a mood. `MP`, `AP`, `APCOUNTER`. `ONSECS` is the online time the clock increments. `IP` is stored as the integer `inet_addr` made, which is why a sample file can contain a negative number and still be an address. `LANGUAGE`, defaulting to English if empty. `KILLS`, `DEATHS`. `RATING` and `DEVIATION` as decimals, 1500 and 350 in a fresh file, the doubt chapter 5 lets wander. `LASTSPARTIME` is the unix time of the last spar, 0 if they have never fought.

Then the lists, one line per item. `ATTR1` through `ATTR30`, and the save only writes the ones that are not empty. `CHEST` for a chest already opened, so the level can send the opened flag. `WEAPON` for each weapon name, and the sample carries `bomb`, `bow`, and `-gr_movement`, which is why chapter 5 has to kill the first two by their capitalized names and why chapter 9 ships the third. `FLAG` as `name` or `name=value`. A flag is not a field. It is a line the script side invented and the file agreed to keep.

A blank line, and then the part that is not the body.

`BANNED` as 0 or 1. `BANREASON`, `BANLENGTH`. `COMMENTS`, which on the Phoenix file is the sentence telling you to rename it. `EMAIL`. `LOCALRIGHTS`, the mask, 1040383 on that owner file. `IPRANGE`, `*.*.*.*` on a new package so the RC lock is open. `LOADONLY`. `FOLDERRIGHT` lines, `rw accounts/*` and the rest of the tree, weapons read-only. `LASTFOLDER`, where the browser was. This block is the chair. The block above it is the person. They share a file so that a staff member is not a second species on disk, only a person with bits.

---

The save is not the load run backwards, and the difference is the point.

It writes `GRACC001` and a carriage return, every field, `\r\n` between them. `COMMUNITYNAME` is the account name, not the field that was loaded. Attributes skip empties. Chests, weapons, and flags are dumped from the live lists, so a weapon added in the session appears, and a weapon removed disappears, only when a save happens. The rights block is written after a blank line. A plugin may take the finished text and save it somewhere else, and if `SaveAccount` returns true the file is not written. The default path is `accounts/` plus the name the filesystem already knows, so the case of the filename is preserved.

Who is not saved: a load-only account. The comment says load-only or RC. The condition is `isLoadOnly`. A guest is both. The guest path, when the account name is empty, sets load-only and guest, and invents `pc:` plus a number that no one else is using, and does not write a file. A guest is a person for the session and a rumor after. The five-minute drum in `doTimedEvents` saves only if they are a client, and `loaded`, and not load-only. An RC does not get that drum. A disconnect that zeros the id, the list's failure path, was arranged so this function would not be the last thing that happens to a rejected name.

`loaded` is the bit from chapter 5. Until the welcome returns true, the account will not be saved on the way out. A person who fails in the hall does not get a file, unless they were born from the default and the birth-save already ran. The birth-save is the exception. It happens inside the load, before the list has said `SUCCESS`, on the C++ path that still asks the list. A rejected login can leave a new file behind. The id-zero on the failure path is the attempt to keep that file from being written again with a half-finished life.

Ash writes the same header and the same fields, because a client does not log into a different person. The five-minute drum is the C++ clock. Ash saves on cleanup, when the thread ends. A crash between those two is the gap chapter 2 warned about: the truth is ahead of the file. Kill the process in the middle of a sentence and the sentence is the last five minutes, or the last clean disconnect, depending on which house.

The file is the least lying object in the archive. The map lies about the level name. The prop stream doubles the hearts and adds thirty to the sword. The account writes `HP` as the heart and `SWORDP` as the power and `X` as the tile. Between sessions, this is the person. On the wire, it will be dressed again. The next room is one of the lists this file only names: weapons, the files the `WEAPON` lines point at, and the bytecode room that points at nothing.

---

*End of chapter 14.*
