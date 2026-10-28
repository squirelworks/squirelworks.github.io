# Chapter 28 — The Hook

A plugin is a Windows library that is allowed to be the account file.

`CPluginManager` loads only under `_WIN32`. `LoadPlugin` calls `LoadLibrary`, then `GetProcAddress` for `GetPluginI`. If either fails, the log says so and the function returns false. If both succeed, the plugin object is asked to `Initialize` with the server. The log line on success is misspelled, `Succesfully`, in the same family as chapter 22's `Cound`. The dump has the hook. It does not have a plugin beside it worth reading. Phoenix does not ship one. The room is furnished and empty, like `weapon_bytecode/`.

The two calls that matter are the ones chapter 14 already passed through.

`LoadAccount` walks the plugins. Each may write an account text. `PLUGIN_STOP` or `PLUGIN_STOP_EAT` returns that text immediately, and `loadAccount` will parse it instead of the file if the text is not empty. A plugin can invent a person. `SaveAccount` walks them with the finished `GRACC001` text. `PLUGIN_CONTINUE_EAT` or `PLUGIN_STOP_EAT` sets a flag. If the flag comes back true, the server does not write the file. A plugin can keep the person somewhere else, or swallow a save. The eat is the whole power. The file in `accounts/` is the truth only if no plugin ate it.

There is no Linux body. The functions compile, and `LoadPlugin` returns true without loading anything when it is not Windows. A wine-hosted Phoenix is the binary, so the Windows body is the one that runs if a library is handed to it. Ash has no plugin walk. An account on Ash is the file. An account on Phoenix is the file unless a library in the process says otherwise. If a person appears who is not in `accounts/`, or a save never lands, this is the chapter to remember before you blame the five-minute drum.

The hook is the last place the server lets another author into the person. The script, chapter 24, runs elsewhere. The plugin runs here, on load and save, and only if someone built it. The next annex is the catalog the chair was given, and which lines of it are real.

---

*End of chapter 28.*
