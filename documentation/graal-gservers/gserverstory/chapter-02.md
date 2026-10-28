# Chapter 2 — One Thread Per World

The grass does not move because a clock told it to. The grass moves because a process woke up, noticed a socket, and answered. Between those two facts there is a day, and the day is shorter than people think.

You leave the room of engines and sit down with the Reborn source, which is the building the later boxes are still living in. Phoenix is that building with the lights already on. Ash is the same floor plan drawn again in another hand. Tonight you want the day itself: who starts, who waits, and what a second is allowed to do.

The program announces itself before it does any of this. In `main.cpp` the log line is plain: Graal Reborn GServer, programmed by Joey and Nalin. Then it looks for `servers.txt` beside the executable. If the file will not open, it stops. If it opens and `servercount` is missing or zero, it stops again, and the error it prints is a small human scar — it says `settings.txt`, though the file it actually failed is `servers.txt`. You will learn to love scars like that. They prove a person was here.

When the count is real, the loop is ordinary and that is the point. For each `i` from 1 to `servercount`, read `server_i`. That string is not a slogan. It is a directory name under `servers/`. Phoenix's line says phoenix. Ash's line says ash. A second slot would be a second town in the same process, with its own accounts and its own port, sharing only the binary and the accident of having been started together. Optional lines may override the address: `server_i_ip`, `server_i_port`, `server_i_localip`, `server_i_interface`. If the same name appears twice, the log warns and the old object is deleted. Doubles are not a feature.

Each name becomes a `TServer`. `init` is the morning: the listen socket, the folder indexes, the UPnP thread that will try to punch a port forward without asking the rest of the day to wait, the listserver socket. If the listen socket cannot be built, that world is abandoned and the next name is tried. The listserver is opened here too. A failure to even construct that socket is treated as a failed start. Actually reaching the far directory is a later problem, retried inside the loop, which is why a world can be alive on its own port while the public list is sulking.

Then the sentence that makes the chapter's title true. Unless the build was compiled without Boost, the server object is handed to `boost::thread`. One world, one thread. The main thread does not play the game. It joins. It waits until every world thread has ended, and only then does it delete the servers and tear down the socket system. On Windows the log adds a plea that is also a design: press Ctrl+C to close. Do not click the X. You will lose data. The X is a murder. Ctrl+C is a chance for the cleanup to save flags and translations before the objects go.

There is a side door. `--server` or `-s` skips `servers.txt` and constructs one named world. Useful when you are staring at a single town and do not want the count. The thread story is the same.

---

Inside the thread, `TServer` is callable. That is the whole of `operator()`. A flag called `running`. A while loop. Each pass does three things, in an order you should be able to recite.

First, `doMain`. Second, `cleanupDeletedPlayers`, because a player is not destroyed in the middle of the select that noticed them leave. They are marked, and the broom comes after the listen. Third, if someone has asked for a restart, the flag is cleared, `cleanup` runs, and `init` is called again with whatever address overrides were kept. A restart is not a new process. It is the same thread agreeing to be morning again.

`cleanup` is the night version of that agreement. It joins the UPnP thread, removes the forwarded ports, saves translations, saves server flags, deletes every player, every NPC, every level, every map, saves weapons and deletes those too, disconnects the listen socket and the list socket, and tells the socket manager to forget its list without calling unregister in a way that would crash on the way down. When you kill a gserver kindly, this is the function you are hoping gets to finish.

`doMain` is almost insultingly small.

If the listserver is not connected, try again. Then ask the socket manager to update, with a timeout of zero seconds and five thousand microseconds. Five milliseconds. Then, if `time(0)` is not the same second as `lastTimer`, call `doTimedEvents`. Return true.

That is the day. Not a game tick in the style of a frame. A wait, a confession of the clock, and back to the top. The grass you remember is a side effect of sockets becoming readable inside that wait.

---

The socket manager is the ear.

