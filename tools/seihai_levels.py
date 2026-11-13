"""Write the Seihai web demo's levels (seihai/levels/*.nw) and tile types (seihai/tiletypes.js).

The levels are laid out here by hand, in code. They use Graal's standard
pics1 tile ids, so any pics1 in that layout draws them; the site ships
Seihai's own original pics1.png. Tile types (which ids block walking) come
from the slot labels that make_pics1.py writes (out/slot-labels.json).

usage: python3 tools/seihai_levels.py <slot-labels.json>
"""
import json
import random
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / "seihai"
B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
N = 64

# --- tile kit (Graal pics1 ids) -------------------------------------------
GRASS = [0, 1, 0, 1, 0, 0, 1, 24]
PATH = [8, 15]
WATER = [286, 287]
BUSH, ROCK = 2, 34            # 2x2, top-left id
STUB, HOLE = 420, 677         # what a lifted bush / rock leaves
CHEST = 1784                  # 2x2 shut chest
FENCE_H = [17, 96]            # fence row
TREE = [[r * 16 + c for c in range(9, 15)] for r in range(1, 10)]   # 6 x 9
HOUSE = [                     # 12 x 10, door in columns 4-7
    [64, 65, 66, 67, 67, 67, 67, 67, 67, 67, 69, 70],
    [80, 81, 82, 83, 84, 84, 84, 84, 84, 83, 85, 86],
    [80, 81, 82, 84, 84, 84, 84, 84, 84, 84, 85, 86],
    [80, 81, 82, 83, 84, 84, 84, 84, 84, 83, 85, 86],
    [80, 97, 98, 99, 99, 99, 99, 99, 99, 99, 86, 86],
    [80, 113, 81, 81, 81, 81, 81, 81, 81, 81, 81, 86],
    [128, 129, 81, 81, 100, 101, 102, 103, 81, 81, 81, 86],
    [144, 145, 145, 145, 116, 117, 118, 119, 145, 145, 145, 145],
    [160, 161, 162, 163, 132, 133, 134, 135, 161, 162, 163, 163],
    [176, 177, 178, 179, 148, 149, 150, 151, 177, 178, 179, 179],
]
VOID = 632
BED = [[712, 713, 714], [728, 729, 730], [744, 745, 746]]
RUG = [[1308, 1309, 1310], [1324, 1325, 1326], [1340, 1341, 1342]]
WIN_L = [[1508, 1509], [1524, 1525]]
WIN_R = [[1504, 1505], [1520, 1521]]


class Level:
    def __init__(self, name, fill, seed):
        self.name = name
        self.rng = random.Random(seed)
        self.t = [[self.rng.choice(fill) for _ in range(N)] for _ in range(N)]
        self.extra = []

    def put(self, x, y, i):
        if 0 <= x < N and 0 <= y < N:
            self.t[y][x] = i

    def stamp(self, x, y, rows):
        for dy, row in enumerate(rows):
            for dx, i in enumerate(row):
                self.put(x + dx, y + dy, i)

    def obj(self, x, y, base):
        self.stamp(x, y, [[base, base + 1], [base + 16, base + 17]])

    def rect(self, x, y, w, h, ids):
        for yy in range(y, y + h):
            for xx in range(x, x + w):
                self.put(xx, yy, self.rng.choice(ids))

    def pond(self, x, y, w, h):
        self.rect(x - 1, y - 1, w + 2, h + 2, PATH)
        self.rect(x, y, w, h, WATER)

    def tree(self, x, y):
        self.stamp(x, y, TREE)

    def fence(self, x, y, w):
        for k in range(w):
            self.put(x + k, y, FENCE_H[k % 2])

    def link(self, dest, x, y, w, h, nx, ny):
        self.extra.append(f"LINK {dest} {x} {y} {w} {h} {nx} {ny}")

    def sign(self, x, y, *lines):
        self.extra.append(f"SIGN {x} {y}\n" + "\n".join(lines) + "\nSIGNEND")

    def chest(self, x, y, item):
        self.obj(x, y, CHEST)
        self.extra.append(f"CHEST {x} {y} {item} -1")

    def npc(self, x, y, text):
        self.extra.append(f"NPC - {x} {y}\nif (playertouchsme) {{\n  message {text};\n}}\nNPCEND")

    def write(self):
        out = ["GLEVNW01"]
        for y in range(N):
            out.append(f"BOARD 0 {y} {N} 0 " + "".join(B64[i >> 6] + B64[i & 63] for i in self.t[y]))
        out += self.extra
        (ROOT / "levels" / self.name).write_text("\n".join(out) + "\n")


