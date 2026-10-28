# Chapter 34 — The Client Runs It

The half after the marker is not stored for the server. It is sent, and the client is who steps it.

The Graal Bible's clientside page says the sentence plainly: clientside scripts are done on your client. They do not cause server lag, and they are easily hackable. The NPC-Server page says the scripting over there is different. Some commands are missing, mainly temporary graphical and sound things. Some are added, mainly easier access to a player's attributes. A line `//#CLIENTSIDE` means all following code is sent to the client. The same page has the misconception in bold: there is no `//#SERVERSIDE`. People ask. There isn't. Everything before the marker is the process, if a process is connected. Everything after is the client. Chapter 30's split is this rule, compiled.

What the client is allowed to be is local. A script on that half happens only to the player. Show an image and the other players do not see it, unless the index is below 200, which is the one hole the Bible names. The client reads NPC attributes and does not send the changes on to other players. Graphical stuff and music live here. Anything that must be secure, or must agree with the room, does not. A staff check on the client half is the example the playerworld page calls bad. The good example checks `clientr.staff` in `onActionserverside`, and the client half only says `triggeraction(0, 0, "serverside", ...)`. The origin again. Chapter 8's mode bit is how a client script asks the server to do a thing the client is not trusted to do. A check that lives only in the half after the marker is a check a memory editor can skip. The Bible says `client.` variables can be edited on either side, and that a memory editor is enough.

---

Two dialects, and the shelf holds the older one.

The movement weapon, and the sword in the old `weapons.txt`, speak GS1. `if (playerenters || timeout)`. `if (playertouchsme)`. `if (weaponfired)`. `timeout = 0.05`. A forum post from 2009, Chompy's, says `if (timeout)` equals `function onTimeout()` when you are using the timeout event, and that you should not place events inside other events. GS1 allowed the nesting for the most part. GS2 would rather you write `function onTimeout()` and `function onCreated()` and `function onPlayerChats()`. The Bible's own clientside example is the newer shape: `onCreated`, then a function it calls, then `say2`. The weapon Phoenix ships never grew that shape. A v2 client still accepts the old `if`, which is why the clock works. A script you write in the function style is the same language a decade later, not a different machine.

The clock is the dangerous part, and the danger is different on each side.

On the NPC-Server, scripts run every tenth of a second, and the Bible calls a tenth the minimum and a bad habit. A timeout faster than half a second on that side is discouraged. The process is one machine for every player. On the client, the movement weapon sets a twentieth and means it. The loop is the player's. Tyhm's note on the same forum: a timeout started from `created` on the client starts once per session. Leave the room and it stalls. Come back and it does not restart. Serverside, `created` is once for the whole server, closer to a player entering, and it can fire for an empty room. The client clock is a session. The process clock is a world. Chapter 21's movement hack exists because the old client needed the position reported. It is also a clientside loop that dies when you change levels, which is fine, because the weapon comes with you and `playerenters` can arm it again.

`onUpdate` is a later client event, and a video lesson says it needs `this.keepalive = true` and runs once a frame, and only inside the world client. The shelf has no script that says keepalive. Mention it so a frame loop is not confused with `timeout`. One is a timer the script arms. The other is the client's own draw, opted into.

---

The process has its own events, and they are not the client's.

The Bible lists them. `onCreated`, the first run. `onInitialized`, a reload, such as the process restarting. `onPlayerenters`. `onPlayerleaves`, which does not fire on a disconnect. `onPlayertouchsme`, which wants a shape. `onPlayerchats`. `onNpcwarped`. `onExploded`. The client half has the ones a person can cause alone: created, timeout, chats, keys, the action that becomes a trigger. A touch on the server is the process noticing a body. A touch on the client is the client noticing its own body. They can both be named in one file. Only one of them runs in each half.

What this shelf still cannot show is the stepper. No client binary here was opened and found to contain `onTimeout`. The evidence is the marker, the weapon, the old weapons file, and the Bible. The server builds the string, clips the client half at 12255, and sends it. The client, or the process, is who wakes on the event. A script that does not move until a person stands in it is a client half waiting for `playerenters`. A script that moves in an empty level is a process half, and only if you started the process.

The next packet is still the client's. This chapter is why the packet can contain a sentence the server will never read.

---

*End of chapter 34.*
