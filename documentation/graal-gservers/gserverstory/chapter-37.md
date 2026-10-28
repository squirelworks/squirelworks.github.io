# Chapter 37 — The Origin, from the Other Side

Chapter 8 saw the origin as a mode bit. The script sees it as an address.

`triggeraction` takes a tile and then parameters. A level NPC passes its own x and y, and the first parameter is the action name. The guide's amnesia example stands on the NPC and sends `triggeraction(x, y, "trigger", player.account, ...)`, and the function before the marker is `onActiontrigger`, reading `params` from the second one onward. The tile is where the action happened. The process can believe the place.

A weapon cannot pass a tile, because a weapon is not standing anywhere. The guide says the x and y are always `0, 0`, because the NPC-Server is at the origin, and the weapon's name has to be in the action. `params[0]` is the word after that. The fireball checks the cost on the client half, shoots, then `triggeraction(0, 0, "serverside", "Fireball", "mp")`. The function before the marker is `onActionserverside`, and it subtracts the mana only if `params[0]` is `mp`. The name is how the process knows which carried script is speaking. The origin is how the packet is marked as not-a-place.

That is the rule chapter 8 compiled. A trigger at `0, 0` may be eaten by the `gr.` list, if the option is on. A trigger at any other tile is forwarded. A weapon that wants the process must speak from the origin, and must say its name, or the process has a sentence with no speaker. A level NPC that wants the same process speaks from its own tile, and the tile is the speaker. Mixing them up is how a shop works in the editor and does nothing on the server: the action arrived at a real tile, and the hack that would have caught a `gr.` sentence was not listening there, and the process was not given a name it recognized.

The guide's bad habit and the Bible's security note are the same sentence. Do not decide the staff check on the client half and then call the origin. Decide it in `onActionserverside`, and let the client half only ask. The origin is a door. It is not a proof.

---

*End of chapter 37.*
