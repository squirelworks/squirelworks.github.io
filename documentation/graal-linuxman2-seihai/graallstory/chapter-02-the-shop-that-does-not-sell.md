# GraalLStory

## Chapter II — The Shop That Does Not Sell

The second door has the wrong name on it.

`GraalShop.exe` sits in the client folder beside the three Graal builds, six hundred and forty-three thousand and seventy-two bytes, with an older sibling named `GraalShop_old.exe` a little smaller. A person who has only the filename will open it looking for a counter: swords, hats, the price of a horse. The program has no counter. The name is a Photoshop pun. It edits pictures, and it edits the text that tells a picture how to stand, turn, and wait. The thing it writes is a `.gani`. The thing a player later wears is that file, borrowed by a body that already knows how to walk.

The board from the first chapter does not move. It stores an id, and a type byte judges the id. A figure on that board is a different problem. An NPC line can name an image, or a hyphen if it has none. A living figure needs more than an image. It needs a table of rectangles, a row for each direction, a sound that belongs to a frame and not to the next one, and a script the editor will copy and will not run. That table is what the shop keeps.

---

Open it and you are not in a store. You are in a Delphi form.

The image is a Borland GUI binary: the RTL key, `ctl3d32.dll`, a string grid, an open dialog, speed buttons, a rich edit, the exception frames Delphi leaves in the stack. Startup is the ordinary liturgy. The runtime initializes, including a custom memory manager. The application creates two forms. One of them, the second, has no recovered click handlers in the dump; do not invent a menu for it. The live editor is the other, `TEditFrame`, the object the dump calls `DAT_0048c610`. One document sits behind the form. The class is `TGraalAni`. The form does not keep a second copy of the file text. Undo walks a list of edit operations. It does not parse the file again.

Preview is DirectDraw 7: `IDirectDraw7`, a surface, and DirectSound beside it. The canvas is a `TDXDraw7` at a fixed offset on the form. Zoom is a global scale, clamped from 1.0 to 16.0. Sheets may be GIF, including the Netscape `ANIMEXTS1.0` extension, or MNG, or an ordinary bitmap. PNG appears as a suffix and as a zlib error in the linked decompressor, which is a way of saying the era had not finished agreeing what a picture was. The same GANI classes are linked into the level editor, so a placed object can be previewed without a shop session. The shop is not the only door into the format. It is the door with the buttons.

Sprite mode and movie mode show different controls. They edit the same object. The attribute grid has thirty rows. An open button, a movie button, a delete-key, two checkboxes, two paint boxes, a scrollbar. The path to the Graal folder is resolved with `FILENAMECACHE.txt`, which is a cache, not a catalog you should edit by hand.

---

A GANI file is line-oriented text, like a level, and it begins with a discriminator, like a level. The first line chooses the dialect.

`GANI0001` is sprite mode. The flag on the document is 0. The body is a sprite table, a header, then `ANI` until `ANIEND`. This is the classic player and NPC animation: a shadow, a body, a head, a sword, four ways of facing.

`GANI0002` is movie mode. The flag is 1. The body is a sprite table, a header, then `MOVIE` until `MOVIEEND`, and inside that, actors. Switching modes deletes the other kind of timeline. Both switches ask first, in a message box. Entering movie mode also looks at the animation name. If it is `idle` or `walk`, the path is cleared and the name becomes `new`, so a standing loop is not quietly overwritten by a cut scene.

The parser lowercases each line before it compares keywords, so `Ani` and `ANI` both match. The writer does not return the favor. It emits uppercase keywords and space-padded columns. Files that omit the signature are accepted as the sprite dialect. Client samples under `levels/ganis/` and `levels/bomys/` match that dialect, including files that never say `GANI0001`. Ninety-three files in the gani folder, eighty-six of them `.gani`, are the wardrobe. The board points. The shop describes the pointing.

---

A sprite line is a rectangle with a name.

```
SPRITE    0         SPRITES    0    0   24   12 shadow
SPRITE  200            HEAD    0    0   32   32 head up
SPRITE   20           SWORD   62    0   28   28 sword sw ->down
```

