#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
讲解音频生成器 —— 把 narr.js 里的 say 合成成「每拍一条音频」

输入：<unit>/narr.js       （say / sub / emp 三个字段，emp 可选）
输出：assets/audio/<短名>/<小节>-<拍序>.m4a
      assets/audio/<短名>/manifest.json   （每拍时长，供引擎兜底与自检）

用法：
    python3 tools/tts_build.py u6_barchart            # 合成（会跳过未改动的）
    python3 tools/tts_build.py u6_barchart --force    # 全部重合成
    python3 tools/tts_build.py u6_barchart --probe    # 只打印时长表
    python3 tools/tts_build.py u6_barchart --rate 48000

三条处理规则（来自 audio_demo 实测）：
    ① 标点后插留白：逗号 300ms / 顿号 200ms / 句号 620ms
    ② emp 片段独立成段、降速 26%、后置留白 200ms（重读）
    ③ 有声帧响度归一到 -19 dBFS，峰值守 0.96 防削波
"""
import asyncio
import array
import hashlib
import json
import math
import pathlib
import re
import shutil
import subprocess
import sys
import tempfile
import wave

HERE = pathlib.Path(__file__).parent.parent.resolve()      # grade4_math_2026/
AUDIO_ROOT = HERE / "assets" / "audio"

VOICE = "zh-CN-XiaoxiaoNeural"
RATE = "-10%"                 # 课堂语速比默认慢一档
PITCH = "+0Hz"
BITRATE = 64000
SEG_VERSION = 3        # 切分/留白规则版本，变了就让旧音频缓存失效

TARGET_RMS_DB = -19.0
PEAK_CEIL = 0.96

GAP = {"，": 300, ",": 300, "、": 280, "；": 420, "：": 380,
       "。": 620, "？": 620, "！": 620, ".": 620, "?": 620, "!": 620}
EMPH_RATE = "-26%"
EMPH_GAP_AFTER = 200


def short_name(unit: str) -> str:
    """u6_barchart -> u6"""
    m = re.match(r"(u\d+)", unit)
    return m.group(1) if m else unit


# ---------------------------------------------------------------- 提取脚本
def extract_steps(unit_dir: pathlib.Path):
    """用 node 执行 narr.js，把 window.NARR 的 steps 导出来。
    比正则可靠：能正确处理引号、模板串和方法定义。"""
    narr = unit_dir / "narr.js"
    if not narr.exists():
        raise SystemExit(f"找不到 {narr}")
    js = r"""
