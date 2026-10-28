# Compiler’s note — Chapter One

The chapter is fiction. The machinery under it is the v2.05 rev2 record (image `00400000`, entry `00544A4C`, FileVersion 2.0.5.2). Names in the story are doors, not new findings.

| In the chapter | In the record |
|---|---|
| Surveyed stone at four million; wrist number 4,144,444 | Image base `00400000`; entry `00544A4C` |
| The bell / the probe | `FUN_0049f9c0` int 3 at `0049F9DA`. First-chance breakpoint, not a crash |
| Adventure, More Options, Start Screen always built | `TAdventure` / `TMoreOptions` / `TStartScreen` always created. `TAdventure` size `0x43C`, pacer last pointer at `+0x438` |
| Interval written 1000, then 50 | Pacer `+0x438` interval `0x32`; constructor first writes 1000. Idle is `004642FC`, 50 ms `timeGetTime` gate, calls pacer VMT `+0x38`, not `+0x58` |
| A stall is one frame | `LAB_00464410` calls `+0x58` once. `004F04E0` ignores steps |
| Twenty-seven keys; head overwritten | 27 `graalconfig` keys; `DAT_004cd1b4` overwrites head |
| Password mask she will not lift | Literal `~2%$zsd^`. Not decrypted |
| Old door, wrapped name, verb `newmain`, port 14921 | `FUN_004a97c4` / `FUN_004a4898` / `FUN_0050a154`. Host DES-wrapped `www.graalonline.com` |
| 14922, `GNW30123`, first byte `04` | 2.22/2.31 frame. v2.05 `SessionRecv` `0050D9BC` has no `04` case |
| 14923, `GNW07080`, four rows, naked `newmain` also four rows | 4 Oct captures. Worlds: Doomsday no SYN (bad host), RS FIN on `GNW03081`, Testbed and LTTP generation-gated. Rejections can still send a level, then FIN |
| Her token `GNW03081` | `CLVER_2_052`. `GNW28015` is built only after list connect returns. `GNW07080` is `CLVER_1_39` |
| Selector, space, scramble `8088405`, flush past `0xFFF`, zlib not DES | `SessionSend` `0050B028`; flag `+0x434`; flush `0050A6AC`; raw send `0050A8F0`. deflate is `FUN_00481920`, zlib 1.1.2, level 9, method 8, windowBits 15. Generation 3 deletes one byte after the same multiplier |
| Nail for the agreed level stays empty offline | `gvar_0054B794` set by session case `0x26`. Training draws with it still 0 |
| Tutorial names, Bomb, link, 30.5 / 30.0 | Enter `FUN_004f5864`. `TPlayer+0x248` previous, `+0x250` other, `+0x258` Bomb. Session doubles `+0x1C8` / 30.5 and `+0x1D0` / 30.0 |
| “Socket not established!” | Exception at `0050A2EF`, message at the live object. `nlansp_c` `8007277C` is `WSASERVICE_NOT_FOUND`, not the Graal error. Process stays up while the box is up |
| 64×64 board; baddies skipped until a marker | `GLEVNW01`. Reader skips baddy lines until `BADDYEND`; writer still emits `+0x3c` |
| Tile law is type, not a painted mask | `FUN_004f5b08` loads image, prefix, type. Body block `FUN_005401bc`. Type 0 walks only if id is in `gvar_0054C264` or `gvar_0054C1F0`. Throw skip type `0x14` |
| Ash sign rite | After x,y (each minus `0x20`): byte = char+89, decode `(b-89)&0x7f`, A–Z minus 6. High bit set on `v*eUWf` is a space. NPC scripts in the same file are Latin-1, `0xA7` newlines |
| Session sign choir | `DecodeSignText` `FUN_0053673c`. Index `input_byte-0x20` into the string at `00536874`. `#` searches 14 slots and emits `#` plus one of `ABXYudlrhxyz4` |
| 161 commands, stride 12, plated switch, closed shops | Table `00548FE0`, ends `0054976C`. `DispatchGs1` `FUN_0051C3C4`, jump table `0051C6CE`, 207 slots. 150 labels plated. Default slot still holds else, setfocus, resetfocus, join, and the other eleven named in the aabq note. `spyfire` / `setfocus` / `loadmap` rows exist; no direct xrefs on the plaintext |
| Drop a file | `004E2750` is `WM_DROPFILES`, only when `TMainWindow+0x3D0==1`. One extension spawns a script NPC, three an image NPC, anything else loads a level |