def forest_edge(lv, sides):
    """Rows of overlapping trees along the named sides."""
    if "n" in sides:
        for x in range(-2, N, 6):
            lv.tree(x, -3)
    if "s" in sides:
        for x in range(-2, N, 6):
            lv.tree(x, N - 6)
    if "w" in sides:
        for y in range(-3, N, 5):
            lv.tree(-3, y)
    if "e" in sides:
        for y in range(-3, N, 5):
            lv.tree(N - 3, y)


def village():
    lv = Level("village.nw", GRASS, 1)
    forest_edge(lv, "nw")
    lv.rect(3, 30, 61, 3, PATH)            # road west to east
    lv.rect(30, 30, 3, 34, PATH)           # road south
    lv.rect(14, 19, 2, 11, PATH)           # house path
    lv.stamp(9, 9, HOUSE)                  # door at x 13-16, y 15-18
    lv.link("house.nw", 13, 19, 4, 1, 30, 40)
    lv.sign(18, 26, "Seihai village.", "East: the meadow.", "South: the old wood.")
    lv.put(18, 26, 17)
    # pond, fenced on the north
    lv.pond(38, 12, 14, 9)
    lv.fence(37, 10, 16)
    for x, y in [(24, 14), (26, 20), (44, 38), (50, 44), (12, 40), (20, 50)]:
        lv.obj(x, y, BUSH)
    for x, y in [(8, 24), (36, 24), (56, 26), (40, 52)]:
        lv.obj(x, y, ROCK)
    lv.chest(22, 40, "greenrupee")
    lv.npc(26, 34, "Welcome to Seihai. The house up the path is open")
    lv.link("meadow.nw", 63, 0, 1, 64, 1, "playery")
    lv.link("wood.nw", 0, 63, 64, 1, "playerx", 1)
    return lv


def meadow():
    lv = Level("meadow.nw", GRASS, 2)
    forest_edge(lv, "nes")
    lv.rect(0, 30, 40, 3, PATH)
    # a fenced paddock with flowers of bushes
    lv.fence(10, 8, 20)
    lv.fence(10, 22, 20)
    for y in range(8, 23):
        lv.put(10, y, 17)
        lv.put(29, y, 17)
    lv.put(19, 22, 0)
    lv.put(20, 22, 0)                     # gap to walk in
    for x, y in [(13, 11), (17, 13), (22, 11), (25, 16), (14, 17)]:
        lv.obj(x, y, BUSH)
    lv.chest(20, 15, "bombs")
    # a long lake to the south
    lv.pond(8, 40, 30, 12)
    lv.rect(38, 44, 12, 4, PATH)
    for x, y in [(42, 24), (48, 30), (34, 36), (52, 38)]:
        lv.obj(x, y, ROCK)
    lv.sign(4, 26, "The meadow.", "West: back to the village.")
    lv.put(4, 26, 17)
    lv.npc(44, 34, "Lift a bush with D, then press D again to throw it")
    lv.link("village.nw", 0, 0, 1, 64, 62, "playery")
    return lv


def wood():
    lv = Level("wood.nw", GRASS, 3)
    forest_edge(lv, "wes")
    # a wood of trees with a winding path down to a clearing
    for x, y in [(4, 8), (10, 14), (40, 4), (46, 10), (6, 24), (44, 22), (8, 36), (42, 36),
                 (14, 44), (36, 46), (22, 8), (50, 28)]:
        lv.tree(x, y)
    lv.rect(30, 0, 3, 14, PATH)
    lv.rect(20, 14, 13, 3, PATH)
    lv.rect(20, 14, 3, 18, PATH)
    lv.rect(20, 30, 14, 3, PATH)
    lv.rect(24, 36, 14, 10, PATH)          # clearing
    lv.chest(30, 39, "arrows")
    for x, y in [(26, 22), (34, 26), (16, 30)]:
        lv.obj(x, y, BUSH)
    for x, y in [(26, 42), (36, 42)]:
        lv.obj(x, y, ROCK)
    lv.sign(33, 4, "The old wood.", "North: back to the village.")
    lv.put(33, 4, 17)
    lv.npc(28, 40, "You found the clearing. The chest is yours")
    lv.link("village.nw", 0, 0, 64, 1, "playerx", 62)
    return lv