const fs = require('fs');
const code = fs.readFileSync(process.argv[1], 'utf8');
global.window = { MOD: {} };
global.Narrator = { boot: (l) => l };
eval(code);
const out = window.NARR.map(s => ({
  sec: s.sec,
  steps: s.steps.map(st => ({ beat: st.beat, say: st.say || '', sub: st.sub || '', emp: st.emp || [] }))
}));
process.stdout.write(JSON.stringify(out));
"""
    r = subprocess.run(["node", "-e", js, str(narr)],
                       capture_output=True, text=True)
    if r.returncode != 0:
        raise SystemExit("narr.js 解析失败：\n" + r.stderr)
    return json.loads(r.stdout)


# ---------------------------------------------------------------- 切段
def segment(say: str, emp):
    """切成 [(文本, 后置留白ms, 是否重读)]。

    切分点包含顿号——实测过「不切顿号、交给引擎连读」，结果
    「28、22、18、12、6」被念成一串「282218126」，学生听不出是五个数。
    列举宁可切碎一点，也必须让人听清是几个数。

    重读按整段判定，不按 emp 边界硬切——否则「正好 / 5 格多一点」
    会变成两次独立合成再拼接，中间语调是断的。
    """
    say = say.strip()
    emp = emp or []
    cuts = {0, len(say)}
    for m in re.finditer(r"[，。？！；：、,?!;:]", say):
        cuts.add(m.end())
    cuts = sorted(c for c in cuts if 0 <= c <= len(say))

    segs = []
    for a, b in zip(cuts, cuts[1:]):
        txt = say[a:b].strip()
        if not txt:
            continue
        gap = GAP.get(txt[-1], 0)
        # 保险：纯标点段并入上一段的留白
        if not re.sub(r"[，。？！；：、,?!;:]", "", txt):
            if segs:
                segs[-1] = (segs[-1][0], segs[-1][1] + gap, segs[-1][2])
            continue
        hot = any(e in txt for e in emp)
        segs.append((txt, gap, hot))
    if segs:                                   # 末尾不留白
        segs[-1] = (segs[-1][0], 0, segs[-1][2])
    return segs


# ---------------------------------------------------------------- 音频工具
def to_wav(src, dst):
    subprocess.run(["afconvert", "-f", "WAVE", "-d", "LEI16@24000", "-c", "1",
                    str(src), str(dst)], check=True,
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def trim_silence(wav_path, keep_ms=45, thresh_db=-42.0):
    """裁掉段首尾静音，只保留 keep_ms。

    不裁的后果：每段 edge-tts 输出首尾各带几百毫秒静音，拼接后静音累积，
    一拍能凭空多出 3~5 秒，整段讲解显得拖沓。
    """
    import numpy as np
    with wave.open(str(wav_path), "rb") as w:
        params = w.getparams()
        raw = w.readframes(w.getnframes())
    arr = np.frombuffer(raw, dtype=np.int16)
    if arr.size == 0:
        return
    thr = 32768 * 10 ** (thresh_db / 20)
    idx = np.where(np.abs(arr) > thr)[0]
    if idx.size == 0:
        return
    keep = int(params.framerate * keep_ms / 1000)
    a = max(0, int(idx[0]) - keep)
    b = min(arr.size, int(idx[-1]) + keep + 1)
    with wave.open(str(wav_path), "wb") as w:
        w.setparams(params)
        w.writeframes(arr[a:b].tobytes())


def normalize(wav_path):
    with wave.open(str(wav_path), "rb") as w:
        params = w.getparams()
        a = array.array("h")
        a.frombytes(w.readframes(w.getnframes()))
    sr, win = params.framerate, int(params.framerate * 0.02)
    voiced = []
    for i in range(0, len(a) - win, win):
        seg = a[i:i + win]
        r = math.sqrt(sum(x * x for x in seg) / win) / 32768
        if r > 0.0056:                         # ≈ -45 dBFS
            voiced.append(r * r)
    if not voiced:
        return
    rms = math.sqrt(sum(voiced) / len(voiced))
    gain = 10 ** (TARGET_RMS_DB / 20) / max(rms, 1e-9)
    peak = max(abs(x) for x in a) / 32768
    gain = min(gain, PEAK_CEIL / max(peak, 1e-9))
    for i, x in enumerate(a):
        a[i] = max(-32768, min(32767, int(x * gain)))
    with wave.open(str(wav_path), "wb") as w:
        w.setparams(params)
        w.writeframes(a.tobytes())


async def synth(text, rate, dst, retry=3):
    import edge_tts
    last = None
    for n in range(retry):
        try:
            await edge_tts.Communicate(text, VOICE, rate=rate, pitch=PITCH).save(str(dst))
            if dst.stat().st_size > 512:
                return
            last = "文件过小，疑似空音频"
        except Exception as e:                 # noqa: BLE001
            last = e
        await asyncio.sleep(1.2 * (n + 1))
    raise RuntimeError(f"合成失败（{text[:20]}…）：{last}")


# ---------------------------------------------------------------- 主流程
async def build(unit: str, force: bool, bitrate: int):
    unit_dir = HERE / unit
    sn = short_name(unit)
    out_dir = AUDIO_ROOT / sn
    tmp = pathlib.Path(tempfile.gettempdir()) / f"tts_build_{sn}"
    for d in (out_dir, tmp):
        if not d.exists():
            d.mkdir(parents=True)

    secs = extract_steps(unit_dir)
    manifest, cached, made, total_bytes = {}, 0, 0, 0

    for s in secs:
        key = s["sec"].lstrip("#").replace(" ", "_")
        for i, st in enumerate(s["steps"], 1):
            name = f"{key}-{i}"
            dst = out_dir / f"{name}.m4a"
            sig = hashlib.md5(
                json.dumps([st["say"], st["emp"], RATE, VOICE, bitrate, SEG_VERSION],
                           ensure_ascii=False).encode()).hexdigest()[:10]
            side = out_dir / f"{name}.sig"

            if not force and dst.exists() and side.exists() and side.read_text() == sig:
                cached += 1
            else:
                segs = segment(st["say"], st["emp"])
                pieces, params = [], None
                for k, (txt, gap, hot) in enumerate(segs):
                    raw = tmp / f"{name}_{k}.mp3"
                    wav = tmp / f"{name}_{k}.wav"
                    await synth(txt, EMPH_RATE if hot else RATE, raw)
                    to_wav(raw, wav)
                    trim_silence(wav)          # 先裁静音，再拼接，否则一拍凭空多 3~5s
                    if params is None:
                        with wave.open(str(wav), "rb") as w0:
                            params = w0.getparams()
                    with wave.open(str(wav), "rb") as w:
                        pieces.append(w.readframes(w.getnframes()))
                    tail = gap + (EMPH_GAP_AFTER if hot else 0)
                    if tail and k < len(segs) - 1:
                        pieces.append(b"\x00\x00" * int(params.framerate * tail / 1000))

                merged = tmp / f"{name}.wav"
                with wave.open(str(merged), "wb") as out:
                    out.setparams(params)
                    for p in pieces:
                        out.writeframes(p)
                normalize(merged)
                subprocess.run(["afconvert", "-f", "m4af", "-d", "aac",
                                "-b", str(bitrate), str(merged), str(dst)],
                               check=True, stdout=subprocess.DEVNULL,
                               stderr=subprocess.DEVNULL)
                side.write_text(sig)
                made += 1

            total_bytes += dst.stat().st_size
            manifest[name] = {
                "file": f"{name}.m4a",
                "sec": s["sec"],
                "beat": st["beat"],
                "dur": probe_dur(dst),
                "say": st["say"],
                "emp": st["emp"],
            }

    (out_dir / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    # 中间文件留在系统临时目录，不占仓库、也不触发批量删除保护

    total_sec = sum(m["dur"] for m in manifest.values())
    print(f"\n{unit} → {out_dir.relative_to(HERE)}")
    print(f"  {len(manifest)} 拍 | 新合成 {made} 条 / 复用 {cached} 条")
    print(f"  语音时长 {total_sec:.1f}s（{total_sec/60:.1f} 分钟）")
    print(f"  音频体积 {total_bytes/1024:.0f} KB | 内联 base64 后约 "
          f"{total_bytes*1.34/1024:.0f} KB")
    bad = [k for k, m in manifest.items() if m["dur"] < 0.6]
    if bad:
        print(f"  ⚠️ 疑似空音频：{bad}")
    return manifest


def probe_dur(path: pathlib.Path) -> float:
    r = subprocess.run(["afinfo", str(path)], capture_output=True, text=True)
    m = re.search(r"estimated duration:\s*([\d.]+)\s*sec", r.stdout)
    return round(float(m.group(1)), 2) if m else 0.0


async def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    flags = [a for a in sys.argv[1:] if a.startswith("--")]
    if not args:
        raise SystemExit(__doc__)
    unit = args[0]
    bitrate = BITRATE
    if "--bitrate" in flags:
        bitrate = int(flags[flags.index("--bitrate") + 1]) if len(flags) > flags.index("--bitrate") + 1 else bitrate

    if "--probe" in flags:
        mp = AUDIO_ROOT / short_name(unit) / "manifest.json"
        if not mp.exists():
            raise SystemExit(f"没有找到 {mp}，先跑一次生成")
        man = json.loads(mp.read_text(encoding="utf-8"))
        for k, m in man.items():
            print(f"{k:16s} {m['dur']:6.2f}s  {m['beat']:4s}  {m['say'][:34]}")
        print(f"\n共 {len(man)} 拍 / {sum(x['dur'] for x in man.values()):.1f}s")
        return

    await build(unit, force="--force" in flags, bitrate=bitrate)


if __name__ == "__main__":
    asyncio.run(main())
