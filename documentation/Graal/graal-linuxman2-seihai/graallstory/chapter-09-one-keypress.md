# GraalLStory

## Chapter IX — One Keypress

The last door is not a new room. It is the arrow, followed back.

A person presses right. In the official client that key may also have been L, and the strike may have been S or space, and the map may have been M. In the SDL fork the window reads the arrows. The step is `16 * 0.30` pixels, not quite five. Direction 3 is right, which is the shop's fourth row, not Seihai's zero. The feet are one point: pixel X plus the step plus 32, pixel Y plus 44, both divided by 16. If that point is outside the sixty-four, it is a wall. If the type byte under it is at least 20, it is a wall. Otherwise the position is written back, and `idle` becomes `walk`.

That is the whole event. Everything else is a file that agreed, or did not agree, to be consulted.

---

The level had to be a level.

`TLevel::loadLevel` kept it because the extension was `.nw`, or because the first eight bytes were `GLEVNW01`. A `BOARD` line survived only with six tokens and a run of two characters a tile. `AA` was 0. The bush, if it was the first stamp, was ids 2, 3, 18, 19, and the word Bush was already dead. The array is `short levelTiles[4096]`, index `y * 64 + x`. The layer index was parsed and not used.

If the file had been the editor's decimal grid, the loader would have ignored the lines. If it had been terrain's sixty-four rows of `A` and a `HEIGHTS` block, this walk would be standing on tile 0 unless a type-5 tiledef, which the file does not contain, had already taught the client to throw the zeros away. If it had been the drawer's `GOBJSET01`, it would not have been opened. Dungeon's one base64 board could have passed. Levelgen's sixty-four `BOARD` lines could have passed. Three writers, one signature, and this function is the one that chooses.

The room is `onlinestartlocal.nw` in the fork's data, and `onlinestartlocal.graal` in the desk's constructor, before any packet. Same place. Two extensions. The Zelda magics are still in the loader, because the family is older than the game.

---

The picture had to be a sheet, and the sheet is not the law.

`pics1.png` is 2048 by 512, one hundred and twenty-eight columns, thirty-two rows, four thousand and ninety-six cells of sixteen pixels. The official id is `row * 128 + col`. The SDL blit cuts a sheet as if it were sixteen columns wide, so dropping `pics1` in mis-cuts every id past 15. The closed chest is hard-wired at tile (56, 15) and the open chest at (29, 19), which only line up on the classic width. The blit and the chest disagree. The foot looks at neither. It looks at `tiletypes[]`.

Type 0 is floor, eight hundred and twenty-three of them. Type 11 is water, forty-seven, and the keyboard loop does not call `isOnWater`. Type 20, 21, and 22 are walls here: fence, jumping stone, and the blocking mass, three thousand and sixty-one ids. The bush is a wall because its four bytes are 20 and 22. A lava picture whose ids are type 12 is walkable in this client, whatever the 2001 note called lava. Chair, bed, and swamp are stored and ignored. The converter can force a hole at index 2 on a body sheet, green `0, 132, 0`, and the tile walk will never see that index. Bodies and boards are different palettes. `gif2mng` made a PNG if there was one frame and an MNG if there were more, color type 3, and did not write a level.

The shop, if the gani is `walk`, has a sprite 0 that is a shadow, a body, a head, a hat that is still an attribute until a default fills it. Four rows: up, left, down, right. A wait counter that starts at 1. A sound that belongs to the frame still open. `GANI0001` is that file. `GANI0002` is a cast, and entering it deletes the walk and renames `idle` or `walk` to `new`, so a standing loop is not quietly overwritten. The editor borrowed the same classes and can preview a placed object without a shop session. The script block in the gani is copied and not run. The yellow box in the editor checks syntax and does not play. V8, in the fork, can ask `isOnWall`. Three rooms, one question, and only one of them is in the step.

---

The desk is not in the step, and it can still have decided the step.

A player on the console at `gvar_004BB0F0` is a property stream. Before any packet: 3 hearts, 5 arrows, 10 bombs, `sword1.gif`, `head0.gif`, `body.png`, pixel 1500 by 350, level `onlinestartlocal.graal`. Property 10 is the gani. Property 20 is the level name. Property 36 is a packed position. A nickname containing `(Server)` makes the desk ask for location. Disconnect is type `0x3d` and an id. The foot is not pushed by this program. The server is asked to drop the person.

The RC socket is `+0x38c`. The NPC socket is `+0x390`. Login on the second is type 3 and `NCL11012`. A packet id is the id plus `0x20`. The first line of a session carries the XOR increment. Even modes are XOR-ed with the Borland generator, state `0x04A80B38`. A file reaches the quilt only if the rights string contains `w`, and the log still says 64k when the upload is too big. An NPC script leaves by the other socket. The arrow does not open either socket. The level it walks may have been uploaded through one of them, and the script beside the bush may have arrived through the other.

The editor that painted the bush was a package before it was a form. Magic `0x82D0B188`, `LoaderFlags` reused as an offset, two codecs, and then `TAdventure`, which does not require `GLEVNW01` and writes `BOARD 0` as sixty-four lines of decimal indices. Save from that form and drop the file on this loader, and the arrow walks a room that was never loaded. The stamp drawer is five `GOBJSET01` files and 288 names. The name dies in the placing. The cathedral is 16 by 12 only in the file.

---

The generators are the argument, restated by the key.

Terrain wrote tile 0 so the level would load, and hid the land in nine by nine samples. `GENERATED 1` was a flag. Dungeon wrote a real base64 board, stamps of 8 by 11, a hole that is not written, and `GENERATED` as the bottom-right level name. Levelgen read an eight-bit picture, let water cover mountains, refused to draw pure grass, and sewed links at 61 only on levels it created. All three said the words. The arrow believes the loader. A link rectangle, if one was kept, names another file, and that file is expected to mean by `GLEVNW01` what this loader means.

Enablement was always a fourth file. `loadgmaps.txt`, or `gmaps=` and an initialization weapon, or a System NPC, or `/updatelevel`. The key does not read those. It assumes they have already been believed.

---

So the step is one, and it is not one thing.

The picture proposed a bush. The drawer named it and forgot the name. The editor stored four decimals. A generator may have stored `AA` and a height, or a base64 run, or a `BOARD` line. The loader kept an id. The type table said 20. The foot stopped. The gani, if the step had been allowed, would have advanced the right-facing row. The sheet would have been cut in sixteen-column order, or in one-hundred-and-twenty-eight, depending on which program blitted. The desk could list the player, with three hearts until the stream said otherwise. The converter could have made the body transparent at index 2, which is also green. None of these is the arrow. All of them are how the arrow has a world.

The grass can wait. It has been waiting since the first line. The signature cannot, and it never could, because a signature is a doorplate. `GLEVNW01` says text level to the loader and decimal grid to the editor and a dummy board to terrain. `GRMAP001` says a flag here and a filename there. `GANI0001` says four rows. `GOBJSET01` says a recipe that will not survive. `0x82D0B188` says the file is not the program. A byte plus `0x20` says the desk is speaking. Index 2 says the color is not there.

Press the key again. The point moves, or it does not. The hall has no further door that this install measured. What remains is the refusal the book was built to keep: do not feed one writer to another loader and expect a board. The player believes they walked on grass up to a wall. They walked on an index, up to a byte.
