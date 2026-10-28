# Chapter 12 — The Compiled Silence

The dump is the coat you can read. The binary is the coat that actually answers.

Phoenix's `gserver2.exe` and the `gserver2.exe` in `gserver_2.4.0` are the same file. Same length, 933376 bytes. Same hash. The package did not patch the engine. It dressed it. If you have been treating Phoenix as a mystery separate from the 2.4.0 box, put that down. The mystery is the box. The world folder is a dialect spoken by a program that was already finished.

It is a Windows executable, an `MZ` header, a `PE` signature, machine `0x14c`, which is the 32-bit Intel the era compiled for. The timestamp in the header is 6 February 2011, late afternoon. That is not a secret. It is a field. A binary has a birthday even when the functions have lost their names. The revision packages are a different birth. `winGserver.exe` in `GServerRev51` is 297472 bytes and a different hash, the 2.17 line in a smaller coat. Do not open it expecting the 2.4 switch. Genealogy still applies after the source runs out. Size and hash are the first sentence.

---

What survives the compile is the sentences the log was willing to say.

`strings` on the Phoenix binary still finds `Graal Reborn GServer version %s`. It still finds `:: Loading servers.txt...`. It still finds the scar from chapter 2, the error that says `settings.txt` when the file that failed is `servers.txt`. It still finds the unknown-client sentence, the one that asks you to inform the Graal Reborn staff and then prints the type. It still finds `SUCCESS`, `head25.png`, `GLEVNW01`. A program that has forgotten its function names has not forgotten what it says to a person.

What does not survive is the map you have been walking. `doMain` is not in the binary. `msgPLI_LOGIN` is not in the binary. `PLTYPE_AWAIT` is not in the binary. `TServer` is, once, because a type name sometimes leaks out of RTTI or a log the compiler did not consider private. The rooms are still there. The nameplates are not. This is the whole difficulty of the last room, and it is smaller than it looks if you do not try to read the binary as a novel. You read it as a building whose signs have been taken down, using the novel you already wrote as the recollection of where the signs were.

---

The way in is a string you already trust.

Pick a sentence you have seen in the source and in the log. The settings scar is a good one, because it is unique and because you know which function says it. `main.cpp`, the branch where `servercount` is missing. Search the binary for `settings.txt`. The offset is a place. In a disassembler — Ghidra is the free one that will open a 32-bit PE without an argument, and a PE viewer will do for the first hour — go to that address. Look at the instruction that references it. Walk backward to the start of the function. You are not reconstructing `main`. You are confirming that the function which prints that sentence still tests a count and returns. If it does, the dump and the binary still share that morning. If it does not, you have found a place 2.4 diverged, and that divergence is worth more than a week of unnamed functions.

Do the same with the unknown-type sentence. You know it lives in `msgPLI_LOGIN`, in the default of the shift switch. The function that references that string is the login, whether or not the symbol says so. The shift, the generation set, the eight raw characters: they will be near it, as compares and calls, not as names. The gchar subtract of thirty-two will be an `add` or a `sub` of `0x20` beside a one-byte read. You have seen the arithmetic. You are recognizing it with the comments stripped off.

The list's `SUCCESS` compare is the same kind of door. A compare against eight characters, then a call that is `sendLogin` if you have already read `msgSVI_VERIACC2`, then the path that zeros an id and disconnects. You do not need the whole clerk. You need the word and the branch.

This is the method. String, reference, function, compare to the dump. One question, as chapter 11 said. How does this binary refuse an unknown type. How does it still scar the log with the wrong filename. Where is the subtract of thirty-two. Write the answer before you take another string. A hex dump of the whole file is not a reading. It is weather.

---

What the binary can tell you that the dump cannot:

A string the dump does not have. A packet id handled in a switch the dump's `TPLFunc` table does not fill. A size check the dump lacks. The weapon bytecode path, the empty `weapon_bytecode/` room Phoenix ships and does not use, is the sort of wing a later coat adds. If you go looking, look because a log line or a client behavior has no parent in the dump, not because the silence is romantic. Most of the silence is the dump with the names removed. The interesting residue is the difference, and it is smaller than the resemblance.

What the binary will not tell you cleanly:

Local variable names. The comment that 73 means more than eight players. The comment that says kill the bomb dead. The `TODO: localhost mode`. Those lived in the source and died in the object file, unless a string nearby still implies them. The rights bits will be immediate constants, `0x04000` and its siblings, and you will only know them because `TAccount.h` told you. A decompiler that names a function `FUN_00401234` is not wrong. It is unpublished. You publish it by recognizing the string.

The revision binaries are a harder text, because the matching source is thinner. Rev 29, 31, and 51 are the 2.17 line. Use them for layout, account files, and the RC command list, the way chapter 9 did, until a specific question forces you into the disassembly. An older binary plus a newer dump is a liar's pairing. Match the coat to the nearest source, and say out loud which one you are trusting.

---

A small discipline, so the last room does not eat the others:

Do not start here. The path in chapter 11 is the price of admission. A person who opens Ghidra on `gserver2.exe` before they have read `msgPLI_LOGIN` will name the login function something useless and then believe the name. A person who has read it will see the shift and the eight-character read and sit back.

Keep the world folders out of the disassembler. `servers/phoenix/` is not the engine. Confusing a config with a code path is how a staff line becomes a theory of the protocol. The engine is the 912 kilobyte PE. The world is the dialect.

Prefer a difference to a tour. Hash Phoenix against `gserver_2.4.0` and stop, once, to absorb that they match. Then diff strings against an older binary if you want the wings the 2.4 coat added. Then one function. Then stop for the night. The grass will still arrive in the morning. The binary has been answering since 2011 without your annotation.

Ash remains the readable coat. When a decompiler lies, step the same packet through `protocol.py` and see what a v2 client actually required. When Ash and the binary disagree, you have already been told which hallway is older, and you have been told that the binary may be newer than the dump. Hold both. That is the whole scholarship of this archive: four ages of one conversation, and the honesty to say which age is speaking.

---

You came in, back in the first chapter, because the client is the part people remember, and the process that answered it had finally been gathered into one folder. The monolith with one ear. The rewrite with a thread per world. The binary with the lights on and the names taken down. The retelling in Python that left the seams visible. The maps on the wall, which were never the engines.

The client you grew up with is still on the other side of a socket, still expecting printable numbers, still willing to believe a signature that dumps as `9i` and a board of 8192 raw bytes. The engines in this room are the attempts to answer it without embarrassment. You can read the attempt now. You can, carefully, read the silence it became.

The folder is the same folder. The lamp is the same lamp. The next packet is the client's.

---

*End of chapter 12.*

*End of GServerStory.*