The writer pads the id to four, the sheet name to fourteen, then x, y, width, and height to four, and leaves the description as the rest of the line. The parser wants five integers — id, x, y, width, height — and stores the remainder as the description. The sheet is the second token. Known aliases include `SPRITES`, `HEAD`, `BODY`, `SHIELD`, `SWORD`, `HORSE`, `PARAM1`, `ATTR1`. A token may also be a file, `tutorial_arrowdown.png`, resolved against the client tree. The shop does not edit the level. It only needs the level's neighbors as paths to sheets and sounds.

Sprite 0, in `def.gani`, is the shadow: twenty-four by twelve, taken from the top of `SPRITES`. Sprites 10 through 13 are the shield, one facing each. Sprites 20 and after are the sword, not four ways but a fan of cuts, each rectangle annotated with where the blade is going. Sprites 40 through 43 are the hat, and the sheet they name is `ATTR1`, which is not a file until a default attribute fills it. Sprite 200 is the head, facing up. The id is the only name the later lines are allowed to use. The description is for the person at the grid.

An attachment is a second kind of sprite line. `ATTACHSPRITE` and `ATTACHSPRITE2` each take four integers: id, parent, dx, dy. Both are accepted. The writer emits whichever list the sprite owns. A new sprite starts its color doubles, its zoom, and both stretches at 1, and its rotation and effect mode at 0. Effects — color, zoom, rotate, stretch X, stretch Y, effect mode — carry an id and arguments onto those slots. The rectangle is the picture. The doubles are how the picture is allowed to lie.

---

Then the header, which is the costume the frames assume.

`DEFAULTHEAD` defaults to `head19.png`. `DEFAULTBODY` defaults to `body.png`. The writer emits both even when the strings are empty. `BACKCOLOR` is unset when the value is the sentinel `0x8000`, and unset is not written; otherwise it is a hash and six hex digits. `LOOP` and `CONTINUOUS` are flags, off until set. `SINGLEDIRECTION` is sprite mode only. `SETBACKTO` is one token, the animation to return to. `sword.gani` leaves the sword picture and the return in the header, not in the draw rows: `SETBACKTO idle`, a default param for `sword1.png`, a default attr for `hat0.png`, the head, the body.

Params are nine strings, indexes 1 through 9. Attrs are thirty, 1 through 30, which is why the grid has thirty rows. An index outside the range is ignored. A param or an attr is how a frame can say "the hat" without naming the file. The file arrives later, as a default, or as a value the game sets on the figure. That is the same trick as the board. The draw row stores an id. Something else decides what the id means.

`FRAMES` is written only in movie mode, as the duration sum. The reader still accepts it in a sprite file. `SCRIPT` until `SCRIPTEND` is copied through as text into the rich edit, and emitted before the body if the string is not empty. The editor does not execute it. There is no compiler for that block in the dump. A script in a gani is a letter sealed in the envelope. The client, later, may open it. The shop will not.

---

Sprite mode is the `ANI` block, and it is where the four directions live.

A frame is not one picture. Without `SINGLEDIRECTION`, a frame is four rows. The next composition row after the fourth closes the frame. With `SINGLEDIRECTION`, each row is its own frame. A row that never reaches the required count by `ANIEND` is dropped. A blank line is ignored.

The four rows follow the character sheet, and they do not follow every other numbering in the family. Row 0 is up. Row 1 is left. Row 2 is down. Row 3 is right. That is the order of body `200`, `201`, `202`, `203` in `idle.gani`, and of body `268` through `271` on the first frame of `carry.gani`. Seihai numbers the other way: 0 is south. These rows do not. A person who ports a direction and trusts the other zero will face the figure at the ceiling.

The standing frame of `idle.gani` is one frame, four lines, each a comma-separated list of triples:

```
ANI
   0  12  34,   10  36  16,  200   8  16,  100   8   2,   40   0 -16
   0  12  36,   11   6  16,  201  12  16,  101  12   2,   41   0 -16
   0  12  34,  202   8  16,  102   8   2,   42   0 -16,   12   8  24
   0  12  36,   13  34  16,  203   4  16,  103   4   2,   43   0 -16
ANIEND
```

Read the first triple of the first row and you have the whole grammar. Sprite 0, the shadow, at dx 12, dy 34. Then the shield, sprite 10, facing up. Then the body, sprite 200. Then the head, sprite 100. Then the hat, sprite 40, pulled from `ATTR1`, at a negative dy so it sits above the head. The second row is left. The third is down, and the shield has moved to the end of the line, sprite 12, because a shield in front of a body is not the same draw order as a shield behind it. The writer pads the id to width 4 and each offset to width 3, and joins triples with a comma and a space. The reader trims.

