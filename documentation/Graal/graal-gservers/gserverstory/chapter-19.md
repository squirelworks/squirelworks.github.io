# Chapter 19 — What the Level Keeps

The board is the ground. The level also keeps things that stand on it, and they do not all last.

A sign is the one that lasts. It is written into the level file, `SIGN` and a position and lines until `SIGNEND`, and it is loaded with the board. `TLevelSign` keeps two copies of the text. The unformatted copy is what a person typed. The other is encoded, because the wire does not want the letters you typed. It wants indexes into a table.

The table is a string in `TLevelSign.cpp`: the alphabet, the digits, and a handful of marks, and then a run of hashes where the old sign font had no character. A letter is sent as a gchar of its index in that string. A hash is an escape. `#` plus a symbol from `ABXYudlrhxyz#4.` becomes one or two codes from a second table, `ctab`, whose lengths live in `ctablen`. A character the font cannot hold is written as code 86, then 10, then 69, then the decimal digits of its value, then 70. The comment names that sequence `#K(`. Decode strips `#K(13)`, which is a carriage return that had to be smuggled. A sign is a small font, and the font is the protocol.

`getSignStr` writes the X and the Y as gchars, then the encoded text. If a player is passed, the unformatted text is translated first and encoded again, so a sign can speak the client's language if a translation exists. No player, and the stored encoding is sent. The sign does not know who is reading until the send.

Whether you are close enough is `testSign`. If `serverside` is off, the function returns true and does nothing. The comment says to replace that with an NPC-Server check, and the check was never written. With `serverside` on, the test cares about facing. `sprite % 4 == 0` is south. The player's Y must equal the sign's Y, and the player's X must sit between the sign's X minus 1.5 and the sign's X plus 0.5. Close, and a little to the left, which is where a body stands when it faces a sign from above it on the old client. The text goes out as `PLO_SAY2`, newlines replaced with `#b`, because the say packet does not want a real newline either. A sign is a chat line the level has memorized.

---

A horse does not get memorized.

`msgPLI_HORSEADD` tells the level first, then reads the position as two gchars divided by two, then a byte whose low two bits are direction and whose upper bits are how many bushes it is carrying, then the rest of the packet as the image. `addHorse` builds a `TLevelHorse` and sets its timeout from `horselifetime`, default 30 seconds. `getHorseStr` packs the same byte back, bushes shifted up by two, direction masked with three, then the image. Delete is a position. The level removes the horse at that half-tile, and the neighborhood is told `PLO_HORSEDEL`.

The clock is the part Ash never grew. Chapter 2's `doTimedEvents` walks the horses and removes one whose timeout has run, and tells the level. Thirty seconds after the add, if nobody deleted it, the horse is gone and the room is told. A horse is a prop with a death. It is not in the level file. It is not in the account. A restart loses every horse, which is correct, because a horse was never a fact. It was a ride.

The carry path is a cousin. `msgPLI_THROWCARRIED` has a comment that says to remove the check when an NPC-Server exists. If `duplicatecanbecarried` is off and you are holding an NPC id, the throw marks it thrown and puts the NPC back on the level if it never left. Then the throw is relayed. A carried thing is an id the server is trying not to lose. A horse is a picture the server is willing to forget.

---

An item on the grass is the third kind, and it is the shortest lived.

`TLevelItem` stores a half-tile, a signed char type, the time it was created, and a timeout of ten seconds, set in the constructor and not in an option. Chapter 16's death pile and the bush drop both end here, through `addItem`. The denominations are the type: 0 a single gralat, 1 a five, 2 a thirty, 19 a hundred, 3 a bomb, 4 arrows, 5 whatever the vase and the bush roll consider the last item. `getItemName` and `getItemPlayerProp` are how a take becomes a change to the account. The ten seconds are how a take that never comes becomes nothing.

The level's own timed events, the ones chapter 2 said run when someone is standing there, are what notice the ten seconds. An item whose timeout has fired is removed and the neighborhood is told, the same shape as a horse's death and a different clock. Ten seconds for a gralat. Thirty for a horse. Fifteen, the `respawntime` default, for a tile that was changed and wants to grow back. A level with nobody in it does not run this walk, so an empty room keeps its items until someone arrives and the clock notices they are old. Presence is what makes the grass count.

`getItemStr` is the packet form: half-tile X, half-tile Y, the type. The same three bytes the drop wrote. A person who walks in is sent the items still alive, the horses still alive, the signs always. The welcome of a level is a board and then these lists. Miss the list and the room looks empty of everything but tiles. The tiles were the part chapter 5 taught. The lists are why a sign speaks and a gralat glints and a horse is there for half a minute.

---

Ash parses the sign block and the baddy block, and the readme is honest that horses are still out. An add may be relayed. The thirty-second death is the C++ clock. A horse that lives forever on Ash and dies on Phoenix is not a protocol disagreement. It is a timeout nobody ported. Items, if they are placed, need the same honesty: ten seconds is not in an option, so a port that forgets the constructor forgets the death.

The three are a small theory of what a level is willing to remember. A sign is in the file. A chest, from chapter 16, is in the file and also in the account, once per person. An item is in memory for ten seconds. A horse is in memory for thirty. A board change is in memory until the save, and the empty-level drum throws the unsaved ones away. The next room is the memory that is neither a level nor a person: the guild file, and the group name that chapter 13 used as a key and did not explain how you get one.

---

*End of chapter 19.*
