# The ANI block

`ANI` sets sprite mode. `ANIEND` ends it. Lines between them are the direction frames. A blank line is ignored.

The writer emits `GANI0001` first, then sprites and attachments, then the header lines below, then effects, then an optional script, then `ANI`.

## Header lines

These lines are legal in either mode. The writer suppresses some of them.

| Line | When the writer emits it |
|---|---|
| `LOOP` | The loop byte is set |
| `CONTINUOUS` | The continuous byte is set |
| `BACKCOLOR #rrggbb` | Back color is not the unset value `0x8000`. Six hex digits |
| `SINGLEDIRECTION` | Sprite mode, and the flag is set |
| `SETBACKTO name` | The setback string is not empty. One token |
| `FRAMES n` | Movie mode only. The reader still accepts it here |
| `DEFAULTPARAMn value` | `n` is 1…9 and the slot is not empty |
| `DEFAULTATTRn value` | `n` is 1…30 and the slot is not empty |
| `DEFAULTHEAD file` | Always |
| `DEFAULTBODY file` | Always |

`BACKCOLOR` must begin with a character the reader strips, then the rest is parsed as a hex integer. The writer produces `#` and six digits.

`sword.gani` leaves the sword picture and the return animation in the header, not in the draw rows:

```
SETBACKTO idle
DEFAULTPARAM1 sword1.png
DEFAULTATTR1 hat0.png
DEFAULTHEAD head19.png
DEFAULTBODY body.png
```

## One frame

Without `SINGLEDIRECTION`, a frame is four rows. The next composition row after the fourth closes the frame. With `SINGLEDIRECTION`, each composition row is its own frame.

A row with fewer than the required number of lines at `ANIEND` is dropped.

The four rows follow the character sheet. Row 0 is up, row 1 is left, row 2 is down, row 3 is right. That is the order of body `200` `201` `202` `203` in `idle.gani`, and of body `268` through `271` on the first frame of `carry.gani`. Seihai numbers directions the other way: `0` is south. These rows do not.

`carry.gani` has 32 composition rows and no `SINGLEDIRECTION`, so it is 8 frames of 4 directions.

The standing frame of `idle.gani` is one frame:

```
ANI
   0  12  34,   10  36  16,  200   8  16,  100   8   2,   40   0 -16
   0  12  36,   11   6  16,  201  12  16,  101  12   2,   41   0 -16
   0  12  34,  202   8  16,  102   8   2,   42   0 -16,   12   8  24
   0  12  36,   13  34  16,  203   4  16,  103   4   2,   43   0 -16
ANIEND
```

## Draw commands

A row is a comma-separated list of triples. The writer pads the id to width 4 and each offset to width 3, and joins triples with a comma and a space. The reader trims.

| Triple | Kept when |
|---|---|
| `id dx dy` | `id` is an existing sprite |
| `PARAMn dx dy` | `n` is greater than 0 |
| `ATTRn dx dy` | `n` is greater than 0 |

A triple with any other shape is dropped. A row that keeps nothing is dropped. The first piece of the idle row above is sprite `0` (the shadow) at `dx=12`, `dy=34`.

## Wait and sound

`WAIT n` adds `n` to the open frame. The counter starts at `1`, before any `WAIT`. `PLAYSOUND file volume pitch` stores a `TGraalAniSound` on that frame: the file name, then volume, then pitch. `watercanspread.gani` writes `PLAYSOUND rain.wav 1.5 2`. If the line has fewer than four tokens, the editor fills volume and pitch itself instead of leaving them unread.

A `PLAYSOUND` or `WAIT` sits on the frame that is still open. In `sword.gani` the sound comes after the first four rows, so it belongs to that frame, not the next one. The following composition row is what closes the frame.

## Script

`SCRIPT` starts a block. Every following line is appended, with a newline, until a line that trims to `SCRIPTEND`. The writer emits the block only when the script string is not empty, and it emits it before `ANI` or `MOVIE`.
