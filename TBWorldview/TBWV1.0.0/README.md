# TBWV1.0.0

Printable documentation package for the ToolBook 8 reverse-engineering work.
Version 1.0.0 — snapshot taken 2026-10-11.

## Main directory
- `00_Index.pdf` — package map
- `01_Overview.pdf` — high-level status
- `02_Architecture.pdf` — runtime architecture
- `03_Naming_Progress.pdf` — function naming coverage
- Source Markdown: `ToolBook_Architecture.md`, `ToolBook_Chapter.md`, `naming_summary.md`, `toolbook_naming_progress.md`

## Subdirectories
- `Modules/tb80*_knownnames/` — confirmed renames and nameable lists per DLL (PDF + README.md + TSV where available)
- `BookFormat/` — on-disk record layouts and geometry
- `OpenScript/` — bytecode decoder
- `SoftICE/` — dynamic analysis notes
- `Runtimes/` — clean-room reader status

## Production
- `.production/TBWV1.0.0_printable.pdf` — single double-sided binder PDF (42 pages) with TOC, ToolBook directory listing, and blank pages so every major section starts on a recto page.

All PDFs are letter-size with headers/footers and are intended to be printed.
Generated 2026-10-11 from existing project notes and rename scripts.
