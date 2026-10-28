# Chapter 17 — The Mouth

Speech is a relay with opinions. The fight trusted an id. A sentence is asked where you are standing, who you are, and what the words are.

`jaillevels` is the first opinion, and it is a list of names. Phoenix names `police2.graal` and `police4.graal`, files that are not in the world until you add them. `msgPLI_TOALL` tokenizes the option on commas and returns if the level you are in is one of them. No message. No error. A toall from jail is a packet that ends. The private-message path is kinder and stricter. It sets a flag. If you are jailed, and you are not staff, and the person you wrote to is not staff, the recipient gets nothing and you get a sentence: from jail you can only send PMs to admins. Staff may speak out. Everyone else may speak only to the chair. The jail is not a mute. It is a room whose mouth has been pointed at the staff list.

Toall, when it is allowed, reads a gchar length and that many characters. The filter is asked with `FILTER_CHECK_TOALL`. If the answer includes warn, the message is handed back to you as chat and not sent. Otherwise every client except you is considered, and skipped if their additional flags have `PLFLAG_NOTOALL`. The packet is `PLO_TOALL`, your id, the length, the text. A person who turned toalls off is not told. The flag is theirs. The jail is the server's.

---

A private message is counted.

Four seconds. If a client sends another before `lastMessage` is four seconds old, they get an admin-message line, the section sign between the label and the text, saying they can only send messages once every four seconds. The limit in the source is a const named `sendLimit`, and the comparison is written as `<= 4`, so the two are the same number only because both say four. A thousand and twenty-four characters is the other wall. Over it, another admin line, and the message is not sent.

The recipients are a gshort count and that many gshorts. One recipient is a private message. More than one is a mass message, and a recipient whose flags have `PLFLAG_NOMASSMESSAGE` is skipped. The text is untokenized before the filter, so a quoted sentence is judged as words, and tokenized again before it is sent. Warn on a PM does not echo the message. It sends the admin line that the word filter caught it. The outgoing packet is `PLO_PRIVATEMESSAGE`, your id, a type string — empty label, or `Mass message:`, or `Private message:` — and the text. An NPC-Server may send one of these too, chapter 8, with its own id, and the four-second check is only for clients.

Chat that is not a toall and not a PM goes through `processChat` when it is a command, and through the say path when it is a sentence. `setnick` waits ten seconds between changes, asks the filter with `FILTER_CHECK_NICK`, and sets the nick prop if the filter does not warn. `sethead` and `setbody` are commands in the same function, and they are not speech except that they share the mouth. A head the filesystem cannot find is asked of the list as `SVO_GETFILE3`, which is how chapter 6's post office gets a customer's order. The mouth is also a counter.

---

The filter is a file, and the file is rules.

`loadWordFilter` reads `config/rules.txt`. Phoenix keeps a worked example in `documents/rules.txt` and a `rules.example.txt` in config. A rule that lives only in documents has not been loaded. The loader wants the config path. The shape of a rule is a block. `CHECK` names which mouths: `pm`, `chat`, `nick`, `toall`. `MATCH` is the word, and a question mark is a single-character hole, so the sample's `F?CK` is four letters with a wild second. `WORDPOSITION` is `start` or `full`. `PRECISION` is a percent, the sample uses 80 on one rule. `ACTION` is a list of verbs.

The verbs are bits. Log is `0x1`. Tell RC is `0x2`. Replace is `0x4`. Warn is `0x8`. Jail is `0x10`. Ban is `0x20`. A rule may carry several. Warn is the one the packet handlers test before sending, and it stops the sentence. Replace changes it and lets it go. Log writes it. Tell RC writes it to the staff room. Jail and ban are applied after the match, in `apply`, not by the chat function. `WARNMESSAGE` is the sentence the rule would rather say than the default. `SHOWWORDSTORC` at the top of the file forces the staff room to hear matches even when a rule did not ask. The sample turns that off, and turns tell-RC on per rule instead.

The sample's first rule logs, tells the RC, and replaces. The second logs, tells, and warns, with its own warning. Neither jails. A world that wants the filter to be a door edits the action. A world that wants it to be a record leaves it as log. The code will do either. The file is the opinion.

---

What the mouth will not do is argue.

A toall from a jailed level returns true, which means the packet was handled, and the sender's client is not corrected. They may think it went out. A PM from jail is corrected, because the function bothers to say so. A filtered toall becomes your own chat. A filtered PM becomes an admin line. The differences are the function boundaries, not a policy document. Read `msgPLI_TOALL` and `msgPLI_PRIVATEMESSAGE` side by side and the policy falls out: jail swallows a shout, jail answers a letter, warn eats both, and the staff list is the hole in the jail.

Ash carries the say path and the toall path far enough for a v2 client to talk. The rules file and the six verbs are the C++ house's full opinion. If speech misbehaves, the order to check is the level name against `jaillevels`, the flags on the recipient, the four seconds, the length, and only then the rule. Most swallowed sentences are the room, not the word.

The next room is the queue the mouth's packets fall into. Forty-eight kilobytes before a flush is forced, a warning at three megabytes, bzip2 above eight. The file send's other half.

---

*End of chapter 17.*
