#!/usr/bin/env python3
"""All ten sanity gates for index.html. Usage: gates.py <file>  ·  exit 0 = clean"""
import re, sys, subprocess, collections, html as H

P = sys.argv[1] if len(sys.argv) > 1 else "index.html"
t = open(P, encoding="utf-8").read()
js = re.search(r"<script>(.*)</script>", t, re.S).group(1)
css = re.search(r"<style>(.*?)</style>", t, re.S).group(1)
fails = []


def gate(n, name, ok, detail=""):
    n = str(n)
    print(f"{n:>3} {name:<26}{'OK' if ok else 'FAIL'}  {detail}")
    if not ok:
        fails.append(name)


# 1 brace balance — baseline is -1, not 0
bb = t.count("{") - t.count("}")
gate(1, "brace balance", bb == -1, f"{bb} (baseline -1)")

# 2 syntax
open("/tmp/_js.js", "w", encoding="utf-8").write(js)
r = subprocess.run(["node", "--check", "/tmp/_js.js"], capture_output=True, text=True)
gate(2, "node --check", r.returncode == 0, r.stderr.strip()[:120])

# 3 handlers
calls = set(re.findall(r"on(?:click|change|input)\s*=\s*[\"']?\s*([A-Za-z_$][\w$]*)\s*\(", t))
defs = set(re.findall(r"function\s+([A-Za-z_$][\w$]*)", js)) | set(
    re.findall(r"(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?(?:function|\()", js))
miss = sorted(c for c in calls if c not in defs)
gate(3, "handlers", not miss, f"{len(calls)} calls" + (f" missing {miss}" if miss else ""))

# 3b load-time smoke test — see smoke.js. Static analysis cannot see a function
# passed as a callback (G.map(vGauge)), which is exactly how the v163 dead-code
# removal passed every gate while breaking start-up.
r2 = subprocess.run(["node", "smoke.js", P], capture_output=True, text=True)
first = (r2.stdout.splitlines() or [""])[0]
gate("3b", "start-up smoke test", r2.returncode == 0, first.split(":", 1)[-1].strip()[:60])

# 4 CSS order — a media rule must not be overridden by a later base rule
def blocks(src):
    out, i = [], 0
    while True:
        m = re.compile(r"@media[^{]*\{").search(src, i)
        if not m:
            break
        d, j = 1, m.end()
        while d and j < len(src):
            d += (src[j] == "{") - (src[j] == "}")
            j += 1
        out.append((m.end(), j - 1))
        i = j
    return out

media_sel, base_after = set(), []
mb = blocks(css)
for s, e in mb:
    for sel in re.findall(r"([^{}]+)\{", css[s:e]):
        media_sel.add(sel.strip())
last_media_end = max((e for _, e in mb), default=0)
for sel in re.findall(r"([^{}@]+)\{", css[last_media_end:]):
    if sel.strip() in media_sel:
        base_after.append(sel.strip())
gate(4, "CSS order", not base_after, f"{len(base_after)} overridden" if base_after else "")

# 5 undefined tokens — every var(--x) needs a definition anywhere, fallback included
used = set(re.findall(r"var\(\s*(--[\w-]+)", css))
defined = set(re.findall(r"(--[\w-]+)\s*:", css))
undef = sorted(used - defined)
gate(5, "undefined tokens", not undef, str(undef) if undef else f"{len(used)} used")

# 6 token drift
root = re.search(r":root\s*\{(.*?)\}", css, re.S)
# Normalise shorthand: #fff and #FFFFFF are the same colour, but a string compare
# treated them as different — which hid 62 literal #fff outside :root.
def norm(h):
    h = h.lower().lstrip("#")
    if len(h) in (3, 4):
        h = "".join(c * 2 for c in h)
    return "#" + h[:6]
tokvals = {norm(v) for v in re.findall(r"#[0-9A-Fa-f]{3,8}", root.group(1))}
outside = {norm(h) for h in re.findall(r"#[0-9A-Fa-f]{3,8}", css.replace(root.group(0), ""))}
drift = sorted(outside & tokvals)
gate(6, "token drift", not drift, str(drift) if drift else "")

# 7 + 8 translations
I = re.search(r"const I18N\s*=\s*\[(.*?)\n\];", js, re.S)
pairs = re.findall(r'\[\s*"((?:[^"\\]|\\.)*)"\s*,\s*"((?:[^"\\]|\\.)*)"\s*\]', I.group(1))
keys = {a for a, _ in pairs}
tt = set(re.findall(r"tt\(\s*'((?:[^'\\]|\\.)*)'\s*\)", js)) | set(
    re.findall(r'tt\(\s*"((?:[^"\\]|\\.)*)"\s*\)', js))