Chapter Two is the street on the way out. The nail does not take a name.

# Compiler’s note — Chapter Two

Same rule as Chapter One. Fiction on top. No new findings.

| In the chapter | In the record |
|---|---|
| Four rows, copied, not improved from memory | 4 Oct list on 14923, space-`newmain`, four server rows |
| First row, no SYN, a host field that is not a host | Doomsday, bad host field, no handshake |
| RS at 148.113.172.167:14801, `GNW03081`, level then FIN | RS FIN on `GNW03081`. Rejections still sent a level, then FIN |
| Token not inked until the list returns | `GNW24011` is built only after list connect returns. v2.05 world token she speaks is `GNW03081` |
| Printable nothing, then token, then length-biased account and password, then selector `0x25` | Login prefix `Chr((rand&0x7f)+0x20)+GNW03081`, length-biased account/password, then selector `0x25`. Selectors 0 and `0x25` in `TAdventureClient.Create` |
| Four hands on one table | Session VMT `00509C4C`: close `0050B3A0` (sockets at `+4` and `+0x438`), send `0050B028`, recv `0050D9BC`, raw `0050FCA8` (`0x85` and `0x86` only) |
| Nail written only by first byte `0x26`; stays empty | `gvar_0054B794` set by case `0x26`. Offline training leaves it 0. Chapter does not claim `0x26` arrived and was ignored; it leaves open whether the case was absent or lost to the FIN |
| `0x25` on the way back would build a sign | Case `0x25` builds `TEditorSign` and calls `FUN_0053673c` |
| Testbed takes 2.22 and 1.41, not her; LTTP takes 1.39 and the five- and six-point mouths | Testbed allows 2.22/1.41r1. LTTP allows 1.39 / 5.07–6.037. Both rejections sent a level, then FIN |
| A cousin speaking `GNW28015` is accepted at the same RS address | World login `GNW28015` to 148.113.172.167:14801 was accepted. That is a later mouth, not the v2.05 token |

She does not get a world. Chapter Three opens a level as a file on the bench, where a finish cannot reach it.

# Compiler’s note — Chapter Three

Same rule. Fiction on top. No new findings. She does not repair the baddy gap.

| In the chapter | In the record |
|---|---|
| Sixty-four by sixty-four, header willing to name itself | `GLEVNW01`. Board is 64×64. Fields: LINK, SIGN, CHEST, NPC |
| Writer emits baddies; reader skips until a marker; no thief | Writer still emits `+0x3c`. Reader skips baddy lines until `BADDYEND` |
| Link at sixteen by twenty-six, flag two, strings 30.5 and 43 | Training-lane link to `tutorial_b-2_house.graal` at `0x16,0x1A` flag 2, strings 30.5 and 43 |
| NPC script plain; sign kept apart | NPC scripts in the Ash file are Latin-1 with `0xA7` newlines. Sign text is a different rite. Chapter refuses to use one decoder on both |
| GR-V 1.00 through 1.03, a corridor not four copies | 1.3.9 `TEditorLevel` loader `FUN_004b99e8` reads GR-V1.00 through GR-V1.03 |
| Board, then pockets: links, baddies, signs, an empty hook, NPCs, chest-shaped | Board at `+8` via `FUN_004ba2dc`. Lists: `+0x14` links, `+0x18` baddies, `+0x1C` signs, `+0x24` NPCs, `+0x28` chest-shaped (`PTR_LAB_004b877c`). `+0x20` created but not filled |
| Sign decoder in that loader is a third door, not the session choir and not Ash | Sign text decode `FUN_004ba73c`. Session choir is `FUN_0053673c`. Ash is `(b-89)&0x7f`, A–Z minus 6 |
| Walk law is type, not a painted mask; tiledefs is the line at the door | `FUN_004f5b08` loads image, prefix, type[,x,y]. Sheet pick `FUN_004f6244`, default pics1.png type 0. Body block `FUN_005401bc`. Type 0 walks only if id is in `gvar_0054C264` or `gvar_0054C1F0`. Throw skip type `0x14`. setshape2 types above 19 block |
| Bomb was a live object, not a fact about the file | Training enter `FUN_004f5864`: `+0x258` is Bomb on the live player. Offline nail `0054B794` stays 0 |
| Drop is the hall’s mood, not the bench | `004E2750` runs only when `TMainWindow+0x3D0==1` |

