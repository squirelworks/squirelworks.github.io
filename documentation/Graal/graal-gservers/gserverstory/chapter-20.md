# Chapter 20 — The Guild File and the Group Key

A guild is a text file. A group is a string. They are easy to confuse because both are how a person is sorted, and they sort different things.

The guild file lives in `guilds/`, and it is named `guild` plus the guild's name plus `.txt`. Phoenix ships `guildPhoenix.txt`. There is no header. A line is an account, or an account, a colon, and a nick. `gr.addguildmember`, if `triggerhack_guilds` is on, tokenizes the action on commas: the guild, the account, the optional nick. It loads the file through a filesystem pointed at `guilds`. If `find` does not see the account, it appends a newline if the file forgot one, writes the account, writes the colon and the nick if there was one, and saves. `find` is a substring search. An account named `bob` is already present if `bobby` is on a line. The hack does not parse lines. It searches. A careful guild script uses names that are not prefixes of each other, or it will silently refuse to add the shorter one.

`gr.removeguildmember` finds the account, takes the span until the next newline, and cuts it. The same substring caution applies in reverse: the first match is the one removed. `gr.removeguild` unlinks the file, then walks every player whose guild equals that name, strips the nick back to whatever came before `(`, and sends the nick prop to them and to everyone else. The parenthetical is the guild as the client displays it. Deleting the file does not delete the parenthetical unless the player is online to be told. An offline member keeps the nick until they are set again.

`gr.setguild` is the parenthetical writer. It takes the nick, cuts at `(`, trims, and appends ` (` plus the guild plus `)`. The prop goes to the player and to the room. The account's `GUILD` field and this parenthetical are related by convention, not by this function. The function edits the nick. A person can wear a guild on their name that the file does not list, and can be listed in a file while wearing another name. The file is membership as a script understands it. The nick is membership as the room sees it. The account field is membership as the next login will reload, if something saved it.

`triggerhack_guilds` defaults off. The sentences do nothing unless the option is on, and the option is in the `__admin` list, so a lesser chair cannot enable them. A guild you create by dropping a file in `guilds/` is a guild the hack can append to. A guild you create only by setting a nick is a costume.

`staffguilds` is a third list, and it is only a display. Phoenix's option names Phoenix, Ash, Ember, and a long staff taxonomy. Those names appear in the staff section of the player list. They are not checked against `guilds/`. A costume can be filed under staff because the option says so.

---

The group key is not a file.

`triggerhack_groups` defaults on, the one hack chapter 8 flagged. `gr.setgroup` with two parts writes the second part to the caller's group. `gr.setlevelgroup` writes it to every player in the current level. `gr.setplayergroup` with three parts finds an account and writes the third part to them. The third does not return, so a trigger that sets one player's group falls through into the file hack if that one is also on. The other two return. A script that stacks sentences on one trigger will see the difference.

The string is the key chapter 13 used. On a map with the group flag, warp looks up `groupLevels[group][levelName]` and clones the level on first visit. The `.unknown` unmark keeps a cached neighbor out of the clone. The send skips anyone whose group string differs. An empty string and a named string are not the same key. Two people who have not set a group are in the same empty key, and on a group map that empty key is an instance too. Setting a group is how you leave it.

The five-minute drum deletes a group whose levels have all gone empty. The key dies because nobody is standing in it. It is not saved. A restart forgets every group, the way it forgets every horse. A guild file survives. A group is a ride shared by a party, with a longer clock and a clone instead of a picture.

Both hacks only run when the trigger stood at `0, 0`. Chapter 8's rule. A `gr.setgroup` said at a real tile is a sentence the level hears, not a key the server writes. The origin is the mode bit. Forget it and the party script talks to the room and changes nothing.

---

Ash has the same sentences in `extras.py`, gated the same way, groups on and guilds off unless the option says otherwise. The clone table is the part to check if a party on Ash can still see the other party. The file append is the part to check if a guild add created `guilds/guild<Name>.txt`. Phoenix has the option, the folder, and the binary's hack. Drop the file, turn the option on, stand at the origin in a script, and the append will happen. Neither house will invent the membership from the nick.

The next room is the version forks, which have been leaking into every chapter as a client that does not shift the same bit, does not want the modtime, drops its own bushes, or needs a one-byte weapon called `-gr_zlib_fix`. They deserve to be stood in a row.

---

*End of chapter 20.*
