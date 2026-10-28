# Chapter 16 — The Fight and the Drop

The server does not swing the sword. It believes the client, and then it tells the room.

`msgPLI_BOMBADD` reads a position as two gchars divided by two, the half-tile again. The next byte is split: the top bits are a player, the bottom two are a power. The byte after that is the fuse, in increments of a twentieth of a second, and the comment says it defaults to 55, which is 2.75 seconds. Then the function does the only thing it came to do. It sends `PLO_BOMBADD` to the level, with the thrower's id and the rest of the packet. `BOMBDEL` is the same relay. `ARROWADD` is the same relay. `FIRESPY` is the same relay. An explosion is a relay with one gate: if `noexplosions` is on, the packet is eaten. Otherwise radius, half-tile, power, and `PLO_EXPLOSION` to the neighborhood, the map send from chapter 13, not only the file you are standing in. A bomb three cells away is not your bomb. A bomb one cell away is.

Hurt is a letter to one person.

`msgPLI_HURTPLAYER` reads a gshort id, two gchars of knockback, a power, and a raw int that is an NPC. The victim is looked up. If their status has the paused bit, the function returns and the letter is not sent. Otherwise `PLO_HURTPLAYER` goes to the victim, with the attacker's id. The server does not subtract the heart. The victim's client does, and will later tell the server the new heart as a prop. A paused player is the one check. There is no distance check in this function. The neighborhood was the bomb's problem. The hurt packet trusts the id.

This is the shape of the old fight. The client that threw is the author. The server is the room. A later process, the NPC-Server, can become the author by sending packets of its own. Until then, a bomb is a rumor the level agrees to repeat.

---

Death is the first place the server counts.

`dropItemsOnDeath` returns immediately if `dropitemsdead` is off. Otherwise it rolls gralats: `rand` modulo `maxdeathgralats`, clipped to `mindeathgralats`, and clipped again to what you actually hold. The defaults are 1 and 50, the numbers in Phoenix's options. Arrows and bombs are rolled as `rand` modulo 4, then taken in stacks of five, and the stack count is reduced if you do not have the fives. The counts are subtracted and sent back as `PLO_PLAYERPROPS`: gralats as a gint, arrows and bombs as gchars.

Then the ground receives them, and the function does it by calling itself a liar.

Gralats are broken into denominations. A remainder that is not the number modulo 100 is a 100-piece, item 19. Modulo 30, item 2. Modulo 5, item 1. The rest, one at a time, item 0. Each one is placed near the body, X plus 1.5 plus a roll, Y plus 2 plus a roll, and handed to `msgPLI_ITEMADD` by writing a `PLI_ITEMADD` packet and then reading the first gchar off so the handler sees what a client would have sent. The same packet, minus that byte, is sent as `PLO_ITEMADD`. Arrows are item 4. Bombs are item 3. A death is a person becoming a small pile, and the pile is placed by the same function that believes a client who drops something.

Taking is the reverse, with a costume check. `msgPLI_ITEMDEL` removes the item at the half-tile and tells the level. If the first byte of the packet, minus 32, equals `PLI_ITEMTAKE`, the item is given to the player as props. The minus 32 is the gchar. A take and a delete share a body, and the id decides which. Miss the costume and a take is only a disappearance.

---

A bush is a tile, and the drop is a roll the old client used to do itself.

`msgPLI_BOARDMODIFY` alters the board and tells the level, and then, if the client is older than 2.1, returns. The comment is the reason. Older clients drop items on their own side. A 1.41 server, Phoenix's options note, should turn `bushitems`, `vasesdrop`, and `baddyitems` off or the ground will fill twice. For a 2.1 client the server looks at the tile that was just destroyed. Bushes, grass, and swamp are tiles 2, `0x1a4`, `0x1ff`, and `0x3ff`, and only if `bushitems` is on. The roll is `rand` modulo 100 against `tiledroprate`, default 50. Success picks an item from 0 to 5. A vase is tile `0x2ac`, and if `vasesdrop` is on it always drops item 5. No roll. The item is placed on the tile that broke, by the same self-call.

A chest remembers.

`msgPLI_OPENCHEST` reads two gchars, the cell. If a chest in the level sits there, and this account's chest list does not already hold it, the item index becomes props, `PLO_LEVELCHEST` is sent with a one and the cell, and the chest string — including the level name — is pushed onto the account. Chapter 14 saves that list as `CHEST` lines. A chest is once per person per level, not once per level. The next login sends the opened ones so the client can draw them open. Forget the level name in the string and a chest in another file looks like the same chest.

---

The rating is the one calculation the server will not let the client write.

`msgPLI_CLAIMPKER` reads a gshort and finds the killer. If it is missing, or it is you, nothing happens. If the level is a sparring zone, the comment names the system: Glicko. The other player's rating prop is unpacked with the shifts from chapter 5, nine bits and the rest. If both sockets share an IP, the function returns, so a person cannot farm themselves from the same machine. The constant `0.0057565` appears in the g, the expected score, and the deviation update. Ratings are clipped from 0 to 4000. Deviation is clipped from 50 to 350, which is why a fresh account's 350 is the ceiling of doubt and not a starting guess. Then `setRating`, and `setProps` of `PLPROP_RATING` with a dummy zero.

The dummy is the comment. `setProps` will not alter your rating, for packet-hacking reasons, and will send the rating it already holds. The claim path writes the number first and then asks for a broadcast of whatever is there. A client that includes a rating in its own prop packet does not get to set it. The fight can move the number. The prop stream cannot.

Outside a sparring zone the claim is a kill, unless `dontchangekills` is on. If the AP system is on, and the victim had more than 19 AP, the killer's alignment drops by a step that grows with both alignments, floored at 0, and the AP counter is set from the ladder: 30, 90, 300, 600, 1200 seconds, the same options chapter 2's clock spends. A spar changes doubt. A kill changes a count and a reputation. The level decides which, because the level knows if it is a sparring zone.

Ash relays the bomb and the hurt and can roll a baddy's death. The Glicko block and the denomination pile are the C++ house's full sentence. A world that only needs a v2 client to walk can live without the rating math. A world that calls itself a spar server cannot. The constant is ugly on purpose. It is the formula, written out, because nobody trusted a helper to stay faithful.

The next room is the mouth. Toall, the private message, the jail list that swallows both, the filter that can turn a sentence into a warning. The fight was a relay. Speech is a relay with opinions.

---

*End of chapter 16.*