Chapter Four, if it is called, walks the switch. Not the closed shops. `spyfire` stays closed.

# Compiler’s note — Chapter Four

Same rule. She does not open the shutters and does not invent a body for a name.

| In the chapter | In the record |
|---|---|
| 161 rows, stride 12, name at the head, kind 0–6, a stop you can point at | Table `00548FE0`, ends `0054976C`. Name field at +0. Kinds 0–6 |
| Row index is the case | aabq plates: case number is the row index |
| Arrive with a list; count at plus eight; number at plus four; jump, 207 slots, 0 through CE | `DispatchGs1` `FUN_0051C3C4`. `Commands[2].vt` is `TList.FCount` at +8. Switch on node+4. `JMP dword ptr [EAX*4+0x51c6ce]` at `0051C6C7`, table `0051C6CE`, 207 slots |
| Jump, if, nearby; one case writes a hash; one writes the self | Control `0xCA` jump, `0xCD` if/else, `0xCE` nearby. Case `0x4A` writes `gvar_0054B7E4`. Case `0x4B` writes Self |
| Words kept in the room, thunder not heard | Strings in the body: male, playerenters, shapetiletypes, sounds, thunder.wav |
| Pattern letters; R is one string with one pointer | `FUN_005138b8` expands `PTR_PTR_0054bd38 + index*0xc + 8`. B baddyname, C colorname, D direction, F/Q filename, I itemname, L carry, M/S string, O objectname, R the string `real` at `00513A70`, sole xref at `00513983` |
| Fifteen share a default and were not plated | `0x22` else, `0x24` seturllevel, `0x51` setfocus, `0x52` resetfocus, `0x5A` setbacktile, `0x6B` canwarp2, `0x74` function, `0x79` drawovertrees, `0x7C` canwarp, `0x86` join, `0x87` freezeplayer2, `0x88` unfreezeplayer, `0x9B` setbacktile2, `0x9C` setz, `0x9D` updateterrain. 150 labels on 124 addresses; these fifteen share the default slot |
| spyfire row 115, setfocus row 81, loadmap row 158; letters present; no direct xref. resetfocus is not a row | Rows at `00549544`, `005493ac`, `00549748`. Plaintext `0049e858`, `0049e58c`, `0049ec44`. resetfocus plaintext `0049e5a2` is not a row |
| ExeSpy written down and not chased | First needle ExeSpy; seed `0054C414` to `0054D044` |

Chapter Five, if it is called, is the cousins: the same multiplier, and the byte a later mouth deletes.

# Compiler’s note — Chapter Five

Same rule. The delete stays in the margin. It is not imported into the old mouth.

