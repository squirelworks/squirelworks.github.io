# GraalLStory

## Chapter VI — The Package That Is Not the Editor

The sixth door is a lie you can open.

`GraalEditor.exe` in the client folder is one million, thirty-four thousand, six hundred and thirty bytes, and it is not the editor. A Delphi decompiler rejects it. The Ghidra dump of that file is about three thousand lines of loader. The optional-header field `LoaderFlags` is reused as a file offset, `0xFC94E`, of a 56-byte package header. The magic is `0x82D0B188`. The first block is the Thinstall runtime, source path still in the image as `X:\thinstall\stub\ts_stub.cc`, along with the hook, the imports, and the file and process creators. This is the pre-VMware ThinApp stub. The editor is inside it, compressed, and the dump never saw the Delphi code, so there was no VMT to reconstruct.

Startup of the stub is short. It takes the module, XOR-decodes the environment name `TS_LOADER`, and opens that path if it is set. Otherwise it opens its own module. It reads the DOS header, seeks to the optional header, seeks to `LoaderFlags`, and requires the magic. Record 0 is the runtime itself: file offset `0x455C`, uncompressed `0x51000`, compressed `0x18A5B`. Two codecs. A leading `0xD9` is a raw copy. The stub block, header byte `0xDE`, uses an adaptive range coder. The virtual filesystem uses a second codec, marker `0xD7`, a bitstream LZ coder, not the range coder in the dump. The directory sits at `0xFC5F5`. Decompressed, it is a length-prefixed path table under `%InstallPath%`. The editor payload is 27 blocks, 64 kilobytes uncompressed except the last, total `0x1A6400`. The runtime can debug a child. This package's path is in-process decompression, not a debug unpack.

What comes out is the editor. Unpacked, `GraalEditor.exe` is 1,729,536 bytes, Borland linker 2.25, file version 2.3.1.1, internal name `Graal editor`, product name `GraalEditor`, unit `UAdventureEditor`. Beside it in the package: `hvdi.dll`, a helper with no Graal strings; `arrays.dat`, a sorted dword table; `arrays2.dat`, the list server `listserver.graalonline.com` on port 14922 and two fallbacks, plus the old account and translate URLs; two 128-byte signature files; a virtual log. The stub will say `Not ready to verify signature, must have valid public key` if you ask it to check before it can. `Setup_Graal` is the package group name. Trust the file in `graal/` and you will document a stub. Trust the unpacked image and you are finally in the room.

---

The room is a single window.

The form is `TAdventure`, caption `Graal`. Modal tools hang off it for links, signs, NPCs, baddies, and chests. Preview is DelphiX DirectDraw. Both DirectDraw 5 and DirectDraw 7 init failures are stringed, so the era had not finished agreeing which surface to draw on. Sound is BASS. Sheets are PNG, GIF, and MNG, and the failures are named: `Gif loading failed!`, `MNG loading failed!`, `Image loading failed!`. The same GANI classes as the shop are linked in — `TGraalAni`, the sprite, the step, the actor, the mod — plus a part, a sound, and an attachment, so a placed object can be previewed without a shop session. The shop was the door with the buttons. This is the door that borrowed the classes.

The open dialog accepts `*.graal` and `*.nw` as the same kind of file. The filter string is `Graal levels (*.graal, *.nw)`. Both are text. The writer does not require `GLEVNW01`. That absence is the whole argument with the first chapter. The client loader picks a reader from the extension or from eight bytes of magic, and ignores a `BOARD` line unless it has six tokens and a base64 run. The editor opens the file because the words are there. A signature is a doorplate for the client. For this form it is optional furniture.

The document is a `TAdventureLevel`. It owns the tile board, the entity lists, and the level script the tiles-array frame edits. A cache holds other levels so a link can name a destination that is not the file currently open. A `TGraalMap` stitches levels using `LEVELNAMES` and the gmap files. World view is a `*.gmap`, plus `loadgmaps.txt`, `bigmap.txt`, `minimap.txt`, and `graalmap.png`. `FILENAMECACHE.txt` is the same cache the shop uses, not a catalog you should edit by hand. `graalconfig.txt` carries the options this form shares with the client, including `dontconnectlevels`. Heads, buddy lists, ignored lists, muted lists: the editor is willing to be a small client when it is not painting.

---

What it writes is the third shape of a board.

```
BOARD 0
<64 lines of 64 tile indices>
```

