# Chapter 22 — What 2.4 Added

Most of the silence is the dump with the names removed. The residue is smaller than a tour would like, and that is the finding.

The method was the one chapter 12 named. Pull the printable strings from Phoenix's `gserver2.exe`, which is the same file as `gserver_2.4.0`, and ask which of them never appear in the gs2emu tree. Hundreds do not. Almost all of those hundreds are the compiler's luggage. Boost's exception types. The Visual C++ runtime. bzip2's internal error 1007 and its apology. zlib's `buffer error` and `data error`. MiniUPnP 1.4, the user-agent `OS/version, UPnP/1.0, MiniUPnPc/1.4`, and the port-mapping counters `NewTotalBytesSent` and `NewPortMappingDescription`. A Windows manifest that asks to run as the invoker. None of this is a packet. It is the coat's lining. A string diff that does not throw the lining out will announce that 2.4 invented an operating system.

What the lining does tell you is who built the coat and when. The PDB path survived: `C:\Users\Nalin\Documents\Visual Studio 2010\Projects\gs2_release\bin\gserver2.pdb`. Nalin's machine, Visual Studio 2010, a release configuration named `gs2_release`, the binary `gserver2`. The PE timestamp was 6 February 2011. The path is the other half of the birthday. RTTI survived in places the function names did not. `.?AVTPlayer@@`, `.?AVTServer@@`, `.?AVTServerList@@`. The classes chapter 11 walked are still named in the type tables, which is why a disassembler can sometimes find `TServer` and still cannot find `doMain`. The nameplate on the class outlived the nameplate on the function. That is a gift, and it is not a source listing.

---

The game's own new sentences fit on a card.

`"","Guild message:",` is in the binary and not in the dump. Chapter 17's private-message path builds `Private message:` and `Mass message:` as labels. The binary knows a third label. A guild-wide letter. The dump's PM function does not have the phrase. A 2.4 client that receives a guild message is exercising a branch the readable coat does not contain. If you go looking for the function, search for that string, not for `msgPLI_PRIVATEMESSAGE`. The dump will get you to the neighborhood. The string is the door the neighborhood grew after the dump was cut.

`[%s] ** [Error] Cound not initialize serverlist socket.` is in the binary and not in the dump, misspelling and all. The dump's list connect fails in its own words. The binary has a second failure sentence, typed in a hurry. A log line with `Cound` is 2.4 speaking, not gs2emu. It is also a small sadness: the residue includes a typo, because the residue is whatever the linker could not throw away, not whatever the author would have published.

The large-file warning is in both, with a format string just different enough that a naive diff marks it missing. Do not count it. The settings scar, `settings.txt` when the file is `servers.txt`, is in both. Do not count it. The unknown-client sentence is in both. The method is only as honest as the strings you refuse. A one-character difference in a format is not a feature.

The bytecode loader is in the dump. Chapter 15 already read `BYTECODE`, type 74, `PLO_UNKNOWN197`. An empty `weapon_bytecode/` in Phoenix is not evidence that 2.4 invented the room. It is evidence the package did not furnish a room the dump already knew. The wing was built before the cut you have. The binary kept it.

---

So the rule for the residue is severe.

A string that is Boost, the CRT, zlib, bzip2, or MiniUPnP is the lining. Note the UPnP version if you care which library thread chapter 2 joined, and move on. A string that is RTTI is a class name, useful as a landmark, useless as a function. A string that is a path is a biography. A string that is a sentence the dump does not say is a candidate, and there are few candidates. Guild message. The misspelled serverlist error. After that you are in format-string noise and you should stop.

This is why chapter 12 said to prefer a difference to a tour. The difference, collected, is not a second protocol. It is a label, an error line, a path, and a type table. Everything else you will meet in Ghidra, if you open it, will be a function you have already read, with the comments gone and the logs still attached. When a function references `:: Loading servers.txt`, you are in `main`. When it references the unknown-type sentence, you are in the login. When it references `Guild message:`, you are past the dump, and that is the one to write down.

Ash cannot help you past that string. Ash was written from the dump. A guild message on Phoenix that Ash does not send is not a seam in the retelling. It is a sentence the retelling never saw. Treat it that way. Port it only if a client in your room actually speaks it.

The next room is the one unnamed function, walked until the shift and the eight raw characters are visible without their names. The login, as the binary still tells it.

---

*End of chapter 22.*
