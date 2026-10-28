# GraalLStory

## Chapter X — The Zero That Faces South

The tenth door still opens the old line, and then it disagrees with it.

Seihai is not Graal.exe, and it is not the SDL fork. It is a later client, a board of sixty-four by sixty-four tiles of sixteen pixels, a world one thousand and twenty-four pixels on a side. New files are `.seihai` and `.as`. The headers it writes are `SH-V1.00` through `SH-V1.03`, and `GLEVAS01`. Older `.graal` files, `GR-V1.00` through `GR-V1.03`, and older `.nw` files, `GLEVNW01`, still open. `Z3-V1.03` and `Z3-V1.04` stay on the list, because the family has not yet thrown the Zelda magics out. A `.txt` name does not open. A magic that is not in the list does not open. The extension compare is case-insensitive, which is a courtesy `gif2mng` never learned.

Both are required. A known name without a known magic is refused. A known magic on an unknown name is refused. The pairs are aliases, not different layouts. `.seihai` and `.graal` are one name-pair. `.as` and `.nw` are the other. `SH` and `GR` are one magic-pair. `GLEVAS01` and `GLEVNW01` are the other. Either name may carry either header family. That is the compatibility rule, and it is more generous than the SDL loader, which picked a reader from the extension or from eight bytes and then demanded a base64 run. Seihai copies tiles and applies the save. It does not promise that a decimal `BOARD 0` from the editor will parse. It promises that the doorplate and the filename are a pair it has agreed to recognize.

Shipped boards use the new spellings. The overworld is `.seihai` and `SH-V1.03`. The house and the cave, which used to carry the NW line, are `.as` and `GLEVAS01`. Five rooms: Tutorial Glade, North Meadow, Rowan's House, Hollow Cave, Thorn Grove. A link is an axis-aligned rectangle in tile coordinates, a destination id, and a tile. Standing on it after the gate timer calls `enter`, which logs `warpto`. Links are not a tile id. The gold tint on a link rect is only a draw. The gate is held for 0.45 seconds so the arrival tile does not immediately warp back. The generators sewed edges at 0 and 61. This client sews rectangles and then waits, so a foot that has just arrived is not a foot that has just left.

---

The grid is the same size and a different vocabulary.

Cell `(x, y)` is index `y * 64 + x`, which the first chapter already knew. The array is a `Uint8Array`, not four thousand and ninety-six shorts into `pics1.png`. The ids are a small list, and the list is the law.

Grass is 0, and it is floor. Path is 1. Water is 2, and it is solid. Deep water is 3, and it is solid. Tree is 4. Bush is 5. Wall is 6. Cave floor, cave wall, house wall, tall grass, sand, bridge, wood, crack, stair, flower, fence, heal. Solid means the body cannot enter the cell. Water, deep water, cracks, and bushes are solid. Stairs, paths, bridges, and heal tiles are not. Tall grass is floor that slows movement to 0.62. The bridge is the only walk on the meadow river.

Read that against the foot from the eighth chapter and the disagreement is the chapter. There, water was type 11, and the keyboard loop did not call `isOnWater`, so a lake and a floor were the same to the arrows. Here, water is id 2, and id 2 is a wall. A bush there was four indices from a stamp, 2, 3, 18, 19, judged by a type table the stamp did not carry. A bush here is id 5, solid, and a sword or a bomb removes it. About one in five, by a hash of the tile, leaves a green rupee. The drop is not written into the save. Come back and the bush is gone only if something else recorded it. The cut itself did not.

A lava picture in the volcano drawer was not type 12, and type 12 was walkable in the SDL client even though the 2001 note called it lava. Seihai has no type table of four thousand bytes. Id 12 is a bridge. The same number, a different world. This is the platform's oldest trick, played by a client that still opens `GLEVNW01` and no longer means the sheet.

Directions, everywhere in this source, are `0` south, `1` west, `2` east, `3` north. The shop's rows were `0` up, `1` left, `2` down, `3` right. The foot's sprite used the shop's order. A person who ports a facing and trusts the other zero will look at the ceiling, which the second chapter already warned. Seihai is the other zero. Hit points are half-hearts. Six hit points draw as three hearts. The desk, before any packet, filled a player with 3.0 hearts. The two threes are not the same unit until you know which room you are in.

---

The body is no longer one point.

