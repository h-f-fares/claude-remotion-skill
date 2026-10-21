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
- [x] 9 Build and render: `out/veilllm-factory-ar.mp4`, loudness normalised to -14 LUFS
- [x] 10 Shorts: n/a (the video is a Short)
- [x] 11 Publish pack: `youtube.md`. Thumbnail = frame 0
- [x] 12 Final approval (simulated)

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
- Researched, not used in the script: 30% of 600+ developers entered secrets into a GenAI tool (Bitwarden 2024 survey, vendor source), https://bitwarden.com/resources/security-survey-developer-secrets-and-the-future-of-passkeys/
