# Chapter 32 — The Old Author

Before the process, the script ran in the server, and the file is still on the shelf.

Sidrax's `npcs.cpp` is three thousand lines, and around line 70 a comment says functions needed for scripting. There is a command table. `putnpc` is in it, with an argument pattern. `hitnpc` is in it. `parseString` looks at a line and calls `parseCommand`. The cases include a command, an `if`, an `else`, a `for`, a `while`. This is an interpreter. It is not a large one, and it is not the client's, but it is the thing chapter 24 said the Reborn gserver does not have. The monolith had it. Reborn took the NPC out of the listen loop and gave it a socket.

The weapons list beside that era is one file, `weapons.txt`, not a directory of `GRAWP001` files. Entries are jammed together. A name, an image, a bang, a script whose newlines are already `0xA7`, the section sign showing up in the dump as a broken character if you read it in the wrong set. A sword script tests `playerenters`, `playertouchsme`, `weaponfired`, calls `toweapons` and `setani` and `freezeplayer`, writes `timeout = 0.05`. A bomb script by Kraken limits how many can be laid. A bow script shoots when the count reaches seven. These are the sentences. This book will not teach them. They are here so you can see that the language is older than the process, and that the section sign was already how a script survived a file.

`linuxgserver131` keeps the same work inside `gserver.cpp`, because that dump had not yet split `npcs.cpp` out. One ear, and the interpreter was one of the things the ear did between accepts. The Northwest `weapons.txt` is the same jammed list. The 1.3.9 trees have `levelnpcs/` as a directory of bodies. The author lived in the process that also moved the player.

What Reborn kept is the storage and the relay. What it removed is `parseCommand`. The trigger hacks are the few imperatives someone was willing to reimplement as string compares so a world without the process could still add a weapon and a guild line. They are not the table. The table had `if`. The hacks do not.

If you want to see the old author, open `npcs.cpp` at the command array and read the names, not the bodies. The names are the language's verbs as that server understood them. The bodies are an interpreter, and an interpreter is a different kind of reading from a packet layout. Phoenix and Ash will not step those verbs. They will store a script that contains them and hand it to a client that still knows what `timeout` means, or to a process that is not in this folder.

The next chapter is the only scripts this package actually ships, and they are few.

---

*End of chapter 32.*
