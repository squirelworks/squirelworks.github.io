# Chapter 11 — How to Read the Source

Eighteen thousand lines is not a book. It is a building, and a building is read by walking to the room you need, not by starting at the first brick.

The source that answers the v2 client is TheDgtl's gs2emu, under `graal gservers/TheDgtl-gs2emu-gserver-d3ecab4/server/`. About eighteen thousand lines in `src/`, thirty-four headers in `include/`, and a `versions.txt` that is a diary rather than code. Ash is the same building told again, shorter, and useful as a parallel text. The 1.3.x dumps are the building before it was a building. Phoenix is the building with the doors locked. You do not begin with Phoenix. You do not begin with the monolith. You begin with the morning of the process you have already watched from the outside.

Bring Ember if you want a map on the wall. Do not stay there. A map that is never checked against a file becomes a rumor, and chapter 1 already said so.

---

Open `main.cpp` first, and only the loop.

It is three hundred lines, and most of them are argument parsing and a plea not to click the X. The part that matters is the load of `servers.txt`, the walk from 1 to `servercount`, the `TServer` constructed with a directory name, `init`, and `boost::thread`. Then the join. You are looking for one fact: a world is a thread, and the main thread does not play. When that fact is boring, you are done with the file. The `--server` override is the side door. Note it and leave.

`TServer.cpp` next, and not all of it. `operator()` is the thread body: `doMain`, the broom, the restart. `doMain` is the five-millisecond `select` and the second-flip into `doTimedEvents`. `onRecv` is the hallway, the id search that starts at 2, the player constructed as `PLTYPE_AWAIT`. `doTimedEvents` is the clock: list, players, levels, Northwest time, the three-minute resync, the five-minute reload and the death of empty instances. Skip the folder loader until a file send fails in your hands. You are building a picture of the day. The day is short. If the file starts telling you about weapons, you have walked past the chapter.

`CSocket.cpp` is optional and short in the part that matters. `CSocketManager::update` is the ear: fd sets, `select`, `onRecv`, `onSend`, new stubs appended after the walk so the ear is not rewritten while it listens. Read it once so the five milliseconds have a body.

Stop. You now know how a second is spent. Do not reward yourself by opening `TPlayer.cpp` at the top. It is the longest file in the tree, and the top is not the login.

---

The alphabet, before the sentence.

`CString.h` for the arrows. `operator>>` is the costume. `operator<<` is the naked big-endian integer. If you remember one thing from the headers, remember that the arrows point at opposite centuries. Then `CString.cpp`, the block commented Additional Functions for Data-Packing (GRAAL). `writeGChar` through `writeGInt5`, and the comments that give the maxes, including the gint5 comment that promises a number the `int` return cannot hold. Read `writeShort` beside them so the frame length stays naked in your mind.

`protocol.py` in Ash is the same page in Python. Read it after the C++, not before. If the Python looks cleaner, good. Then go back and see what the cleaner version changed, because one of the things it changed is a bug.

`IEnums.h` is a dictionary, not a chapter. You will live in it. Do not read it through. Search it. `PLTYPE_`, `PLO_`, `PLI_`, `PLPROP_`, `SVO_`, `SVI_`. The outbound list ids and the inbound list ids do not share a numbering. `SVO_PING` is 16 and `SVI_PING` is 99, and that single fact will save you a night.

`TAccount.h` holds the rights bits, `PLPERM_*`, and the prop ids. Search it when a chair refuses you. Do not memorize the mask.

---

The sentence, which is the login.

`TPlayer::parsePacket` in `TPlayer.cpp`, only the branch where the type is still `PLTYPE_AWAIT`. The comment is the theology: the first packet is always unencrypted zlib. Then jump to `msgPLI_LOGIN` in the same file, around the two-thousandth line. Read it to the end of the function and no further. The shift, the generation switch, the key rule, the eight raw characters, the gchar lengths, the NPC-Server's gshort port, the list check, the `TODO: localhost mode`. That is chapter 4, in the original voice.

`TPlayerLogin.cpp` is the welcome, and it is a separate file on purpose. `sendLogin` is the last doors and the signature, with the comment that 73 means more than eight players. `sendLoginClient` is the props mask, the civic notices, the deletion of Bomb and Bow, the warp. `sendLoginRC` is the space for a level name and `rcmessage.txt`. `sendLoginNPCServer` is the flags and the gmap list. Three welcomes. Read them as three welcomes.

`versions.txt` beside the sources, when a token confuses you. Several 2.1.0 builds all admit `GNW31101`, and the note is not polite. A token is not a version. `IUtil.cpp` is where `getVersionID` turns the eight characters into the integer the allowed-list compares. Open it when a range in `allowedversions.txt` does not do what you expect. Not before.

`CEncryption.cpp` after the switch makes sense, not before. The iterator constant, the multiply by `0x8088405`, generation 3 deleting one byte, generations 4 and 5 taking a limit from the compression type. `CFileQueue.cpp` for the size picks: bzip2 above eight kilobytes, zlib above fifty-five bytes, and the raw short prefixed onto the result. The lock and the queue are one story. Read them as one story.

