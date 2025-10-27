(()=>{(function(){let l={async callGeminiAPIWithSystemPrompt(e,t){if(!this.apiKey||!t)throw new Error("Missing API key or user prompt");if(!this.pageContent&&(this.pageStatus.textContent="\u26A0\uFE0F Re-analyzing page before generating content...",await this.getAndCachePageContent(),!this.pageContent))throw new Error("Could not get page content to generate content.");let n=[{role:"user",parts:[{text:e},{text:t}]}],a=await chrome.runtime.sendMessage({action:"callGeminiAPI",payload:{contents:n},apiKey:this.apiKey});if(a.success&&a.data?.candidates?.[0]?.content?.parts?.[0]?.text)return a.data.candidates[0].content.parts[0].text;throw new Error(a.error||"The AI gave an empty or invalid response.")}};window.TabTalkAPI=l})();(function(){let l={async getStorageItem(e){try{let t=await chrome.storage.local.get([e]);return t?t[e]:void 0}catch(t){console.error("getStorageItem error:",t);return}},async setStorageItem(e,t){try{return await chrome.storage.local.set({[e]:t}),!0}catch(n){return console.error("setStorageItem error:",n),!1}},async loadState(){try{let e=await chrome.storage.local.get(["geminiApiKey","apiKey"]);if(console.log("TabTalk AI: Loading state, API key exists:",!!e.geminiApiKey),(e.geminiApiKey||e.apiKey)&&(this.apiKey=e.geminiApiKey||e.apiKey,console.log("TabTalk AI: API key loaded successfully"),this.apiKeyInput&&(this.apiKeyInput.value=this.apiKey)),this.currentTab){let t=new URL(this.currentTab.url);this.currentDomain=t.hostname,this.pageTitle&&(this.pageTitle.textContent=this.currentTab.title||"Untitled Page",console.log("TabTalk AI: Page title set to:",this.pageTitle.textContent))}return e}catch(e){throw console.error("Failed to load state:",e),e}},async saveState(){this.apiKey&&await chrome.storage.local.set({geminiApiKey:this.apiKey})},async saveApiKey(e){this.apiKey=e;try{await chrome.storage.local.set({geminiApiKey:e,apiKey:e,hasSeenWelcome:!0}),console.log("TabTalk AI: API key saved")}catch{await this.setStorageItem("apiKey",e),await this.setStorageItem("hasSeenWelcome",!0)}},async handleDeleteApiKey(){if(confirm("Delete your API key? You will need to set it up again."))try{await chrome.storage.local.remove(["geminiApiKey","apiKey"]),this.apiKey=null,this.apiKeyInput&&(this.apiKeyInput.value=""),this.pageContent=null,this.updateQuickActionsVisibility&&this.updateQuickActionsVisibility(),this.messagesContainer&&(this.messagesContainer.innerHTML=""),await this.setStorageItem("hasSeenWelcome",!1),this.showView("welcome"),console.log("TabTalk AI: API key deleted")}catch(e){console.error("Error deleting API key:",e),alert("Error deleting API key. Please try again.")}},async getSavedContent(){return await this.getStorageItem("savedContent")||{}},async saveContent(e,t){let n=await this.getSavedContent();n[e]||(n[e]=[]);let a={id:Date.now().toString(),...t,timestamp:Date.now()};return n[e].unshift(a),n[e].length>50&&(n[e]=n[e].slice(0,50)),await this.setStorageItem("savedContent",n),console.log(`TabTalk AI: Content saved to ${e} category`),a.id},async deleteSavedContent(e,t){let n=await this.getSavedContent();n[e]&&(n[e]=n[e].filter(a=>a.id!==t),await this.setStorageItem("savedContent",n),console.log(`TabTalk AI: Content deleted from ${e} category`))},async isContentSaved(e,t){return(await this.getSavedContent())[e]?.some(a=>a.id===t)||!1},async saveThread(e){try{let t=await this.getStorageItem("savedThreads")||{};return t[e.id]={...e,savedAt:Date.now(),updatedAt:Date.now()},await this.setStorageItem("savedThreads",t),console.log("TabTalk AI: Thread saved persistently:",e.id),e.id}catch(t){return console.error("Error saving thread:",t),null}},async getAllThreads(){try{return await this.getStorageItem("savedThreads")||{}}catch(e){return console.error("Error loading threads:",e),{}}},async getThread(e){try{return(await this.getAllThreads())[e]||null}catch(t){return console.error("Error loading thread:",t),null}},async deleteThread(e){try{let t=await this.getAllThreads();return delete t[e],await this.setStorageItem("savedThreads",t),console.log("TabTalk AI: Thread deleted:",e),!0}catch(t){return console.error("Error deleting thread:",t),!1}},async updateThread(e,t){try{let n=await this.getAllThreads();return n[e]?(n[e]={...n[e],...t,updatedAt:Date.now()},await this.setStorageItem("savedThreads",n),console.log("TabTalk AI: Thread updated:",e),!0):!1}catch(n){return console.error("Error updating thread:",n),!1}}};window.TabTalkStorage=l})();(function(){let l={showView:function(e){document.querySelectorAll(".view").forEach(u=>u.classList.add("hidden")),e==="welcome"||e==="api-setup"||e==="settings"?document.body.classList.add("onboarding-view"):document.body.classList.remove("onboarding-view"),window.BottomNav&&window.BottomNav.setActive(e);let a=document.getElementById("quick-actions");a&&(e==="chat"?a.classList.remove("hidden"):a.classList.add("hidden"));let i=document.getElementById("bottom-nav"),s=document.querySelector("main"),o=document.querySelector(".container");e==="welcome"||e==="api-setup"||e==="settings"?(i&&(i.style.display="none",i.style.visibility="hidden",i.style.height="0"),s&&(s.style.paddingBottom="0"),o&&(o.style.paddingBottom="0")):(i&&(i.style.display="flex",i.style.visibility="visible",i.style.height="45px"),s&&(s.style.paddingBottom="45px"),o&&(o.style.paddingBottom="66px"));let r=`${e}-view`;e==="chat"&&(r="chat-view"),e==="settings"&&(r="settings-view"),e==="welcome"&&(r="welcome-view"),e==="api-setup"&&(r="api-setup-view"),e==="history"&&(r="history-view"),e==="gallery"&&(r="gallery-view"),e==="threads"&&(r="threads-view");let c=document.getElementById(r);if(c){if(c.classList.remove("hidden"),e==="history"&&window.historyManager&&this.loadHistoryView(),e==="gallery"&&window.galleryManager){let u=document.getElementById("gallery-container");u&&window.galleryManager.render(u,"twitter")}if(e==="threads"&&window.TabTalkThreadLibrary){let u=document.getElementById("threads-container");u&&window.TabTalkThreadLibrary.render(u)}e==="thread-generator"&&this.initializeHowItWorksToggle&&this.initializeHowItWorksToggle(),e==="memory-builder"&&window.MemoryBuilderUI&&window.MemoryBuilderUI.init()}else console.warn(`showView: target view not found for "${e}" (id "${r}")`)},loadHistoryView:function(){if(!window.historyManager){console.error("History manager not initialized");return}let e=document.getElementById("history-list");e&&(e.innerHTML='<div class="loading-history">Loading saved content...</div>',window.historyManager.loadHistory("all").then(t=>{window.historyManager.renderHistoryList(e,t,"all")}).catch(t=>{console.error("Error loading history:",t),e.innerHTML='<div class="empty-history">Error loading saved content</div>'}))},updateViewState:function(e,t="Loading..."){if(this.sidebar&&(this.sidebar.classList.add("hidden"),this.sidebar.style.display="none"),Object.values(this.views).forEach(n=>n.classList.add("hidden")),this.views[e]?(this.views[e].classList.remove("hidden"),e==="chat"&&this.messageInput?this.messageInput.focus():e==="settings"&&this.apiKeyInput&&this.apiKeyInput.focus()):console.error(`View "${e}" not found`),e==="status"&&this.statusText&&(this.statusText.textContent=t),e==="settings"){let n=document.querySelector(".onboarding-info");n&&(n.style.display=this.apiKey?"none":"block")}this.setAriaStatus(`Switched to ${e} view. ${t}`)}};window.TabTalkNavigation=l})();(function(){let l={ensureMarked:function(){return!this.marked&&window.marked&&(this.marked=window.marked),!!this.marked},setAriaStatus:function(e){let t=document.getElementById("aria-status");t&&(t.textContent=e)},sanitizeStructuredOutput:function(e,t){if(!t)return"";let n=String(t);return n=n.replace(/^(?:here\s*(?:is|are|\'s|'s)|below\s+is|certainly,|sure,|note:|here\'s a|here's a)[^\n:]*:\s*/i,""),n=n.replace(/^\s*(?:here\s*(?:is|are|\'s|'s)\s*(?:a|an)?\s*)/i,""),n=n.replace(/\s*\*\s+(?=[^\n])/g,`
- `),n=n.replace(/^[ \t]*[•*]\s+/gm,"- "),n=n.replace(/\n{3,}/g,`

`),n=n.replace(/\((https?:\/\/[^\s)]+)\)\s*\(\1\)/g,"($1)"),n=n.replace(/(https?:\/\/[^\s)]+)\s*\(\1\)/g,"$1"),n=n.replace(/^[`\s]+/,"").replace(/[\s`]+$/,""),(e==="keypoints"||e==="summary")&&(n=n.replace(/\*\*([^*]+)\*\*/g,"$1"),n=n.replace(/\*([^*]+)\*/g,"$1"),n=n.replace(/_([^_]+)_/g,"$1")),e==="keypoints"&&!/^\s*-\s+/m.test(n)&&(n=n.split(/\s*\*\s+|\n+/).filter(Boolean).map(a=>a.replace(/^[-•*]\s+/,"").trim()).filter(Boolean).map(a=>`- ${a}`).join(`
`)),n.trim()},setLoading:function(e,t="..."){this.isLoading=e,e?(this.pageStatus&&(this.pageStatus.textContent=t),this.setAriaStatus(t)):(this.pageStatus&&!this.pageStatus.textContent.startsWith("\u2705")&&(this.pageStatus.textContent="\u2705 Done"),this.setAriaStatus("Ready"))},updateQuickActionsVisibility:function(){this.quickActions&&this.quickActions.classList.toggle("hidden",!this.pageContent)},resetScreenForGeneration:function(){this.sidebar&&(this.sidebar.classList.add("hidden"),this.sidebar.style.display="none"),this.messagesContainer&&(this.messagesContainer.innerHTML=""),this.updateQuickActionsVisibility()},renderCard:function(e,t,n={}){let a=document.createElement("div");a.className="twitter-content-container";let i=document.createElement("div");i.className="twitter-card analytics-card",i.dataset.contentType=n.contentType||"content",i.dataset.contentId=n.contentId||Date.now().toString();let s={summary:"\u{1F4DD}",keypoints:"\u{1F511}",analysis:"\u{1F4CA}",faq:"\u2753",factcheck:"\u2705",blog:"\u{1F4F0}",proscons:"\u2696\uFE0F",timeline:"\u{1F4C5}",quotes:"\u{1F4AC}"},o=n.contentType||"content",r=s[o]||"\u{1F4C4}",c=n.markdown?`data-markdown="${encodeURIComponent(n.markdown)}"`:"";if(i.innerHTML=`
        <div class="twitter-card-header">
          <span class="twitter-card-title">${e}</span>
          <div class="twitter-header-actions">
            <button class="twitter-action-btn copy-btn" title="Copy content" aria-label="Copy content">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2 2v1"></path>
              </svg>
            </button>
          </div>
        </div>
        <div class="twitter-card-content">
          <div class="structured-html content-text" ${c}>${t}</div>
        </div>
      `,window.TabTalkUI&&window.TabTalkUI.addSaveButtonToCard){let g=n.contentType||"content",d={id:n.contentId||Date.now().toString(),content:n.markdown||t,title:e},p=i.querySelector(".twitter-header-actions");p&&window.TabTalkUI.addSaveButtonToCard(p,g,d)}let u=i.querySelector(".copy-btn"),h=u.innerHTML;u.addEventListener("click",async g=>{g.stopPropagation();try{let d=i.querySelector(".structured-html"),p=d?.getAttribute("data-markdown"),y=p?decodeURIComponent(p):d?.innerText||"";await navigator.clipboard.writeText(y),u.innerHTML=`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20,6 9,17 4,12"></polyline>
          </svg>`,u.classList.add("success"),setTimeout(()=>{u.innerHTML=h,u.classList.remove("success")},2e3)}catch(d){console.error("Copy failed:",d)}}),a.appendChild(i);let m=n.container||this.messagesContainer;return m.appendChild(a),m===this.messagesContainer&&m.scrollTo({top:m.scrollHeight,behavior:"smooth"}),i},showProgressBar:function(e){this.hideProgressBar();let t=document.createElement("div");t.className="progress-container",t.id="global-progress",t.innerHTML=`
        <div class="progress-message">${e}</div>
        <div class="progress-bar"><div class="progress-fill"></div></div>
      `,this.messagesContainer.appendChild(t),this.messagesContainer.scrollTo({top:this.messagesContainer.scrollHeight,behavior:"smooth"}),setTimeout(()=>{let n=t.querySelector(".progress-fill");n&&(n.style.width="100%")},100)},hideProgressBar:function(){let e=document.getElementById("global-progress");e&&e.remove()},addSaveButtonToCard:function(e,t,n){if(!e||!t||!n)return;let a=document.createElement("button");e.classList.contains("twitter-header-actions")?(a.className="twitter-action-btn save-btn",a.innerHTML=`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
        </svg>`):(a.className="save-btn",a.innerHTML=`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
        </svg>`),a.setAttribute("aria-label","Save to history"),a.setAttribute("data-category",t),a.setAttribute("data-content-id",n.id||Date.now().toString()),a.title="Save to history",window.TabTalkStorage&&window.TabTalkStorage.isContentSaved(t,n.id||Date.now().toString()).then(s=>{s&&(a.classList.add("saved"),a.querySelector("svg").setAttribute("fill","currentColor"))}),a.addEventListener("click",async s=>{s.stopPropagation();let o=a.getAttribute("data-content-id"),r=a.getAttribute("data-category");if(!window.TabTalkStorage)return;if(await window.TabTalkStorage.isContentSaved(r,o))await window.TabTalkStorage.deleteSavedContent(r,o),a.classList.remove("saved"),a.querySelector("svg").setAttribute("fill","none"),this.showToast("Removed from saved content");else{let u=n.content||e.querySelector(".content-text")?.textContent||"",h={source:this.currentTab?.url||window.location.href,title:this.currentTab?.title||document.title};await window.TabTalkStorage.saveContent(r,{id:o,content:u,metadata:h,...n}),a.classList.add("saved"),a.querySelector("svg").setAttribute("fill","currentColor"),this.showToast("Saved to history")}}),e.appendChild(a)},showToast:function(e,t=2e3){let n=document.createElement("div");n.className="toast",n.textContent=e,document.body.appendChild(n),setTimeout(()=>{n.classList.add("visible")},10),setTimeout(()=>{n.classList.remove("visible"),setTimeout(()=>n.remove(),300)},t)}};window.TabTalkUI=l})();(function(){let l={analyzeAndResearchContent:async function(e,t){let n=this.simpleHash(e.substring(0,500)),a=`analysis_${this.currentTab?.url}_${t.id}_${n}`;try{let s=await chrome.storage.local.get(a);if(s[a]&&Date.now()-s[a].timestamp<18e5)return console.log("Using cached content analysis"),s[a].analysis}catch(s){console.warn("Cache check failed:",s)}let i=`You are an expert content analyst and researcher. Analyze this webpage content and provide:

1. SUMMARY (2-3 sentences): Core message and main points
2. KEY INSIGHTS (3-5 bullet points): Most important facts, data, or claims
3. RESEARCH CONTEXT: Relevant domain knowledge, background, trends, or expert perspective from your training data (up to October 2024) that adds depth and credibility

Be concise, factual, and focus on what makes this content significant or noteworthy.

CONTENT:
${e.substring(0,3e3)}

Provide your analysis in this format:
SUMMARY: [your summary]
KEY INSIGHTS:
- [insight 1]
- [insight 2]
- [insight 3]
RESEARCH CONTEXT: [relevant background knowledge and expert perspective]`;try{let s=await this.callGeminiAPIWithSystemPrompt("You are an expert content analyst who provides structured, insightful analysis.",i),o=this.parseAnalysisResponse(s);try{let r={};r[a]={analysis:o,timestamp:Date.now()},await chrome.storage.local.set(r)}catch(r){console.warn("Failed to cache analysis:",r)}return o}catch(s){return console.error("Analysis failed:",s),{summary:"Content analysis unavailable.",keyInsights:"- Focus on core message from the content",researchContext:"Apply general domain knowledge and best practices."}}},simpleHash:function(e){let t=0;for(let n=0;n<e.length;n++){let a=e.charCodeAt(n);t=(t<<5)-t+a,t=t&t}return Math.abs(t).toString(36)},parseAnalysisResponse:function(e){let t=e.match(/SUMMARY:\s*(.+?)(?=KEY INSIGHTS:|$)/s),n=e.match(/KEY INSIGHTS:\s*(.+?)(?=RESEARCH CONTEXT:|$)/s),a=e.match(/RESEARCH CONTEXT:\s*(.+?)$/s);return{summary:t?t[1].trim():"Content provides valuable information.",keyInsights:n?n[1].trim():"- Key points from the content",researchContext:a?a[1].trim():"General domain knowledge applies."}},showToneSelector:function(e){if(!this.pageContent||!this.apiKey){this.showToast?this.showToast("\u274C Please set up your Gemini API key first and ensure page content is loaded.",3e3):alert("\u274C Please set up your Gemini API key first and ensure page content is loaded.");return}window.TabTalkToneSelector?window.TabTalkToneSelector.show(e,this.pageContent,(t,n)=>{this.generateSocialContentWithTone(n,t)}):(console.error("Tone selector not loaded"),this.generateSocialContentWithTone(e,{id:"supportive",name:"Supportive with Facts"}))},generateSocialContent:async function(e){this.showToneSelector(e)},generateSocialContentWithTone:async function(e,t){if(!this.pageContent||!this.apiKey){this.showToast?this.showToast("\u274C Please set up your Gemini API key first and ensure page content is loaded.",3e3):alert("\u274C Please set up your Gemini API key first and ensure page content is loaded.");return}this.currentSelectedTone=t,this.setLoading(!0,"Analyzing content..."),console.log(`TabTalk AI: Generating ${e} content for page: ${this.currentTab?.title}`),console.log(`Page content length: ${this.pageContent.length} characters`),console.log(`Selected tone: ${t.name} (${t.id})`);try{this.showProgressBar("Analyzing content...");let n=await this.analyzeAndResearchContent(this.pageContent,t);this.currentContentAnalysis=n,this.showProgressBar("Generating expert post...");let a="",i="",s="",o=t.aiInstructions||this.getDefaultToneInstructions(t.id);if(e==="twitter")s="\u{1F426}",a=`You are an expert Twitter/X content strategist who combines deep analysis with engaging storytelling. You leverage comprehensive research and domain expertise to create posts that are both intellectually rigorous and captivating. Your posts stop people mid-scroll because they offer genuine insights backed by evidence and expert knowledge.

Write in plain text only - no hashtags, no URLs, no formatting symbols. Just pure, engaging expert expression with strategic emojis.

${o}

CONTEXT ANALYSIS:
${n.summary}

KEY INSIGHTS:
${n.keyInsights}

RESEARCH AUGMENTATION (from domain knowledge):
${n.researchContext}`,i=`Transform this webpage content into an electrifying Twitter/X post that feels authentically human.

YOUR WRITING STYLE:
\u2713 Write with GENUINE excitement and energy
\u2713 Use natural line breaks to create rhythm and pacing
\u2713 Sprinkle 2-4 emojis throughout to amplify emotion
\u2713 Start with a scroll-stopping hook that sparks curiosity
\u2713 Use conversational language (contractions, casual tone)
\u2713 Add personality - be bold, enthusiastic, delightfully human
\u2713 Include punchy short sentences mixed with flowing longer ones
\u2713 Make every word count - no fluff, pure value
\u2713 Create visual breathing room with smart line breaks
\u2713 End with intrigue or a thought-provoking insight

STRUCTURE:
[Attention-grabbing hook]

[Core insight with excitement]

[Supporting detail or surprising angle]

[Memorable closer]

KEEP IT CLEAN:
\u2717 No hashtags or # symbols
\u2717 No bold/italic markdown
\u2717 No URLs
\u2717 No meta-commentary

CONTENT TO TRANSFORM:
${this.pageContent}

Write your captivating post now:`;else if(e==="thread")s="\u{1F9F5}",a=`You are an expert Twitter/X thread strategist who combines deep analysis with compelling narrative structure. You leverage comprehensive research and domain expertise to create threads that educate, engage, and inspire. Each tweet builds on expert insights while maintaining human warmth and accessibility.

Write in plain text with strategic emojis - no hashtags, no URLs, no formatting symbols. Expert storytelling that resonates.

${o}

CONTEXT ANALYSIS:
${n.summary}

KEY INSIGHTS:
${n.keyInsights}

RESEARCH AUGMENTATION (from domain knowledge):
${n.researchContext}`,i=`Create a magnetic Twitter thread (3-8 tweets) from this content.

CRITICAL FORMAT REQUIREMENT:
Start each tweet with: 1/n: 2/n: 3/n: etc.

THREAD STRUCTURE:
Tweet 1: Explosive hook - Stop the scroll immediately
Tweet 2: Setup - Introduce core concept
Middle Tweets: Value bombs - One powerful insight per tweet
Final Tweet: Unforgettable closer - Leave them thinking

YOUR STYLE:
- Enthusiastic and genuinely excited
- Human and conversational (use contractions)
- Bold and confident
- Include 1-2 emojis per tweet naturally
- Use line breaks for visual flow

KEEP IT CLEAN:
- No hashtags
- No formatting symbols
- No URLs

CONTENT:
${this.pageContent}

OUTPUT EXAMPLE:
1/5:
[Hook content]

2/5:
[Setup content]

3/5:
[Value content]

Generate your thread now:`;else{this.showToast?this.showToast("\u274C Only Twitter/X Post and Twitter Thread are supported.",3e3):alert("\u274C Only Twitter/X Post and Twitter Thread are supported.");return}let r=await this.callGeminiAPIWithSystemPrompt(a,i);if(r){console.log(`TabTalk AI: Successfully generated ${e} content, response length: ${r.length} characters`);let c=this.cleanTwitterContent(r);if(this.addTwitterMessage("assistant",c,e),this.addToHistory){let u={timestamp:new Date().toISOString(),url:this.currentTab?.url||"",title:this.currentTab?.title||"",domain:this.currentDomain||"",content:c,type:e};await this.addToHistory(e,u)}await this.saveState()}else throw new Error("Empty response received from Gemini API")}catch(n){console.error("Error generating social content:",n),console.error("Error details:",{message:n.message,stack:n.stack,platform:e,hasApiKey:!!this.apiKey,hasPageContent:!!this.pageContent,pageContentLength:this.pageContent?.length}),this.showToast?this.showToast(`\u274C Error: ${n.message}. Please check your API key and try again.`,4e3):alert(`\u274C Error generating social media content: ${n.message}. Please check your API key and try again.`)}finally{this.setLoading(!1),this.hideProgressBar()}},showProgressBar:function(e){this.hideProgressBar();let t=document.createElement("div");t.className="progress-container",t.id="twitter-progress",t.innerHTML=`
        <div class="progress-message">${e}</div>
        <div class="progress-bar">
          <div class="progress-fill"></div>
        </div>
      `,this.messagesContainer.appendChild(t),this.messagesContainer.scrollTo({top:this.messagesContainer.scrollHeight,behavior:"smooth"}),setTimeout(()=>{let n=t.querySelector(".progress-fill");n&&(n.style.width="100%")},100)},hideProgressBar:function(){let e=document.getElementById("twitter-progress");e&&e.remove()},addTwitterMessage:function(e,t,n){this.renderTwitterContent(t,n)},renderTwitterContent:function(e,t){let n=document.createElement("div");if(n.className="twitter-content-container",t==="thread"){let a=this.parseTwitterThread(e),i=`thread_${Date.now()}`;this.autoSaveThread(i,a,e);let s=document.createElement("div");s.className="thread-header";let o=this.getTotalChars(a);s.innerHTML=`
          <div class="thread-info">
            <span class="thread-icon">\u{1F9F5}</span>
            <span class="thread-title">Thread Generated</span>
            <span class="thread-meta">${a.length} tweets \u2022 ${o} chars</span>
          </div>
          <div class="thread-actions">
            <button class="btn-copy-all-thread" data-thread-id="${i}" title="Copy all tweets">
              \u{1F4CB}
            </button>
            <span class="copy-all-status hidden">\u2713 All Copied!</span>
          </div>
        `,n.appendChild(s);let r=document.createElement("div");r.className="thread-master-control",r.innerHTML=`
          <div class="master-control-header">
            <span class="control-label">Thread Length Control</span>
            <span class="control-hint">Adjust total thread length \u2022 Characters distributed proportionally</span>
          </div>
          <div class="master-control-slider">
            <div class="slider-presets">
              <button class="preset-btn" data-length="1000">Short (1K)</button>
              <button class="preset-btn" data-length="2500">Medium (2.5K)</button>
              <button class="preset-btn" data-length="5000">Long (5K)</button>
            </div>
            <div class="slider-container">
              <span class="slider-min">500</span>
              <input type="range" class="master-length-slider" min="500" max="5000" value="${o}" step="100" data-thread-id="${i}">
              <span class="slider-max">5000</span>
            </div>
            <div class="slider-value">
              <span class="current-length">${o}</span> characters total
            </div>
          </div>
          <div class="master-control-actions">
            <button class="btn-regenerate-thread" data-thread-id="${i}" title="Regenerate entire thread with new length">
              \u{1F504} Regenerate Thread
            </button>
          </div>
        `,n.appendChild(r);let c=s.querySelector(".btn-copy-all-thread"),u=s.querySelector(".copy-all-status");c.addEventListener("click",async()=>{await this.copyAllTweets(a,c,u)});let h=r.querySelector(".master-length-slider"),m=r.querySelector(".current-length"),g=r.querySelector(".btn-regenerate-thread"),d=r.querySelectorAll(".preset-btn");h.addEventListener("input",p=>{m.textContent=p.target.value}),d.forEach(p=>{p.addEventListener("click",()=>{let y=p.dataset.length;h.value=y,m.textContent=y})}),g.addEventListener("click",async()=>{let p=parseInt(h.value);await this.regenerateEntireThread(n,i,p,e)}),a.forEach((p,y)=>{let w=`Thread ${y+1}/${a.length}`,v=this.createTwitterCard(p,w,!0);v.dataset.platform=t,v.dataset.threadId=i,n.appendChild(v)})}else{let a=this.createTwitterCard(e,"Post");a.dataset.platform=t,n.appendChild(a)}this.messagesContainer.appendChild(n),setTimeout(()=>{this.messagesContainer.scrollTo({top:this.messagesContainer.scrollHeight,behavior:"smooth"})},100)},parseTwitterThread:function(e){let n=this.cleanTwitterContent(e).replace(/Here's your clean.*?content:\s*/gi,"").trim(),a=[],i=n.split(`
`),s="",o=null;for(let r of i){let c=r.trim(),u=c.match(/^(\d+)\/(\d+)[\s:]*(.*)$/);u?(s.trim()&&a.push(s.trim()),o=u[1],s=u[3]||""):o!==null&&c&&(s+=(s?`
`:"")+c)}return s.trim()&&a.push(s.trim()),a.length===0?(console.warn("Thread parsing failed, returning full content as single tweet"),[n||e]):(console.log(`\u2705 Parsed ${a.length} tweets from thread`),a)},createTwitterCard:function(e,t,n=!1){let a=document.createElement("div");a.className="twitter-card";let i=this.currentSelectedTone?`
        <div class="tone-badge" style="background: linear-gradient(135deg, ${this.currentSelectedTone.tone1?.color||this.getToneColor(this.currentSelectedTone.id)} 0%, ${this.currentSelectedTone.tone2?.color||this.getToneColor(this.currentSelectedTone.id)} 100%);">
          ${this.currentSelectedTone.tone1?.icon||this.getToneIcon(this.currentSelectedTone.id)} ${this.currentSelectedTone.name}
        </div>
      `:"",s=n?`
        <div class="twitter-controls">
          <div class="twitter-char-count">${this.getAccurateCharacterCount(e)} characters</div>
        </div>
      `:`
        <div class="twitter-controls">
          ${i}
          <div class="twitter-length-control">
            <label class="length-label">Target Length:</label>
            <input type="range" class="length-slider" min="50" max="2000" value="${Math.max(50,this.getAccurateCharacterCount(e))}" step="50">
            <span class="length-display">${Math.max(50,this.getAccurateCharacterCount(e))}</span>
            <button class="regenerate-btn" title="Regenerate with new length">\u{1F504}</button>
          </div>
          <div class="twitter-char-count">${this.getAccurateCharacterCount(e)} characters</div>
        </div>
      `;if(a.innerHTML=`
        <div class="twitter-card-header">
          <span class="twitter-card-title">${t}</span>
          <div class="twitter-header-actions">
            <button class="twitter-action-btn copy-btn" title="Copy tweet" aria-label="Copy tweet content">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            </button>
          </div>
        </div>
        <div class="twitter-card-content">
          <textarea class="twitter-text" placeholder="Edit your tweet content...">${e}</textarea>
          ${s}
        </div>
      `,window.TabTalkUI&&window.TabTalkUI.addSaveButtonToCard){let h={id:Date.now().toString(),content:e,title:t},m=t.toLowerCase().includes("thread")?"thread":"twitter",g=a.querySelector(".twitter-header-actions");g&&window.TabTalkUI.addSaveButtonToCard(g,m,h)}let o=a.querySelector(".copy-btn"),r=a.querySelector(".twitter-text"),c=o.innerHTML;o.addEventListener("click",async h=>{h.stopPropagation();try{await navigator.clipboard.writeText(r.value),o.innerHTML=`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20,6 9,17 4,12"></polyline>
          </svg>`,o.classList.add("success"),setTimeout(()=>{o.innerHTML=c,o.classList.remove("success")},2e3)}catch(m){console.error("Copy failed:",m)}});let u=()=>{r.style.height="auto",r.style.height=Math.max(80,r.scrollHeight)+"px"};if(setTimeout(u,0),r.addEventListener("input",()=>{let h=a.querySelector(".twitter-char-count"),m=this.getAccurateCharacterCount(r.value);h.textContent=`${m} characters`,h.style.color="var(--text-secondary)",u()}),!n){let h=a.querySelector(".length-slider"),m=a.querySelector(".length-display"),g=a.querySelector(".regenerate-btn");h&&m&&h.addEventListener("input",()=>{m.textContent=h.value}),a.dataset.originalContent=this.pageContent,a.dataset.platform=t.includes("Thread")?"thread":"twitter",this.currentSelectedTone&&(a.dataset.selectedTone=JSON.stringify(this.currentSelectedTone)),g&&g.addEventListener("click",async()=>{let d=parseInt(h.value),p=a.dataset.platform,y=a.dataset.selectedTone?JSON.parse(a.dataset.selectedTone):this.currentSelectedTone;await this.regenerateWithLength(a,d,p,{selectedTone:y})})}return a},cleanTwitterContent:function(e){if(!e)return e;let t=e;return t=t.replace(/^.*?Unacceptable.*?\n/gim,""),t=t.replace(/^.*?critical failure.*?\n/gim,""),t=t.replace(/^.*?forbidden.*?formatting.*?\n/gim,""),t=t.replace(/^.*?breaks the instructions.*?\n/gim,""),t=t.replace(/^.*?--[•\-]\s*Original Response:.*?\n/gim,""),t=t.replace(/^.*?You have used.*?\n/gim,""),t=t.replace(/^.*?This output is unusable.*?\n/gim,""),t=t.replace(/^.*?Here's your.*?content:.*?\n/gim,""),t=t.replace(/^.*?OUTPUT:.*?\n/gim,""),t=t.replace(/#\w+/g,""),t=t.replace(/#/g,""),t=t.replace(/\*\*([^*]+)\*\*/g,"$1"),t=t.replace(/\*([^*]+)\*/g,"$1"),t=t.replace(/_{2,}([^_]+)_{2,}/g,"$1"),t=t.replace(/_([^_]+)_/g,"$1"),t=t.replace(/\*{2,}/g,""),t=t.replace(/_{2,}/g,""),t=t.replace(/\(line break\)/gi,`
`),t=t.replace(/\[line break\]/gi,`
`),t=t.replace(/^[-*]\s+/gm,"\u2022 "),t=t.replace(/https?:\/\/\S+/gi,""),t=t.replace(/\((https?:\/\/[^)]+)\)/gi,""),t=t.replace(/www\.\S+/gi,""),t=t.replace(/\[([^\]]+)\]\([^)]+\)/g,"$1"),t=t.replace(/\[([^\]]+)\]/g,"$1"),t=t.replace(/\(emphasis\)/gi,""),t=t.replace(/\(bold\)/gi,""),t=t.replace(/\(italic\)/gi,""),t=t.replace(/\n{3,}/g,`

`),t=t.replace(/[ \t]+/g," "),t=t.replace(/(^|\n)\s*$/g,""),t=t.trim(),t},getAccurateCharacterCount:function(e){if(!e)return 0;let t=e.trim(),n=0,a=Array.from(t);for(let i of a)this.isEmojiOrSpecialChar(i)?n+=2:n+=1;return n},isEmojiOrSpecialChar:function(e){let t=e.codePointAt(0);return t>=126976&&t<=129535||t>=9728&&t<=9983||t>=9984&&t<=10175||t>=128512&&t<=128591||t>=127744&&t<=128511||t>=128640&&t<=128767||t>=127456&&t<=127487||t>=8205},regenerateWithLength:async function(e,t,n,a){let i=e.querySelector(".twitter-text"),s=e.querySelector(".regenerate-btn"),o=e.dataset.originalContent;s.textContent="\u23F3",s.disabled=!0;try{let r="",c="",u=a&&a.selectedTone||this.currentSelectedTone||{id:"supportive",name:"Supportive with Facts"},h=u.aiInstructions||this.getDefaultToneInstructions(u.id),m=this.currentContentAnalysis||{summary:"Content provides valuable information.",keyInsights:"- Key points from the content",researchContext:"Apply general domain knowledge and best practices."};if(n==="twitter")r=`You are an expert Twitter/X content strategist creating ${t}-character posts that combine deep analysis with engaging storytelling. Every word is backed by research and expertise while radiating personality and human warmth. Write in plain text with strategic emojis - no hashtags, no URLs, no formatting symbols.

${h}

CONTEXT ANALYSIS:
${m.summary}

KEY INSIGHTS:
${m.keyInsights}

RESEARCH AUGMENTATION:
${m.researchContext}`,c=`Recreate this as an expert ${t}-character Twitter post that combines insight with engagement.

YOUR APPROACH:
\u2713 Target: ${t} characters (\xB110 acceptable)
\u2713 Write with GENUINE excitement and energy
\u2713 Use natural line breaks for rhythm
\u2713 Include 2-4 emojis strategically placed
\u2713 Start with a scroll-stopping hook
\u2713 Add punchy, conversational language
\u2713 Mix short zingers with flowing sentences
\u2713 Apply the ${u.name} tone throughout
\u2713 End with impact or intrigue

KEEP IT CLEAN:
\u2717 No hashtags
\u2717 No formatting symbols
\u2717 No URLs
\u2717 No meta-commentary

ORIGINAL CONTENT:
${o}

Transform it now:`;else if(n==="thread"){let d=Math.ceil(t/400);r=`You are an expert Twitter/X thread strategist crafting ${d} tweets (${t} total characters) that combine deep analysis with compelling narrative. Each tweet builds on expert insights while maintaining human warmth and accessibility. Write in plain text with strategic emojis - no hashtags, no URLs, no formatting.

${h}

CONTEXT ANALYSIS:
${m.summary}

KEY INSIGHTS:
${m.keyInsights}

RESEARCH AUGMENTATION:
${m.researchContext}`,c=`Recreate this as an expert ${d}-tweet thread (around ${t} characters total).

YOUR STORYTELLING APPROACH:
\u2713 Create ${d} numbered tweets (1/${d}, 2/${d}, etc.)
\u2713 Total: approximately ${t} characters
\u2713 Write with genuine enthusiasm and energy
\u2713 Use line breaks for visual breathing room
\u2713 Include 1-2 emojis per tweet naturally
\u2713 Each tweet delivers a powerful insight
\u2713 Build narrative momentum throughout
\u2713 Mix punchy short lines with flowing explanations
\u2713 Apply the ${u.name} tone throughout
\u2713 End with an unforgettable closer

KEEP IT CLEAN:
\u2717 No hashtags
\u2717 No formatting symbols
\u2717 No URLs
\u2717 No explanations about format

ORIGINAL CONTENT:
${o}

Craft your thread now:`}let g=await this.callGeminiAPIWithSystemPrompt(r,c);if(g){let d=this.cleanTwitterContent(g);if(n==="thread"){let v=this.parseTwitterThread(d)[0]||d;i.value=v}else i.value=d;let p=e.querySelector(".twitter-char-count"),y=this.getAccurateCharacterCount(i.value);p.textContent=`${y} characters`,setTimeout(()=>{i.style.height="auto",i.style.height=Math.max(80,i.scrollHeight)+"px"},0)}}catch(r){console.error("Error regenerating content:",r),alert("Error regenerating content. Please try again.")}finally{s.textContent="\u{1F504}",s.disabled=!1}},getDefaultToneInstructions:function(e){let t={supportive:`TONE: Supportive with Facts
- Highlight verifiable strengths
- Use encouraging language
- Back claims with evidence`,critical:`TONE: Critical with Facts
- Identify weaknesses with evidence
- Professional, constructive critique
- Hedge when evidence is limited`,trolling:`TONE: Trolling with Facts
- Playful jabs with data backing
- Internet culture references
- Fun but factual`,"anti-propaganda":`TONE: Anti-Propaganda
- Debunk misconceptions
- Clear fact vs. fiction framing
- Evidence-based corrections`,"critical-humor":`TONE: Critical with Humor
- Witty critique through analogies
- Clever observations
- Light but insightful`,sarcastic:`TONE: Sarcastic
- Ironic commentary
- Rhetorical questions
- Clever, not cruel`,investigative:`TONE: Investigative
- Journalistic fact-finding
- Data-driven analysis
- Multiple perspectives`,optimistic:`TONE: Optimistic
- Future-focused positivity
- Evidence-backed hope
- Inspiring action`,cautionary:`TONE: Cautionary
- Risk-aware warnings
- Evidence-based concerns
- Balanced perspective`,empowering:`TONE: Empowering
- Action-oriented language
- Personal agency focus
- Achievable steps`};return t[e]||t.supportive},getToneColor:function(e){return{supportive:"var(--accent-color)",critical:"var(--accent-medium)",trolling:"var(--accent-light)","anti-propaganda":"var(--accent-color)","critical-humor":"var(--accent-medium)",sarcastic:"var(--accent-light)",investigative:"var(--accent-color)",optimistic:"var(--accent-medium)",cautionary:"var(--accent-light)",empowering:"var(--accent-color)"}[e]||"var(--accent-color)"},getToneIcon:function(e){return{supportive:"\u{1F91D}",critical:"\u2694\uFE0F",trolling:"\u{1F608}","anti-propaganda":"\u{1F6E1}\uFE0F","critical-humor":"\u{1F605}",sarcastic:"\u{1F3AD}",investigative:"\u{1F50D}",optimistic:"\u{1F305}",cautionary:"\u26A0\uFE0F",empowering:"\u{1F4AA}"}[e]||"\u{1F3AD}"},autoSaveThread:async function(e,t,n){if(!window.TabTalkStorage||!window.TabTalkStorage.saveThread){console.warn("Storage module not available for thread persistence");return}try{let a=await window.TabTalkStorage.getAllThreads(),i=Object.values(a).filter(o=>o.isAutoSaved);for(let o of i)await window.TabTalkStorage.deleteThread(o.id),console.log("\u{1F5D1}\uFE0F Deleted old auto-saved thread:",o.id);let s={id:e,title:this.currentTab?.title||"Untitled Thread",url:this.currentTab?.url||"",domain:this.currentDomain||"",platform:"thread",isAutoSaved:!0,tweets:t.map((o,r)=>({id:`tweet_${r+1}`,number:`${r+1}/${t.length}`,content:o,charCount:this.getAccurateCharacterCount(o)})),rawContent:n,totalTweets:t.length,totalChars:this.getTotalChars(t),createdAt:Date.now()};await window.TabTalkStorage.saveThread(s),console.log("\u2705 Thread auto-saved persistently:",e),this.showAutoSaveNotification()}catch(a){console.error("Error auto-saving thread:",a)}},copyAllTweets:async function(e,t,n){try{let a=e.map((i,s)=>`${s+1}/${e.length}:
${i}`).join(`

---

`);await navigator.clipboard.writeText(a),t.classList.add("hidden"),n.classList.remove("hidden"),setTimeout(()=>{t.classList.remove("hidden"),n.classList.add("hidden")},3e3),console.log("\u2705 All tweets copied to clipboard")}catch(a){console.error("Error copying all tweets:",a),alert("Failed to copy tweets. Please try again.")}},getTotalChars:function(e){return e.reduce((t,n)=>t+this.getAccurateCharacterCount(n),0)},showAutoSaveNotification:function(){let e=document.createElement("div");e.className="auto-save-notification",e.innerHTML="\u{1F4BE} Thread auto-saved",e.style.cssText=`
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: var(--accent-color);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideInUp 0.3s ease;
      `,document.body.appendChild(e),setTimeout(()=>{e.style.animation="slideOutDown 0.3s ease",setTimeout(()=>e.remove(),300)},2e3)},regenerateEntireThread:async function(e,t,n,a){let i=e.querySelector(".btn-regenerate-thread");if(!i)return;let s=i.textContent;i.textContent="\u23F3 Regenerating...",i.disabled=!0;try{let o=Math.max(3,Math.min(8,Math.ceil(n/500))),r=`You are a masterful Twitter/X thread storyteller crafting ${o} tweets (${n} total characters) that captivate from start to finish. Each tweet vibrates with personality, energy, and human warmth. You turn complex ideas into addictive narratives. Write in plain text with strategic emojis - no hashtags, no URLs, no formatting. Pure storytelling magic.`,c=`Create a magnetic Twitter thread with EXACTLY ${o} tweets totaling approximately ${n} characters.

CRITICAL FORMAT REQUIREMENT:
You MUST start each tweet with its number in this EXACT format:
1/${o}:
2/${o}:
3/${o}:
etc.

THREAD STRUCTURE:
- Tweet 1: Explosive hook (15% of total = ${Math.floor(n*.15)} chars)
- Tweets 2-${o-1}: Value bombs (60% of total = ${Math.floor(n*.6/(o-2))} chars each)
- Tweet ${o}: Unforgettable closer (25% of total = ${Math.floor(n*.25)} chars)

YOUR TONE:
\u2713 Enthusiastic and genuinely excited
\u2713 Human and conversational
\u2713 Bold and confident
\u2713 Delightfully engaging
\u2713 Strategic line breaks for visual flow

KEEP IT CLEAN:
\u2717 No hashtags
\u2717 No formatting symbols
\u2717 No URLs
\u2717 No explanations about format

CONTENT:
${this.pageContent||a}

OUTPUT FORMAT EXAMPLE:
1/${o}:
[Your explosive hook here]

2/${o}:
[Your value bomb here]

Craft your ${n}-character thread now:`,u=await this.callGeminiAPIWithSystemPrompt(r,c);if(u){let h=this.cleanTwitterContent(u),m=this.parseTwitterThread(h);e.querySelectorAll(".twitter-card").forEach(w=>w.remove()),m.forEach((w,v)=>{let f=`Thread ${v+1}/${m.length}`,T=this.createTwitterCard(w,f,!0);T.dataset.platform="thread",T.dataset.threadId=t,e.appendChild(T)});let d=e.querySelector(".thread-meta");d&&(d.textContent=`${m.length} tweets \u2022 ${this.getTotalChars(m)} chars`);let p=e.querySelector(".current-length");p&&(p.textContent=this.getTotalChars(m));let y=e.querySelector(".master-length-slider");y&&(y.value=this.getTotalChars(m)),await this.autoSaveThread(t,m,h),console.log("\u2705 Thread regenerated successfully")}}catch(o){console.error("Error regenerating thread:",o),alert("Failed to regenerate thread. Please try again.")}finally{i.textContent=s,i.disabled=!1}}};window.TabTalkTwitter=l})();(function(){let l={knowledgePacks:{},modalInitialized:!1,popupInstance:null,init:function(){this.modalInitialized||(this.createModalHTML(),this.bindModalEvents(),this.modalInitialized=!0)},createModalHTML:function(){document.getElementById("thread-generator-modal")||document.body.insertAdjacentHTML("beforeend",`
        <div id="thread-generator-modal" class="tone-modal hidden" role="dialog" aria-labelledby="thread-gen-title" aria-modal="true">
          <div class="tone-modal-overlay"></div>
          <div class="tone-modal-content">
            <div class="tone-modal-header">
              <h2 id="thread-gen-title">Create Thread</h2>
              <button class="tone-modal-close" aria-label="Close">&times;</button>
            </div>
            
            <div class="tone-grid" style="padding: 24px;">
              <div class="form-group" style="margin-bottom: 20px;">
                <label style="display: block; font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">Category</label>
                <select id="modal-thread-category" class="builder-select" style="width: 100%; padding: 10px 12px; border-radius: 10px; border: 1px solid rgba(203, 213, 225, 0.4); background: rgba(255, 255, 255, 0.8); font-size: 14px;">
                  <option value="history">\u{1F4DC} History</option>
                  <option value="sports">\u26BD Sports</option>
                  <option value="stories">\u{1F4D6} Stories</option>
                  <option value="celebrity">\u2B50 Celebrity</option>
                  <option value="news">\u{1F4F0} News</option>
                </select>
              </div>
              
              <div class="form-group" style="margin-bottom: 20px;">
                <label style="display: block; font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">Topic</label>
                <input type="text" id="modal-thread-topic" class="builder-select" placeholder="e.g., The fall of the Roman Empire" style="width: 100%; padding: 10px 12px; border-radius: 10px; border: 1px solid rgba(203, 213, 225, 0.4); background: rgba(255, 255, 255, 0.8); font-size: 14px;" />
                <small style="display: block; margin-top: 6px; font-size: 11px; color: var(--text-secondary);">Enter any topic you want to create a thread about</small>
              </div>
              
              <div class="form-group" style="margin-bottom: 8px;">
                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                  <input type="checkbox" id="modal-use-knowledge-pack" checked style="width: 16px; height: 16px;" />
                  <span style="font-size: 13px; font-weight: 500; color: var(--text-primary);">Use AI Knowledge Base</span>
                </label>
                <small style="display: block; margin-top: 4px; margin-left: 24px; font-size: 11px; color: var(--text-secondary);">Includes curated facts and hooks</small>
              </div>
            </div>
            
            <div class="tone-modal-actions">
              <button id="thread-gen-cancel-btn" class="tone-btn tone-btn-secondary">Cancel</button>
              <button id="thread-gen-generate-btn" class="tone-btn tone-btn-primary">
                Generate Thread
              </button>
            </div>
          </div>
        </div>
      `)},bindModalEvents:function(){let e=document.getElementById("thread-generator-modal");if(!e)return;let t=e.querySelector(".tone-modal-close"),n=e.querySelector(".tone-modal-overlay"),a=document.getElementById("thread-gen-cancel-btn"),i=document.getElementById("thread-gen-generate-btn");t?.addEventListener("click",()=>this.hideModal()),n?.addEventListener("click",()=>this.hideModal()),a?.addEventListener("click",()=>this.hideModal()),i?.addEventListener("click",()=>this.handleGenerate()),e.addEventListener("keydown",s=>{s.key==="Escape"&&this.hideModal()})},showModal:function(e){if(e)l.popupInstance=e,console.log("ThreadGenerator: Stored popup instance, has apiKey:",!!e.apiKey);else{console.error("ThreadGenerator: No popup instance provided to showModal"),alert("Unable to open thread generator. Please refresh and try again.");return}l.init();let t=document.getElementById("thread-generator-modal");if(!t)return;t.classList.remove("hidden"),t.setAttribute("aria-hidden","false"),document.getElementById("modal-thread-topic")?.focus()},hideModal:function(){let e=document.getElementById("thread-generator-modal");e&&(e.classList.add("hidden"),e.setAttribute("aria-hidden","true"))},handleGenerate:async function(){let e=document.getElementById("modal-thread-category")?.value,t=document.getElementById("modal-thread-topic")?.value?.trim(),n=document.getElementById("modal-use-knowledge-pack")?.checked;if(!t){alert("Please enter a topic");return}console.log("ThreadGenerator: handleGenerate called"),console.log("ThreadGenerator: popupInstance exists:",!!l.popupInstance),console.log("ThreadGenerator: popupInstance has apiKey:",!!l.popupInstance?.apiKey),console.log("ThreadGenerator: popupInstance has generateThreadMVP:",!!l.popupInstance?.generateThreadMVP),l.hideModal(),l.popupInstance&&l.popupInstance.resetScreenForGeneration&&l.popupInstance.resetScreenForGeneration(),l.popupInstance&&l.popupInstance.generateThreadMVP?await l.popupInstance.generateThreadMVP(e,t,{useKnowledgePack:n,maxTweets:8,tone:"curious"}):(console.error("Popup instance not available for thread generation"),console.error("popupInstance:",l.popupInstance),alert("Unable to generate thread. Please try again."))},loadKnowledgePack:async function(e){if(this.knowledgePacks[e])return this.knowledgePacks[e];try{let t=await fetch(`knowledge-packs/${e}.json`);if(!t.ok)return console.warn(`Knowledge pack not found for ${e}`),null;let n=await t.json();return this.knowledgePacks[e]=n,n}catch(t){return console.error(`Error loading knowledge pack for ${e}:`,t),null}},getRandomHook:function(e){if(!e||!e.hooks||e.hooks.length===0)return null;let t=Math.floor(Math.random()*e.hooks.length);return e.hooks[t]},generateThreadMVP:async function(e,t,n={}){let a=this;if(!a.apiKey){alert("\u274C Please set up your Gemini API key first."),a.showView&&a.showView("settings");return}let i=n.useKnowledgePack!==!1,s=n.maxTweets||8,o=n.tone||"curious";a.setLoading(!0,`Generating ${e} thread...`),console.log(`Fibr: Generating thread for category: ${e}, topic: ${t}`);try{let r="";if(i){let f=await l.loadKnowledgePack(e);f&&f.facts&&(r=`

RELEVANT KNOWLEDGE BASE:
${f.facts.slice(0,5).map((T,b)=>`${b+1}. ${T}`).join(`
`)}
`)}a.showProgressBar&&a.showProgressBar(`Generating ${e} thread...`);let c=`You are a precise thread outline creator. You create structured outlines for engaging Twitter/X threads about ${e}. No markdown, no hashtags.`,u=`Create a ${s}-tweet thread outline about: ${t}

Category: ${e}
Tone: ${o}
${r}

Create an outline with ${s} beats:
- Beat 1: Hook (attention-grabbing opener)
- Beats 2-${s-1}: Core content (facts, insights, twists)
- Beat ${s}: Closer (memorable ending)

Format each beat as:
[Beat number]: [One-sentence description]

Generate the outline now:`,h=await a.callGeminiAPIWithSystemPrompt(c,u);if(!h)throw new Error("Failed to generate outline");console.log("\u2705 Outline generated");let m=`You are a masterful Twitter/X thread storyteller. You craft threads about ${e} that captivate readers. Each tweet pulses with energy and personality. Write in plain text with strategic emojis - no hashtags, no URLs, no formatting symbols.`,g=`Transform this outline into a complete ${s}-tweet thread about: ${t}

OUTLINE:
${h}

CRITICAL FORMAT:
Start each tweet with: 1/${s}: 2/${s}: 3/${s}: etc.

TONE: ${o}
${o==="curious"?"- Ask questions, spark wonder, invite exploration":""}
${o==="neutral"?"- Factual, balanced, informative":""}
${o==="dramatic"?"- Bold, intense, emotionally charged":""}

STYLE:
\u2713 Each tweet can be 100-280 characters
\u2713 Include 1-2 emojis per tweet naturally
\u2713 Use line breaks for visual flow
\u2713 Conversational and human
\u2713 No hashtags, no URLs, no markdown

${r}

OUTPUT EXAMPLE:
1/${s}:
[Hook content here]

2/${s}:
[Content here]

Generate the complete thread now:`,d=await a.callGeminiAPIWithSystemPrompt(m,g);if(!d)throw new Error("Failed to expand thread");console.log("\u2705 Thread expanded");let p=a.cleanTwitterContent(d),y=a.parseTwitterThread(p),w=[];for(let f of y)if(a.getAccurateCharacterCount(f)<=280)w.push(f);else{let b=await l.smartSplitTweet.call(a,f,280);w.push(...b)}console.log(`\u2705 Thread generated: ${w.length} tweets`);let v=`thread_${Date.now()}`;l.renderThreadGeneratorResult.call(a,w,v,e,t,i),a.autoSaveThread&&await a.autoSaveThread(v,w,p),await a.saveState()}catch(r){console.error("Error generating thread:",r),alert(`\u274C Error generating thread: ${r.message}`)}finally{a.setLoading(!1),a.hideProgressBar&&a.hideProgressBar()}},smartSplitTweet:async function(e,t){let n=e.match(/[^.!?]+[.!?]+/g)||[e],a=[],i="";for(let s of n)this.getAccurateCharacterCount(i+s)<=t?i+=s:(i&&a.push(i.trim()),i=s);return i&&a.push(i.trim()),a.length>0?a:[e.substring(0,t)]},renderThreadGeneratorResult:function(e,t,n,a,i=!0){let s=document.createElement("div");s.className="twitter-content-container thread-generator-result",s.dataset.category=n,s.dataset.topic=a,s.dataset.useKnowledgePack=i;let o=document.createElement("div");o.className="thread-header";let r=this.getTotalChars(e);o.innerHTML=`
        <div class="thread-info">
          <span class="thread-icon">\u{1F9F5}</span>
          <div class="thread-title-group">
            <span class="thread-title">${a}</span>
            <span class="thread-category">${n.charAt(0).toUpperCase()+n.slice(1)}</span>
          </div>
          <span class="thread-meta">${e.length} tweets \u2022 ${r} chars</span>
        </div>
        <div class="thread-actions">
          <button class="btn-copy-all-thread" data-thread-id="${t}" title="Copy all tweets">
            \u{1F4CB} Copy All
          </button>
          <span class="copy-all-status hidden">\u2713 All Copied!</span>
        </div>
      `,s.appendChild(o);let c=o.querySelector(".btn-copy-all-thread"),u=o.querySelector(".copy-all-status");c.addEventListener("click",async()=>{await this.copyAllTweets(e,c,u)});let h=document.createElement("div");h.className="thread-master-control",h.innerHTML=`
        <div class="master-control-header">
          <span class="control-label">Thread Length Control</span>
          <span class="control-hint">Adjust total thread length \u2022 Characters distributed proportionally</span>
        </div>
        <div class="master-control-slider">
          <div class="slider-presets">
            <button class="preset-btn" data-length="1000">Short (1K)</button>
            <button class="preset-btn" data-length="2500">Medium (2.5K)</button>
            <button class="preset-btn" data-length="5000">Long (5K)</button>
          </div>
          <div class="slider-container">
            <span class="slider-min">500</span>
            <input type="range" class="master-length-slider" min="500" max="5000" value="${r}" step="100" data-thread-id="${t}">
            <span class="slider-max">5000</span>
          </div>
          <div class="slider-value">
            <span class="current-length">${r}</span> characters total
          </div>
        </div>
        <div class="master-control-actions">
          <button class="btn-regenerate-thread" data-thread-id="${t}" title="Regenerate entire thread with new length">
            \u{1F504} Regenerate Thread
          </button>
        </div>
      `,s.appendChild(h);let m=h.querySelector(".master-length-slider"),g=h.querySelector(".current-length"),d=h.querySelector(".btn-regenerate-thread"),p=h.querySelectorAll(".preset-btn");m.addEventListener("input",y=>{g.textContent=y.target.value}),p.forEach(y=>{y.addEventListener("click",()=>{let w=y.dataset.length;m.value=w,g.textContent=w})}),d.addEventListener("click",async()=>{let y=parseInt(m.value);await this.regenerateEntireThreadForGenerator(s,t,y,n,a,i)}),e.forEach((y,w)=>{let v=`Thread ${w+1}/${e.length}`,f=this.createTwitterCard(y,v,!0);f.dataset.platform="thread",f.dataset.threadId=t,f.dataset.category=n,s.appendChild(f)}),this.messagesContainer.appendChild(s),setTimeout(()=>{this.messagesContainer.scrollTo({top:this.messagesContainer.scrollHeight,behavior:"smooth"})},100)},regenerateEntireThreadForGenerator:async function(e,t,n,a,i,s){let o=e.querySelector(".btn-regenerate-thread");if(!o)return;let r=o.textContent;o.textContent="\u23F3 Regenerating...",o.disabled=!0;try{let c=Math.max(3,Math.min(12,Math.ceil(n/400))),u="";if(s){let d=await this.loadKnowledgePack(a);d&&d.facts&&(u=`

RELEVANT KNOWLEDGE BASE:
${d.facts.slice(0,5).map((p,y)=>`${y+1}. ${p}`).join(`
`)}
`)}let h=`You are a masterful Twitter/X thread storyteller crafting ${c} tweets (${n} total characters) about ${a}. Each tweet vibrates with personality, energy, and human warmth. Write in plain text with strategic emojis - no hashtags, no URLs, no formatting. Pure storytelling magic.`,m=`Create a magnetic Twitter thread with EXACTLY ${c} tweets totaling approximately ${n} characters about: ${i}

CRITICAL FORMAT REQUIREMENT:
You MUST start each tweet with its number in this EXACT format:
1/${c}:
2/${c}:
3/${c}:
etc.

THREAD STRUCTURE:
- Tweet 1: Explosive hook (15% of total = ${Math.floor(n*.15)} chars)
- Tweets 2-${c-1}: Value bombs (60% of total = ${Math.floor(n*.6/(c-2))} chars each)
- Tweet ${c}: Unforgettable closer (25% of total = ${Math.floor(n*.25)} chars)

YOUR TONE: Curious and engaging
\u2713 Ask questions, spark wonder, invite exploration
\u2713 Enthusiastic and genuinely excited
\u2713 Human and conversational
\u2713 Bold and confident
\u2713 Strategic line breaks for visual flow

KEEP IT CLEAN:
\u2717 No hashtags
\u2717 No formatting symbols
\u2717 No URLs
\u2717 No explanations about format

${u}

Craft your ${n}-character thread now:`,g=await this.callGeminiAPIWithSystemPrompt(h,m);if(g){let d=this.cleanTwitterContent(g),p=this.parseTwitterThread(d);e.querySelectorAll(".twitter-card").forEach(T=>T.remove()),p.forEach((T,b)=>{let E=`Thread ${b+1}/${p.length}`,C=this.createTwitterCard(T,E,!0);C.dataset.platform="thread",C.dataset.threadId=t,C.dataset.category=a,e.appendChild(C)});let w=e.querySelector(".thread-meta");w&&(w.textContent=`${p.length} tweets \u2022 ${this.getTotalChars(p)} chars`);let v=e.querySelector(".current-length");v&&(v.textContent=this.getTotalChars(p));let f=e.querySelector(".master-length-slider");f&&(f.value=this.getTotalChars(p)),this.autoSaveThread&&await this.autoSaveThread(t,p,d),console.log("\u2705 Thread regenerated successfully")}}catch(c){console.error("Error regenerating thread:",c),alert("Failed to regenerate thread. Please try again.")}finally{o.textContent=r,o.disabled=!1}},showThreadGeneratorView:function(){document.getElementById("thread-generator-view")&&this.showView("thread-generator")},initializeHowItWorksToggle:function(){let e=document.getElementById("how-it-works-toggle"),t=document.getElementById("how-it-works-content");!e||!t||(t.classList.remove("expanded"),e.classList.remove("expanded"),e.addEventListener("click",()=>{t.classList.contains("expanded")?(t.classList.remove("expanded"),e.classList.remove("expanded")):(t.classList.add("expanded"),e.classList.add("expanded"))}))},handleThreadGeneratorSubmit:async function(){let e=document.getElementById("thread-category"),t=document.getElementById("thread-topic"),n=document.getElementById("use-knowledge-pack");if(!e||!t){console.error("Thread generator form elements not found");return}let a=e.value,i=t.value.trim(),s=n?n.checked:!0;if(!i){alert("Please enter a topic");return}this.showView("chat"),this.resetScreenForGeneration&&this.resetScreenForGeneration(),await this.generateThreadMVP(a,i,{useKnowledgePack:s,maxTweets:8,tone:"curious"}),t.value=""}};window.TabTalkThreadGenerator=l})();(function(){let l={initializeHorizontalScroll:function(){let e=document.querySelector(".scroll-container"),t=document.getElementById("scroll-left"),n=document.getElementById("scroll-right");if(!e||!t||!n)return;let a=200;t.addEventListener("click",()=>{e.scrollBy({left:-a,behavior:"smooth"})}),n.addEventListener("click",()=>{e.scrollBy({left:a,behavior:"smooth"})});let i=()=>{let c=e.scrollWidth-e.clientWidth;t.disabled=e.scrollLeft<=0,n.disabled=e.scrollLeft>=c};e.addEventListener("scroll",i),i(),e.addEventListener("wheel",c=>{c.deltaY!==0&&(c.preventDefault(),e.scrollLeft+=c.deltaY,i())});let s=!1,o,r;e.addEventListener("mousedown",c=>{s=!0,o=c.pageX-e.offsetLeft,r=e.scrollLeft,e.style.cursor="grabbing"}),e.addEventListener("mouseleave",()=>{s=!1,e.style.cursor="grab"}),e.addEventListener("mouseup",()=>{s=!1,e.style.cursor="grab",i()}),e.addEventListener("mousemove",c=>{if(!s)return;c.preventDefault();let h=(c.pageX-e.offsetLeft-o)*1.5;e.scrollLeft=r-h}),e.style.cursor="grab"}};window.TabTalkScroll=l})();(function(){let l={INIT_KEY:"savedContent",async loadSaved(e="twitter"){if(!window.TabTalkStorage||!TabTalkStorage.getSavedContent)return console.error("Gallery: TabTalkStorage not available"),[];let t=await TabTalkStorage.getSavedContent();return t?e==="all"?Object.entries(t).flatMap(([a,i])=>Array.isArray(i)?i.map(s=>({...s,_category:a})):[]):Array.isArray(t[e])?t[e]:[]:[]},async render(e,t="twitter"){e.innerHTML="";let n=document.createElement("div");n.className="gallery-header",n.innerHTML=`
        <button class="back-btn" id="gallery-back-btn" aria-label="Back" title="Back">\u2190</button>
        <h2>Gallery</h2>
        <div class="gallery-tools">
          <input id="gallery-search" class="gallery-search" placeholder="Search saved..." aria-label="Search saved content" />
          <select id="gallery-sort" class="gallery-sort" aria-label="Sort">
            <option value="updated_desc">Updated \u2193</option>
            <option value="created_desc">Created \u2193</option>
            <option value="length_asc">Length \u2191</option>
            <option value="length_desc">Length \u2193</option>
          </select>
          <span id="gallery-count" class="gallery-count"></span>
        </div>
      `,e.appendChild(n);let a=document.createElement("div");a.className="gallery-list",e.appendChild(a);let i=await this.loadSaved(t);this.initVirtualList(a,i),n.querySelector("#gallery-back-btn").addEventListener("click",()=>{window.TabTalkNavigation&&TabTalkNavigation.showView&&TabTalkNavigation.showView("chat")});let o=n.querySelector("#gallery-search"),r=n.querySelector("#gallery-sort"),c=n.querySelector("#gallery-count"),u=async()=>{let h=(o.value||"").toLowerCase(),m=r.value,g=await this.loadSaved(t);h&&(g=g.filter(d=>(d.content||"").toLowerCase().includes(h)||(d.domain||"").toLowerCase().includes(h))),g=this.sortItems(g,m),this.initVirtualList(a,g),this.renderList(a,g.slice(0,this._virtual.batch)),c.textContent=`${g.length}/50`};o.addEventListener("input",this.debounce(u,150)),r.addEventListener("change",u),c.textContent=`${i.length}/50`},sortItems(e,t){let n=[...e];switch(t){case"created_desc":return n.sort((a,i)=>(i.timestamp||0)-(a.timestamp||0));case"length_asc":return n.sort((a,i)=>(a.charCountAccurate||(a.content||"").length)-(i.charCountAccurate||(i.content||"").length));case"length_desc":return n.sort((a,i)=>(i.charCountAccurate||(i.content||"").length)-(a.charCountAccurate||(a.content||"").length));case"updated_desc":default:return n.sort((a,i)=>(i.updatedAt||i.timestamp||0)-(a.updatedAt||a.timestamp||0))}},renderList(e,t){if(!t||t.length===0){e.innerHTML=`
          <div class="gallery-empty">
            <img src="icons/icon128.jpeg" alt="" />
            <h3>No saved posts yet</h3>
            <p>Use the Save button on any generated card to add it here.</p>
          </div>
        `;return}if(this._virtual&&this._virtual.list===e){this.appendNextBatch();return}e.innerHTML="";let n=document.createDocumentFragment();t.forEach(a=>{let i=this.renderCard(a);n.appendChild(i)}),e.appendChild(n)},initVirtualList(e,t){let n=e;n.innerHTML="",this._virtual={list:n,items:t||[],index:0,batch:20},this.appendNextBatch(),this._virtual.items.length>this._virtual.batch&&this.appendNextBatch();let a=()=>{let{list:i}=this._virtual||{};i&&i.scrollTop+i.clientHeight>=i.scrollHeight-120&&this.appendNextBatch()};this._virtualScrollHandler&&n.removeEventListener("scroll",this._virtualScrollHandler),this._virtualScrollHandler=a,n.addEventListener("scroll",a,{passive:!0})},appendNextBatch(){let e=this._virtual;if(!e||!e.list||e.index>=e.items.length)return;let t=e.index,n=Math.min(e.index+e.batch,e.items.length),a=document.createDocumentFragment();for(let i=t;i<n;i++)a.appendChild(this.renderCard(e.items[i]));e.list.appendChild(a),e.index=n},renderCard(e){let t=document.createElement("div");t.className="gallery-card collapsed",t.setAttribute("tabindex","0"),t.setAttribute("aria-expanded","false");let n=this.getAccurateCharacterCount(e.content||"");t.innerHTML=`
        <div class="gallery-card-header">
          <div class="title-row">
            <span class="title">${this.escapeHtml(e.title||"Twitter Post")}</span>
            ${e.domain?`<span class="badge">${this.escapeHtml(e.domain)}</span>`:""}
            <span class="badge platform">${this.escapeHtml((e.platform||"twitter").toUpperCase())}</span>
          </div>
          <div class="meta-row">
            <span class="timestamp">${this.formatDate(e.updatedAt||e.timestamp)}</span>
            <span class="metrics">${n} chars</span>
            <button class="toggle-btn" aria-label="Expand" title="Expand" data-state="collapsed">\u25BE</button>
          </div>
        </div>
        <div class="gallery-card-content">
          <div class="gallery-text-wrap">
            <textarea class="gallery-text" aria-label="Saved content" disabled>${this.escapeHtml(e.content||"")}</textarea>
            <div class="fade-mask" aria-hidden="true"></div>
          </div>
          <div class="gallery-controls">
            <button class="btn copy" title="Copy">Copy</button>
            <button class="btn edit" title="Edit">Edit</button>
            <button class="btn save hidden" title="Save">Save</button>
            <button class="btn delete" title="Delete">Delete</button>
            ${e.url?'<a class="btn link" href="#" title="Open Source">Open</a>':""}
          </div>
        </div>
      `;let a=t.querySelector(".gallery-text"),i=t.querySelector(".btn.copy"),s=t.querySelector(".btn.edit"),o=t.querySelector(".btn.save"),r=t.querySelector(".btn.delete"),c=t.querySelector(".btn.link");i.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(a.value),i.textContent="Copied",i.classList.add("success"),setTimeout(()=>{i.textContent="Copy",i.classList.remove("success")},1500)}catch(d){console.error("Gallery copy failed",d)}}),s.addEventListener("click",()=>{a.disabled=!1,a.focus(),s.classList.add("hidden"),o.classList.remove("hidden"),this.autoResize(a)}),o.addEventListener("click",async()=>{a.disabled=!0,s.classList.remove("hidden"),o.classList.add("hidden");let d={content:a.value,updatedAt:Date.now(),charCountAccurate:this.getAccurateCharacterCount(a.value)};await this.updateItem(e,d)}),r.addEventListener("click",async()=>{await this.deleteItem(e),t.remove()}),c&&c.addEventListener("click",d=>{d.preventDefault(),e.url&&chrome.tabs.create({url:e.url})});let u=t.querySelector(".gallery-text-wrap"),h=t.querySelector(".toggle-btn"),m=d=>{(d!==void 0?d:t.classList.contains("collapsed"))?(t.classList.remove("collapsed"),t.setAttribute("aria-expanded","true"),h&&(h.dataset.state="expanded",h.setAttribute("aria-label","Collapse"),h.title="Collapse"),this.autoResize(a)):(t.classList.add("collapsed"),t.setAttribute("aria-expanded","false"),h&&(h.dataset.state="collapsed",h.setAttribute("aria-label","Expand"),h.title="Expand"))};return t.querySelector(".gallery-card-content").addEventListener("click",d=>{d.target.closest(".gallery-controls")||d.target.closest("button")||d.target.closest("a")||a.disabled&&m()}),h&&h.addEventListener("click",d=>{d.stopPropagation(),m()}),t.addEventListener("keydown",d=>{if(d.key==="Enter"||d.key===" "){d.preventDefault();let p=document.activeElement;if(p&&(p.closest(".gallery-controls")||p.tagName==="TEXTAREA"||p.classList.contains("toggle-btn")))return;m()}else d.key==="Escape"&&m(!1)}),setTimeout(()=>this.autoResize(a),0),t},async updateItem(e,t){let n=await TabTalkStorage.getSavedContent(),a=e._category||"twitter";if(!Array.isArray(n[a]))return;let i=n[a].findIndex(s=>s.id===e.id);i!==-1&&(n[a][i]={...n[a][i],...t},await TabTalkStorage.setStorageItem("savedContent",n))},async deleteItem(e){let t=e._category||"twitter";await TabTalkStorage.deleteSavedContent(t,e.id)},autoResize(e){e.style.height="auto",e.style.height=Math.max(80,e.scrollHeight)+"px"},debounce(e,t){let n;return(...a)=>{clearTimeout(n),n=setTimeout(()=>e.apply(this,a),t)}},getAccurateCharacterCount(e){if(!e)return 0;let t=String(e).trim(),n=0,a=Array.from(t);for(let i of a){let s=i.codePointAt(0),o=s>=126976&&s<=129535||s>=9728&&s<=9983||s>=9984&&s<=10175||s>=128512&&s<=128591||s>=127744&&s<=128511||s>=128640&&s<=128767||s>=127456&&s<=127487||s>=8205;n+=o?2:1}return n},escapeHtml(e){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")},formatDate(e){if(!e)return"";try{return new Date(e).toLocaleString()}catch{return""}}};window.galleryManager=l})();(function(){let l={async render(e){e.innerHTML="";let t=document.createElement("div");t.className="thread-library-header",t.innerHTML=`
        <button class="back-btn" id="thread-lib-back" aria-label="Back to chat">\u2190 Back</button>
        <h2>\u{1F9F5} My Threads</h2>
        <div class="thread-search-box">
          <input type="text" id="thread-search" placeholder="Search threads..." aria-label="Search threads" />
        </div>
      `,e.appendChild(t);let n=document.createElement("div");n.className="thread-list",n.id="thread-list",e.appendChild(n),await this.loadThreads(n),this.bindEvents(e)},async loadThreads(e){if(!window.TabTalkStorage||!window.TabTalkStorage.getAllThreads){e.innerHTML='<div class="empty-state"><p>Storage not available</p></div>';return}let t=await window.TabTalkStorage.getAllThreads(),n=Object.values(t);if(n.sort((a,i)=>(i.createdAt||0)-(a.createdAt||0)),e.innerHTML="",n.length===0){e.innerHTML=`
          <div class="empty-state">
            <div class="empty-icon">\u{1F9F5}</div>
            <h3>No threads yet</h3>
            <p>Generate a Twitter thread to see it here!</p>
            <p class="hint">Click "\u{1F9F5} Thread" button to create your first thread</p>
          </div>
        `;return}n.forEach(a=>{let i=this.createThreadCard(a);e.appendChild(i)})},createThreadCard(e){let t=document.createElement("div");t.className="thread-library-card",e.isAutoSaved&&t.classList.add("auto-saved");let n=this.formatTimeAgo(e.createdAt);return t.innerHTML=`
        <div class="thread-card-header">
          <div class="thread-card-title">
            ${e.isAutoSaved?"\u{1F4BE}":"\u{1F9F5}"} ${this.escapeHtml(e.title||"Untitled Thread")}
          </div>
          <div class="thread-card-meta">
            ${e.totalTweets} tweets \u2022 ${e.totalChars} chars \u2022 ${n}
          </div>
        </div>
        <div class="thread-card-preview">
          ${this.escapeHtml(e.tweets[0]?.content.substring(0,100)||"")}${e.tweets[0]?.content.length>100?"...":""}
        </div>
        <div class="thread-card-actions">
          <button class="btn-view-thread" data-thread-id="${e.id}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            View
          </button>
          <button class="btn-copy-thread" data-thread-id="${e.id}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            Copy All
          </button>
          <button class="btn-delete-thread" data-thread-id="${e.id}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            Delete
          </button>
        </div>
      `,t},bindEvents(e){let t=e.querySelector("#thread-lib-back");t&&t.addEventListener("click",()=>{window.TabTalkNavigation&&window.TabTalkNavigation.showView&&window.TabTalkNavigation.showView("chat")});let n=e.querySelector("#thread-search");n&&n.addEventListener("input",this.debounce(()=>{this.searchThreads(n.value)},300));let a=e.querySelector("#thread-list");a&&a.addEventListener("click",async i=>{let s=i.target.closest("button");if(!s)return;let o=s.dataset.threadId;o&&(s.classList.contains("btn-view-thread")?await this.viewThread(o):s.classList.contains("btn-copy-thread")?await this.copyThread(o,s):s.classList.contains("btn-delete-thread")&&await this.deleteThread(o,s))})},async viewThread(e){let t=await window.TabTalkStorage.getThread(e);t&&alert(`Thread: ${t.title}

Tweets:
${t.tweets.map((n,a)=>`${a+1}. ${n.content}`).join(`

`)}`)},async copyThread(e,t){let n=await window.TabTalkStorage.getThread(e);if(n)try{let a=n.tweets.map((s,o)=>`${o+1}/${n.totalTweets}:
${s.content}`).join(`

---

`);await navigator.clipboard.writeText(a);let i=t.innerHTML;t.innerHTML=`
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          Copied!
        `,t.classList.add("success"),setTimeout(()=>{t.innerHTML=i,t.classList.remove("success")},2e3)}catch(a){console.error("Copy failed:",a),alert("Failed to copy thread")}},async deleteThread(e,t){if(!confirm("Delete this thread? This cannot be undone."))return;if(await window.TabTalkStorage.deleteThread(e)){let a=t.closest(".thread-library-card");a&&(a.style.animation="slideOutRight 0.3s ease",setTimeout(()=>a.remove(),300))}},async searchThreads(e){let t=document.querySelector("#thread-list");if(!t)return;let n=await window.TabTalkStorage.getAllThreads(),i=Object.values(n).filter(s=>{let o=e.toLowerCase();return s.title?.toLowerCase().includes(o)||s.domain?.toLowerCase().includes(o)||s.tweets.some(r=>r.content.toLowerCase().includes(o))});if(t.innerHTML="",i.length===0){t.innerHTML=`
          <div class="empty-state">
            <p>No threads found for "${this.escapeHtml(e)}"</p>
          </div>
        `;return}i.forEach(s=>{let o=this.createThreadCard(s);t.appendChild(o)})},formatTimeAgo(e){let t=Math.floor((Date.now()-e)/1e3);return t<60?"Just now":t<3600?`${Math.floor(t/60)}m ago`:t<86400?`${Math.floor(t/3600)}h ago`:t<604800?`${Math.floor(t/86400)}d ago`:new Date(e).toLocaleDateString()},escapeHtml(e){let t=document.createElement("div");return t.textContent=e,t.innerHTML},debounce(e,t){let n;return function(...a){clearTimeout(n),n=setTimeout(()=>e.apply(this,a),t)}}};window.TabTalkThreadLibrary=l})();(function(){let l={async validateApiKey(e){if(!e||typeof e!="string"||e.trim().length===0)return{success:!1,error:"API key is required"};let t=e.trim().replace(/\s+/g,"");if(!t.startsWith("AIza"))return{success:!1,error:'Invalid API key format. Gemini API keys should start with "AIza"'};if(t.length<30)return{success:!1,error:"API key appears too short. Please check and try again."};try{return await chrome.runtime.sendMessage({action:"validateApiKey",apiKey:t})}catch(n){return console.error("Validation request failed:",n),{success:!1,error:"Failed to validate API key. Please try again."}}},async handleTestApiKey(e,t){let n=t.value.trim(),a=e.textContent;if(!n){e.textContent="Enter Key",e.style.backgroundColor="#f59e0b",setTimeout(()=>{e.textContent=a,e.style.backgroundColor=""},2e3);return}e.disabled=!0,e.textContent="Testing...";try{let i=await this.validateApiKey(n);i.success?(e.textContent="\u2713 Valid",e.style.backgroundColor="#10b981",setTimeout(()=>{e.textContent=a,e.style.backgroundColor="",e.disabled=!1},2e3)):(e.textContent="\u2717 Invalid",e.style.backgroundColor="#ef4444",console.error(`API Key validation failed: ${i.error}`),setTimeout(()=>{e.textContent=a,e.style.backgroundColor="",e.disabled=!1},3e3))}catch(i){e.textContent="Error",e.style.backgroundColor="#ef4444",console.error("An error occurred while validating the API key:",i),setTimeout(()=>{e.textContent=a,e.style.backgroundColor="",e.disabled=!1},3e3)}},async handleSaveApiKey(e,t,n){let a=t.value.trim();if(!a){e.textContent="Enter Key",e.style.backgroundColor="#f59e0b";let s=e.textContent;setTimeout(()=>{e.textContent="Save",e.style.backgroundColor=""},2e3);return}e.disabled=!0;let i=e.textContent;e.textContent="Validating...";try{let s=await this.validateApiKey(a);s.success?(await this.saveApiKey(a),e.textContent="\u2713 Saved",e.style.backgroundColor="#10b981",n&&n(),setTimeout(()=>{e.textContent=i,e.style.backgroundColor="",e.disabled=!1},2e3)):(e.textContent="\u2717 Failed",e.style.backgroundColor="#ef4444",console.error(`API Key validation failed: ${s.error}`),setTimeout(()=>{e.textContent=i,e.style.backgroundColor="",e.disabled=!1},3e3))}catch(s){e.textContent="Error",e.style.backgroundColor="#ef4444",console.error("An error occurred while saving the API key:",s),setTimeout(()=>{e.textContent=i,e.style.backgroundColor="",e.disabled=!1},3e3)}},async saveApiKey(e){let t=e.trim().replace(/\s+/g,"");window.TabTalkStorage&&window.TabTalkStorage.saveApiKey?await window.TabTalkStorage.saveApiKey(t):await chrome.storage.local.set({geminiApiKey:t,apiKey:t,hasSeenWelcome:!0})}};window.TabTalkValidation=l})();(function(){function l(){let e=document.getElementById("test-api-key"),t=document.getElementById("onboarding-api-key");if(e&&t&&window.TabTalkValidation){let i=e.cloneNode(!0);e.parentNode.replaceChild(i,e),i.addEventListener("click",async function(){await window.TabTalkValidation.handleTestApiKey(i,t);let s=document.getElementById("api-setup-continue");s&&i.textContent==="\u2713 Valid"&&(s.disabled=!1)})}let n=document.getElementById("settings-save-button"),a=document.getElementById("api-key-input");if(n&&a&&window.TabTalkValidation){let i=n.cloneNode(!0);n.parentNode.replaceChild(i,n),i.addEventListener("click",async function(s){s.preventDefault(),s.stopPropagation(),s.stopImmediatePropagation(),await window.TabTalkValidation.handleSaveApiKey(i,a,function(){window.TabTalkNavigation&&window.TabTalkNavigation.showView&&window.TabTalkNavigation.showView("chat")})})}t&&t.addEventListener("input",function(){let i=document.getElementById("api-setup-continue");i&&(i.disabled=!this.value.trim())})}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",l):l(),setTimeout(l,100)})();(function(){let l={toneDefinitions:{supportive:{id:"supportive",name:"Supportive with Facts",icon:"\u{1F91D}",color:"var(--accent-color)",category:"positive",description:"Highlight strengths, build confidence",example:"This is brilliant because...",aiInstructions:`TONE: Supportive with Facts
- Highlight 2-3 verifiable strengths from the content
- Use encouraging, confidence-building language
- Back every positive claim with specific evidence
- Maintain professional, uplifting tone
- Focus on potential and possibilities
- Use phrases like "The data shows...", "Evidence suggests...", "Research confirms..."`,keywords:["positive","encouraging","data-driven","optimistic","factual"]},critical:{id:"critical",name:"Critical with Facts",icon:"\u2694\uFE0F",color:"var(--accent-medium)",category:"critical",description:"Evidence-based critique, constructive",example:"The data shows this gap...",aiInstructions:`TONE: Critical with Facts
- Identify 1-2 weaknesses, gaps, or contradictions grounded in the content
- Use professional, evidence-based wording (no ad hominem)
- Provide constructive criticism with specific examples
- If evidence is limited, hedge appropriately (e.g., "may", "appears")
- Focus on improvement opportunities
- Use phrases like "However, the data reveals...", "A closer look shows...", "The evidence suggests otherwise..."`,keywords:["analytical","evidence-based","constructive","professional","factual"]},trolling:{id:"trolling",name:"Trolling with Facts",icon:"\u{1F608}",color:"var(--accent-light)",category:"playful",description:"Playful jabs backed by evidence",example:"Don't @ me, but the numbers say...",aiInstructions:`TONE: Trolling with Facts
- Use playful jabs, memes, and pop culture references
- Back EVERY claim with verifiable data or facts
- Maintain humor without being mean-spirited
- Use internet slang and casual language appropriately
- Include phrases like "Don't @ me but...", "The receipts say...", "Plot twist..."
- Balance sass with substance
- Keep it fun but factual`,keywords:["playful","humorous","sassy","internet-culture","evidence-backed"]},"anti-propaganda":{id:"anti-propaganda",name:"Anti-Propaganda",icon:"\u{1F6E1}\uFE0F",color:"var(--accent-color)",category:"investigative",description:"Debunk myths with facts & humor",example:"The claim vs. the reality...",aiInstructions:`TONE: Anti-Propaganda
- Identify common misconceptions or misleading claims in the content
- Use clear "Myth vs. Fact" or "Claim vs. Reality" framing
- Debunk with verifiable evidence and data
- Add subtle humor to make it engaging
- Expose logical fallacies or manipulation tactics
- Use phrases like "Let's fact-check this...", "The truth is...", "Here's what they're not telling you..."
- Maintain credibility while being entertaining`,keywords:["fact-checking","debunking","truth-seeking","investigative","educational"]},"critical-humor":{id:"critical-humor",name:"Critical with Humor",icon:"\u{1F605}",color:"var(--accent-medium)",category:"playful",description:"Clever critique with witty observations",example:"This is like that time when... but actually...",aiInstructions:`TONE: Critical with Humor
- Deliver pointed critique through clever analogies and witty observations
- Use humor to soften criticism while maintaining substance
- Never be mean-spirited or personal
- Include relatable comparisons and funny examples
- Balance entertainment with valid critique
- Use phrases like "It's like...", "Imagine if...", "This reminds me of..."
- Keep it light but insightful`,keywords:["witty","clever","analogies","entertaining","insightful"]},sarcastic:{id:"sarcastic",name:"Sarcastic",icon:"\u{1F3AD}",color:"var(--accent-light)",category:"playful",description:"Ironic commentary with bite",example:"Oh sure, because that worked so well before...",aiInstructions:`TONE: Sarcastic
- Use irony and sarcasm to highlight absurdities or contradictions
- Employ rhetorical questions and exaggerated statements
- Reference past failures or obvious flaws ironically
- Keep it clever, not cruel
- Use phrases like "Oh sure...", "Because that's totally...", "What could possibly go wrong..."
- Balance sarcasm with actual insights
- Make the irony obvious but sophisticated`,keywords:["ironic","sarcastic","rhetorical","clever","pointed"]},investigative:{id:"investigative",name:"Investigative",icon:"\u{1F50D}",color:"var(--accent-color)",category:"analytical",description:"Deep dive analysis with evidence",example:"Digging deeper reveals...",aiInstructions:`TONE: Investigative
- Adopt a journalistic, fact-finding approach
- Present findings in a structured, logical manner
- Use data, statistics, and verifiable sources
- Ask probing questions and explore implications
- Maintain objectivity while being thorough
- Use phrases like "Investigation reveals...", "Upon closer examination...", "The evidence shows..."
- Present multiple angles and perspectives
- Focus on uncovering hidden truths`,keywords:["journalistic","thorough","objective","data-driven","analytical"]},optimistic:{id:"optimistic",name:"Optimistic",icon:"\u{1F305}",color:"var(--accent-medium)",category:"positive",description:"Future-focused with positive outlook",example:"The future looks bright because...",aiInstructions:`TONE: Optimistic
- Focus on positive trends, opportunities, and potential
- Highlight progress and forward momentum
- Use hopeful, inspiring language
- Back optimism with concrete reasons and evidence
- Acknowledge challenges but emphasize solutions
- Use phrases like "The future holds...", "This opens doors to...", "We're moving toward..."
- Inspire action and positive thinking
- Balance enthusiasm with realism`,keywords:["hopeful","inspiring","future-focused","positive","motivating"]},cautionary:{id:"cautionary",name:"Cautionary",icon:"\u26A0\uFE0F",color:"var(--accent-light)",category:"analytical",description:"Warn about risks and considerations",example:"Before you proceed, consider this...",aiInstructions:`TONE: Cautionary
- Highlight potential risks, pitfalls, or unintended consequences
- Use warning language without being alarmist
- Provide specific examples of what could go wrong
- Suggest precautions and alternative approaches
- Maintain balanced perspective (not doom-and-gloom)
- Use phrases like "Be aware that...", "Consider the risks...", "History shows..."
- Focus on informed decision-making
- Back warnings with evidence`,keywords:["warning","risk-aware","careful","balanced","informative"]},empowering:{id:"empowering",name:"Empowering",icon:"\u{1F4AA}",color:"var(--accent-color)",category:"positive",description:"Inspire action and personal agency",example:"You have the power to change this by...",aiInstructions:`TONE: Empowering
- Focus on reader's ability to take action and create change
- Use direct, action-oriented language
- Provide specific, actionable steps
- Build confidence and self-efficacy
- Emphasize personal agency and control
- Use phrases like "You can...", "Take action by...", "Start today with..."
- Inspire without being preachy
- Make change feel achievable`,keywords:["action-oriented","motivating","empowering","practical","inspiring"]}},customTones:[],sessionCache:{lastSelectedTone:null,customCombinations:[]},init:function(){this.loadCustomTones(),this.createModalHTML(),this.bindModalEvents()},loadCustomTones:async function(){try{let e=await chrome.storage.local.get("customTones");e.customTones&&(this.customTones=e.customTones)}catch(e){console.error("Error loading custom tones:",e)}},saveCustomTones:async function(){try{await chrome.storage.local.set({customTones:this.customTones})}catch(e){console.error("Error saving custom tones:",e)}},createModalHTML:function(){let e=`
        <div id="tone-selector-modal" class="tone-modal hidden" role="dialog" aria-labelledby="tone-modal-title" aria-modal="true">
          <div class="tone-modal-overlay"></div>
          <div class="tone-modal-content">
            <div class="tone-modal-header">
              <h2 id="tone-modal-title">Choose your tone</h2>
              <button class="tone-modal-close" aria-label="Close tone selector">&times;</button>
            </div>

            <!-- AI Recommendations Section -->
            <div id="tone-recommendations" class="tone-recommendations hidden">
              <div class="recommendations-header">
                <span class="recommendations-title">Suggested tones</span>
              </div>
              <div id="recommended-tones" class="recommended-tones-list"></div>
            </div>

            <!-- Tone Grid -->
            <div class="tone-grid" role="radiogroup" aria-label="Select content tone">
              ${this.renderToneGrid()}
            </div>

            <!-- Custom Tone Builder Toggle -->
            <div class="custom-tone-section">
              <button id="toggle-custom-builder" class="custom-builder-toggle">
                <span class="toggle-text">Custom mix (optional)</span>
                <span class="toggle-arrow">\u25BC</span>
              </button>
              
              <div id="custom-tone-builder" class="custom-tone-builder hidden">
                <div class="builder-header">
                  <span class="builder-title">Mix two tones</span>
                </div>
                <div class="builder-selections">
                  <div class="builder-slot" data-slot="1">
                    <label>Primary</label>
                    <select id="custom-tone-1" class="builder-select">
                      <option value="">Select tone\u2026</option>
                      ${this.renderToneOptions()}
                    </select>
                  </div>
                  <div class="builder-connector">+</div>
                  <div class="builder-slot" data-slot="2">
                    <label>Secondary</label>
                    <select id="custom-tone-2" class="builder-select">
                      <option value="">Select tone\u2026</option>
                      ${this.renderToneOptions()}
                    </select>
                  </div>
                </div>
                <div class="builder-preview hidden">
                  <div class="preview-label">Preview</div>
                  <div id="custom-tone-preview" class="preview-content"></div>
                </div>
                <div class="builder-actions">
                  <button id="use-custom-tone" class="builder-btn use-btn" disabled>
                    Use this mix
                  </button>
                  <button id="save-custom-tone" class="builder-btn save-btn" disabled>
                    Save
                  </button>
                </div>
              </div>

              <!-- Saved Custom Tones -->
              <div id="saved-custom-tones" class="saved-custom-tones hidden"></div>
            </div>

            <!-- Modal Actions -->
            <div class="tone-modal-actions">
              <button id="tone-cancel-btn" class="tone-btn tone-btn-secondary">Cancel</button>
              <button id="tone-generate-btn" class="tone-btn tone-btn-primary" disabled>
                Generate
              </button>
            </div>
          </div>
        </div>
      `;document.getElementById("tone-selector-modal")||document.body.insertAdjacentHTML("beforeend",e)},renderToneGrid:function(){return Object.values(this.toneDefinitions).map(e=>`
        <div class="tone-option" 
             data-tone-id="${e.id}" 
             data-category="${e.category}"
             role="radio"
             aria-checked="false"
             tabindex="0">
          <div class="tone-icon">${e.icon}</div>
          <div class="tone-info">
            <div class="tone-name">${e.name}</div>
            <div class="tone-description">${e.description}</div>
          </div>
          <div class="tone-check">\u2713</div>
        </div>
      `).join("")},renderToneOptions:function(){return Object.values(this.toneDefinitions).map(e=>`<option value="${e.id}">${e.icon} ${e.name}</option>`).join("")},bindModalEvents:function(){let e=document.getElementById("tone-selector-modal");if(!e)return;e.querySelector(".tone-modal-close")?.addEventListener("click",()=>this.hideModal()),e.querySelector(".tone-modal-overlay")?.addEventListener("click",()=>this.hideModal()),document.getElementById("tone-cancel-btn")?.addEventListener("click",()=>this.hideModal()),e.querySelectorAll(".tone-option").forEach(m=>{m.addEventListener("click",()=>this.selectTone(m)),m.addEventListener("keydown",g=>{(g.key==="Enter"||g.key===" ")&&(g.preventDefault(),this.selectTone(m))})}),document.getElementById("tone-generate-btn")?.addEventListener("click",()=>this.handleGenerate()),document.getElementById("toggle-custom-builder")?.addEventListener("click",()=>this.toggleCustomBuilder());let r=document.getElementById("custom-tone-1"),c=document.getElementById("custom-tone-2");r?.addEventListener("change",()=>this.updateCustomPreview()),c?.addEventListener("change",()=>this.updateCustomPreview()),document.getElementById("save-custom-tone")?.addEventListener("click",()=>this.saveCustomCombination()),document.getElementById("use-custom-tone")?.addEventListener("click",()=>this.useCustomCombination()),e.addEventListener("keydown",m=>{m.key==="Escape"&&this.hideModal()})},showModal:async function(e,t){let n=document.getElementById("tone-selector-modal");if(!n)return;this.currentPlatform=e,this.currentPageContent=t,n.classList.remove("hidden"),n.setAttribute("aria-hidden","false"),n.querySelector(".tone-option")?.focus(),await this.generateRecommendations(t),this.renderSavedCustomTones()},hideModal:function(){let e=document.getElementById("tone-selector-modal");e&&(e.classList.add("hidden"),e.setAttribute("aria-hidden","true"),this.resetSelections())},selectTone:function(e){document.querySelectorAll(".tone-option").forEach(a=>{a.classList.remove("selected"),a.setAttribute("aria-checked","false")}),e.classList.add("selected"),e.setAttribute("aria-checked","true"),this.selectedToneId=e.dataset.toneId,this.selectedTone=this.toneDefinitions[this.selectedToneId];let n=document.getElementById("tone-generate-btn");n&&(n.disabled=!1),this.sessionCache.lastSelectedTone=this.selectedToneId},generateRecommendations:async function(e){let t=document.getElementById("tone-recommendations"),n=document.getElementById("recommended-tones");if(!(!t||!n))try{t.classList.remove("hidden"),n.innerHTML='<div class="recommendations-loading">Analyzing content...</div>';let a=await this.analyzeContentForTones(e);a.length>0?(n.innerHTML=a.map(s=>`
            <div class="recommended-tone" data-tone-id="${s.toneId}">
              <div class="rec-badge">Recommended</div>
              <div class="rec-tone-icon" style="color: ${s.color}">${s.icon}</div>
              <div class="rec-tone-info">
                <div class="rec-tone-name">${s.name}</div>
                <div class="rec-reason">${s.reason}</div>
                <div class="rec-confidence">Match: ${s.confidence}%</div>
              </div>
            </div>
          `).join(""),n.querySelectorAll(".recommended-tone").forEach(s=>{s.addEventListener("click",()=>{let o=s.dataset.toneId,r=document.querySelector(`.tone-option[data-tone-id="${o}"]`);r&&(this.selectTone(r),r.scrollIntoView({behavior:"smooth",block:"center"}))})})):n.innerHTML='<div class="no-recommendations">All tones work well for this content!</div>'}catch(a){console.error("Error generating recommendations:",a),n.innerHTML='<div class="recommendations-error">Could not analyze content</div>'}},analyzeContentForTones:async function(e){let t=e.toLowerCase(),n=[],a=/controversy|debate|disagree|conflict|dispute/i.test(e),i=/data|statistics|study|research|evidence|percent|number/i.test(e),s=/claim|assert|state|argue|maintain/i.test(e),o=/success|achievement|breakthrough|innovation|progress/i.test(e),r=/problem|issue|concern|risk|danger|failure/i.test(e),c=/funny|joke|ironic|amusing|hilarious/i.test(e),u=/future|upcoming|next|will|plan|forecast/i.test(e),h=/warning|caution|beware|careful|risk/i.test(e),m=e.length,g=e.split(/\s+/).length;return a&&i&&n.push({toneId:"critical",...this.toneDefinitions.critical,reason:"Content contains controversial claims with data - perfect for evidence-based critique",confidence:92}),s&&!i&&n.push({toneId:"anti-propaganda",...this.toneDefinitions["anti-propaganda"],reason:"Multiple claims detected without strong evidence - ideal for fact-checking",confidence:88}),o&&i&&n.push({toneId:"supportive",...this.toneDefinitions.supportive,reason:"Positive developments backed by data - great for supportive commentary",confidence:90}),a&&c&&n.push({toneId:"trolling",...this.toneDefinitions.trolling,reason:"Controversial topic with humorous elements - perfect for playful fact-based trolling",confidence:85}),r&&!a&&n.push({toneId:"critical-humor",...this.toneDefinitions["critical-humor"],reason:"Issues present without heated debate - ideal for witty critique",confidence:83}),u&&o&&n.push({toneId:"optimistic",...this.toneDefinitions.optimistic,reason:"Forward-looking content with positive outlook - great for optimistic framing",confidence:87}),(h||r&&i)&&n.push({toneId:"cautionary",...this.toneDefinitions.cautionary,reason:"Risks or concerns identified - suitable for cautionary perspective",confidence:84}),i&&m>2e3&&n.push({toneId:"investigative",...this.toneDefinitions.investigative,reason:"Substantial content with data - perfect for deep investigative analysis",confidence:86}),o&&g<500&&n.push({toneId:"empowering",...this.toneDefinitions.empowering,reason:"Concise positive content - ideal for empowering call-to-action",confidence:81}),n.sort((d,p)=>p.confidence-d.confidence).slice(0,3)},toggleCustomBuilder:function(){let e=document.getElementById("custom-tone-builder"),t=document.getElementById("toggle-custom-builder"),n=t?.querySelector(".toggle-arrow");if(e&&t){let a=e.classList.contains("hidden");e.classList.toggle("hidden"),n&&(n.textContent=a?"\u25B2":"\u25BC")}},updateCustomPreview:function(){let e=document.getElementById("custom-tone-1"),t=document.getElementById("custom-tone-2"),n=document.getElementById("custom-tone-preview"),a=document.querySelector(".builder-preview"),i=document.getElementById("save-custom-tone"),s=document.getElementById("use-custom-tone");if(!e||!t||!n)return;let o=e.value,r=t.value;if(o&&r&&o!==r){let c=this.toneDefinitions[o],u=this.toneDefinitions[r];n.innerHTML=`
          <div class="preview-tones">
            <span class="preview-tone" style="color: ${c.color}">
              ${c.icon} ${c.name}
            </span>
            <span class="preview-plus">+</span>
            <span class="preview-tone" style="color: ${u.color}">
              ${u.icon} ${u.name}
            </span>
          </div>
          <div class="preview-description">
            ${this.generateCombinedDescription(c,u)}
          </div>
        `,a?.classList.remove("hidden"),i&&(i.disabled=!1),s&&(s.disabled=!1)}else a?.classList.add("hidden"),i&&(i.disabled=!0),s&&(s.disabled=!0)},generateCombinedDescription:function(e,t){return`Combines ${e.name.toLowerCase()} with ${t.name.toLowerCase()} for a unique perspective that ${e.description.toLowerCase()} while ${t.description.toLowerCase()}.`},saveCustomCombination:async function(){let e=document.getElementById("custom-tone-1"),t=document.getElementById("custom-tone-2");if(!e||!t)return;let n=e.value,a=t.value;if(!n||!a||n===a)return;let i={id:`custom-${Date.now()}`,tone1Id:n,tone2Id:a,name:`${this.toneDefinitions[n].name} + ${this.toneDefinitions[a].name}`,createdAt:Date.now()};this.customTones.push(i),await this.saveCustomTones(),this.renderSavedCustomTones(),this.showToast("\u2713 Custom tone saved!")},useCustomCombination:function(){let e=document.getElementById("custom-tone-1"),t=document.getElementById("custom-tone-2");if(!e||!t)return;let n=e.value,a=t.value;if(!n||!a||n===a)return;this.selectedToneId="custom",this.selectedTone={id:"custom",name:`${this.toneDefinitions[n].name} + ${this.toneDefinitions[a].name}`,tone1:this.toneDefinitions[n],tone2:this.toneDefinitions[a],aiInstructions:this.combineAIInstructions(this.toneDefinitions[n],this.toneDefinitions[a])};let i=document.getElementById("tone-generate-btn");i&&(i.disabled=!1),this.showToast("\u2713 Custom tone selected!")},combineAIInstructions:function(e,t){return`COMBINED TONE: ${e.name} + ${t.name}

PRIMARY TONE (${e.name}):
${e.aiInstructions}

SECONDARY TONE (${t.name}):
${t.aiInstructions}

INTEGRATION RULES:
- Lead with the primary tone's approach
- Weave in secondary tone's characteristics naturally
- Balance both perspectives throughout
- Ensure cohesive voice, not jarring shifts
- Maintain factual accuracy from both tones`},renderSavedCustomTones:function(){let e=document.getElementById("saved-custom-tones");if(!e)return;if(this.customTones.length===0){e.classList.add("hidden");return}e.classList.remove("hidden"),e.innerHTML=`
        <div class="saved-tones-header">Saved Custom Tones</div>
        <div class="saved-tones-list">
          ${this.customTones.map(a=>{let i=this.toneDefinitions[a.tone1Id],s=this.toneDefinitions[a.tone2Id];return`
              <div class="saved-custom-tone" data-custom-id="${a.id}">
                <div class="saved-tone-icons">
                  <span style="color: ${i.color}">${i.icon}</span>
                  <span class="saved-plus">+</span>
                  <span style="color: ${s.color}">${s.icon}</span>
                </div>
                <div class="saved-tone-name">${a.name}</div>
                <button class="saved-tone-delete" data-custom-id="${a.id}" title="Delete">\xD7</button>
              </div>
            `}).join("")}
        </div>
      `,e.querySelectorAll(".saved-custom-tone").forEach(a=>{a.addEventListener("click",i=>{i.target.classList.contains("saved-tone-delete")||this.selectSavedCustomTone(a.dataset.customId)})}),e.querySelectorAll(".saved-tone-delete").forEach(a=>{a.addEventListener("click",i=>{i.stopPropagation(),this.deleteCustomTone(a.dataset.customId)})})},selectSavedCustomTone:function(e){let t=this.customTones.find(s=>s.id===e);if(!t)return;let n=this.toneDefinitions[t.tone1Id],a=this.toneDefinitions[t.tone2Id];this.selectedToneId="custom",this.selectedTone={id:"custom",name:t.name,tone1:n,tone2:a,aiInstructions:this.combineAIInstructions(n,a)};let i=document.getElementById("tone-generate-btn");i&&(i.disabled=!1),this.showToast("\u2713 Custom tone selected!")},deleteCustomTone:async function(e){this.customTones=this.customTones.filter(t=>t.id!==e),await this.saveCustomTones(),this.renderSavedCustomTones(),this.showToast("Custom tone deleted")},handleGenerate:function(){this.selectedTone&&(this.onGenerateCallback&&this.onGenerateCallback(this.selectedTone,this.currentPlatform),this.hideModal())},resetSelections:function(){document.querySelectorAll(".tone-option").forEach(n=>{n.classList.remove("selected"),n.setAttribute("aria-checked","false")}),this.selectedToneId=null,this.selectedTone=null;let t=document.getElementById("tone-generate-btn");t&&(t.disabled=!0)},showToast:function(e){let t=document.createElement("div");t.className="tone-toast",t.textContent=e,t.style.cssText=`
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: rgba(16, 185, 129, 0.95);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10001;
        animation: slideInUp 0.3s ease;
      `,document.body.appendChild(t),setTimeout(()=>{t.style.animation="slideOutDown 0.3s ease",setTimeout(()=>t.remove(),300)},2e3)},show:function(e,t,n){this.onGenerateCallback=n,this.showModal(e,t)}};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>l.init()):l.init(),window.TabTalkToneSelector=l})();(function(){let l={STORAGE_KEY:"niche_system",currentNiche:null,async init(){await this.loadNicheData(),this.bindEvents()},async loadNicheData(){try{let e=await this.getStorageItem(this.STORAGE_KEY);e&&(this.currentNiche=e.currentNiche,console.log("Niche system loaded:",this.currentNiche))}catch(e){console.error("Failed to load niche data:",e)}},async saveNicheData(){try{let e={currentNiche:this.currentNiche,lastUpdated:Date.now()};await this.setStorageItem(this.STORAGE_KEY,e)}catch(e){console.error("Failed to save niche data:",e)}},async setNiche(e){if(!e||e.trim().length===0)throw new Error("Niche description cannot be empty");return this.currentNiche={description:e.trim(),createdAt:Date.now(),id:this.generateId()},await this.saveNicheData(),console.log("Niche set to:",this.currentNiche),this.currentNiche},getCurrentNiche(){return this.currentNiche},hasNiche(){return this.currentNiche!==null},async clearNiche(){this.currentNiche=null,await this.saveNicheData(),console.log("Niche cleared")},generateId(){return"niche_"+Date.now()+"_"+Math.random().toString(36).substr(2,9)},async getStorageItem(e){try{return(await chrome.storage.local.get([e]))[e]}catch(t){return console.error("getStorageItem error:",t),null}},async setStorageItem(e,t){try{return await chrome.storage.local.set({[e]:t}),!0}catch(n){return console.error("setStorageItem error:",n),!1}},bindEvents(){}};window.NicheManager=l})();(function(){let l={STORAGE_KEY:"ai_memory",MAX_ITEMS_PER_NICHE:50,SUMMARY_MAX_LENGTH:500,async init(){await this.cleanupStorage()},async addMemoryItem(e,t,n={}){try{if(!window.NicheManager.hasNiche())throw new Error("Please set a niche first");let a=window.NicheManager.getCurrentNiche().id,i=await this.getMemoryData();if(i.niches[a]||(i.niches[a]=[]),i.niches[a].length>=this.MAX_ITEMS_PER_NICHE){let o=i.niches[a].filter(r=>!r.isViral);if(o.length>0){let r=o[0],c=i.niches[a].indexOf(r);i.niches[a].splice(c,1)}else throw new Error("Memory limit reached. Please mark some items as non-viral or upgrade for more storage.")}let s={id:this.generateId(),type:e,content:t,summary:await this.summarizeContent(t),metadata:n,isViral:!1,createdAt:Date.now(),nicheId:a};return i.niches[a].unshift(s),await this.saveMemoryData(i),console.log("Memory item added:",s.id),s}catch(a){throw console.error("Failed to add memory item:",a),a}},async markAsViral(e){let t=await this.getMemoryData(),n=window.NicheManager.getCurrentNiche().id;if(t.niches[n]){let a=t.niches[n].find(i=>i.id===e);if(a)return a.isViral=!0,a.markedViralAt=Date.now(),await this.saveMemoryData(t),console.log("Item marked as viral:",e),!0}return!1},async removeMemoryItem(e){let t=await this.getMemoryData(),n=window.NicheManager.getCurrentNiche().id;if(t.niches[n]){let a=t.niches[n].findIndex(i=>i.id===e);if(a!==-1)return t.niches[n].splice(a,1),await this.saveMemoryData(t),console.log("Memory item removed:",e),!0}return!1},async getMemoryItems(){if(!window.NicheManager.hasNiche())return[];let e=window.NicheManager.getCurrentNiche().id;return(await this.getMemoryData()).niches[e]||[]},async getSmartContext(e=10){let t=await this.getMemoryItems();return t.length===0?"":`Previous successful content in this niche:
${t.sort((s,o)=>s.isViral&&!o.isViral?-1:!s.isViral&&o.isViral?1:o.createdAt-s.createdAt).slice(0,e).map(s=>`[${s.type.toUpperCase()}] ${s.summary}`).join(`

`)}`},async summarizeContent(e){let t=typeof e=="string"?e:e.text||e.title||"";return t.length<=this.SUMMARY_MAX_LENGTH?t:t.split(/[.!?]+/).filter(s=>s.trim().length>10).slice(0,3).join(". ").substring(0,this.SUMMARY_MAX_LENGTH)+(t.length>this.SUMMARY_MAX_LENGTH?"...":"")},async getMemoryData(){try{return await this.getStorageItem(this.STORAGE_KEY)||{niches:{},lastCleanup:Date.now()}}catch(e){return console.error("Failed to get memory data:",e),{niches:{},lastCleanup:Date.now()}}},async saveMemoryData(e){try{await this.setStorageItem(this.STORAGE_KEY,e)}catch(t){throw console.error("Failed to save memory data:",t),t}},async cleanupStorage(){try{let e=await this.getMemoryData(),t=Date.now(),n=t-720*60*60*1e3;Object.keys(e.niches).forEach(a=>{e.niches[a]=e.niches[a].filter(i=>i.isViral||i.createdAt>n)}),e.lastCleanup=t,await this.saveMemoryData(e),console.log("Memory cleanup completed")}catch(e){console.error("Memory cleanup failed:",e)}},generateId(){return"memory_"+Date.now()+"_"+Math.random().toString(36).substr(2,9)},async getStorageItem(e){try{return(await chrome.storage.local.get([e]))[e]}catch(t){return console.error("getStorageItem error:",t),null}},async setStorageItem(e,t){try{return await chrome.storage.local.set({[e]:t}),!0}catch(n){return console.error("setStorageItem error:",n),!1}}};window.MemoryManager=l})();(function(){let l={async init(){await window.NicheManager.init(),await window.MemoryManager.init(),this.bindEvents(),await this.renderNicheStatus()},bindEvents(){let e=document.getElementById("set-niche-btn"),t=document.getElementById("clear-niche-btn"),n=document.getElementById("niche-input");e&&e.addEventListener("click",()=>this.handleSetNiche()),t&&t.addEventListener("click",()=>this.handleClearNiche()),n&&n.addEventListener("keypress",s=>{s.key==="Enter"&&this.handleSetNiche()});let a=document.getElementById("add-memory-btn");a&&a.addEventListener("click",()=>this.handleAddMemory());let i=document.getElementById("clear-memory-inputs-btn");i&&i.addEventListener("click",()=>this.clearInputs())},clearInputs(){let e=document.getElementById("memory-url-input"),t=document.getElementById("memory-content-input");e&&(e.value=""),t&&(t.value=""),this.showNotification("Inputs cleared","info")},async handleSetNiche(){let e=document.getElementById("niche-input"),t=e?.value?.trim();if(!t){this.showNotification("Please enter a niche description","error");return}try{await window.NicheManager.setNiche(t),await this.renderNicheStatus(),this.showNotification("Niche set successfully!","success"),e.value=""}catch(n){console.error("Failed to set niche:",n),this.showNotification(n.message||"Failed to set niche","error")}},async handleClearNiche(){if(confirm("Are you sure you want to clear your niche? This will not delete your memory items."))try{await window.NicheManager.clearNiche(),await this.renderNicheStatus(),this.showNotification("Niche cleared","success")}catch(e){console.error("Failed to clear niche:",e),this.showNotification("Failed to clear niche","error")}},async handleAddMemory(){let e=document.getElementById("memory-url-input"),t=document.getElementById("memory-content-input"),n=e?.value?.trim(),a=t?.value?.trim();if(!n&&!a){this.showNotification("Please enter a URL or content","error");return}if(!window.NicheManager.hasNiche()){this.showNotification("Please set a niche first","error");return}try{let i={url:n||null,text:a||null,title:n?this.extractTitleFromUrl(n):a?a.substring(0,50)+"...":"Manual Entry"},s=n?"url":"text";await window.MemoryManager.addMemoryItem(s,i,{addedFrom:"manual",timestamp:Date.now(),hasUrl:!!n,hasText:!!a}),await this.renderMemoryList(),this.showNotification("Added to memory! Both URL and text saved.","success")}catch(i){console.error("Failed to add memory:",i),this.showNotification(i.message||"Failed to add memory","error")}},async handleMarkViral(e){try{await window.MemoryManager.markAsViral(e),await this.renderMemoryList(),this.showNotification("Marked as viral!","success")}catch(t){console.error("Failed to mark as viral:",t),this.showNotification("Failed to mark as viral","error")}},async handleDeleteMemory(e){if(confirm("Remove this item from memory?"))try{await window.MemoryManager.removeMemoryItem(e),await this.renderMemoryList(),this.showNotification("Memory item removed","success")}catch(t){console.error("Failed to delete memory:",t),this.showNotification("Failed to delete memory","error")}},async renderNicheStatus(){let e=document.getElementById("current-niche-display"),t=document.getElementById("current-niche-text"),n=document.getElementById("memory-collection-section"),a=window.NicheManager.getCurrentNiche();a?(e&&e.classList.remove("hidden"),t&&(t.textContent=a.description),n&&n.classList.remove("hidden"),await this.renderMemoryList()):(e&&e.classList.add("hidden"),n&&n.classList.add("hidden"))},async renderMemoryList(){let e=document.getElementById("memory-items-container"),t=document.getElementById("memory-count"),n=document.getElementById("memory-limit");if(!e)return;let a=await window.MemoryManager.getMemoryItems();if(t&&(t.textContent=a.length),n&&(n.textContent=window.MemoryManager.MAX_ITEMS_PER_NICHE),a.length===0){e.innerHTML='<div class="empty-memory">No memory items yet. Add your first one above!</div>';return}e.innerHTML=a.map(i=>this.renderMemoryItem(i)).join(""),a.forEach(i=>{let s=document.getElementById(`delete-memory-${i.id}`),o=document.getElementById(`viral-memory-${i.id}`);s&&s.addEventListener("click",()=>this.handleDeleteMemory(i.id)),o&&o.addEventListener("click",()=>this.handleMarkViral(i.id))})},renderMemoryItem(e){let t=new Date(e.createdAt).toLocaleDateString(),n=e.isViral?'<span class="viral-badge">\u{1F525} Viral</span>':"",a=e.content.url,i=e.content.text;return`
        <div class="memory-item ${e.isViral?"viral":""}">
          <div class="memory-item-header">
            <span class="memory-type">${a?"\u{1F517}":"\u{1F4DD}"}</span>
            <span class="memory-date">${t}</span>
            ${n}
          </div>
          <div class="memory-item-content">
            ${i?`<p class="memory-summary">${this.escapeHtml(e.content.text)}</p>`:`<p class="memory-summary">${this.escapeHtml(e.summary)}</p>`}
            ${a?`<a href="${this.escapeHtml(e.content.url)}" target="_blank" class="memory-url">\u{1F517} ${this.escapeHtml(e.content.url)}</a>`:""}
          </div>
          <div class="memory-item-actions">
            ${e.isViral?"":`<button id="viral-memory-${e.id}" class="memory-action-btn viral-btn">Mark Viral</button>`}
            <button id="delete-memory-${e.id}" class="memory-action-btn delete-btn">Delete</button>
          </div>
        </div>
      `},extractTitleFromUrl(e){try{let t=new URL(e);return t.hostname+t.pathname.substring(0,30)}catch{return"URL"}},escapeHtml(e){let t=document.createElement("div");return t.textContent=e,t.innerHTML},showNotification(e,t="info"){let n=document.createElement("div");n.className=`memory-notification ${t}`,n.textContent=e,n.style.cssText=`
        position: fixed;
        top: 60px;
        right: 20px;
        padding: 12px 20px;
        background: ${t==="success"?"#4CAF50":t==="error"?"#f44336":"#2196F3"};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
      `,document.body.appendChild(n),setTimeout(()=>{n.style.animation="slideOut 0.3s ease",setTimeout(()=>n.remove(),300)},3e3)}};window.MemoryBuilderUI=l})();(function(){let l={currentView:"chat",init(){this.bindEvents(),this.updateActiveState("chat")},bindEvents(){document.querySelectorAll(".nav-item").forEach(t=>{t.addEventListener("click",n=>{n.preventDefault();let a=t.getAttribute("data-view");this.navigateToView(a)})})},navigateToView(e){window.TabTalkNavigation&&window.TabTalkNavigation.showView&&window.TabTalkNavigation.showView(e),this.updateActiveState(e),this.currentView=e},updateActiveState(e){document.querySelectorAll(".nav-item").forEach(n=>{n.getAttribute("data-view")===e?n.classList.add("active"):n.classList.remove("active")})},toggleVisibility(e){let t=document.getElementById("bottom-nav");t&&(t.style.display=e?"flex":"none")},setActive(e){this.updateActiveState(e),this.currentView=e}};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>l.init()):l.init(),window.BottomNav=l})();(()=>{var l=class{constructor(){this.apiKey=null,this.currentTab=null,this.pageContent=null,this.isLoading=!1,this.currentDomain=null,this.messagesContainer=document.getElementById("messages-container"),this.pageStatus=document.getElementById("page-status"),this.pageTitle=document.getElementById("page-title"),this.quickActions=document.getElementById("quick-actions"),this.sidebar=document.getElementById("sidebar"),this.quickTwitterBtn=document.getElementById("quick-twitter"),this.quickTwitterThreadBtn=document.getElementById("quick-twitter-thread"),this.quickCreateBtn=document.getElementById("quick-create"),this.welcomeView=document.getElementById("welcome-view"),this.apiSetupView=document.getElementById("api-setup-view"),this.chatView=document.getElementById("chat-view"),this.settingsView=document.getElementById("settings-view"),this.menuButton=document.getElementById("menu-button"),this.apiKeyInput=document.getElementById("api-key-input")||document.getElementById("settings-api-key"),this.inputActions=document.querySelector(".input-actions"),this.exportFormatSelect=document.getElementById("export-format-select"),this.statusText=document.getElementById("status-text"),this.views={welcome:this.welcomeView,"api-setup":this.apiSetupView,chat:this.chatView,settings:this.settingsView}}async init(){try{console.log("TabTalk AI: Initializing popup");let t=await chrome.tabs.query({active:!0,currentWindow:!0});!t||t.length===0?(console.error("TabTalk AI: Failed to get current tab"),this.pageStatus&&(this.pageStatus.textContent="\u274C Failed to access current tab")):(this.currentTab=t[0],console.log("TabTalk AI: Current tab:",this.currentTab.url)),await this.loadState(),this.bindEvents();let n=await this.getStorageItem("hasSeenWelcome");this.apiKey?(this.showView("chat"),await this.getAndCachePageContent()):n?this.showView("api-setup"):this.showView("welcome"),console.log("TabTalk AI: Popup initialized")}catch(t){console.error("TabTalk AI: Initialization error:",t),this.pageStatus&&(this.pageStatus.textContent=`\u274C Initialization failed: ${t.message}`),this.showView&&this.showView("welcome")}}bindEvents(){let t=document.getElementById("settings-cancel-button"),n=document.getElementById("settings-save-button");t&&t.addEventListener("click",()=>{this.updateViewState(this.apiKey?"chat":"settings")}),n&&n.addEventListener("click",()=>this.handleSaveSettings());let a=document.getElementById("delete-api-key-button");a&&a.addEventListener("click",()=>this.handleDeleteApiKey()),console.log("Menu Button:",this.menuButton),console.log("Sidebar:",this.sidebar),this.menuButton&&this.sidebar&&(this.menuButton.addEventListener("click",y=>{y.stopPropagation(),console.log("Menu button clicked!");let w=this.sidebar.classList.contains("hidden");w?(this.sidebar.classList.remove("hidden"),this.sidebar.style.display="block"):(this.sidebar.classList.add("hidden"),this.sidebar.style.display="none"),console.log("Sidebar is now:",w?"visible":"hidden"),this.sidebar.setAttribute("aria-expanded",w?"false":"true")}),document.addEventListener("click",y=>{this.sidebar.classList.contains("hidden")||!this.sidebar.contains(y.target)&&y.target!==this.menuButton&&(this.sidebar.classList.add("hidden"),this.sidebar.setAttribute("aria-expanded","false"))}),this.sidebar.addEventListener("keydown",y=>{y.key==="Escape"&&(this.sidebar.classList.add("hidden"),this.sidebar.setAttribute("aria-expanded","false"),this.menuButton.focus())}));let i=document.getElementById("menu-settings-link");i&&i.addEventListener("click",y=>{y.preventDefault(),this.updateViewState("settings"),this.sidebar&&this.sidebar.classList.add("hidden")});let s=document.getElementById("menu-gallery-link");s&&s.addEventListener("click",y=>{y.preventDefault(),this.showView("gallery"),this.sidebar&&(this.sidebar.classList.add("hidden"),this.sidebar.style.display="none")});let o=document.getElementById("menu-threads-link");o&&o.addEventListener("click",y=>{y.preventDefault(),this.showView("threads"),this.sidebar&&(this.sidebar.classList.add("hidden"),this.sidebar.style.display="none")});let r=document.getElementById("welcome-get-started");r&&r.addEventListener("click",async()=>{await this.setStorageItem("hasSeenWelcome",!0),this.showView("api-setup")});let c=document.getElementById("welcome-start");c&&c.addEventListener("click",async()=>{await this.setStorageItem("hasSeenWelcome",!0),this.showView("api-setup")});let u=document.getElementById("api-setup-back");u&&u.addEventListener("click",()=>{this.showView("welcome")});let h=document.getElementById("api-setup-back-arrow");h&&h.addEventListener("click",()=>{this.showView("welcome")});let m=document.getElementById("api-setup-continue");m&&m.addEventListener("click",async()=>{let y=document.getElementById("onboarding-api-key").value.trim();y&&(await this.saveApiKey(y),this.showView("chat"),await this.getAndCachePageContent())});let g=document.getElementById("test-api-key");g&&g.addEventListener("click",async()=>{let y=document.getElementById("onboarding-api-key").value.trim();if(y){let w=await this.testApiKey(y),v=document.getElementById("api-setup-continue");w?(g.textContent="\u2713 Valid",g.style.background="#10b981",g.style.color="white",v.disabled=!1):(g.textContent="\u2717 Invalid",g.style.background="#ef4444",g.style.color="white",v.disabled=!0),setTimeout(()=>{g.textContent="Test",g.style.background="",g.style.color=""},2e3)}});let d=document.getElementById("onboarding-api-key");d&&d.addEventListener("input",()=>{let y=document.getElementById("api-setup-continue");y.disabled=!d.value.trim()}),this.menuButton&&this.menuButton.setAttribute("aria-label","Open menu"),this.apiKeyInput&&this.apiKeyInput.setAttribute("aria-label","Gemini API Key"),this.quickTwitterBtn&&this.quickTwitterBtn.addEventListener("click",async()=>{this.resetScreenForGeneration&&this.resetScreenForGeneration(),await this.generateSocialContent("twitter")}),this.quickTwitterThreadBtn&&this.quickTwitterThreadBtn.addEventListener("click",async()=>{this.resetScreenForGeneration&&this.resetScreenForGeneration(),await this.generateSocialContent("thread")}),this.quickCreateBtn&&this.quickCreateBtn.addEventListener("click",()=>{window.TabTalkThreadGenerator&&window.TabTalkThreadGenerator.showModal?window.TabTalkThreadGenerator.showModal(this):this.showView("thread-generator")});let p=document.getElementById("generate-thread-btn");p&&p.addEventListener("click",async()=>{this.handleThreadGeneratorSubmit&&await this.handleThreadGeneratorSubmit()}),this.initializeHorizontalScroll(),window.TabTalkThreadGenerator&&window.TabTalkThreadGenerator.init&&(console.log("TabTalk AI: Initializing Thread Generator modal..."),window.TabTalkThreadGenerator.init())}async testApiKey(t){try{let n=await chrome.runtime.sendMessage({action:"testApiKey",apiKey:t});return n&&n.success}catch(n){return console.error("Error testing API key:",n),!1}}async handleSaveSettings(){let t=this.apiKeyInput?this.apiKeyInput.value.trim():"";if(!t){alert("Please enter a valid API key");return}await this.testApiKey(t)?(await this.saveApiKey(t),console.log("TabTalk AI: Saving API key with key name 'geminiApiKey' successfully"),this.showView("chat"),await this.getAndCachePageContent()):alert("Invalid API key. Please try again.")}async getAndCachePageContent(){if(!(!this.currentTab||!this.apiKey)){this.setLoading(!0,"Reading page..."),this.pageStatus.textContent="Injecting script to read page...";try{if(this.currentTab.url?.startsWith("chrome://")||this.currentTab.url?.startsWith("https://chrome.google.com/webstore"))throw new Error("Cannot run on protected browser pages.");let t=await chrome.scripting.executeScript({target:{tabId:this.currentTab.id},files:["content.js"]});if(!t||t.length===0)throw new Error("Script injection failed.");let n=t[0].result;if(n.success)this.pageContent=n.content,this.pageStatus.textContent=`\u2705 Content loaded (${(n.content.length/1024).toFixed(1)} KB)`,this.updateQuickActionsVisibility();else throw new Error(n.error)}catch(t){console.error("TabTalk AI (popup):",t),this.pageStatus.textContent=`\u274C ${t.message}`}finally{this.setLoading(!1)}}}};let e=l.prototype.init;document.addEventListener("DOMContentLoaded",()=>{window.TabTalkAPI&&Object.assign(l.prototype,window.TabTalkAPI),window.TabTalkTwitter&&Object.assign(l.prototype,window.TabTalkTwitter),window.TabTalkThreadGenerator&&Object.assign(l.prototype,window.TabTalkThreadGenerator),window.TabTalkContentAnalysis&&Object.assign(l.prototype,window.TabTalkContentAnalysis),window.TabTalkSocialMedia&&Object.assign(l.prototype,window.TabTalkSocialMedia),window.TabTalkStorage&&Object.assign(l.prototype,window.TabTalkStorage),window.TabTalkUI&&Object.assign(l.prototype,window.TabTalkUI),window.TabTalkScroll&&Object.assign(l.prototype,window.TabTalkScroll),window.TabTalkNavigation&&Object.assign(l.prototype,window.TabTalkNavigation),l.prototype.init=async function(){return await e.call(this),this},new l().init().catch(t=>console.error("Initialization error:",t))})})();})();
