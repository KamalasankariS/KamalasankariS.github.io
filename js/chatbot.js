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
    { id:'bio', text:'Kamala Sankari (Kamalasankari Subramaniakuppusamy) is an AI Engineer specializing in LLM-powered and agentic AI systems. She designs and ships end-to-end workflows for multi-step decision-making and tool-driven execution.', keywords:'who kamala about person bio introduction' },
    { id:'ms', text:'Kamala is pursuing M.S. in Computer Science (Machine Intelligence & Cognition) at The George Washington University, Washington D.C. Expected May 2026.', keywords:'masters graduate gwu george washington university education degree' },
    { id:'be', text:'Kamala earned B.E. in Electronics and Communication Engineering from St. Joseph\'s College of Engineering, Chennai, India. Graduated April 2024.', keywords:'bachelors undergraduate india education college engineering electronics' },
    { id:'ga', text:'Graduate Assistant in Advanced Machine Learning at GWU Sep-Dec 2025. Supported ML model implementation, guided students on model behavior and evaluation techniques.', keywords:'graduate assistant work job experience teaching' },
    { id:'lillup', text:'AI Engineer Intern at Lillup, New York, May-Nov 2025. Built AI Voice Tutoring, Research Assistant, and Notetaking systems using RAG-based pipelines. Engineered modular data pipelines for multi-format ingestion.', keywords:'lillup intern work job experience ai engineer' },
    { id:'fass', text:'FASS: Feature Attribution Stability Suite - How Stable Are Post-Hoc Attributions? Benchmarking XAI method stability across CIFAR-10, COCO, and ImageNet. Published at CVPR 2026.', keywords:'fass xai stability benchmark project cvpr' },
    { id:'securefix', text:'SecureFixAgent: A Hybrid LLM Agent for Automated Python Static Vulnerability Repair. Uses multi-armed bandit optimization. Published at ICMLA 2025.', keywords:'securefix securefixagent vulnerability repair project' },
    { id:'malcodeai', text:'MalCodeAI: Autonomous Vulnerability Detection and Remediation via Language Agnostic Code Reasoning. Two-phase LLM pipeline for malware classification. Published at IEEE IRI 2025.', keywords:'malcodeai malware detection project' },
    { id:'multilang', text:'MLCPD: A Unified Multi-Language Code Parsing Dataset with Universal AST Schema. 7M+ parsed source code records across 10 programming languages. Published on arXiv.', keywords:'mlcpd multilang code parser dataset project' },
    { id:'vulngraph', text:'Bridging Semantics & Structure for Software Vulnerability Detection Using Hybrid Network Models. Published at Complex Networks 2025.', keywords:'vulngraph vulnerability detection project' },
    { id:'hypercomplex', text:'HyperComplEx: Adaptive Multi-Space Knowledge Graph Embeddings combining Hyperbolic, Complex & Euclidean geometry. Published at IEEE Big Data 2025.', keywords:'hypercomplex knowledge graph project' },
    { id:'yolo', text:'YOLO: Roof Material Detection Using Aerial Imagery. YOLOv8-based classification for insurance and urban planning. Best Paper Award at IEEE ICCDS 2024.', keywords:'yolo roof aerial detection best paper award project' },
    { id:'ledgerdesk', text:'LedgerDesk: Agentic financial operations copilot for transaction exception handling and auditable workflow automation. Built with Next.js, FastAPI, PostgreSQL.', keywords:'ledgerdesk financial copilot project' },
    { id:'modelprobe', text:'ModelProbe: AI evaluation platform for testing AI/LLM systems with versioned runs and regression detection. Pip-installable Python SDK.', keywords:'modelprobe evaluation testing project' },
    { id:'greenshoes', text:'GreenShoes: Full-stack e-commerce platform for luxury sustainable footwear. React, Node.js, Prisma, PostgreSQL.', keywords:'greenshoes ecommerce shoes project' },
    { id:'careerscout', text:'CareerScoutEuro: European job search scraper and dashboard for AI/ML/SWE opportunities with currency comparison and Reddit scraping.', keywords:'careerscout career scout euro job search project' },
    { id:'lillup_scribe', text:'Lillup Scribe: Cloud-powered file parser converting 20+ formats (docx, xlsx, pdf, epub, mp3, iWork) into standardized JSON schema for an iOS app.', keywords:'lillup scribe file parser project' },
    { id:'skills', text:'Kamala\'s skills: Python, SQL, PyTorch, TensorFlow, LangChain, FastAPI, NumPy, Pandas, Docker, AWS, Kafka, Kubernetes, gRPC, REST APIs.', keywords:'skill skills tech stack tools programming' },
    { id:'applied_ai', text:'Kamala\'s AI specializations: LLMs, Agentic Workflows, RAG, Model Evaluation & Monitoring, Explainable AI.', keywords:'ai ml specialization llm rag agentic' },
    { id:'pubs', text:'Kamala has 7 publications: FASS (CVPR 2026), HyperComplEx (IEEE Big Data 2025), VulnGraph (Complex Networks 2025), SecureFixAgent (ICMLA 2025), MalCodeAI (IEEE IRI 2025), MLCPD (arXiv 2025), YOLO (IEEE ICCDS 2024 Best Paper).', keywords:'publication paper research conference journal' },
    { id:'contact', text:'Contact Kamala: Email kamalasankari@gwu.edu, GitHub kamalasankaris, LinkedIn kamalasankari-s, Medium @kamalasankari.', keywords:'contact email github linkedin reach connect' },
    { id:'reviewer', text:'Kamala is a peer reviewer for the ACL 2026 SURGeLLM Workshop.', keywords:'reviewer peer review acl workshop' },
    { id:'carnatic', text:'Kamala is a trained Carnatic singer with more than ten years of training.', keywords:'carnatic singer music personal hobby' },
    { id:'projects_all', text:'Kamala has 9 featured projects: FASS, SecureFixAgent, MalCodeAI, MultiLang Code Parser, YOLO Roof Detection, LedgerDesk, GreenShoes, CareerScoutEuro, Lillup Scribe.', keywords:'project projects all list' },
    { id:'current', text:'Kamala is currently pursuing M.S. at GWU, expected graduation May 2026. Based in Washington D.C.', keywords:'currently now doing present today' },
    { id:'location', text:'Kamala is from Chennai, India, currently based in Washington D.C. pursuing her M.S. at George Washington University.', keywords:'location where from live based country city' },
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
