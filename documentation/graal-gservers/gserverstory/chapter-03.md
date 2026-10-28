# Chapter 3 — Numbers That Had to Be Printable

The length on the outside of a frame is an honest integer. Almost nothing inside it is.

You learn this the first time you dump a packet and expect a packet. The two bytes at the front are a size, big-endian, the kind of short any socket tutorial would recognize. `CFileQueue` builds them with the raw writer: `CString() << (short)pSend.length() << pSend`. `writeShort` shifts the high byte down by eight and stores it first. Ash does the same thing with `struct.unpack(">H", ...)`. That prefix is the door frame. It was added by people who had already met TCP, and it behaves.

Step past it and the century changes.

What lives inside was built for a client that still thought a little like a text protocol. A zero byte was a dangerous guest. A byte above 127 was a guest some old path might sign-extend into a negative and then into a mess. The fix was not a new type system. The fix was a costume. Take the number, break it into seven-bit digits, add thirty-two to each digit, and let the bytes land in the printable range. A space is thirty-two. A packet id, after the costume, often looks like a character. The whole town learned to read in that makeup, and no later engine was allowed to take it off.

The functions are in `CString.cpp`, under a comment that does not pretend to be general: Additional Functions for Data-Packing (GRAAL). Ash copies them into `protocol.py` and names them without the class. The arithmetic is the same in both houses.

A gchar is one byte. `writeGChar` does `pData + 32` and writes it. `readGChar` reads a byte and subtracts thirty-two. The comment above the reader gives the max as `0xDF`, two hundred and twenty-three. That is not a design essay. It is the largest value that still fits in a byte after you have spent thirty-two on the costume. Zero becomes a space. One becomes an exclamation mark. The packet id does not travel as the packet id.

A gshort is two bytes, and the split is seven, not eight. The high byte is `(n >> 7) & 0x7F`, plus thirty-two. The low byte is `n & 0x7F`, plus thirty-two. Max, in the comment, `0x2FDF`, twelve thousand two hundred and fifty-five. A gint, which the code calls `writeGInt` and everyone else ends up calling gint3, is three of those digits, shifts of fourteen and seven and zero. Max `0x17EFDF`, one million five hundred sixty-eight thousand seven hundred thirty-five. gint4 adds a shift of twenty-one. gint5 adds twenty-eight, five bytes, the width used when a file size or a modtime will not fit in the smaller shoes.

Read the gint5 comment and then read the signature. The comment promises a max of `0x5FBF7EFDF`. The function returns an `int`. Those two facts do not agree, and the disagreement is older than you. A reader who trusts the comment and a reader who trusts the return type are reading different servers. Ash, being Python, can hold the wider number without a speech. The C++ reader will clip the promise on the way out. When a file length looks insane, remember that the costume and the type system have been arguing for years.

The operators are the trap that catches everyone once.

In `CString.h`, `operator>>` on a char calls `writeGChar`. On a short it calls `writeGShort`. On an int it calls `writeGInt`. On a long long it calls `writeGInt5`. `operator<<` on a char calls `writeChar`, the raw writer. On a short, `writeShort`. On an int, `writeInt`. Both big-endian. Both innocent. The arrows point at opposite centuries.

So the line in `TPlayerLogin.cpp` that looks like a flourish is a specification:

```
sendPacket(CString() >> (char)PLO_SIGNATURE >> (char)73);
```

`PLO_SIGNATURE` is 25. Written with `>>`, it becomes 25 + 32, which is 57, which is the character `9`. The 73 becomes 105, which is `i`. On a hex dump the signature packet opens `9i`. It is not the ASCII word for a signature. It is two numbers that had to be printable, standing next to each other until a person mistakes them for text. Every packet id is read back with `readGUChar`, which is only `readGChar` in an unsigned coat. The id on the wire is the id plus thirty-two. If you write a decoder that forgets the coat, every message is the wrong message, shifted by a space.

Ash does not get to be cleverer than this. `g_char` is `(n + 32) & 0xFF`. `g_short` is the two seven-bit digits. `read_gchar` is `read_u8() - 32`. A person porting the protocol who "cleans up" the plus-thirty-two has not cleaned up anything. They have left the family.

---

Text is the exception that makes the rule visible.

