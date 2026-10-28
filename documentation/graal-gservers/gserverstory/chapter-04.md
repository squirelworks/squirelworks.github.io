# Chapter 4 — The First Line

The hall ends in a single line, and the line is not polite enough to say which decade it comes from.

Chapter 2 left the socket as `PLTYPE_AWAIT`, and the comment above the branch is still the best theology available: the first packet is always unencrypted zlib. The five-millisecond select noticed the bytes. The two-byte length, naked, said how many. The payload was inflated. `readString("\n")` cut the confession off at the newline and handed it to `msgPLI_LOGIN`. Everything after this is costume, raw text, and a decision about the lock. If you undress the line in the wrong order, the name eats the password, and the password eats the rest of the person's life on this server.

The log line is already waiting. `:: New login:` and then a tab, and the type has not been read yet, so the sentence hangs open the way a person hangs open a door with their foot.

The first byte is a gchar. `readGChar`, minus thirty-two, and that small number is not the type. It is a shift. `type = 1 << shift`. The flags live in `IEnums.h`, and they are powers of two because the later code wants to test them with a mask.

Shift 0 is `PLTYPE_CLIENT`, the old client, generation 3. Shift 1 is `PLTYPE_RC`, the remote control, also generation 3. Shift 2 is `PLTYPE_NPCSERVER`, generation 3, a process rather than a person. Shift 3 is commented out in the header, a ghost called NC that the switch no longer believes in. Shift 4 is `PLTYPE_CLIENT2`, and the log writes the dates itself: New Client (2.19 - 2.21, 3 - 3.01), generation 4. Shift 5 is `PLTYPE_CLIENT3`, New Client (2.22+), generation 5. Shift 6 is `PLTYPE_RC2`, New RC (2.22+), generation 5, and this is the one case where the switch itself sets `getKey` before the general rule. Anything else is unknown. The server sends `PLO_DISCMESSAGE` with the type it saw, asks the person to inform the Graal Reborn staff, and returns false. The hall ejects them. There is no second guess.

This is why a classic v2 window is not one lock. Phoenix's allowed list runs from `GNW22122` to `GNW28015`, which the comment in `allowedversions.txt` calls 2.1.7 through 2.3.1. That range crosses the labels in the switch. A 2.1.7 client and a 2.3.1 client can both be the window you grew up with, and they do not shift the same bit. The grass looks the same. The first byte does not.

The type is assigned before anyone is verified. Chapter 2 said the socket is not a player until it confesses. That is true, and it is slightly earlier than the welcome. The confession is the shift. The welcome is a later letter. Between them the object is already a client or an RC or an NPC-Server, and the clock from chapter 2 will start treating it that way.

---

The key is the next gchar, and it is not read for everyone.

The rule under the switch is the one to memorize. Any client gets a key. An RC gets a key only if the generation is already above 3. `PLTYPE_RC2` gets a key because the switch asked. The old RC, shift 1, does not. The NPC-Server does not. If you read a key byte that was never sent, you have stolen the first character of the version token, and every check after that is theater.

When the key is read, `in_codec.reset(key)` runs. If the generation is above 3, the file queue is told the same generation and the same key, because files leave by a different door and must wear the same lock. The key is a single unsigned byte. It is not a password. The password comes later, and it is text, and it is checked by someone else.

Then eight raw characters. Not a gchar length. Not a Pascal string. Eight. `readChars(8)`. This is the version token, and it is a name the executables were given by people who sometimes forgot to change it. `versions.txt` in the gs2emu tree is a grudging diary. Graal 2.1.0.0, 2.1.0.1, 2.1.0.2, and 2.1.0.3 all say `GNW31101`, and the note in the file is not subtle about Stefan. A token is not a version. It is what the binary was willing to admit. `getVersionID` turns the eight characters into an integer the rest of the server can compare. `GNW31101` sits near the start of the 2.1 line. `GNW28015` is the 2.3.1 token, the far end of the Phoenix window. RC tokens go through `getRCVersionID` instead. An NPC-Server is scored with the client table. Anyone left over is `CLVER_UNKNOWN`.

Account and password follow, and here the costume comes back. gs2emu reads each length with `readGUChar`, which is `readGChar` in an unsigned coat, then reads that many raw characters. The length wore thirty-two. The name did not. Ash, in `handle_login`, reads those two lengths with `read_u8` and does not subtract. The retelling and the original disagree on this field. If a real v2 client is standing on one side and a Python decoder on the other, this is one of the seams where a name comes out the wrong length. Trust the C++ when they argue. It has been in the hallway longer.

The log then prints the version and the account, and not the key. The key line is commented out. Someone decided a log file did not need to remember it.

---

What happens next depends on which flag just got set.

A full server refuses everyone the same way. If the player list is already at `maxplayers` — one hundred and twenty-eight unless the option says otherwise — `PLO_DISCMESSAGE` says the server has reached its player limit, and the function returns false. An IP ban refuses them too, unless the account already holds `PLPERM_MODIFYSTAFFACCOUNT`, which is a strange kindness: a staff account can walk through an IP ban on the way in, and the check happens before the account is fully loaded, so the kindness is thinner than it looks.

