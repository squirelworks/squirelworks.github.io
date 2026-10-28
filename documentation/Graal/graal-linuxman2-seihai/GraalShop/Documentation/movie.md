# The MOVIE block

`MOVIE` sets movie mode. `MOVIEEND` ends it. The only movie file shipped with this client is `tutorial_touch.gani`. It starts with `GANI0002`, sets `FRAMES 40`, and loops.

```
MOVIE
  ACTOR SPRITE Sprite1
    FRAME 0 dx=16,dy=-29,layer=3,sprite #=20,visible=true
    FRAME 20 dx=16,dy=-24
    FRAME 40 dx=16,dy=-29
  ACTOREND
MOVIEEND
```

## Actors

`ACTOR kind name` opens an actor. The kind must be one of the four names in the editor's table. Anything else is ignored. `ACTOREND` closes the actor. The writer prints the kind, a space, and the name.

| Index | Kind | What the keyframes describe |
|---|---|---|
| `0` | `CHAR` | A character: look, head, body, weapon, horse, chat |
| `1` | `SPRITE` | One sprite id, plus position |
| `2` | `SOUND` | A file name, plus position |
| `3` | `TEXT` | A string, a font, and how it is drawn |

`tutorial_touch.gani` uses `SPRITE` and `TEXT`. The form's "Add Character Actor" inserts a `CHAR`.

## FRAME

`FRAME n` then a comma-separated list of `key=value` pairs. The reader splits on commas and trims. The writer joins with a comma and no space. Both load.

`n` is the frame index. Later keyframes in `tutorial_touch.gani` store only the keys that differ (`dx` and `dy`). Two mods with the same `n` are merged before display.

Keys the form knows, by kind, follow. A key that was never set is absent from the line.

## Shared keys

`name`, `visible` (`true` or `false`), `dx`, `dy`, and `layer` are the shared keys. `visible`, `dx`, `dy`, and `layer` are how a `CHAR` and a `TEXT` move. A `SPRITE` uses them too, and adds `sprite #`. An empty sprite id is written as `-`.

## Character

A `CHAR` always has `playerlook`. When that flag is false the form also edits `head`, `body`, `attr1`, `attr2`, `attr3`, `param1`, `param2`, `param3`, `sword`, `shield`, and `horse`. When `playerlook` is true those picture fields are left off the grid: the actor uses the player's look.

It also has `ani`, `dir`, and `chat`.

`color0` through `color4` take a name from this table. The spelling `cynober` is the editor's.

| Index | Name | Index | Name |
|---|---|---|---|
| 0 | `white` | 10 | `blue` |
| 1 | `yellow` | 11 | `darkblue` |
| 2 | `orange` | 12 | `brown` |
| 3 | `pink` | 13 | `cynober` |
| 4 | `red` | 14 | `purple` |
| 5 | `darkred` | 15 | `darkpurple` |
| 6 | `lightgreen` | 16 | `lightgray` |
| 7 | `green` | 17 | `gray` |
| 8 | `darkgreen` | 18 | `black` |
| 9 | `lightblue` | 19 | `transparent` |

## Text

A `TEXT` actor adds `text`, `font`, `color` (six hex digits, no `#`), `zoom`, `fontsize`, and the flags `bold`, `italic`, `centered`, `rightaligned`, `underline`, `strikeout`, `wordwrap`, `shaded`. Flags are `true` or `false`.

The second actor in `tutorial_touch.gani` is the sentence under the arrow:

```
ACTOR TEXT Text1
  FRAME 0 bold=false,centered=true,color=FFE080,dx=35,dy=-36,font=Tempus Sans ITC,fontsize=14,italic=false,layer=3,rightaligned=false,shaded=true,strikeout=false,text=Touch to get information,underline=false,visible=true,wordwrap=true,zoom=1
```

## Sound and sprite actors

A `SOUND` actor's own key is `file`. A `SPRITE` actor's own key is `sprite #`, the id of a sprite defined above the `MOVIE` block. In the tutorial that id is `20`, the arrow cut from `tutorial_arrowdown.png`.
