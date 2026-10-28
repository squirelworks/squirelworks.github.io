# Chapter 26 — The Link

A link is a rectangle that names another file.

In the level it is one line. `LINK`, then the destination, then X, Y, width, height, then the destination X and Y. Eight fields, unless the destination's name has spaces, in which case the parser folds the extra tokens into the name and the numbers stay the last seven. `parseLinkStr` does the same fold. `getLinkStr` prints them back with a static buffer of 500 bytes, which is a limit you will meet only if a level name has become a paragraph. The packet is `PLO_LEVELLINK` and that string. The client is told the rectangles. The client is who walks into one and asks to warp. The server's job at load is to decide whether the rectangle is real.

It is real if `fileSystem->find` can see the destination. An empty find, and the line is skipped. No object. No packet. A link to a level you have not dropped in `world/` is not a door. It is a sentence the parser declined. This is the same index chapter 7's file send uses, so a link and a head can fail for the same reason: the folder config does not admit the file. A link that works in the editor and not on the server is often a level sitting in a directory the index was not given.

The warp, when the client asks, is the warp from chapter 7. `findLevel` returns a loaded level or loads one, and a failed load is `PLO_WARPFAILED` and the name. A link does not get a special packet on the far side. It is a warp with a destination the file suggested and the client chose. A map edge is the other kind of crossing. Chapter 13's neighborhood is cells of a grid, and you hear the next cell because you are within two. A link is a rectangle inside one file that names a file which may not be on the grid at all. Stand in the rectangle and you leave the town. Walk to the edge of a gmap cell and you are still in the town, one cell over, if the grid has a name there.

A missing destination and a missing map cell fail differently. The link was never sent, so the client should not ask. The map cell was sent as a hole, a blank that still counts, and walking into it is the client's problem. If a client asks to warp to a name the link would have skipped, `findLevel` fails and the warp fails. The unstick level is the last resort of the warp function, not of the link parser. A door the index refused does not become the start level. It becomes nothing.

Ash keeps the link section if it parsed the level. The find-or-skip rule is the part that matters. A door that exists in the file and not in the room is this chapter. The next annex is the other kind of refusal: a person the server will not let in the hall, by address, by range, or by a line on the account.

---

*End of chapter 26.*
