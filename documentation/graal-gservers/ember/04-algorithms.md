# Algorithms and pseudocode

Faithful to `CEncryption.cpp`, `TPlayer.cpp`, `TPlayerLogin.cpp`,
`TServerList.cpp`, `TMap.cpp`, `TLevelBaddy.cpp`, `msgPLI_TRIGGERACTION`.
Identifiers match the dumps.

---

## 1. LCG step

```
function step(codec):
    codec.iterator ← (codec.iterator × 0x8088405 + codec.key) mod 2³²

ITERATOR_START = [0, 0, 0x04A80B38, 0x04A80B38, 0x04A80B38, 0]

function reset(codec, key):
    codec.key ← key
    codec.iterator ← ITERATOR_START[codec.gen]
    codec.limit ← -1
```

## 2. Gen-3 dummy byte (client → server packets only)

```
function gen3_insert(codec, buf):          # client encrypt
    step(codec)
    pos ← (codec.iterator ∧ 0xFFFF) mod length(buf)
    return buf[0..pos) + byte(')') + buf[pos..]

function gen3_remove(codec, buf):          # server decrypt
    step(codec)
    pos ← (codec.iterator ∧ 0xFFFF) mod length(buf)   # length is already +1
    delete buf[pos]
```

gs2emu outbound gen 3 does **not** insert. Only zlib + length.

## 3. Gen-4 / gen-5 XOR stream

```
function xor_stream(codec, buf):
    i ← 0
    while i < length(buf):
        if i mod 4 = 0:
            if codec.limit = 0: return buf
            step(codec)
            if codec.limit > 0: codec.limit ← codec.limit - 1
            word ← iterator as little-endian 4 bytes
        buf[i] ← buf[i] xor word[i mod 4]
        i ← i + 1
    return buf
```

Inbound gen 4: `limitFromType(0x06)`, xor, bz2-decompress.
Inbound gen 5: read type byte, `limitFromType(type)`, xor, then
decompress by type.
