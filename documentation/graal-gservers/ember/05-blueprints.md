# Blueprints

## Package layouts

```
Phoenix/                          Ash/
  gserver2.exe                      ashserver.py
  servers.txt                       protocol.py
  start_phoenix.sh                  extras.py
  servers/phoenix/                  servers.txt
    accounts/                       start_ash.sh
    config/                         servers/ash/     ← same inner shape
    world/
    weapons/
    ...
```

`servers.txt`:

```
servercount = 1
server_1 = phoenix          # directory under servers/
# server_1_ip / _port / _localip / _interface  optional overrides
```

## World directory blueprint

```
servers/<slot>/
  accounts/
    defaultaccount.txt      cloned on first login
    YOURACCOUNT.txt         rename to the Graal account
  config/
    serveroptions.txt       name, port, list, staff, hacks
    allowedversions.txt     one GNW / G3D token per line, or a:b range
    foldersconfig.txt       role + glob
    adminconfig.txt         hq_password, hq_level, ns_password, ns_ip
    servermessage.html      PLO_STARTMESSAGE body
    rcmessage.txt           first RC chat line
    rchelp.txt
    ipbans.txt              1.2.3.4 or 10.0.*.*
  documents/
  execscripts/              gr.es payloads
  guilds/guild<Name>.txt    account:nick per line
  logs/                     gr.writefile / appendfile
  npcprops/
  translations/
  weapon_bytecode/          Reborn only
  weapons/weapon-<name>.txt
  world/
    onlinestartlocal.nw
    heads/ bodies/ swords/ shields/ ganis/ hats/ images/ sounds/
    global/heads|bodies|swords|shields
    *.gmap
```

Phoenix listen port **14802**. Ash listen port **14812**.
Listserver default `listserver.graal.in:14900`.

## GRACC001

```
GRACC001
NAME account
NICK shown name
COMMUNITYNAME
GUILD
LEVEL onlinestartlocal.nw
X 30.00
Y 30.50
Z 0.00
MAXHP 3.00
HP 3.00
RUPEES 0
ANI idle
ARROWS 10
BOMBS 5
GLOVEP 1
SHIELDP 1
SWORDP 1
BOWP 1
HEAD head0.png
BODY body.png
SWORD sword1.png
SHIELD shield1.png
COLORS 2,0,10,4,18
SPRITE 2
STATUS 20          # bitmask: pause, hidden, male, dead, weapons, hidesword, spin
MP 0
AP 50
APCOUNTER 60
ONSECS 0
LANGUAGE English
KILLS 0
DEATHS 0
RATING 1500.00
DEVIATION 350.00
WEAPON bomb
WEAPON bow
WEAPON -gr_movement
BANNED 0
BANREASON
LOCALRIGHTS 1040383
IPRANGE *.*.*.*
FOLDERRIGHT rw accounts/*
FOLDERRIGHT rw world/*
LASTFOLDER accounts/
```

`LOCALRIGHTS` bits (TAccount.h):

```
0x00001 WARPTO
0x00002 WARPTOPLAYER
0x00004 SUMMON
0x00008 UPDATELEVEL
0x00010 DISCONNECT
0x00020 VIEWATTRIBUTES
0x00040 SETATTRIBUTES
0x00080 SETSELFATTRIBUTES
0x00100 RESETATTRIBUTES
0x00200 ADMINMSG
0x00400 SETRIGHTS
0x00800 BAN
0x01000 SETCOMMENTS
0x02000 INVISIBLE
0x04000 MODIFYSTAFFACCOUNT
0x08000 SETSERVERFLAGS
0x10000 SETSERVEROPTIONS
0x20000 SETFOLDEROPTIONS
0x40000 SETFOLDERRIGHTS
0x80000 NPCCONTROL
```

## GLEVNW01

```
GLEVNW01
BOARD 0 0 64 0 <128 chars, 2 per tile>
BOARD 0 1 64 0 ...
# 64 rows
LINK destlevel destx desty w h tox toy
SIGN x y text
CHEST x y item signindex
BADDY x y type
verse-sight
verse-hurt
verse-attack
BADDYEND
NPC x y
script
NPCEND
```

Tile characters are the Reborn base64-ish alphabet (`AA` empty, `f/` etc.).
Ash stores those two chars as the two bytes of the runtime tile.

## GMAP

```
WIDTH 3
HEIGHT 3
MAPIMAGE world.png
MINIMAP mini.png
LEVELNAMES
a0.nw,a1.nw,a2.nw
b0.nw,b1.nw,b2.nw
c0.nw,c1.nw,c2.nw
LEVELNAMESEND
```

`serveroptions.txt`:

```
gmaps = world.gmap
maps = overworld.txt          # bigmap, one row of names per line
groupmaps = world.gmap        # instances per player.group
```

## serveroptions keys that change behaviour

| Key | Effect |
|---|---|
| name / description / url / language | listserver + start UI |
| serverip / serverport / serverinterface / localip | bind + advertised addr |
| listip / listport | listserver |
| staff | RC allow-list |
| onlystaff | reject non-staff clients |
| allowed versions file | client version gate |
| unstickmelevel / x / y | warp fallback and chat “unstick me” |
| apsystem + aptime0..4 | alignment tick |
| heartlimit / swordlimit / shieldlimit | clamp props |
| flaghack_movement / flaghack_ip | gr.x/y/z and gr.ip |
| triggerhack_* | gr.* actions |
| maps / gmaps / groupmaps | TMap load list |
| baddyrespawntime / baddyitems | baddy tick |
| offline_login | Ash: skip VERIACC2 if list down |
| hq_password / hq_level | listserver HQ |
| ns_password / ns_ip | NPC-Server |

## Binary vs rewrite

```
          Phoenix                         Ash
engine    gserver2.exe (C++, 2.4.0)       CPython 3
worlds    servers.txt                     servers.txt
protocol  gens 3–5                        gens 3–5
login     listserver required by default  offline_login default true
RC        full TPlayerRC.cpp              extras.handle_rc
NC        TPlayerNC.cpp                   extras + HASNPCSERVER
NPC VM    none on gserver (external)      none (same)
UPnP      miniupnpc                       no
plugins   CPluginManager                  no
```