`CSocketManager::update` builds two fd sets, read and write. It walks every stub it knows: the server itself, because the listen socket is a stub; the listserver; every player who has been registered. A null stub is erased. A live socket is added to the read set if it claims it can receive, and to the write set if it claims it can send. Then `select`, with the five-millisecond patience passed in from `doMain`. When select returns, the walk happens again. If the socket is readable, `onRecv`. If it is writable, `onSend`. If either says it failed, the stub is unregistered and the slot is zeroed, to be swept next time. New stubs that arrived during the walk are not shoved into the list mid-iteration. They wait in `newStubs` and are appended at the end. The ear does not like being rewritten while it is listening.

When the readable socket is the listen socket, `TServer::onRecv` runs, and this is the hallway.

`accept`. If it fails, shrug and return. If it succeeds, find a free player id. The search starts at 2, not at 0. Whatever lives in the first two slots is not for a person who just walked in. If a hole exists, take it. If not, grow the vector. Construct a `TPlayer` with the server, the new socket, and that id. The constructor sets the type to `PLTYPE_AWAIT`. Push the player onto the list. Register the socket with the manager so the next select can hear them.

They are in the building. They are not in the world.

`PLTYPE_AWAIT` is the confession you were promised at the end of the last chapter. In `TPlayer::parsePacket`, the first packet is special-cased for as long as the type is still that sentinel. It is read as a line up to a newline, and handed to `msgPLI_LOGIN`. The comment above the branch is the whole theology of the early wire: the first packet is always unencrypted zlib. Until that line parses, there is no generation, no version token, no account. There is a socket with an id, sitting in a chair in the hall, and the server will not pretend otherwise. After the login succeeds, the type becomes a client, or a remote control, or an NPC-Server, and the same function falls through into the ordinary loop: pull a packet, decrypt if generation 3 wants it, read an id, call the function in the two-hundred-and-fifty-six-slot table. Unknown ids hit the null. The hallway is over.

You do not open the login function tonight. You only need to see that the type is a door, and the door is shut until the first line.

---

The clock is the other citizen of `doMain`, and it is stingy.

`doTimedEvents` stamps `lastTimer` with `time(0)` and then visits everyone who keeps a watch.

The listserver goes first. Every thirty seconds, if the gap since `lastPing` has grown that large, it sends `SVO_PING`. Every three hundred seconds it sends the player roll again, a synchronization in case the far directory has drifted from the truth of the list. The list socket is not the game. It is a correspondence. The correspondence has a heartbeat and a census.

Then the players. For each one, `TPlayer::doTimedEvents`. If the socket is already gone, the player is marked for deletion and the function returns false. If they are not a client — if they are staff RC, or the NPC-Server, or still awaiting — most of the rest is skipped. The clock is a client clock. Online time increments only for them.

Inactivity is a setting, not a law. If `disconnectifnotmoved` is on, and both the last movement and the last chat are older than `maxnomovement` — twelve hundred seconds unless the config says otherwise — the server logs the disconnect, sends `PLO_DISCMESSAGE` with the sentence about inactivity, and drops them. Silence of a different kind is not optional: if no data has arrived for three hundred seconds, the client has timed out, and the log says so. A socket that will not speak is not a guest.

Action points live here too, if `apsystem` is on and the player has a level. The counter decrements unless they are paused or the level is a sparring zone. When it hits zero and AP is under one hundred, AP increments, and a props packet carries `PLPROP_ALIGNMENT` so the client can show the change. The refill delay steps with the value: thirty seconds under twenty, ninety under forty, three hundred under sixty, six hundred under eighty, twelve hundred after that, unless `aptime0` through `aptime4` override the defaults. Sparring is the exception that proves the room. Walking into a sparring zone at full alignment knocks AP down to ninety-nine, elsewhere in the player code, so that a fight has somewhere to fall from. The timed event is how it climbs back.

Singleplayer level clones, the private copies a player owns, get their own `doTimedEvents` from inside the player. An account save happens every three hundred seconds, and only if the client is loaded and not load-only. Once a minute the invalid-packet counter is forgiven back to zero. The server is willing to forget a little rudeness if the person stays.

Then the levels, the shared ones and the group instances. A level's second is not a simulation of weather. It is housekeeping. Board changes carry a timeout; when it fires, the old tiles are swapped back and `PLO_BOARDMODIFY` is sent, and the change object is deliberately not deleted. The comment in `TLevel.cpp` is worth reading twice. The client remembers board changes. If the server throws the change away, the client will not get the restored data. Items time out here too, so that a dropped thing can vanish even if nobody is standing in the level to send the delete. Horses and baddies have their own clocks in that same family of visits. The board is a memory with an expiry, not a painting.

