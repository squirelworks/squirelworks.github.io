# GraalLStory

## Chapter I — The First Line

The world did not begin as a picture.

That is the first thing worth knowing, and it is easy to miss, because the folder looks like a picture. Open it and the eye goes to `pics1.png`, a sheet two thousand and forty-eight pixels across and five hundred and twelve tall, pale and busy, cut in the mind into little squares. Beside it sits `picso.png`, smaller, the offline set. Further in are heads, bodies, swords, a font made of letters, a bomb drawn twice so it can flicker. A person who has only played the game will say: there, that is Graal. The grass is the grass. The water is the water. Walk on the green and stop at the brown.

The platform does not think so.

Graal, as it was shipped by Linux Cyberjoueur — Stéphane Portha managing, Stefan Knorr the technical director — is a client directory before it is a kingdom. In the tree kept here the clients are three executables with version numbers worn on the filename: `Graal_2171.exe`, build 2.171; `Graal_222.exe`, build 2.22; `Graal_231.exe`, build 2.31. Next to them, not inside them, are the tools that made the kingdom editable. `GraalEditor.exe`, which is a Thinstall package and not the Delphi image a decompiler first thinks it has opened. `GraalShop.exe`, whose name is a pun and not a counter: it edits animations. `RemoteControl.exe`, the staff desk. `gif2mng.exe`, a small converter with a date in its banner, June of 2004. Under them, `generators/`, where terrain and dungeon and level are born as files. A `readme.txt` still explains HawkVoice, a joystick, and `dinput.dll`, and names the keys: F1 for options, F4 for the editor, F5 to load a level, arrows or IJKL to walk, S or space to strike, A to act, M for the map.

None of that is the world. The world is a number.

---

A tile in this platform is sixteen pixels on a side. The standard sheet is one hundred and twenty-eight tiles across and thirty-two down. Multiply those and you get four thousand and ninety-six. That is the whole vocabulary of the ground. Tile zero is the first cell of `pics1.png`. Tile one is the cell to its right. Tile four thousand and ninety-five is the last cell, the bottom-right, the one the codec will later spell `//`. The client does not store the pixels of the cell inside a level. It stores the index. Paint the sheet a different color and every board that points at it changes clothes. Leave the sheet alone and change an index, and the grass becomes a wall without a single pixel having moved in the picture.

There is a second sheet for the offline tutorial, `picso.png`, one thousand and twenty-four by five hundred and twelve. The line that binds it is short enough to memorize:

```
picso.png,offlinetutorial,1,0,0
```

Image, then the level-name prefix, then the type, then an optional origin. Type 0 is the old Graal order, the order of `pics1.png`. Type 1 is the new order. A later record, `addtiledef2`, can paint a rectangle over the base sheet, which is how a chair or a lamp is replaced without shipping another four thousand tiles. The board still does not care. It only keeps the id.

Under `levels/` the art is sorted the way a costume trunk is sorted. Ninety-three files of gani, forty-nine midis, thirty-five heads, bodies, swords, shields, hats, horses, baddies as one sheet each, emoticons, bombs that are called bomys, languages in nine files from Deutsch to Svenska. `maps/` holds the big map, the minimap, and `offlinetutorial.gmap`. `sounds/` holds a hundred and four waves. None of these folders is the board. They are what the board points at when it wants to be seen or heard.

The long changelog, `newfeatures2001.txt`, is where the format was written down for the people who would have to live with it: the signature `GLEVNW01`, the base64 tile pair, `addtiledef`, the type list behind `setshape2`, the `tileobjects` folder the editor stamps from. Later years have their own notes. Two thousand and one is the useful one.

---

A level is sixty-four by sixty-four.

Not sixty-four pixels. Sixty-four tiles. A board one thousand and twenty-four pixels on a side if you draw it at the native scale, and small enough that a person can hold the whole of it in the head as a room. Step off the edge and you have not walked into a larger continuous field. You have asked a link to load another file. The platform is a quilt of rooms, each room a text file, each text file beginning, when it is honest, with eight characters:

```
GLEVNW01
```

Edit it in something that does not wrap lines. That warning is in the official note, and it is not fussiness. A wrapped line is a broken run, and a broken run is a different room.

On disk the file is larger than the thing the server sends. The server still moves a payload the size of the old binary `.graal`. The text form is the form a person can open. The loader in the SDL fork — the client called 2dadventureclient, a C++ branch of GS2Emu, credited to xx-shitai-xx on work by Joey, Nalin, Codr, and the rest, standing on 39ster — chooses its reader by extension, or, if the extension is a stranger, by those eight bytes. `GLEVNW01` is the text loader. `GR-V1.01`, `GR-V1.02`, and `GR-V1.03` are the binary Graal loaders. `Z3-V1.03` and `Z3-V1.04` are the Zelda loaders, because the family is older than the one game. The official Graal.exe does not load that SDL tree, and the SDL tree does not load the official folder. They agree about the board, the four thousand and ninety-six ids, and the idea of a script. Agreement of that kind is what a platform is.

