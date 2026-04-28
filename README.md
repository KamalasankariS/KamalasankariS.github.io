# kamalasankaris.github.io

Personal portfolio of **Kamalasankari Subramaniakuppusamy** — AI researcher, GWU MSCS 2026.  
Live at → [kamalasankaris.github.io](https://kamalasankaris.github.io)

---

## Overview

A single-page portfolio styled as a **Mac OS 8/9 desktop** (Y2K aesthetic) — complete with a boot sequence, Finder-style window chrome, sidebar navigation, a functional menu bar with clock, and desktop icons. Built entirely with vanilla HTML, CSS, and JavaScript; no frameworks, no build step.

---

## Sections

| Section | Description |
|---|---|
| **Home** | Introduction, research focus, experience, and quick-access cards for projects and publications |
| **About** | Education, awards, and work experience |
| **Projects** | Six research projects with descriptions, tech stack tags, and venue labels |
| **Publications** | Six peer-reviewed papers with venue and metadata |
| **Resume / CV** | Download links for Resume PDF and Research CV PDF |
| **Contact** | Links to LinkedIn, GitHub, Google Scholar, ResearchGate, Medium, and email |

---

## Research Highlights

**Publications**

- **FASS**: Faithfulness & Attribution Stability Score for Post-Hoc XAI Methods — *CVPR 2026*
- **HyperComplEx**: Multi-Space Knowledge Graph Embeddings via Hyperbolic, Complex & Euclidean Geometry — *IEEE 2025*
- **VulnGraph**: AST/CFG + LLM Fusion for Multi-Language Vulnerability Detection — *Complex Networks 2025* · Accuracy 93.57%
- **SecureFixAgent**: Autonomous Vulnerability Repair via LLM + Bandit Optimization — *ICMLA 2025* · +13.5% patch success
- **MalCodeAI**: Two-Phase LLM Pipeline for Semantic Malware Detection — *IEEE IRI 2025*
- **YOLO Roof**: Aerial Roof Material Classification from Aerial Imagery — *IEEE ICCDS 2024* · **Best Paper Award**

---

## Structure

```
kamalasankaris.github.io/
├── index.html          # All sections in a single file
├── css/
│   ├── y2k.css         # Mac OS 8/9 desktop theme
│   └── notebook.css    # Secondary stylesheet
├── js/
│   ├── y2k.js          # Boot sequence, navigation, menu bar, clock
│   ├── notebook.js     # Notebook interaction logic
│   ├── Turn.js         # Page-turn effect library
│   └── Jquery.js       # jQuery
└── assets/
    ├── kamala-photo.jpg
    ├── resume.pdf
    ├── profile.png
    └── icons/          # SVG icons (LinkedIn, GitHub, Scholar, etc.)
```

---

## Design

The interface replicates Mac OS 9's Finder: platinum window chrome, a menu bar with an Apple menu and live clock, a sidebar labelled **FAVORITES**, desktop icons on the right rail, and a Trash icon pinned to the bottom. A boot splash — complete with the classic Happy Mac face and a loading bar — plays on first load.

Navigation is handled entirely in JavaScript; all sections live in `index.html` and are shown or hidden on selection. No routing library or bundler is involved.

---

## Deployment

The site is deployed via **GitHub Pages** from the `main` branch root. No build step is required — push changes to `main` and they go live immediately.

To run locally:

```bash
git clone https://github.com/kamalasankaris/kamalasankaris.github.io.git
cd kamalasankaris.github.io
# Open index.html directly in a browser, or use any static file server:
npx serve .
```

---

## Contact

- **Email** — iamkamalamskls@gmail.com
- **LinkedIn** — [linkedin.com/in/kamalasankari-s](https://www.linkedin.com/in/kamalasankari)  
- **GitHub** — [github.com/kamalasankaris](https://github.com/kamalasankaris)  
- **Google Scholar** — [scholar.google.com](https://scholar.google.com/citations?user=QQtmt1wAAAAJ&hl=en)

---

*Open to research collaborations, PhD opportunities, and interesting problems in LLM reasoning, explainable AI, and agentic systems.*