# GraalLStory

## Chapter V — The Color That Is Not There

The fifth door is the smallest, and it does not write a world.

`gif2mng.exe` is one hundred and nine thousand and fifty-six bytes, a Delphi console, no form. The banner dates the build 3 June 2004. The COFF timestamp says 19 June 1992, which is the Borland stub and not the day anyone shipped this tool. Units in the RTTI are `UGif` and `UMNG`. Linked beside the RTL is zlib 1.1.2, used for IDAT inflate and deflate only. Called with no filename, it prints four lines of usage and returns. Called with a missing file, it prints `File not found!`. Arguments are scanned left to right. `-b` sets the body flag. `/b` is not special. Any other token replaces the filename, so the last non-option wins. Extension compare is case-sensitive: `.gif`, then `.mng`, then `.png`.

What it produces is one indexed image, or a sequence of them. A GIF with fewer than two frames becomes a PNG. Two or more become an MNG. A PNG or MNG is read and written back; one frame stays PNG, two or more stay MNG. The output extension replaces the last four characters of the input path. `shot.gif` becomes `shot.png`. A name that does not end in a four-character extension still loses four characters. If that path is the input path, the tool writes a temp, deletes the original, and renames. The writer never emits a truecolor image. IHDR color type is always 3, bit depth 8. Transparency is a `tRNS` entry of 0 on one palette index, not an alpha channel.

The shop from the second chapter would preview a GIF, including the Netscape `ANIMEXTS1.0` extension. This tool reads the same extension, and `NETSCAPE2.0`, and stores the loop count. Zero becomes −1, which means infinite. It does not edit a gani. It does not know what a sprite id is. It only makes the sheet the sprite line will later name.

---

A GIF, to this program, is a signature and a refusal to be curious.

The first three characters must be `GIF`. The next three, `87a` or `89a`, are not checked. The logical screen descriptor is the next seven bytes. Packed bit 7 selects a global color table, size `1 << ((packed & 7) + 1)` triples. The background index is the sixth screen byte. A block of `0x21` is an extension. Graphic control is `0xf9`: transparent flag in bit 0, index in the last payload byte, disposal in bits 2 through 4, delay a little-endian word in centiseconds. An application block whose first sub-block is eleven bytes and equals one of the two Netscape names arms the loop reader. An image separator, `0x2c`, reads a ten-byte descriptor and records a step. A local color table is seeked over. LZW sub-blocks are seeked over here and decoded later. The trailer `0x3b` ends the scan. A file that is not a GIF does not get a second opinion.

When the writer runs, each frame is rendered onto a canvas. The renderer seeks to the step's file position, skips a local table, LZW-decodes, and honors interlace. Delay, if there is more than one frame, is the centiseconds times ten, so the MNG speaks milliseconds. Then the chunks. Success prints `Conversion succeeded`. If the body flag was set, it also prints the palette sentence.

PNG, for a single frame, begins with the eight signature bytes. `IHDR` carries width, height, bit depth 8, color type 3, and zeros for compression, filter, and interlace. `PLTE` is the palette, three bytes a color. `tRNS` is written only if the transparent index is at least 0. Its length is the index plus one. The bytes are `0xff`, and `0x00` at the transparent index. On read, the first zero alpha byte becomes the transparent index. `IDAT` is zlib of filter-byte-0 scanlines, top-down. `IEND` is empty. Integers in chunks are big-endian. The CRC covers type and data.

MNG, for two or more frames, begins with its own eight signature bytes, the MNG cousins of the PNG ones. `MHDR` is twenty-eight bytes: width, height, ticks per second always 1000, a nominal layer count of frames plus one, a nominal frame count, a nominal play time that is the sum of the delays in milliseconds, and a simplicity. Simplicity is 1, or 9 if a transparent index is set. `TERM` is written only if the loop field is non-zero: termination action 3, which is repeat, delay 0, and an iteration max. Infinite writes `0x7fffffff`. Otherwise it writes the loop plus one, which is the Netscape meaning, repeats after the first play. Each extra frame gets a ten-byte `FRAM`: framing mode 3, an empty subframe name, change-interframe-delay 2, then the delay. The reader requires that change byte to be 2. Then the same `IHDR`, `PLTE`, `tRNS`, `IDAT`, `IEND` sequence as a PNG, one full indexed image per frame. `MEND` closes the file. No `BACK`, no `DEFI`, no `MOVE`, no `JNG`. The writer's MNG is a subset. A richer MNG can be read, because an unknown chunk is skipped, CRC included. It will not be written back as richly as it arrived.

