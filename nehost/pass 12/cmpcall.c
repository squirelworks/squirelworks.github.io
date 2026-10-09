/* 16-bit only. A 32-bit compiler cannot call TB80CMP.DLL.
   Build from the course directory so the original packed DLL loads.
   Open Watcom: wcc -bt=windows -zls cmpcall.c
                 wlink system windows file cmpcall
*/

#include <windows.h>
#include <string.h>

typedef void (FAR PASCAL *EXPAND)(unsigned, unsigned, unsigned, unsigned);

static void save(const char *name, const char *buf, int n)
{
    int h = _lcreat(name, 0);
    if (h != -1) {
        _lwrite(h, (LPSTR)buf, n);
        _lclose(h);
    }
}

int PASCAL WinMain(HINSTANCE inst, HINSTANCE prev, LPSTR cmd, int show)
{
    HINSTANCE dll;
    EXPAND expand;
    char src[64];
    char dst[256];
    unsigned src_off, src_sel, dst_off, dst_sel;
    int i;

    (void)inst;
    (void)prev;
    (void)cmd;
    (void)show;

    for (i = 0; i < 256; i++) dst[i] = 0;
    lstrcpy(src, "to handle");

    dll = LoadLibrary("TB80CMP.DLL");
    if ((unsigned)dll < 32) {
        save("CMPERR.TXT", "load failed", 11);
        return 0;
    }
    expand = (EXPAND)GetProcAddress(dll, MAKEINTRESOURCE(3));
    if (!expand) {
        save("CMPERR.TXT", "ordinal 3 missing", 16);
        FreeLibrary(dll);
        return 0;
    }

    src_off = LOWORD((DWORD)(LPSTR)src);
    src_sel = HIWORD((DWORD)(LPSTR)src);
    dst_off = LOWORD((DWORD)(LPSTR)dst);
    dst_sel = HIWORD((DWORD)(LPSTR)dst);
    expand(src_off, src_sel, dst_off, dst_sel);
    save("CMPOUT.TXT", dst, 256);
    FreeLibrary(dll);
    return 0;
}
