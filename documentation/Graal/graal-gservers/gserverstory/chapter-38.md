# Chapter 38 — The Other Window

The RC has a window the gserver's catalog does not list, because the window belongs to the process.

NPC-Control is the class list, the database NPC list, and the weapon list. Classes are added by name and saved on the NPC-Server, then brought into a level NPC or a `putnpc2` NPC with a join. Weapons are added by name, the script saved into NC, and the name added to a player's attributes, which is the staff side of the `WEAPON` line. A database NPC is an NPC the process keeps rather than a level file. View attributes, edit script, edit the `this.` flags, update the level it stands in. Update level is the same verb as the chair's `/updatelevel`, pointed at one body.

A dump of one of them is the prop list from chapter 30, plus the process's own clocks. Image, script size, visibility, id, head, precise x and y, timeout. Then `scripttime` in the last minute, and `scriptcalls`. The example spent three thousandths of a second across sixty calls. The process is willing to tell you how expensive a script was. The gserver's five-minute drum has no such number. Lag from an NPC is this window, not `serverlog.txt`.

The queries chapter 31 catalogued are how this window's buttons become packets. Add a weapon, delete a weapon, set a flag, set props, warp an NPC that is not a level NPC, send a level. The window is the process's chair. `rchelp.txt` is the gserver's chair. A command in one and not the other is not a missing handler. It is a different program. Ash relays the queries it implemented and does not draw this window. Phoenix will accept the process, and the window arrives with the process, not with `gserver2.exe`.

This is the last room. Part 5 named the script side of doors the earlier parts opened: three kinds of script, the dash the client reads and the server does not, the origin as an address, and the window that belongs to the process. The server still builds the string. The client, or this process, is who wakes on the event. The next packet is still the client's.

---

*End of chapter 38.*

*End of Part 5.*

*End of GServerStory.*
