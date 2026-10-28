# Levels

Every board is 64×64 tiles. `parseLevelBytes` looks at the first eight bytes and picks a reader.

| Header | Reader | Notes |
|---|---|---|
| `GLEVNW01` | `parseLevel` | Text `.nw` |
| `GR-V1.00` … `GR-V1.03`, `Z3-V…` | `parseGraal` | Binary `.graal`. The house is `GR-V1.03`. |
| text that contains `BOARD ` | `parseLevel` | A text file without the usual header |
| `GRMAP001` | refused | A list of level names, not a board |

## Text boards (`.nw`)

Lines are tokens split on whitespace. Blank lines and a bare `GLEVNW01` are skipped.

`BOARD x y width layer data`

The fifth token is the layer. Ember reads `parts[5]` as the data and ignores the layer number. `data` is `width * 2` characters from this alphabet:

```
ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/
```

A pair is `hi * 64 + lo`. The row is written into `tiles[y * 64 + x + i]`. A short row, or a row that would run past column 63, is skipped. A file with zero accepted `BOARD` lines fails to open.

`LINK dest x y w h nx ny` pushes one rectangle. `dest` is taken as written. Coordinates are integers. A missing number drops the line.

`SIGN x y` starts a block that ends at `SIGNEND`. The lines between are the sign text, joined with newlines.

`NPC` starts a block that ends at `NPCEND`. The image name and the cell come from whichever of the first tokens are integers. The lines between are the script, stored and never run.

`CHEST x y item…` is one line. The rest of the line is the item string.

`BADDY x y kind` starts a block that ends at `BADDYEND`. The kind token is kept. The body of the block is discarded.

## Binary boards (`.graal`)

`GR-V1.02` and `GR-V1.03` use 13-bit tile packets. Older `GR-V1` headers and `Z3-V` use 12-bit packets. The high bit of a packet is the repeat flag. A clear flag emits a tile id (once, or `count` times, or as one half of a pair). A set flag sets `count` from the low 8 bits, and bit 8 of the packet marks the next emit as a pair. Packets stop at 4096 tiles, at the end of the buffer, or after 20000 packets.

After the bitstream, sections are separated by a line that is empty or `#`:

1. Link lines: `dest x y w h nx ny`. A missing `nx` or `ny` becomes `-1`.
2. Baddies, if any bytes remain: records of `x`, `y`, `kind`, then a note string, ended by a newline once three bytes are in.
3. NPCs, only for `GR-V1.00` and later. Each line is `x+0x20`, `y+0x20`, then `image#script`. A section sign `§` (`0xA7`) is a newline in the script. A `#` line ends the section.
4. Chests, only for `GR-V1.01` and later. `x+0x20`, `y+0x20`, then a type byte minus `0x20`. Ember stores that as `type N`. It does not know the item table.
5. Signs, the remainder. Same `x+0x20`, `y+0x20`, then text. Non-printable bytes are stripped.

Strings in the binary reader are Latin-1, one byte one character. The text reader decodes `.nw` as UTF-8.

## Tile id to pixels

Both `level.ts` and `world.ts` use the same map. For id `n` on a tileset of the usual 2048×512:

```
col = floor(n / 512) * 16 + (n % 16)
row = floor(n / 16) % 32
sx, sy = col * 16, row * 16
```

An id whose cell would fall outside the image is not drawn. `voidMask` samples every other pixel of each of the 8192 possible ids. If the mean of R, G, and B is below 8, that id is void. The mask is built once, from the tileset, not from the level. A nearly black tile is "empty margin," which is how a bad door arrival gets pulled back onto the floor.

## Links

A link is a rectangle in tile space. The player is inside it when `x` is in `[link.x, link.x + link.w)` and `y` is in `[link.y, link.y + link.h)`. Overlapping links: the smallest area wins, so a one-tile door beats a wide edge warp that covers the same cell.

`nx` and `ny` are the arrival cell in the destination, or `-1` to mean "this axis is not specified."

The house south door is the walk that matters. It names `egk-10` and does not give a trustworthy landing cell, so arrival is resolved by looking back, not by trusting `nx, ny`. That rule is in [Runtime](runtime.md).

## Catalog resolution

`resolveDest` does this, in order:

1. Take the last path segment. `levels\\egk-10.graal` becomes `egk-10.graal`.
2. Exact lower-case match in the catalog.
3. Strip a trailing `.graal`, `.nw`, or `.gmap` and look up the stem. Prefer `.graal`, then `.nw`.
4. Otherwise the door is missing. The HUD says so, and the player is locked on that cell so the message does not repeat every frame.