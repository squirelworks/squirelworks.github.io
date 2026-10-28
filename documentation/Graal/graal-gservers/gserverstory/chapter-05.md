# Chapter 5 — Hearts, Tiles, and the Board

The list said yes, or Ash was told not to ask. Either way the server now owes a body.

`sendLogin` is the function that pays the debt, and it begins by loading the account it has already been saying the name of. The comment above the load is almost tender: the defaults have already been loaded, so a failure here is not fatal. A ban is fatal, unless the account holds `PLPERM_MODIFYSTAFFACCOUNT`. The reason is sent with newlines turned into carriage returns, because the client that will display it is old enough to have opinions. An RC that is not staff, or whose IP is not on the account's list and the list is not the wide-open `0.0.0.0`, is told it does not have RC rights, and the attempt is written to the RC log. A client on a staff-only world is told the world is restricted. A client whose IP is not allowed for that account is told so. The grass is still not on the screen. These are the last doors in the hall.

Then the signature, which chapter 3 already taught you to see as `9i`. The comment beside it is the part the dump cannot tell you. `0x49`, seventy-three, is used to tell the client that more than eight players will be playing. The number is not a count. It is a permission to imagine a crowd. If an NPC-Server is already in the world, `PLO_HASNPCSERVER` follows, so the client will stop sending NPC props it has been editing on its own. The process in the other chair would rather be the only author.

A duplicate account is handled with a thirty-second mercy. Same account name, same species — client with client, RC with RC — and a different id. If the other socket has been silent for more than thirty seconds, it is kicked with the sentence about someone else logging in, and the new one proceeds. If the other socket is still warm, the new one is refused: account already in use. Guests skip this. A guest is not a person the server is willing to defend.

`loaded` is not set until the species-specific send returns true. Until that flag, the account will not be saved on the way out, and the server will not pretend this socket may send. The welcome and the right to be remembered are the same bit.

---

`sendLoginClient` is the client's welcome, and it starts with a piece of arithmetic that has nothing to do with tiles.

Spar deviation drifts. The comment gives the formula and the constant: `c` is `44.721`, sixty days for a deviation to wander from 50 to 350, and each quiet day the deviation grows by that constant under a square root, clipped at 350. A person who has not fought in a long time arrives less certain. The rating itself is not recomputed here. Only the doubt. It will leave later packed into the same integer as the rating, which is why a single gint3 on the wire is two facts wearing one coat.

Then `sendProps` with the `__sendLogin` mask. A props packet is a gchar id and a value whose width depends on the id, repeated until the buffer ends. Self gets `PLO_PLAYERPROPS`. Everyone else gets `PLO_OTHERPLPROPS` and a gshort of the player id before the same stream. The mask is the editor. Login does not send every field. It sends the fields the mask believes a person needs in order to appear.

The widths are a second costume, laid over the plus-thirty-two from chapter 3.

A nickname is a gchar length and raw bytes, and the length is clipped at 223 because that is all a gchar can hold. Hearts are two fields. `PLPROP_MAXPOWER` is a gchar of the heart count, clipped to `heartlimit` — three unless the option says otherwise — and clipped again at twenty. `PLPROP_CURPOWER` is a gchar of hearts times two, so a half-heart has somewhere to live. On the way in, the server divides by two. On the way out, it multiplies. A player with three hearts is the byte `6` plus thirty-two, not the byte `3`. If you forget the doubling, everyone arrives at half health and nobody knows why the potions look generous.

The sword is ruder. Outgoing, the power is sent as power plus thirty, then a gchar length, then the image name. Incoming, a value of four or less is an old-style power and the image is invented: `sword` plus the number, `.gif` before 2.1 and `.png` after. A value above four has thirty subtracted, and the image is read from the packet. The shield does the same trick with ten instead of thirty, and a comment admits a bugfix for the 1.41 client that had no bytes left to read. The head image adds one hundred to its length before the bytes, and the image is clipped at 123 so that length-plus-one-hundred still fits in a gchar. Incoming, a length under one hundred means there is no custom image: the client meant `head` plus that number. A length of one hundred or more is a filename wearing a disguise. Body images do not get the hundred. They are a plain pstring. The head is special because the old client already used the small numbers for the default faces, and the filename had to start somewhere the defaults would never reach.