A PNG has no `MHDR`. Width and height then come from the first step, if the canvas is still empty. On read, color type must be 3. Bit depth must be 4 or 8. The tool will not accept a truecolor sheet on the way in, just as it will not emit one on the way out. Graal's pictures, in this pipeline, are indexed or they are not pictures.

---

Then the flag that the body sheets already expect.

`-b` is optional, and orthogonal to the frame count. It runs before the frame is encoded. It does not change the chunk layout. It snaps the palette onto seven hardcoded slots, and it forces transparency to index 2. Those seven indices are what classic servers recolor. Index 2 is both the default green and the transparent slot.

| Index | Role | RGB |
| --- | --- | --- |
| 0 | border | `0, 0, 0` |
| 1 | belt | `0, 0, 255` |
| 2 | transparent | `0, 132, 0` |
| 3 | shoes | `206, 24, 41` |
| 4 | sleeves | `255, 0, 0` |
| 5 | skin | `255, 173, 107` |
| 6 | body | `255, 255, 255` |

The match rule is an absolute difference under 32 on each channel. A near-black border becomes index 0. A near-blue belt becomes index 1. A green within 32 of `0, 132, 0` becomes index 2, and index 2 is the hole. Otherwise the color is appended, or, if the table is full, replaced by nearest-sum. Indices above 6 stay as themselves unless they collided with a slot. The result forces a `tRNS` on index 2, and simplicity 9 when the file is an MNG.

This is the same trick as the type byte, played on a palette. The pixel proposes a color. The slot disposes. A server that recolors the body does not recolor "the green." It recolors index 2, index 4, index 5. A body sheet whose green was stored at some other index will not go transparent, and will not take the tunic. Twenty files under `levels/bodies/` are the wardrobe this flag was built to dress. The shop's `DEFAULTBODY` is `body.png`. The desk's uninstructed player wears `body.png`. Neither program runs `-b`. They assume the sheet already survived it.

A second, quieter fix runs only when a transparent index is already set. It samples four corners. If one index owns at least three corners and is not the current transparent index, and the two RGB triples are close — red under 8, green under 4, blue under 8 — it prints `Transparent color index changed from A to B` and switches the index. It does not remap pixels. A corner that was background becomes the hole by declaration. The pixels that already used that index are along for the ride. A corner that was a real color, close enough to the old hole, becomes a hole too. The tool tells you. It does not ask.

---

What this door refuses is the rest of the platform, and the refusal is the point.

It does not write `GLEVNW01`. It does not write `GRMAP001`. It does not speak the codec, and it does not open a socket. It does not know that a wall is a type byte of 20 or more. A sheet it emits can be named by a sprite line, or by a tiledef, or by `addtiledef2` painting a rectangle over the base four thousand and ninety-six. The generators named sheets — `picso.png`, a wall sheet, a ground sheet — and did not embed them. This tool is how a foreign GIF becomes a sheet those names can point at. Point the tiledef at a truecolor file and this pipeline will not have produced it. Point a gani at a PNG whose transparent index is 0, and the shadow may be a green square, because the client was taught a hole at a different slot.

The output path is a small cruelty worth remembering. Last four characters, always. A file named `body.gif` becomes `body.png`, which is what you wanted. A file named `body.GIF` does not match `.gif`, because the compare is case-sensitive, and falls through. A file named `shot.animation.gif` loses `gif` and the dot, and keeps a stem that may not be the stem you meant. The temp-and-rename path exists so a rewrite of a PNG does not read and write the same file at once. The tool is careful about the stream and careless about the name. That is in character. The platform has been careful about signatures and careless about promising that two writers mean the same thing by them.

Under `levels/` the results of this door are already filed: heads as PNG and MNG, emoticons, webgifs that are mostly PNG, a glare that is an MNG, bodies, letters. The shop will take a GIF with the Netscape extension and preview it. The client, when it is being ordinary, would rather have what this tool writes. One frame, a PNG, indexed, a `tRNS` if there is a hole. Many frames, an MNG, ticks at 1000, a `FRAM` whose change byte is 2, a `TERM` if the loop was not zero. Color type 3. Bit depth 8. Index 2 green, and not there.

The grass is still an index. The sword is still a rectangle. The desk is still a byte plus `0x20`. The generators still do not share a board. This door's whole opinion is that a picture is a palette, and that one entry in the palette is the color that is not there.

The next door was packed. The editor in the client folder is a Thinstall package, and the Delphi image is the one that paints decimal indices and does not require the first line.
