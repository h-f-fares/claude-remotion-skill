# yt-* skills: source and Arabic changes

These eleven skills come from [Jakeschincariol/youtube-agent-skill](https://github.com/Jakeschincariol/youtube-agent-skill)
(MIT, see `YT-SKILLS-LICENSE`). Changes made here:

- **Voice file** is read from `.claude/youtube/voice.md` in this repo instead of `~/.claude/`, so it
  survives cloud sessions. Start from `.claude/youtube/voice.template.md`.
- **Arabic support** in the Python tools. `yt-script/arabic.py` holds the shared word lists and
  particle stripping (و / ف / ال / بال / لل). It covers MSA plus common Egyptian, Levantine and Gulf forms.
  - `hookscore.py`: Arabic specificity / address / stakes / curiosity lists, `؟`, and a 7-20 word
    brevity band (Arabic packs more into each word).
  - `hooks.json`: every formula has `match_ar` patterns, used by `hookscore.py` and `swipe.py`.
  - `title.py`, `chapters.py`, `deadair.py`: Arabic tokens, stop words and fillers, and Arabic retakes.
- English output is unchanged.
