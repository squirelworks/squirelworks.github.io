# Sprites

A sprite line needs more than five tokens. Fewer, and the line is ignored.

```
SPRITE id image x y w h description words
```

`id`, `x`, `y`, `w`, and `h` are integers. `image` is one token. Every token after `h` is joined with single spaces and kept as the description.

The writer pads the columns so a file looks aligned: the id to width 4, the image to width 15, and each number to width 4. The reader does not care. It splits on whitespace. This is the shadow from `idle.gani`:

```
SPRITE    0         SPRITES    0    0   24   12 shadow
```

That is id `0`, image `SPRITES`, rectangle `(0, 0, 24, 12)`, description `shadow`.

## Image tokens

The editor's own name table, in this order:

| Token | Usual role in the shipped files |
|---|---|
| `BODY` | Body sheet, 32×32 cells, four columns |
| `HEAD` | Head sheet |
| `SHIELD` | Shield sheet |
| `SWORD` | Sword sheet |
| `HORSE` | Horse sheet |
| `SPRITES` | Small shared pieces, including the shadow |
| `PARAM` | A picture passed in as a parameter |
| `ATTR` | A picture passed in as an attribute |

`levels/ganis` also uses `ATTR1` as an image token for hats. That is a file token, not a ninth entry in this table. Any other single token is accepted as an image name.

On a character sheet the body ids run in fours: up, left, down, right. `idle.gani` uses body `200` `201` `202` `203` for the standing pose, and head `100` through `103` in the same order.

## Attachments

An attachment is a child sprite drawn at an extra offset from a parent. Both ids must already exist. The child is stored as a pointer, not as a copy.

| Line | Flag at `+0x10` | Fields |
|---|---|---|
| `ATTACHSPRITE parent child x y` | `0` | Child pointer, then x, then y |
| `ATTACHSPRITE2 parent child x y` | `1` | Same fields, other flag |

The writer emits `ATTACHSPRITE` when the flag is `0` and `ATTACHSPRITE2` when it is `1`, after every `SPRITE` line and before the blank line that starts the header.

## Effects

Effects address a sprite by id. The writer skips a line when the value is still the default.

| Line | Default | Meaning of the numbers |
|---|---|---|
| `COLOREFFECT id r g b a` | each `1` | Four doubles. Written if any one is not `1` |
| `ZOOMEFFECT id z` | `1` | One double |
| `EFFECTMODE id n` | `0` | One integer. The file does not name the modes |
| `ROTATEEFFECT id r` | `0` | One double |
| `STRETCHXEFFECT id x` | `1` | One double |
| `STRETCHYEFFECT id y` | `1` | One double |