| In the chapter | In the record |
|---|---|
| Same multiplier, walked once, only if the flag is set | `SessionSend` `0050B028`. LCG `0x8088405` once, when `+0x434` is set. Appends to `+0x410` |
| Sack, tax, flush, press | Flush `0050A6AC` past `0xFFF`, calls `FUN_00481920` |
| Press is zlib, a version string you can point at, fifty-six bytes, level nine, method eight, window fifteen | zlib 1.1.2, version string at `00546b6d`, `z_stream` size `0x38`, level 9, method 8, windowBits 15 via `FUN_0047dbc4`. Not DES |
| Wrapping is the other room | v2.05 list host DES-wrapped `www.graalonline.com:14921`, verb `newmain`. Withdrawn once, put back by the 4 Oct captures. Not the press |
| `04` is a missing case, not a cipher to spend the afternoon on | 2.22/2.31 frame. `SessionRecv` `0050D9BC` has no `04` case |
| Cousin deletes one byte after the ghost; her city keeps the length | Generation 3 codec deletes one byte after LCG `0x8088405`. v2.05 scrambles and keeps the length |
| Selector, space, rest, prepend; close at near and far | Send prepends `(selector+' ')`. Close `0050B3A0` closes sockets at `+4` and `+0x438` |
| Rebuild named and not started | Intent from 3 Oct: a tweakable client that matches v2.05 behavior, not a Delphi/DX7 port |

Chapter Six, if it is called, is the floor plan. Not the cousin’s diet.

# Compiler’s note — Chapter Six

Same rule. The floor plan is the 3 Oct intent. She does not start building it in this chapter.

| In the chapter | In the record |
|---|---|
| A tweak, not a port; not the old windows language and not the picture house hauled across | Advice of 3 Oct: a tweakable client that matches v2.05 behavior, not a Delphi/DX7 port |
| Shell as a 2D room; Godot a name, not a vow | Godot for the 2D shell |
| Core in the shared language only if sharing the open reader, parser, compiler, little machine | C++ core only if sharing OpenGS1 / GServer-v2 |
| Shelf is not the path; written twice | OpenGS1 in Lumiere: lexer, parser (if/for/while/command), CompileVisitor, VM. Not linked. Running path is still V8 |
| One kit under two names; a window that is a label, a button, a pane, a field; a switch you can leave off | guichan/guisan, same kit. SDL2 uses guisan, SDL1 uses guichan. `TGameWindow` builds a test label, OK button, InGame Window, and a text field. miniupnp is CUPNP port mapping, off with `NOUPNP` |
| Picture-house calls real, and not the vow | `FUN_00542f54` calls SetViewport `+0x34`, SetMaterial `+0x40`, SetTransform(PROJECTION) `+0x2C`, SetRenderState(AMBIENT, FFFFFFFF) `+0x50` |
| Order: bench, frame, mouth, harbor | Chapter’s order, not a new finding. Harbor last, because a silence may be a missing ocean or a mouth she does not have |

Chapter Seven, if it is called, builds the bench. Not the harbor.

# Compiler’s note — Chapter Seven

Same rule. She builds a bench, not a client. No harbor. No frame yet. The gap stays unrepaired.

| In the chapter | In the record |
|---|---|
| Old measure, fields in file order, marker above the baddies, no repair tool | `GLEVNW01`, 64×64. Writer emits `+0x3c`. Reader skips until `BADDYEND` |
| Three sleeves, keys not lent | Session choir `FUN_0053673c`. Ash `(b-89)&0x7f`. 1.39 sign decode `FUN_004ba73c`. NPC scripts Latin-1, `0xA7` newlines |
| Corridor, pockets, empty hook left empty | `FUN_004b99e8` reads GR-V1.00–1.03. `+0x20` created and not filled. `+0x28` chest-shaped |
| Walk law pinned; sheet in a drawer labeled rumor | `FUN_004f5b08` image, prefix, type. Type 0 lists `gvar_0054C264` / `gvar_0054C1F0`. Throw skip `0x14`. Default sheet pics1.png. tiledefs is not a per-tile mask |
| Training is a name; no Bomb; no nail on the bench | Enter `FUN_004f5864` writes the live player. `+0x258` Bomb is live. `gvar_0054B794` is session case `0x26` |
| Rail says not the hall | `WM_DROPFILES` `004E2750` only when `TMainWindow+0x3D0==1` |
| Link copied and not followed | Training link `0x16,0x1A` flag 2, strings 30.5 and 43 |
| Frame refused until the bench has been boring for a night | Floor-plan order from Chapter Six. Idle remains `004642FC`, 50 ms, one frame, steps ignored |