Coordinates are half-tiles. `PLPROP_X` is a gchar of `x * 2`. Incoming divides by two. A player standing at tile 30 is the number 60 in the costume, and the costume adds thirty-two, so the byte on the wire is 92. Two dresses. Take off only one and the player is standing in the wall. Z is stranger: outgoing `(z + 0.5) + 50`, so that a ground level of zero survives a gchar and a negative does not. Clients from 2.30 on also have `PLPROP_X2` and `Y2`, a gshort of the absolute pixel count shifted left one bit, with the low bit set if the value was negative. The old half-tile and the new pixel are both sent, so a mixed crowd can see each other. When a pre-2.30 move arrives, the server computes `x2 = x * 16` and tells the newer clients in a side buffer. The town has two rulers. The server keeps both.

Rating is the packed doubt. `((rating & 0xFFF) << 9) | (deviation & 0x1FF)`, written as a gint3. Twelve bits of rating, nine bits of deviation. A decoder that prints the gint3 as a single score is printing a lie that happens to be the official shape of the lie.

Level name is the field that lies on purpose. If the player is standing on a gmap, `PLPROP_CURLEVEL` sends the map name, not the level. If the level is singleplayer, it sends the level name with `.singleplayer` glued on, and the length includes the thirteen extra characters. Everyone else gets the level name. An RC asking for the same prop gets a single space. The current level is not a fact. It is a fact adjusted for who is listening.

Colors are five gchars. Alignment, the AP from chapter 2, is one. Account name is a pstring. Rupees are a gint3, clipped at 9,999,999. Arrows and bombs clip at 99. The glove and the bomb power clip at 3. A props stream is a negotiation with a client that will draw whatever you send and punish you, silently, for a width you got wrong. Miss a length and the next id is eaten as text. The player will appear with someone else's nickname and a coordinate from the middle of a chat line.

---

After the props, the welcome is a handful of civic notices.

Staff guilds go out as `PLO_STAFFGUILDS`, names in quotes, comma-separated. Status list icons, for a 2.1 client or an RC or an NPC-Server, go out the same way. Flags follow, player flags and then server flags, `name` or `name=value`. If `flaghack_ip` is on, `gr.ip` is set to the socket's address before that loop, so the script side can see what the log already knows.

Then a deletion that sounds like a joke and is not. `PLO_NPCWEAPONDEL` for `Bomb`, and again for `Bow`. The comment says they are added automatically by the client for God knows which reason, and that the names must be capitalized. A welcome that does not delete them is a welcome with two weapons the account never asked for. Real weapons are sent after, from the account's list, and a missing weapon that matches a default item id is created on the spot by feeding `msgPLI_WEAPONADD` a packet the server writes to itself. Versions 2.21 through 2.31 also receive `-gr_zlib_fix`, an NPC weapon whose only job is to correct a zlib bug in that window. The 2.31 client, and the 1.41 one, get every loaded bigmap pushed at them, because they will not request the map file when `setmap` is used. The server has learned the client's forgetfulness by name.

Then `warp(levelName, x, y)`. If it returns false, the message is no level available, and the log names the account and the level that could not be found. The grass is a file. No file, no welcome. The comment says warp will call the compress for us. The board does not go out as a polite afterthought. It goes out because the player has been put somewhere.

---

A level file is a header and a neighborhood.

`loadLevel` looks at the extension first. `.nw` is the Northwest text format. `.graal` is the older Graal format. `.zelda` is the other older format, and the loader notes that the 1.39 to 1.41r1 client actually saved `.zelda` as `.graal`, so a file that claims one thing is checked for the other. If the extension does not decide, the first eight characters do. `GLEVNW01` is Northwest. `GR-V1.01`, `GR-V1.02`, `GR-V1.03` are Graal. `Z3-V1.03` and `Z3-V1.04` are Zelda. Anything else is not a level.

