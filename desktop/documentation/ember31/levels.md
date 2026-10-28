# Levels

Avelan is 100 files, `av{a–j}-{01–10}.nw`, each a 64×64 GLEVNW01 board. The catalog is the array in `/levels/index.json`. A name that is not in that array cannot be opened, even if the bytes exist on disk.

## Grid

Columns `a`–`j` run west to east. Rows `01`–`10` run north to south. `worldOf` turns a file plus a local point into overview coordinates:

```
col = file letter - 'a'          // 0..9
row = file number - 1            // 0..9
overview = (col * 64 + x, row * 64 + y)
```

The map image is treated as 640×640, so those units are also percentages of the sheet. A file that does not match `av{a–j}-{nn}` has no pin. Indoor files, if any are added later, will not show on the map.

Named places, both in `placeName` and as map pins:

| File | Name | Pin (overview px) |
|---|---|---|
| `avg-05.nw` | Halebridge | 396, 318 |
| `avf-03.nw` | Highcairn | 352, 168 |
| `avd-06.nw` | Westmere | 248, 368 |
| `avg-06.nw` | The Greywater (pin: Greywater) | 404, 210 |
| `avf-09.nw` | Saltwharf | 352, 540 |
| `avi-08.nw` | Cinderholm | 548, 476 |

Anything else on the grid is labeled `Avelan X-NN`. Start is Halebridge, `avg-05.nw`, at 10.5, 56.5, which is the south side of the keep. The south gate is the door out.

Edge links on this overworld leave the free axis as `-1` and name the neighbor. `doorArrival` keeps your coordinate on an axis the link left at `-1`, and uses `nx + 0.5` / `ny + 0.5` on an axis it set. A small door that leaves an axis unset is searched for a reciprocal link instead. See [Runtime](runtime.md).

## Bytes

`parseLevelBytes` sniffs the first eight characters.

| Header | Path |
|---|---|
| `GLEVNW01` | Decode as text and run `parseLevel`. This is every Avelan file. |
| `GR-V1.00` … `GR-V1.03`, or `Z3-V…` | `parseGraal`. 12-bit tiles on the oldest headers, 13-bit after. |
| text that contains `BOARD ` | `parseLevel`, even without the header. |
| `GRMAP001` | Rejected. It is a map list, not a board. |

A GLEVNW01 file is lines. A board line is 64 pairs from `A–Z a–z 0–9 + /`. Tile id is `hi * 64 + lo`. After the board come `LINK`, `SIGN`, `NPC`, `CHEST`, and `BADDY` blocks. A mode stays open until the next keyword. Signs, NPC scripts, and baddy notes keep their following lines.

A `.graal` file is binary. Tiles are a bitstream with a repeat bit. Links are four bytes of geometry plus a destination string. NPC and chest coordinates are stored as `byte - 0x20`. Section marks are `#`. Scripts use `§` as a newline. Ember3.1 can open those files if they are listed in the catalog. Avelan does not ship any.

## Tile id to a pixel

Both `level.ts` and `world.ts` use the same mapping. It is also how `sheetIndex` finds the mask cell.

```
col = floor(id / 512) * 16 + (id mod 16)
row = floor(id / 16) mod 32
pixel = (col * 16, row * 16)
mask index = row * 128 + col
```

A 2048×512 sheet is 128 columns by 32 rows, 4096 cells. The tile id space is 8192 because the old clients address two banks. An id whose pixel rect falls outside the image is void, and it does not block (the type lookup misses and returns false).

## Actors the page will show

| Record | Drawn | Readable |
|---|---|---|
| Link | stroked rectangle | HUD says `Door · <place>` while you stand in it |
| Sign with text | pale 4×8 mark | E, within 1.6 tiles of the cell center |
| NPC | dot | E. Body is the script, or "No script in the file." |
| Chest | danger square | E. Body is the item string |
| Baddy | no | no |

`actorHere` picks the nearest of sign, NPC, and chest inside 1.6 tiles. Empty signs are skipped. Nothing is executed.