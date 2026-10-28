# Chapter 6 — The Quiet List

The listserver is not the world. It is the directory the world writes to, and the clerk the world asks before it will hand someone a body.

You can run a town without it. Ash does, when `offline_login` is true, and the accept loop does not die if the far socket never comes up. gs2emu will still start if the connect fails — `connectServer` is called from `init` and the failure is not the failure that aborts the listen — but it will not let a client or an RC through `msgPLI_LOGIN` while the clerk is out. The message is the one from chapter 4. The login server is offline. Try again later. The NPC-Server is the exception, because its password lives in `adminconfig.txt` and not in the public book. Phoenix is this house. If the directory is down, Phoenix is a town with the door shut and the lights on.

The socket itself is a cousin, not a child. No two-byte length. No zlib. `TServerList::sendPacket` appends a newline if the buffer forgot one, and the line is the frame. Inbound, the same rule: read to `\n`. The first byte is a gchar id, the costume from chapter 3, and then a payload in the same mixed manners. Ash's list thread does this with `index(0x0A)` and `read_gchar`. When you log both sockets and the list looks like text while the player frames look like a short and a blob, you are seeing a protocol that never grew the door frame.

The ids are two tables that do not share a numbering, which is the first way to go wrong. Outbound is `SVO_`. Inbound is `SVI_`. `SVO_PING` is 16. `SVI_PING` is 99. `SVO_VERIACC2` is 17. `SVI_VERIACC2` is 11. A decoder that uses one enum for both directions will greet a ping as a player remove and a verification as a nickname. The header in `IEnums.h` marks several of the old file ids deprecated. The handlers for `SVI_FILESTART2` and its siblings do nothing but log that they should not be used. The directory has a geology. The live stratum is the one without the comment.

---

Morning, on this socket, is a fixed letter, and the order is the point.

`connectServer` sends `SVO_SERVERHQPASS` first, the `hq_password` from the admin config. The comment says to send it before `SVO_NEWSERVER` or the name will come out wrong. Then `SVO_NEWSERVER`, eight length-prefixed strings: name, description, language, the gserver version, url, ip, port, local ip. Lengths are gchar. Text is raw. The name in that letter is not the directory name from `servers.txt`. It is the `name` option, which is why Phoenix can live in `servers/phoenix` and still introduce itself as Phoenix. Ash introduces itself with the version string `Ash/1.0`, a small honesty the binary does not have.

The local ip is a fuss. If it is empty or `AUTO`, the socket's own address is used. If that address is `127.0.0.1` or `127.0.1.1`, the log warns and the field is cleared. A directory that published a loopback would be a directory lying about where the town is. Then `SVO_SERVERHQLEVEL`. If `onlystaff` is on, the level sent is 0. Otherwise it is `hq_level`, default 1. The public book is being told how official this house claims to be. Then `sendPlayers`, even if the list is empty, so the census starts at zero rather than at a rumor.

Ash's `_hello` is the same letter in the same order. Host and port default to `listserver.graal.in` and `14900`. A failed connect sleeps fifteen seconds and tries again. The world thread does not wait on that sleep. The clerk is a side room.

---

The heartbeat is uneven on purpose.

Outbound, every thirty seconds, `SVO_PING`. Inbound, `msgSVI_PING` comments that the directory sends one every sixty seconds, and then does nothing. Ash, on a recv timeout, sends another ping of its own. Neither side treats the ping as a question that requires an answer in the handler. The answer is the next ping, or the lack of one, which is how `doMain` knows to call `connectServer` again. Every three hundred seconds the world sends the census again: `SVO_SETPLYR`, a gchar count, then for each player the account, the nick, the level, x and y as half-tile gchars, the alignment, and the type. Arrival and departure are `SVO_PLYRADD` and `SVO_PLYRREM` in between, so the directory does not have to wait five minutes to know that someone stood up. The five minutes is the correction, in case a letter was lost and the book has drifted from the room.

A player on that census is not the socket in the hall. It is the fields the directory knows how to print: a name, a nick, a level, a place, an alignment, a type. The board does not go to the list. The hearts do not go to the list. The quiet machine is a lobby board, not a mirror.

---

Verification is the letter chapter 4 sent and did not open.

