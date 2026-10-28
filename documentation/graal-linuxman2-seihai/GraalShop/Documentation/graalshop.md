# GraalShop

Graal Shop is the animation editor. The window title is `Graal Shop - The Graal Animation Editor`. It is not a store. It reads and writes `.gani` files. A modified document adds ` (modified)` to the title.

These notes describe `GraalShop.exe`, from the Ghidra listing and from the `.gani` files shipped beside the client. They are not a second implementation.

| Document | What it covers |
|---|---|
| [What the editor stores](domain.md) | `TGraalAni` and the lists it owns |
| [Sprites](sprites.md) | `SPRITE`, attachments, and effects |
| [The ANI block](animation.md) | `GANI0001`, four directions, wait, and sound |
| [The MOVIE block](movie.md) | `GANI0002` and the four actor kinds |

## Two modes

A document is in one mode, the byte at `TGraalAni+0x20`.

| Mode | Byte | First line the writer emits | Body |
|---|---|---|---|
| Sprite | `0` | `GANI0001` | `ANI` … `ANIEND` |
| Movie | `1` | `GANI0002` | `MOVIE` … `MOVIEEND` |

The reader does not look at that first line. Mode flips when it sees `ANI` or `MOVIE`. A line it does not recognise is ignored. Most files under `levels/ganis` start at `SPRITE` and still open.

Switching modes deletes the other timeline. Sprite mode asks, then frees every actor: "Switching to sprite mode will remove all actors. Continue?" Movie mode asks, then frees every direction frame: "Switching to movie mode will remove all sprites. Continue?"

If the animation name at `+0x04` is `idle` or `walk`, movie mode renames it to `new` and clears the path at `+0x10`. Otherwise it sets `FRAMES` to 100.

## The window

`TEditFrame` is the form. The live one sits at `DAT_0048c610`.

In sprite mode the label reads `Direction:` and the toggle reads `-> Movie Mode`. In movie mode the label reads `Edit attributes:` and the toggle reads `-> Sprite Mode`. The form also labels `Single dir`, `Back. color`, `Sprite #`, `Sprite index:`, and `Def. attr1`, `Def. attr2`, `Def. attr3`.

Open and save use `*.gani`. The form can start a new animation, save it, add and update sprites, drop unused sprite definitions, and import sprites from another Graal animation. It can add, delete, copy, and insert animation frames, including insert before or after the current frame. In movie mode it can add a character actor, and delete, copy, or insert an actor.

## What a load keeps

A load that finishes in sprite mode with an empty direction list is thrown away. Anything else is kept.
