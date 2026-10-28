# Chapter 23 — One Function, Unnamed

The string is at `0x4b6d28`. The code that uses it is at `0x43de8b`. Nothing in the binary calls either of those a name.

Chapter 12 said the way in was a sentence you already trust. This is that sentence: your client type is unknown, please inform the Graal Reborn staff. It sits in `.rdata`, file offset `0xb5528`, RVA `0xb6d28`, virtual address `0x4b6d28` once the image base of `0x400000` is added. Search the `.text` section for the four little-endian bytes of that address and there is one hit. One reference. A sentence with one caller is a door that has not been copied.

The instruction is a push. `68 28 6d 4b 00`, push `0x4b6d28`. In front of it, `8d 4d d4`, load the address of a stack slot into `ecx`. After it, a call to `0x41c880`. That shape is MSVC thiscall, the callee receiving `this` in `ecx`, and the call is a constructor or an assign into a `CString` living on the stack. The dump's line was `CString() >> (char)PLO_DISCMESSAGE << "Your client type is unknown..."`. The binary has the same work with the operators compiled away: make a string, append the sentence, hand it to the player. `esi` in this function is the player. A later call, `mov ecx, esi` then `call 0x439b90`, is the send. You do not need the symbol `sendPacket` to see a member call on the object the function has been using as the player.

The function itself starts at `0x43de5a`. The bytes just above are another function's exit, `ret 4`, the stdcall return that pops an argument. Prologue here is `push edx`, `sub esp, 0x14`, `mov ecx, esp`. A small frame. The byte at `[ebp-4]` is stepped through 1, 2, 3 as objects are constructed, which is the 2010 compiler's lifetime counter for unwinding, the same Visual Studio the PDB path named. You can ignore the counter. It tells you the compiler, which you already knew.

---

The cluster is the rest of the login's refusals.

Above this function, still in the same region, other pushes of addresses in the same page: `0x4b6df4`, `0x4b6dd0`, `0x4b6db4`, `0x4b6d88`. They are the neighboring sentences. A disconnect message does not live alone in `.rdata`. The login's failures were written next to each other, and the linker kept them next to each other, and the code that emits them stayed in one neighborhood even after the names died. When you have found the unknown-type string, walk the pushes in the page above it. Each one is another door the dump already described: no RC rights, the login server is offline, the account is already in use. Match the string, match the chapter, and the unnamed function becomes a labeled one without anyone renaming it in the database.

The shift itself is the compare chain that decides which of those pushes runs. It will be a byte loaded from the packet, compared with 6, with 4, with 5, with 1, with 2, and a jump to this block when none of them hit. I am not going to pretend the walk above named that compare. The walk named the default. The default is enough to orient you. A compare of a byte against 6, in the function that can fall through to this push, is generation 5. Against 4 or 5, generation 4. The eight raw characters are a read of eight, nearby, into a buffer the version function will be called on. You will know it because you have read `msgPLI_LOGIN` and you are looking for a shape, not a name.

This is the whole method, and it is slower than reading the dump, which is why chapter 11 came first. Open the dump to the sentence. Find the sentence in the binary. Find the one push. Read the calls around it until one of them is the player. Then stop. A night that names the default branch has earned the next compare. A night that renames four hundred functions has not read any of them.

---

What not to do with the address:

Do not expect `0x43de8b` to be stable in another binary. Rev 51 is a different file and a different layout. The string will move. The method will not. Search the sentence, not the address. Do not trust a decompiler's name for `0x41c880`. It is a `CString` operation because of how it is called, not because the listing says `CString::CString`. If the listing names it, good. If it names it `FUN_0041c880`, leave it. The call shape is the evidence.

Ash is the check on the shape, not on the address. `handle_login` builds the same sentence and calls `disc`. If the binary's cluster contains a sentence Ash does not send, you are in chapter 22's residue and you should write it down. The unknown-type sentence is not residue. It is the dump, compiled, still willing to introduce itself.

One function. One string. One push. The shift is the next evening, and it will look like a byte and a compare, because that is what a shift is when nobody has labeled it.

The next room is the line the server will not cross, no matter how carefully you name the function. The script runs somewhere else.

---

*End of chapter 23.*
