---
doc: demo-video-script
purpose: Screen-first recording; voiceover added after
updated: 2026-10-21
---

# Countermark demo — screen first, VO later

**Length target:** ~2:30–3:00  
**Record from:** http://localhost:3002/ (most up-to-date while Railway is down)  
**Method:** Silent screen capture first, then lay this VO in iMovie / CapCut / QuickTime.

## Before you hit record

- `npm run dev -- -p 3002` running; hard refresh; **Reset** if needed  
- Safari or Chrome (not Cursor’s browser)  
- Hide keys / Discord / personal mail  
- Optional: slight zoom for phone playback  

## Screen pass + voiceover (aligned)

| Time | On screen | Say (VO) |
|------|-----------|----------|
| **0:00–0:12** | Landing: logo, **Countermark**, In-memory badge, cream UI | Welcome to Countermark — an AI support for challenging unfair or incorrect invoices and bills. Corporate billing counts on you giving up. |
| **0:12–0:28** | Stay on hero / intake header | Countermark is counter-offensive infrastructure for consumers — paste or upload a notice, email or letter, and get a counter response you can email back. |
| **0:28–0:45** | **Quick paste sample** (or upload a sample PDF). Show paste box fill | You can copy and paste the content or upload a PDF or JPEG. |
| **0:45–1:00** | Type or tap a **Suggested** pill into **Your dispute**; pills light up | Then add your reasons for disputing it — there are suggested examples — then hit Analyze. |
| **1:00–1:25** | Click **Analyze dispute**. Hold on amber progress + status line under the button | The original email or letter along with your dispute reason are analysed by the Gemini model, which works live and gives you updates under the button — no black-box spinner. |
| **1:25–1:40** | Scroll into **Review & send**: diagnosis strip | The results of Gemini’s analysis along with guidance notes appear under the Review & send panel. |
| **1:40–1:55** | Point at **To** + confidence badge; click tone dial Level 1 → 2 → 3 | Gemini supplies a return address with an honest confidence badge, and a draft I can escalate. There is a tone dial — polite, assertive, or regulatory — which adjusts the text and tone of the return message. |
| **1:55–2:10** | **Advice** box + **Evidence checklist** | The advice box and evidence checklist tell me what to attach — cancellation proof, statements — so the reply is ironclad. |
| **2:10–2:25** | Scroll to **Email draft** textarea | The email draft panel shows you what Gemini has drafted for you. |
| **2:25–2:45** | **Portal mode** — show three chunks; Copy Chunk 1 | The bottom panel, Portal mode, is for companies that push you to a reply form rather than an email — giving you three chunks depending on character limits and tone of your reply. |
| **2:45–2:55** | **Helpful links** | At the bottom are Helpful links which take you to relevant regulatory or third-party advice sites. |
| **2:55–3:10** | **Copy full email** and/or **Send via Email** (status line under buttons) | You can then copy the final email and paste it into your email app, or send from the window if you have that enabled. Countermark never sends for me. |
| **3:10–3:25** | Brief on In-memory / disclaimer; end on logo or review card | Zero retention — the session and all data is wiped on reload. That is Countermark — your helpful AI support portal for disputed invoices or bills. |

## Continuous VO (copy into recorder if you prefer one take)

> Welcome to Countermark — an AI support for challenging unfair or incorrect invoices and bills.  
> Corporate billing counts on you giving up.  
>  
> Countermark is counter-offensive infrastructure for consumers — paste or upload a notice, email or letter, and get a counter response you can email back.  
>  
> You can copy and paste the content or upload a PDF or JPEG.  
> Then add your reasons for disputing it — there are suggested examples — then hit Analyze.  
>  
> The original email or letter along with your dispute reason are analysed by the Gemini model, which works live and gives you updates under the button — no black-box spinner.  
>  
> The results of Gemini’s analysis along with guidance notes appear under the Review & send panel.  
>  
> Gemini supplies a return address with an honest confidence badge, and a draft I can escalate.  
> There is a tone dial — polite, assertive, or regulatory — which adjusts the text and tone of the return message.  
>  
> The advice box and evidence checklist tell me what to attach — cancellation proof, statements — so the reply is ironclad.  
>  
> Portal mode solves tight web forms with short, full, and formal paste chunks.  
> The email draft panel shows you what Gemini has drafted for you.  
> The Portal panel is for companies that push you to a reply form rather than an email — three chunks depending on character limits and tone.  
>  
> At the bottom are Helpful links to relevant regulatory or third-party advice sites.  
>  
> You can copy the final email into your mail app, or use Send via Email if enabled. Countermark never sends for me.  
>  
> Zero retention — the session and all data is wiped on reload.  
> That is Countermark — your helpful AI support portal for disputed invoices or bills.

## Notes for the edit

- Analyze can take **30–90s** — leave that stretch in; it matches the “live updates” line.  
- Status line sits **under Analyze**, not bottom-left of the window.  
- If mailto doesn’t open in the recording, **Copy full email** + the status line still sells the handoff.

## Export

- 1080p horizontal; YouTube unlisted or Streamable  
- Title: `Countermark – Build With AI Basics demo`  
- Devpost: video URL + https://github.com/shielyule/Countermark (+ Railway when it’s back)