A board line looks like this:

```
BOARD x y width layerindex tilesdata
```

One horizontal run on the background. `tilesdata` is `width` times two characters. Each tile is a twelve-bit index packed as two base64 characters, the high six bits first. The alphabet is the ordinary one:

```
ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/
```

`AA` is tile 0. `AB` is tile 1. `//` is tile 4095. The client alphabet in `TLevel.cpp` appends a trailing `=`, which is not part of the official sixty-four. The loader ignores a `BOARD` line unless it has six tokens, the run stays inside x from 0 to 63, and the data is at least long enough. The tile lands at `levelTiles[x + y * 64]`. The layer index is parsed and not used. A level, in the memory that walks, is a flat array of four thousand and ninety-six small integers, and then the things that stand on them.

That is the whole trick of the first line. Eight characters to say which century of the format you are in. Two characters to name a tile. Sixty-four rows to name a room.

---

Now the part that surprises people who trust their eyes.

The client does not inspect the tileset image to decide if you may walk. Collision is a second table, four thousand and ninety-six bytes, indexed by the same id the board stored. In this tree it lives as `tiletypes[]`, copied from the standard sheet, and again as `share/tiledefs.txt`, the same bytes written in decimal, one hundred and twenty-eight to a line, which is the width of `pics1.png`.

The movement code keeps two tests.

A foot is on a wall if it has stepped outside the board, or if the type byte under it is greater than or equal to twenty. A foot is on water if the type byte is exactly eleven. Everything else, in this client, is ground you may cross — including types the official list gave special names and this movement simply ignores.

Count them. Eight hundred and twenty-three tiles of type 0, the plain nonblocking. Forty-seven tiles of type 11, the water. One hundred and twenty-nine of type 20, which the old note called a throw-through fence and this client calls a wall. Eighteen of type 21, the jumping stone, also a wall here. Two thousand nine hundred and fourteen of type 22, the blocking tile, the great mass of the sheet. Wall ids come to three thousand and sixty-one. Water ids, forty-seven. Walkable ids, nine hundred and eighty-eight. The official `setshape2` list is longer than the predicates: chair is 3, the two halves of a bed are 4 and 5, swamp is 6, lava swamp is 7, near water is 8, lava is 12. Those bytes are stored. This client's walk does not consult them. Types 2 and 9 are named in the old list and do not appear in the table at all.

There is a further trap for anyone who has read a decompile of Graal.exe around 2.05. That note describes a body-block mask, a grid of blocked and free for tileset types 1 and 2, one thousand seven hundred and twenty-five blocked and two thousand three hundred and seventy-one free. It is not this table. Stock selection there is a different line, `pics1.png,,0`, and type 0 walks only if the id sits in sorted lists the decompile did not emit. Two masks can both be true of Graal and false of each other. The platform is old enough to have meant both.

So: the picture proposes. The id disposes. The type byte judges. A beautiful wall that was given type 0 is a painting you can walk through. A blank-looking cell whose id maps to 22 is a shut door. Understanding the platform begins at that refusal to let the pixel be the law.

---

A room is not only floor.

After the board, the file may carry the other citizens, each in its own section, each ended when an end-word is required.

A `LINK` is a rectangle that changes the level: destination, x, y, width, height, and the place you arrive. Destination and arrival must not contain spaces. This is how the quilt is sewn. Stand in the rectangle and the client loads another `GLEVNW01`, another sixty-four by sixty-four, another array. The map a player sees — big map, minimap, the gmap on the list — is an index of these files, not a larger array of tiles.

A `SIGN` is text hung in the air at a tile, a body that may be empty, closed by `SIGNEND`.

A `CHEST` is an item at a tile, a name or a number from 0 to 24, and a sign index. Unknown item names are dropped. The chest does not survive a vocabulary the loader does not share.

An `NPC` is an image, a position that may be fractional, and a script between the line and `NPCEND`. A hyphen means the figure has no image. The script is the part of the platform that talks. The old manual is `npcprogramming.doc`. In the SDL fork the same idea is wired through V8, with weapons and a local player owned by an object that is still called `TClient`, because the client was a server with a window bolted on. `TLevel` is one board. `TGameWindow` is the SDL front, twelve hundred and eighty by seven hundred and twenty, Guichan widgets, a chat field, and the blit. The tileset that window asks for by name is not even in its tree. It still decides walls from the hardcoded table.

A `BADDY` is a type, a name or a number from 0 to 9, and verses, closed by `BADDYEND`. The verses may be shortened. The end-word may not.

