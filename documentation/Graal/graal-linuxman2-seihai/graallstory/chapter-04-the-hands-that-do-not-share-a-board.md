# GraalLStory

## Chapter IV — The Hands That Do Not Share a Board

The fourth door is a workshop, and three people are already in it, writing the same word on different paper.

A level from the first chapter began `GLEVNW01` and meant a base64 run. A map began `GRMAP001` and meant a grid of those levels. The generators know both words. They do not know them the same way. Terrain writes a board of tile 0 and hides the land in a height field. Dungeon writes one base64 board of sixty-four by sixty-four and stamps walls from an eight-by-eleven cell. Levelgen reads an eight-bit picture, quantizes it, and emits a board line per row, with links only on levels it had to create. Feed one file to another loader and you do not get the world the button promised. That refusal is the chapter.

They sit together under `generators/`, which is a kindness of the folder and not of the formats. Terrain is a Delphi form. Dungeon is a console from 2002. Levelgen is one form and one button, dated in a note from March 2003. Each can fill a quilt faster than a person with a stamp. None of them is the client.

---

Terrain goes first, because it is the one that looks most like a world and stores the least like one.

`TerrainGenerator.exe` is three hundred and ninety-one thousand, six hundred and eighty bytes, a Delphi VCL tool, unit `UTerrainGenerator`, caption `Terrain Generator`. Linked beside the RTL are Spin and zlib 1.1.2, and the zlib is for the PNG writer, not for the levels. If the command line contains `.gmap`, the form loads that file and paints. There is no separate preview control. Mouse, key, and paint sit on the form. A cached bitmap is blitted when the form paints.

Generate World reads two edits for the grid, a spin for the base, floats for height and chaos, and a seed box. If random is checked, the seed is `Random(MaxInt)`, written back into the edit, and stored on the map so the same world can be rebuilt. A bad seed becomes 1. Standard preset: base 0, even borders off, height 65, chaos 0.6. Islands: base −15, even borders on, height 130, chaos 0.55. Chaos of 1 or more diverges. The shipped note calls the method a fractal algorithm. The decompiler shows the usual recursive midpoint displacement: borders first, then the interior, amplitude scaled by chaos at each subdivision.

The world is a `TGraalMap`, width times height levels. Each level is still sixty-four by sixty-four tiles, and each keeps a `TLevelHeights`: nine by nine vertex samples, eighty-one doubles. The coarse field is one vertex wider and taller than the grid of levels. The four corners are Base. Even borders also pin every rim vertex to Base, so an island stays on that line. The seed is installed. The four borders are displaced. Plasma fills the interior. Each coarse sample is replaced by its floor. A setter clamps a vertex to 0 through 8.

What it writes, when Generate Graal levels is checked, is not that field as tiles.

The gmap begins `GRMAP001`, then width, height, and `GENERATED 1`. Here the 1 is a flag, not a filename. Then seed, base, even borders, height, chaos, a per-level height and chaos, `MAPIMG` and a basename plus `.png`, one level name per row, a `HEIGHTMAP` block, and `RANDOMSEEDS` when seeds are present. Level names are basename, a column code, a row, and `.nw`. Column 0 is `A`. Past 26 the column becomes `AA`. Rows are padded so names stay sortable. A two-by-two map whose basename is `myworld` yields names in the `myworldA00.nw` style.

The level file begins `GLEVNW01` and then lies, politely. The board template is `64` and a y, then one hundred and twenty-eight `A` characters. `A` is tile 0. The template is cloned for each of the sixty-four rows. There is no `BOARD` keyword in this image, no `NPC`, no `CHEST`. The terrain payload is `HEIGHTS`, nine lines of nine numbers, closed by `HEIGHTSEND`, and only if the heights object is set. Links sit on each edge that has a neighbor: x 0, x 63, y 0, or y 63, naming the adjacent `.nw`. The constant 63 is the far edge of a sixty-four-tile level. A sibling file swaps `.gmap` for `_heights.txt` and dumps the field without the wrapper.

The client is expected to throw those zeros away. The official note requires a type-5 tiledef:

```
picso.png,LEVELSTART,5,0,0
```