Above the per-object visits, the server keeps four slower drums.

Every five seconds, Northwest time. `PLO_NEWWORLDTIME` goes to everyone, carrying `getNWTime` packed as a four-byte Graal integer. The world has a clock the client can display, and the clock is a packet.

Every sixty seconds, server flags are saved.

Every one hundred and eighty seconds, the filesystems resync. Accounts, and each of the indexed folders. The disk is allowed to change under the server — someone drops a head image in the folder — and three minutes is how long the index is willing to be wrong.

Every three hundred seconds, a small reload and a small garbage collection. Allowed versions, the server message, the IP bans: read again, so an operator can edit a text file without a restart. Weapons are saved. Then the instanced maps, the group levels, are inspected. If a group has no players left in any of its levels, the levels are deleted and the group is erased. An instance is a room that exists because someone is in it. Emptiness is how it ends.

None of this is the step you took on the grass. The step is a packet, handled between selects. The second is what keeps the town from lying: who is still here, whose AP has climbed, which broken tiles should heal, which empty instance should be forgotten, whether the public list still answers a ping.

---

Ash spends the same second with a different body.

It still begins at `servers.txt`. `load_servers` reads `servercount`, and for each `server_i` constructs a `World`. Each world is handed to a daemon thread running `serve_world`. That function binds the listen port — 14812 for the ash slot, unless the config says otherwise — and accepts. Every accepted socket becomes a `Player` whose type is `PLTYPE_AWAIT`, and that player is handed to a daemon thread of their own. The world does not select across its population. It lets the operating system park each connection in a `recv`, with a three-hundred-second timeout that matches the old "no data" death. Framing is the first thing the thread does with bytes: a big-endian unsigned short, then that many bytes of payload. If the type is still awaiting, the payload is the login line. If the login fails, the thread ends. There is no vtable. There is an if-elif chain in `handle_packet`, which is the same table written as a corridor instead of a switch.

The main thread does not join the world threads and sleep forever. It sleeps one second, then calls `tick_baddies` on every world. A baddy in the dead mode, whose `dead_at` is older than `baddyrespawntime` — sixty seconds unless the option says otherwise — is reset, and the players standing in that level are told. The listserver lives on a thread of its own, started with the world, and it can be down without the accept loop dying. That is the offline-login courtesy from the outside: the house does not lock because the directory is late.

So the argument from the last chapter becomes mechanical. gs2emu is one thread per world, a five-millisecond `select`, a shared ear, deletions deferred to the broom, a clock that visits list, players, and levels. Ash is one thread per world for accepting, one thread per socket for speaking, one thread for the list, and a main thread that only keeps the baddy clock. Phoenix does not get a third design. Phoenix is the first design, compiled, sitting on port 14802 with the world folder named phoenix. If you attach nothing and only watch the process, you are watching `operator()` and `doMain` and the select, whether or not you can read them.

The warning about the X belongs to both houses in spirit. A gserver's truth is ahead of its files. Flags, accounts, weapons, the player who has moved since the last five-minute save — those live in the thread until a timed event or a kind shutdown writes them down. Kill the process in the middle of a sentence and the sentence is what you lose.

---

You close the laptop on `doMain` and look at the five-millisecond comment again. Someone wrote `// 5ms` next to `update(0, 5000)` so that a later reader would not think five thousand meant five thousand milliseconds and go hunting for a bug that is not there. The day is a wait that short, repeated until the second flips.

What the wait delivers, when it delivers anything, is not yet a meaning. It is a length and a payload. The length is a raw integer, big-endian, two bytes, the opposite of the Graal habit. Inside the payload the habit resumes: numbers that had to live in the printable range, because the old client was a cousin of a text protocol and never entirely left home.

That is the next room. The numbers. Why a byte on the wire is so often a value plus thirty-two, and why the first line after the zlib still has to survive that rule before anyone is allowed out of the hall.

---

*End of chapter 2.*
