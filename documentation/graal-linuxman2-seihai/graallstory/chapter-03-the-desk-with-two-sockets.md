# GraalLStory

## Chapter III — The Desk With Two Sockets

The third door does not open onto a board.

A player stands on an index. A figure turns because a gani named a rectangle. The person at this door is not standing anywhere. Remote Control is the Delphi desk staff used on a running server, the predecessor of the GTK bundle later shipped as `RC2_2.05.exe` under `graal/RC2/`. It does not blit `pics1.png`. It does not parse `ANI`. It keeps a list of people who are already in rooms, and two sockets by which a person with rights can reach into those rooms without a foot on a tile.

The binary is a Borland GUI, the same family as the shop: the RTL banner, `ctl3d32.dll`, exception frames, a custom memory manager. It also links Winsock 1.1, a zlib deflate unit, and the Delphi JPEG unit. One process. Twenty-five forms created before the application runs. The first is the console, `gvar_004BB0F0`. The last is the server list, `gvar_004BB13C`, titled `Graal Server List`. Between them sit the account editor, the message editor, the flag list, the account list, the options frame, the file browser, the NPC list, the class list, and several forms the dump never named. Do not invent menus for the unnamed ones. The tray icon is real: `Shell_NotifyIconA`, a `NOTIFYICONDATA` on the console, refreshed by a timer that walks the player list.

Local settings live in `controlconfig.txt` beside the executable. Nickname, whether to log the RC chat, the download folder, whether to save the password, which icons to show. The same family of keys is what RC2 later wrote to `control2config.txt`, without the GTK editor options. This binary does not write a syntax highlighter. It writes a desk.

---

Both sockets are the same class.

`TGraalClient` is created with the handle at `+0x04` set to −1, the cipher seed stored, and an increment taken from a call masked to seven bits. On the console, offset `+0x38c` is the game socket, the RC line. Offset `+0x390` is the NPC-server socket. Sends to the first go through one function. Sends to the second go through another. Both do nothing if the object is nil. A staff action that has not opened the second socket is a letter with no address.

Connect is Winsock as it was taught in that decade. `WSAStartup` once, version `0x0101`. `inet_addr`, and if that returns none, `gethostbyname`. A TCP stream socket. `TCP_NODELAY`. The port is a decimal string, converted and put in network order. Then the socket is set non-blocking. Failure raises `Socket not established!`. The peer address is kept as text from `inet_ntoa`. A timer on the server list pumps the socket while the list is up. The status strings in that interval are `Connecting to server ...` and `Getting server list ...`. A row is kept only when the source has at least six fields. Close writes −1 back into the handle.

The NPC login is a separate ceremony. If the NPC socket object is nil, it is opened, connected, and sent a packet of type 3 whose payload starts with the literal `NCL11012` and two length-prefixed fields. The status label becomes `Connected to NPC-Server`, and five controls are shown. NPC deletes and class scripts go out on this socket, not the RC socket. Two doors, one process. The game line administers players, accounts, files, and levels. The NPC line administers the scripts that stand in those levels. Mix them and the send is a no-op, or worse, a packet on the wrong conversation.

---

The wire is text that has agreed to look like text.

This client speaks the classic Graal codec, not the later binary RC framing. A logical packet id is sent as a byte plus `0x20`, so it stays in the printable range. A string is a length byte plus `0x20`, then that many payload bytes. A 14-bit integer is two bytes, each minus `0x20`, the first times `0x80`. A 21-bit integer is three bytes, the first times `0x4000`. The alphabet of the board was base64, two characters for a tile. The alphabet of the desk is this shift, so a packet can sit on a line.

A normal line is the type byte, the payload, and a newline. If a flag on the client is set, a second prefix byte is inserted — the XOR increment plus `0x20` — and the flag is cleared. The first line of a session carries the key. After that the increment is already known, and the line does not repeat it.

The buffer flushes at `0x1000` bytes, and immediately for a large-file frame. Flush picks a mode from the payload size while the mode slot is still 0, then keeps that mode. Under 48 bytes, if zlib does not shrink the payload, the mode is 2 and the bytes go raw. Under 48, if zlib does shrink them, the mode is 4. From 48 to 4095, mode 4, zlib. From 4096 up, mode 6, a second compressor. Modes 1 and 2 are raw. Modes 3 and 4 are zlib. Modes 5 and 6 are the second compressor. Even modes are then XOR-encrypted.

The cipher is the Borland linear congruential generator, one dword at a time. State begins at `0x04A80B38`, which is 78,125,000. Each step multiplies by `0x08088405` and adds the increment. The dword is XOR-ed with the state. A short tail is XOR-ed byte by byte against the state bytes. The arithmetic is 32-bit, the low half only. The framed blob is prefixed with a two-byte length, high then low, each stored as a Delphi short-string character. On the first frame the mode byte is appended.

Zlib here is deflate at level 9. Failure raises `Compression Error %d`. An incoming inflate that fails shows `Decompression error!`. The desk will not guess past a broken frame. A signature on a level can be generous. A frame on this socket is not.

Names on the packets are a courtesy of a later header. Where a number matches `PLI_RC_*` or `PLO_RC_*` in gs2lib, the reconstruction uses that name. The match is by number and call site, not by a symbol in this binary. The desk itself only has the byte.

---

What the desk can do is the list of those bytes.

Type 2 is three option lines, on the RC socket. Type `0x1c` is a short command from the console. Type `0x3d` disconnects a player by id. Type `0x3e` updates levels by name. Type `0x46` adds an account. Type `0x48` asks for the account list. Type `0x49` asks for a player's properties by id. Type `0x4a` asks by account name. Type `0x4e` writes account fields. The account window knows the strings `Edit Account on server`, `Comments of account`, and `Local Ban of account`. A ban, here, is a field on a form, not a tile.

