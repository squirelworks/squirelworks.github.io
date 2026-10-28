# GraalLStory

## Chapter XII — The Hall, Repainted

The hall does not change because someone has brought a brush. The doors are the same doors. What changes is the coat of seeing: every room as a picture, and every picture refused at the threshold.

Begin with the sheet, because the eye begins there. `pics1.png` is 2048 by 512, pale and busy, cut in the mind into squares of sixteen. One hundred and twenty-eight across, thirty-two down, four thousand and ninety-six cells. Beside it `picso.png`, half as wide, the offline set, bound by one line: image, prefix, type, origin. Type 0 is the old order. Type 1 is the new. `addtiledef2` can paint a rectangle over the base sheet, a chair or a lamp replaced without shipping another four thousand tiles. The board never stores the paint. It stores the index. Repaint the sheet and every room changes clothes. Leave the sheet and change an index, and the grass becomes a wall without a pixel having moved.

That is the first coat, and it is a lie the eye prefers. The second coat is the type byte. Wall if the byte is at least 20. Water if it is exactly 11. Three thousand and sixty-one walls, forty-seven waters, nine hundred and eighty-eight walkable, in the table this client keeps. A beautiful wall given type 0 is a painting you can walk through. A blank cell whose id maps to 22 is a shut door. The cathedral in the drawer is 16 by 12 only while it is still a recipe. Placed, it is one hundred and ninety-two indices, and the paint is whatever `pics1` has in those cells, and the collision is whatever the table has, and neither fact was in the stamp's name.

Snow is the proof that a repaint is not a recolor. The snow set is the warm shapes with a Snow prefix and different ids, a second band of the same sheet. The converter's `-b` is the other trick, and it applies to bodies, not tiles: seven slots, index 2 both the default green `0, 132, 0` and the hole. A channel within 32 snaps. A body sheet whose green lives at another index will not go transparent and will not take the tunic. Twenty files under `levels/bodies/` are the wardrobe that flag was built to dress. The tile walk never sees index 2. Bodies and boards are different palettes hung in the same hall.

The blit is a third coat, and it disagrees with the first. The SDL window cuts a sheet as if it were sixteen columns wide. Official `pics1` is one hundred and twenty-eight. Drop it in and every id past 15 is mis-cut. The bush's four ids, 2, 3, 18, 19, would sample the wrong cells and still block, because the type bytes are 20 and 22. The closed chest is hard-wired at tile (56, 15) and the open chest at (29, 19), which only line up on the classic width. One coordinate system believes the official order. The other believes a sixteen-column order. The foot looks at neither rectangle.

---

Walk the doors again, this time by what they paint and what they will not.

The shop paints rectangles, not levels. Sprite 0 is a shadow, 24 by 12, from the top of `SPRITES`. Sprite 200 is a head facing up. The hat is `ATTR1` until a default fills the file. Four rows, up left down right, a shield that moves to the end of the down row because a shield in front of a body is not the same draw order as a shield behind it. Preview is DirectDraw 7, zoom clamped from 1.0 to 16.0. Sheets may be GIF, including the Netscape extension, or MNG, or a bitmap. PNG appears as a suffix and as a zlib error, which is a way of saying the era had not finished agreeing what a picture was. Movie mode is a stage, not a walk cycle. The script is copied into a rich edit and not executed. The shop never sold the sword. It named the rectangle the sword is cut from.

The desk paints nothing. It lists a person who already wears a picture: `sword1.gif`, `shield1.gif`, `head0.gif`, `body.png`, a gani at property 10, a level name at property 20. Hearts are a double. The tray icon is a `NOTIFYICONDATA`, refreshed by a timer. Chat is a rich edit of one hundred lines. An admin message is stripped of markup. The rights string is not a color. If it does not contain `w`, the file is not uploaded, and the log says so. The cipher is not a palette. Even modes are XOR-ed. The first line carries the key. A staff member sees a row. The row points at files. The desk does not open them.

The generators paint in bulk and then forget the brush. Terrain's preview is a bitmap, blitted when the form paints, and the PNG from the dialog is not the `MAPIMG` the gmap names. The board it writes is sixty-four rows of `A`, tile 0, so the level loads. The land is nine by nine samples. Type 5, elsewhere, is supposed to throw the zeros away. A loader that does not know type 5 shows a room of tile 0. Dungeon stamps eight by eleven from `X` and `.`, sixteen place kinds, stamp 0 a ground fill, stamp 1 a hole that is not written. Wall sheet and ground sheet are names in the options, painted on by `addtiledef2`. The generator does not embed a tileset. Levelgen starts from an eight-bit picture, samples corners of a six-by-six cell, and lets water cover a mountain because the image is the memory. Pure grass fails the test and is not drawn. A green pixel is not yet a tile. That line is in the 2003 note.

The converter is the brush the others assume has already been used. One frame, a PNG, indexed, a `tRNS` if there is a hole. Many frames, an MNG, ticks at 1000, a `FRAM` whose change byte is 2. Color type 3. Bit depth 8. Never truecolor. A corner fix can declare a new hole if three corners agree and the colors are close, and it does not remap the pixels. It prints the change. It does not ask. The output path loses the last four characters. The tool is careful about the stream and careless about the name.

The editor paints decimal indices on a form captioned `Graal`, after the package has been opened. Magic `0x82D0B188` is the door, not the room. DirectDraw 5 and DirectDraw 7 both have failure strings, so the surface was not agreed. Signs carry a small markup: arrows, a head, a ying-yang, an image or a sub-rectangle. The stamp drawer is five files and 288 names. The volcano file spells obsidian wrong and still cannot make a lava picture into type 12. If the ids are 22, this walker bounces. If they are 11, it is water. If they are 12, it is walkable here. The paint can look like fire. The byte can say floor.

---

Seihai repaints the vocabulary and keeps the frame.

Sixty-four by sixty-four, sixteen pixels, a world one thousand and twenty-four on a side. The ids are no longer a sheet. Grass is 0. Water is 2 and solid. Deep water is 3 and solid. Bush is 5 and can be cut. Bridge is 12, the only walk on the meadow river. The same number 12 was lava in the old note and walkable in the SDL table and a bridge here. Zero faces south. Six hit points draw as three hearts. The gold tint on a link rectangle is only a draw. Links are not a tile id. Mara's counter sells one heart for 40 rupees and then has nothing left, which is a picture of a shop that actually sells, hung opposite the Photoshop pun.

The foot in the fork is one point and does not ask about water. The foot here is four corners, and water stops it. Both are Graal-shaped. Neither is the sheet.

---

Hang the coats back on their pegs.

A signature is not a color. `GLEVNW01` does not say green. `GANI0001` does not say the shadow is dark. `GOBJSET01` does not say the bush blocks. `0x82D0B188` does not say the editor has a caption. A byte plus `0x20` does not say what the player is wearing. Index 2 says the color is not there, and only on a body sheet, and only if someone passed `-b` or the sheet was already honest.

Repaint the hall and the doors remain. The grass can be dressed again. The wall is still a byte. The player believes they walked on green up to brown. They walked on an index, up to a table, under a sheet that any of these rooms might have replaced and none of them is required to agree about.