---

The body, which is props and a board.

`TPlayerProps.cpp`, `getProp` first. Nickname clipped at 223. Hearts doubled on the way out. Sword plus 30. Shield plus 10. Head length plus 100. X and Y times two. Rating and deviation packed into one gint3. The level name lying if you are on a gmap. Then `setProps`, and only the cases you have seen misbehave. A wrong width eats the next id. When a player appears with someone else's nick, you are in this file.

`TLevel.cpp` for the file. `loadLevel` dispatching on extension and on the eight-character header. `GLEVNW01` as text: `BOARD` with two base64 characters per tile, `LINK` skipped if the destination is not in the filesystem, `BADDY` until `BADDYEND`, `NPC` until `NPCEND` joined with `0xA7`. `getBoardPacket` writing the raw 8192 bytes. The Zelda loader, if you are curious, for the comment that just says `WTF`. You do not need the 12-bit codes to stand in the start level. You need them the day a `.zelda` file will not open.

`TLevelBaddy.cpp`, `TLevelLink.cpp`, `TLevelSign.cpp`, `TLevelChest.cpp`, `TLevelHorse.cpp` are the neighborhood. Open the one whose packet you are staring at. `TMap.cpp` when a gmap replaces the level name. Not before.

Warp is back in `TPlayer.cpp`: `warp`, `setLevel`, the unstick level, the singleplayer clone, the group instance. Read it the day a login says no level available, or the day two people on a group map cannot see each other.

---

The other sockets, which are smaller buildings.

`TServerList.cpp`. `connectServer` for the letter order: HQ password before `NEWSERVER`, or the name comes out wrong. `doTimedEvents` for the thirty-second ping and the five-minute census. `msgSVI_VERIACC2` for the exact string `SUCCESS`, the id zeroed so a failure will not save. `msgSVI_FILESTART3` and its siblings for the global heads dropped into `world/global/`. The deprecated handlers that only log. This file is the clerk. It is seven hundred lines. You can read it in a sitting, which is why it was saved for after the login.

`TPlayerRC.cpp`. The `__admin` list, the protected files, the rights checks, `setPropsRC` and the comment that says kill the bomb dead. Search for `hasRight` rather than reading straight through. The chair is a stack of bits. The file is the stack written out.

`TPlayerNC.cpp`. `sendNC_Levels` calling `reload`. `msgPLI_NC_QUERY` and the switch. `sendNCAddr` gated on `PLPERM_NPCCONTROL`. This is the third species. It is a short file. Read it after you have seen a client login, so the contrast is obvious: no list, no board, a port, a push.

`msgPLI_TRIGGERACTION` in `TPlayer.cpp`, the block that checks `loc[0] == 0` and then the `gr.` sentences. Read it with `serveroptions.txt` open, so each bool has a body. The hacks are not a mystery. They are a function with the defaults written beside it.

`TWeapon.cpp` and `TNPC.cpp` when a script does not run. Not on the first week.

---

Only then the monolith.

`linuxgserver131/gserver.cpp` is the animal with one ear. Login, movement, and chat in one file, `pascalstrings.cpp` beside it, zlib borrowed. You are not reading it to find a better design. You are reading it to see what gs2emu pulled apart. Search for the accept. Search for a packet switch. Notice that there is one world. Sidrax, `sidrax-v1.4-srv-src-1.3.9/src/`, is the same family after it learned to breathe: `levels.cpp`, `npcs.cpp`, `graal_mysql.cpp`, `encrypt.cpp`. The Win32 1.39 tree is the same shape with different manners. `gservernwsrc` is the Northwest habit of objects and Pascal strings.

Read these for genealogy, not for the v2 path. A thing that confuses you in Reborn — the plus-thirty-two, the length-then-bytes, the single listen socket — is often obvious here, because it has not yet been given a class name. A thing you want the v2 client to do — generations 4 and 5, `servers.txt`, the RC browser — is not here. Do not stay.

Ash, the second time, is the check. `handle_login` beside `msgPLI_LOGIN`. `serve_world` beside `operator()`. `extras.py` beside the list, the RC, and the NC files. Every seam you marked in chapter 10 should be visible with the source on one side and the Python on the other. If Ash is easier, let it be the index. If Ash and the C++ disagree, the C++ has been in the hallway longer, except where the binary is newer than the dump. That exception is the next room.

---

A way to keep from drowning:

One question per sitting. How does a socket become a player. How does a heart get doubled. Why a link to a missing level is not a door. Write the answer in a sentence before you open the next file. The files that are not on this path — translations, the word filter, UPnP, plugins, md5 — are real, and they are not why the grass arrives. Leave them until a log line names them.

The dump is the readable coat of the engine Phoenix runs. It is not the binary. A 2.4 fix that is not in the dump will not appear no matter how carefully you read `TPlayer.cpp`. The revision packages and `gserver_2.4.0` are silence with a world beside them. Reading the source teaches you what the silence is saying. It does not teach you the sentences the silence added after the dump was cut.

That is the last room. The compiled silence, and how to start looking at it without pretending a hex dump is a novel.

---

*End of chapter 11.*