def house():
    lv = Level("house.nw", [VOID], 4)
    x0, y0, w, h = 18, 20, 28, 26           # outer size, walls 4 thick at sides
    xi0, xi1 = x0 + 4, x0 + w - 5           # floor columns
    yi0, yi1 = y0 + 4, y0 + h - 4           # floor rows
    alt = lambda a, b, k: a if k % 2 == 0 else b
    # top walls
    lv.put(x0, y0, 823)
    lv.put(x0 + w - 1, y0, 828)
    for x in range(x0 + 1, x0 + w - 1):
        lv.put(x, y0, alt(702, 703, x))
    lv.stamp(x0, y0 + 1, [[749, 824]])
    lv.stamp(x0 + w - 2, y0 + 1, [[827, 765]])
    for x in range(x0 + 2, x0 + w - 2):
        lv.put(x, y0 + 1, alt(719, 718, x))
    lv.stamp(x0, y0 + 2, [[749, 766, 825]])
    lv.stamp(x0 + w - 3, y0 + 2, [[826, 748, 765]])
    for x in range(x0 + 3, x0 + w - 3):
        lv.put(x, y0 + 2, alt(734, 735, x))
    lv.stamp(x0, y0 + 3, [[749, 750, 751, 868]])
    lv.stamp(x0 + w - 4, y0 + 3, [[869, 763, 764, 765]])
    for x in range(x0 + 4, x0 + w - 4):
        lv.put(x, y0 + 3, 742)
    # side walls and floor
    for y in range(yi0, yi1):
        lv.stamp(x0, y, [alt([749, 766, 767], [749, 750, 751], y) + [731]])
        lv.stamp(x0 + w - 4, y, [[762] + alt([747, 748, 765], [763, 764, 765], y)])
        for x in range(xi0, xi1 + 1):
            lv.put(x, y, 686 if (x + y) % 2 == 0 else 687)
    # bottom walls with the door in the middle
    yb = yi1
    lv.stamp(x0, yb, [[749, 766, 767, 884]])
    lv.stamp(x0 + w - 4, yb, [[885, 747, 748, 765]])
    for x in range(x0 + 4, x0 + w - 4):
        lv.put(x, yb, 831)
    dx = x0 + w // 2 - 2
    lv.stamp(x0, yb + 1, [[749, 750, 841]])
    lv.stamp(x0 + w - 3, yb + 1, [[842, 764, 765]])
    lv.stamp(x0, yb + 2, [[749, 840]])
    lv.stamp(x0 + w - 2, yb + 2, [[843, 765]])
    lv.put(x0, yb + 3, 839)
    lv.put(x0 + w - 1, yb + 3, 844)
    for x in range(x0 + 3, x0 + w - 3):
        lv.put(x, yb + 1, alt(778, 779, x))
    for x in range(x0 + 2, x0 + w - 2):
        lv.put(x, yb + 2, alt(794, 795, x))
    for x in range(x0 + 1, x0 + w - 1):
        lv.put(x, yb + 3, alt(810, 811, x))
    lv.stamp(dx, yb + 1, [[820, 821, 821, 822], [836, 837, 837, 838], [852, 853, 854, 855]])
    # windows, bed, rug, chest
    lv.stamp(x0, y0 + 8, WIN_L)
    lv.stamp(x0, y0 + 16, WIN_L)
    lv.stamp(x0 + w - 2, y0 + 8, WIN_R)
    lv.stamp(x0 + w - 2, y0 + 16, WIN_R)
    lv.stamp(xi0 + 1, yi0 + 1, BED)
    rug = [[RUG[0][0]] + [RUG[0][1]] * 8 + [RUG[0][2]]] + \
          [[RUG[1][0]] + [RUG[1][1]] * 8 + [RUG[1][2]] for _ in range(4)] + \
          [[RUG[2][0]] + [RUG[2][1]] * 8 + [RUG[2][2]]]
    lv.stamp(xi0 + 7, yi0 + 6, rug)
    lv.chest(xi1 - 3, yi0 + 1, "heart")
    lv.npc(xi0 + 12, yi0 + 4, "Make yourself at home. The chest by the wall is for you")
    lv.sign(xi0 + 5, yi0 + 1, "A quiet house.", "The door south goes back outside.")
    lv.link("village.nw", dx + 1, yb + 2, 2, 1, 14.5, 20)
    return lv


def tiletypes(labels_path):
    labels = json.loads(Path(labels_path).read_text())["labels"]
    blocked = []
    for key, (material, kind, transparent) in labels.items():
        c, r = map(int, key.split(","))
        if kind in ("wall", "fence"):
            blocked.append(r * 16 + (c % 16) + (c // 16) * 512)
    blocked.sort()
    runs, start = [], None
    for i, v in enumerate(blocked):
        if start is None:
            start = v
        if i + 1 == len(blocked) or blocked[i + 1] != v + 1:
            runs.append(f"{start}-{v}" if v != start else f"{v}")
            start = None
    (ROOT / "tiletypes.js").write_text(
        '"use strict";\n'
        "// Tile ids that block walking (walls and throw-through objects), in Graal's\n"
        "// pics1 layout. Written by tools/seihai_levels.py; do not edit by hand.\n"
        f'const BLOCKING = "{",".join(runs)}";\n')


if __name__ == "__main__":
    tiletypes(sys.argv[1])
    for make in (village, meadow, wood, house):
        make().write()
