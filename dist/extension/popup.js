(()=>{(function(){let h={async callGeminiAPIWithSystemPrompt(e,t){if(!this.apiKey||!t)throw new Error("Missing API key or user prompt");if(!this.pageContent&&(this.pageStatus.textContent="\u26A0\uFE0F Re-analyzing page before generating content...",await this.getAndCachePageContent(),!this.pageContent))throw new Error("Could not get page content to generate content.");let n=[{role:"user",parts:[{text:e},{text:t}]}],a=await chrome.runtime.sendMessage({action:"callGeminiAPI",payload:{contents:n},apiKey:this.apiKey});if(a.success&&a.data?.candidates?.[0]?.content?.parts?.[0]?.text)return a.data.candidates[0].content.parts[0].text;throw new Error(a.error||"The AI gave an empty or invalid response.")}};window.TabTalkAPI=h})();(function(){let h={async getStorageItem(e){try{let t=await chrome.storage.local.get([e]);return t?t[e]:void 0}catch(t){console.error("getStorageItem error:",t);return}},async setStorageItem(e,t){try{return await chrome.storage.local.set({[e]:t}),!0}catch(n){return console.error("setStorageItem error:",n),!1}},async loadState(){try{let e=await chrome.storage.local.get(["geminiApiKey","apiKey"]);if(console.log("TabTalk AI: Loading state, API key exists:",!!e.geminiApiKey),(e.geminiApiKey||e.apiKey)&&(this.apiKey=e.geminiApiKey||e.apiKey,console.log("TabTalk AI: API key loaded successfully"),this.apiKeyInput&&(this.apiKeyInput.value=this.apiKey)),this.currentTab){let t=new URL(this.currentTab.url);this.currentDomain=t.hostname,this.pageTitle&&(this.pageTitle.textContent=this.currentTab.title||"Untitled Page",console.log("TabTalk AI: Page title set to:",this.pageTitle.textContent))}return e}catch(e){throw console.error("Failed to load state:",e),e}},async saveState(){this.apiKey&&await chrome.storage.local.set({geminiApiKey:this.apiKey})},async saveApiKey(e){this.apiKey=e;try{await chrome.storage.local.set({geminiApiKey:e,apiKey:e,hasSeenWelcome:!0}),console.log("TabTalk AI: API key saved")}catch{await this.setStorageItem("apiKey",e),await this.setStorageItem("hasSeenWelcome",!0)}},async handleDeleteApiKey(){if(confirm("Delete your API key? You will need to set it up again."))try{await chrome.storage.local.remove(["geminiApiKey","apiKey"]),this.apiKey=null,this.apiKeyInput&&(this.apiKeyInput.value=""),this.pageContent=null,this.updateQuickActionsVisibility&&this.updateQuickActionsVisibility(),this.messagesContainer&&(this.messagesContainer.innerHTML=""),await this.setStorageItem("hasSeenWelcome",!1),this.showView("welcome"),console.log("TabTalk AI: API key deleted")}catch(e){console.error("Error deleting API key:",e),alert("Error deleting API key. Please try again.")}},async getSavedContent(){return await this.getStorageItem("savedContent")||{}},async saveContent(e,t){let n=await this.getSavedContent();n[e]||(n[e]=[]);let a={id:Date.now().toString(),...t,timestamp:Date.now()};return n[e].unshift(a),n[e].length>50&&(n[e]=n[e].slice(0,50)),await this.setStorageItem("savedContent",n),console.log(`TabTalk AI: Content saved to ${e} category`),a.id},async deleteSavedContent(e,t){let n=await this.getSavedContent();n[e]&&(n[e]=n[e].filter(a=>a.id!==t),await this.setStorageItem("savedContent",n),console.log(`TabTalk AI: Content deleted from ${e} category`))},async isContentSaved(e,t){return(await this.getSavedContent())[e]?.some(a=>a.id===t)||!1},async saveThread(e){try{let t=await this.getStorageItem("savedThreads")||{};return t[e.id]={...e,savedAt:Date.now(),updatedAt:Date.now()},await this.setStorageItem("savedThreads",t),console.log("TabTalk AI: Thread saved persistently:",e.id),e.id}catch(t){return console.error("Error saving thread:",t),null}},async getAllThreads(){try{return await this.getStorageItem("savedThreads")||{}}catch(e){return console.error("Error loading threads:",e),{}}},async getThread(e){try{return(await this.getAllThreads())[e]||null}catch(t){return console.error("Error loading thread:",t),null}},async deleteThread(e){try{let t=await this.getAllThreads();return delete t[e],await this.setStorageItem("savedThreads",t),console.log("TabTalk AI: Thread deleted:",e),!0}catch(t){return console.error("Error deleting thread:",t),!1}},async updateThread(e,t){try{let n=await this.getAllThreads();return n[e]?(n[e]={...n[e],...t,updatedAt:Date.now()},await this.setStorageItem("savedThreads",n),console.log("TabTalk AI: Thread updated:",e),!0):!1}catch(n){return console.error("Error updating thread:",n),!1}}};window.TabTalkStorage=h})();(function(){let h={showView:function(e){document.querySelectorAll(".view").forEach(u=>u.classList.add("hidden")),e==="welcome"||e==="api-setup"||e==="settings"?document.body.classList.add("onboarding-view"):document.body.classList.remove("onboarding-view"),window.BottomNav&&window.BottomNav.setActive(e);let a=document.getElementById("quick-actions");a&&(e==="chat"?a.classList.remove("hidden"):a.classList.add("hidden"));let s=document.getElementById("bottom-nav"),i=document.querySelector("main"),o=document.querySelector(".container");e==="welcome"||e==="api-setup"||e==="settings"?(s&&(s.style.display="none",s.style.visibility="hidden",s.style.height="0"),i&&(i.style.paddingBottom="0"),o&&(o.style.paddingBottom="0")):(s&&(s.style.display="flex",s.style.visibility="visible",s.style.height="45px"),i&&(i.style.paddingBottom="45px"),o&&(o.style.paddingBottom="66px"));let r=`${e}-view`;e==="chat"&&(r="chat-view"),e==="settings"&&(r="settings-view"),e==="welcome"&&(r="welcome-view"),e==="api-setup"&&(r="api-setup-view"),e==="history"&&(r="history-view"),e==="gallery"&&(r="gallery-view"),e==="threads"&&(r="threads-view");let c=document.getElementById(r);if(c){if(c.classList.remove("hidden"),e==="history"&&window.historyManager&&this.loadHistoryView(),e==="gallery"&&window.galleryManager){let u=document.getElementById("gallery-container");u&&window.galleryManager.render(u,"twitter")}if(e==="threads"&&window.TabTalkThreadLibrary){let u=document.getElementById("threads-container");u&&window.TabTalkThreadLibrary.render(u)}e==="thread-generator"&&this.initializeHowItWorksToggle&&this.initializeHowItWorksToggle()}else console.warn(`showView: target view not found for "${e}" (id "${r}")`)},loadHistoryView:function(){if(!window.historyManager){console.error("History manager not initialized");return}let e=document.getElementById("history-list");e&&(e.innerHTML='<div class="loading-history">Loading saved content...</div>',window.historyManager.loadHistory("all").then(t=>{window.historyManager.renderHistoryList(e,t,"all")}).catch(t=>{console.error("Error loading history:",t),e.innerHTML='<div class="empty-history">Error loading saved content</div>'}))},updateViewState:function(e,t="Loading..."){if(this.sidebar&&(this.sidebar.classList.add("hidden"),this.sidebar.style.display="none"),Object.values(this.views).forEach(n=>n.classList.add("hidden")),this.views[e]?(this.views[e].classList.remove("hidden"),e==="chat"&&this.messageInput?this.messageInput.focus():e==="settings"&&this.apiKeyInput&&this.apiKeyInput.focus()):console.error(`View "${e}" not found`),e==="status"&&this.statusText&&(this.statusText.textContent=t),e==="settings"){let n=document.querySelector(".onboarding-info");n&&(n.style.display=this.apiKey?"none":"block")}this.setAriaStatus(`Switched to ${e} view. ${t}`)}};window.TabTalkNavigation=h})();(function(){let h={ensureMarked:function(){return!this.marked&&window.marked&&(this.marked=window.marked),!!this.marked},setAriaStatus:function(e){let t=document.getElementById("aria-status");t&&(t.textContent=e)},sanitizeStructuredOutput:function(e,t){if(!t)return"";let n=String(t);return n=n.replace(/^(?:here\s*(?:is|are|\'s|'s)|below\s+is|certainly,|sure,|note:|here\'s a|here's a)[^\n:]*:\s*/i,""),n=n.replace(/^\s*(?:here\s*(?:is|are|\'s|'s)\s*(?:a|an)?\s*)/i,""),n=n.replace(/\s*\*\s+(?=[^\n])/g,`
- `),n=n.replace(/^[ \t]*[•*]\s+/gm,"- "),n=n.replace(/\n{3,}/g,`

`),n=n.replace(/\((https?:\/\/[^\s)]+)\)\s*\(\1\)/g,"($1)"),n=n.replace(/(https?:\/\/[^\s)]+)\s*\(\1\)/g,"$1"),n=n.replace(/^[`\s]+/,"").replace(/[\s`]+$/,""),(e==="keypoints"||e==="summary")&&(n=n.replace(/\*\*([^*]+)\*\*/g,"$1"),n=n.replace(/\*([^*]+)\*/g,"$1"),n=n.replace(/_([^_]+)_/g,"$1")),e==="keypoints"&&!/^\s*-\s+/m.test(n)&&(n=n.split(/\s*\*\s+|\n+/).filter(Boolean).map(a=>a.replace(/^[-•*]\s+/,"").trim()).filter(Boolean).map(a=>`- ${a}`).join(`
`)),n.trim()},setLoading:function(e,t="..."){this.isLoading=e,e?(this.pageStatus&&(this.pageStatus.textContent=t),this.setAriaStatus(t)):(this.pageStatus&&!this.pageStatus.textContent.startsWith("\u2705")&&(this.pageStatus.textContent="\u2705 Done"),this.setAriaStatus("Ready"))},updateQuickActionsVisibility:function(){this.quickActions&&this.quickActions.classList.toggle("hidden",!this.pageContent)},resetScreenForGeneration:function(){this.sidebar&&(this.sidebar.classList.add("hidden"),this.sidebar.style.display="none"),this.messagesContainer&&(this.messagesContainer.innerHTML=""),this.updateQuickActionsVisibility()},renderCard:function(e,t,n={}){let a=document.createElement("div");a.className="twitter-content-container";let s=document.createElement("div");s.className="twitter-card analytics-card",s.dataset.contentType=n.contentType||"content",s.dataset.contentId=n.contentId||Date.now().toString();let i={summary:"\u{1F4DD}",keypoints:"\u{1F511}",analysis:"\u{1F4CA}",faq:"\u2753",factcheck:"\u2705",blog:"\u{1F4F0}",proscons:"\u2696\uFE0F",timeline:"\u{1F4C5}",quotes:"\u{1F4AC}"},o=n.contentType||"content",r=i[o]||"\u{1F4C4}",c=n.markdown?`data-markdown="${encodeURIComponent(n.markdown)}"`:"";if(s.innerHTML=`
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
      `,window.TabTalkUI&&window.TabTalkUI.addSaveButtonToCard){let p=n.contentType||"content",l={id:n.contentId||Date.now().toString(),content:n.markdown||t,title:e},m=s.querySelector(".twitter-header-actions");m&&window.TabTalkUI.addSaveButtonToCard(m,p,l)}let u=s.querySelector(".copy-btn"),d=u.innerHTML;u.addEventListener("click",async p=>{p.stopPropagation();try{let l=s.querySelector(".structured-html"),m=l?.getAttribute("data-markdown"),y=m?decodeURIComponent(m):l?.innerText||"";await navigator.clipboard.writeText(y),u.innerHTML=`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20,6 9,17 4,12"></polyline>
          </svg>`,u.classList.add("success"),setTimeout(()=>{u.innerHTML=d,u.classList.remove("success")},2e3)}catch(l){console.error("Copy failed:",l)}}),a.appendChild(s);let g=n.container||this.messagesContainer;return g.appendChild(a),g===this.messagesContainer&&g.scrollTo({top:g.scrollHeight,behavior:"smooth"}),s},showProgressBar:function(e){this.hideProgressBar();let t=document.createElement("div");t.className="progress-container",t.id="global-progress",t.innerHTML=`
        <div class="progress-message">${e}</div>
        <div class="progress-bar"><div class="progress-fill"></div></div>
      `,this.messagesContainer.appendChild(t),this.messagesContainer.scrollTo({top:this.messagesContainer.scrollHeight,behavior:"smooth"}),setTimeout(()=>{let n=t.querySelector(".progress-fill");n&&(n.style.width="100%")},100)},hideProgressBar:function(){let e=document.getElementById("global-progress");e&&e.remove()},addSaveButtonToCard:function(e,t,n){if(!e||!t||!n)return;let a=document.createElement("button");e.classList.contains("twitter-header-actions")?(a.className="twitter-action-btn save-btn",a.innerHTML=`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
        </svg>`):(a.className="save-btn",a.innerHTML=`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
        </svg>`),a.setAttribute("aria-label","Save to history"),a.setAttribute("data-category",t),a.setAttribute("data-content-id",n.id||Date.now().toString()),a.title="Save to history",window.TabTalkStorage&&window.TabTalkStorage.isContentSaved(t,n.id||Date.now().toString()).then(i=>{i&&(a.classList.add("saved"),a.querySelector("svg").setAttribute("fill","currentColor"))}),a.addEventListener("click",async i=>{i.stopPropagation();let o=a.getAttribute("data-content-id"),r=a.getAttribute("data-category");if(!window.TabTalkStorage)return;if(await window.TabTalkStorage.isContentSaved(r,o))await window.TabTalkStorage.deleteSavedContent(r,o),a.classList.remove("saved"),a.querySelector("svg").setAttribute("fill","none"),this.showToast("Removed from saved content");else{let u=n.content||e.querySelector(".content-text")?.textContent||"",d={source:this.currentTab?.url||window.location.href,title:this.currentTab?.title||document.title};await window.TabTalkStorage.saveContent(r,{id:o,content:u,metadata:d,...n}),a.classList.add("saved"),a.querySelector("svg").setAttribute("fill","currentColor"),this.showToast("Saved to history")}}),e.appendChild(a)},showToast:function(e,t=2e3){let n=document.createElement("div");n.className="toast",n.textContent=e,document.body.appendChild(n),setTimeout(()=>{n.classList.add("visible")},10),setTimeout(()=>{n.classList.remove("visible"),setTimeout(()=>n.remove(),300)},t)}};window.TabTalkUI=h})();(function(){let h={analyzeAndResearchContent:async function(e,t){let n=this.simpleHash(e.substring(0,500)),a=`analysis_${this.currentTab?.url}_${t.id}_${n}`;try{let i=await chrome.storage.local.get(a);if(i[a]&&Date.now()-i[a].timestamp<18e5)return console.log("Using cached content analysis"),i[a].analysis}catch(i){console.warn("Cache check failed:",i)}let s=`You are an expert content analyst and researcher. Analyze this webpage content and provide:

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
RESEARCH CONTEXT: [relevant background knowledge and expert perspective]`;try{let i=await this.callGeminiAPIWithSystemPrompt("You are an expert content analyst who provides structured, insightful analysis.",s),o=this.parseAnalysisResponse(i);try{let r={};r[a]={analysis:o,timestamp:Date.now()},await chrome.storage.local.set(r)}catch(r){console.warn("Failed to cache analysis:",r)}return o}catch(i){return console.error("Analysis failed:",i),{summary:"Content analysis unavailable.",keyInsights:"- Focus on core message from the content",researchContext:"Apply general domain knowledge and best practices."}}},simpleHash:function(e){let t=0;for(let n=0;n<e.length;n++){let a=e.charCodeAt(n);t=(t<<5)-t+a,t=t&t}return Math.abs(t).toString(36)},parseAnalysisResponse:function(e){let t=e.match(/SUMMARY:\s*(.+?)(?=KEY INSIGHTS:|$)/s),n=e.match(/KEY INSIGHTS:\s*(.+?)(?=RESEARCH CONTEXT:|$)/s),a=e.match(/RESEARCH CONTEXT:\s*(.+?)$/s);return{summary:t?t[1].trim():"Content provides valuable information.",keyInsights:n?n[1].trim():"- Key points from the content",researchContext:a?a[1].trim():"General domain knowledge applies."}},showToneSelector:function(e){if(!this.pageContent||!this.apiKey){this.showToast?this.showToast("\u274C Please set up your Gemini API key first and ensure page content is loaded.",3e3):alert("\u274C Please set up your Gemini API key first and ensure page content is loaded.");return}window.TabTalkToneSelector?window.TabTalkToneSelector.show(e,this.pageContent,(t,n)=>{this.generateSocialContentWithTone(n,t)}):(console.error("Tone selector not loaded"),this.generateSocialContentWithTone(e,{id:"supportive",name:"Supportive with Facts"}))},generateSocialContent:async function(e){this.showToneSelector(e)},generateSocialContentWithTone:async function(e,t){if(!this.pageContent||!this.apiKey){this.showToast?this.showToast("\u274C Please set up your Gemini API key first and ensure page content is loaded.",3e3):alert("\u274C Please set up your Gemini API key first and ensure page content is loaded.");return}this.currentSelectedTone=t,this.setLoading(!0,"Analyzing content..."),console.log(`TabTalk AI: Generating ${e} content for page: ${this.currentTab?.title}`),console.log(`Page content length: ${this.pageContent.length} characters`),console.log(`Selected tone: ${t.name} (${t.id})`);try{this.showProgressBar("Analyzing content...");let n=await this.analyzeAndResearchContent(this.pageContent,t);this.currentContentAnalysis=n,this.showProgressBar("Generating expert post...");let a="",s="",i="",o=t.aiInstructions||this.getDefaultToneInstructions(t.id);if(e==="twitter")i="\u{1F426}",a=`You are an expert Twitter/X content strategist who combines deep analysis with engaging storytelling. You leverage comprehensive research and domain expertise to create posts that are both intellectually rigorous and captivating. Your posts stop people mid-scroll because they offer genuine insights backed by evidence and expert knowledge.

Write in plain text only - no hashtags, no URLs, no formatting symbols. Just pure, engaging expert expression with strategic emojis.

${o}

CONTEXT ANALYSIS:
${n.summary}

KEY INSIGHTS:
${n.keyInsights}

RESEARCH AUGMENTATION (from domain knowledge):
${n.researchContext}`,s=`Transform this webpage content into an electrifying Twitter/X post that feels authentically human.

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

Write your captivating post now:`;else if(e==="thread")i="\u{1F9F5}",a=`You are an expert Twitter/X thread strategist who combines deep analysis with compelling narrative structure. You leverage comprehensive research and domain expertise to create threads that educate, engage, and inspire. Each tweet builds on expert insights while maintaining human warmth and accessibility.

Write in plain text with strategic emojis - no hashtags, no URLs, no formatting symbols. Expert storytelling that resonates.

${o}

CONTEXT ANALYSIS:
${n.summary}

KEY INSIGHTS:
${n.keyInsights}

RESEARCH AUGMENTATION (from domain knowledge):
${n.researchContext}`,s=`Create a magnetic Twitter thread (3-8 tweets) from this content.

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

Generate your thread now:`;else{this.showToast?this.showToast("\u274C Only Twitter/X Post and Twitter Thread are supported.",3e3):alert("\u274C Only Twitter/X Post and Twitter Thread are supported.");return}let r=await this.callGeminiAPIWithSystemPrompt(a,s);if(r){console.log(`TabTalk AI: Successfully generated ${e} content, response length: ${r.length} characters`);let c=this.cleanTwitterContent(r);if(this.addTwitterMessage("assistant",c,e),this.addToHistory){let u={timestamp:new Date().toISOString(),url:this.currentTab?.url||"",title:this.currentTab?.title||"",domain:this.currentDomain||"",content:c,type:e};await this.addToHistory(e,u)}await this.saveState()}else throw new Error("Empty response received from Gemini API")}catch(n){console.error("Error generating social content:",n),console.error("Error details:",{message:n.message,stack:n.stack,platform:e,hasApiKey:!!this.apiKey,hasPageContent:!!this.pageContent,pageContentLength:this.pageContent?.length}),this.showToast?this.showToast(`\u274C Error: ${n.message}. Please check your API key and try again.`,4e3):alert(`\u274C Error generating social media content: ${n.message}. Please check your API key and try again.`)}finally{this.setLoading(!1),this.hideProgressBar()}},showProgressBar:function(e){this.hideProgressBar();let t=document.createElement("div");t.className="progress-container",t.id="twitter-progress",t.innerHTML=`
        <div class="progress-message">${e}</div>
        <div class="progress-bar">
          <div class="progress-fill"></div>
        </div>
      `,this.messagesContainer.appendChild(t),this.messagesContainer.scrollTo({top:this.messagesContainer.scrollHeight,behavior:"smooth"}),setTimeout(()=>{let n=t.querySelector(".progress-fill");n&&(n.style.width="100%")},100)},hideProgressBar:function(){let e=document.getElementById("twitter-progress");e&&e.remove()},addTwitterMessage:function(e,t,n){this.renderTwitterContent(t,n)},renderTwitterContent:function(e,t){let n=document.createElement("div");if(n.className="twitter-content-container",t==="thread"){let a=this.parseTwitterThread(e),s=`thread_${Date.now()}`;this.autoSaveThread(s,a,e);let i=document.createElement("div");i.className="thread-header";let o=this.getTotalChars(a);i.innerHTML=`
          <div class="thread-info">
            <span class="thread-icon">\u{1F9F5}</span>
            <span class="thread-title">Thread Generated</span>
            <span class="thread-meta">${a.length} tweets \u2022 ${o} chars</span>
          </div>
          <div class="thread-actions">
            <button class="btn-copy-all-thread" data-thread-id="${s}" title="Copy all tweets">
              \u{1F4CB}
            </button>
            <span class="copy-all-status hidden">\u2713 All Copied!</span>
          </div>
        `,n.appendChild(i);let r=document.createElement("div");r.className="thread-master-control",r.innerHTML=`
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
              <input type="range" class="master-length-slider" min="500" max="5000" value="${o}" step="100" data-thread-id="${s}">
              <span class="slider-max">5000</span>
            </div>
            <div class="slider-value">
              <span class="current-length">${o}</span> characters total
            </div>
          </div>
          <div class="master-control-actions">
            <button class="btn-regenerate-thread" data-thread-id="${s}" title="Regenerate entire thread with new length">
              \u{1F504} Regenerate Thread
            </button>
          </div>
        `,n.appendChild(r);let c=i.querySelector(".btn-copy-all-thread"),u=i.querySelector(".copy-all-status");c.addEventListener("click",async()=>{await this.copyAllTweets(a,c,u)});let d=r.querySelector(".master-length-slider"),g=r.querySelector(".current-length"),p=r.querySelector(".btn-regenerate-thread"),l=r.querySelectorAll(".preset-btn");d.addEventListener("input",m=>{g.textContent=m.target.value}),l.forEach(m=>{m.addEventListener("click",()=>{let y=m.dataset.length;d.value=y,g.textContent=y})}),p.addEventListener("click",async()=>{let m=parseInt(d.value);await this.regenerateEntireThread(n,s,m,e)}),a.forEach((m,y)=>{let w=`Thread ${y+1}/${a.length}`,v=this.createTwitterCard(m,w,!0);v.dataset.platform=t,v.dataset.threadId=s,n.appendChild(v)})}else{let a=this.createTwitterCard(e,"Post");a.dataset.platform=t,n.appendChild(a)}this.messagesContainer.appendChild(n),setTimeout(()=>{this.messagesContainer.scrollTo({top:this.messagesContainer.scrollHeight,behavior:"smooth"})},100)},parseTwitterThread:function(e){let n=this.cleanTwitterContent(e).replace(/Here's your clean.*?content:\s*/gi,"").trim(),a=[],s=n.split(`
`),i="",o=null;for(let r of s){let c=r.trim(),u=c.match(/^(\d+)\/(\d+)[\s:]*(.*)$/);u?(i.trim()&&a.push(i.trim()),o=u[1],i=u[3]||""):o!==null&&c&&(i+=(i?`
`:"")+c)}return i.trim()&&a.push(i.trim()),a.length===0?(console.warn("Thread parsing failed, returning full content as single tweet"),[n||e]):(console.log(`\u2705 Parsed ${a.length} tweets from thread`),a)},createTwitterCard:function(e,t,n=!1){let a=document.createElement("div");a.className="twitter-card";let s=this.currentSelectedTone?`
        <div class="tone-badge" style="background: linear-gradient(135deg, ${this.currentSelectedTone.tone1?.color||this.getToneColor(this.currentSelectedTone.id)} 0%, ${this.currentSelectedTone.tone2?.color||this.getToneColor(this.currentSelectedTone.id)} 100%);">
          ${this.currentSelectedTone.tone1?.icon||this.getToneIcon(this.currentSelectedTone.id)} ${this.currentSelectedTone.name}
        </div>
      `:"",i=n?`
        <div class="twitter-controls">
          <div class="twitter-char-count">${this.getAccurateCharacterCount(e)} characters</div>
        </div>
      `:`
        <div class="twitter-controls">
          ${s}
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
          ${i}
        </div>
      `,window.TabTalkUI&&window.TabTalkUI.addSaveButtonToCard){let d={id:Date.now().toString(),content:e,title:t},g=t.toLowerCase().includes("thread")?"thread":"twitter",p=a.querySelector(".twitter-header-actions");p&&window.TabTalkUI.addSaveButtonToCard(p,g,d)}let o=a.querySelector(".copy-btn"),r=a.querySelector(".twitter-text"),c=o.innerHTML;o.addEventListener("click",async d=>{d.stopPropagation();try{await navigator.clipboard.writeText(r.value),o.innerHTML=`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20,6 9,17 4,12"></polyline>
          </svg>`,o.classList.add("success"),setTimeout(()=>{o.innerHTML=c,o.classList.remove("success")},2e3)}catch(g){console.error("Copy failed:",g)}});let u=()=>{r.style.height="auto",r.style.height=Math.max(80,r.scrollHeight)+"px"};if(setTimeout(u,0),r.addEventListener("input",()=>{let d=a.querySelector(".twitter-char-count"),g=this.getAccurateCharacterCount(r.value);d.textContent=`${g} characters`,d.style.color="var(--text-secondary)",u()}),!n){let d=a.querySelector(".length-slider"),g=a.querySelector(".length-display"),p=a.querySelector(".regenerate-btn");d&&g&&d.addEventListener("input",()=>{g.textContent=d.value}),a.dataset.originalContent=this.pageContent,a.dataset.platform=t.includes("Thread")?"thread":"twitter",this.currentSelectedTone&&(a.dataset.selectedTone=JSON.stringify(this.currentSelectedTone)),p&&p.addEventListener("click",async()=>{let l=parseInt(d.value),m=a.dataset.platform,y=a.dataset.selectedTone?JSON.parse(a.dataset.selectedTone):this.currentSelectedTone;await this.regenerateWithLength(a,l,m,{selectedTone:y})})}return a},cleanTwitterContent:function(e){if(!e)return e;let t=e;return t=t.replace(/^.*?Unacceptable.*?\n/gim,""),t=t.replace(/^.*?critical failure.*?\n/gim,""),t=t.replace(/^.*?forbidden.*?formatting.*?\n/gim,""),t=t.replace(/^.*?breaks the instructions.*?\n/gim,""),t=t.replace(/^.*?--[•\-]\s*Original Response:.*?\n/gim,""),t=t.replace(/^.*?You have used.*?\n/gim,""),t=t.replace(/^.*?This output is unusable.*?\n/gim,""),t=t.replace(/^.*?Here's your.*?content:.*?\n/gim,""),t=t.replace(/^.*?OUTPUT:.*?\n/gim,""),t=t.replace(/#\w+/g,""),t=t.replace(/#/g,""),t=t.replace(/\*\*([^*]+)\*\*/g,"$1"),t=t.replace(/\*([^*]+)\*/g,"$1"),t=t.replace(/_{2,}([^_]+)_{2,}/g,"$1"),t=t.replace(/_([^_]+)_/g,"$1"),t=t.replace(/\*{2,}/g,""),t=t.replace(/_{2,}/g,""),t=t.replace(/\(line break\)/gi,`
`),t=t.replace(/\[line break\]/gi,`
`),t=t.replace(/^[-*]\s+/gm,"\u2022 "),t=t.replace(/https?:\/\/\S+/gi,""),t=t.replace(/\((https?:\/\/[^)]+)\)/gi,""),t=t.replace(/www\.\S+/gi,""),t=t.replace(/\[([^\]]+)\]\([^)]+\)/g,"$1"),t=t.replace(/\[([^\]]+)\]/g,"$1"),t=t.replace(/\(emphasis\)/gi,""),t=t.replace(/\(bold\)/gi,""),t=t.replace(/\(italic\)/gi,""),t=t.replace(/\n{3,}/g,`

`),t=t.replace(/[ \t]+/g," "),t=t.replace(/(^|\n)\s*$/g,""),t=t.trim(),t},getAccurateCharacterCount:function(e){if(!e)return 0;let t=e.trim(),n=0,a=Array.from(t);for(let s of a)this.isEmojiOrSpecialChar(s)?n+=2:n+=1;return n},isEmojiOrSpecialChar:function(e){let t=e.codePointAt(0);return t>=126976&&t<=129535||t>=9728&&t<=9983||t>=9984&&t<=10175||t>=128512&&t<=128591||t>=127744&&t<=128511||t>=128640&&t<=128767||t>=127456&&t<=127487||t>=8205},regenerateWithLength:async function(e,t,n,a){let s=e.querySelector(".twitter-text"),i=e.querySelector(".regenerate-btn"),o=e.dataset.originalContent;i.textContent="\u23F3",i.disabled=!0;try{let r="",c="",u=a&&a.selectedTone||this.currentSelectedTone||{id:"supportive",name:"Supportive with Facts"},d=u.aiInstructions||this.getDefaultToneInstructions(u.id),g=this.currentContentAnalysis||{summary:"Content provides valuable information.",keyInsights:"- Key points from the content",researchContext:"Apply general domain knowledge and best practices."};if(n==="twitter")r=`You are an expert Twitter/X content strategist creating ${t}-character posts that combine deep analysis with engaging storytelling. Every word is backed by research and expertise while radiating personality and human warmth. Write in plain text with strategic emojis - no hashtags, no URLs, no formatting symbols.

${d}

CONTEXT ANALYSIS:
${g.summary}

KEY INSIGHTS:
${g.keyInsights}

RESEARCH AUGMENTATION:
${g.researchContext}`,c=`Recreate this as an expert ${t}-character Twitter post that combines insight with engagement.

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

Transform it now:`;else if(n==="thread"){let l=Math.ceil(t/400);r=`You are an expert Twitter/X thread strategist crafting ${l} tweets (${t} total characters) that combine deep analysis with compelling narrative. Each tweet builds on expert insights while maintaining human warmth and accessibility. Write in plain text with strategic emojis - no hashtags, no URLs, no formatting.

${d}

CONTEXT ANALYSIS:
${g.summary}

KEY INSIGHTS:
${g.keyInsights}

RESEARCH AUGMENTATION:
${g.researchContext}`,c=`Recreate this as an expert ${l}-tweet thread (around ${t} characters total).

YOUR STORYTELLING APPROACH:
\u2713 Create ${l} numbered tweets (1/${l}, 2/${l}, etc.)
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

Craft your thread now:`}let p=await this.callGeminiAPIWithSystemPrompt(r,c);if(p){let l=this.cleanTwitterContent(p);if(n==="thread"){let v=this.parseTwitterThread(l)[0]||l;s.value=v}else s.value=l;let m=e.querySelector(".twitter-char-count"),y=this.getAccurateCharacterCount(s.value);m.textContent=`${y} characters`,setTimeout(()=>{s.style.height="auto",s.style.height=Math.max(80,s.scrollHeight)+"px"},0)}}catch(r){console.error("Error regenerating content:",r),alert("Error regenerating content. Please try again.")}finally{i.textContent="\u{1F504}",i.disabled=!1}},getDefaultToneInstructions:function(e){let t={supportive:`TONE: Supportive with Facts
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
- Achievable steps`};return t[e]||t.supportive},getToneColor:function(e){return{supportive:"var(--accent-color)",critical:"var(--accent-medium)",trolling:"var(--accent-light)","anti-propaganda":"var(--accent-color)","critical-humor":"var(--accent-medium)",sarcastic:"var(--accent-light)",investigative:"var(--accent-color)",optimistic:"var(--accent-medium)",cautionary:"var(--accent-light)",empowering:"var(--accent-color)"}[e]||"var(--accent-color)"},getToneIcon:function(e){return{supportive:"\u{1F91D}",critical:"\u2694\uFE0F",trolling:"\u{1F608}","anti-propaganda":"\u{1F6E1}\uFE0F","critical-humor":"\u{1F605}",sarcastic:"\u{1F3AD}",investigative:"\u{1F50D}",optimistic:"\u{1F305}",cautionary:"\u26A0\uFE0F",empowering:"\u{1F4AA}"}[e]||"\u{1F3AD}"},autoSaveThread:async function(e,t,n){if(!window.TabTalkStorage||!window.TabTalkStorage.saveThread){console.warn("Storage module not available for thread persistence");return}try{let a=await window.TabTalkStorage.getAllThreads(),s=Object.values(a).filter(o=>o.isAutoSaved);for(let o of s)await window.TabTalkStorage.deleteThread(o.id),console.log("\u{1F5D1}\uFE0F Deleted old auto-saved thread:",o.id);let i={id:e,title:this.currentTab?.title||"Untitled Thread",url:this.currentTab?.url||"",domain:this.currentDomain||"",platform:"thread",isAutoSaved:!0,tweets:t.map((o,r)=>({id:`tweet_${r+1}`,number:`${r+1}/${t.length}`,content:o,charCount:this.getAccurateCharacterCount(o)})),rawContent:n,totalTweets:t.length,totalChars:this.getTotalChars(t),createdAt:Date.now()};await window.TabTalkStorage.saveThread(i),console.log("\u2705 Thread auto-saved persistently:",e),this.showAutoSaveNotification()}catch(a){console.error("Error auto-saving thread:",a)}},copyAllTweets:async function(e,t,n){try{let a=e.map((s,i)=>`${i+1}/${e.length}:
${s}`).join(`

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
      `,document.body.appendChild(e),setTimeout(()=>{e.style.animation="slideOutDown 0.3s ease",setTimeout(()=>e.remove(),300)},2e3)},regenerateEntireThread:async function(e,t,n,a){let s=e.querySelector(".btn-regenerate-thread");if(!s)return;let i=s.textContent;s.textContent="\u23F3 Regenerating...",s.disabled=!0;try{let o=Math.max(3,Math.min(8,Math.ceil(n/500))),r=`You are a masterful Twitter/X thread storyteller crafting ${o} tweets (${n} total characters) that captivate from start to finish. Each tweet vibrates with personality, energy, and human warmth. You turn complex ideas into addictive narratives. Write in plain text with strategic emojis - no hashtags, no URLs, no formatting. Pure storytelling magic.`,c=`Create a magnetic Twitter thread with EXACTLY ${o} tweets totaling approximately ${n} characters.

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

Craft your ${n}-character thread now:`,u=await this.callGeminiAPIWithSystemPrompt(r,c);if(u){let d=this.cleanTwitterContent(u),g=this.parseTwitterThread(d);e.querySelectorAll(".twitter-card").forEach(w=>w.remove()),g.forEach((w,v)=>{let f=`Thread ${v+1}/${g.length}`,T=this.createTwitterCard(w,f,!0);T.dataset.platform="thread",T.dataset.threadId=t,e.appendChild(T)});let l=e.querySelector(".thread-meta");l&&(l.textContent=`${g.length} tweets \u2022 ${this.getTotalChars(g)} chars`);let m=e.querySelector(".current-length");m&&(m.textContent=this.getTotalChars(g));let y=e.querySelector(".master-length-slider");y&&(y.value=this.getTotalChars(g)),await this.autoSaveThread(t,g,d),console.log("\u2705 Thread regenerated successfully")}}catch(o){console.error("Error regenerating thread:",o),alert("Failed to regenerate thread. Please try again.")}finally{s.textContent=i,s.disabled=!1}}};window.TabTalkTwitter=h})();(function(){let h={knowledgePacks:{},modalInitialized:!1,popupInstance:null,init:function(){this.modalInitialized||(this.createModalHTML(),this.bindModalEvents(),this.modalInitialized=!0)},createModalHTML:function(){document.getElementById("thread-generator-modal")||document.body.insertAdjacentHTML("beforeend",`
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
      `)},bindModalEvents:function(){let e=document.getElementById("thread-generator-modal");if(!e)return;let t=e.querySelector(".tone-modal-close"),n=e.querySelector(".tone-modal-overlay"),a=document.getElementById("thread-gen-cancel-btn"),s=document.getElementById("thread-gen-generate-btn");t?.addEventListener("click",()=>this.hideModal()),n?.addEventListener("click",()=>this.hideModal()),a?.addEventListener("click",()=>this.hideModal()),s?.addEventListener("click",()=>this.handleGenerate()),e.addEventListener("keydown",i=>{i.key==="Escape"&&this.hideModal()})},showModal:function(e){if(e)h.popupInstance=e,console.log("ThreadGenerator: Stored popup instance, has apiKey:",!!e.apiKey);else{console.error("ThreadGenerator: No popup instance provided to showModal"),alert("Unable to open thread generator. Please refresh and try again.");return}h.init();let t=document.getElementById("thread-generator-modal");if(!t)return;t.classList.remove("hidden"),t.setAttribute("aria-hidden","false"),document.getElementById("modal-thread-topic")?.focus()},hideModal:function(){let e=document.getElementById("thread-generator-modal");e&&(e.classList.add("hidden"),e.setAttribute("aria-hidden","true"))},handleGenerate:async function(){let e=document.getElementById("modal-thread-category")?.value,t=document.getElementById("modal-thread-topic")?.value?.trim(),n=document.getElementById("modal-use-knowledge-pack")?.checked;if(!t){alert("Please enter a topic");return}console.log("ThreadGenerator: handleGenerate called"),console.log("ThreadGenerator: popupInstance exists:",!!h.popupInstance),console.log("ThreadGenerator: popupInstance has apiKey:",!!h.popupInstance?.apiKey),console.log("ThreadGenerator: popupInstance has generateThreadMVP:",!!h.popupInstance?.generateThreadMVP),h.hideModal(),h.popupInstance&&h.popupInstance.resetScreenForGeneration&&h.popupInstance.resetScreenForGeneration(),h.popupInstance&&h.popupInstance.generateThreadMVP?await h.popupInstance.generateThreadMVP(e,t,{useKnowledgePack:n,maxTweets:8,tone:"curious"}):(console.error("Popup instance not available for thread generation"),console.error("popupInstance:",h.popupInstance),alert("Unable to generate thread. Please try again."))},loadKnowledgePack:async function(e){if(this.knowledgePacks[e])return this.knowledgePacks[e];try{let t=await fetch(`knowledge-packs/${e}.json`);if(!t.ok)return console.warn(`Knowledge pack not found for ${e}`),null;let n=await t.json();return this.knowledgePacks[e]=n,n}catch(t){return console.error(`Error loading knowledge pack for ${e}:`,t),null}},getRandomHook:function(e){if(!e||!e.hooks||e.hooks.length===0)return null;let t=Math.floor(Math.random()*e.hooks.length);return e.hooks[t]},generateThreadMVP:async function(e,t,n={}){let a=this;if(!a.apiKey){alert("\u274C Please set up your Gemini API key first."),a.showView&&a.showView("settings");return}let s=n.useKnowledgePack!==!1,i=n.maxTweets||8,o=n.tone||"curious";a.setLoading(!0,`Generating ${e} thread...`),console.log(`Fibr: Generating thread for category: ${e}, topic: ${t}`);try{let r="";if(s){let f=await h.loadKnowledgePack(e);f&&f.facts&&(r=`

RELEVANT KNOWLEDGE BASE:
${f.facts.slice(0,5).map((T,b)=>`${b+1}. ${T}`).join(`
`)}
`)}a.showProgressBar&&a.showProgressBar(`Generating ${e} thread...`);let c=`You are a precise thread outline creator. You create structured outlines for engaging Twitter/X threads about ${e}. No markdown, no hashtags.`,u=`Create a ${i}-tweet thread outline about: ${t}

Category: ${e}
Tone: ${o}
${r}

Create an outline with ${i} beats:
- Beat 1: Hook (attention-grabbing opener)
- Beats 2-${i-1}: Core content (facts, insights, twists)
- Beat ${i}: Closer (memorable ending)

Format each beat as:
[Beat number]: [One-sentence description]

Generate the outline now:`,d=await a.callGeminiAPIWithSystemPrompt(c,u);if(!d)throw new Error("Failed to generate outline");console.log("\u2705 Outline generated");let g=`You are a masterful Twitter/X thread storyteller. You craft threads about ${e} that captivate readers. Each tweet pulses with energy and personality. Write in plain text with strategic emojis - no hashtags, no URLs, no formatting symbols.`,p=`Transform this outline into a complete ${i}-tweet thread about: ${t}

OUTLINE:
${d}

CRITICAL FORMAT:
Start each tweet with: 1/${i}: 2/${i}: 3/${i}: etc.

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
1/${i}:
[Hook content here]

2/${i}:
[Content here]

Generate the complete thread now:`,l=await a.callGeminiAPIWithSystemPrompt(g,p);if(!l)throw new Error("Failed to expand thread");console.log("\u2705 Thread expanded");let m=a.cleanTwitterContent(l),y=a.parseTwitterThread(m),w=[];for(let f of y)if(a.getAccurateCharacterCount(f)<=280)w.push(f);else{let b=await h.smartSplitTweet.call(a,f,280);w.push(...b)}console.log(`\u2705 Thread generated: ${w.length} tweets`);let v=`thread_${Date.now()}`;h.renderThreadGeneratorResult.call(a,w,v,e,t,s),a.autoSaveThread&&await a.autoSaveThread(v,w,m),await a.saveState()}catch(r){console.error("Error generating thread:",r),alert(`\u274C Error generating thread: ${r.message}`)}finally{a.setLoading(!1),a.hideProgressBar&&a.hideProgressBar()}},smartSplitTweet:async function(e,t){let n=e.match(/[^.!?]+[.!?]+/g)||[e],a=[],s="";for(let i of n)this.getAccurateCharacterCount(s+i)<=t?s+=i:(s&&a.push(s.trim()),s=i);return s&&a.push(s.trim()),a.length>0?a:[e.substring(0,t)]},renderThreadGeneratorResult:function(e,t,n,a,s=!0){let i=document.createElement("div");i.className="twitter-content-container thread-generator-result",i.dataset.category=n,i.dataset.topic=a,i.dataset.useKnowledgePack=s;let o=document.createElement("div");o.className="thread-header";let r=this.getTotalChars(e);o.innerHTML=`
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
      `,i.appendChild(o);let c=o.querySelector(".btn-copy-all-thread"),u=o.querySelector(".copy-all-status");c.addEventListener("click",async()=>{await this.copyAllTweets(e,c,u)});let d=document.createElement("div");d.className="thread-master-control",d.innerHTML=`
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
      `,i.appendChild(d);let g=d.querySelector(".master-length-slider"),p=d.querySelector(".current-length"),l=d.querySelector(".btn-regenerate-thread"),m=d.querySelectorAll(".preset-btn");g.addEventListener("input",y=>{p.textContent=y.target.value}),m.forEach(y=>{y.addEventListener("click",()=>{let w=y.dataset.length;g.value=w,p.textContent=w})}),l.addEventListener("click",async()=>{let y=parseInt(g.value);await this.regenerateEntireThreadForGenerator(i,t,y,n,a,s)}),e.forEach((y,w)=>{let v=`Thread ${w+1}/${e.length}`,f=this.createTwitterCard(y,v,!0);f.dataset.platform="thread",f.dataset.threadId=t,f.dataset.category=n,i.appendChild(f)}),this.messagesContainer.appendChild(i),setTimeout(()=>{this.messagesContainer.scrollTo({top:this.messagesContainer.scrollHeight,behavior:"smooth"})},100)},regenerateEntireThreadForGenerator:async function(e,t,n,a,s,i){let o=e.querySelector(".btn-regenerate-thread");if(!o)return;let r=o.textContent;o.textContent="\u23F3 Regenerating...",o.disabled=!0;try{let c=Math.max(3,Math.min(12,Math.ceil(n/400))),u="";if(i){let l=await this.loadKnowledgePack(a);l&&l.facts&&(u=`

RELEVANT KNOWLEDGE BASE:
${l.facts.slice(0,5).map((m,y)=>`${y+1}. ${m}`).join(`
`)}
`)}let d=`You are a masterful Twitter/X thread storyteller crafting ${c} tweets (${n} total characters) about ${a}. Each tweet vibrates with personality, energy, and human warmth. Write in plain text with strategic emojis - no hashtags, no URLs, no formatting. Pure storytelling magic.`,g=`Create a magnetic Twitter thread with EXACTLY ${c} tweets totaling approximately ${n} characters about: ${s}

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

Craft your ${n}-character thread now:`,p=await this.callGeminiAPIWithSystemPrompt(d,g);if(p){let l=this.cleanTwitterContent(p),m=this.parseTwitterThread(l);e.querySelectorAll(".twitter-card").forEach(T=>T.remove()),m.forEach((T,b)=>{let k=`Thread ${b+1}/${m.length}`,C=this.createTwitterCard(T,k,!0);C.dataset.platform="thread",C.dataset.threadId=t,C.dataset.category=a,e.appendChild(C)});let w=e.querySelector(".thread-meta");w&&(w.textContent=`${m.length} tweets \u2022 ${this.getTotalChars(m)} chars`);let v=e.querySelector(".current-length");v&&(v.textContent=this.getTotalChars(m));let f=e.querySelector(".master-length-slider");f&&(f.value=this.getTotalChars(m)),this.autoSaveThread&&await this.autoSaveThread(t,m,l),console.log("\u2705 Thread regenerated successfully")}}catch(c){console.error("Error regenerating thread:",c),alert("Failed to regenerate thread. Please try again.")}finally{o.textContent=r,o.disabled=!1}},showThreadGeneratorView:function(){document.getElementById("thread-generator-view")&&this.showView("thread-generator")},initializeHowItWorksToggle:function(){let e=document.getElementById("how-it-works-toggle"),t=document.getElementById("how-it-works-content");!e||!t||(t.classList.remove("expanded"),e.classList.remove("expanded"),e.addEventListener("click",()=>{t.classList.contains("expanded")?(t.classList.remove("expanded"),e.classList.remove("expanded")):(t.classList.add("expanded"),e.classList.add("expanded"))}))},handleThreadGeneratorSubmit:async function(){let e=document.getElementById("thread-category"),t=document.getElementById("thread-topic"),n=document.getElementById("use-knowledge-pack");if(!e||!t){console.error("Thread generator form elements not found");return}let a=e.value,s=t.value.trim(),i=n?n.checked:!0;if(!s){alert("Please enter a topic");return}this.showView("chat"),this.resetScreenForGeneration&&this.resetScreenForGeneration(),await this.generateThreadMVP(a,s,{useKnowledgePack:i,maxTweets:8,tone:"curious"}),t.value=""}};window.TabTalkThreadGenerator=h})();(function(){let h={initializeHorizontalScroll:function(){let e=document.querySelector(".scroll-container"),t=document.getElementById("scroll-left"),n=document.getElementById("scroll-right");if(!e||!t||!n)return;let a=200;t.addEventListener("click",()=>{e.scrollBy({left:-a,behavior:"smooth"})}),n.addEventListener("click",()=>{e.scrollBy({left:a,behavior:"smooth"})});let s=()=>{let c=e.scrollWidth-e.clientWidth;t.disabled=e.scrollLeft<=0,n.disabled=e.scrollLeft>=c};e.addEventListener("scroll",s),s(),e.addEventListener("wheel",c=>{c.deltaY!==0&&(c.preventDefault(),e.scrollLeft+=c.deltaY,s())});let i=!1,o,r;e.addEventListener("mousedown",c=>{i=!0,o=c.pageX-e.offsetLeft,r=e.scrollLeft,e.style.cursor="grabbing"}),e.addEventListener("mouseleave",()=>{i=!1,e.style.cursor="grab"}),e.addEventListener("mouseup",()=>{i=!1,e.style.cursor="grab",s()}),e.addEventListener("mousemove",c=>{if(!i)return;c.preventDefault();let d=(c.pageX-e.offsetLeft-o)*1.5;e.scrollLeft=r-d}),e.style.cursor="grab"}};window.TabTalkScroll=h})();(function(){let h={INIT_KEY:"savedContent",async loadSaved(e="twitter"){if(!window.TabTalkStorage||!TabTalkStorage.getSavedContent)return console.error("Gallery: TabTalkStorage not available"),[];let t=await TabTalkStorage.getSavedContent();return t?e==="all"?Object.entries(t).flatMap(([a,s])=>Array.isArray(s)?s.map(i=>({...i,_category:a})):[]):Array.isArray(t[e])?t[e]:[]:[]},async render(e,t="twitter"){e.innerHTML="";let n=document.createElement("div");n.className="gallery-header",n.innerHTML=`
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
      `,e.appendChild(n);let a=document.createElement("div");a.className="gallery-list",e.appendChild(a);let s=await this.loadSaved(t);this.initVirtualList(a,s),n.querySelector("#gallery-back-btn").addEventListener("click",()=>{window.TabTalkNavigation&&TabTalkNavigation.showView&&TabTalkNavigation.showView("chat")});let o=n.querySelector("#gallery-search"),r=n.querySelector("#gallery-sort"),c=n.querySelector("#gallery-count"),u=async()=>{let d=(o.value||"").toLowerCase(),g=r.value,p=await this.loadSaved(t);d&&(p=p.filter(l=>(l.content||"").toLowerCase().includes(d)||(l.domain||"").toLowerCase().includes(d))),p=this.sortItems(p,g),this.initVirtualList(a,p),this.renderList(a,p.slice(0,this._virtual.batch)),c.textContent=`${p.length}/50`};o.addEventListener("input",this.debounce(u,150)),r.addEventListener("change",u),c.textContent=`${s.length}/50`},sortItems(e,t){let n=[...e];switch(t){case"created_desc":return n.sort((a,s)=>(s.timestamp||0)-(a.timestamp||0));case"length_asc":return n.sort((a,s)=>(a.charCountAccurate||(a.content||"").length)-(s.charCountAccurate||(s.content||"").length));case"length_desc":return n.sort((a,s)=>(s.charCountAccurate||(s.content||"").length)-(a.charCountAccurate||(a.content||"").length));case"updated_desc":default:return n.sort((a,s)=>(s.updatedAt||s.timestamp||0)-(a.updatedAt||a.timestamp||0))}},renderList(e,t){if(!t||t.length===0){e.innerHTML=`
          <div class="gallery-empty">
            <img src="icons/icon128.jpeg" alt="" />
            <h3>No saved posts yet</h3>
            <p>Use the Save button on any generated card to add it here.</p>
          </div>
        `;return}if(this._virtual&&this._virtual.list===e){this.appendNextBatch();return}e.innerHTML="";let n=document.createDocumentFragment();t.forEach(a=>{let s=this.renderCard(a);n.appendChild(s)}),e.appendChild(n)},initVirtualList(e,t){let n=e;n.innerHTML="",this._virtual={list:n,items:t||[],index:0,batch:20},this.appendNextBatch(),this._virtual.items.length>this._virtual.batch&&this.appendNextBatch();let a=()=>{let{list:s}=this._virtual||{};s&&s.scrollTop+s.clientHeight>=s.scrollHeight-120&&this.appendNextBatch()};this._virtualScrollHandler&&n.removeEventListener("scroll",this._virtualScrollHandler),this._virtualScrollHandler=a,n.addEventListener("scroll",a,{passive:!0})},appendNextBatch(){let e=this._virtual;if(!e||!e.list||e.index>=e.items.length)return;let t=e.index,n=Math.min(e.index+e.batch,e.items.length),a=document.createDocumentFragment();for(let s=t;s<n;s++)a.appendChild(this.renderCard(e.items[s]));e.list.appendChild(a),e.index=n},renderCard(e){let t=document.createElement("div");t.className="gallery-card collapsed",t.setAttribute("tabindex","0"),t.setAttribute("aria-expanded","false");let n=this.getAccurateCharacterCount(e.content||"");t.innerHTML=`
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
      `;let a=t.querySelector(".gallery-text"),s=t.querySelector(".btn.copy"),i=t.querySelector(".btn.edit"),o=t.querySelector(".btn.save"),r=t.querySelector(".btn.delete"),c=t.querySelector(".btn.link");s.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(a.value),s.textContent="Copied",s.classList.add("success"),setTimeout(()=>{s.textContent="Copy",s.classList.remove("success")},1500)}catch(l){console.error("Gallery copy failed",l)}}),i.addEventListener("click",()=>{a.disabled=!1,a.focus(),i.classList.add("hidden"),o.classList.remove("hidden"),this.autoResize(a)}),o.addEventListener("click",async()=>{a.disabled=!0,i.classList.remove("hidden"),o.classList.add("hidden");let l={content:a.value,updatedAt:Date.now(),charCountAccurate:this.getAccurateCharacterCount(a.value)};await this.updateItem(e,l)}),r.addEventListener("click",async()=>{await this.deleteItem(e),t.remove()}),c&&c.addEventListener("click",l=>{l.preventDefault(),e.url&&chrome.tabs.create({url:e.url})});let u=t.querySelector(".gallery-text-wrap"),d=t.querySelector(".toggle-btn"),g=l=>{(l!==void 0?l:t.classList.contains("collapsed"))?(t.classList.remove("collapsed"),t.setAttribute("aria-expanded","true"),d&&(d.dataset.state="expanded",d.setAttribute("aria-label","Collapse"),d.title="Collapse"),this.autoResize(a)):(t.classList.add("collapsed"),t.setAttribute("aria-expanded","false"),d&&(d.dataset.state="collapsed",d.setAttribute("aria-label","Expand"),d.title="Expand"))};return t.querySelector(".gallery-card-content").addEventListener("click",l=>{l.target.closest(".gallery-controls")||l.target.closest("button")||l.target.closest("a")||a.disabled&&g()}),d&&d.addEventListener("click",l=>{l.stopPropagation(),g()}),t.addEventListener("keydown",l=>{if(l.key==="Enter"||l.key===" "){l.preventDefault();let m=document.activeElement;if(m&&(m.closest(".gallery-controls")||m.tagName==="TEXTAREA"||m.classList.contains("toggle-btn")))return;g()}else l.key==="Escape"&&g(!1)}),setTimeout(()=>this.autoResize(a),0),t},async updateItem(e,t){let n=await TabTalkStorage.getSavedContent(),a=e._category||"twitter";if(!Array.isArray(n[a]))return;let s=n[a].findIndex(i=>i.id===e.id);s!==-1&&(n[a][s]={...n[a][s],...t},await TabTalkStorage.setStorageItem("savedContent",n))},async deleteItem(e){let t=e._category||"twitter";await TabTalkStorage.deleteSavedContent(t,e.id)},autoResize(e){e.style.height="auto",e.style.height=Math.max(80,e.scrollHeight)+"px"},debounce(e,t){let n;return(...a)=>{clearTimeout(n),n=setTimeout(()=>e.apply(this,a),t)}},getAccurateCharacterCount(e){if(!e)return 0;let t=String(e).trim(),n=0,a=Array.from(t);for(let s of a){let i=s.codePointAt(0),o=i>=126976&&i<=129535||i>=9728&&i<=9983||i>=9984&&i<=10175||i>=128512&&i<=128591||i>=127744&&i<=128511||i>=128640&&i<=128767||i>=127456&&i<=127487||i>=8205;n+=o?2:1}return n},escapeHtml(e){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")},formatDate(e){if(!e)return"";try{return new Date(e).toLocaleString()}catch{return""}}};window.galleryManager=h})();(function(){let h={async render(e){e.innerHTML="";let t=document.createElement("div");t.className="thread-library-header",t.innerHTML=`
        <button class="back-btn" id="thread-lib-back" aria-label="Back to chat">\u2190 Back</button>
        <h2>\u{1F9F5} My Threads</h2>
        <div class="thread-search-box">
          <input type="text" id="thread-search" placeholder="Search threads..." aria-label="Search threads" />
        </div>
      `,e.appendChild(t);let n=document.createElement("div");n.className="thread-list",n.id="thread-list",e.appendChild(n),await this.loadThreads(n),this.bindEvents(e)},async loadThreads(e){if(!window.TabTalkStorage||!window.TabTalkStorage.getAllThreads){e.innerHTML='<div class="empty-state"><p>Storage not available</p></div>';return}let t=await window.TabTalkStorage.getAllThreads(),n=Object.values(t);if(n.sort((a,s)=>(s.createdAt||0)-(a.createdAt||0)),e.innerHTML="",n.length===0){e.innerHTML=`
          <div class="empty-state">
            <div class="empty-icon">\u{1F9F5}</div>
            <h3>No threads yet</h3>
            <p>Generate a Twitter thread to see it here!</p>
            <p class="hint">Click "\u{1F9F5} Thread" button to create your first thread</p>
          </div>
        `;return}n.forEach(a=>{let s=this.createThreadCard(a);e.appendChild(s)})},createThreadCard(e){let t=document.createElement("div");t.className="thread-library-card",e.isAutoSaved&&t.classList.add("auto-saved");let n=this.formatTimeAgo(e.createdAt);return t.innerHTML=`
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
      `,t},bindEvents(e){let t=e.querySelector("#thread-lib-back");t&&t.addEventListener("click",()=>{window.TabTalkNavigation&&window.TabTalkNavigation.showView&&window.TabTalkNavigation.showView("chat")});let n=e.querySelector("#thread-search");n&&n.addEventListener("input",this.debounce(()=>{this.searchThreads(n.value)},300));let a=e.querySelector("#thread-list");a&&a.addEventListener("click",async s=>{let i=s.target.closest("button");if(!i)return;let o=i.dataset.threadId;o&&(i.classList.contains("btn-view-thread")?await this.viewThread(o):i.classList.contains("btn-copy-thread")?await this.copyThread(o,i):i.classList.contains("btn-delete-thread")&&await this.deleteThread(o,i))})},async viewThread(e){let t=await window.TabTalkStorage.getThread(e);t&&alert(`Thread: ${t.title}

Tweets:
${t.tweets.map((n,a)=>`${a+1}. ${n.content}`).join(`

`)}`)},async copyThread(e,t){let n=await window.TabTalkStorage.getThread(e);if(n)try{let a=n.tweets.map((i,o)=>`${o+1}/${n.totalTweets}:
${i.content}`).join(`

---

`);await navigator.clipboard.writeText(a);let s=t.innerHTML;t.innerHTML=`
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          Copied!
        `,t.classList.add("success"),setTimeout(()=>{t.innerHTML=s,t.classList.remove("success")},2e3)}catch(a){console.error("Copy failed:",a),alert("Failed to copy thread")}},async deleteThread(e,t){if(!confirm("Delete this thread? This cannot be undone."))return;if(await window.TabTalkStorage.deleteThread(e)){let a=t.closest(".thread-library-card");a&&(a.style.animation="slideOutRight 0.3s ease",setTimeout(()=>a.remove(),300))}},async searchThreads(e){let t=document.querySelector("#thread-list");if(!t)return;let n=await window.TabTalkStorage.getAllThreads(),s=Object.values(n).filter(i=>{let o=e.toLowerCase();return i.title?.toLowerCase().includes(o)||i.domain?.toLowerCase().includes(o)||i.tweets.some(r=>r.content.toLowerCase().includes(o))});if(t.innerHTML="",s.length===0){t.innerHTML=`
          <div class="empty-state">
            <p>No threads found for "${this.escapeHtml(e)}"</p>
          </div>
        `;return}s.forEach(i=>{let o=this.createThreadCard(i);t.appendChild(o)})},formatTimeAgo(e){let t=Math.floor((Date.now()-e)/1e3);return t<60?"Just now":t<3600?`${Math.floor(t/60)}m ago`:t<86400?`${Math.floor(t/3600)}h ago`:t<604800?`${Math.floor(t/86400)}d ago`:new Date(e).toLocaleDateString()},escapeHtml(e){let t=document.createElement("div");return t.textContent=e,t.innerHTML},debounce(e,t){let n;return function(...a){clearTimeout(n),n=setTimeout(()=>e.apply(this,a),t)}}};window.TabTalkThreadLibrary=h})();(function(){let h={async validateApiKey(e){if(!e||typeof e!="string"||e.trim().length===0)return{success:!1,error:"API key is required"};let t=e.trim().replace(/\s+/g,"");if(!t.startsWith("AIza"))return{success:!1,error:'Invalid API key format. Gemini API keys should start with "AIza"'};if(t.length<30)return{success:!1,error:"API key appears too short. Please check and try again."};try{return await chrome.runtime.sendMessage({action:"validateApiKey",apiKey:t})}catch(n){return console.error("Validation request failed:",n),{success:!1,error:"Failed to validate API key. Please try again."}}},async handleTestApiKey(e,t){let n=t.value.trim(),a=e.textContent;if(!n){e.textContent="Enter Key",e.style.backgroundColor="#f59e0b",setTimeout(()=>{e.textContent=a,e.style.backgroundColor=""},2e3);return}e.disabled=!0,e.textContent="Testing...";try{let s=await this.validateApiKey(n);s.success?(e.textContent="\u2713 Valid",e.style.backgroundColor="#10b981",setTimeout(()=>{e.textContent=a,e.style.backgroundColor="",e.disabled=!1},2e3)):(e.textContent="\u2717 Invalid",e.style.backgroundColor="#ef4444",console.error(`API Key validation failed: ${s.error}`),setTimeout(()=>{e.textContent=a,e.style.backgroundColor="",e.disabled=!1},3e3))}catch(s){e.textContent="Error",e.style.backgroundColor="#ef4444",console.error("An error occurred while validating the API key:",s),setTimeout(()=>{e.textContent=a,e.style.backgroundColor="",e.disabled=!1},3e3)}},async handleSaveApiKey(e,t,n){let a=t.value.trim();if(!a){e.textContent="Enter Key",e.style.backgroundColor="#f59e0b";let i=e.textContent;setTimeout(()=>{e.textContent="Save",e.style.backgroundColor=""},2e3);return}e.disabled=!0;let s=e.textContent;e.textContent="Validating...";try{let i=await this.validateApiKey(a);i.success?(await this.saveApiKey(a),e.textContent="\u2713 Saved",e.style.backgroundColor="#10b981",n&&n(),setTimeout(()=>{e.textContent=s,e.style.backgroundColor="",e.disabled=!1},2e3)):(e.textContent="\u2717 Failed",e.style.backgroundColor="#ef4444",console.error(`API Key validation failed: ${i.error}`),setTimeout(()=>{e.textContent=s,e.style.backgroundColor="",e.disabled=!1},3e3))}catch(i){e.textContent="Error",e.style.backgroundColor="#ef4444",console.error("An error occurred while saving the API key:",i),setTimeout(()=>{e.textContent=s,e.style.backgroundColor="",e.disabled=!1},3e3)}},async saveApiKey(e){let t=e.trim().replace(/\s+/g,"");window.TabTalkStorage&&window.TabTalkStorage.saveApiKey?await window.TabTalkStorage.saveApiKey(t):await chrome.storage.local.set({geminiApiKey:t,apiKey:t,hasSeenWelcome:!0})}};window.TabTalkValidation=h})();(function(){function h(){let e=document.getElementById("test-api-key"),t=document.getElementById("onboarding-api-key");if(e&&t&&window.TabTalkValidation){let s=e.cloneNode(!0);e.parentNode.replaceChild(s,e),s.addEventListener("click",async function(){await window.TabTalkValidation.handleTestApiKey(s,t);let i=document.getElementById("api-setup-continue");i&&s.textContent==="\u2713 Valid"&&(i.disabled=!1)})}let n=document.getElementById("settings-save-button"),a=document.getElementById("api-key-input");if(n&&a&&window.TabTalkValidation){let s=n.cloneNode(!0);n.parentNode.replaceChild(s,n),s.addEventListener("click",async function(i){i.preventDefault(),i.stopPropagation(),i.stopImmediatePropagation(),await window.TabTalkValidation.handleSaveApiKey(s,a,function(){window.TabTalkNavigation&&window.TabTalkNavigation.showView&&window.TabTalkNavigation.showView("chat")})})}t&&t.addEventListener("input",function(){let s=document.getElementById("api-setup-continue");s&&(s.disabled=!this.value.trim())})}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",h):h(),setTimeout(h,100)})();(function(){let h={toneDefinitions:{supportive:{id:"supportive",name:"Supportive with Facts",icon:"\u{1F91D}",color:"var(--accent-color)",category:"positive",description:"Highlight strengths, build confidence",example:"This is brilliant because...",aiInstructions:`TONE: Supportive with Facts
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
      `).join("")},renderToneOptions:function(){return Object.values(this.toneDefinitions).map(e=>`<option value="${e.id}">${e.icon} ${e.name}</option>`).join("")},bindModalEvents:function(){let e=document.getElementById("tone-selector-modal");if(!e)return;e.querySelector(".tone-modal-close")?.addEventListener("click",()=>this.hideModal()),e.querySelector(".tone-modal-overlay")?.addEventListener("click",()=>this.hideModal()),document.getElementById("tone-cancel-btn")?.addEventListener("click",()=>this.hideModal()),e.querySelectorAll(".tone-option").forEach(g=>{g.addEventListener("click",()=>this.selectTone(g)),g.addEventListener("keydown",p=>{(p.key==="Enter"||p.key===" ")&&(p.preventDefault(),this.selectTone(g))})}),document.getElementById("tone-generate-btn")?.addEventListener("click",()=>this.handleGenerate()),document.getElementById("toggle-custom-builder")?.addEventListener("click",()=>this.toggleCustomBuilder());let r=document.getElementById("custom-tone-1"),c=document.getElementById("custom-tone-2");r?.addEventListener("change",()=>this.updateCustomPreview()),c?.addEventListener("change",()=>this.updateCustomPreview()),document.getElementById("save-custom-tone")?.addEventListener("click",()=>this.saveCustomCombination()),document.getElementById("use-custom-tone")?.addEventListener("click",()=>this.useCustomCombination()),e.addEventListener("keydown",g=>{g.key==="Escape"&&this.hideModal()})},showModal:async function(e,t){let n=document.getElementById("tone-selector-modal");if(!n)return;this.currentPlatform=e,this.currentPageContent=t,n.classList.remove("hidden"),n.setAttribute("aria-hidden","false"),n.querySelector(".tone-option")?.focus(),await this.generateRecommendations(t),this.renderSavedCustomTones()},hideModal:function(){let e=document.getElementById("tone-selector-modal");e&&(e.classList.add("hidden"),e.setAttribute("aria-hidden","true"),this.resetSelections())},selectTone:function(e){document.querySelectorAll(".tone-option").forEach(a=>{a.classList.remove("selected"),a.setAttribute("aria-checked","false")}),e.classList.add("selected"),e.setAttribute("aria-checked","true"),this.selectedToneId=e.dataset.toneId,this.selectedTone=this.toneDefinitions[this.selectedToneId];let n=document.getElementById("tone-generate-btn");n&&(n.disabled=!1),this.sessionCache.lastSelectedTone=this.selectedToneId},generateRecommendations:async function(e){let t=document.getElementById("tone-recommendations"),n=document.getElementById("recommended-tones");if(!(!t||!n))try{t.classList.remove("hidden"),n.innerHTML='<div class="recommendations-loading">Analyzing content...</div>';let a=await this.analyzeContentForTones(e);a.length>0?(n.innerHTML=a.map(i=>`
            <div class="recommended-tone" data-tone-id="${i.toneId}">
              <div class="rec-badge">Recommended</div>
              <div class="rec-tone-icon" style="color: ${i.color}">${i.icon}</div>
              <div class="rec-tone-info">
                <div class="rec-tone-name">${i.name}</div>
                <div class="rec-reason">${i.reason}</div>
                <div class="rec-confidence">Match: ${i.confidence}%</div>
              </div>
            </div>
          `).join(""),n.querySelectorAll(".recommended-tone").forEach(i=>{i.addEventListener("click",()=>{let o=i.dataset.toneId,r=document.querySelector(`.tone-option[data-tone-id="${o}"]`);r&&(this.selectTone(r),r.scrollIntoView({behavior:"smooth",block:"center"}))})})):n.innerHTML='<div class="no-recommendations">All tones work well for this content!</div>'}catch(a){console.error("Error generating recommendations:",a),n.innerHTML='<div class="recommendations-error">Could not analyze content</div>'}},analyzeContentForTones:async function(e){let t=e.toLowerCase(),n=[],a=/controversy|debate|disagree|conflict|dispute/i.test(e),s=/data|statistics|study|research|evidence|percent|number/i.test(e),i=/claim|assert|state|argue|maintain/i.test(e),o=/success|achievement|breakthrough|innovation|progress/i.test(e),r=/problem|issue|concern|risk|danger|failure/i.test(e),c=/funny|joke|ironic|amusing|hilarious/i.test(e),u=/future|upcoming|next|will|plan|forecast/i.test(e),d=/warning|caution|beware|careful|risk/i.test(e),g=e.length,p=e.split(/\s+/).length;return a&&s&&n.push({toneId:"critical",...this.toneDefinitions.critical,reason:"Content contains controversial claims with data - perfect for evidence-based critique",confidence:92}),i&&!s&&n.push({toneId:"anti-propaganda",...this.toneDefinitions["anti-propaganda"],reason:"Multiple claims detected without strong evidence - ideal for fact-checking",confidence:88}),o&&s&&n.push({toneId:"supportive",...this.toneDefinitions.supportive,reason:"Positive developments backed by data - great for supportive commentary",confidence:90}),a&&c&&n.push({toneId:"trolling",...this.toneDefinitions.trolling,reason:"Controversial topic with humorous elements - perfect for playful fact-based trolling",confidence:85}),r&&!a&&n.push({toneId:"critical-humor",...this.toneDefinitions["critical-humor"],reason:"Issues present without heated debate - ideal for witty critique",confidence:83}),u&&o&&n.push({toneId:"optimistic",...this.toneDefinitions.optimistic,reason:"Forward-looking content with positive outlook - great for optimistic framing",confidence:87}),(d||r&&s)&&n.push({toneId:"cautionary",...this.toneDefinitions.cautionary,reason:"Risks or concerns identified - suitable for cautionary perspective",confidence:84}),s&&g>2e3&&n.push({toneId:"investigative",...this.toneDefinitions.investigative,reason:"Substantial content with data - perfect for deep investigative analysis",confidence:86}),o&&p<500&&n.push({toneId:"empowering",...this.toneDefinitions.empowering,reason:"Concise positive content - ideal for empowering call-to-action",confidence:81}),n.sort((l,m)=>m.confidence-l.confidence).slice(0,3)},toggleCustomBuilder:function(){let e=document.getElementById("custom-tone-builder"),t=document.getElementById("toggle-custom-builder"),n=t?.querySelector(".toggle-arrow");if(e&&t){let a=e.classList.contains("hidden");e.classList.toggle("hidden"),n&&(n.textContent=a?"\u25B2":"\u25BC")}},updateCustomPreview:function(){let e=document.getElementById("custom-tone-1"),t=document.getElementById("custom-tone-2"),n=document.getElementById("custom-tone-preview"),a=document.querySelector(".builder-preview"),s=document.getElementById("save-custom-tone"),i=document.getElementById("use-custom-tone");if(!e||!t||!n)return;let o=e.value,r=t.value;if(o&&r&&o!==r){let c=this.toneDefinitions[o],u=this.toneDefinitions[r];n.innerHTML=`
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
        `,a?.classList.remove("hidden"),s&&(s.disabled=!1),i&&(i.disabled=!1)}else a?.classList.add("hidden"),s&&(s.disabled=!0),i&&(i.disabled=!0)},generateCombinedDescription:function(e,t){return`Combines ${e.name.toLowerCase()} with ${t.name.toLowerCase()} for a unique perspective that ${e.description.toLowerCase()} while ${t.description.toLowerCase()}.`},saveCustomCombination:async function(){let e=document.getElementById("custom-tone-1"),t=document.getElementById("custom-tone-2");if(!e||!t)return;let n=e.value,a=t.value;if(!n||!a||n===a)return;let s={id:`custom-${Date.now()}`,tone1Id:n,tone2Id:a,name:`${this.toneDefinitions[n].name} + ${this.toneDefinitions[a].name}`,createdAt:Date.now()};this.customTones.push(s),await this.saveCustomTones(),this.renderSavedCustomTones(),this.showToast("\u2713 Custom tone saved!")},useCustomCombination:function(){let e=document.getElementById("custom-tone-1"),t=document.getElementById("custom-tone-2");if(!e||!t)return;let n=e.value,a=t.value;if(!n||!a||n===a)return;this.selectedToneId="custom",this.selectedTone={id:"custom",name:`${this.toneDefinitions[n].name} + ${this.toneDefinitions[a].name}`,tone1:this.toneDefinitions[n],tone2:this.toneDefinitions[a],aiInstructions:this.combineAIInstructions(this.toneDefinitions[n],this.toneDefinitions[a])};let s=document.getElementById("tone-generate-btn");s&&(s.disabled=!1),this.showToast("\u2713 Custom tone selected!")},combineAIInstructions:function(e,t){return`COMBINED TONE: ${e.name} + ${t.name}

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
          ${this.customTones.map(a=>{let s=this.toneDefinitions[a.tone1Id],i=this.toneDefinitions[a.tone2Id];return`
              <div class="saved-custom-tone" data-custom-id="${a.id}">
                <div class="saved-tone-icons">
                  <span style="color: ${s.color}">${s.icon}</span>
                  <span class="saved-plus">+</span>
                  <span style="color: ${i.color}">${i.icon}</span>
                </div>
                <div class="saved-tone-name">${a.name}</div>
                <button class="saved-tone-delete" data-custom-id="${a.id}" title="Delete">\xD7</button>
              </div>
            `}).join("")}
        </div>
      `,e.querySelectorAll(".saved-custom-tone").forEach(a=>{a.addEventListener("click",s=>{s.target.classList.contains("saved-tone-delete")||this.selectSavedCustomTone(a.dataset.customId)})}),e.querySelectorAll(".saved-tone-delete").forEach(a=>{a.addEventListener("click",s=>{s.stopPropagation(),this.deleteCustomTone(a.dataset.customId)})})},selectSavedCustomTone:function(e){let t=this.customTones.find(i=>i.id===e);if(!t)return;let n=this.toneDefinitions[t.tone1Id],a=this.toneDefinitions[t.tone2Id];this.selectedToneId="custom",this.selectedTone={id:"custom",name:t.name,tone1:n,tone2:a,aiInstructions:this.combineAIInstructions(n,a)};let s=document.getElementById("tone-generate-btn");s&&(s.disabled=!1),this.showToast("\u2713 Custom tone selected!")},deleteCustomTone:async function(e){this.customTones=this.customTones.filter(t=>t.id!==e),await this.saveCustomTones(),this.renderSavedCustomTones(),this.showToast("Custom tone deleted")},handleGenerate:function(){this.selectedTone&&(this.onGenerateCallback&&this.onGenerateCallback(this.selectedTone,this.currentPlatform),this.hideModal())},resetSelections:function(){document.querySelectorAll(".tone-option").forEach(n=>{n.classList.remove("selected"),n.setAttribute("aria-checked","false")}),this.selectedToneId=null,this.selectedTone=null;let t=document.getElementById("tone-generate-btn");t&&(t.disabled=!0)},showToast:function(e){let t=document.createElement("div");t.className="tone-toast",t.textContent=e,t.style.cssText=`
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
      `,document.body.appendChild(t),setTimeout(()=>{t.style.animation="slideOutDown 0.3s ease",setTimeout(()=>t.remove(),300)},2e3)},show:function(e,t,n){this.onGenerateCallback=n,this.showModal(e,t)}};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>h.init()):h.init(),window.TabTalkToneSelector=h})();(function(){let h={currentView:"chat",init(){this.bindEvents(),this.updateActiveState("chat")},bindEvents(){document.querySelectorAll(".nav-item").forEach(t=>{t.addEventListener("click",n=>{n.preventDefault();let a=t.getAttribute("data-view");this.navigateToView(a)})})},navigateToView(e){window.TabTalkNavigation&&window.TabTalkNavigation.showView&&window.TabTalkNavigation.showView(e),this.updateActiveState(e),this.currentView=e},updateActiveState(e){document.querySelectorAll(".nav-item").forEach(n=>{n.getAttribute("data-view")===e?n.classList.add("active"):n.classList.remove("active")})},toggleVisibility(e){let t=document.getElementById("bottom-nav");t&&(t.style.display=e?"flex":"none")},setActive(e){this.updateActiveState(e),this.currentView=e}};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>h.init()):h.init(),window.BottomNav=h})();(()=>{var h=class{constructor(){this.apiKey=null,this.currentTab=null,this.pageContent=null,this.isLoading=!1,this.currentDomain=null,this.messagesContainer=document.getElementById("messages-container"),this.pageStatus=document.getElementById("page-status"),this.pageTitle=document.getElementById("page-title"),this.quickActions=document.getElementById("quick-actions"),this.sidebar=document.getElementById("sidebar"),this.quickTwitterBtn=document.getElementById("quick-twitter"),this.quickTwitterThreadBtn=document.getElementById("quick-twitter-thread"),this.quickCreateBtn=document.getElementById("quick-create"),this.welcomeView=document.getElementById("welcome-view"),this.apiSetupView=document.getElementById("api-setup-view"),this.chatView=document.getElementById("chat-view"),this.settingsView=document.getElementById("settings-view"),this.menuButton=document.getElementById("menu-button"),this.apiKeyInput=document.getElementById("api-key-input")||document.getElementById("settings-api-key"),this.inputActions=document.querySelector(".input-actions"),this.exportFormatSelect=document.getElementById("export-format-select"),this.statusText=document.getElementById("status-text"),this.views={welcome:this.welcomeView,"api-setup":this.apiSetupView,chat:this.chatView,settings:this.settingsView}}async init(){try{console.log("TabTalk AI: Initializing popup");let t=await chrome.tabs.query({active:!0,currentWindow:!0});!t||t.length===0?(console.error("TabTalk AI: Failed to get current tab"),this.pageStatus&&(this.pageStatus.textContent="\u274C Failed to access current tab")):(this.currentTab=t[0],console.log("TabTalk AI: Current tab:",this.currentTab.url)),await this.loadState(),this.bindEvents();let n=await this.getStorageItem("hasSeenWelcome");this.apiKey?(this.showView("chat"),await this.getAndCachePageContent()):n?this.showView("api-setup"):this.showView("welcome"),console.log("TabTalk AI: Popup initialized")}catch(t){console.error("TabTalk AI: Initialization error:",t),this.pageStatus&&(this.pageStatus.textContent=`\u274C Initialization failed: ${t.message}`),this.showView&&this.showView("welcome")}}bindEvents(){let t=document.getElementById("settings-cancel-button"),n=document.getElementById("settings-save-button");t&&t.addEventListener("click",()=>{this.updateViewState(this.apiKey?"chat":"settings")}),n&&n.addEventListener("click",()=>this.handleSaveSettings());let a=document.getElementById("delete-api-key-button");a&&a.addEventListener("click",()=>this.handleDeleteApiKey()),console.log("Menu Button:",this.menuButton),console.log("Sidebar:",this.sidebar),this.menuButton&&this.sidebar&&(this.menuButton.addEventListener("click",y=>{y.stopPropagation(),console.log("Menu button clicked!");let w=this.sidebar.classList.contains("hidden");w?(this.sidebar.classList.remove("hidden"),this.sidebar.style.display="block"):(this.sidebar.classList.add("hidden"),this.sidebar.style.display="none"),console.log("Sidebar is now:",w?"visible":"hidden"),this.sidebar.setAttribute("aria-expanded",w?"false":"true")}),document.addEventListener("click",y=>{this.sidebar.classList.contains("hidden")||!this.sidebar.contains(y.target)&&y.target!==this.menuButton&&(this.sidebar.classList.add("hidden"),this.sidebar.setAttribute("aria-expanded","false"))}),this.sidebar.addEventListener("keydown",y=>{y.key==="Escape"&&(this.sidebar.classList.add("hidden"),this.sidebar.setAttribute("aria-expanded","false"),this.menuButton.focus())}));let s=document.getElementById("menu-settings-link");s&&s.addEventListener("click",y=>{y.preventDefault(),this.updateViewState("settings"),this.sidebar&&this.sidebar.classList.add("hidden")});let i=document.getElementById("menu-gallery-link");i&&i.addEventListener("click",y=>{y.preventDefault(),this.showView("gallery"),this.sidebar&&(this.sidebar.classList.add("hidden"),this.sidebar.style.display="none")});let o=document.getElementById("menu-threads-link");o&&o.addEventListener("click",y=>{y.preventDefault(),this.showView("threads"),this.sidebar&&(this.sidebar.classList.add("hidden"),this.sidebar.style.display="none")});let r=document.getElementById("welcome-get-started");r&&r.addEventListener("click",async()=>{await this.setStorageItem("hasSeenWelcome",!0),this.showView("api-setup")});let c=document.getElementById("welcome-start");c&&c.addEventListener("click",async()=>{await this.setStorageItem("hasSeenWelcome",!0),this.showView("api-setup")});let u=document.getElementById("api-setup-back");u&&u.addEventListener("click",()=>{this.showView("welcome")});let d=document.getElementById("api-setup-back-arrow");d&&d.addEventListener("click",()=>{this.showView("welcome")});let g=document.getElementById("api-setup-continue");g&&g.addEventListener("click",async()=>{let y=document.getElementById("onboarding-api-key").value.trim();y&&(await this.saveApiKey(y),this.showView("chat"),await this.getAndCachePageContent())});let p=document.getElementById("test-api-key");p&&p.addEventListener("click",async()=>{let y=document.getElementById("onboarding-api-key").value.trim();if(y){let w=await this.testApiKey(y),v=document.getElementById("api-setup-continue");w?(p.textContent="\u2713 Valid",p.style.background="#10b981",p.style.color="white",v.disabled=!1):(p.textContent="\u2717 Invalid",p.style.background="#ef4444",p.style.color="white",v.disabled=!0),setTimeout(()=>{p.textContent="Test",p.style.background="",p.style.color=""},2e3)}});let l=document.getElementById("onboarding-api-key");l&&l.addEventListener("input",()=>{let y=document.getElementById("api-setup-continue");y.disabled=!l.value.trim()}),this.menuButton&&this.menuButton.setAttribute("aria-label","Open menu"),this.apiKeyInput&&this.apiKeyInput.setAttribute("aria-label","Gemini API Key"),this.quickTwitterBtn&&this.quickTwitterBtn.addEventListener("click",async()=>{this.resetScreenForGeneration&&this.resetScreenForGeneration(),await this.generateSocialContent("twitter")}),this.quickTwitterThreadBtn&&this.quickTwitterThreadBtn.addEventListener("click",async()=>{this.resetScreenForGeneration&&this.resetScreenForGeneration(),await this.generateSocialContent("thread")}),this.quickCreateBtn&&this.quickCreateBtn.addEventListener("click",()=>{window.TabTalkThreadGenerator&&window.TabTalkThreadGenerator.showModal?window.TabTalkThreadGenerator.showModal(this):this.showView("thread-generator")});let m=document.getElementById("generate-thread-btn");m&&m.addEventListener("click",async()=>{this.handleThreadGeneratorSubmit&&await this.handleThreadGeneratorSubmit()}),this.initializeHorizontalScroll(),window.TabTalkThreadGenerator&&window.TabTalkThreadGenerator.init&&(console.log("TabTalk AI: Initializing Thread Generator modal..."),window.TabTalkThreadGenerator.init())}async testApiKey(t){try{let n=await chrome.runtime.sendMessage({action:"testApiKey",apiKey:t});return n&&n.success}catch(n){return console.error("Error testing API key:",n),!1}}async handleSaveSettings(){let t=this.apiKeyInput?this.apiKeyInput.value.trim():"";if(!t){alert("Please enter a valid API key");return}await this.testApiKey(t)?(await this.saveApiKey(t),console.log("TabTalk AI: Saving API key with key name 'geminiApiKey' successfully"),this.showView("chat"),await this.getAndCachePageContent()):alert("Invalid API key. Please try again.")}async getAndCachePageContent(){if(!(!this.currentTab||!this.apiKey)){this.setLoading(!0,"Reading page..."),this.pageStatus.textContent="Injecting script to read page...";try{if(this.currentTab.url?.startsWith("chrome://")||this.currentTab.url?.startsWith("https://chrome.google.com/webstore"))throw new Error("Cannot run on protected browser pages.");let t=await chrome.scripting.executeScript({target:{tabId:this.currentTab.id},files:["content.js"]});if(!t||t.length===0)throw new Error("Script injection failed.");let n=t[0].result;if(n.success)this.pageContent=n.content,this.pageStatus.textContent=`\u2705 Content loaded (${(n.content.length/1024).toFixed(1)} KB)`,this.updateQuickActionsVisibility();else throw new Error(n.error)}catch(t){console.error("TabTalk AI (popup):",t),this.pageStatus.textContent=`\u274C ${t.message}`}finally{this.setLoading(!1)}}}};let e=h.prototype.init;document.addEventListener("DOMContentLoaded",()=>{window.TabTalkAPI&&Object.assign(h.prototype,window.TabTalkAPI),window.TabTalkTwitter&&Object.assign(h.prototype,window.TabTalkTwitter),window.TabTalkThreadGenerator&&Object.assign(h.prototype,window.TabTalkThreadGenerator),window.TabTalkContentAnalysis&&Object.assign(h.prototype,window.TabTalkContentAnalysis),window.TabTalkSocialMedia&&Object.assign(h.prototype,window.TabTalkSocialMedia),window.TabTalkStorage&&Object.assign(h.prototype,window.TabTalkStorage),window.TabTalkUI&&Object.assign(h.prototype,window.TabTalkUI),window.TabTalkScroll&&Object.assign(h.prototype,window.TabTalkScroll),window.TabTalkNavigation&&Object.assign(h.prototype,window.TabTalkNavigation),h.prototype.init=async function(){return await e.call(this),this},new h().init().catch(t=>console.error("Initialization error:",t))})})();})();