Chapter Eight, if it is called, is the frame. Not a moving picture hiding the board.

# Compiler’s note — Chapter Eight

Same rule. The frame is a gate and a draw. The mouth is a named hook. The picture house stays in the margin.

| In the chapter | In the record |
|---|---|
| Idle already ringing; gate at fifty; constructor’s thousand crossed out and kept | `004642FC` OnIdle, 50 ms `timeGetTime` gate. Pacer `+0x438` interval `0x32`; constructor first writes 1000. Armed on `CM_ACTIVATE` |
| The other slot called once, steps ignored | `LAB_00464410` calls `+0x58` once as `(TMainWindow, pacer, steps)` if the high word at `+0x5A` is nonzero. `004F04E0` ignores steps |
| Idle calls the pacer’s earlier slot, not the rumor | OnIdle calls pacer VMT `+0x38`, not `+0x58` |
| Clock may end the day; mouth touched only if a mouth exists; draw is its own hand | `004F04E0` is the frame: clock-skew quit, TCP/UDP, draw `FUN_004e5cf4` |
| Old picture-house calls real, not the vow | `FUN_00542f54`: SetViewport `+0x34`, SetMaterial `+0x40`, SetTransform(PROJECTION) `+0x2C`, SetRenderState(AMBIENT, FFFFFFFF) `+0x50` |
| Doubles inked, not allocated | World `+0x1E8` / −1.0. Session `+0x1C8` / 30.5 and `+0x1D0` / 30.0 |
| Files drawn into the frame once, then taken down | Chapter’s mistake, not a finding. The bench is not the hall |

Chapter Nine, if it is called, is the mouth. Length kept. Only if the frame is still one picture.

# Compiler’s note — Chapter Nine

Same rule. The mouth is pointed at nothing. The nail is not allocated. The cousin stays on the far end of the bench.

| In the chapter | In the record |
|---|---|
| Close first, near and far | Session close `0050B3A0`, sockets at `+4` and `+0x438` |
| Prepend selector, space, rest; ghost once if the flag is set; sack can say its weight | `SessionSend` `0050B028`. LCG `0x8088405` once when `+0x434` is set. Appends to `+0x410` |
| Flush past the tax, then the press; wrapping on another shelf | Flush `0050A6AC` past `0xFFF`, zlib 1.1.2 via `FUN_00481920`. List-host wrapping is the other room |
| Third hand, no ear for `04`; sign room and nail room labeled, not furnished | `SessionRecv` `0050D9BC`, no `04` case. Case `0x25` builds `TEditorSign`. Case `0x26` sets `gvar_0054B794` |
| Fourth hand, refusal built before the two cases | `SessionRecvRaw` `0050FCA8`, first byte `0x85` and `0x86` only |
| Printable nothing, token left blank, guest, mask, selector `0x25`; zero left as a door | Login prefix `Chr((rand&0x7f)+0x20)+GNW03081`, length-biased account/password, selector `0x25`. Selectors 0 and `0x25` in create. Token not filled in: she has no world today |
| Cousin on the far end; one byte after; line drawn on the bench | Generation 3 deletes one byte after the same multiplier. v2.05 keeps the length |
| Frame may glance at the sack and may not connect | Chapter’s limit. Harbor is last |

Chapter Ten, if it is called, is the harbor. A house is allowed to finish.

# Compiler’s note — Chapter Ten

Same rule. She does not allocate the nail to feel the agreement. The cousin is watched and not ported.

