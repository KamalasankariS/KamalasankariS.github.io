/* ============================================
   Portfolio Chatbot - Kamala Comics Edition
   Calls Cloudflare Worker proxy (keys hidden)
   Falls back to offline TF-IDF if proxy is down
   ============================================ */

(function () {
  'use strict';

  // ── Worker Proxy URL ──
  // CHANGE THIS after deploying your Cloudflare Worker
  var WORKER_URL = 'https://kamala-portfolio-chatbot.kamalaweb.workers.dev';

  // ── Chat history ──
  var chatMessages = [];

  // ── Call Worker Proxy ──
  async function callWorker(userMessage) {
    chatMessages.push({ role: 'user', content: userMessage });
    try {
      var response = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: chatMessages.slice(-10) })
      });
      if (response.ok) {
        var data = await response.json();
        if (data.answer) {
          chatMessages.push({ role: 'assistant', content: data.answer });
          return data.answer;
        }
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  // ── Offline TF-IDF Fallback ──
  var CHUNKS = [
    // ── Identity & Bio ──
    { id:'bio', text:'Kamalasankari Subramaniakuppusamy (Kamala Sankari) is an AI Engineer at The George Washington University specializing in LLM-powered and agentic AI systems. She designs and ships end-to-end workflows for multi-step decision-making, tool-driven execution, and production AI applications.', keywords:'who kamala about person bio introduction researcher engineer' },
    { id:'research_focus', text:'Kamala\'s research focuses on LLM reasoning, agentic workflows, explainable AI (XAI), model evaluation and monitoring, retrieval-augmented generation (RAG), and AI for software security. She builds systems that are reliable, interpretable, and grounded in real-world use cases.', keywords:'research interest focus area topic explainable trustworthy xai reasoning' },
    // ── Education ──
    { id:'ms', text:'Kamala is pursuing M.S. in Computer Science (Machine Intelligence and Cognition) at The George Washington University, Washington D.C. Expected graduation May 2026.', keywords:'masters graduate gwu george washington university education degree ms computer science' },
    { id:'be', text:'Kamala earned B.E. in Electronics and Communication Engineering from St. Joseph\'s College of Engineering, Chennai, India. Graduated April 2024.', keywords:'bachelors undergraduate india education college engineering electronics ece btech' },
    // ── Experience ──
    { id:'ga', text:'Graduate Assistant in Advanced Machine Learning at The George Washington University, September to December 2025. Supported ML model implementation and evaluation, guided students on model behavior, performance trade-offs, and evaluation techniques. Contributed to assignment and project design emphasizing reproducibility and evaluation rigor.', keywords:'graduate assistant work job experience gwu teaching machine learning mentor' },
    { id:'lillup', text:'AI Engineer Intern at Lillup, New York, May to November 2025. Built and shipped AI Voice Tutoring, Research Assistant, and Notetaking systems using RAG-based pipelines for voice-driven queries, automated summarization, and context-aware assistance. Engineered modular data pipelines and parsers for multi-format ingestion (JSON, XML, CSV, Parquet) supporting scalable retrieval and agentic AI workflows.', keywords:'lillup intern work job experience ai engineer rag voice tutoring pipeline' },
    // ── Projects ──
    { id:'fass', text:'FASS (Feature Attribution Stability Suite) is a comprehensive benchmark for evaluating post-hoc XAI method stability across perturbations on CIFAR-10, COCO, and ImageNet. Evaluates methods including Grad-CAM, Integrated Gradients, GradientSHAP, and LIME. Accepted at XAI4CV Workshop CVPR 2026. Co-authored with Jugal Gajjar. Technologies: Python, PyTorch, Explainable AI, Computer Vision.', keywords:'fass xai stability benchmark project cvpr attribution perturbation gradcam lime shap' },
    { id:'securefix', text:'SecureFixAgent is a hybrid LLM agent for automated Python static vulnerability repair. Pairs Bandit static analyzer with LLMs using multi-armed bandit optimization. Reduces false positives by 10.8%, improves fix accuracy by 13.51%, developer rating 4.5/5. Published at ICMLA 2025. Co-authored with Jugal Gajjar. Technologies: Python, LLMs, HuggingFace, Bandit.', keywords:'securefix securefixagent vulnerability repair bandit llm false positive project icmla python' },
    { id:'malcodeai', text:'MalCodeAI is an autonomous vulnerability detection and remediation system via language agnostic code reasoning. Dual-stage LLM pipeline integrating static analysis and exploit simulation across 14 programming languages. Uses Qwen2.5-Coder-3B with LoRA and MLX framework. Usefulness 8.06/10. Published at IEEE IRI 2025. Co-authored with Jugal Gajjar. Technologies: Python, LLMs, LoRA, MLX.', keywords:'malcodeai malware detection 14 languages qwen lora project ieee iri security' },
    { id:'multilang', text:'MLCPD (Multi-Language Code Parsing Dataset) is a large-scale unified dataset of parsed source code across 10 programming languages with a universal AST schema. Over 7 million parsed source files with 99.9999% conversion rate. Published on arXiv and hosted on HuggingFace. Co-authored with Jugal Gajjar. Technologies: Python, Tree-sitter, Apache Parquet.', keywords:'mlcpd multilang code parser dataset universal ast 10 languages hugging face project arxiv' },
    { id:'vulngraph', text:'Bridging Semantics and Structure for Software Vulnerability Detection Using Hybrid Network Models. Views programs as heterogeneous graphs capturing structural dependencies. Uses GNN plus LLM fusion for Java vulnerability detection achieving 93.57% accuracy, 17.81% above LLM baselines. Published at Complex Networks 2025. Co-authored with Jugal Gajjar and Kaustik Ranaware. Technologies: Python, Java, GNNs, PyTorch Geometric.', keywords:'vulngraph gnn vulnerability detection java accuracy graph neural network project complex networks hybrid' },
    { id:'hypercomplex', text:'HyperComplEx is a hybrid knowledge graph embedding framework adaptively combining hyperbolic, complex, and Euclidean spaces via learned attention mechanisms. Achieves up to 18% relative gain in MRR and 0.612 MRR on 10M-node CS graph with near-linear scalability. Published at IEEE Big Data 2025. Co-authored with Jugal Gajjar. Technologies: Python, PyTorch, Geometric Deep Learning.', keywords:'hypercomplex knowledge graph embedding hyperbolic complex euclidean mrr project ieee bigdata scalability' },
    { id:'yolo', text:'YOLO: Roof Material Detection Using Aerial Imagery. YOLOv8-based aerial imagery classification of roof materials for insurance and urban planning applications. Improved mAP by 32.5% over YOLOv5. Won Best Paper Award at IEEE ICCDS 2024. Technologies: Python, YOLOv8, Computer Vision.', keywords:'yolo roof aerial detection best paper award project ieee iccds computer vision map' },
    { id:'ledgerdesk', text:'LedgerDesk is an agentic financial operations copilot for transaction exception handling, policy-grounded case resolution, and auditable workflow automation. Orchestrates multi-step agentic workflows across 5 specialized agents and a 13-stage pipeline. Reduces manual triage time by ~70%. Uses RAG with confidence-based retrieval (>=0.85). Technologies: Next.js, FastAPI, PostgreSQL, Multi-Agent AI.', keywords:'ledgerdesk financial copilot agentic reconciliation project nextjs fastapi agent pipeline' },
    { id:'modelprobe', text:'ModelProbe is a framework-agnostic AI evaluation platform for testing AI/LLM systems with versioned runs and regression detection. Reduces manual regression identification time by 83%. Pip-installable Python SDK for trace-based instrumentation of multi-step agentic workflows. Reduces false regression flags by 57.7%. Technologies: Python, FastAPI, SDK.', keywords:'modelprobe evaluation testing regression project pip sdk platform' },
    { id:'greenshoes', text:'GreenShoes is a full-stack e-commerce platform for luxury sustainable footwear. React storefronts, Node.js/Prisma API, admin dashboard, built from scratch. Technologies: React, Node.js, Prisma, PostgreSQL.', keywords:'greenshoes ecommerce shoes sustainable fashion project react nodejs fullstack' },
    { id:'careerscout', text:'CareerScoutEuro is a European job search scraper and dashboard targeting AI/ML/SWE opportunities with currency comparison, university data, and Reddit community scraping. Technologies: Flask, Python, Web Scraping.', keywords:'careerscout career scout euro job search scraper dashboard project flask' },
    { id:'lillup_scribe', text:'Lillup Scribe is a cloud-powered file parser converting 20+ formats (docx, xlsx, pdf, epub, mp3, iWork) into standardized JSON schema for the Lillup Scribe iOS app. Technologies: Python, Cloud, File Parsing.', keywords:'lillup scribe file parser 20 formats json ios cloud project' },
    { id:'projects_all', text:'Kamala has 9 featured projects: FASS (XAI Stability Benchmark), SecureFixAgent (Vulnerability Repair), MalCodeAI (Malware Detection), MLCPD (MultiLang Code Parser), YOLO (Roof Detection), LedgerDesk (Financial AI), GreenShoes (E-commerce), CareerScoutEuro (Job Search), Lillup Scribe (File Parser). She also built ModelProbe (AI Evaluation SDK).', keywords:'project projects all list how many count total' },
    // ── Publications (individual) ──
    { id:'pub_fass', text:'Feature Attribution Stability Suite: How Stable Are Post-Hoc Attributions? Authors: Kamalasankari Subramaniakuppusamy, Jugal Gajjar. Accepted at XAI4CV Workshop, CVPR 2026. Benchmarks attribution stability of Grad-CAM, IG, GradientSHAP, LIME.', keywords:'fass publication paper cvpr 2026 xai attribution stability workshop' },
    { id:'pub_hypercomplex', text:'HyperComplEx: Adaptive Multi-Space Knowledge Graph Embeddings. Authors: Jugal Gajjar, Kaustik Ranaware, Kamalasankari Subramaniakuppusamy, Vaibhav Gandhi. Published IEEE Big Data 2025. 18% MRR gain, 0.612 MRR on 10M-node graph.', keywords:'hypercomplex publication paper ieee bigdata 2025 knowledge graph embedding' },
    { id:'pub_vulngraph', text:'Bridging Semantics and Structure for Software Vulnerability Detection Using Hybrid Network Models. Authors: Jugal Gajjar, Kaustik Ranaware, Kamalasankari Subramaniakuppusamy. Published Complex Networks 2025. 93.57% accuracy.', keywords:'vulngraph publication paper complex networks 2025 vulnerability detection' },
    { id:'pub_securefix', text:'SecureFixAgent: A Hybrid LLM Agent for Automated Python Static Vulnerability Repair. Authors: Jugal Gajjar, Kamalasankari Subramaniakuppusamy, Relsy Puthal, Kaustik Ranaware. Published ICMLA 2025. 10.8% fewer false positives, 13.51% better accuracy, 4.5/5 rating.', keywords:'securefixagent publication paper icmla 2025 vulnerability repair' },
    { id:'pub_malcode', text:'MalCodeAI: Autonomous Vulnerability Detection and Remediation via Language Agnostic Code Reasoning. Authors: Jugal Gajjar, Kamalasankari Subramaniakuppusamy, Noha El Kachach. Published IEEE IRI 2025. Covers 14 languages. Usefulness 8.06/10.', keywords:'malcodeai publication paper ieee iri 2025 code security 14 languages' },
    { id:'pub_mlcpd', text:'MLCPD: A Unified Multi-Language Code Parsing Dataset with Universal AST Schema. Authors: Jugal Gajjar, Kamalasankari Subramaniakuppusamy. Published arXiv cs.SE 2025. 7M+ parsed files, 10 languages. Available on HuggingFace.', keywords:'mlcpd publication paper arxiv 2025 code dataset universal ast' },
    { id:'pub_yolo', text:'YOLO: Roof Material Detection Using Aerial Imagery. Published IEEE ICCDS 2024. Won Best Paper Award. mAP improved 32.5% over YOLOv5.', keywords:'yolo publication paper ieee iccds 2024 roof best paper award' },
    { id:'pubs_all', text:'Kamala has 7 publications: FASS (CVPR 2026), HyperComplEx (IEEE Big Data 2025), VulnGraph (Complex Networks 2025), SecureFixAgent (ICMLA 2025), MalCodeAI (IEEE IRI 2025), MLCPD (arXiv 2025), YOLO (IEEE ICCDS 2024 Best Paper).', keywords:'publication paper research conference journal all list how many count total' },
    // ── Skills ──
    { id:'skills_prog', text:'Programming Languages: Python, SQL, TypeScript. Backend and Distributed Systems: Kafka, FastAPI, REST APIs, gRPC, Data Pipelines. Cloud and Tools: AWS, Docker, Kubernetes, CI/CD, GCP.', keywords:'skill skills tech stack tools programming python sql typescript backend cloud docker aws' },
    { id:'skills_ml', text:'ML and AI Frameworks: PyTorch, TensorFlow, NumPy, Pandas, LangChain, Scikit-learn. Applied AI: LLMs, Agentic Workflows, RAG, Model Evaluation and Monitoring, Explainable AI.', keywords:'skill skills framework pytorch tensorflow langchain numpy pandas llm rag agentic xai ml ai' },
    // ── Service & Personal ──
    { id:'reviewer', text:'Kamala serves as a peer reviewer for the ACL 2026 SURGeLLM Workshop, reviewing papers on structured understanding and reasoning in generative LLMs.', keywords:'reviewer peer review acl workshop service professional committee' },
    { id:'carnatic', text:'Kamala is a trained Carnatic singer with more than ten years of classical training. The discipline shaped her pattern recognition, precision, and patience in both music and research.', keywords:'carnatic singer music personal hobby classical training' },
    { id:'mentor', text:'Kamala mentors students on independent projects and early-stage research ideas as a Student Academic Assistant at GWU, helping them navigate from scoping problems to shipping results.', keywords:'mentor mentoring teaching students academic assistant guidance' },
    // ── Contact & Location ──
    { id:'contact', text:'Contact Kamala: Email kamalasankari@gwu.edu. GitHub: github.com/kamalasankaris. LinkedIn: linkedin.com/in/kamalasankari-s. Medium: medium.com/@kamalasankari. Open to research collaborations, PhD opportunities, and roles in LLM reasoning, explainable AI, and agentic systems.', keywords:'contact email github linkedin medium reach connect collaborate phd job opportunity' },
    { id:'location', text:'Kamala is from Chennai, India, currently based in Washington D.C. pursuing her M.S. at The George Washington University.', keywords:'location where from live based country city chennai india washington dc' },
    { id:'current', text:'Kamala is currently pursuing M.S. at GWU expected May 2026, based in Washington D.C. Her recent work includes FASS (CVPR 2026), LedgerDesk (agentic finance), and ModelProbe (AI evaluation SDK).', keywords:'currently now doing present today active working recent' },
  ];

  var STOPWORDS = new Set(['the','a','an','is','are','was','were','be','been','have','has','had','do','does','did','will','would','could','should','may','might','can','to','of','in','for','on','with','at','by','from','as','into','through','during','before','after','out','off','over','under','again','then','once','here','there','when','where','why','how','all','both','each','few','more','most','other','some','such','no','nor','not','only','own','same','so','than','too','very','just','now','his','her','its','our','your','their','he','she','it','we','you','they','me','him','us','them','my','this','that','these','those','what','which','who','and','but','if','or','because','while','about','up','down','also','tell','know','get','got','make','made','let','want','like','think','say','said','give','go','come','take','see','look','find','put','use','call','try','ask','feel','keep','show','explain','describe','elaborate','detail','kamala','please','really','actually','well','yeah','yes','ok']);

  function tokenize(t) {
    return t.toLowerCase().replace(/[^a-z0-9]/g,' ').split(/\s+/).filter(function(w) {
      return w.length > 2 && !STOPWORDS.has(w);
    });
  }

  function fallbackAnswer(query) {
    var qt = tokenize(query);
    if (qt.length === 0) return "Hey! I can answer questions about Kamala's projects, publications, education, experience, or skills!";
    var best = null, bestScore = 0;
    for (var i = 0; i < CHUNKS.length; i++) {
      var ct = tokenize(CHUNKS[i].text + ' ' + CHUNKS[i].keywords);
      var score = 0;
      for (var j = 0; j < qt.length; j++) {
        for (var k = 0; k < ct.length; k++) {
          if (qt[j] === ct[k]) score += 3;
          else if (qt[j].length > 4 && ct[k].indexOf(qt[j]) !== -1) score += 2;
          else if (ct[k].length > 4 && qt[j].indexOf(ct[k]) !== -1) score += 1;
        }
      }
      if (score > bestScore) { bestScore = score; best = CHUNKS[i]; }
    }
    if (best && bestScore >= 3) return best.text;
    return "I can only answer questions about Kamala's portfolio. Try asking about her projects, education, experience, or skills!";
  }

  // ── Public API ──
  async function askBot(query) {
    var s = query.toLowerCase().trim();
    if (/^(hi|hey|hello|sup|yo|hola|howdy|what'?s up|wassup)\s*[!?.]*$/.test(s))
      return "Hey there! Ask me anything about Kamala's projects, publications, education, experience, or skills!";
    if (/^(thanks?|thx|thank you|cheers)\s*[!?.]*$/.test(s))
      return "You're welcome! Feel free to ask me anything else about Kamala.";
    if (/^(bye|goodbye|see you|later|cya)\s*[!?.]*$/.test(s))
      return "See you! Check out Kamala's projects and publications!";

    var answer = await callWorker(query);
    if (answer) return answer;
    return fallbackAnswer(query);
  }

  // ── Determine asset path based on page depth ──
  var scripts = document.getElementsByTagName('script');
  var chatbotSrc = '';
  for (var i = 0; i < scripts.length; i++) {
    if (scripts[i].src && scripts[i].src.indexOf('chatbot.js') !== -1) {
      chatbotSrc = scripts[i].src; break;
    }
  }
  var assetPrefix = chatbotSrc.indexOf('../js/') !== -1 ? '../' : '';

  // ── Inject UI ──
  var chatHTML = '\
<div id="chatbot-fab" aria-label="Open chat">\
  <img src="' + assetPrefix + 'assets/icons/chatbot.svg" alt="Chat" />\
</div>\
<div id="chatbot-panel" class="chatbot-hidden">\
  <div id="chatbot-header">\
    <img src="' + assetPrefix + 'assets/icons/chatbot.svg" alt="" class="chatbot-header-icon" />\
    <span class="chatbot-header-title">ASK ME ANYTHING</span>\
    <button id="chatbot-close" aria-label="Close chat">&times;</button>\
  </div>\
  <div id="chatbot-messages">\
    <div class="chat-msg bot">\
      <div class="chat-bubble">Hey! I\'m Kamala\'s portfolio assistant. Ask me about her projects, publications, skills, or experience!</div>\
    </div>\
  </div>\
  <form id="chatbot-form">\
    <input id="chatbot-input" type="text" placeholder="Type a question..." autocomplete="off" />\
    <button type="submit" id="chatbot-send">GO</button>\
  </form>\
</div>';

  var chatContainer = document.createElement('div');
  chatContainer.id = 'chatbot-container';
  chatContainer.innerHTML = chatHTML;
  document.body.appendChild(chatContainer);

  // ── Random header color per page load ──
  var headerColors = ['#FF3CAC','#5EF2C2','#6EDCFF','#FFD93D','#B8FF3C','#FF5DA2','#3CF2FF','#FF3B3B'];
  var chatHeaderColor = headerColors[Math.floor(Math.random() * headerColors.length)];
  // Pick text color based on brightness
  var darkBgColors = ['#FF3CAC','#FF5DA2','#FF3B3B'];
  var chatHeaderTextColor = darkBgColors.indexOf(chatHeaderColor) !== -1 ? '#fff' : 'var(--ink)';

  // ── Inject Styles ──
  var chatCSS = document.createElement('style');
  chatCSS.textContent = '\
/* Chatbot FAB — no container, the SVG IS the button */\
#chatbot-fab {\
  position: fixed;\
  bottom: 75px;\
  right: 24px;\
  width: 70px;\
  height: 70px;\
  background: none;\
  border: none;\
  border-radius: 0;\
  box-shadow: none;\
  cursor: pointer;\
  z-index: 10000;\
  display: flex;\
  align-items: center;\
  justify-content: center;\
  transition: transform 0.2s ease;\
  filter: drop-shadow(3px 3px 0 rgba(26,26,26,0.7));\
}\
#chatbot-fab:hover {\
  transform: scale(1.15) rotate(-8deg);\
}\
#chatbot-fab img {\
  width: 70px;\
  height: 70px;\
}\
\
/* Panel */\
#chatbot-panel {\
  position: fixed;\
  bottom: 80px;\
  right: 30px;\
  width: 370px;\
  height: 480px;\
  border: 4px solid var(--ink);\
  border-radius: 8px;\
  background: var(--paper);\
  box-shadow: 6px 6px 0 var(--ink);\
  z-index: 10001;\
  display: flex;\
  flex-direction: column;\
  overflow: hidden;\
  transition: opacity 0.2s ease, transform 0.2s ease;\
}\
#chatbot-panel.chatbot-hidden {\
  opacity: 0;\
  transform: translateY(20px) scale(0.95);\
  pointer-events: none;\
}\
\
/* Header */\
#chatbot-header {\
  background: ' + chatHeaderColor + ';\
  padding: 10px 14px;\
  display: flex;\
  align-items: center;\
  gap: 10px;\
  border-bottom: 3px solid var(--ink);\
}\
.chatbot-header-icon {\
  width: 28px;\
  height: 28px;\
}\
.chatbot-header-title {\
  font-family: "Bangers", cursive;\
  font-size: 18px;\
  letter-spacing: 2px;\
  color: ' + chatHeaderTextColor + ';\
  flex: 1;\
  text-shadow: 1px 1px 0 rgba(0,0,0,0.3);\
}\
#chatbot-close {\
  background: none;\
  border: none;\
  color: ' + chatHeaderTextColor + ';\
  font-size: 24px;\
  cursor: pointer;\
  line-height: 1;\
  font-weight: bold;\
}\
#chatbot-close:hover {\
  color: var(--yellow);\
}\
\
/* Messages area */\
#chatbot-messages {\
  flex: 1;\
  overflow-y: auto;\
  padding: 14px;\
  display: flex;\
  flex-direction: column;\
  gap: 10px;\
  background-image: radial-gradient(circle, rgba(0,0,0,0.04) 1px, transparent 1px);\
  background-size: 10px 10px;\
}\
#chatbot-messages::-webkit-scrollbar { width: 5px; }\
#chatbot-messages::-webkit-scrollbar-thumb { background: var(--pink); border-radius: 3px; }\
\
/* Chat bubbles */\
.chat-msg { display: flex; }\
.chat-msg.bot { justify-content: flex-start; }\
.chat-msg.user { justify-content: flex-end; }\
.chat-bubble {\
  max-width: 80%;\
  padding: 10px 14px;\
  border-radius: 4px;\
  font-family: "Comic Neue", cursive;\
  font-size: 14px;\
  line-height: 1.45;\
  border: 2px solid var(--ink);\
  box-shadow: 2px 2px 0 var(--ink);\
  position: relative;\
}\
.chat-msg.bot .chat-bubble {\
  background: #fff;\
  color: var(--ink);\
}\
.chat-msg.user .chat-bubble {\
  background: var(--pink);\
  color: #fff;\
}\
\
/* Typing indicator */\
.chat-typing .chat-bubble::after {\
  content: "";\
  display: inline-block;\
  width: 4px; height: 4px;\
  background: var(--ink);\
  border-radius: 50%;\
  margin-left: 4px;\
  animation: chatDots 1s infinite;\
}\
@keyframes chatDots {\
  0%, 60% { opacity: 0.3; }\
  30% { opacity: 1; }\
}\
\
/* Input form */\
#chatbot-form {\
  display: flex;\
  border-top: 3px solid var(--ink);\
}\
#chatbot-input {\
  flex: 1;\
  padding: 12px 14px;\
  border: none;\
  outline: none;\
  font-family: "Comic Neue", cursive;\
  font-size: 14px;\
  background: #fff;\
}\
#chatbot-input::placeholder {\
  color: #aaa;\
  font-style: italic;\
}\
#chatbot-send {\
  padding: 12px 18px;\
  background: var(--yellow);\
  border: none;\
  border-left: 3px solid var(--ink);\
  font-family: "Bangers", cursive;\
  font-size: 16px;\
  letter-spacing: 2px;\
  color: var(--ink);\
  cursor: pointer;\
  transition: background 0.15s ease;\
}\
#chatbot-send:hover {\
  background: var(--pink);\
  color: #fff;\
}\
\
/* Mobile */\
@media (max-width: 500px) {\
  #chatbot-panel {\
    width: calc(100vw - 20px);\
    height: calc(100vh - 120px);\
    right: 10px;\
    bottom: 70px;\
  }\
  #chatbot-fab {\
    right: 12px;\
    bottom: 65px;\
    width: 60px;\
    height: 60px;\
  }\
  #chatbot-fab img { width: 60px; height: 60px; }\
}\
';
  document.head.appendChild(chatCSS);

  // ── Wire up interactions ──
  var fab = document.getElementById('chatbot-fab');
  var panel = document.getElementById('chatbot-panel');
  var closeBtn = document.getElementById('chatbot-close');
  var form = document.getElementById('chatbot-form');
  var input = document.getElementById('chatbot-input');
  var messagesEl = document.getElementById('chatbot-messages');
  var isOpen = false;

  function toggleChat() {
    isOpen = !isOpen;
    panel.classList.toggle('chatbot-hidden', !isOpen);
    fab.style.display = isOpen ? 'none' : 'flex';
    if (isOpen) input.focus();
  }

  fab.addEventListener('click', function (e) {
    e.stopPropagation();
    toggleChat();
  });

  closeBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    toggleChat();
  });

  function addMessage(text, role) {
    var div = document.createElement('div');
    div.className = 'chat-msg ' + role;
    div.innerHTML = '<div class="chat-bubble">' + escapeHTML(text) + '</div>';
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return div;
  }

  function escapeHTML(str) {
    var d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    e.stopPropagation();
    var q = input.value.trim();
    if (!q) return;
    input.value = '';

    addMessage(q, 'user');

    // Typing indicator
    var typing = document.createElement('div');
    typing.className = 'chat-msg bot chat-typing';
    typing.innerHTML = '<div class="chat-bubble">Thinking...</div>';
    messagesEl.appendChild(typing);
    messagesEl.scrollTop = messagesEl.scrollHeight;

    var answer = await askBot(q);
    typing.remove();
    addMessage(answer, 'bot');
  });

  // Prevent chatbot clicks from triggering comic.js burst effect
  chatContainer.addEventListener('click', function (e) {
    e.stopPropagation();
  });

})();
