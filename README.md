# kamalasankaris.github.io

Personal portfolio of **Kamalasankari Subramaniakuppusamy** — AI Engineer, GWU MSCS 2026.
Live at → [kamalasankaris.github.io](https://kamalasankaris.github.io)

---

## Overview

A multi-page portfolio styled as a **comic book** — complete with a comic cover loader, panel-based mosaic dashboard, halftone textures, speed lines, custom cursor trail, sound effects, and page-flip project cards. Built entirely with vanilla HTML, CSS, and JavaScript; no frameworks, no build step.

---

## Pages

| Page | Title | Description |
|---|---|---|
| **Home** | Comic Portfolio | Full-viewport mosaic dashboard with hero panel, projects, experience, publications, and contact panels. Comic book loader with barcode easter egg. |
| **About** | Off The Clock | 5-card grid: AI Researcher, Best Paper Awardee, Peer Reviewer, Carnatic Singer, Mentoring. |
| **Experience** | The Origin Panels | Timeline with 3 roles: Lillup AI Engineer Intern, GWU Graduate Assistant, GWU Technical Support. |
| **Projects** | The Archives | 9 flip-card project covers organized in 3 volumes (Research/AI, Web/Full-Stack, Industry). |
| **Publications** | Hall of Papers | 7 publications with Paper, Repo, and Details links. |
| **CV** | The Dossier | Newsstand with 2 comic-book-cover downloads: Resume and Research CV on a wooden shelf. |
| **Contact** | Find Me Here | Social links (GitHub, LinkedIn, Medium, Email, Google Scholar). |

Each project and publication has its own detail page under `projects/` and `pubs/`.

---

## Publications

- **Feature Attribution Stability Suite: How Stable Are Post-Hoc Attributions?** — *CVPR 2026*
- **HyperComplEx: Adaptive Multi-Space Knowledge Graph Embeddings** — *IEEE Big Data 2025*
- **Bridging Semantics & Structure for Software Vulnerability Detection Using Hybrid Network Models** — *Complex Networks 2025*
- **SecureFixAgent: A Hybrid LLM Agent for Automated Python Static Vulnerability Repair** — *ICMLA 2025*
- **MalCodeAI: Autonomous Vulnerability Detection and Remediation via Language Agnostic Code Reasoning** — *IEEE IRI 2025*
- **MLCPD: A Unified Multi-Language Code Parsing Dataset with Universal AST Schema** — *arXiv 2025*
- **YOLO: Roof Material Detection Using Aerial Imagery** — *IEEE ICCDS 2024* · **Best Paper Award**

---

## Features

- **Comic Book Loader** — Issue #001 cover with barcode easter egg (tap 3x for a secret panel)
- **AI Chatbot** — Retro TV icon triggers a comic-styled chatbot powered by Groq LLaMA 3.1 via Cloudflare Worker proxy, with offline TF-IDF fallback
- **Sound Effects** — Click/hover SFX via Web Audio API, toggleable
- **Custom Cursor** — Ink dot with rainbow trailing dots
- **Page Transitions** — Fade-out/fade-in between pages
- **3D Tilt** — Panels and cards tilt toward mouse on hover
- **Click Bursts** — Colorful comic-style burst animation on every click
- **Flip Cards** — Project covers flip to reveal details, repo links, and project pages
- **Random Chatbot Colors** — Chat header picks a random comic palette color per page load

---

## Structure

```
kamalasankaris.github.io/
├── index.html              # Home — mosaic dashboard
├── about.html              # About — card grid
├── experience.html         # Experience — timeline
├── projects.html           # Projects — flip cards
├── pubs.html               # Publications — paper list
├── resume.html             # CV — newsstand downloads
├── contact.html            # Contact — social links
├── projects/               # 9 individual project detail pages
├── pubs/                   # 7 individual publication detail pages
├── css/
│   ├── comic.css           # Core comic theme (variables, cursor, panels, cards, nav)
│   ├── pages.css           # Inner-page overrides and shared components
│   └── project-detail.css  # Project detail page styling
├── js/
│   ├── comic.js            # Loader, cursor, tilt, bursts, nav, SFX, scroll reveal
│   └── chatbot.js          # AI chatbot (UI, Groq proxy, TF-IDF fallback)
├── worker/                 # Cloudflare Worker (not deployed to GitHub)
│   ├── worker.js           # Groq API proxy with key rotation
│   └── wrangler.toml       # Wrangler deploy config
└── assets/
    ├── resume.pdf
    ├── research-cv.pdf
    ├── best-paper-award.pdf
    ├── speed-lines.svg
    ├── icon-resume.svg
    ├── icon-research.svg
    └── icons/              # SVG icons (GitHub, LinkedIn, Scholar, chatbot, etc.)
```

---

## Deployment

The site is deployed via **GitHub Pages** from the `main` branch root. No build step required.

The chatbot backend is deployed as a **Cloudflare Worker** (free tier) at `kamala-portfolio-chatbot.kamalaweb.workers.dev`. The `worker/` directory is gitignored to keep API keys private.

To run locally:

```bash
git clone https://github.com/kamalasankaris/kamalasankaris.github.io.git
cd kamalasankaris.github.io
npx serve .
```

---

## Contact

- **Email** — kamalasankari@gwu.edu
- **LinkedIn** — [linkedin.com/in/kamalasankari-s](https://www.linkedin.com/in/kamalasankari-s)
- **GitHub** — [github.com/kamalasankaris](https://github.com/kamalasankaris)
- **Medium** — [@kamalasankari](https://medium.com/@kamalasankari)

---

*Open to research collaborations, PhD opportunities, and interesting problems in LLM reasoning, explainable AI, and agentic systems.*
