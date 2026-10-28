# Chapter 35 — Three Scripts

The Bible counts three, and the gserver only stores two of them.

A level NPC is a scripted object in a file. The mysterious old man, the light you click. It is the `NPC` block chapter 5 loaded and chapter 30 split, image and position and a string of section signs. It lives where it was placed. Leave the level and you leave it, unless a process is holding the server half and the half does not care that you left.

A weapon is an NPC that does not live in a level. The NPC scripting page says it is carried with the client, and that weapons are mainly clientside. A sword, a GUI, a modified player list, a clock. It is in the account as a `WEAPON` line and in `weapons/` as a `GRAWP001` file, and it follows the person across every warp. That is why the movement weapon can arm itself again on `playerenters`. It came with you. A level NPC did not.

A class is a script other scripts include. The page's reason is uniformity: a machine works the same way in every level, because the behavior is not copied into each level file where someone can edit one of them. `join` pulls a class into the running object. `leave` drops it. `joinedclasses` is the list, read-only, on the script object the Bible calls `TGraalVar`. NPC-Control has a class list, saved on the NPC-Server, and chapter 8 watched the gserver push classes to the process at login and accept `NCI_WEAPONADD` shaped updates. The gserver does not join. The process does, when a script says to. A shop that behaves the same in two towns is a class. A shop pasted into two level files is two scripts that will drift.

The movement weapon joins nothing. It is the second kind, entire, and the marker at the top makes even its server half empty. A world that wants the first kind puts an NPC in a level. A world that wants the third kind puts a class on the process and a `join` in the scripts that need it. The file formats on this shelf are the first two. The third is a name the process keeps, and an empty `npcprops/` is not where it lives.

---

*End of chapter 35.*