The file browser is a tree. A click sends `0x5a` with the folder path. The reply is length-prefixed names and two 5-byte words, stored as file attributes. An empty listing re-requests the first remembered folder. Status text arrives as `0x43`. Delete checks folder rights first. Rights are a string. If the string does not contain `w`, the browser logs `No write rights for` and does not send. If it does, each selected row goes out as `0x61`, and the folder is refreshed. Rename is the same check.

A drop is stricter. Effect 4 or 0 is skipped. A name that does not exist locally is rejected. A name that matches the blocked pattern is rejected. Over the size limit, the log says `File` and the name and `is too big to upload (max 64k)`. The 64k text is fixed; the comparison is against a global. Write rights are required again. A passing file becomes an upload. The send is three packets: `0x9b` to start, `0x5d` for the body, `0x9c` to end, then a refresh. The large-file path first emits type `0x32`, a 21-bit length, flushes the text buffer, and then writes a memory stream: type byte, name, file bytes, a trailer.

Download is the other direction. Packet `0x44` logs `Downloading big file` and deletes any local file of that name before the transfer. Packet `0x45` logs `Downloaded file` and frees the download object. The landing folder is the `downloadfolder` setting. A failure is logged as `Download of` and the name and `failed`. The quilt's files are reachable from the desk. They are not reachable without the letter `w`, and they are not reachable as a picture.

Chat is a rich edit, one hundred lines. An admin message is stripped of markup, pushed into the message editor, and logged as `Admin Msg:`. A chat line that equals `Your messages are ignored.` is detected. The desk keeps a log if `logrcchat` says so. It is still not a mouth on a board.

---

A player, on this desk, is an object in a list.

Online players are `TServerPlayer` objects at console `+0x330`. Packet `0x37` creates one if the id is not already there, then a walker consumes the property stream. The id is a 14-bit integer. Before any packet, the constructor fills a person who has not yet been described. Hearts are 3.0. Max hearts are 3, and will be clamped to 20. Rupees are 0, clamped later to 9,999,999. Arrows are 5, bombs are 10, both clamped to 99. Glove is 1. Bomb power is 1. The sword is id 1 and `sword1.gif`. The shield is id 1 and `shield1.gif`. The head is `head0.gif`. Five color bytes are set. The sprite is 2. The level name is `onlinestartlocal.graal`. The body is `body.png`. Pixel position defaults to 1500 by 350. Two fields sit at −1 until a property writes them.

The property stream is the same shift as the codec. The first byte is the property id plus `0x20`. Each arm consumes a fixed or length-prefixed body. An unknown id, or a truncated body, aborts the walk. Nickname is id 0. If the nickname contains `(Server)`, the client sends type `0x5e` with `location` appended. Max hearts, hearts divided by two, rupees as 21-bit, arrows, bombs, glove, bomb power. Sword ids 1 through 4 map to `sword1.gif` through `sword4.gif`. Ten and above is a filename. Shield is the same idea, three numbered gifts and then a file. Id 10 is the gani — the string the shop wrote, arriving here as a property, not as a rectangle. Id 11 is the head: negative becomes `head0.gif`, 0 through 99 becomes `head` plus the index plus `.gif`, 100 and above is a filename. Id 20 is the level name. Id 35 is the body image. Id 36 is a packed pixel position, x and y squeezed into three shifted bytes.

Hearts are skipped when a status bit is set and hearts are already positive. That bit is set when another property is non-negative. The desk can be told a number and decline to apply it. After a new player is added, the visible list is rebuilt. An update names a column: nickname, full refresh, level, or head. A timer walks the same list and modifies the tray icon. The person at the desk sees a row. The row is a stream of properties. The properties point at the same files the first two chapters already named: a level, a body, a head, a gani, a sword image. The desk does not open them. It is told which ones are worn.

Disconnect is a click. The packet is `0x3d` and a player id. The foot is not pushed off a tile by this program. The server is asked to drop the id.

---

The second socket has its own rooms.

NPC rows live on a list. Delete asks `Do you really want to delete the npc "` and, if confirmed, sends `0x68` on the NPC socket. Class and weapon scripts have their own window strings: `Script from Class`, `Script from Weapon`, `Add Class`, `Add Weapon`. A button sends `0x77` with the script body. Flags have a find dialog. The captions nearby are `Server. script flags` and `Server options`. The NPC object recovered from the dump has an init table and no other method. The live rows are list items. The script is a pointer and a packet, the way the shop's `SCRIPT` block was a rich edit and not a run.

This is the split the platform keeps insisting on. The board stores ids. The gani stores rectangles and a script it will not execute. The desk stores players as property streams, and scripts as packets on a second socket, and files as names behind a rights string. None of them is the running game. All of them are how the running game is addressed.

A staff member does not press the arrow key. They open the server list. A timer pumps a non-blocking socket. The first line of the session carries the increment. Even modes are XOR-ed with a generator older than the game's public face. A player appears with three hearts and a level named `onlinestartlocal.graal` until the stream says otherwise. A file upload dies at the log line about 64k, or at the missing `w`, or it leaves as three packets and a refresh. An NPC script leaves by the other socket, after a login whose first token is `NCL11012`.

The grass is still an index. The sword is still a rectangle. The desk is the third handwriting: not a signature on a file, but a byte plus `0x20` on a line, and a second line that must not be confused with the first.

The next door goes back to files. The generators paint a map in bulk, and then forget to agree with the loader.
