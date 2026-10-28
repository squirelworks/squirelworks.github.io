# GraalLStory

## Chapter VIII — The Foot

The eighth door is the one that walks.

The program is called 2dadventureclient, and it is not Graal.exe. It is a C++ fork of GS2Emu, the open server that began with 39ster, with a local player and an SDL window bolted on. The header credits xx-shitai-xx, on work by Joey, Nalin, dufresnep, Codr, and Marlon, and thanks Agret, Beholder, and Pac for the old gserver. It does not load the official client folder. It speaks the same board, the same four thousand and ninety-six ids, and the same idea of a script. Agreement of that kind is what the first chapter called a platform. This is the walker that has to live by it.

`TClient` is still the server object. It owns the filesystem, the level cache, the NPCs, the weapons, and the local player. `TGameWindow` is the front: SDL 2, or SDL 1.2, twelve hundred and eighty by seven hundred and twenty, Guichan and Guisan widgets, a chat field, and the blit. `TLevel` is one sixty-four by sixty-four board. The official client named F4 for the editor, F5 to load a level, IJKL as well as the arrows, S or space to strike, A to act, M for the map. This window reads the arrow keys for walking. The rest of the liturgy is not in the loop.

A loaded board is `short levelTiles[4096]`, row-major, index `y * 64 + x`. Each short is a tile id, 0 through 4095, into a tileset. Chests, links, signs, baddies, horses, items, NPCs, and board changes hang off the same level as vectors. Baddy id 0 is left null on purpose, because the real client treats id 0 as broken. The starter level under `bin/data` is `world/onlinestartlocal.nw`. The desk, before any packet, named the same place with a different extension: `onlinestartlocal.graal`. Two handwritings for the room you appear in. The tileset the window asks for, `zold_tiles_dusty_01.png`, is not in this tree.

---

The loader is the bouncer the other doors have been failing.

`TLevel::loadLevel` picks a reader from the extension, or, if the extension is a stranger, from eight bytes of magic. `.nw` and `GLEVNW01` take the text loader. `GR-V1.01`, `GR-V1.02`, and `GR-V1.03` take the binary Graal loader. `Z3-V1.03` and `Z3-V1.04` take the Zelda loader, because the family is older than the one game. A `BOARD` line is kept only if it has six tokens, the run stays inside x from 0 to 63, and the data is at least `width` times two characters. The tile lands at `levelTiles[x + y * 64]`. The layer index is parsed and not used. `AA` is 0. `//` is 4095. The client alphabet appends a trailing `=`, which is not part of the official sixty-four.

The editor's decimal grid does not pass. Terrain's sixty-four rows of `A` with no `BOARD` keyword do not pass. The drawer's `GOBJSET01` is not a level and is not opened. Dungeon's one base64 board can pass, if the line has the six tokens. Levelgen's sixty-four `BOARD` lines can pass. A signature is necessary and not sufficient, which is what the workshop chapter was trying to say with three files on a table. This function is the table.

What arrives, if it arrives, is ids. The bush that was `ACAD` over `ASAT` is now 2, 3, 18, 19, and the word Bush is already dead. The cathedral is one hundred and ninety-two shorts. The height field, if some other writer put it in the file, is not what this walk consults.

---

Then the foot, which is one point.

Arrow keys set a pixel step of `16 * 0.30` and a sprite direction. 0 is up. 1 is left. 2 is down. 3 is right. That is the shop's row order, not Seihai's. The wall test is not a box and not a sweep. It is the feet:

```
testx = (pixelX + moveX + 32) / 16
testy = (pixelY + moveY + 44) / 16
```

If `isOnWall(testx, testy)` is false, the new position and the sprite — `idle` or `walk`, the names the shop renames when it enters movie mode — are written back through `setProps`. If the test is true, the step does not happen. There is no separate slide, no corner resolution, and no water slowdown in this loop. `isOnWater` exists and is exported to V8. The keyboard loop does not call it. A lake and a floor are the same to the arrows. Only the wall is real.

The wall test itself is the two lines from the first chapter. Outside the board, on x or y, the foot is on a wall, so the edge of a room is solid until a link says otherwise. Inside, the type byte at `levelTiles[round(y) * 64 + round(x)]` is a wall if it is at least 20. Water is a different function, type exactly 11, and it does not range-check: a bad coordinate reads off the array. The bush is a wall because 2 and 3 are type 20 and 18 and 19 are type 22. The stamp did not say so. The foot does not know there was a stamp.

Official Graal.exe, around 2.05, had a different mask: a body-block grid, and type 0 walking only if the id sat in sorted lists a decompile did not emit. This client does not use that mask. Chair, bed, swamp, and lava are stored and ignored. Type 12, which the old note called lava, is walkable here. The volcano drawer can hand this foot a lake of fire it will cross. The picture will look like fire. The byte will say floor.

---

Drawing is a second disagreement, and it is in the blit.

Tiles are 16 by 16. The camera is the local player's pixel position minus half the window. Neighbor levels are drawn from the gmap when the level has one. Otherwise only the current room is drawn. The source rectangle for a tile id on a sheet of pixel height H is a 16-column packing: the id is cut as if the sheet were sixteen tiles wide. Official `pics1.png` is 2048 by 512, one hundred and twenty-eight columns by thirty-two rows, id `row * 128 + col`. Drop that sheet in under this formula and every id past 15 is mis-cut. The bush's four ids would sample the wrong cells. The type table would still say wall. You would bump into a picture of something else.

The closed chest stamp is hard-wired at tile (56, 15) and the open chest at (29, 19), each 32 by 32. Those coordinates line up only if the image really is the classic 128-wide sheet. The blit math and the chest coordinates disagree. One of them believes the official order. The other believes a sixteen-column order. The foot does not care. It never looks at the rectangle. It looks at the type byte.

With `V8NPCSERVER` the server wraps levels, NPCs, players, and weapons for V8. The level binding exposes `isOnWall`. A script can ask the same question the arrows ask. The shop's script block was copied and not run. The editor's yellow box checked syntax and did not play. Here the script can run, and the question it is handed is still the byte. The build notes want a V8 7.4 monolith, not a one-step CMake invocation. The walker is a server that learned to draw.

---

Press the arrow and the hall answers in order, then goes quiet.

The window adds a step of not quite five pixels. The feet are computed, thirty-two across and forty-four down from the sprite's origin, and divided by sixteen. The level is asked. The level indexes the array. The array holds an id the drawer forgot, the editor painted in decimal, the generator may have written as `AA`, and the loader kept only if the line was the right shape. The type table says 20 or more, or it does not. If it does not, `idle` becomes `walk`, which is a gani the shop could have opened, four rows, up left down right, a shadow at a dx and a dy, a wait counter that started at 1. The sheet is blitted with the sixteen-column cut. The sound, if a frame owned one, is not this loop's business.

If the feet have entered a link rectangle, another file is named. It will be expected to begin `GLEVNW01` and to mean by that word what this loader means. The desk could have uploaded that file, if the rights string contained `w`. The converter could have made the sheet, if someone remembered index 2. None of them are in the step.

The grass was a picture. The bush was a name. The foot is one point, and the point only knows a byte.

The next door is the last one this hall was built to open: one keypress, followed back through every signature, until the byte and the picture and the packet are the same step and still not the same thing.
