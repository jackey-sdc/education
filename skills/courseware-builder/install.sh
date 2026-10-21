#!/usr/bin/env bash
# 把 courseware-builder skill 安装/同步到 Codex 技能目录，使其可被自动发现。
#
#   bash install.sh              # 同步到 ~/.codex/skills/courseware-builder
#   SKILLS_DIR=/path bash install.sh   # 同步到指定目录
#
# 仓库（本目录）是唯一真源；每次改动 skill 后重跑本脚本同步。
# scripts/self_check.py 会检测"仓库源 vs 安装副本"的漂移。
set -euo pipefail

SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILLS_DIR="${SKILLS_DIR:-${HOME}/.codex/skills}"
NAME="$(basename "${SRC}")"
DEST="${SKILLS_DIR}/${NAME}"

mkdir -p "${SKILLS_DIR}"

if [ -e "${DEST}" ] && [ ! -L "${DEST}" ]; then
  echo "→ 同步到 ${DEST}"
  rsync -a --delete --exclude '.git' --exclude '__pycache__' "${SRC}/" "${DEST}/"
else
  echo "→ 安装到 ${DEST}"
  rm -rf "${DEST}"
  cp -R "${SRC}" "${DEST}"
fi

# 校验
if [ -f "${DEST}/SKILL.md" ]; then
  FRONT="$(awk '/^name:/{print $2; exit}' "${DEST}/SKILL.md" || true)"
  if [ "${FRONT}" = "${NAME}" ]; then
    echo "✅ 已安装：${DEST}（name: ${FRONT}）"
  else
    echo "❌ SKILL.md 的 name 字段（${FRONT}）与目录名（${NAME}）不一致"
    exit 1
  fi
else
  echo "❌ 安装后缺少 SKILL.md"
  exit 1
fi

echo "ℹ️  新开一个 Codex 会话即可发现该 skill；当前会话需重启才能加载。"