These are not decorations on the board. They are the board's other columns. A level file is a small database that learned to look like a letter.

---

Here the first chapter has to tell a warning, or every later chapter will be misunderstood.

Three writers emit levels. They do not emit the same level.

The client writer, and the dungeon generator after it, speak `GLEVNW01` with base64 runs: two characters a tile, a `BOARD` line that is a horizontal strip. The terrain generator also writes `GLEVNW01`, but its board is sixty-four rows of tile 0 — one hundred and twenty-eight `A` characters after `64` and the row — and the actual land is a `HEIGHTS` block, nine lines of nine numbers, closed by `HEIGHTSEND`, with a `LINK` on each edge that has a neighbor. There is no `NPC` section in that image. The dungeon writer emits one base64 board of sixty-four by sixty-four, edge links, and `NPC` blocks. Stamp 0 becomes a four-by-four ground fill. Stamp 1 is a hole and is not written.

The editor is the third shape. `GraalEditor.exe` opens `*.graal` and `*.nw` with one filter and treats both as text. It does not require the signature. Its `BOARD 0` is the tile layer as sixty-four lines of sixty-four decimal indices, not a base64 run. Heights are a `TLevelHeights` overlay, not a second board. The section words are the same words — `LINK`, `SIGN`, `CHEST`, `NPC`, `BADDY`, `LEVELNAMES` — but the field order is the order the dialogs collect. A file of raw indices will not pass the SDL loader until it is rewritten as base64 runs. A client `.nw` will not open as the editor's decimal grid. Do not feed one writer to another loader and expect a board.

The same split waits one directory up, in the map. A `.gmap` begins `GRMAP001`. The dungeon generator writes width, height, and `GENERATED` set to the bottom-right level name, not the number one; the client rebuilds the grid from that name. The terrain generator writes `GENERATED 1` as a flag, then seed, base, chaos, a heightmap, and one level name per row. Same signature. Not the same keys.

This is the manners of the platform. A signature is a doorplate. It is not a promise that the room was furnished by the same hand.

---

If you walk the folder with that in mind, the rest of the tools stop being a pile and become a sequence of rooms off the same hall.

The editor is the room where a person paints decimal indices and stamps from `tileobjects/`, and where the document is a `TAdventureLevel` inside a form called `TAdventure`. The file in `graal/` is packed; the Delphi image is the unpacked one. Trust the package and you will document a stub.

The shop is the room where a figure learns to move. `GraalShop.exe` is a Delphi GANI editor. Sprite mode begins `GANI0001`. Movie mode begins `GANI0002`. A sprite line names a sheet and a rectangle. A body is `ANI` until `ANIEND`, or `MOVIE` until `MOVIEEND`. The actors are a character, a sprite, a sound, a text. Ninety-three files under `levels/ganis/` are the wardrobe the board's NPCs borrow when they want to be more than a standing image.

The staff desk is the room with two sockets. Remote Control keeps a console, a socket for the RC line and a socket for the NPC line, and speaks the old text codec: a packet id plus `0x20` so the byte stays printable, a length byte plus `0x20`, a fourteen-bit integer as two bytes each minus `0x20`. The first line of a session carries the key. Compression is chosen by size, then an even mode is XOR-encrypted with the Borland generator, state beginning at `0x04A80B38`. Login on the NPC socket starts `NCL11012`. None of that is walking. It is how a person with rights reaches into the quilt without standing on a tile.

The generators are the rooms where a world is proposed in bulk. Terrain is plasma, midpoint displacement, a nine-by-nine height field, then a gmap. Dungeon is an eight-by-eleven stamp sheet and sixteen places. Levelgen is an eight-bit map turned into `.nw`, fourteen calls, a button. gif2mng turns a GIF into a PNG if there is one frame and a MNG if there are more, and with `-b` snaps a palette toward the seven Graal body slots and forces transparent index 2. They all write files the client might load. They do not all write files the client will load unchanged.

And under all of it, still, the first line.

A player presses an arrow. The window asks where the foot is. The foot is a pair of numbers on a sixty-four by sixty-four array. The array holds an id. The id indexes a type. The type is tested against twenty, and against eleven. If the foot has entered a link rectangle, another file is named, and that file is expected to begin `GLEVNW01`, and to mean by that word what this loader means, which is not what every writer means. The sheet is blitted. The wav is played. The gani advances a frame. The player believes they walked on grass up to a wall.

They walked on an index, up to a byte.

That is the platform. The rest of the novel is the other doors off the hall: the animation that is not a shop, the desk that is not the game, the generators that share a signature and refuse a common board. Each of them assumes you already know the first line, and what it is not allowed to promise.

The grass can wait. The signature cannot.