`LEVELSTART` is the gmap basename. Online, a clientside `-Initialization` weapon does `addtiledef` and `loadmap`. Type 5 is what turns the nine-by-nine samples into terrain tiles. The board of zeros exists so the level loads. A loader that does not know type 5 will show a room of tile 0 and a height block it may not read. The PNG from the preview dialog is a separate file. `MAPIMG` is the overview the client shows on the map list. They are not the same picture, and neither of them is the board.

---

Dungeon does not pretend the board is empty.

Version 1.0, copyright 2002 Linux Cyberjoueurs. The banner says it can only be used to generate levels for Graalonline, and then it waits on `getchar`. The Windows image is `dungeongen.exe`, four hundred and seventy-five thousand, one hundred and thirty-six bytes. The Linux image is larger, an ELF. No window. No argument means `dungeonoptions.txt` in the working directory. One argument replaces that path.

The options file begins `GDUNG001`. A leading `#` is a comment. A second sight of the magic stops the loader. Any other unrecognized line is a hard failure. The default file asks for a cave: `LEVELSTART testcave_`, `GMAP testcave`, wall sheet and ground sheet, fifty by fifty cells, style `rogue`, seed 1337, and a torch NPC with a fifty-percent chance on the west wall of a cell. Styles match as substrings: `onion`, `maze`, `spiral`, `rogue`, `snake`, `squarespiral`. `squarespiral` also matches `spiral`. The tests are independent, and the square spiral runs last, so it keeps the grid. A layout file wins over styles and over rooms. Rooms and stats are the linked engine, alifegames DungeonMaker 0.9, classes `DungeonMaker`, `Builder`, `ColumnJumper`, `WallCrawler`. The six named styles do not read that directory. Seed 0, or no seed, uses `time()` and prints that it is generating a new value.

A cell is eight tiles wide and eleven tall. `X` is wall. `.` is path. Any other character from a layout file is kept. Out of bounds reads as `X`. The classifier turns the eight-neighborhood into one of sixteen place kinds and stamps that kind's eight-by-eleven tile ids into the boards. A `TILES` line is a name and eighty-eight ids, hex accepted. Stamp 0 is replaced by a four-by-four ground fill before the board is stored. Stamp 1 is a hole and is not written. A sixteen-character layout line is one hundred and twenty-eight tiles wide and two levels across. The official warning is the right one: do not draw a large picture.

`testcave` at fifty by fifty cells is seven levels wide and nine tall, because `(50+7)/8` and `(50*11+63)/64`. The corner level is `testcave_g09.nw`. Column is a letter, and past twenty-six a two-letter prefix. Row is 1-based, zero-padded when the gmap is taller than nine.

The stages print, flush, and run, in an order that does not negotiate. Load options. Load the dungeon definition. Create levels. Generate: classify, stamp, place NPCs. Write levels. Write the gmap. The level is `GLEVNW01` with one `BOARD`, the base64 of sixty-four by sixty-four shorts, edge `LINK` lines, and `NPC` blocks. Links use a `playerx` or `playery` of 0 or 61, so a walk off the edge lands on the neighbor. This is the client's base64, the alphabet from the first chapter, `AA` for 0 and `//` for 4095. It is not the editor's decimal grid, and it is not terrain's row of `A`.

`ADDTESTNPCS` inserts, before the user's rules, a script that does not block, draws under the player, adds the tiledefs, and on `playerenters` loads the map clientside. A `script=` rule inlines a file. An `image=` rule writes the image attribute. Torches, blood decals, hole decals: the dungeon is willing to populate, where terrain was not. The gmap is the short form. Width, height, and `GENERATED` set to the bottom-right level name. No `LEVELNAMES` block. The client rebuilds the grid from that name. In terrain, `GENERATED 1` was a flag. Here it is a filename. Same key. Opposite meaning.

Tiledefs, the official note says, belong in a System NPC once the look is chosen, not forever in the generated levels. The generator will still write them into the test NPC if asked. It does not embed a tileset. Walls and ground are sheets named in the options, painted on by `addtiledef2`.

---

Levelgen is the third hand, and it starts from a picture, which the platform has already warned you not to trust.

