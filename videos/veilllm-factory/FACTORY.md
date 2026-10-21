# داتا عملائك بتروح فين لما تكلّم الـ AI؟

format: short (9:16, ~62s)     language: ar (Egyptian)     viewer: a developer or freelancer who runs an AI harness on client data

> Test run of `/yt-factory`: the VeilLLM Short rebuilt from scratch. The user's answers were simulated
> from the real VeilLLM decisions (see `examples/videos/veilllm/`). Findings are in `TEST-REPORT.md`.

## Steps
- [x] 0 Voice file: missing; simulated answer "skip for this video"
- [x] 1 Intake: Short, Egyptian Arabic, ~60s. Real story: friends wanted local LLMs for sensitive data, but local models are weaker than the cloud. Repo: github.com/h-f-fares/VeilLLM
- [x] 2 Research: youtube.com unreachable and yt-dlp missing, so `yt-viral` could not run. WebSearch only
- [x] 3 Angle: "Use the strongest cloud models without your clients' data leaving your machine" (A of 3)
- [x] 4 Packaging: title 9 of 10, on-screen hook text "الموديل شاف إيه؟"
- [x] 5 Hook: hook 1 of 5 (56, WORKABLE, The Reveal)
- [x] 6 Script: `vo-ar.txt`, approved with the user's own closing question
- [x] 7 Voice: existing setup reused (Gemini Pro TTS, Charon). Proof beat split into 3 lines + holds
- [x] 8 Look: "redacted file" (warm near-black, amber hero, red for leaks), Plex Arabic, 3-word captions. Existing demo recording reused
- [x] 9 Build and render: `veilllm-factory-ar.mp4` (62.7s), loudness normalised to -14.1 LUFS
- [x] 10 Shorts: n/a (the video is a Short)
- [x] 11 Publish pack: `youtube.md`. Thumbnail = frame 0
- [x] 12 Final approval (simulated)
- [x] 13 Learn: see Log

## Decisions
- **Angle:** استخدم أقوى موديلات الـ cloud من غير ما داتا عملائك تخرج من جهازك
- **Title:** داتا عملائك بتروح فين لما تكلّم الـ AI؟ (title.py 100/100, 39 chars, survives the mobile cut)
- **On-screen hook / thumbnail text:** الموديل شاف إيه؟
- **Hook:** كل مرة بتكلّم الـ AI، أسامي عملائك وإيميلاتهم بتخرج من جهازك. استنى للآخر، وهوريك الموديل بيشوف إيه بالظبط.
- **Closing question:** وانت؟ تثق في موديلات الـ cloud بداتا عملائك، ولا local بس حتى لو أضعف؟
- **Voice:** gemini-2.5-pro-preview-tts, Charon, Egyptian persona from `examples/scripts/gen-veilllm-vo-ar-gemini.py`
- **Palette:** bg #0B0907, hero #F2A93B, leak #F05252

## Sources
- 20-50 ms per request, masks names / emails / API keys, one `base_url` change, `pip install veil-llm`: the VeilLLM post, https://hfares.com/blog/veilllm-local-dlp-proxy-ai-harness/
- "4 entity(s) found in 23.8ms" on screen: the project's own Gradio playground (recording in `public/clips/demo.mp4`)
- DeepSeek exposed database (chat history, API keys), found by Wiz, disclosed Jan 2025: https://www.wiz.io/blog/wiz-research-uncovers-exposed-deepseek-database-leak
- Samsung engineers pasted confidential source code and meeting notes into ChatGPT, March 2023 (Economist Korea, via TechRadar): https://www.techradar.com/news/samsung-workers-leaked-company-secrets-by-using-chatgpt
- ChatGPT bug showed some users other users' chat titles, March 2023 (OpenAI post-mortem): https://openai.com/index/march-20-chatgpt-outage/
- Researched, not used in the script: 30% of 600+ developers entered secrets into a GenAI tool (Bitwarden 2024 survey, vendor source), https://bitwarden.com/resources/security-survey-developer-secrets-and-the-future-of-passkeys/

## Log
- The real-story question at intake kept the blog post's invented origin out of the script.
- Rushed proof beat: three sentences in one TTS call. Fixed with one line each plus holds; now `tools/vo.py`.
- Still pass caught 4 render bugs (Freeze blank, card overflow, word cues across scenes, camera gap).
- `review.mjs` caught captions below the safe line on every frame; moved from y 1400 to 1270.
- Weakest scene: the friends scene's first 6 s (only four small avatars enter; flagged as a dead stretch). Fix: give each friend a speech bubble on "صحابي".
- Rules proposed and added: one sentence per TTS line, phone numbers, hit in the pause, measured review.
- User feedback round 2: on-screen text too small to read on a phone, and the first seconds did not say what problem the tool solves. Fixed with the three-step problem at frame 0, large-print cards over the demo, and review.mjs failing text under 40px. Added a "why it matters" scene (3 sourced leak incidents + the cost of removing data by hand).