| In the chapter | In the record |
|---|---|
| Four rows, copied again, not sanded | 4 Oct list on 14923, four server rows |
| First row, no SYN, nothing to close | Doomsday, bad host field, no handshake |
| Token inked only because a world is now being spelled for; `GNW03081`; selector `0x25` | v2.05 world token. Login prefix and selector `0x25`. `GNW24011` is built only after list connect returns; she does not speak it at the list |
| RS, a street, one picture, then FIN; nail room still unfurnished | RS FIN on `GNW03081`. Rejections still sent a level, then FIN. `gvar_0054B794` is case `0x26`, not allocated here |
| Testbed and LTTP, known refusals, same courtesy | Testbed allows 2.22/1.41r1. LTTP allows 1.39 / 5.07–6.037. Both sent a level, then FIN |
| Cousin taken at the same address; she walks past | `GNW28015` to 148.113.172.167:14801 was accepted |
| Mouth hung back on nothing; `04` still falls through | Chapter’s limit. `SessionRecv` has no `04` case |

The harbor is last in the floor plan, and it has been walked. A next chapter, if called, should not repair what this one witnessed.

# Compiler’s note — Chapter Eleven

Same rule. Nothing witnessed in Chapter Ten is closed here. The copy must not discover a new step.

| In the chapter | In the record |
|---|---|
| Marker left; no thief deleted | Writer emits `+0x3c`. Reader skips until `BADDYEND` |
| Keys not lent | Session choir, Ash rite, and `FUN_004ba73c` stay three doors |
| Shutters down; ExeSpy not chased | spyfire row 115, setfocus row 81, loadmap row 158, no direct xrefs. resetfocus is not a row. First needle ExeSpy |
| Delete not imported; line darkened, not crossed | Generation 3 deletes one byte after `0x8088405`. v2.05 keeps the length |
| Nail not declared | `gvar_0054B794` is case `0x26`. Not allocated in the story |
| Steps still ignored | `004F04E0` ignores the count from `LAB_00464410` |
| `04` not broken | `SessionRecv` `0050D9BC` has no `04` case |
| Two columns unmerged | Default is not missing. Witnessed is not unfinished |

Chapter Twelve, if it is called, is written beside this one. Not over it.

# Compiler’s note — Chapter Twelve

Same rule. The harbor leaf is weighted so a draft cannot slide under it. No gap from Chapter Eleven is closed.

| In the chapter | In the record |
|---|---|
| Lanes in order; new name over old; previous stays warm; Bomb not copied onto the bench | Enter `FUN_004f5864`. `TPlayer+0x248` previous, incoming name in EDX. `+0x258` Bomb is live, not a file fact |
| Nail null, not unbuilt: the offline shape | `gvar_0054B794` stays 0 while training draws. Case `0x26` is the session nail |
| Link copied, not followed | `tutorial_b-2_house.graal` at `0x16,0x1A` flag 2, strings 30.5 and 43 |
| Sign sleeve stays shut; NPC line read | Ash sign rite is not Latin-1. NPC scripts are Latin-1 with `0xA7` newlines |
| Empty rest, flag set, length kept, flag unset | `SessionSend` scrambles once only when `+0x434` is set. v2.05 keeps the length |
| Allowed list does not gain a reason for the missing sea | Doomsday, bad host field, no SYN. No new finding |

Chapter Thirteen, if it is called, sits to the right. Not under.

# Compiler’s note — Chapter Thirteen

Same rule. No arrow from the new sheet to the harbor or the lanes. No new finding invented for a gap.

| In the chapter | In the record |
|---|---|
| Three houses built before anyone asked | `TAdventure`, `TStartScreen`, `TMoreOptions` always created |
| Hall, pacer in the last slot, thousand then fifty | `TAdventure` size `0x43C`, pacer `+0x438`. Interval `0x32`; constructor first writes 1000 |
| Probe in the margin, not filed under wreck | `FUN_0049f9c0` int 3 probe. First-chance breakpoint is not a crash |
| Twenty-seven keys, count only; head can be overwritten; no reason invented | 27 graalconfig keys. `DAT_004cd1b4` overwrites the head |
| Mask unlifted | Password mask literal. Do not decrypt |
| Device is a path; joystick left in its own object | Device `+0x290` via `FUN_00496078` when inner `+0x207` bit 4 is set. Joystick WinMM id `+0x2168`, not `TMainWindow` |
| Helpful sentence crossed out and kept | Chapter’s discipline, not a finding |