A Pascal string, in the 1.31 dump, is a real type. `pascalstrings.cpp` sits beside `gserver.cpp` because the monolith did not want C strings hoping for a zero. Length, then bytes. On the later wire the habit survives in a thinner form. A Graal string inside a packet is often a length and then the raw bytes, and the length is frequently a gchar — `>> (char)accountName.length() << accountName` — while the characters themselves are not shifted. The name is the name. Only the count wore the costume. Login is stricter and older in places: the version token is eight raw characters, `GNW28015` and its cousins, and the name and password lengths beside it are plain unsigned bytes, not gchar. Two length conventions in one line. You will get them wrong in that order: first you will subtract thirty-two from a name length that was never shifted, and the name will eat the password; then you will forget to subtract it from a props length that was, and the nick will include a space that was never typed.

The newline is a third citizen. Player packets, once unwrapped, are often read with `readString("\n")`. Listserver packets never had the two-byte frame at all. `TServerList::sendPacket` appends a newline if the buffer forgot one, and sends id plus payload plus that newline. The list speaks a cousin dialect: still the costume on the numbers, no length prefix, the line ending as the frame. When you are logging both sockets and the list lines look like text while the player frames look like a short and a blob, you are not looking at two games. You are looking at the frame that grew up, and the frame that did not.

Compression type bytes sit outside the costume on purpose. In generation 5 the first byte of a compressed body is raw: `0x02` for uncompressed, `0x04` for zlib, `0x06` for bzip2. Ash's `limit_from_type` switches on those exact values. They are not gchar. Add thirty-two to them and the iterator limit will not be found, and the decrypt will walk off the end of a rule that was only twelve or four steps long. The costume is for the game's numbers. The lock's numbers stayed naked so the lock could see them.

---

You can feel, with a pencil, why the old client forced this.

Imagine a chat line. The packet id is a gchar. The text is raw, and it may contain anything a person typed, including a byte that looks like a length. The newline ends the message. If the id had been a raw zero, some path between 2002 and the class rewrite would have treated it as the end of a string. If the coordinate had been a raw byte above 127, some path would have made the player step backward into a signed mistake. Adding thirty-two shoved the control bytes up into the letters and the punctuation, where a sloppy string walker was less likely to kneel. It cost a bit per byte. Seven-bit digits are why a gshort is not a short, and why a level coordinate fits and a file size needs five bytes of costume to say what a raw int would have said in four.

The later servers kept it because the client kept it. Phoenix does not get a vote. The 2.4.0 binary writes `writeGChar` whether or not anyone in the phoenix folder has read `CString.cpp`. Ash gets a vote and spends it on agreement. `protocol.py` is the page where the costume is written down in a language you can change, and the discipline is not to. A rewrite that speaks clean modern lengths — a varint, a little-endian int, a UTF-8 string with a raw count — is a different game, and the v2 window will not enter it.

There is a practical way to hold this in your hands before the next chapter asks you to parse a login.

Take the number 25. Add 32. You have 57, `9`. Take 73. Add 32. You have 105, `i`. That is the signature packet, and it is the smallest poem in the protocol. Take a player id of 2, the first id `onRecv` is willing to hand out. As a gshort it is the bytes `(0 + 32, 2 + 32)`, a space and a quote. Take a tile coordinate that the client thinks of as a half-tile count. It will arrive as a gchar of tile times two, another costume on top of the costume, and chapter 5 will have to undress both. For tonight it is enough to know that the wire is layered paper. The outer short is naked. The packet id is wearing thirty-two. The text is naked again. The lengths switch sides depending on which decade wrote the field.

---

The monolith already knew a cousin of this. Pascal strings in `linuxgserver131` are the length-then-bytes idea without the seven-bit digits, and the plus-thirty-two habit is older than gs2emu's class names. Reborn did not invent the costume. It gave the costume a header file and a pair of operators that point in opposite directions, which is a gift and a trap. The gift is that `>> (char)PLO_SIGNATURE` cannot accidentally emit a raw 25. The trap is that a tired edit will reach for `<<` because the arrow looks like writing, and the client will receive a packet id of 25 where it expected 57, and the message will fall through `msgPLI_NULL` forever. If a private server seems deaf, look at the arrows before you look at the port.

You put the pencil down. The hall from chapter 2 is still there: a socket, type `PLTYPE_AWAIT`, the first payload unencrypted zlib, a line waiting under the two-byte frame. You can undress that line now. The first byte is a type shift in the costume. The next, for a client, is a key, also in the costume. Then eight raw characters of version. Then a naked length and a name, a naked length and a password. The newline ends the confession.

What the shift means, which generation of the lock it selects, and why `GNW28015` is a name the server already agreed to recognize — that is the next room. The numbers were the alphabet. The first line is the sentence.

---

*End of chapter 3.*