gate(7, "translation coverage", not (tt - keys), f"{len(pairs)} pairs, {len(tt)} tt()")
dup = {k for k, v in collections.Counter(a for a, _ in pairs).items() if v > 1}
conflict = {k for k in dup if len({b for a, b in pairs if a == k}) > 1}
gate(8, "conflicting translations", not conflict, str(sorted(conflict)) if conflict else "")

# 9 source keys across the six registers
regs = ["TPL_SRC", "SRC_COVERS", "TERM_BIND", "SRC_STYLE", "SRC_DISP"]
def body(name):
    m = re.search(rf"const {name}\s*=\s*", js)
    if not m: return ""
    i = m.end(); open_ch = js[i]; close_ch = "]" if open_ch == "[" else "}"
    d, j = 0, i
    while j < len(js):
        if js[j] == open_ch: d += 1
        elif js[j] == close_ch:
            d -= 1
            if d == 0: return js[i:j+1]
        j += 1
    return js[i:]
found = {}
for rname in regs:
    b = body(rname)
    # keys appear either as k:'x' (TPL_SRC) or as bare / quoted object keys
    found[rname] = (set(re.findall(r"k\s*:\s*'([A-Za-z][A-Za-z0-9-]*)'", b))
                    | set(re.findall(r"'([A-Za-z][A-Za-z0-9-]*)'\s*:", b))
                    | set(re.findall(r"(?:^|[,{\n])\s*([A-Za-z][A-Za-z0-9]*)\s*:", b)))
# SRC_COVERS and TERM_BIND describe SOAP-slot coverage, so only encounter-scoped
# sources (g:'enc') apply to them; patient- and document-scoped sources do not.
tpl_body = body("TPL_SRC")
ENC = {k for k, g in re.findall(r"\{k:'([^']+)'[^}]*?g:'([^']+)'", tpl_body) if g == "enc"}
ALL = {k for k, _ in re.findall(r"\{k:'([^']+)'[^}]*?g:'([^']+)'", tpl_body)}
scope = {"SRC_COVERS": ENC, "TERM_BIND": ENC, "SRC_STYLE": ALL, "SRC_DISP": ALL}
gaps = {r: sorted(scope[r] - found[r]) for r in scope if scope[r] - found[r]}
gate(9, "source keys", not gaps, str(gaps)[:110] if gaps else f"{len(ALL)} sources, {len(ENC)} encounter-scoped")

# 11 component duplication — a new class must not restate geometry that an existing
#    cockpit class already owns. The point of a design system is that changing one
#    button changes every button; a parallel definition silently opts out of that.
PAIRS = [(".brgchip", ".chip"), (".brgin", ".tpledit input[type=text]")]
def props(sel):
    m = re.search(r"\n" + re.escape(sel) + r"\{([^}]*)\}", css, re.S)
    if not m:
        return set()
    return {p.split(":")[0].strip() for p in m.group(1).replace("\n", "").split(";") if ":" in p}
GEOM = {"padding", "border-radius", "font-size", "line-height", "font-weight", "display",
        "gap", "white-space", "align-items", "min-height"}
dups = []
for new_sel, base_sel in PAIRS:
    shared = props(new_sel) & props(base_sel) & GEOM
    if shared:
        dups.append(f"{new_sel} restates {sorted(shared)} from {base_sel}")
gate(11, "component duplication", not dups, "; ".join(dups))

# 10 Slovak leak
SK = re.compile("[ľĺŕôäťďňČčŠšŽžŤŇĎĽŔÔÄ]")
# I was matched against `js`, so its offsets are relative to the script block. Masking
# them straight onto `t` blanked an arbitrary stretch of HTML and left every I18N
# translation counted — the gate was reporting ~849 where the real figure was ~330.
JS0 = t.index(js)
scan = t
for pm in re.finditer(r'\[\s*"((?:[^"\\]|\\.)*)"\s*,\s*"((?:[^"\\]|\\.)*)"\s*\]', I.group(1)):
    s = JS0 + I.start(1) + pm.start(1)
    scan = scan[:s] + " " * (pm.end(2) - pm.start(1)) + scan[s + (pm.end(2) - pm.start(1)):]
dm = re.search(r"/\*\s*DEMO-CONTENT-START\s*\*/(.*?)/\*\s*DEMO-CONTENT-END\s*\*/", scan, re.S)
if dm:
    scan = scan[:dm.start(1)] + " " * (dm.end(1) - dm.start(1)) + scan[dm.end(1):]
hits = len(SK.findall(scan))
gate(10, "Slovak leak", hits == 0, f"{hits} hits (stage 4 pending)" if hits else "")

print("\nRESULT:", "ALL PASS" if not fails else "FAILED: " + ", ".join(fails))
sys.exit(1 if fails else 0)
