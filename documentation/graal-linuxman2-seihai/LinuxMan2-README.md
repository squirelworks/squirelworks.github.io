LinuxMan 2
==========

Definitive notes for the Graal classic tree in this workspace and the
programs recovered beside it. Local pages, not a second copy of the game.
Dumps stay where they were written. This edition points at them.

Edition 1.0 was the SDL client, the tiletypes table, GLEVNW01, and the
stamp library. Edition 1.1 added the level editor, the staff desk, the
two world builders, and gif2mng as short pages. Edition 2 keeps those
pages, retitled, and writes the rest.

Start with the book:

    architecture.html

Or the pages:

    MANPATH=/LinuxMan2 man 7 linuxman
    MANPATH=/LinuxMan2 man -k graal

New in 2
--------

    graalshop(7)         GANI editor, GANI0001 / GANI0002
    gani(5)              grammar, sprite row, movie actors
    graallevelgen(7)     fourteen calls, button at 0x451754
    rcprotocol(7)        two sockets, packet ids, NCL11012
    thinstall(5)         magic 0x82D0B188, 0xD7 and 0xDE
    gif2mng(1)           usage, -b, seven body slots
    dungeongen(1)        GDUNG001, 8 by 11, DungeonMaker 0.9

Carried from 1.1
----------------

    2dadventureclient(7)  graal(7)  tileobjects(7)
    graaleditor(7)  remotecontrol(7)  graalcodec(7)
    terraingenerator(7)  dungeongenerator(7)  gif2mng(7)
    tiletypes(5)  glevnw01(5)  gobjset01(5)
    grmap001(5)  gdung001(5)  controlconfig(5)

Long form
---------

notes/ is the reconstruction, one folder per program. The man page is
the lookup copy. The note is the procedure list.

    notes/GraalEditor       packer, TAdventure, sections
    notes/GraalShop         actors, preview, sheets
    notes/RemoteControl     players, files, accounts, codec
    notes/gif2mng           chunks, body slots
    notes/TerrainGenerator  plasma, HEIGHTS, shipped note
    notes/DungeonGenerator  stamps, styles, shipped note
    notes/GraalLevelGen     pipeline, formats

Three writers, one signature
----------------------------

A .nw is not one format. glevnw01(5) is the signature.

    editor     text BOARD / LINK / SIGN / CHEST / NPC / BADDY
    client     base64 board runs
    terrain    dummy board of tile 0, HEIGHTS 9 by 9
    dungeon    one base64 BOARD
    levelgen   LEVELNAMES links

A .gmap is not one writer. grmap001(5) is the signature.

    terrain    GENERATED 1 and the GEN* keys
    dungeon    GENERATED is the last level name
    levelgen   LEVELNAMES

Do not feed one writer to another loader and expect a board.

Collision
---------

share/tiledefs.txt is the 4096 type bytes, 128 per line.
Wall is >= 20. Water is == 11. See tiletypes(5).