One correction, before the reply. The id in `SVO_VERIACC2` is not a raw short. The call is `>> (short)id`, and `operator>>` on a short is `writeGShort`. The type is `>> (char)type`, a gchar. Chapter 4 said raw, because the frame length had made naked shorts feel like the default. They are not the default. The account length is a gchar, the account is raw, the password length is a gchar, the password is raw, the id is a gshort, the type is a gchar. Ash agrees on the id, and uses `g_short`. It still reads the reply's name length with a naked `read_u8`, the same seam as the login line. When the two houses disagree, the C++ has been in the hallway longer.

The reply is `SVI_VERIACC2`. gs2emu reads a gchar length and an account, a gshort id, a gchar type, and the rest of the line as a message. The account from the directory overwrites the account name on the player. The directory is allowed to correct the spelling. If the message is not the exact string `SUCCESS`, the message itself is sent to the client as `PLO_DISCMESSAGE`, the player id is set to 0 so the account will not be saved, and the socket is dropped. A wrong password does not get a private code. It gets the directory's sentence, and then silence.

If the message is `SUCCESS`, `sendLogin` runs. That is the function chapter 5 walked through: the signature, the props, the warp, the board. The grass was waiting on this word. If `sendLogin` returns false, the id is zeroed again and the socket is dropped, and the disconnect message that would have explained it is commented out. A failed welcome is a hang-up. Ash does not call the welcome from the list thread. It sets `list_verified` and lets the login thread, which has been polling, finish the send itself. Same word. Different chair.

`SVI_ERRMSG` is the directory talking about the world rather than about a player. gs2emu prints the rest of the line to the server log. Ash prints it the same way. `SVI_VERSIONOLD` is Ash noticing that the clerk thinks this gserver is old, and saying so. There is no argument. The clerk's opinion is logged and the town continues.

---

The directory is also a post office, and this is the part a login story forgets.

`SVI_RAWDATA` is 100. It does not carry the file. It announces that the next packet is raw, and gives the size as a gint. Then `SVI_FILESTART3`, `SVI_FILEDATA3`, `SVI_FILEEND3` — 15, 16, 17 — deliver a global head, body, sword, or shield into `world/global/`, under `heads/`, `bodies/`, `swords/`, or `shields/`. The start creates an empty file and adds it to the filesystem. The data appends. The end may zlib-decompress, sets the modtime from a gint5, and if a player id was named, updates that player's prop so the new image is worn without a relog. A head you see on someone else may have arrived from the directory in the last few seconds, not from the world folder you copied onto the machine. The costume on the modtime is the gint5 from chapter 3, finally used for the reason it was given five bytes.

Deprecated file ids are refused with a log line. The geology again. A private list that still speaks the old file dialect will be heard, and ignored, and the ignore will be written down.

---

Offline is not a missing feature. It is a choice about who is allowed to be the clerk.

gs2emu's choice is in the login function and in a comment: `TODO: localhost mode`. The todo is the feature. Without the directory, a client does not enter. Ash's choice is `offline_login`, default true. The account file in `accounts/` is trusted. The password may still be stored, and the list, if it later connects, can be told about the player with `PLYRADD`, but the grass did not wait. A world you are running on a desk in the middle of the night is a world Ash will open. The same world, under Phoenix, will quote the offline sentence until `listserver.graal.in:14900` answers, or until you point `listip` and `listport` at a clerk you run yourself.

Neither choice changes the dialect. A clerk you write has to accept a newline-framed socket, a gchar id, the HQ password before the name, and a verification reply whose success is the eight characters `SUCCESS` and not a boolean. Get the id tables mixed up and the town will ping you with a player-remove. Forget the plus-thirty-two and the name in `NEWSERVER` will be thirty-two bytes too long and eat the description. The quiet list is quiet because it does not draw the board. It is not quiet to implement. It is a second protocol, smaller, older in its framing, and the reason chapter 5's body is allowed to exist in the C++ house.

You have a person on the grass now, and a directory that knows their nick. You do not yet have the other door: the remote control, the staff bits, the folder browser, the way a file larger than the old client can stand is cut into pieces and sent anyway. The client you grew up with asked for heads by name. The staff client asks for the folder the heads live in.

That is the next room. The staff door.

---

*End of chapter 6.*