The board underneath all of them is the same shape at runtime: sixty-four by sixty-four tiles, a `short` each, in `levelTiles`. `getBoardPacket` writes `PLO_BOARDPACKET`, then the raw tile array, then a newline. 8192 bytes of tile data, not costumed. This is the other naked integer in the protocol, the cousin of the frame length. The tiles are a picture the client must have exactly, so they travel as themselves. Ember's map of the send wraps that packet in `PLO_RAWDATA` with a gint3 size when the queue wants a raw section. The board is the one place the costume steps aside.

`GLEVNW01` stores the picture as text, which is why you can open `onlinestartlocal.nw` and read it. A `BOARD` line is `x y width layer` and then a string of characters, two per tile. Each pair is looked up in a base64 alphabet and combined, high character shifted six, low character added. The layer is read and not, in that loop, applied as a second board. Links are `LINK` lines, and a link whose destination is not in the filesystem is skipped. A door to nowhere is not a door. Chests are a line of five tokens, and an item name that does not resolve is dropped. Signs run until `SIGNEND`. NPCs run until `NPCEND`, the code lines joined with the section-sign byte `0xA7`. Baddies are `BADDY` with an x, a y, and a type, and the verses run until `BADDYEND`, each verse stuffed into a prop id starting at `BDPROP_VERSESIGHT`. A baddy is a position, a species, and a small book of lines it may say when it sees you.

The older formats are less readable and more bitter. The Zelda loader's comment, on the 12-bit and 13-bit control codes, is just `WTF`. Run-length encoding, a double-repeat mode, an end marked by a baddy whose x, y, and type are all minus one. The Graal loader is the same family. Reborn still reads them because the worlds on the shelf still contain them. A server that only understood `GLEVNW01` would be a server that could not open its own grandparents.

When the level is spoken to a client, the board is not the only sentence. Links go out as `PLO_LEVELLINK` plus the link string. Chests as `PLO_LEVELCHEST`, with a flag for whether this player has already opened it, and the item and sign indexes only if they have not. Horses as `PLO_HORSEADD`. Signs as `PLO_LEVELSIGN`. Baddies as `PLO_BADDYPROPS`, a gchar id, then the prop stream, then a newline. NPCs as `PLO_NPCPROPS` and a raw int id. Board changes since a modtime go out too, and chapter 2 already told you why the change object is not deleted when the tiles revert: the client remembers, and a server that forgets cannot tell it to remember differently.

A baddy that dies does not leave the file. It leaves the live list's mood. Ash's clock, the one-second `tick_baddies`, waits `baddyrespawntime` and then resets the mode and tells whoever is standing there. gs2emu does the same class of work inside `TLevel::doTimedEvents`. The verse book stays. The body stands back up. Nothing in the welcome explains this to the client in advance. The client learns a baddy by being sent one, and learns it is gone by being sent a different mode.

---

Warp is the hinge between the file and the screen, and it is also a social act.

The new level is found or loaded. `findLevel` walks the cache case-insensitively, and on a miss constructs a `TLevel` and calls `loadLevel`. If an NPC-Server is connected, it is told about the new level immediately, with a single-socket update so the news goes out now. Players already standing there must be told you exist. You must be told they exist. The gmap, if the level is a cell of one, replaces the level name in the prop the minimap reads. A group map makes an instance, the thing chapter 2 garbage-collects when the last player leaves. A sparring zone knocks a full AP down to ninety-nine so the fight has a number to spend. Singleplayer levels are a private clone, ticked from the player rather than from the shared list.

If all of that succeeds, the client you remember finally has somewhere to put its feet. The hearts in the corner are `PLPROP_CURPOWER`, doubled. The body is a head image whose length was a hundred too big on purpose. The grass is 8192 raw bytes that began life as pairs of letters in a text file, or as a bitter little bitstream with a comment that had given up. The other people are the same props you just received, addressed to their ids, and your id was searched from 2 on the way in so that the gshort in `PLO_OTHERPLPROPS` would never be the number the protocol kept for itself.

You can stand in the start level now. You cannot yet explain the quiet machine that may have refused you before any of this. The signature, the hearts, the board: all of that waited, in the C++ house, on a letter to the listserver and a letter back. The letter has a dialect of its own, no length prefix, a newline for a frame, and a census every five minutes.

That is the next room. The quiet list.

---

*End of chapter 5.*
