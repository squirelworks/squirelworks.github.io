# Chapter 18 — The Queue

A packet is not sent when you call `sendPacket`. It is put in a line, and the line has opinions about order.

`TPlayer::sendPacket` appends a newline if the packet forgot one, and hands the buffer to `fileQueue.addPacket`. The name is a leftover. The queue is every outbound packet, not only files. `addPacket` walks the buffer. An id below `0x20` stops the walk, because a byte that small is not a packet id in this dialect and is more likely a length that escaped. `PLO_RAWDATA`, packet 100, is not a packet by itself. It is a promise that the next blob is `size` bytes, the size read as a gint, and the blob must travel with the promise. If that blob's own first byte is `PLO_BOARDPACKET`, the pair goes in the normal buffer. Anything else raw goes in the file buffer. Large-file start, size, and end go in the file buffer too. Everything ordinary, including chat and props and the board when it was not marked raw, goes in the normal buffer.

Two lines. The normal line may be coalesced. The file line must stay in order, because a large file is a start, a size, a sequence of chunks, and an end, and a chunk that overtakes its start is a file the client cannot assemble.

---

The flush is a budget, not a timer.

`sendCompress` runs when the socket is writable, from the same select that chapter 2 watched. If the front of the normal line is already over `0xF000`, sixty kilobytes, it is taken alone and the rest wait. A huge packet is sent as a hope. The comment says everything else should skip because this may throw the frame way over the limit.

If nothing was taken, and `bytesSentWithoutFile` is over `0x7FFF`, thirty-two kilobytes, and the file line is not empty, a file packet is forced. The counter exists so a noisy room cannot starve a download. Chat is not allowed to talk forever while a head sits in the other line.

Then the normal line is drained until the gathering reaches `0xC000`, forty-eight kilobytes, or the next packet would push the gathering over sixty. The counter grows by what was taken. If the gathering is still under `0x4000`, sixteen kilobytes, one file packet may be added, unless it would cross sixty. If the file line is empty, the counter is reset. An empty gathering returns. There is nothing to say.

The numbers are the whole policy. Forty-eight is the target. Sixty is the ceiling. Thirty-two without a file is the guilt. Sixteen is the spare room where a file may ride along. A client that stutters while someone is downloading is often this function being polite. A client that never receives the file is often this function never being called, which is a socket that stopped being writable, not a missing packet.

---

Then the generation dresses what was gathered.

Generation 3 zlib-compresses the gathering, refuses it if the result is over 65533 bytes, and writes a raw short length and the compressed bytes. Generation 4 bzip2-compresses, sets the codec limit from the bzip2 type, encrypts, and writes the same naked length. The printf if someone asks for generation 1 or 2 is the same refusal chapter 4's login gave: those generations are not supported. Generation 5 chooses. Over eight kilobytes, bzip2. Over fifty-five bytes, zlib. Otherwise the gathering goes raw. The type byte is prepended, the codec limit is set from that type, the gathering is encrypted, and the frame is a raw short of length plus one, the type, and the bytes. The plus one is the type byte, counted in the length, which is why a decoder that strips the short and then forgets to read the type will decrypt the type as payload and get nothing it recognizes.

The three-megabyte warning is not in this file. It is in `sendFile`, chapter 7, before the chunks are queued. A file over 3145728 bytes is sent anyway, with a log line that large files are the cause of many bug reports. The queue will then try to be kind to it: raw chunks in the file line, forced through after thirty-two kilobytes of ordinary traffic, never reordered. Kindness is not a guarantee the client can hold the result. The warning is the author admitting that.

A generation 3 frame that compresses past 65533 is tossed, with an error printed, and the gathering is gone. Not put back. A too-large compressed board is a board the client will not see, and the server has already popped it. This is the sharp edge of the queue. The pop happens before the compress. A failure after the pop is a loss.

---

Ash frames in `protocol.py` with the same three generations and the same size picks, eight kilobytes and fifty-five bytes, because those numbers are the dialect and not an accident of `std::queue`. It does not keep two lines. A Python send that writes the frame when you ask it will not starve a file behind chat, and will not force a file after thirty-two kilobytes of noise, because it has no noise buffer. The seam is the same kind as the scheduler seam in chapter 10. The bytes match. The day does not. A client that works against Phoenix and stalls against Ash, or the reverse, while a large file is in flight, is this chapter before it is a cipher bug.

The board rides the normal line unless it was marked raw. The head rides the file line. Chat rides the normal line and can be glued to the prop packet ahead of it, which is why a log of frames will not line up with a log of `sendPacket` calls. One frame, many sentences, one compression, one length. The next room is the rest of what a level keeps besides the board and the person: the sign, the horse, the item on the grass, the clocks Ash never grew.

---

*End of chapter 18.*