Clients, and only clients, are then held up against `allowedversions.txt`. A line can be a single token, or a range with a colon, `GNW22122:GNW28015`. The server compares version ids, not strings, so the range is numeric once both ends have been looked up. A miss gets a disconnect message that includes the allowed list, with a carriage return jammed in the middle of the sentence, an old client's idea of a new line. Phoenix ships with the classic window uncommented and the Graal 3, 4, and 5 tokens commented out. Reborn 2.4 can speak to those later clients. This package, by choice, does not. Ash checks the same file through `version_allowed`. A world is a dialect of who may enter, written as eight-character names.

Then the roads split.

An NPC-Server does not ask the list. It compares the password to `ns_password` in the admin config. Wrong, and the message is simply invalid password. Right, but another NPC-Server is already in, and the message is that one is already logged in. The comment above that check wonders whether the new one should boot the old one, and then does not. If `sendLogin` fails, that fails too. If it succeeds, the NPC-Server is given `adminRights` of `0xFFFFF`, full rights, and then one more field is read off the end of the line: a gshort, the port it will listen on. `setNPCServer(this, port)`. Maps, levels, and weapons are pushed at it. The log names the port. A process has joined the world as a player-shaped socket, which is why chapter 2's type flag had a slot for it before you had met a person.

Everyone else, in gs2emu, does not get in yet.

If the listserver is not connected, the message is the login server is offline, try again later, and the function returns false. There is a comment, `TODO: localhost mode`, and the todo is still a todo. When the list is up, the server sends `SVO_VERIACC2` with the account, the password, the player id as a raw short, and the type as a raw char. Then `msgPLI_LOGIN` returns true. True does not mean welcome. True means the letter has been sent. The actual `sendLogin` — the signature packet, the props, the level, the moment the grass arrives — waits on the list's reply. The hallway has a second door, and the public directory holds the key to it.

Ash built the localhost mode the comment asked for. `offline_login` defaults to true. If it is on, or the list is down, a client is finished locally: load the `GRACC001` file, and `send_login_client`. If offline is off and the list is up, Ash sends the same verify and waits, briefly, for `list_verified`. A staff-only world can refuse a non-staff client before any of that. An RC that is not on the staff list is told it does not have RC rights. The Python house will let you in when the directory is sulking. The C++ house will not, unless you are the NPC-Server. Phoenix is the C++ house. If Phoenix says the login server is offline, it is quoting `msgPLI_LOGIN`, not a mood.

---

The lock, once chosen, is three different manners of wearing the same iterator.

Generations 1 and 2 are still in `CEncryption`, and the decrypt path returns without doing the later work. They are ancestors. What a v2 client actually brings is 3, 4, or 5, and the first frame was none of them. The first frame was zlib because the server did not yet know what to be. After the shift, the codecs disagree.

Generation 3 compresses the frame with zlib and then, inside the inflated packet, does a small violence. The iterator starts from a constant table — `0x04A80B38` for generation 3 — and each step is `iterator * 0x8088405 + key`. One byte, at a position the iterator picks, is deleted. That is the dummy byte the old dumps were talking about when they said generation 3. It is not a cipher in the proud sense. It is a byte removed so that a casual reader cannot see the whole message, and so that a client and a server who share the key will remove the same byte and agree. Per packet, not per frame. The comment in `parsePacket` says so: generation 3 encrypts individual packets, so decrypt now, after the newline split.

Generation 4 reverses the order. Compression is bzip2. Encryption happens before the compress is undone, on the whole frame, and the iterator limit is taken from the compression type. The file queue and the player codec have to have been told the key back in the login, or the files and the chat will not agree.

Generation 5 puts a raw type byte in front, the naked values from chapter 3: `0x02` uncompressed, `0x04` zlib, `0x06` bzip2. The queue picks bzip2 above eight kilobytes, zlib above fifty-five bytes, and raw otherwise. The type selects the iterator limit — twelve steps for uncompressed, four for the compressed forms — and then the body is decrypted and inflated. The limit is why a wrong type byte does not merely look wrong. It makes the lock take the wrong number of steps, and the plaintext never arrives.

Ash's `inbound_unwrap` is this story in Python, with one mercy: the `first` flag. The first payload is inflated as zlib even if the codec will later be generation 5. After `handle_login` sets the generation and the key, later frames go through the path the shift chose. Phoenix does not have an unwrap function you can read. It has the same switch, compiled, and the same `versions.txt` diary baked into `getVersionID`.

You can hold the line in one breath now.

A gchar shift. Maybe a gchar key. Eight raw characters that claim to be a client. A gchar length and a name. A gchar length and a password. Maybe, if the shift was 2, a gshort port. A newline. Outside, a naked short that said how long the zlib was. Inside, after the inflate, the costume from chapter 3, worn only by the numbers that grew up wearing it.

If the list says yes, or if Ash has been told not to ask, the server owes a reply. The reply begins with the signature you already met, the packet that dumps as `9i`, and then a flood of props: hearts, coordinates, the level name, the board. The person is no longer a line. They are a scatter of fields that must arrive in the widths the old client expects, half-tiles and packed ratings and a head image whose length has had one hundred added to it for reasons the next room will have to justify.

That room is the body. Hearts, tiles, and the board.

---

*End of chapter 4.*
