# Protocol

All multi-byte integers on the player socket are **big-endian**.
Listserver packets have **no** length prefix; they are `id + payload + \n`.

## G-integers (CString writeG*)

Every “Graal packed” integer is 7-bit digits stored as `digit + 32`
so the bytes land in the printable range.

```
gchar  n        ->  1 byte   (n + 32)                         max 223
gshort n        ->  2 bytes  ((n>>7)+32), (n&127)+32          max 12255
gint3  n        ->  3 bytes  14/7/0 shifts                    max 1_568_735
gint4  n        ->  4 bytes
gint5  n        ->  5 bytes  used for file size and modtime
```

`operator>> (char)` on CString writes a **gchar**, not a raw byte.
`operator<< (char)` writes a raw byte. That distinction is how
`PLO_SIGNATURE >> (char)73` becomes the byte `105`.

Pascal string on the wire: `gchar length` + raw bytes (not +32 on the text).

## Login blob (first line, after zlib)

```
gchar typeShift
gchar key                  # clients, and RC when gen > 3
char[8] version            # "GNW28015" etc
u8 nameLen + name
u8 passLen + pass
[NPC-Server only] gshort listenPort
\n
```

Version table lives in `IUtil.cpp` / `versions.txt` / `Ash/protocol.py VERSIONS`.

## Player props

A props packet is:

```
gchar PLO_PLAYERPROPS | PLO_OTHERPLPROPS
gshort playerId            # OTHERPLPROPS only
repeated:
    gchar propId
    <value whose width depends on propId>
```

Important encodings (TPlayerProps.cpp):

| Id | Name | Value |
|---|---|---|
| 0 | NICKNAME | gchar len + bytes |
| 1 | MAXPOWER | gchar hearts |
| 2 | CURPOWER | gchar (hearts * 2) |
| 8 | SWORDPOWER | gchar (power+30) + pstring image |
| 9 | SHIELDPOWER | gchar (power+10) + pstring image |
| 11 | HEADGIF | gchar (len+100) + bytes |
| 14 | ID | gshort |
| 15/16 | X/Y | gchar (tile * 2) |
| 20 | CURLEVEL | pstring |
| 34 | ACCOUNTNAME | pstring |
| 36 | RATING | gint3  `((rating&0xFFF)<<9) \| (deviation&0x1FF)` |
| 78/79 | X2/Y2 | higher-res 2.19+ |

Login uses two bitmasks `__sendLogin` (self) and `__getLogin` (others).

## Level board

`GLEVNW01` text levels. `BOARD x y width layer TILECHARS` — two characters
per tile. Runtime board is `uint16 tiles[64*64]` sent as:

```
gchar PLO_RAWDATA
gint3  (1 + 8192 + 1)
\n
gchar PLO_BOARDPACKET
8192 raw tile bytes
\n
```

Links: `PLO_LEVELLINK` + `dest x y width height destx desty` text.
Baddies: `PLO_BADDYPROPS` + gchar id + prop stream.

## File send (2.1+)

```
PLO_RAWDATA  gint3 (1+5+1+namelen+1 + filesize)
PLO_FILE     gint5 modtime, gchar namelen, name, bytes, \n
```

## Listserver ids

Outbound `SVO_`: SETNAME 0 … NEWSERVER 22, SERVERHQPASS 23, SERVERHQLEVEL 24,
VERIACC2 17, PLYRADD 14, PLYRREM 15, SETPLYR 7, PING 16.

Inbound `SVI_`: VERIACC2 11, ERRMSG 8, PING 99, RAWDATA 100,
FILESTART3/DATA3/END3 15–17 (global head/body downloads).

## Compression type bytes (gen 5)

```
0x02 uncompressed   iterator limit 12
0x04 zlib           iterator limit 4
0x06 bz2            iterator limit 4
```

CFileQueue picks bz2 above 8KiB, zlib above 55 bytes, else raw.
