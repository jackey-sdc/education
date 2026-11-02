#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""回读校验：把生成的讲解音频转成文字，比对原稿，重点看数字读法。

为什么要这一步：写阿拉伯数字图的是字幕好看，但 30、2.8、103 这类
合成器到底念成「三十」还是「三零」，只有听回来才知道。

用法：python3 tools/check_pron.py u6_barchart
       python3 tools/check_pron.py u6_barchart --only s-single-4,s-read-6
"""
import json
import pathlib
import re
import subprocess
import sys
import tempfile
import wave

import numpy as np

HERE = pathlib.Path(__file__).parent.parent.resolve()

# 汉字数字读音的常见转写（whisper 输出常带这些）
CN = {"0": "零", "1": "一", "2": "二", "3": "三", "4": "四",
      "5": "五", "6": "六", "7": "七", "8": "八", "9": "九", "10": "十"}
D = "零一二三四五六七八九"


def to_cn(n: int) -> str:
    """整数转中文读法：28→二十八，103→一百零三，10296→一万零二百九十六，2.8 走 to_cn_num。"""
    if n == 0:
        return "零"
    U = ["", "十", "百", "千"]

    def four(x):                      # 0 < x < 10000
        s, zero = "", False
        for i in range(3, -1, -1):
            d = (x // 10 ** i) % 10
            if d:
                if zero and s:
                    s += "零"
                zero = False
                s += D[d] + U[i]
            elif s:
                zero = True
        return s

    if n < 10000:
        s = four(n)
    else:                             # 万级：10296 这类大数，u3 有
        w, r = divmod(n, 10000)
        s = four(w) + "万"
        if r:
            if r < 1000:
                s += "零"
            s += four(r)
    if s.startswith("一十"):           # 一十二 → 十二
        s = s[1:]
    return s


def to_cn_num(tok: str):
    """数字串 → 可能的中文读法列表"""
    out = [tok]
    if "." in tok:
        a, b = tok.split(".")
        out.append(to_cn(int(a)) + "点" + "".join(D[int(c)] for c in b))
        out.append("".join(D[int(c)] for c in a) + "点" + "".join(D[int(c)] for c in b))
    elif tok.isdigit():
        n = int(tok)
        out.append(to_cn(n))
        out.append("".join(D[int(c)] for c in tok))     # 逐位读法（如 四一班、三零）
    return out


def to_array(m4a: pathlib.Path):
    tmp = pathlib.Path(tempfile.gettempdir()) / "pron_check.wav"
    subprocess.run(["afconvert", "-f", "WAVE", "-d", "LEI16@16000", "-c", "1",
                    str(m4a), str(tmp)], check=True,
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    with wave.open(str(tmp), "rb") as w:
        arr = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16)
    return arr.astype(np.float32) / 32768.0


def norm(s):
    return re.sub(r"[，。！？、；：\s,?!;:]", "", s)


# ASR 会把同音字写错（零→灵/玲、十→时/实、二→两），按音比对，不按字比对
HOMO = str.maketrans({"灵": "零", "玲": "零", "伶": "零", "聆": "零",
                      "两": "二", "俩": "二", "贰": "二", "壹": "一",
                      "时": "十", "实": "十", "拾": "十", "石": "十"})


def main():
    unit = sys.argv[1]
    only = None
    if "--only" in sys.argv:
        only = set(sys.argv[sys.argv.index("--only") + 1].split(","))

    m = re.match(r"(u\d+)", unit)
    sn = m.group(1) if m else unit
    adir = HERE / "assets" / "audio" / sn
    man = json.loads((adir / "manifest.json").read_text(encoding="utf-8"))

    from faster_whisper import WhisperModel
    model = WhisperModel("small", device="cpu", compute_type="int8")

    ok, doubt, allnum = 0, [], set()
    for key, v in man.items():
        if only and key not in only:
            continue
        arr = to_array(adir / v["file"])
        segs, _ = model.transcribe(arr, language="zh", beam_size=5,
                                   initial_prompt="以下是小学数学课堂讲解。")
        got = norm("".join(s.text for s in segs))
        got_n = got.translate(HOMO)        # 同音字归一后再比对数字
        want = norm(v["say"])
        # 抽出原稿里的数字，看回读结果里是否以汉字形式出现
        nums = re.findall(r"\d+(?:\.\d+)?", v["say"])
        allnum.update(nums)
        flag = "✓"
        # 全文比对太严（识别本身有误差），只核查「数字是否被念出来」
        miss = []
        for n in nums:
            if n in got:
                continue                       # 识别也输出阿拉伯数字，算读到了
            if not any(c and c in got_n for c in to_cn_num(n)):
                miss.append(n)
        if miss:
            flag = "?"
            doubt.append((key, miss, got, v["say"]))
        else:
            ok += 1
        print(f"  {flag} {key:14s} {got[:46]}")
        if miss:
            print(f"      原稿：{v['say'][:46]}")
            print(f"      未确认读到：{miss}")

    print(f"\n共 {ok + len(doubt)} 条，数字确认读到 {ok} 条，存疑 {len(doubt)} 条")
    if doubt:
        print("存疑清单：", [d[0] for d in doubt])
        print("\n注意：识别模型本身有误差，存疑不等于读错，建议人工听这几条：")
        for k, miss, got, want in doubt:
            print(f"  · {k}（{miss}）")
    print("出现过的数字：", " ".join(sorted(allnum, key=lambda x: float(x))))


if __name__ == "__main__":
    main()