Chapter Fourteen, if it is called, sits to the right of the rooms. Not under them.

# Compiler’s note — Chapter Fourteen

Same rule. The remainder is named and not opened. No empty chair is filled.

| In the chapter | In the record |
|---|---|
| Mood consulted before a drop is received | `004E2750` runs only when `TMainWindow+0x3D0==1` |
| One ending becomes a script NPC; three become an image NPC; anything else tries to become a level | Drop suffixes. One extension spawns a script NPC. `.txt` / `.gif` / `.png` / `.mng` are the picture family in the device note; the chapter keeps the count at three rather than inventing a fourth fate |
| One occupied chair | Dyn table at `004DF825`, one slot, index `0x0233` to `004E2750` |
| Type-nothing walk not lifted | Type-0 jump table at `0053fc6d` was not lifted. Id lists not recoverable from the saved gzf |
| Fifteen names, shared, not missing | Default slot, unplated: `0x22` else, `0x24` seturllevel, `0x51` setfocus, `0x52` resetfocus, `0x5A` setbacktile, `0x6B` canwarp2, `0x74` function, `0x79` drawovertrees, `0x7C` canwarp, `0x86` join, `0x87` freezeplayer2, `0x88` unfreezeplayer, `0x9B` setbacktile2, `0x9C` setz, `0x9D` updateterrain |
| Clothes left on the shelf | List-host wrapping. DES note was withdrawn; the shelf stays a shelf |
| Marker, empty hook, nail, shutters, delete copied into not today | Prior chapters. No verb added |

Chapter Fifteen, if it is called, sits to the right of the remainder. Not into it.

# Compiler’s note — Chapter Fifteen

Same rule. The column stays weighted. The list is a mouth, not a gap.

| In the chapter | In the record |
|---|---|
| Two callers, one builder | List client is the other `FUN_0050A154` caller. Session is the one she built |
| Close, line, reply, one empty room | List close `0050A138`, line builder `0050A80C`, reply parser `0050A99C`, `0050AC54` empty |
| Verb newmain, old port, host not bare; clothes not taken down | v2.05 list host port 14921, verb newmain. Wrapping withdrawn as a DES note and not re-opened |
| Token after the list finishes being a list | `GNW24011` is built only after connect returns. She does not speak it at the list |
| Five of five is a stage, not a verdict; no picker | `gvar_00517A78`. 1.39 has no list picker |
| Raw send named, not built | `0050A8F0`, distinct from flush `0050A6AC` and `SessionSend` |
| Ghost not given to the list mouth | Chapter’s limit. The LCG belongs to session send when `+0x434` is set |

Chapter Sixteen, if it is called, sits to the right of the other mouth. Not into the column.

# Compiler’s note — Chapter Sixteen

Same rule. No player is constructed. Bomb is not copied onto this sheet. The column stays weighted.

| In the chapter | In the record |
|---|---|
| 30.5 and 30.0, and a not-yet of negative one | Session `+0x1C8` / 30.5 and `+0x1D0` / 30.0. World `+0x1E8` / −1.0 |
| Same figures on a link, different job, no disguise-line | Training link strings 30.5 and 43. The chapter does not collapse the link strings into the session doubles |
| Arrival writes a name and four small rooms; rooms named, body unbuilt | `FUN_004f5864` stores the name at `+0x248` and arrival at `+0x1C8` / `+0x1CC` / `+0x1D0` / `+0x1D4` |
| Bomb not on this sheet | `+0x258` Bomb was live. Chapter Twelve already refused the copy |
| Guest is a word in a line, not a coordinate | Login line. No new finding |