Layer 0. Sixty-four lines, sixty-four decimal indices. Tile 0 is empty. A second board would be another `BOARD` index; only `BOARD 0` is stringed, so this build's writer is the single-layer board, and a `TLevelHeights` overlay kept beside it, not a second board. The tiles-array frame can show the same indices as one line plus the script array that produced them. Sheets do not live in a header field. They come from `addtiledef` and `addtiledef2` in the script. The offline sheet is `picso.png`. The picture is still not the law. The editor paints an index. The type byte, elsewhere, will judge it.

This is not terrain's sixty-four rows of `A` and a `HEIGHTS` block. This is not dungeon's one base64 board of shorts. This is not levelgen's sixty-four `BOARD` lines of two characters each. A file of raw indices will not pass the SDL loader until it is rewritten as base64 runs. A client `.nw` will not open as this decimal grid. The section words are the same words. The field order is the order the dialogs collect. It is not a byte-for-byte dump of the save function, and it is not what `TLevel::loadLevel` accepts.

A link is a warp rectangle. The dialog collects x, y, width, height, destination, arrival x, arrival y. The destination may be a level or a URL; the form will ask if you want to load the URL. Arrival coordinates accept math expressions. The hint says so. `dontconnectlevels` disables the automatic edge links, which is the editor's version of the sewing the generators did with 0 and 61. A sign is an index, a position, and a text. The text is a small markup the dialog itself documents: `#A` through `#D` for big letters, `#u` `#l` `#d` `#r` for arrows, `#h` for a head, `#4` for a ying-yang, `#.` for three dots, `##` for a literal hash, `#k` for the name of a key, `#i` for an image or a sub-rectangle. A chest points at a sign by index. `-1` means no sign. Deleting a chest does not delete the sign. The text and the box are different objects that have agreed to share a number.

A baddy is a type and three verses, bracketed by `BADDY` and `BADDYEND`. Attack, hurt, and the line said when the player is hurt. Types map to the bodies named in the image: blue, red, gray, gold, hare, lizard, dragon, octopus. An NPC is an image, a position, and a script. Browse wants a PNG, an MNG, or a GIF. `Check Syntax` runs into a yellow read-only `ErrorEdit` before the script is stored. Predefined NPCs are templates. Placed NPCs are the ones on the board. The shop copied a script and did not run it. This form checks it and still does not play the level. `LEVELNAMES` until `LEVELNAMESEND` is the list of levels that belong to the current gmap. The gmap itself is a separate file.

---

The stamp drawer is not a tileset.

Under `tileobjects/` the client ships five `GOBJSET01` files: 288 stamps, 6,948 tile cells. Standard, castle, house interior, snow, volcano. The largest single stamp in the outdoor kit is Cathedral, 16 by 12. Nothing in the SDL fork opens this folder. Each cell inside a stamp is the same base64 pair as a client `BOARD` line. The editor paints those ids onto its decimal grid. The ids still have to exist in `pics1.png` and in the type table, or a placed cathedral draws the wrong picture or blocks the wrong way. A stamp is a recipe for indices. It is not a level, and it is not a promise that the file you save will load where the recipe was encoded.

`arrays2.dat`, packed beside the editor, is the list-server table: `listserver.graalonline.com`, port 14922, two fallbacks, and the 2001 account and translate URLs. The desk from the third chapter had its own server list and two sockets. This package carries the address of a list, and the signatures it is not yet ready to verify. The editor can look like a client. It is not the staff desk, and it is not the walker.

---

Stand in the unpacked room and the hall finally has all its doors.

The client wants eight characters and a base64 run, and judges a foot by a type byte. The shop wants `GANI0001` or `GANI0002`, four direction rows, and a script it will copy. The desk wants a byte plus `0x20`, a first line that carries the key, and a second socket that has said `NCL11012`. The generators want the same two signatures and three different boards. The converter wants color type 3 and a hole at index 2. The editor wants the section words, a decimal grid, and a package you have to open before you can believe the file is the program.

A person who generates a cave, opens it here, and saves, has translated between handwritings whether they meant to or not. A person who paints a cathedral from the stamp drawer and drops the file on the SDL loader has not yet translated, and the loader will ignore the lines. The yellow box can say the script is fine. The type byte can still say the tile is a wall. The signature can still be missing. All three statements are true in their own rooms.

The package was the door. The editor is the room behind it. The next small room is the stamp drawer itself: five files, a magic of their own, and 288 recipes that become indices only after a hand agrees to place them.
