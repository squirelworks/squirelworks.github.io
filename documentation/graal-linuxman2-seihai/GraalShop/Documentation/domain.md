# What the editor stores

One `TGraalAni` is the open document. The form edits that object. It does not keep a second copy of the file text.

## TGraalAni

| Offset | Field | Written as |
|---|---|---|
| `+0x04` | Animation name | Compared with `idle` and `walk` when entering movie mode. Not a file line by itself |
| `+0x10` | Path | The save target. Cleared when movie mode renames `idle` or `walk` to `new` |
| `+0x14` | Sprite list | `SPRITE` lines |
| `+0x18` | Direction frames | `ANI`, sprite mode only |
| `+0x1c` | Actors | `MOVIE`, movie mode only |
| `+0x20` | Mode | `0` sprite, `1` movie |
| `+0x24` | Frame count | `FRAMES`, written only in movie mode |
| `+0x28` | Loop | The line `LOOP` |
| `+0x29` | Continuous | The line `CONTINUOUS` |
| `+0x2c` | Back color | `BACKCOLOR #` and six hex digits. `0x8000` means unset, and is not written |
| `+0x30` | Single direction | `SINGLEDIRECTION`, sprite mode only |
| `+0x34` | Setback | `SETBACKTO` and one token |
| `+0x38` | Script | Between `SCRIPT` and `SCRIPTEND` |
| `+0x3c` | Nine strings | `DEFAULTPARAM1` … `DEFAULTPARAM9` |
| `+0x60` | Thirty strings | `DEFAULTATTR1` … `DEFAULTATTR30` |
| `+0xd8` | Default head | `DEFAULTHEAD` |
| `+0xdc` | Default body | `DEFAULTBODY` |

The writer always emits `DEFAULTHEAD` and `DEFAULTBODY`, even when the strings are empty. It emits a `DEFAULTPARAM` or `DEFAULTATTR` line only when that slot is not empty. The reader accepts param indexes 1 through 9 and attr indexes 1 through 30. An index outside that range is ignored.

## TGraalAniSprite

One sprite definition. The id is the number other lines use. The image is one token: a built-in name, or a file name such as `tutorial_arrowdown.png`. `x`, `y`, `w`, `h` are the rectangle inside that image. The description is the rest of the line.

Four color doubles start at `+0x1c`, `+0x24`, `+0x2c`, and `+0x34`. Zoom is the double at `+0x3c`. Effect mode is the integer at `+0x44`. Rotation is the double at `+0x48`. Stretch X and stretch Y are the doubles at `+0x50` and `+0x58`. A new sprite sets the four colors, the zoom, and both stretches to `1`, and sets rotation and effect mode to `0`.

Attachments live on the list at `+0x68`.

## TGraalAniStep

One sprite-mode frame. It holds one row per direction: four rows, or one row when `SINGLEDIRECTION` is set. The wait counter at `+0x10` starts at `1`. Each `WAIT` adds to it. `PLAYSOUND` lines are kept as text at `+0x14` and turned into `TGraalAniSound` objects when the frame closes.

A draw command on a row is a sprite pointer, or a `PARAM` index, or an `ATTR` index, plus `dx` and `dy`.

## TGraalActor

One movie actor. The kind is an integer at `+0x10`: `0` `CHAR`, `1` `SPRITE`, `2` `SOUND`, `3` `TEXT`. The name is the string at `+0x08`. Keyframes are `TGraalActorMod` objects on the list at `+0x0c`. Each mod stores a frame number at `+0x04` and a list of `key=value` strings at `+0x08`.

Two mods that share a frame number are folded: the later keys are copied onto the earlier mod, and the duplicate is freed.

## TEditFrame

The form. Sprite mode and movie mode show different controls, but they edit the same `TGraalAni`. The attribute grid has 30 rows. Undo walks a list of edit operations on the form; it does not parse the file again.