`GraalLevelGen_nw-gmap.exe` is one form and one button, at `0x451754`. The March 2003 note shipped beside it. The button makes fourteen calls, and the order is the behavior. Load a GIF, an MNG, or a PNG. Levels across are the image width divided by 64. Levels down are the height divided by 64. Create or load each level. Quantize mountains. Stamp mountain shores. Scatter small objects. Quantize water. Stamp water shores. Rebuild a mask for class 1 and autotile trees. Rebuild a mask for class 12 and autotile the red set. Write every `.nw`. Write the `.gmap`.

Water runs after mountains, so a water quantize can cover a mountain pixel. Trees run after both, and they read whatever pixels are still class 1. Grass is not drawn. Pure grass fails the test that asks whether any corner wanted the class being quantized. That line is in the 2003 note, and it is the same lesson as the type byte: a green pixel is not yet a tile.

The quantize grid is not the tile grid. One cell is six by six pixels. The four samples are the corners, not the center. Manhattan distance to the palette class, under 32, counts as a match. Mountains want class 3 and allow grass, mountain, and swamp. Water wants class 2 and allows grass and water. If any corner wants the class and every corner is allowed, the six-by-six rectangle is filled with the winning corner: top-left, then top-right, then bottom-left, then bottom-right. The fill writes the pixel index back into the source image. A later pass can paint over an earlier one because the image is the memory.

A level that already exists is loaded, and the links already in the file are kept. A level that does not exist starts empty, and four edge links are added, one per neighbor that exists. Left arrives at x 61. Right arrives at 0. Above arrives at y 61. Below arrives at 0. The strings in the image are `"61"` and `"0"`. A loaded level does not get these links. Its own links stay. The generator will not sew a quilt that someone else has already sewn.

The level header is `GLEVNW01`. Each board row is one `BOARD` line: `BOARD 0`, the y, width 64, layer 0, and one hundred and twenty-eight characters. Two characters a tile, high six bits first, the same alphabet. This is the shape the SDL loader accepts. It is not terrain's `64 <y>` and a run of `A` with no `BOARD` keyword. It is not the editor's sixty-four lines of decimal indices. It is the closest of the three to the client, and it still will not load a file one of the others wrote.

Names are the world name, a column letter, a hyphen, and a 1-based row, then `.nw`. Past twenty-six columns, a second letter. Past nine rows, the row is padded. The 2003 note shows `worldname_a-01.nw`. That form is what you get when the typed name already ends in an underscore. The generator does not insert the underscore itself. The gmap is `worldname.gmap`. Another handwriting. Another doorplate.

---

Put the three files on one table and the trick is visible.

All three are willing to say `GLEVNW01`. Terrain means a dummy board and a `HEIGHTS` block, and a type-5 tiledef the file does not contain. Dungeon means one base64 board, stamps, and NPCs, and a `GENERATED` value that is the last level's name. Levelgen means sixty-four `BOARD` lines and links that appear only on levels it created. All three are willing to say `GRMAP001`. Terrain means a flag and a heightmap and seeds. Dungeon means width, height, and a corner filename. Levelgen means a list built from a picture's dimensions divided by sixty-four.

The editor, still waiting in its own room, means none of these. Its `BOARD 0` is decimal. Its heights are an overlay. A person who has generated a world and opened it in the editor, or generated a world and dropped it on the SDL loader, has performed the experiment the first chapter warned about. The signature matched. The board did not.

Enablement is a fourth file, always. Terrain wants `loadgmaps.txt` offline, or `gmaps=` and an initialization weapon online. Dungeon wants a `level` line and a `file` line, the gmap name appended, then `/updatelevel`. Levelgen wants the picture to have been the right greens and blues, because grass that does not match is grass that is not drawn. The generator proposes. The tiledef disposes. The loader judges. A beautiful plasma field whose type is not 5 is a room of tile 0. A cave whose sheet was never added is a cave of the wrong clothes. An eight-bit map whose water ran last is a lake where a mountain was, and the button will not apologize.

The desk from the third chapter can upload the files, if the rights string contains `w`, and if they are not over the limit the log still calls 64k. It will not translate them. The shop will not animate them. The client will load the one whose writer it agrees with, and walk an index, and test a type byte, and follow a link to the next file of the same misunderstanding.

Three hands. One signature. No shared board.

The next door is smaller. A GIF goes in, and a PNG or a MNG comes out, and a flag forces the transparent index the body sheets already expect.
