#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
讲解音频 demo 生成器 —— 用真实课件讲解文案做 A/B 对比

三个可调杠杆（收益从大到小）：
  ① 文案：书面语 → 口语（不改引擎也能明显变自然）
  ② 断句与重读：句读处插留白（呼吸），关键数字单独降速（重音）
  ③ 引擎/音色：系统规则合成 → 神经语音

用法：
    python3 make_demo.py           # 生成全部试听片段
    python3 make_demo.py --probe   # 只打印时长/响度表
"""
import asyncio
import array
import json
import math
import pathlib
import re
import shutil
import subprocess
import sys
import wave

import edge_tts

HERE = pathlib.Path(__file__).parent.resolve()
CLIPS = HERE / "clips"
TMP = HERE / ".tmp"

TARGET_RMS_DB = -19.0        # 统一响度（有声帧）
PEAK_CEIL = 0.96             # 峰值上限，防削波

# name -> (engine, voice, rate, pitch)
VOICES = {
    "xiaoxiao": ("edge", "zh-CN-XiaoxiaoNeural", "-10%", "+0Hz"),
    "xiaoyi":   ("edge", "zh-CN-XiaoyiNeural",   "-8%",  "+0Hz"),
    "yunxi":    ("edge", "zh-CN-YunxiNeural",    "-10%", "+0Hz"),
    "yunyang":  ("edge", "zh-CN-YunyangNeural",  "-8%",  "+0Hz"),
    "system":   ("say",  "Tingting",             "",     ""),
    "yushu":    ("say",  "语舒",                  "",     ""),
    "yushu":    ("say",  "语舒",                  "",     ""),
}

# 同一内容的两种写法
BOOK = "选一格代表 5 人，纵轴画到 30 就够了。28 人占 5 格多一点。"
SPOKEN = "咱们先定一件事：一格，代表几个人？定 5 个吧。纵轴画到 30，就够了。你看，28 人，正好是 5 格多一点。"

FLOW_BOOK = ("那一格 10 人呢？只有 2.8 格，零点几格根本读不准。"
             "所以单位要选得合适。数量没变，是格子变了。")
FLOW_SPOKEN = ("那要是一格代表 10 个人呢？28 人，就只剩 2.8 格了。"
               "零点几格，谁读得准啊。所以啊，一格代表几个人，得挑。"
               "你注意看：人数一个没变，变的是格子。")

# id, voice, text, 用断句留白, 重读片段, 标签, 分组
CLIP_DEFS = [
    ("a0_system",      "system",   BOOK,   False, [],                  "婷婷 · 系统语音（现状）",     "引擎"),
    ("a2_yushu",       "yushu",    BOOK,   False, [],                  "语舒 · 换名字还是同一个声音",         "引擎"),
    ("a1_xiaoxiao",    "xiaoxiao", BOOK,   False, [],                  "晓晓 · 默认参数",           "引擎"),
    ("b1_teach",       "xiaoxiao", BOOK,   True,  [],                  "晓晓 · 加留白",             "调法"),
    ("b2_teach_noPau", "xiaoxiao", BOOK,   False, [],                  "晓晓 · 只用标点（对照）",     "调法"),
    ("b3_emp_off",     "xiaoxiao", SPOKEN, True,  [],                  "口语＋留白（无重读）",       "调法"),
    ("b4_emp_on",      "xiaoxiao", SPOKEN, True,  ["5 个吧", "5 格多一点"], "口语＋留白＋数字重读",    "调法"),
    ("c1_yunxi",       "yunxi",    BOOK,   True,  [],                  "云希 · 男声活泼",           "音色"),
    ("c2_yunyang",     "yunyang",  BOOK,   True,  [],                  "云扬 · 男声稳重",           "音色"),
    ("c3_xiaoyi",      "xiaoyi",   BOOK,   True,  [],                  "晓伊 · 女声轻快",           "音色"),
    ("d1_book",        "xiaoxiao", BOOK,   True,  [],                  "书面文案（原句）",           "文案"),
    ("d2_spoken",      "xiaoxiao", SPOKEN, True,  [],                  "口语文案（改写）",           "文案"),
    ("e1_flow_book",   "xiaoxiao", FLOW_BOOK,   True, [],              "长段 · 书面",               "连贯"),
    ("e2_flow_spoken", "xiaoxiao", FLOW_SPOKEN, True, [],              "长段 · 口语",               "连贯"),
]

# 标点 → 其后留白（毫秒）。教学场景偏慢，句号后给足换气时间。
GAP = {"，": 300, ",": 300, "、": 200, "；": 420, "：": 380,
       "。": 620, "？": 620, "！": 620, ".": 620, "?": 620}
EMPH_GAP_BONUS = 200          # 重读片段后额外留白
EMPH_RATE = "-26%"            # 重读片段语速
EMPH_PITCH = "+3Hz"


def split_phrases(text):
    """按标点切短语，返回 [(phrase, gap_ms), ...]，末尾不留白"""
    parts = re.split(r"(?<=[，。？！；：、,.?!;:])", text.strip())
    out = [(p.strip(), GAP.get(p.strip()[-1], 0)) for p in parts if p.strip()]
    if out:
        out[-1] = (out[-1][0], 0)
    return out


def to_wav(src, dst):
    subprocess.run(["afconvert", "-f", "WAVE", "-d", "LEI16@24000", "-c", "1",
                    str(src), str(dst)], check=True,
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def normalize(wav_path):
    """按有声帧 RMS 归一到 TARGET_RMS_DB，并守住峰值"""
    with wave.open(str(wav_path), "rb") as w:
        params = w.getparams()
        a = array.array("h")
        a.frombytes(w.readframes(w.getnframes()))

    # 以 20ms 为一帧，取能量高于 -45dB 的帧算 RMS（跳过留白）
    sr, win = params.framerate, int(params.framerate * 0.02)
    voiced = []
    for i in range(0, len(a) - win, win):
        seg = a[i:i + win]
        r = math.sqrt(sum(x * x for x in seg) / win) / 32768
        if r > 0.0056:                       # ≈ -45 dBFS
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


async def synth_edge(text, voice, rate, pitch, dst):
    await edge_tts.Communicate(text, voice, rate=rate, pitch=pitch).save(str(dst))


def synth_say(text, voice, dst):
    # 不传 --data-format：aiff 容器只认 BEI16，传 LEI16 会报 "fmt?"
    subprocess.run(["say", "-v", voice, "-o", str(dst), text], check=True)


async def build_clip(cid, vname, text, use_pauses, emp):
    engine, voice, rate, pitch = VOICES[vname]
    phrases = split_phrases(text) if use_pauses else [(text, 0)]
    segs = []
    for i, (ph, gap) in enumerate(phrases):
        hot = any(e in ph for e in emp)
        ext = "mp3" if engine == "edge" else "aiff"
        raw, wav = TMP / f"{cid}_{i}.{ext}", TMP / f"{cid}_{i}.wav"
        if engine == "edge":
            await synth_edge(ph, voice, EMPH_RATE if hot else rate,
                             EMPH_PITCH if hot else pitch, raw)
        else:
            synth_say(ph, voice, raw)
        to_wav(raw, wav)
        segs.append((wav, gap + (EMPH_GAP_BONUS if hot else 0)))

    with wave.open(str(segs[0][0]), "rb") as w0:
        params = w0.getparams()
    frames = []
    for wav, gap in segs:
        with wave.open(str(wav), "rb") as w:
            frames.append(w.readframes(w.getnframes()))
        if gap:
            frames.append(b"\x00\x00" * int(params.framerate * gap / 1000))
    merged = TMP / f"{cid}.wav"
    with wave.open(str(merged), "wb") as out:
        out.setparams(params)
        for f in frames:
            out.writeframes(f)

    normalize(merged)
    dst = CLIPS / f"{cid}.m4a"
    subprocess.run(["afconvert", "-f", "m4af", "-d", "aac", "-b", "64000",
                    str(merged), str(dst)], check=True,
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    return dst


def stats(path):
    tmp = TMP / "_probe.wav"
    to_wav(path, tmp)
    with wave.open(str(tmp), "rb") as w:
        n, sr = w.getnframes(), w.getframerate()
        a = array.array("h")
        a.frombytes(w.readframes(n))
    peak = max(abs(x) for x in a) / 32768
    win = int(sr * 0.02)
    voiced = [sum(x * x for x in a[i:i + win]) / win
              for i in range(0, len(a) - win, win)]
    voiced = [v for v in voiced if v > 0.0056 ** 2 * 32768 ** 2]
    rms = math.sqrt(sum(voiced) / len(voiced)) / 32768 if voiced else 0
    return n / sr, peak, 20 * math.log10(rms + 1e-9)


async def main():
    for d in (CLIPS, TMP):
        if not d.exists():
            d.mkdir(parents=True)
    meta = []
    for cid, vname, text, pauses, emp, label, group in CLIP_DEFS:
        dst = await build_clip(cid, vname, text, pauses, emp)
        sec, peak, rms_db = stats(dst)
        kb = dst.stat().st_size // 1024
        meta.append(dict(id=cid, label=label, group=group, sec=round(sec, 2),
                         kb=kb, peak=round(peak, 3), rms=round(rms_db, 1),
                         text=text, emp=emp))
        print(f"✓ {cid:15s} {sec:6.2f}s {kb:4d}KB  peak={peak:.2f} rms={rms_db:5.1f}dB  {label}")
    shutil.rmtree(TMP, ignore_errors=True)
    (HERE / "clips.json").write_text(
        json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")

    bad = [m["id"] for m in meta if m["peak"] > 0.99 or not (-24 <= m["rms"] <= -14)]
    print(f"\n共 {len(meta)} 条 / {sum(m['sec'] for m in meta):.1f}s / "
          f"{sum(m['kb'] for m in meta)}KB")
    print("异常:", bad or "无（响度已统一、无削波）")


if __name__ == "__main__":
    if "--probe" in sys.argv:
        for p in sorted(CLIPS.glob("*.m4a")):
            s, pk, r = stats(p)
            print(f"{p.stem:16s}{s:6.2f}s  peak={pk:.2f} rms={r:5.1f}dB")
    else:
        asyncio.run(main())
