# Chapter 27 — Three Bans

A ban is not one thing. The archive has three, and they fail in different rooms.

The first is the address, and it is checked in the hall. `config/ipbans.txt` is loaded as lines. `isIpBanned` walks them and asks `ip.match`. A line may be an address or a pattern the match understands, the same match `isAdminIp` uses on `IPRANGE`. The check is in `msgPLI_LOGIN`, after the socket exists and before the body. If the remote address matches and the account does not have `PLPERM_MODIFYSTAFFACCOUNT`, the client is told it is banned and the socket drops. The staff-account bit is the hole. Chapter 4 watched it walk through. An owner can sit in from a banned address. Everyone else cannot. `/reloadipbans` exists so the file can change without a restart. The five-minute drum also reloads it. A ban you added and did not reload is a ban the hall has not read.

The second is the account, and it is a field. `BANNED 1`, `BANREASON`, `BANLENGTH`, in the block below the blank line of `GRACC001`. The login tests the flag after the file has loaded. A banned account is told and dropped, unless that same staff bit is set. A ban on a person and a ban on an address are different files. Clearing one does not clear the other. An account ban follows the name. An IP ban follows the socket. A person who makes a new account on a banned address meets the first. A banned person on a new address meets the second.

The third is the filter, and it is a verb. Chapter 17's rule actions include jail and ban as bits, `0x10` and `0x20`, applied in `apply` after a match. Jail is a warp into a name on `jaillevels`, the room whose mouth was pointed at the staff list. Ban from the filter is the account flag being set because a sentence matched, which is a ban the chat path caused and the account file will keep if a save happens. A rule that says ban and a line in `ipbans.txt` are not the same lever. One listens to words. One listens to addresses.

`IPRANGE` is the inverse door. It is not a ban. It is the list of addresses a staff account may use for the chair, checked by `isAdminIp` with the same match. `*.*.*.*` on a new package leaves the chair open. A real range leaves it open from home. The login's RC check wants staff and this match, or the wide-open string. A person can be allowed in the grass from anywhere and allowed in the chair only from one pattern. The bit and the range and the staff line are three keys, and chapter 7 already said a missing one is a chair that does not move.

Ash checks the staff line and can refuse a banned account. The IP file and the match are the part to compare if an address that Phoenix refuses is allowed in on 14812. The next annex is the hook that can steal the account file before any of these tests see it.

---

*End of chapter 27.*
