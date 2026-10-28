# GraalLStory

## Chapter VII — The Drawer That Forgets Its Name

The seventh door is a drawer, and the drawer is not a world.

Under `tileobjects/` the client ships five text files. `objectsStandard.txt`, `objectsCastle.txt`, `objectsHouse Inside.txt` — the space is part of the name — `objectsSnow.txt`, `objectsVolcano.txt`. Two hundred and eighty-eight stamps. Six thousand, nine hundred and forty-eight tile cells. Graal 2.x added them, and the 2001 note says so in one line: support for object sets, saved in the tileobjects folder and selectable in the editor. Nothing in the SDL fork opens this folder. The official editor does. A stamp is how a hand places a bush without typing four indices. Once the hand has placed it, the stamp is gone.

Each file begins with a signature, because this platform does not know how to begin any other way.

```
GOBJSET01
```

Then a block, and another, until the file ends. A block is a width, a height, and a name that may contain spaces, then exactly `height` lines, then `OBJECTEND`. Width and height are in tiles, not pixels. Each line is `width` tiles, each tile two base64 characters, the same packing as a client board. High six bits first. `AA` would be tile 0. There is no layer, no link, no NPC, and no type byte. A bush and a patch of grass are the same kind of record.

The first stamp in the outdoor kit is small enough to hold in the mouth:

```
OBJECT 2 2 Bush
ACAD
ASAT
OBJECTEND
```

`AC` `AD` / `AS` `AT` decodes to ids 2, 3, 18, 19. In the type table those bytes are 20, 20, 22, 22, so this client treats the whole bush as wall. That fact is not written in the stamp. The stamp wrote four indices. The table, elsewhere, judged them. A person who copies the bush onto a board whose type table is a different sheet has copied a picture of a bush and a collision of whatever those ids mean there.

---

The outdoor kit is one hundred and ten stamps and three thousand and thirty-three cells, the largest file of the five.

Plants first. Bush, Rooshe, KubolSprout, a Tree that is 8 by 10, RedTree, GoldTree, the little trees, a stump, a TreeHouse that is 8 by 12. Then stones: Stone, PushStone, PullStone, PushPullStone, a big stone, five stones, fences, a door, a platform, a slab. PushStone, PullStone, and PushPullStone are only different pictures. Which stone an actor can push is a game rule, not a field in the file. The drawer names a difference the board cannot keep.

Buildings after that. A House, 13 by 14. SkullHouse, ChimneyHouse, Blue House, a Well, the Cathedral at 16 by 12, the largest single stamp in the set. CaveEntry, Letterbox, Pillar, Statue, BomyStatue. Water: a grass water hole, deep water, water stones, edges named by compass point, waterfalls, a watering place, a horizontal bridge 14 by 13 and a vertical one 14 by 10. Ground: swamp, hole, platforms, graves, a village way, alien ground and crystal and pipe, mine edges, carpet and vases, a sign, a stake. The smallest stamps are one tile tall. The cathedral is a hundred and ninety-two cells of somebody else's patience.

Castle is thirty-three stamps and six hundred and one cells. It opens with corners, northwest, northeast, southeast, southwest, then wall runs, then dressing, and ends on marble and blue ground. House interior is forty-one stamps and five hundred and one cells. It starts at Blackness, Vase, Barrel, and is mostly furniture and floor corners. These are the tiles you would stamp inside a House from the standard set. The house shell itself lives in the other file. The drawer has split a building the way the chest and the sign were split: the outside and the inside agree to be used together, and neither file says so.

Snow is fifty-one stamps and one thousand, five hundred and thirty-six cells. Many are the standard names with a Snow prefix — Snow, SnowRooshe, SnowSprout — plus a snow castle run that ends at a pillar and a floor. Same shapes as the warm set, different tile ids, so they sample a different band of `pics1.png`. A snow bush is not a bush recolored. It is a different index. Recoloring was the converter's trick, and it applied to body slots, not to tiles. Here the winter is a second recipe.

Volcano is fifty-three stamps and one thousand, two hundred and seventy-seven cells. Ground first. The file spells it `Volcano Obisidan Ground`, then ash, hot ground, crystals, posts, a volcano bush, a sign, rocks, lamps, platforms, and lava bridges. A lava picture is not automatically type 12. If the ids it writes are type 22, this client treats them as walls. If they are type 11, as water. Type 12 would be walkable here even though the official list calls 12 lava. The drawer can hand you a lake of fire that this walker will cross, or a lake of fire that this walker will bounce off, and the stamp will look the same in the editor until a foot arrives.

Two hundred and eighty-eight is 110 plus 33 plus 41 plus 51 plus 53. Six thousand, nine hundred and forty-eight is the cells added the same way. The arithmetic is the only index the folder has. There is no catalog file. The editor is expected to know the directory.

---

Placing a stamp is the moment the name dies.

The editor expands the block into board cells. A 2 by 2 bush becomes four tile ids. Save as the editor saves, and those ids are decimal on `BOARD 0`. Save as the client reads, and those ids are base64 pairs on `BOARD` lines. Load in the SDL client and `isOnWall` indexes `tiletypes[id]`. The stamp is gone. Only the ids remain. `OBJECT`, the width, the height, the word Bush, `OBJECTEND`: none of them survive into the level. A link can still name a destination. A sign can still carry `#h` for a head. A stamp cannot be asked, later, what it was. The board has no memory of recipes.

That is why a wrong sheet is a quiet disaster. The ids have to exist in `pics1.png` and in the type table, or a placed cathedral draws the wrong picture or blocks the wrong way. `addtiledef2` can paint a rectangle over the base sheet, which is how a chair is replaced without a new four thousand tiles. It does not rewrite the stamp. The stamp still says 2, 3, 18, 19. If those cells have been painted over, the bush wears the new clothes and keeps the old collision. The picture proposes. The id disposes. The type byte judges. The drawer is only the hand that copied the id.

The dungeon generator had stamps of its own, eight by eleven, sixteen place kinds, stamp 0 a ground fill and stamp 1 a hole. Those were not these files. Levelgen had shore stamps and tree stamps, chosen by a palette class and a six-by-six cell. Those were not these files either. The platform has used the word stamp for three different recipes, and only this drawer begins `GOBJSET01`. A person who drops an object set on the dungeon loader, or a dungeon layout on the editor's object menu, has repeated the mistake of the three writers. The signature will not save them. This signature is not even on the level.

---

The drawer is the last small room that still pretends to be a file of pictures.

Open it and you are back at the first lesson, with the numbers filled in. `ACAD` over `ASAT` is a bush because a person named it, and a wall because a table said 20 and 22, and a picture because `pics1.png` has something in cells 2, 3, 18, and 19. Take away the name and the level still loads. Take away the table and the picture still blits and the foot walks through. Take away the sheet and the indices point at nothing, or at whatever sheet was bound by the tiledef. The cathedral is 16 by 12 only in this file. On the board it is one hundred and ninety-two ids, and then it is not a cathedral at all.

Five files. A magic of their own. Two hundred and eighty-eight recipes that become indices only after a hand agrees to place them, and that forget their names in the placing.

The next door is the foot. The local client does not open this folder. It opens the level the hand saved, finds the ids, and asks the table whether the bush is still a wall.
