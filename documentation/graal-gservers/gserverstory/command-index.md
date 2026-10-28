# Tentative command index

Three sources, none of them a client we opened. `commands.rtf` is the classic GS1 surface. Shakaraja's 2008 guide is that surface taught, plus the verbs the thread added. The Graal Bible's [Script Functions: NPC Server](https://graalonline.net/Creation/Dev/Script_Functions:_NPC_Server) and [GS1 To GS2](https://graalonline.net/index.php?title=Creation/Dev/GS1_To_GS2) are the later lists, and the migration page is the only one that says which side a verb lives on. A name in two of these is firmer than a name in one. Kingdom and mud verbs are Bible-only and marked as Kingdoms. They are not this shelf.

## Where a verb runs

The Bible's own split, from the migration notes:

- Client only: `play`, `hurt`, `addtiledef`, `addtiledef2`, `showtext`, `showani`, `showpoly`. It says `showimg` and `changeimgcolors` did make it to the process.
- Process only: `setlevel2`, `putnpc2`.
- Either, if the half you put it in is the half that has it. A call on the wrong side is a missing function, and `scriptlogmissingfunctions` is how the process complains.

`//#CLIENTSIDE` is still the cut. There is no `//#SERVERSIDE`.

## Shared, and already a packet

These are in the RTF and on the Bible's NPC or player object. The gserver chapter is the packet the verb becomes if the process is the one speaking.

| Verb | RTF | Bible | Becomes |
|---|---|---|---|
| `say` / `say2` | sign index, or text | `say(int)`, `say2(str)` | `PLO_SAY2`, newlines as `#b` |
| `toweapons` | adds this NPC to the weapon list | `toweapons(str)` | a `WEAPON` line, `PLO_NPCWEAPONADD` |
| `triggeraction` | x, y, action, params | `triggeraction` | `PLI_TRIGGERACTION`; a weapon passes `0, 0` |
| `hitplayer` / `hitnpc` | index, halfhearts, fromx, fromy | `hitobjects` on the process | the hurt letter, power and a direction |
| `setimg` / `setimgpart` | filename, or a rectangle | `setimg`, `setimgpart` | `NPCPROP_IMAGE` |
| `hide` / `show` / `dontblock` / `blockagain` | visibility and blocking | same names on `TServerNPC` | vis and block flags |
| `drawoverplayer` / `drawunderplayer` / `drawaslight` | layers 2, 0, 3 | same, plus the RTF's `drawovertrees` as layer 1 | draw flags |
| `setshape` / `setshape2` | rectangle, or a tile mask | same, and `setshape2` needs its semicolon in GS2 | the touch shape |
| `move` | dx, dy, time, options | `move(float, float, float, int)` | `NCI_NPCMOVE`; options are cache 0–2, block 4, event 8, dir 16 |
| `destroy` | deletes the NPC | `destroy()` | `PLO_NPCDEL` |
| `setlevel2` | warp to a level and a tile | process only | `warp` |
| `setsword` / `setshield` / `sethead` / `setani` | image and a power | same on the player object | the matching prop, sword power plus 20, shield plus 10 |
| `showimg` / `hideimg` / `changeimgcolors` / `changeimgzoom` | index, file, place | on both sides, per the migration note | a local image; index under 200 is the hole others can see |
| `timeout` / `settimer` / `timershow` | arm the clock | `timeout`, `settimer`, `timershow` | no packet; the engine wakes `onTimeout` |
| `join` / `leave` | not in the classic RTF | `TGraalVar` | a class on the process, chapter 35 |

## In the RTF, thin or absent on the process list

The client drawing and hearing language. The Bible names several of these as client-only.

`play`, `playlooped`. `hurt`. `lay`, `lay2`, `take`, `take2`. `shootarrow`, `shootfireball`, `shootfireblast`, `shootnuke`, `shootball`. `putnpc` with a script filename (the process spelling is `putnpc2`). `setlevel` and `seturllevel`. `followplayer`, `carryobject`, `throwcarry`, `takehorse`. `hidelocal`, `showlocal`, `dontblocklocal`. `timereverywhere`, the verb for a client clock that should not stall on leaving the level. `sleep`. `tokenize`, `tokenize2`. `setcharprop`, `setcharani`, `showcharacter`. `freezeplayer` is in the old weapons; the Bible spells the process form `freezeplayer2`.

## In the 2008 guide, and the Bible later lists them

`showtext`, `showtext2`, `showimg2`. `addtiledef`, `addtiledef2`. `changeimgmode` 0, 1, 2. `disablepause`, `enablepause`, `disablemap`, `enablemap`, `enablefeatures`. `setbow` and the `#7` bow code, which the classic RTF does not have. Mouse flags (`leftmousebutton`, `actionleftmouse`, `actiondoublemouse`) are the thread's addendum. The Bible's client page has the show verbs. It does not, in the pages read here, list the mouse flags. Those stay forum-only until a client table confirms them.

## Process only, not in the classic RTF

`sendpm`, `sendrpgmessage`, `sendtorc`, `sendtonc`. Those are chapter 31's queries, spelled as verbs: a private message, the RPG window for 2.1 and newer, a line in the RC chat. `addweapon`, `removeweapon`, `addguildmember`, `removeguildmember`. `findplayer`, `findnpc`, `findlevel`. `triggerclient`. `setpm`. `scheduleevent`, `catchevent`, `cancelevents`. Kingdom verbs and every `mud*` verb are the Bible's Kingdoms list, not Graal Online's gserver.

## Lookup tables that match the source

Items, from the RTF, and the drops in chapter 16 and chapter 25: greenrupee 0, bluerupee 1, redrupee 2, bombs 3, darts 4, heart 5, then glove, bow, bomb, shield, sword, fullheart, superbomb, and goldrupee 19. The baddy roll stops at heart. The death pile knows the later indexes too.

Baddy modes: 0 walking, 1 looking, 2 hunting, 3 hurt, 4 bumped, 5 dying, 6 shooting for the swamp soldier, 7 jumping for the frog, 8 shooting for the spider, 9 dead. `octopus` is the compatibility name for the spider. Type 4's two-second workaround is mode 6. Dead is the mode the respawn timeout waits on.

Message codes the server already special-cases: `#b` is the line break `say2` wants, `#K(` is the sign escape, `#a` account, `#n` nick, `#g` guild, `#c` chat, `#v` a number, `#s` a string, `#L` the level, `#t` a token. `#p` is the action parameter, which is `params` on the other side of `triggeraction`.

Compass: 0 up, 1 left, 2 down, 3 right. The RTF notes that `vecx` and `vecy` were labeled backwards in an older paste. On this compass `vecx` is the horizontal step and `vecy` the vertical.

## Caps, said twice

The guide says about 13 KB for an NPC script and about 64 KB for a file that must be downloaded. The gserver warns at 12255 bytes, which is the same script cap counted on the wire, and refuses a body over 64000 bytes before version 2.14. Shakaraja says `timeout` below 0.05 freezes. The movement weapon sits on 0.05. The Bible calls 0.1 the process floor and a bad habit.

## What this index is not

It is not the 161-name table inside a client, and not a proof that Phoenix runs every Bible verb. A name in the RTF and the Bible is a verb the language agreed on. A name only in the guide is a 2008 claim. A name only in the Kingdoms list is a different game. The gserver still does not step any of them. It stores the string, splits on the marker, and forwards the trigger.
