# Chapter 21 — The Version Forks

The protocol is not one protocol. It is a row of clients, and the server keeps a cut for each of them.

The token is eight characters, `GNW` or `G3D` and five digits, and `versions.txt` is the diary that admits several tokens lie. A range in `allowedversions.txt` is interpreted by `getVersionID`, and the id — `CLVER_1_41`, `CLVER_2_1`, `CLVER_2_14`, `CLVER_2_21`, `CLVER_2_3`, `CLVER_2_31` — is what the branches test. Phoenix's open window is `GNW22122` through `GNW28015`, 2.1.7 through 2.3.1. That window crosses most of the cuts. Two people who both pass the allowed list are not the same client. The login shift already said so. The branches say so again, later, quietly.

---

Before 2.1, the client is a co-author of the ground.

`msgPLI_BOARDMODIFY` returns before the bush roll if `versionID < CLVER_2_1`. The comment is the policy. Older clients drop items on their own side. A server that also rolls will fill the grass twice, which is why Phoenix's options tell a 1.41 world to turn `bushitems`, `vasesdrop`, and `baddyitems` off. `WANTFILE` for that client appends `.gif` if the name arrived with no extension. The file send subtracts five bytes from the length math, because the modtime is not sent, and refuses a body over 64,000 bytes rather than splitting it. The level warp uses `sendLevel141`. The signature rule is the same 73. The ground is not.

2.1 is the cut where the server takes the drops, sends the modtime, and will tell a gmap client `PLO_PLAYERWARP2` instead of the level name. The modtime is how a client decides it already has the file. Forget the cut and every login re-downloads the grass, or a 1.41 client is handed a field it does not read and the length is wrong.

2.14 is the large-file cut. Before it, `sendFile` forces the big-file flag off and sends the body in one piece, up to the 64,000-byte refusal. From it, a body over 32,000 bytes is a start, a gint5 size, chunks, and an end. A head that works on 2.3 and fails on 2.1 is often this, not the cipher.

---

2.21 through 2.31 are the zlib years.

`sendLoginClient` builds `-gr_zlib_fix` only inside that range: name, a one-byte script that is a dash, sent as a weapon add. It is not a file. It is a correction those clients need and later clients must not be handed, or they will hold a weapon that means nothing to them. 2.31, and the 1.411 client, are the pair that will not request a map when `setmap` is used, so the welcome pushes every loaded bigmap. One bug, two versions, one workaround. A world with no bigmaps will not notice. A world that is a town will, on exactly those clients.

2.3 is the movement cut. `flaghack_movement` writes `gr.x`, `gr.y`, and `gr.z` into a side buffer of prop packets, and the comment says the weapon exists to smooth movement among pre-2.3 clients. If the version is 2.3 or newer, the flag is accepted and nothing is queued. The clock no longer needs to speak position for them. The weapon may still be in the account. The branch is what makes it idle. Z is sent as the position plus a half, plus 50, the same offset the warp uses. The old client and the new client do not share a zero for height.

2.30 is the pixel cut. `PLPROP_X2` is the tile times 16, computed when the account loads and sent instead of the half-tile X when the version is at least 2.30. A 2.3 client still gets the half-tile. A 2.31 client gets the finer one. The account file keeps the tile. The fork is only on the wire.

Generation is the cut that is not a version id. Shift 6 is generation 5, shift 5 or 4 is generation 4, anything else is generation 3. A 2.1.7 client and a 2.3.1 client do not take the same shift, which is why chapter 4 said the allowed window is not one lock. The version id and the generation are different axes. A client can be old and encrypted, or new and still on generation 3, depending on the shift byte it chose. Branches that test `versionID` will not save you from a wrong codec. Branches that test the codec will not save you from a missing modtime.

---

The RC has its own small row. A 1.1 RC treats one file-browser packet as another. A later RC is in the same dispatch as a client for some ids and not for others. The staff door was chapter 7. The fork is only worth remembering when an old RC and a new RC disagree about a click, and the disagreement is an id the 1.1 client reused.

Ash carries the version table in `protocol.py` and the login cuts it was willing to port. The zlib weapon, the bigmap push, the half-tile versus the pixel, the bush return: check each before you call a difference a bug. Phoenix runs all of them, because the binary is the file the branches live in. The allowed list does not disable a branch. It only decides who may arrive to exercise it.

Read a bug report as a version first. Then the generation. Then the branch. A file send failed on 2.1 and fine on 2.3 is 2.14 until proved otherwise. A map that never arrives on 2.31 is the `setmap` workaround. A position that stutters only on 2.1 is the movement weapon, and `flaghack_movement`, and the flag actually being set. The cuts are small. They are the reason the same town feels like different towns.

The next room is the coat that is newer than the dump. What 2.4 says that gs2emu does not.

---

*End of chapter 21.*