A triple is kept when the id is an existing sprite, or when it is `PARAMn` or `ATTRn` with n greater than 0. Any other shape is dropped. A row that keeps nothing is dropped. `carry.gani` has thirty-two composition rows and no `SINGLEDIRECTION`, so it is eight frames of four directions. `bomy_idle.gani` is ruder and clearer: four lines, shadow at (12, 34), head sprites 200 through 203 at (0, −2), and nothing else. One frame. Four facings. A bomb that knows which way it is looking.

Wait and sound sit on the frame that is still open. The wait counter starts at 1, before any `WAIT`. Each `WAIT n` adds n to it. `PLAYSOUND` keeps a file name, a volume, and a pitch; `watercanspread.gani` writes `PLAYSOUND rain.wav 1.5 2`. If the line has fewer than four tokens, the editor fills volume and pitch itself rather than leave them unread. In `sword.gani` the sound comes after the first four rows, so it belongs to that frame, not the next one. The following composition row is what closes the frame. A step with no placements is freed rather than stored. After the load, a walk of the step list writes each step's start time, and the sum, onto the document.

That is a walk cycle. Not a video. A list of ids, offsets, and a count of how long to hold them, drawn against a sheet the board already knew how to index.

---

Movie mode is the other body, and it does not share the timeline.

```
MOVIE
  ACTOR  name
    FRAME  index, token, token, ...
  ACTOREND
MOVIEEND
```

Entering `MOVIE` sets the movie flag and clears the current actor. `FRAME` requires an open actor and at least two tokens. The first token is the frame index. The rest, split on commas, are stored on a mod. Two mods that share a frame number are folded: the later keys are copied onto the earlier mod, and the duplicate is freed. The writer indents with two spaces for `ACTOR` and four for `FRAME`, and emits `FRAMES` with the duration in the header.

An actor has a kind, an integer, and a name. Kind 0 is `CHAR`. Kind 1 is `SPRITE`. Kind 2 is `SOUND`. Kind 3 is `TEXT`. Keyframes are mods: a frame number, and a list of `key=value` strings. A movie is not four rows of a body. It is a cast, and each member of the cast owns a list of moments. Sprite mode is a figure turning in place. Movie mode is a stage.

Switching into movie mode deletes every actor before the new stage is built. Switching into sprite mode deletes every sprite timeline. The message box is the only courtesy. There is no merged file. A document is one dialect at a time, the way a level from the editor is not a level from the client, even when both are willing to be called a board.

---

What the shop refuses is as useful as what it writes.

It does not edit `.nw` or `.graal`. Those files can sit beside a gani in the client tree; the shop resolves them only as paths to a sheet or a sound. It does not compile the script block. It does not decide that a tile is a wall. It does not speak the remote-control codec. A figure it builds still has to be named by an NPC, or worn by a player, on a sixty-four by sixty-four array whose first line is a different signature.

And it does not promise that the file you open is the file it would have written. The parser is generous: missing signature, mixed case, a trailing description, a `FRAMES` line in a sprite file. The writer is strict: uppercase, padded columns, defaults always emitted, movie duration in the header, one dialect in the body. Round-trip a client file through the shop and the bytes will move even when the rectangles have not. That is the same manners as the first chapter. A signature is a doorplate. `GANI0001` says sprite mode to this editor. It does not say the file was saved by this editor.

Under `levels/ganis/` the wardrobe waits with its padding intact. `def.gani` is three hundred and sixty-eight lines of rectangles before it is a person: shadow, sweat, shield, a sword in too many angles, a hat that is still an attribute, a horse. `dead.gani`, `grab.gani`, `fishing.gani`, `haton.gani`, `hatoff.gani`. The player presses a key. The client looks up the gani the weapon or the body named. A step is selected. Four rows, or one. Each triple is an id, a dx, a dy. The id is a rectangle on a sheet. The sheet is blitted. The wait counter holds. The sound plays at the volume and the pitch that belonged to that frame.

The shop never sold the sword. It named the rectangle the sword is cut from, and the row that faces down, and the animation to return to when the cut is over.

The next door is not a picture. It is the desk with two sockets, where a person who is not standing on a tile reaches into the same quilt.
