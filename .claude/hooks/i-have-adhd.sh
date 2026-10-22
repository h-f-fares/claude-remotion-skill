#!/usr/bin/env sh
# SessionStart hook: loads the i-have-adhd skill (vendored from
# https://github.com/ayghri/i-have-adhd @ 1ecea19) into every session.
skill="${CLAUDE_PROJECT_DIR:-.}/.claude/skills/i-have-adhd/SKILL.md"
[ -f "$skill" ] || exit 0
printf 'ADHD MODE ACTIVE (always-on). The ruleset below applies to every response. If the reader said "stop adhd mode" or "normal mode" earlier in this session, stay off.\n\n'
awk 'NR == 1 && /^---/ { fm = 1; next } fm && /^---/ { fm = 0; next } !fm' "$skill"