Chapter Seventeen, if it is called, sits to the right of the pair. Not into the column.

# Compiler’s note — Chapter Seventeen

Same rule. The letters do not adopt the default slot. ExeSpy is not pulled. R is not a moral.

| In the chapter | In the record |
|---|---|
| A row is a name, a kind, and a pattern; case is the row index | 161 rows at `00548FE0`, stride 12, kinds 0–6. Plated cases use the row index |
| The line of letters | `FUN_005138B8`. B baddyname, C colorname, D direction, F/Q filename, I itemname, L carry objectname, M/S string, O objectname, R the string at `00513A70` |
| Real is a word a letter can point at | `DAT_00513A70`, sole xref `FUN_005138B8` |
| Shutters and else stay in the column | spyfire, setfocus, loadmap have rows and no direct xrefs. resetfocus is not a row. `0x22` else shares the default slot |
| Kinds as a span, not a tour | Kinds 0–6. No parade added |
| First needle not pulled | ExeSpy, written down and not chased |

Chapter Eighteen, if it is called, sits to the right of the letters. Not into the column.

# Compiler’s note — Chapter Eighteen

Same rule. The box does not explain the FIN. The side effect is not promoted. The probe is not restaged.

| In the chapter | In the record |
|---|---|
| Socket not established, a box, not the city’s verdict | Live exception, vtable `0040E500`, message at a heap address. Raised near list-client close, `0050A2EF` |
| Process stayed alive while the box was up | Connect-fail run. The dialog holds the process |
| Namespace failure is a side effect, not the cause | `8007277C` `WSASERVICE_NOT_FOUND`, not the Graal error |
| About form and lane names resident in the quiet; nail null | BSS at the connect dialog. About form. `tutorial_b-4` / `tutorial_c-3` link lines. `0054B794` null |
| Probe not restaged | `FUN_0049f9c0` already on the rooms sheet. First-chance breakpoint is not a crash |
| Fewer, not empty | Chapter’s limit. The column is still the column |

Chapter Nineteen, if it is called, sits to the right of the voice. Not into the column. Adjacent facts are fewer. That is not a cue.

That cue was the repetition. It is withdrawn. Chapters Twelve through Eighteen are not the continuation.

# Compiler’s note — Chapter Eleven, last

The unique row ends at Chapter Ten. This chapter does not add a finding. It condenses the later mornings onto one sheet and stops.

| Kept from the repeating row | In the record |
|---|---|
| Witness not repaired | Marker, shutters, delete, unbuilt nail, ignored steps, no `04` case |
| Training beside the quay, not under it | `FUN_004f5864`. Bomb live at `+0x258`. Nail null offline. Link `0x16,0x1A` not followed |
| Three houses, probe, twenty-seven keys, mask unlifted | Always-created forms. `FUN_0049f9c0`. graalconfig. Mask not decrypted |
| Drop only if the flag is willing; one chair | `004E2750` when `+0x3D0==1`. Dyn table one slot, `0x0233` |
| List is the other caller | Other `FUN_0050A154` caller. `0050AC54` empty. `GNW24011` after connect. `gvar_00517A78` is a stage. Raw send `0050A8F0` named only |
| Body is a pair, player unbuilt | Session 30.5 / 30.0. World −1.0. Arrival offsets named, not allocated |
| Letters do not adopt the default slot | `FUN_005138B8`. R is `00513A70`. Kinds 0–6. Else stays unplated |
| Box is not the finish | Exception near `0050A2EF`. `8007277C` is a side effect |

Still unopened, and not a prompt for another chapter: type-0 table `0053fc6d` unlifted; fifteen default-slot opcodes; list-host wrapping withdrawn; `BADDYEND` gap; GR-V `+0x20` empty; spyfire / setfocus / loadmap without xrefs; generation-3 delete is not a v2.05 step.
