# Chapter 25 — The Baddy

A baddy is a sign that can be hurt, and the hurt is still the client's idea.

The level file says `BADDY`, an X, a Y, a type, then lines until `BADDYEND`. Three lines, if the author wrote three. They become the verses: sight, hurt, attack. `BDPROP_VERSESIGHT` and the two after it are the ids, and the load builds a prop packet so `setProps` will store them. A verse is a gchar length and the text. An empty verse is a zero. The client speaks them. The server keeps them.

The body is the same costume as a person, smaller. Id, half-tile X, half-tile Y, type, power and image packed together, mode, animation, direction. Direction is one byte for the head and the body, the comment says both are encoded in `dir`, and the constructor sets it to `(2 << 2) | 2`. Power and image share a prop. Before 2.1, if the image is the default for the type, the send rewrites `.png` to `.gif`, because that client still wants the old picture. A custom image is kept, with a flag the comment does not apologize for. The client resets the custom image when the baddy is hurt. `setImage` remembers the first real image and ignores the reset. A hurt that would undress the baddy is eaten. The server learned the client's superstition, the way it learned Bomb and Bow.

---

Death is a mode, and the drop is a roll the option usually forbids.

`setProps` watches the mode. Hurt on type 4, the swamp shot, sets a two-second timeout, and the comment says the client is buggy and the level will put the mode back to swamp-shot. Die sets a two-second timeout as well, so the level can move the mode to dead, and if `baddyitems` is on, `dropItem` runs. Dead, if the baddy is willing to respawn, sets the timeout from `baddyrespawntime`, default 60 seconds. If it is not willing, it is removed. Phoenix ships `baddyitems` false, and the options note says a 1.41 world should leave it false because that client drops on its own side. A 2.1 world that wants a baddy to pay out turns the option on. The default is silence.

The roll is out of twelve. Zero through five are a green gralat, a blue, a red, bombs, darts, a heart. Six through nine are forced back to green. Ten and eleven are nothing. The comment does the fractions: about 41.66 percent green, 41.66 something else, 16.66 nothing. Five greens out of twelve, five others, two empties. The item is placed on the baddy, not near it the way a player's death scatters, and `PLO_ITEMADD` tells the room. A baddy's purse is poorer and more local than a person's. It also does not happen unless the option says so.

The clock is the level's walk, the same walk that buries a horse and a gralat. Two seconds from die to dead. Sixty from dead to standing, if respawn is on. A baddy in an empty level waits, because the walk does not run with nobody present. Arrive and the timeout notices. Ash parses the block and the verses and can run this clock. The image superstition is the part to check if a custom baddy undresses itself on hurt in one house and not the other.

A baddy is not a script. The verses are strings. The modes are bytes the client reports. The server's authorship is the drop, the respawn, and the refusal to forget a custom image. The next annex is the door that is not a door unless the destination file exists.

---

*End of chapter 25.*