The player is tested as four corners around the feet: `(-5, -12)`, `(+4, -12)`, `(-5, -2)`, `(+4, -2)`. A corner that leaves the board, hits a solid tile, or shares a cell with a block, an NPC, a chest, or a sign refuses the move. X is attempted, then Y, so a slide along a wall still works. The SDL loop had no slide and no corner resolution. This one has both, by trying the axes separately. After a refused axis, if Shift is not held, the engine tries to push. Push requires contact for 0.28 seconds, then the block moves one tile if the destination is in bounds, not solid, and not occupied. Pull happens only when the move succeeded and Shift is held, along a single axis. The block must sit on the tile the player just left. The log says `pushed` or `pulled`. PushStone, PullStone, and PushPullStone in the drawer were only different pictures. Here the difference is a key and a timer.

The sword is a swing of 0.22 seconds and a cooldown of 0.34. The hit window is between 0.02 and 0.20. Reach is `8 + sword * 4` pixels. Sword power is an integer from 1 to 4. A chest raises it only when the chest's sword is higher. A lesser blade is described and does not replace the one you have. Bushes in the box become floor. The biome chooses the replacement: cave floor, wood, or grass.

A bomb spends one from the pouch and sits on the player's tile with a fuse of 1.35 seconds. The blast covers a 36 pixel radius. Cracks and bushes inside it become floor. A crack is appended to the save as `levelId:x,y`. Opps inside the radius plus 8 pixels take 4 damage. The player takes 2 if they are inside. An arrow spends one, waits 0.28 seconds, and flies at 210 pixels a second for 0.7 seconds or until a solid tile. An empty pouch says `No bombs.` An empty quiver simply does not fire.

Opps are a short list. A slime has 3, hops toward the player inside 170 pixels, and wanders otherwise. An octorok paces on x and shoots on a shared row. A bat has 2 and chases. Thornback has 12, a larger body, and aggro inside 280. On death a normal opp says `The opp drops.` Thornback says `Thornback falls.`, sets a dead flag so the boss does not return, and grants one heart container if that heart has not already been given. Contact knocks the player back 8 pixels. Invulnerability lasts 0.85 seconds. At 0 hit points the tick persists and stops the sim. Wake restores full hearts, keeps 85 percent of the rupees, and puts the foot back on that level's spawn. `You wake at the gate.`

---

There is a shop in this room, and it sells.

Mara, on the meadow, sells one heart container for 40 rupees, flag `shop-heart`. After that she has nothing left. If the pouch is short she repeats the price. GraalShop was a Photoshop pun and a gani editor. This counter is a counter. Talk is nearest first, within 28 pixels: an NPC, then a closed chest within one tile, then a sign, then a heal tile underfoot or on the faced tile. The reading panel freezes the sim. `playerenters` is not a script key. It is the log line written when a level with an enter script is loaded, and the status text for that arrival. The dungeon generator wrote `if (playerenters)` into a test NPC. This client writes the words into a log. Same token. Not the same run.

The save is `SaveV1`, in local storage, not a server. On enter, cracks listed in `save.broken` become floor if the cell is still a crack. Blocks come from the save if that level was captured, otherwise from the definition. Chests already opened stay open. A boss with `dead:<id>` is not spawned. Trees, bushes, and fences on spawn, NPCs, chests, signs, opps, and blocks are cleared, so a landmark is never walled in. Scatter uses a seeded mulberry32, so the meadow and the grove grow the same trees every load. Boot keeps the saved pixel position. A warp places the feet on the destination tile: horizontal center, two pixels above the bottom edge.

Five boards, built by functions, not loaded from `pics1`. Rowan on the glade, a slime, a bomb chest behind a block. Mara's shop, octoroks, a bridge, a cave mouth, a chest with sword III. Quill in the house, a bed that heals, a closet block that pulls, sword IV. Ember in the cave, two bomb cracks, bats, sword II. Wick in the grove, and Thornback. The quilt is the same idea as a gmap. The files are not a gmap. `GRMAP001` is not this door's word.

---

The arrow from the ninth chapter still moves a foot. This foot is four corners, and the byte under them is an id from a list of nineteen, not an index into a sheet of four thousand. Water stops the walk. A bush can be cut. Zero faces south. The old signatures still open, as aliases, and the files this client writes begin with a different eight characters.

`GLEVNW01` remains a doorplate. `GLEVAS01` is the plate on the new door. They are accepted as a pair. They are not the same handwriting. The grass, here, is id 0, and it is floor because the list says so, not because a picture was green.

The next door is the counter that does sell: forty rupees, one heart, and a flag that remembers the purchase after the panel has closed.
