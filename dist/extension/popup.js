(()=>{(function(){let h={async callGeminiAPIWithSystemPrompt(e,t){if(!this.apiKey||!t)throw new Error("Missing API key or user prompt");if(!this.pageContent&&(this.pageStatus.textContent="\u26A0\uFE0F Re-analyzing page before generating content...",await this.getAndCachePageContent(),!this.pageContent))throw new Error("Could not get page content to generate content.");let n=[{role:"user",parts:[{text:e},{text:t}]}],a=await chrome.runtime.sendMessage({action:"callGeminiAPI",payload:{contents:n},apiKey:this.apiKey});if(a.success&&a.data?.candidates?.[0]?.content?.parts?.[0]?.text)return a.data.candidates[0].content.parts[0].text;throw new Error(a.error||"The AI gave an empty or invalid response.")}};window.TabTalkAPI=h})();(function(){let h={async getStorageItem(e){try{let t=await chrome.storage.local.get([e]);return t?t[e]:void 0}catch(t){console.error("getStorageItem error:",t);return}},async setStorageItem(e,t){try{return await chrome.storage.local.set({[e]:t}),!0}catch(n){return console.error("setStorageItem error:",n),!1}},async loadState(){try{let e=await chrome.storage.local.get(["geminiApiKey","apiKey"]);if(console.log("TabTalk AI: Loading state, API key exists:",!!e.geminiApiKey),(e.geminiApiKey||e.apiKey)&&(this.apiKey=e.geminiApiKey||e.apiKey,console.log("TabTalk AI: API key loaded successfully"),this.apiKeyInput&&(this.apiKeyInput.value=this.apiKey)),this.currentTab){let t=new URL(this.currentTab.url);this.currentDomain=t.hostname,this.pageTitle&&(this.pageTitle.textContent=this.currentTab.title||"Untitled Page",console.log("TabTalk AI: Page title set to:",this.pageTitle.textContent))}return e}catch(e){throw console.error("Failed to load state:",e),e}},async saveState(){this.apiKey&&await chrome.storage.local.set({geminiApiKey:this.apiKey})},async saveApiKey(e){this.apiKey=e;try{await chrome.storage.local.set({geminiApiKey:e,apiKey:e,hasSeenWelcome:!0}),console.log("TabTalk AI: API key saved")}catch{await this.setStorageItem("apiKey",e),await this.setStorageItem("hasSeenWelcome",!0)}},async handleDeleteApiKey(){if(confirm("Delete your API key? You will need to set it up again."))try{await chrome.storage.local.remove(["geminiApiKey","apiKey"]),this.apiKey=null,this.apiKeyInput&&(this.apiKeyInput.value=""),this.pageContent=null,this.updateQuickActionsVisibility&&this.updateQuickActionsVisibility(),this.messagesContainer&&(this.messagesContainer.innerHTML=""),await this.setStorageItem("hasSeenWelcome",!1),this.showView("welcome"),console.log("TabTalk AI: API key deleted")}catch(e){console.error("Error deleting API key:",e),alert("Error deleting API key. Please try again.")}},async getSavedContent(){return await this.getStorageItem("savedContent")||{}},async saveContent(e,t){let n=await this.getSavedContent();n[e]||(n[e]=[]);let a={id:t&&t.id?t.id:Date.now().toString(),...t,timestamp:t&&t.timestamp?t.timestamp:Date.now()},o=n[e].findIndex(s=>s.id===a.id);o>=0?n[e][o]={...n[e][o],...a,updatedAt:Date.now()}:n[e].unshift(a);let i=[];for(let[s,r]of Object.entries(n))if(Array.isArray(r))for(let c=0;c<r.length;c++)i.push({cat:s,idx:c,item:r[c]});if(i.sort((s,r)=>(r.item.updatedAt||r.item.timestamp||0)-(s.item.updatedAt||s.item.timestamp||0)),i.length>50){let s=new Set(i.slice(0,50).map(r=>`${r.cat}:${r.item.id}`));for(let[r,c]of Object.entries(n))Array.isArray(c)&&(n[r]=c.filter(d=>s.has(`${r}:${d.id}`)))}return await this.setStorageItem("savedContent",n),console.log(`TabTalk AI: Content saved to ${e} category`),a.id},async deleteSavedContent(e,t){let n=await this.getSavedContent();n[e]&&(n[e]=n[e].filter(a=>a.id!==t),await this.setStorageItem("savedContent",n),console.log(`TabTalk AI: Content deleted from ${e} category`))},async clearSavedCategory(e){let t=await this.getSavedContent();t&&Object.prototype.hasOwnProperty.call(t,e)&&(t[e]=[],await this.setStorageItem("savedContent",t),console.log(`TabTalk AI: Cleared all saved items in category ${e}`))},async clearAllSaved(){await this.setStorageItem("savedContent",{}),console.log("TabTalk AI: Cleared all saved content across all categories")},async isContentSaved(e,t){return(await this.getSavedContent())[e]?.some(a=>a.id===t)||!1},async migrateThreadsToGallery(){try{if(await this.getStorageItem("threadsMigratedToGallery"))return;let t=await this.getStorageItem("savedThreads")||{},n=Object.values(t);if(!n.length){await this.setStorageItem("threadsMigratedToGallery",!0);return}let a=await this.getSavedContent();Array.isArray(a.twitter)||(a.twitter=[]);let o=new Set(a.twitter.map(s=>s.id));for(let s of n){let r=s.rawContent&&String(s.rawContent).trim()||(Array.isArray(s.tweets)?s.tweets.map(d=>d.content).join(`

`):""),c={id:s.id,type:"thread",platform:"thread",title:s.title||"Untitled Thread",url:s.url||"",domain:s.domain||"",tweets:Array.isArray(s.tweets)?s.tweets:[],totalTweets:s.totalTweets||(Array.isArray(s.tweets)?s.tweets.length:0),totalChars:s.totalChars,content:r,isAutoSaved:!!s.isAutoSaved,timestamp:s.createdAt||Date.now(),updatedAt:s.updatedAt||s.createdAt||Date.now()};o.has(c.id)||a.twitter.unshift(c)}let i=[];for(let[s,r]of Object.entries(a))if(Array.isArray(r))for(let c=0;c<r.length;c++)i.push({cat:s,idx:c,item:r[c]});if(i.sort((s,r)=>(r.item.updatedAt||r.item.timestamp||0)-(s.item.updatedAt||s.item.timestamp||0)),i.length>50){let s=new Set(i.slice(0,50).map(r=>`${r.cat}:${r.item.id}`));for(let[r,c]of Object.entries(a))Array.isArray(c)&&(a[r]=c.filter(d=>s.has(`${r}:${d.id}`)))}await this.setStorageItem("savedContent",a);try{await chrome.storage.local.remove(["savedThreads"])}catch{}await this.setStorageItem("threadsMigratedToGallery",!0),console.log("TabTalk AI: Migrated savedThreads to Gallery savedContent")}catch(e){console.error("Migration threads->gallery failed",e)}}};window.TabTalkStorage=h})();(function(){let h={showView:function(e){console.log("Navigation: showing view:",e),document.querySelectorAll(".view").forEach(d=>d.classList.add("hidden")),e==="welcome"||e==="api-setup"||e==="settings"?document.body.classList.add("onboarding-view"):document.body.classList.remove("onboarding-view"),window.BottomNav&&window.BottomNav.setActive(e);let a=document.getElementById("quick-actions");a&&(e==="chat"?a.classList.remove("hidden"):a.classList.add("hidden"));let o=document.getElementById("bottom-nav"),i=document.querySelector("main"),s=document.querySelector(".container");e==="welcome"||e==="api-setup"||e==="settings"?(o&&(o.style.display="none",o.style.visibility="hidden",o.style.height="0"),i&&(i.style.paddingBottom="0"),s&&(s.style.paddingBottom="0")):(o&&(o.style.display="flex",o.style.visibility="visible",o.style.height="45px"),i&&(i.style.paddingBottom="45px"),s&&(s.style.paddingBottom="66px"));let r=`${e}-view`;e==="chat"&&(r="chat-view"),e==="settings"&&(r="settings-view"),e==="welcome"&&(r="welcome-view"),e==="api-setup"&&(r="api-setup-view"),e==="history"&&(r="history-view"),e==="gallery"&&(r="gallery-view"),e==="thread-generator"&&(r="thread-generator-view");let c=document.getElementById(r);if(c){if(c.classList.remove("hidden"),e==="history"&&window.historyManager&&this.loadHistoryView(),e==="gallery"&&window.galleryManager){let d=document.getElementById("gallery-container");d&&window.galleryManager.render(d,"twitter")}e==="thread-generator"&&this.initializeHowItWorksToggle&&this.initializeHowItWorksToggle()}else console.warn(`showView: target view not found for "${e}" (id "${r}")`)},loadHistoryView:function(){if(!window.historyManager){console.error("History manager not initialized");return}let e=document.getElementById("history-list");e&&(e.innerHTML='<div class="loading-history">Loading saved content...</div>',window.historyManager.loadHistory("all").then(t=>{window.historyManager.renderHistoryList(e,t,"all")}).catch(t=>{console.error("Error loading history:",t),e.innerHTML='<div class="empty-history">Error loading saved content</div>'}))},updateViewState:function(e,t="Loading..."){if(this.sidebar&&(this.sidebar.classList.add("hidden"),this.sidebar.style.display="none"),Object.values(this.views).forEach(n=>n.classList.add("hidden")),this.views[e]?(this.views[e].classList.remove("hidden"),e==="chat"&&this.messageInput?this.messageInput.focus():e==="settings"&&this.apiKeyInput&&this.apiKeyInput.focus()):console.error(`View "${e}" not found`),e==="status"&&this.statusText&&(this.statusText.textContent=t),e==="settings"){let n=document.querySelector(".onboarding-info");n&&(n.style.display=this.apiKey?"none":"block")}this.setAriaStatus(`Switched to ${e} view. ${t}`)}};window.TabTalkNavigation=h})();(function(){let h={ensureMarked:function(){return!this.marked&&window.marked&&(this.marked=window.marked),!!this.marked},setAriaStatus:function(e){let t=document.getElementById("aria-status");t&&(t.textContent=e)},sanitizeStructuredOutput:function(e,t){if(!t)return"";let n=String(t);return n=n.replace(/^(?:here\s*(?:is|are|\'s|'s)|below\s+is|certainly,|sure,|note:|here\'s a|here's a)[^\n:]*:\s*/i,""),n=n.replace(/^\s*(?:here\s*(?:is|are|\'s|'s)\s*(?:a|an)?\s*)/i,""),n=n.replace(/\s*\*\s+(?=[^\n])/g,`
- `),n=n.replace(/^[ \t]*[•*]\s+/gm,"- "),n=n.replace(/\n{3,}/g,`

`),n=n.replace(/\((https?:\/\/[^\s)]+)\)\s*\(\1\)/g,"($1)"),n=n.replace(/(https?:\/\/[^\s)]+)\s*\(\1\)/g,"$1"),n=n.replace(/^[`\s]+/,"").replace(/[\s`]+$/,""),(e==="keypoints"||e==="summary")&&(n=n.replace(/\*\*([^*]+)\*\*/g,"$1"),n=n.replace(/\*([^*]+)\*/g,"$1"),n=n.replace(/_([^_]+)_/g,"$1")),e==="keypoints"&&!/^\s*-\s+/m.test(n)&&(n=n.split(/\s*\*\s+|\n+/).filter(Boolean).map(a=>a.replace(/^[-•*]\s+/,"").trim()).filter(Boolean).map(a=>`- ${a}`).join(`
`)),n.trim()},setLoading:function(e,t="..."){this.isLoading=e,e?(this.pageStatus&&(this.pageStatus.textContent=t),this.setAriaStatus(t)):(this.pageStatus&&!this.pageStatus.textContent.startsWith("\u2705")&&(this.pageStatus.textContent="\u2705 Done"),this.setAriaStatus("Ready"))},updateQuickActionsVisibility:function(){this.quickActions&&this.quickActions.classList.toggle("hidden",!this.pageContent)},resetScreenForGeneration:function(){this.sidebar&&(this.sidebar.classList.add("hidden"),this.sidebar.style.display="none"),this.messagesContainer&&(this.messagesContainer.innerHTML=""),this.updateQuickActionsVisibility()},renderCard:function(e,t,n={}){let a=document.createElement("div");a.className="twitter-content-container";let o=document.createElement("div");o.className="twitter-card analytics-card",o.dataset.contentType=n.contentType||"content",o.dataset.contentId=n.contentId||Date.now().toString();let i={summary:"\u{1F4DD}",keypoints:"\u{1F511}",analysis:"\u{1F4CA}",faq:"\u2753",factcheck:"\u2705",blog:"\u{1F4F0}",proscons:"\u2696\uFE0F",timeline:"\u{1F4C5}",quotes:"\u{1F4AC}"},s=n.contentType||"content",r=i[s]||"\u{1F4C4}",c=n.markdown?`data-markdown="${encodeURIComponent(n.markdown)}"`:"";if(o.innerHTML=`
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
      `,window.TabTalkUI&&window.TabTalkUI.addSaveButtonToCard){let m=n.contentType||"content",p={id:n.contentId||Date.now().toString(),content:n.markdown||t,title:e},y=o.querySelector(".twitter-header-actions");y&&window.TabTalkUI.addSaveButtonToCard(y,m,p)}let d=o.querySelector(".copy-btn"),u=d.innerHTML;d.addEventListener("click",async m=>{m.stopPropagation();try{let p=o.querySelector(".structured-html"),y=p?.getAttribute("data-markdown"),g=y?decodeURIComponent(y):p?.innerText||"";await navigator.clipboard.writeText(g),d.innerHTML=`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20,6 9,17 4,12"></polyline>
          </svg>`,d.classList.add("success"),setTimeout(()=>{d.innerHTML=u,d.classList.remove("success")},2e3)}catch(p){console.error("Copy failed:",p)}}),a.appendChild(o);let l=n.container||this.messagesContainer;return l.appendChild(a),l===this.messagesContainer&&l.scrollTo({top:l.scrollHeight,behavior:"smooth"}),o},showProgressBar:function(e){this.hideProgressBar();let t=document.createElement("div");t.className="progress-container",t.id="global-progress",t.innerHTML=`
        <div class="progress-message">${e}</div>
        <div class="progress-bar"><div class="progress-fill"></div></div>
      `,this.messagesContainer.appendChild(t),this.messagesContainer.scrollTo({top:this.messagesContainer.scrollHeight,behavior:"smooth"}),setTimeout(()=>{let n=t.querySelector(".progress-fill");n&&(n.style.width="100%")},100)},hideProgressBar:function(){let e=document.getElementById("global-progress");e&&e.remove()},addSaveButtonToCard:function(e,t,n){if(!e||!t||!n)return;let a=document.createElement("button");if(e.classList.contains("twitter-header-actions")?(a.className="twitter-action-btn save-btn",a.innerHTML=`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
        </svg>`):(a.className="save-btn",a.innerHTML=`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
        </svg>`),a.setAttribute("aria-label","Save to history"),a.setAttribute("data-category",t),a.setAttribute("data-content-id",n.id||Date.now().toString()),a.title="Save to history",window.TabTalkStorage){let i=t==="thread"?"twitter":t;window.TabTalkStorage.isContentSaved(i,n.id||Date.now().toString()).then(s=>{s&&(a.classList.add("saved"),a.querySelector("svg").setAttribute("fill","currentColor"))})}a.addEventListener("click",async i=>{i.stopPropagation();let s=a.getAttribute("data-content-id"),r=a.getAttribute("data-category"),c=r==="thread"?"twitter":r;if(!window.TabTalkStorage)return;if(await window.TabTalkStorage.isContentSaved(c,s))await window.TabTalkStorage.deleteSavedContent(c,s),a.classList.remove("saved"),a.querySelector("svg").setAttribute("fill","none"),this.showToast("Removed from saved content");else{let u=n.content||e.querySelector(".content-text")?.textContent||"",l={source:this.currentTab?.url||window.location.href,title:this.currentTab?.title||document.title};await window.TabTalkStorage.saveContent(c,{id:s,content:u,metadata:l,type:n.type||(r==="thread"?"thread":"post"),platform:n.platform||(r==="thread"?"thread":"twitter"),...n}),a.classList.add("saved"),a.querySelector("svg").setAttribute("fill","currentColor"),this.showToast("Saved to history")}}),e.appendChild(a)},showToast:function(e,t=2e3){let n=document.createElement("div");n.className="toast",n.textContent=e,document.body.appendChild(n),setTimeout(()=>{n.classList.add("visible")},10),setTimeout(()=>{n.classList.remove("visible"),setTimeout(()=>n.remove(),300)},t)}};window.TabTalkUI=h})();(function(){let h={analyzeAndResearchContent:async function(e,t){let n=this.simpleHash(e.substring(0,500)),a=`analysis_${this.currentTab?.url}_${t.id}_${n}`;try{let i=await chrome.storage.local.get(a);if(i[a]&&Date.now()-i[a].timestamp<18e5)return console.log("Using cached content analysis"),i[a].analysis}catch(i){console.warn("Cache check failed:",i)}let o=`You are an expert content analyst and researcher. Analyze this webpage content and provide:

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
RESEARCH CONTEXT: [relevant background knowledge and expert perspective]`;try{let i=await this.callGeminiAPIWithSystemPrompt("You are an expert content analyst who provides structured, insightful analysis.",o),s=this.parseAnalysisResponse(i);try{let r={};r[a]={analysis:s,timestamp:Date.now()},await chrome.storage.local.set(r)}catch(r){console.warn("Failed to cache analysis:",r)}return s}catch(i){return console.error("Analysis failed:",i),{summary:"Content analysis unavailable.",keyInsights:"- Focus on core message from the content",researchContext:"Apply general domain knowledge and best practices."}}},simpleHash:function(e){let t=0;for(let n=0;n<e.length;n++){let a=e.charCodeAt(n);t=(t<<5)-t+a,t=t&t}return Math.abs(t).toString(36)},parseAnalysisResponse:function(e){let t=e.match(/SUMMARY:\s*(.+?)(?=KEY INSIGHTS:|$)/s),n=e.match(/KEY INSIGHTS:\s*(.+?)(?=RESEARCH CONTEXT:|$)/s),a=e.match(/RESEARCH CONTEXT:\s*(.+?)$/s);return{summary:t?t[1].trim():"Content provides valuable information.",keyInsights:n?n[1].trim():"- Key points from the content",researchContext:a?a[1].trim():"General domain knowledge applies."}},showToneSelector:function(e){if(!this.pageContent||!this.apiKey){this.showToast?this.showToast("\u274C Please set up your Gemini API key first and ensure page content is loaded.",3e3):alert("\u274C Please set up your Gemini API key first and ensure page content is loaded.");return}window.TabTalkToneSelector?window.TabTalkToneSelector.show(e,this.pageContent,(t,n)=>{this.generateSocialContentWithTone(n,t)}):(console.error("Tone selector not loaded"),this.generateSocialContentWithTone(e,{id:"supportive",name:"Supportive with Facts"}))},generateSocialContent:async function(e){this.showToneSelector(e)},generateSocialContentWithTone:async function(e,t){if(!this.pageContent||!this.apiKey){this.showToast?this.showToast("\u274C Please set up your Gemini API key first and ensure page content is loaded.",3e3):alert("\u274C Please set up your Gemini API key first and ensure page content is loaded.");return}this.currentSelectedTone=t,this.setLoading(!0,"Analyzing content..."),console.log(`TabTalk AI: Generating ${e} content for page: ${this.currentTab?.title}`),console.log(`Page content length: ${this.pageContent.length} characters`),console.log(`Selected tone: ${t.name} (${t.id})`);try{this.showProgressBar("Analyzing content...");let n=await this.analyzeAndResearchContent(this.pageContent,t);this.currentContentAnalysis=n,this.showProgressBar("Generating expert post...");let a="",o="",i="",s=t.aiInstructions||this.getDefaultToneInstructions(t.id);if(e==="twitter")i="\u{1F426}",a=`You are an expert Twitter/X content strategist who combines deep analysis with engaging storytelling. You leverage comprehensive research and domain expertise to create posts that are both intellectually rigorous and captivating. Your posts stop people mid-scroll because they offer genuine insights backed by evidence and expert knowledge.

Write in plain text only - no hashtags, no URLs, no formatting symbols. Just pure, engaging expert expression with strategic emojis.

${s}

CONTEXT ANALYSIS:
${n.summary}

KEY INSIGHTS:
${n.keyInsights}

RESEARCH AUGMENTATION (from domain knowledge):
${n.researchContext}`,o=`Transform this webpage content into an electrifying Twitter/X post that feels authentically human.

IMPORTANT: Create a UNIQUE and FRESH take - avoid repeating previous angles. Generation ID: ${Date.now()}

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

${s}

CONTEXT ANALYSIS:
${n.summary}

KEY INSIGHTS:
${n.keyInsights}

RESEARCH AUGMENTATION (from domain knowledge):
${n.researchContext}`,o=`Create a magnetic Twitter thread (3-8 tweets) from this content.

IMPORTANT: Create a UNIQUE and FRESH narrative - explore different angles each time. Generation ID: ${Date.now()}

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

Generate your thread now:`;else{this.showToast?this.showToast("\u274C Only Twitter/X Post and Twitter Thread are supported.",3e3):alert("\u274C Only Twitter/X Post and Twitter Thread are supported.");return}let r=await this.callGeminiAPIWithSystemPrompt(a,o);if(r){console.log(`TabTalk AI: Successfully generated ${e} content, response length: ${r.length} characters`);let c=this.cleanTwitterContent(r);if(this.addTwitterMessage("assistant",c,e),this.addToHistory){let d={timestamp:new Date().toISOString(),url:this.currentTab?.url||"",title:this.currentTab?.title||"",domain:this.currentDomain||"",content:c,type:e};await this.addToHistory(e,d)}await this.saveState()}else throw new Error("Empty response received from Gemini API")}catch(n){console.error("Error generating social content:",n),console.error("Error details:",{message:n.message,stack:n.stack,platform:e,hasApiKey:!!this.apiKey,hasPageContent:!!this.pageContent,pageContentLength:this.pageContent?.length}),this.showToast?this.showToast(`\u274C Error: ${n.message}. Please check your API key and try again.`,4e3):alert(`\u274C Error generating social media content: ${n.message}. Please check your API key and try again.`)}finally{this.setLoading(!1),this.hideProgressBar()}},showProgressBar:function(e){this.hideProgressBar();let t=document.createElement("div");t.className="progress-container",t.id="twitter-progress",t.innerHTML=`
        <div class="progress-message">${e}</div>
        <div class="progress-bar">
          <div class="progress-fill"></div>
        </div>
      `,this.messagesContainer.appendChild(t),this.messagesContainer.scrollTo({top:this.messagesContainer.scrollHeight,behavior:"smooth"}),setTimeout(()=>{let n=t.querySelector(".progress-fill");n&&(n.style.width="100%")},100)},hideProgressBar:function(){let e=document.getElementById("twitter-progress");e&&e.remove()},addTwitterMessage:function(e,t,n){this.renderTwitterContent(t,n)},renderTwitterContent:function(e,t){let n=document.createElement("div");if(n.className="twitter-content-container",t==="thread"){let a=this.parseTwitterThread(e),o=`thread_${Date.now()}`;this.autoSaveThread(o,a,e);let i=document.createElement("div");i.className="thread-header";let s=this.getTotalChars(a);i.innerHTML=`
          <div class="thread-info">
            <span class="thread-icon">\u{1F9F5}</span>
            <span class="thread-title">Thread Generated</span>
            <span class="thread-meta">${a.length} tweets \u2022 ${s} chars</span>
          </div>
          <div class="thread-actions">
            <button class="btn-copy-all-thread" data-thread-id="${o}" title="Copy all tweets">
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
              <input type="range" class="master-length-slider" min="500" max="5000" value="${s}" step="100" data-thread-id="${o}">
              <span class="slider-max">5000</span>
            </div>
            <div class="slider-value">
              <span class="current-length">${s}</span> characters total
            </div>
          </div>
          <div class="master-control-actions">
            <button class="btn-regenerate-thread" data-thread-id="${o}" title="Regenerate entire thread with new length">
              \u{1F504} Regenerate Thread
            </button>
          </div>
        `,n.appendChild(r);let c=i.querySelector(".btn-copy-all-thread"),d=i.querySelector(".copy-all-status");c.addEventListener("click",async()=>{await this.copyAllTweets(a,c,d)});let u=r.querySelector(".master-length-slider"),l=r.querySelector(".current-length"),m=r.querySelector(".btn-regenerate-thread"),p=r.querySelectorAll(".preset-btn");u.addEventListener("input",y=>{l.textContent=y.target.value}),p.forEach(y=>{y.addEventListener("click",()=>{let g=y.dataset.length;u.value=g,l.textContent=g})}),m.addEventListener("click",async()=>{let y=parseInt(u.value);await this.regenerateEntireThread(n,o,y,e)}),a.forEach((y,g)=>{let w=`Thread ${g+1}/${a.length}`,v=this.createTwitterCard(y,w,!0);v.dataset.platform=t,v.dataset.threadId=o,n.appendChild(v)})}else{let a=this.createTwitterCard(e,"Post");a.dataset.platform=t,n.appendChild(a)}this.messagesContainer.appendChild(n),setTimeout(()=>{this.messagesContainer.scrollTo({top:this.messagesContainer.scrollHeight,behavior:"smooth"})},100)},parseTwitterThread:function(e){let n=this.cleanTwitterContent(e).replace(/Here's your clean.*?content:\s*/gi,"").trim(),a=[],o=n.split(`
`),i="",s=null;for(let r of o){let c=r.trim(),d=c.match(/^(\d+)\/(\d+)[\s:]*(.*)$/);d?(i.trim()&&a.push(i.trim()),s=d[1],i=d[3]||""):s!==null&&c&&(i+=(i?`
`:"")+c)}return i.trim()&&a.push(i.trim()),a.length===0?(console.warn("Thread parsing failed, returning full content as single tweet"),[n||e]):(console.log(`\u2705 Parsed ${a.length} tweets from thread`),a)},createTwitterCard:function(e,t,n=!1){let a=document.createElement("div");a.className="twitter-card";let o=this.currentSelectedTone?`
        <div class="tone-badge" style="background: linear-gradient(135deg, ${this.currentSelectedTone.tone1?.color||this.getToneColor(this.currentSelectedTone.id)} 0%, ${this.currentSelectedTone.tone2?.color||this.getToneColor(this.currentSelectedTone.id)} 100%);">
          ${this.currentSelectedTone.tone1?.icon||this.getToneIcon(this.currentSelectedTone.id)} ${this.currentSelectedTone.name}
        </div>
      `:"",i=n?`
        <div class="twitter-controls">
          <div class="twitter-char-count">${this.getAccurateCharacterCount(e)} characters</div>
        </div>
      `:`
        <div class="twitter-controls">
          ${o}
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
      `,window.TabTalkUI&&window.TabTalkUI.addSaveButtonToCard){let u={id:Date.now().toString(),content:e,title:t},l=t.toLowerCase().includes("thread")?"thread":"twitter",m=a.querySelector(".twitter-header-actions");m&&window.TabTalkUI.addSaveButtonToCard(m,l,u)}let s=a.querySelector(".copy-btn"),r=a.querySelector(".twitter-text"),c=s.innerHTML;s.addEventListener("click",async u=>{u.stopPropagation();try{await navigator.clipboard.writeText(r.value),s.innerHTML=`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20,6 9,17 4,12"></polyline>
          </svg>`,s.classList.add("success"),setTimeout(()=>{s.innerHTML=c,s.classList.remove("success")},2e3)}catch(l){console.error("Copy failed:",l)}});let d=()=>{r.style.height="auto",r.style.height=Math.max(80,r.scrollHeight)+"px"};if(setTimeout(d,0),r.addEventListener("input",()=>{let u=a.querySelector(".twitter-char-count"),l=this.getAccurateCharacterCount(r.value);u.textContent=`${l} characters`,u.style.color="var(--text-secondary)",d()}),!n){let u=a.querySelector(".length-slider"),l=a.querySelector(".length-display"),m=a.querySelector(".regenerate-btn");u&&l&&u.addEventListener("input",()=>{l.textContent=u.value}),a.dataset.originalContent=this.pageContent,a.dataset.platform=t.includes("Thread")?"thread":"twitter",this.currentSelectedTone&&(a.dataset.selectedTone=JSON.stringify(this.currentSelectedTone)),m&&m.addEventListener("click",async()=>{let p=parseInt(u.value),y=a.dataset.platform,g=a.dataset.selectedTone?JSON.parse(a.dataset.selectedTone):this.currentSelectedTone;await this.regenerateWithLength(a,p,y,{selectedTone:g})})}return a},cleanTwitterContent:function(e){if(!e)return e;let t=e;return t=t.replace(/^.*?Unacceptable.*?\n/gim,""),t=t.replace(/^.*?critical failure.*?\n/gim,""),t=t.replace(/^.*?forbidden.*?formatting.*?\n/gim,""),t=t.replace(/^.*?breaks the instructions.*?\n/gim,""),t=t.replace(/^.*?--[•\-]\s*Original Response:.*?\n/gim,""),t=t.replace(/^.*?You have used.*?\n/gim,""),t=t.replace(/^.*?This output is unusable.*?\n/gim,""),t=t.replace(/^.*?Here's your.*?content:.*?\n/gim,""),t=t.replace(/^.*?OUTPUT:.*?\n/gim,""),t=t.replace(/#\w+/g,""),t=t.replace(/#/g,""),t=t.replace(/\*\*([^*]+)\*\*/g,"$1"),t=t.replace(/\*([^*]+)\*/g,"$1"),t=t.replace(/_{2,}([^_]+)_{2,}/g,"$1"),t=t.replace(/_([^_]+)_/g,"$1"),t=t.replace(/\*{2,}/g,""),t=t.replace(/_{2,}/g,""),t=t.replace(/\(line break\)/gi,`
`),t=t.replace(/\[line break\]/gi,`
`),t=t.replace(/^[-*]\s+/gm,"\u2022 "),t=t.replace(/https?:\/\/\S+/gi,""),t=t.replace(/\((https?:\/\/[^)]+)\)/gi,""),t=t.replace(/www\.\S+/gi,""),t=t.replace(/\[([^\]]+)\]\([^)]+\)/g,"$1"),t=t.replace(/\[([^\]]+)\]/g,"$1"),t=t.replace(/\(emphasis\)/gi,""),t=t.replace(/\(bold\)/gi,""),t=t.replace(/\(italic\)/gi,""),t=t.replace(/\n{3,}/g,`

`),t=t.replace(/[ \t]+/g," "),t=t.replace(/(^|\n)\s*$/g,""),t=t.trim(),t},getAccurateCharacterCount:function(e){if(!e)return 0;let t=e.trim(),n=0,a=Array.from(t);for(let o of a)this.isEmojiOrSpecialChar(o)?n+=2:n+=1;return n},isEmojiOrSpecialChar:function(e){let t=e.codePointAt(0);return t>=126976&&t<=129535||t>=9728&&t<=9983||t>=9984&&t<=10175||t>=128512&&t<=128591||t>=127744&&t<=128511||t>=128640&&t<=128767||t>=127456&&t<=127487||t>=8205},regenerateWithLength:async function(e,t,n,a){let o=e.querySelector(".twitter-text"),i=e.querySelector(".regenerate-btn"),s=e.dataset.originalContent;i.textContent="\u23F3",i.disabled=!0;try{let r="",c="",d=a&&a.selectedTone||this.currentSelectedTone||{id:"supportive",name:"Supportive with Facts"},u=d.aiInstructions||this.getDefaultToneInstructions(d.id),l=this.currentContentAnalysis||{summary:"Content provides valuable information.",keyInsights:"- Key points from the content",researchContext:"Apply general domain knowledge and best practices."};if(n==="twitter")r=`You are an expert Twitter/X content strategist creating ${t}-character posts that combine deep analysis with engaging storytelling. Every word is backed by research and expertise while radiating personality and human warmth. Write in plain text with strategic emojis - no hashtags, no URLs, no formatting symbols.

${u}

CONTEXT ANALYSIS:
${l.summary}

KEY INSIGHTS:
${l.keyInsights}

RESEARCH AUGMENTATION:
${l.researchContext}`,c=`Recreate this as an expert ${t}-character Twitter post that combines insight with engagement.

YOUR APPROACH:
\u2713 Target: ${t} characters (\xB110 acceptable)
\u2713 Write with GENUINE excitement and energy
\u2713 Use natural line breaks for rhythm
\u2713 Include 2-4 emojis strategically placed
\u2713 Start with a scroll-stopping hook
\u2713 Add punchy, conversational language
\u2713 Mix short zingers with flowing sentences
\u2713 Apply the ${d.name} tone throughout
\u2713 End with impact or intrigue

KEEP IT CLEAN:
\u2717 No hashtags
\u2717 No formatting symbols
\u2717 No URLs
\u2717 No meta-commentary

ORIGINAL CONTENT:
${s}

Transform it now:`;else if(n==="thread"){let p=Math.ceil(t/400);r=`You are an expert Twitter/X thread strategist crafting ${p} tweets (${t} total characters) that combine deep analysis with compelling narrative. Each tweet builds on expert insights while maintaining human warmth and accessibility. Write in plain text with strategic emojis - no hashtags, no URLs, no formatting.

${u}

CONTEXT ANALYSIS:
${l.summary}

KEY INSIGHTS:
${l.keyInsights}

RESEARCH AUGMENTATION:
${l.researchContext}`,c=`Recreate this as an expert ${p}-tweet thread (around ${t} characters total).

YOUR STORYTELLING APPROACH:
\u2713 Create ${p} numbered tweets (1/${p}, 2/${p}, etc.)
\u2713 Total: approximately ${t} characters
\u2713 Write with genuine enthusiasm and energy
\u2713 Use line breaks for visual breathing room
\u2713 Include 1-2 emojis per tweet naturally
\u2713 Each tweet delivers a powerful insight
\u2713 Build narrative momentum throughout
\u2713 Mix punchy short lines with flowing explanations
\u2713 Apply the ${d.name} tone throughout
\u2713 End with an unforgettable closer

KEEP IT CLEAN:
\u2717 No hashtags
\u2717 No formatting symbols
\u2717 No URLs
\u2717 No explanations about format

ORIGINAL CONTENT:
${s}

Craft your thread now:`}let m=await this.callGeminiAPIWithSystemPrompt(r,c);if(m){let p=this.cleanTwitterContent(m);if(n==="thread"){let v=this.parseTwitterThread(p)[0]||p;o.value=v}else o.value=p;let y=e.querySelector(".twitter-char-count"),g=this.getAccurateCharacterCount(o.value);y.textContent=`${g} characters`,setTimeout(()=>{o.style.height="auto",o.style.height=Math.max(80,o.scrollHeight)+"px"},0)}}catch(r){console.error("Error regenerating content:",r),alert("Error regenerating content. Please try again.")}finally{i.textContent="\u{1F504}",i.disabled=!1}},getDefaultToneInstructions:function(e){let t={supportive:`TONE: Supportive with Facts
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
- Achievable steps`};return t[e]||t.supportive},getToneColor:function(e){return{supportive:"var(--accent-color)",critical:"var(--accent-medium)",trolling:"var(--accent-light)","anti-propaganda":"var(--accent-color)","critical-humor":"var(--accent-medium)",sarcastic:"var(--accent-light)",investigative:"var(--accent-color)",optimistic:"var(--accent-medium)",cautionary:"var(--accent-light)",empowering:"var(--accent-color)"}[e]||"var(--accent-color)"},getToneIcon:function(e){return{supportive:"\u{1F91D}",critical:"\u2694\uFE0F",trolling:"\u{1F608}","anti-propaganda":"\u{1F6E1}\uFE0F","critical-humor":"\u{1F605}",sarcastic:"\u{1F3AD}",investigative:"\u{1F50D}",optimistic:"\u{1F305}",cautionary:"\u26A0\uFE0F",empowering:"\u{1F4AA}"}[e]||"\u{1F3AD}"},autoSaveThread:async function(e,t,n){if(!window.TabTalkStorage||!window.TabTalkStorage.saveContent){console.warn("Storage module not available for gallery persistence");return}try{let a=Array.isArray(t)?t.map((o,i)=>`${i+1}/${t.length}:
${o}`).join(`

---

`):String(n||"");await window.TabTalkStorage.saveContent("twitter",{id:e,type:"thread",platform:"thread",title:this.currentTab?.title||"Untitled Thread",url:this.currentTab?.url||"",domain:this.currentDomain||"",content:a,tweets:Array.isArray(t)?t.map((o,i)=>({id:`tweet_${i+1}`,number:`${i+1}/${t.length}`,content:o,charCount:this.getAccurateCharacterCount(o)})):[],rawContent:n,totalTweets:Array.isArray(t)?t.length:0,totalChars:Array.isArray(t)?this.getTotalChars(t):this.getAccurateCharacterCount(a),isAutoSaved:!0,timestamp:Date.now(),updatedAt:Date.now()}),console.log("\u2705 Thread auto-saved to Gallery:",e),this.showAutoSaveNotification()}catch(a){console.error("Error auto-saving thread to Gallery:",a)}},copyAllTweets:async function(e,t,n){try{let a=e.map((o,i)=>`${i+1}/${e.length}:
${o}`).join(`

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
      `,document.body.appendChild(e),setTimeout(()=>{e.style.animation="slideOutDown 0.3s ease",setTimeout(()=>e.remove(),300)},2e3)},regenerateEntireThread:async function(e,t,n,a){let o=e.querySelector(".btn-regenerate-thread");if(!o)return;let i=o.textContent;o.textContent="\u23F3 Regenerating...",o.disabled=!0;try{let s=Math.max(3,Math.min(8,Math.ceil(n/500))),r=`You are a masterful Twitter/X thread storyteller crafting ${s} tweets (${n} total characters) that captivate from start to finish. Each tweet vibrates with personality, energy, and human warmth. You turn complex ideas into addictive narratives. Write in plain text with strategic emojis - no hashtags, no URLs, no formatting. Pure storytelling magic.`,c=`Create a magnetic Twitter thread with EXACTLY ${s} tweets totaling approximately ${n} characters.

CRITICAL FORMAT REQUIREMENT:
You MUST start each tweet with its number in this EXACT format:
1/${s}:
2/${s}:
3/${s}:
etc.

THREAD STRUCTURE:
- Tweet 1: Explosive hook (15% of total = ${Math.floor(n*.15)} chars)
- Tweets 2-${s-1}: Value bombs (60% of total = ${Math.floor(n*.6/(s-2))} chars each)
- Tweet ${s}: Unforgettable closer (25% of total = ${Math.floor(n*.25)} chars)

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
1/${s}:
[Your explosive hook here]

2/${s}:
[Your value bomb here]

Craft your ${n}-character thread now:`,d=await this.callGeminiAPIWithSystemPrompt(r,c);if(d){let u=this.cleanTwitterContent(d),l=this.parseTwitterThread(u);e.querySelectorAll(".twitter-card").forEach(w=>w.remove()),l.forEach((w,v)=>{let f=`Thread ${v+1}/${l.length}`,T=this.createTwitterCard(w,f,!0);T.dataset.platform="thread",T.dataset.threadId=t,e.appendChild(T)});let p=e.querySelector(".thread-meta");p&&(p.textContent=`${l.length} tweets \u2022 ${this.getTotalChars(l)} chars`);let y=e.querySelector(".current-length");y&&(y.textContent=this.getTotalChars(l));let g=e.querySelector(".master-length-slider");g&&(g.value=this.getTotalChars(l)),await this.autoSaveThread(t,l,u),console.log("\u2705 Thread regenerated successfully")}}catch(s){console.error("Error regenerating thread:",s),alert("Failed to regenerate thread. Please try again.")}finally{o.textContent=i,o.disabled=!1}}};window.TabTalkTwitter=h})();(function(){let h={knowledgePacks:{},modalInitialized:!1,popupInstance:null,init:function(){this.modalInitialized||(this.createModalHTML(),this.bindModalEvents(),this.modalInitialized=!0)},createModalHTML:function(){document.getElementById("thread-generator-modal")||document.body.insertAdjacentHTML("beforeend",`
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
                <select id="modal-thread-category" class="builder-select" style="width: 100%; padding: 10px 12px; border-radius: 10px; font-size: 14px;">
                  <option value="history">\u{1F4DC} History</option>
                  <option value="sports">\u26BD Sports</option>
                  <option value="stories">\u{1F4D6} Stories</option>
                  <option value="celebrity">\u2B50 Celebrity</option>
                  <option value="news">\u{1F4F0} News</option>
                </select>
              </div>
              
              <div class="form-group" style="margin-bottom: 20px;">
                <label style="display: block; font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">Topic</label>
                <input type="text" id="modal-thread-topic" class="builder-select" placeholder="e.g., The fall of the Roman Empire" style="width: 100%; padding: 10px 12px; border-radius: 10px; font-size: 14px;" />
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
      `)},bindModalEvents:function(){let e=document.getElementById("thread-generator-modal");if(!e)return;let t=e.querySelector(".tone-modal-close"),n=e.querySelector(".tone-modal-overlay"),a=document.getElementById("thread-gen-cancel-btn"),o=document.getElementById("thread-gen-generate-btn");t?.addEventListener("click",()=>this.hideModal()),n?.addEventListener("click",()=>this.hideModal()),a?.addEventListener("click",()=>this.hideModal()),o?.addEventListener("click",()=>this.handleGenerate()),e.addEventListener("keydown",i=>{i.key==="Escape"&&this.hideModal()})},showModal:function(e){if(e)h.popupInstance=e,console.log("ThreadGenerator: Stored popup instance, has apiKey:",!!e.apiKey);else{console.error("ThreadGenerator: No popup instance provided to showModal"),alert("Unable to open thread generator. Please refresh and try again.");return}h.init();let t=document.getElementById("thread-generator-modal");if(!t)return;t.classList.remove("hidden"),t.setAttribute("aria-hidden","false"),document.getElementById("modal-thread-topic")?.focus()},hideModal:function(){let e=document.getElementById("thread-generator-modal");e&&(e.classList.add("hidden"),e.setAttribute("aria-hidden","true"))},handleGenerate:async function(){let e=document.getElementById("modal-thread-category")?.value,t=document.getElementById("modal-thread-topic")?.value?.trim(),n=document.getElementById("modal-use-knowledge-pack")?.checked;if(!t){alert("Please enter a topic");return}console.log("ThreadGenerator: handleGenerate called"),console.log("ThreadGenerator: popupInstance exists:",!!h.popupInstance),console.log("ThreadGenerator: popupInstance has apiKey:",!!h.popupInstance?.apiKey),console.log("ThreadGenerator: popupInstance has generateThreadMVP:",!!h.popupInstance?.generateThreadMVP),h.hideModal(),h.popupInstance&&h.popupInstance.resetScreenForGeneration&&h.popupInstance.resetScreenForGeneration(),h.popupInstance&&h.popupInstance.generateThreadMVP?await h.popupInstance.generateThreadMVP(e,t,{useKnowledgePack:n,maxTweets:8,tone:"curious"}):(console.error("Popup instance not available for thread generation"),console.error("popupInstance:",h.popupInstance),alert("Unable to generate thread. Please try again."))},loadKnowledgePack:async function(e){if(this.knowledgePacks[e])return this.knowledgePacks[e];try{let t=await fetch(`knowledge-packs/${e}.json`);if(!t.ok)return console.warn(`Knowledge pack not found for ${e}`),null;let n=await t.json();return this.knowledgePacks[e]=n,n}catch(t){return console.error(`Error loading knowledge pack for ${e}:`,t),null}},getRandomHook:function(e){if(!e||!e.hooks||e.hooks.length===0)return null;let t=Math.floor(Math.random()*e.hooks.length);return e.hooks[t]},generateThreadMVP:async function(e,t,n={}){let a=this;if(!a.apiKey){alert("\u274C Please set up your Gemini API key first."),a.showView&&a.showView("settings");return}let o=n.useKnowledgePack!==!1,i=n.maxTweets||8,s=n.tone||"curious";a.setLoading(!0,`Generating ${e} thread...`),console.log(`Fibr: Generating thread for category: ${e}, topic: ${t}`);try{let r="";if(o){let f=await h.loadKnowledgePack(e);f&&f.facts&&(r=`

RELEVANT KNOWLEDGE BASE:
${f.facts.slice(0,5).map((T,b)=>`${b+1}. ${T}`).join(`
`)}
`)}a.showProgressBar&&a.showProgressBar(`Generating ${e} thread...`);let c=`You are a precise thread outline creator. You create structured outlines for engaging Twitter/X threads about ${e}. No markdown, no hashtags.`,d=`Create a ${i}-tweet thread outline about: ${t}

Category: ${e}
Tone: ${s}
${r}

Create an outline with ${i} beats:
- Beat 1: Hook (attention-grabbing opener)
- Beats 2-${i-1}: Core content (facts, insights, twists)
- Beat ${i}: Closer (memorable ending)

Format each beat as:
[Beat number]: [One-sentence description]

Generate the outline now:`,u=await a.callGeminiAPIWithSystemPrompt(c,d);if(!u)throw new Error("Failed to generate outline");console.log("\u2705 Outline generated");let l=`You are a masterful Twitter/X thread storyteller. You craft threads about ${e} that captivate readers. Each tweet pulses with energy and personality. Write in plain text with strategic emojis - no hashtags, no URLs, no formatting symbols.`,m=`Transform this outline into a complete ${i}-tweet thread about: ${t}

OUTLINE:
${u}

CRITICAL FORMAT:
Start each tweet with: 1/${i}: 2/${i}: 3/${i}: etc.

TONE: ${s}
${s==="curious"?"- Ask questions, spark wonder, invite exploration":""}
${s==="neutral"?"- Factual, balanced, informative":""}
${s==="dramatic"?"- Bold, intense, emotionally charged":""}

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

Generate the complete thread now:`,p=await a.callGeminiAPIWithSystemPrompt(l,m);if(!p)throw new Error("Failed to expand thread");console.log("\u2705 Thread expanded");let y=a.cleanTwitterContent(p),g=a.parseTwitterThread(y),w=[];for(let f of g)if(a.getAccurateCharacterCount(f)<=280)w.push(f);else{let b=await h.smartSplitTweet.call(a,f,280);w.push(...b)}console.log(`\u2705 Thread generated: ${w.length} tweets`);let v=`thread_${Date.now()}`;h.renderThreadGeneratorResult.call(a,w,v,e,t,o),a.autoSaveThread&&await a.autoSaveThread(v,w,y),await a.saveState()}catch(r){console.error("Error generating thread:",r),alert(`\u274C Error generating thread: ${r.message}`)}finally{a.setLoading(!1),a.hideProgressBar&&a.hideProgressBar()}},smartSplitTweet:async function(e,t){let n=e.match(/[^.!?]+[.!?]+/g)||[e],a=[],o="";for(let i of n)this.getAccurateCharacterCount(o+i)<=t?o+=i:(o&&a.push(o.trim()),o=i);return o&&a.push(o.trim()),a.length>0?a:[e.substring(0,t)]},renderThreadGeneratorResult:function(e,t,n,a,o=!0){let i=document.createElement("div");i.className="twitter-content-container thread-generator-result",i.dataset.category=n,i.dataset.topic=a,i.dataset.useKnowledgePack=o;let s=document.createElement("div");s.className="thread-header";let r=this.getTotalChars(e);s.innerHTML=`
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
      `,i.appendChild(s);let c=s.querySelector(".btn-copy-all-thread"),d=s.querySelector(".copy-all-status");c.addEventListener("click",async()=>{await this.copyAllTweets(e,c,d)});let u=document.createElement("div");u.className="thread-master-control",u.innerHTML=`
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
      `,i.appendChild(u);let l=u.querySelector(".master-length-slider"),m=u.querySelector(".current-length"),p=u.querySelector(".btn-regenerate-thread"),y=u.querySelectorAll(".preset-btn");l.addEventListener("input",g=>{m.textContent=g.target.value}),y.forEach(g=>{g.addEventListener("click",()=>{let w=g.dataset.length;l.value=w,m.textContent=w})}),p.addEventListener("click",async()=>{let g=parseInt(l.value);await this.regenerateEntireThreadForGenerator(i,t,g,n,a,o)}),e.forEach((g,w)=>{let v=`Thread ${w+1}/${e.length}`,f=this.createTwitterCard(g,v,!0);f.dataset.platform="thread",f.dataset.threadId=t,f.dataset.category=n,i.appendChild(f)}),this.messagesContainer.appendChild(i),setTimeout(()=>{this.messagesContainer.scrollTo({top:this.messagesContainer.scrollHeight,behavior:"smooth"})},100)},regenerateEntireThreadForGenerator:async function(e,t,n,a,o,i){let s=e.querySelector(".btn-regenerate-thread");if(!s)return;let r=s.textContent;s.textContent="\u23F3 Regenerating...",s.disabled=!0;try{let c=Math.max(3,Math.min(12,Math.ceil(n/400))),d="";if(i){let p=await this.loadKnowledgePack(a);p&&p.facts&&(d=`

RELEVANT KNOWLEDGE BASE:
${p.facts.slice(0,5).map((y,g)=>`${g+1}. ${y}`).join(`
`)}
`)}let u=`You are a masterful Twitter/X thread storyteller crafting ${c} tweets (${n} total characters) about ${a}. Each tweet vibrates with personality, energy, and human warmth. Write in plain text with strategic emojis - no hashtags, no URLs, no formatting. Pure storytelling magic.`,l=`Create a magnetic Twitter thread with EXACTLY ${c} tweets totaling approximately ${n} characters about: ${o}

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

${d}

Craft your ${n}-character thread now:`,m=await this.callGeminiAPIWithSystemPrompt(u,l);if(m){let p=this.cleanTwitterContent(m),y=this.parseTwitterThread(p);e.querySelectorAll(".twitter-card").forEach(T=>T.remove()),y.forEach((T,b)=>{let C=`Thread ${b+1}/${y.length}`,k=this.createTwitterCard(T,C,!0);k.dataset.platform="thread",k.dataset.threadId=t,k.dataset.category=a,e.appendChild(k)});let w=e.querySelector(".thread-meta");w&&(w.textContent=`${y.length} tweets \u2022 ${this.getTotalChars(y)} chars`);let v=e.querySelector(".current-length");v&&(v.textContent=this.getTotalChars(y));let f=e.querySelector(".master-length-slider");f&&(f.value=this.getTotalChars(y)),this.autoSaveThread&&await this.autoSaveThread(t,y,p),console.log("\u2705 Thread regenerated successfully")}}catch(c){console.error("Error regenerating thread:",c),alert("Failed to regenerate thread. Please try again.")}finally{s.textContent=r,s.disabled=!1}},showThreadGeneratorView:function(){document.getElementById("thread-generator-view")&&this.showView("thread-generator")},initializeHowItWorksToggle:function(){let e=document.getElementById("how-it-works-toggle"),t=document.getElementById("how-it-works-content");!e||!t||(t.classList.remove("expanded"),e.classList.remove("expanded"),e.addEventListener("click",()=>{t.classList.contains("expanded")?(t.classList.remove("expanded"),e.classList.remove("expanded")):(t.classList.add("expanded"),e.classList.add("expanded"))}))},handleThreadGeneratorSubmit:async function(){let e=document.getElementById("thread-category"),t=document.getElementById("thread-topic"),n=document.getElementById("use-knowledge-pack");if(!e||!t){console.error("Thread generator form elements not found");return}let a=e.value,o=t.value.trim();if(!o){window.TabTalkUI?.showToast("Please enter a topic",2e3);return}if(window.TabTalkEnhancedQuickActions){window.TabTalkEnhancedQuickActions.generateThread();return}let i=n?n.checked:!0;try{let s=document.getElementById("generate-thread-btn"),r=s.textContent;s.textContent="\u23F3 Generating...",s.disabled=!0;let c=`Create an engaging Twitter thread about "${o}".`;a!=="general"&&(c+=` Use the ${a} knowledge base for relevant facts and insights.`),c+=` Create an 8-tweet thread with the following requirements:
- Start each tweet with "1/n:", "2/n:", etc.
- Use natural emojis (2-4 per thread total)
- No hashtags or URLs
- Include a compelling hook in the first tweet
- End with a clear call-to-action
- Use the ${a} style and tone appropriate for this topic`,i&&(c+=" Include relevant facts, statistics, and expert insights from the knowledge base.");let d=await window.TabTalkAPI?.callGeminiAPI(c);d&&(this.displayThreadResult(d,o,a),this.saveThreadToGallery(d,o,a),window.TabTalkUI?.showToast("Thread generated successfully!",2e3))}catch(s){console.error("Thread generation failed:",s),window.TabTalkUI?.showToast("Failed to generate thread",3e3)}finally{let s=document.getElementById("generate-thread-btn");s&&(s.textContent="\u{1F680} Generate Enhanced Thread",s.disabled=!1)}}};window.TabTalkThreadGenerator=h})();(function(){let h={initializeHorizontalScroll:function(){let e=document.querySelector(".scroll-container"),t=document.getElementById("scroll-left"),n=document.getElementById("scroll-right");if(!e||!t||!n)return;let a=200;t.addEventListener("click",()=>{e.scrollBy({left:-a,behavior:"smooth"})}),n.addEventListener("click",()=>{e.scrollBy({left:a,behavior:"smooth"})});let o=()=>{let c=e.scrollWidth-e.clientWidth;t.disabled=e.scrollLeft<=0,n.disabled=e.scrollLeft>=c};e.addEventListener("scroll",o),o(),e.addEventListener("wheel",c=>{c.deltaY!==0&&(c.preventDefault(),e.scrollLeft+=c.deltaY,o())});let i=!1,s,r;e.addEventListener("mousedown",c=>{i=!0,s=c.pageX-e.offsetLeft,r=e.scrollLeft,e.style.cursor="grabbing"}),e.addEventListener("mouseleave",()=>{i=!1,e.style.cursor="grab"}),e.addEventListener("mouseup",()=>{i=!1,e.style.cursor="grab",o()}),e.addEventListener("mousemove",c=>{if(!i)return;c.preventDefault();let u=(c.pageX-e.offsetLeft-s)*1.5;e.scrollLeft=r-u}),e.style.cursor="grab"}};window.TabTalkScroll=h})();(function(){let h={INIT_KEY:"savedContent",async loadSaved(e="twitter"){if(!window.TabTalkStorage||!TabTalkStorage.getSavedContent)return console.error("Gallery: TabTalkStorage not available"),[];let t=await TabTalkStorage.getSavedContent();return t?e==="all"?Object.entries(t).flatMap(([a,o])=>Array.isArray(o)?o.map(i=>({...i,_category:a})):[]):Array.isArray(t[e])?t[e]:[]:[]},async render(e,t="twitter"){e.innerHTML="";let n=document.createElement("div");n.className="gallery-header",n.innerHTML=`
        <div class="gallery-header-top">
          <button class="back-btn" id="gallery-back-btn" aria-label="Back" title="Back">\u2190</button>
          <h2>Gallery</h2>
          <span id="gallery-count" class="gallery-count"></span>
        </div>
        <div class="gallery-header-bottom">
          <input id="gallery-search" class="gallery-search" placeholder="Search saved..." aria-label="Search saved content" />
          <select id="gallery-sort" class="gallery-sort" aria-label="Sort">
            <option value="updated_desc">Updated \u2193</option>
            <option value="created_desc">Created \u2193</option>
            <option value="length_asc">Length \u2191</option>
            <option value="length_desc">Length \u2193</option>
          </select>
          <button id="gallery-delete-all" class="gallery-delete-all" title="Delete all">Delete All</button>
        </div>
      `,e.appendChild(n);let a=document.createElement("div");a.className="gallery-list",e.appendChild(a);let o=await this.loadSaved(t);this.initVirtualList(a,o),n.querySelector("#gallery-back-btn").addEventListener("click",()=>{window.TabTalkNavigation&&TabTalkNavigation.showView&&TabTalkNavigation.showView("chat")});let s=n.querySelector("#gallery-search"),r=n.querySelector("#gallery-sort"),c=n.querySelector("#gallery-count"),d=n.querySelector("#gallery-delete-all"),u=async()=>{let l=(s.value||"").toLowerCase(),m=r.value,p=await this.loadSaved(t);l&&(p=p.filter(y=>(y.content||"").toLowerCase().includes(l)||(y.domain||"").toLowerCase().includes(l))),p=this.sortItems(p,m),this.initVirtualList(a,p),this.renderList(a,p.slice(0,this._virtual.batch)),c.textContent=`${p.length}/50`};s.addEventListener("input",this.debounce(u,150)),r.addEventListener("change",u),c.textContent=`${o.length}/50`,d&&d.addEventListener("click",async()=>{confirm("Delete all saved items in this category?")&&window.TabTalkStorage&&TabTalkStorage.clearSavedCategory&&(await TabTalkStorage.clearSavedCategory(t),this.initVirtualList(a,[]),this.renderList(a,[]),c.textContent="0/50")})},sortItems(e,t){let n=[...e];switch(t){case"created_desc":return n.sort((a,o)=>(o.timestamp||0)-(a.timestamp||0));case"length_asc":return n.sort((a,o)=>(a.charCountAccurate||(a.content||"").length)-(o.charCountAccurate||(o.content||"").length));case"length_desc":return n.sort((a,o)=>(o.charCountAccurate||(o.content||"").length)-(a.charCountAccurate||(a.content||"").length));case"updated_desc":default:return n.sort((a,o)=>(o.updatedAt||o.timestamp||0)-(a.updatedAt||a.timestamp||0))}},renderList(e,t){if(!t||t.length===0){e.innerHTML=`
          <div class="gallery-empty">
            <img src="icons/icon128.jpeg" alt="" />
            <h3>No saved posts yet</h3>
            <p>Use the Save button on any generated card to add it here.</p>
          </div>
        `;return}if(this._virtual&&this._virtual.list===e){this.appendNextBatch();return}e.innerHTML="";let n=document.createDocumentFragment();t.forEach(a=>{let o=this.renderCard(a);n.appendChild(o)}),e.appendChild(n)},initVirtualList(e,t){let n=e;n.innerHTML="",this._virtual={list:n,items:t||[],index:0,batch:20},this.appendNextBatch(),this._virtual.items.length>this._virtual.batch&&this.appendNextBatch();let a=()=>{let{list:o}=this._virtual||{};o&&o.scrollTop+o.clientHeight>=o.scrollHeight-120&&this.appendNextBatch()};this._virtualScrollHandler&&n.removeEventListener("scroll",this._virtualScrollHandler),this._virtualScrollHandler=a,n.addEventListener("scroll",a,{passive:!0})},appendNextBatch(){let e=this._virtual;if(!e||!e.list||e.index>=e.items.length)return;let t=e.index,n=Math.min(e.index+e.batch,e.items.length),a=document.createDocumentFragment();for(let o=t;o<n;o++)a.appendChild(this.renderCard(e.items[o]));e.list.appendChild(a),e.index=n},renderCard(e){let t=document.createElement("div"),n=(e.platform||"").toLowerCase()==="thread"||(e.title||"").toLowerCase().includes("thread")||(e.content||"").includes("1/")||(e.content||"").includes("\u{1F9F5}"),a=(e.content||"").length>500,o="gallery-card";n?o+=" card-thread":a&&(o+=" card-long"),t.className=o;let i=this.getAccurateCharacterCount(e.content||"");t.innerHTML=`
        <div class="gallery-card-header">
          <div class="title-row">
            <span class="title">${this.escapeHtml(e.title||"Post")}</span>
            <span class="badge platform">${this.escapeHtml((e.platform||"twitter").toUpperCase())}</span>
          </div>
          <div class="meta-row">
            <span class="timestamp">${this.formatDate(e.updatedAt||e.timestamp)}</span>
            <span class="metrics">${i} chars</span>
          </div>
        </div>
        <div class="gallery-card-body">
          <div class="gallery-preview" data-content="${this.escapeHtml(e.content||"")}">
            ${this.escapeHtml(e.content||"").substring(0,200)}${(e.content||"").length>200?"...":""}
          </div>
        </div>
        <div class="gallery-card-footer">
          <button class="btn-action copy" title="Copy"><span>Copy</span></button>
          <button class="btn-action read" title="Read"><span>Read</span></button>
          <button class="btn-action edit" title="Edit"><span>Edit</span></button>
          <button class="btn-action delete" title="Delete"><span>Delete</span></button>
        </div>
      `;let s=t.querySelector(".gallery-preview"),r=t.querySelector(".btn-action.copy"),c=t.querySelector(".btn-action.read"),d=t.querySelector(".btn-action.edit"),u=t.querySelector(".btn-action.delete");return r.addEventListener("click",async l=>{l.stopPropagation();try{await navigator.clipboard.writeText(e.content||"");let m=r.querySelector("span");m.textContent="\u2713",r.classList.add("success"),setTimeout(()=>{m.textContent="Copy",r.classList.remove("success")},1500)}catch(m){console.error("Gallery copy failed",m)}}),c.addEventListener("click",l=>{l.stopPropagation(),this.openReadModal(e)}),d.addEventListener("click",l=>{l.stopPropagation(),this.openEditModal(e)}),u.addEventListener("click",async l=>{l.stopPropagation(),confirm("Delete this saved item?")&&(await this.deleteItem(e),t.remove())}),t.addEventListener("click",l=>{l.target.closest(".btn-action")||this.openReadModal(e)}),t},openReadModal(e){let t=document.createElement("div");t.className="gallery-modal",t.innerHTML=`
        <div class="gallery-modal-overlay"></div>
        <div class="gallery-modal-content">
          <div class="gallery-modal-header">
            <div>
              <h3>${this.escapeHtml(e.title||"Post")}</h3>
              <span class="modal-meta">${this.formatDate(e.updatedAt||e.timestamp)} \u2022 ${this.getAccurateCharacterCount(e.content||"")} chars</span>
            </div>
            <button class="modal-close" aria-label="Close">\xD7</button>
          </div>
          <div class="gallery-modal-body">
            <div class="modal-text">${this.escapeHtml(e.content||"").replace(/\n/g,"<br>")}</div>
          </div>
          <div class="gallery-modal-footer">
            <button class="modal-btn copy">Copy</button>
            <button class="modal-btn edit">Edit</button>
          </div>
        </div>
      `,document.body.appendChild(t);let n=()=>t.remove();t.querySelector(".modal-close").addEventListener("click",n),t.querySelector(".gallery-modal-overlay").addEventListener("click",n),t.querySelector(".modal-btn.copy").addEventListener("click",async()=>{await navigator.clipboard.writeText(e.content||"");let o=t.querySelector(".modal-btn.copy");o.textContent="Copied!",setTimeout(()=>o.textContent="Copy",1500)}),t.querySelector(".modal-btn.edit").addEventListener("click",()=>{n(),this.openEditModal(e)});let a=o=>{o.key==="Escape"&&(n(),document.removeEventListener("keydown",a))};document.addEventListener("keydown",a)},openEditModal(e){let t=document.createElement("div");t.className="gallery-modal",t.innerHTML=`
        <div class="gallery-modal-overlay"></div>
        <div class="gallery-modal-content">
          <div class="gallery-modal-header">
            <div>
              <h3>Edit: ${this.escapeHtml(e.title||"Post")}</h3>
              <span class="modal-meta">Editing mode</span>
            </div>
            <button class="modal-close" aria-label="Close">\xD7</button>
          </div>
          <div class="gallery-modal-body">
            <textarea class="modal-textarea" placeholder="Edit your content...">${this.escapeHtml(e.content||"")}</textarea>
          </div>
          <div class="gallery-modal-footer">
            <button class="modal-btn cancel">Cancel</button>
            <button class="modal-btn save primary">Save Changes</button>
          </div>
        </div>
      `,document.body.appendChild(t);let n=t.querySelector(".modal-textarea"),a=()=>t.remove();t.querySelector(".modal-close").addEventListener("click",a),t.querySelector(".gallery-modal-overlay").addEventListener("click",a),t.querySelector(".modal-btn.cancel").addEventListener("click",a),t.querySelector(".modal-btn.save").addEventListener("click",async()=>{let o={content:n.value,updatedAt:Date.now(),charCountAccurate:this.getAccurateCharacterCount(n.value)};await this.updateItem(e,o),a();let i=document.querySelector("#gallery-view");i&&this.render(i)}),n.focus()},async updateItem(e,t){let n=await TabTalkStorage.getSavedContent(),a=e._category||"twitter";if(!Array.isArray(n[a]))return;let o=n[a].findIndex(i=>i.id===e.id);o!==-1&&(n[a][o]={...n[a][o],...t},await TabTalkStorage.setStorageItem("savedContent",n))},async deleteItem(e){let t=e._category||"twitter";await TabTalkStorage.deleteSavedContent(t,e.id)},debounce(e,t){let n;return(...a)=>{clearTimeout(n),n=setTimeout(()=>e.apply(this,a),t)}},getAccurateCharacterCount(e){if(!e)return 0;let t=String(e).trim(),n=0,a=Array.from(t);for(let o of a){let i=o.codePointAt(0),s=i>=126976&&i<=129535||i>=9728&&i<=9983||i>=9984&&i<=10175||i>=128512&&i<=128591||i>=127744&&i<=128511||i>=128640&&i<=128767||i>=127456&&i<=127487||i>=8205;n+=s?2:1}return n},escapeHtml(e){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")},formatDate(e){if(!e)return"";try{return new Date(e).toLocaleString()}catch{return""}}};window.galleryManager=h})();(function(){let h={async validateApiKey(e){if(!e||typeof e!="string"||e.trim().length===0)return{success:!1,error:"API key is required"};let t=e.trim().replace(/\s+/g,"");if(!t.startsWith("AIza"))return{success:!1,error:'Invalid API key format. Gemini API keys should start with "AIza"'};if(t.length<30)return{success:!1,error:"API key appears too short. Please check and try again."};try{return await chrome.runtime.sendMessage({action:"validateApiKey",apiKey:t})}catch(n){return console.error("Validation request failed:",n),{success:!1,error:"Failed to validate API key. Please try again."}}},async handleTestApiKey(e,t){let n=t.value.trim(),a=e.textContent;if(!n){e.textContent="Enter Key",e.style.backgroundColor="#f59e0b",setTimeout(()=>{e.textContent=a,e.style.backgroundColor=""},2e3);return}e.disabled=!0,e.textContent="Testing...";try{let o=await this.validateApiKey(n);o.success?(e.textContent="\u2713 Valid",e.style.backgroundColor="#10b981",setTimeout(()=>{e.textContent=a,e.style.backgroundColor="",e.disabled=!1},2e3)):(e.textContent="\u2717 Invalid",e.style.backgroundColor="#ef4444",console.error(`API Key validation failed: ${o.error}`),setTimeout(()=>{e.textContent=a,e.style.backgroundColor="",e.disabled=!1},3e3))}catch(o){e.textContent="Error",e.style.backgroundColor="#ef4444",console.error("An error occurred while validating the API key:",o),setTimeout(()=>{e.textContent=a,e.style.backgroundColor="",e.disabled=!1},3e3)}},async handleSaveApiKey(e,t,n){let a=t.value.trim();if(!a){e.textContent="Enter Key",e.style.backgroundColor="#f59e0b";let i=e.textContent;setTimeout(()=>{e.textContent="Save",e.style.backgroundColor=""},2e3);return}e.disabled=!0;let o=e.textContent;e.textContent="Validating...";try{let i=await this.validateApiKey(a);i.success?(await this.saveApiKey(a),e.textContent="\u2713 Saved",e.style.backgroundColor="#10b981",n&&n(),setTimeout(()=>{e.textContent=o,e.style.backgroundColor="",e.disabled=!1},2e3)):(e.textContent="\u2717 Failed",e.style.backgroundColor="#ef4444",console.error(`API Key validation failed: ${i.error}`),setTimeout(()=>{e.textContent=o,e.style.backgroundColor="",e.disabled=!1},3e3))}catch(i){e.textContent="Error",e.style.backgroundColor="#ef4444",console.error("An error occurred while saving the API key:",i),setTimeout(()=>{e.textContent=o,e.style.backgroundColor="",e.disabled=!1},3e3)}},async saveApiKey(e){let t=e.trim().replace(/\s+/g,"");window.TabTalkStorage&&window.TabTalkStorage.saveApiKey?await window.TabTalkStorage.saveApiKey(t):await chrome.storage.local.set({geminiApiKey:t,apiKey:t,hasSeenWelcome:!0})}};window.TabTalkValidation=h})();(function(){function h(){let e=document.getElementById("test-api-key"),t=document.getElementById("onboarding-api-key");if(e&&t&&window.TabTalkValidation){let o=e.cloneNode(!0);e.parentNode.replaceChild(o,e),o.addEventListener("click",async function(){await window.TabTalkValidation.handleTestApiKey(o,t);let i=document.getElementById("api-setup-continue");i&&o.textContent==="\u2713 Valid"&&(i.disabled=!1)})}let n=document.getElementById("settings-save-button"),a=document.getElementById("api-key-input");if(n&&a&&window.TabTalkValidation){let o=n.cloneNode(!0);n.parentNode.replaceChild(o,n),o.addEventListener("click",async function(i){i.preventDefault(),i.stopPropagation(),i.stopImmediatePropagation(),await window.TabTalkValidation.handleSaveApiKey(o,a,function(){window.TabTalkNavigation&&window.TabTalkNavigation.showView&&window.TabTalkNavigation.showView("chat")})})}t&&t.addEventListener("input",function(){let o=document.getElementById("api-setup-continue");o&&(o.disabled=!this.value.trim())})}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",h):h(),setTimeout(h,100)})();(function(){let h={toneDefinitions:{supportive:{id:"supportive",name:"Supportive with Facts",icon:"\u{1F91D}",color:"var(--accent-color)",category:"positive",description:"Highlight strengths, build confidence",example:"This is brilliant because...",aiInstructions:`TONE: Supportive with Facts
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
              <h2 id="tone-modal-title">Select Content Tone</h2>
              <button class="tone-modal-close" aria-label="Close">&times;</button>
            </div>

            <!-- AI Recommendations Section -->
            <div id="tone-recommendations" class="tone-recommendations hidden">
              <div class="recommendations-header">
                <span class="recommendations-title">\u2728 AI Suggested Tones</span>
              </div>
              <div id="recommended-tones" class="recommended-tones-list"></div>
            </div>

            <!-- Tone Grid -->
            <div class="modal-section">
              <label class="section-label">Choose Your Tone</label>
              <div class="tone-grid" role="radiogroup" aria-label="Select content tone">
                ${this.renderToneGrid()}
              </div>
            </div>

            <!-- Custom Tone Builder Toggle -->
            <div class="custom-tone-section">
              <button id="toggle-custom-builder" class="custom-builder-toggle">
                <span class="toggle-text">\u{1F3A8} Custom Tone Mix (optional)</span>
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
                Generate Content
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
      `).join("")},renderToneOptions:function(){return Object.values(this.toneDefinitions).map(e=>`<option value="${e.id}">${e.icon} ${e.name}</option>`).join("")},bindModalEvents:function(){let e=document.getElementById("tone-selector-modal");if(!e)return;e.querySelector(".tone-modal-close")?.addEventListener("click",()=>this.hideModal()),e.querySelector(".tone-modal-overlay")?.addEventListener("click",()=>this.hideModal()),document.getElementById("tone-cancel-btn")?.addEventListener("click",()=>this.hideModal()),e.querySelectorAll(".tone-option").forEach(l=>{l.addEventListener("click",()=>this.selectTone(l)),l.addEventListener("keydown",m=>{(m.key==="Enter"||m.key===" ")&&(m.preventDefault(),this.selectTone(l))})}),document.getElementById("tone-generate-btn")?.addEventListener("click",()=>this.handleGenerate()),document.getElementById("toggle-custom-builder")?.addEventListener("click",()=>this.toggleCustomBuilder());let r=document.getElementById("custom-tone-1"),c=document.getElementById("custom-tone-2");r?.addEventListener("change",()=>this.updateCustomPreview()),c?.addEventListener("change",()=>this.updateCustomPreview()),document.getElementById("save-custom-tone")?.addEventListener("click",()=>this.saveCustomCombination()),document.getElementById("use-custom-tone")?.addEventListener("click",()=>this.useCustomCombination()),e.addEventListener("keydown",l=>{l.key==="Escape"&&this.hideModal()})},showModal:async function(e,t){let n=document.getElementById("tone-selector-modal");if(!n)return;this.currentPlatform=e,this.currentPageContent=t,n.classList.remove("hidden"),n.setAttribute("aria-hidden","false"),n.querySelector(".tone-option")?.focus(),await this.generateRecommendations(t),this.renderSavedCustomTones()},hideModal:function(){let e=document.getElementById("tone-selector-modal");e&&(e.classList.add("hidden"),e.setAttribute("aria-hidden","true"),this.resetSelections())},selectTone:function(e){document.querySelectorAll(".tone-option").forEach(a=>{a.classList.remove("selected"),a.setAttribute("aria-checked","false")}),e.classList.add("selected"),e.setAttribute("aria-checked","true"),this.selectedToneId=e.dataset.toneId,this.selectedTone=this.toneDefinitions[this.selectedToneId];let n=document.getElementById("tone-generate-btn");n&&(n.disabled=!1),this.sessionCache.lastSelectedTone=this.selectedToneId},generateRecommendations:async function(e){let t=document.getElementById("tone-recommendations"),n=document.getElementById("recommended-tones");if(!(!t||!n))try{t.classList.remove("hidden"),n.innerHTML='<div class="recommendations-loading">Analyzing content...</div>';let a=await this.analyzeContentForTones(e);a.length>0?(n.innerHTML=a.map(i=>`
            <div class="recommended-tone" data-tone-id="${i.toneId}">
              <div class="rec-badge">Recommended</div>
              <div class="rec-tone-icon" style="color: ${i.color}">${i.icon}</div>
              <div class="rec-tone-info">
                <div class="rec-tone-name">${i.name}</div>
                <div class="rec-reason">${i.reason}</div>
                <div class="rec-confidence">Match: ${i.confidence}%</div>
              </div>
            </div>
          `).join(""),n.querySelectorAll(".recommended-tone").forEach(i=>{i.addEventListener("click",()=>{let s=i.dataset.toneId,r=document.querySelector(`.tone-option[data-tone-id="${s}"]`);r&&(this.selectTone(r),r.scrollIntoView({behavior:"smooth",block:"center"}))})})):n.innerHTML='<div class="no-recommendations">All tones work well for this content!</div>'}catch(a){console.error("Error generating recommendations:",a),n.innerHTML='<div class="recommendations-error">Could not analyze content</div>'}},analyzeContentForTones:async function(e){let t=e.toLowerCase(),n=[],a=/controversy|debate|disagree|conflict|dispute/i.test(e),o=/data|statistics|study|research|evidence|percent|number/i.test(e),i=/claim|assert|state|argue|maintain/i.test(e),s=/success|achievement|breakthrough|innovation|progress/i.test(e),r=/problem|issue|concern|risk|danger|failure/i.test(e),c=/funny|joke|ironic|amusing|hilarious/i.test(e),d=/future|upcoming|next|will|plan|forecast/i.test(e),u=/warning|caution|beware|careful|risk/i.test(e),l=e.length,m=e.split(/\s+/).length;return a&&o&&n.push({toneId:"critical",...this.toneDefinitions.critical,reason:"Content contains controversial claims with data - perfect for evidence-based critique",confidence:92}),i&&!o&&n.push({toneId:"anti-propaganda",...this.toneDefinitions["anti-propaganda"],reason:"Multiple claims detected without strong evidence - ideal for fact-checking",confidence:88}),s&&o&&n.push({toneId:"supportive",...this.toneDefinitions.supportive,reason:"Positive developments backed by data - great for supportive commentary",confidence:90}),a&&c&&n.push({toneId:"trolling",...this.toneDefinitions.trolling,reason:"Controversial topic with humorous elements - perfect for playful fact-based trolling",confidence:85}),r&&!a&&n.push({toneId:"critical-humor",...this.toneDefinitions["critical-humor"],reason:"Issues present without heated debate - ideal for witty critique",confidence:83}),d&&s&&n.push({toneId:"optimistic",...this.toneDefinitions.optimistic,reason:"Forward-looking content with positive outlook - great for optimistic framing",confidence:87}),(u||r&&o)&&n.push({toneId:"cautionary",...this.toneDefinitions.cautionary,reason:"Risks or concerns identified - suitable for cautionary perspective",confidence:84}),o&&l>2e3&&n.push({toneId:"investigative",...this.toneDefinitions.investigative,reason:"Substantial content with data - perfect for deep investigative analysis",confidence:86}),s&&m<500&&n.push({toneId:"empowering",...this.toneDefinitions.empowering,reason:"Concise positive content - ideal for empowering call-to-action",confidence:81}),n.sort((p,y)=>y.confidence-p.confidence).slice(0,3)},toggleCustomBuilder:function(){let e=document.getElementById("custom-tone-builder"),t=document.getElementById("toggle-custom-builder"),n=t?.querySelector(".toggle-arrow");if(e&&t){let a=e.classList.contains("hidden");e.classList.toggle("hidden"),n&&(n.textContent=a?"\u25B2":"\u25BC")}},updateCustomPreview:function(){let e=document.getElementById("custom-tone-1"),t=document.getElementById("custom-tone-2"),n=document.getElementById("custom-tone-preview"),a=document.querySelector(".builder-preview"),o=document.getElementById("save-custom-tone"),i=document.getElementById("use-custom-tone");if(!e||!t||!n)return;let s=e.value,r=t.value;if(s&&r&&s!==r){let c=this.toneDefinitions[s],d=this.toneDefinitions[r];n.innerHTML=`
          <div class="preview-tones">
            <span class="preview-tone" style="color: ${c.color}">
              ${c.icon} ${c.name}
            </span>
            <span class="preview-plus">+</span>
            <span class="preview-tone" style="color: ${d.color}">
              ${d.icon} ${d.name}
            </span>
          </div>
          <div class="preview-description">
            ${this.generateCombinedDescription(c,d)}
          </div>
        `,a?.classList.remove("hidden"),o&&(o.disabled=!1),i&&(i.disabled=!1)}else a?.classList.add("hidden"),o&&(o.disabled=!0),i&&(i.disabled=!0)},generateCombinedDescription:function(e,t){return`Combines ${e.name.toLowerCase()} with ${t.name.toLowerCase()} for a unique perspective that ${e.description.toLowerCase()} while ${t.description.toLowerCase()}.`},saveCustomCombination:async function(){let e=document.getElementById("custom-tone-1"),t=document.getElementById("custom-tone-2");if(!e||!t)return;let n=e.value,a=t.value;if(!n||!a||n===a)return;let o={id:`custom-${Date.now()}`,tone1Id:n,tone2Id:a,name:`${this.toneDefinitions[n].name} + ${this.toneDefinitions[a].name}`,createdAt:Date.now()};this.customTones.push(o),await this.saveCustomTones(),this.renderSavedCustomTones(),this.showToast("\u2713 Custom tone saved!")},useCustomCombination:function(){let e=document.getElementById("custom-tone-1"),t=document.getElementById("custom-tone-2");if(!e||!t)return;let n=e.value,a=t.value;if(!n||!a||n===a)return;this.selectedToneId="custom",this.selectedTone={id:"custom",name:`${this.toneDefinitions[n].name} + ${this.toneDefinitions[a].name}`,tone1:this.toneDefinitions[n],tone2:this.toneDefinitions[a],aiInstructions:this.combineAIInstructions(this.toneDefinitions[n],this.toneDefinitions[a])};let o=document.getElementById("tone-generate-btn");o&&(o.disabled=!1),this.showToast("\u2713 Custom tone selected!")},combineAIInstructions:function(e,t){return`COMBINED TONE: ${e.name} + ${t.name}

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
          ${this.customTones.map(a=>{let o=this.toneDefinitions[a.tone1Id],i=this.toneDefinitions[a.tone2Id];return`
              <div class="saved-custom-tone" data-custom-id="${a.id}">
                <div class="saved-tone-icons">
                  <span style="color: ${o.color}">${o.icon}</span>
                  <span class="saved-plus">+</span>
                  <span style="color: ${i.color}">${i.icon}</span>
                </div>
                <div class="saved-tone-name">${a.name}</div>
                <button class="saved-tone-delete" data-custom-id="${a.id}" title="Delete">\xD7</button>
              </div>
            `}).join("")}
        </div>
      `,e.querySelectorAll(".saved-custom-tone").forEach(a=>{a.addEventListener("click",o=>{o.target.classList.contains("saved-tone-delete")||this.selectSavedCustomTone(a.dataset.customId)})}),e.querySelectorAll(".saved-tone-delete").forEach(a=>{a.addEventListener("click",o=>{o.stopPropagation(),this.deleteCustomTone(a.dataset.customId)})})},selectSavedCustomTone:function(e){let t=this.customTones.find(i=>i.id===e);if(!t)return;let n=this.toneDefinitions[t.tone1Id],a=this.toneDefinitions[t.tone2Id];this.selectedToneId="custom",this.selectedTone={id:"custom",name:t.name,tone1:n,tone2:a,aiInstructions:this.combineAIInstructions(n,a)};let o=document.getElementById("tone-generate-btn");o&&(o.disabled=!1),this.showToast("\u2713 Custom tone selected!")},deleteCustomTone:async function(e){this.customTones=this.customTones.filter(t=>t.id!==e),await this.saveCustomTones(),this.renderSavedCustomTones(),this.showToast("Custom tone deleted")},handleGenerate:function(){this.selectedTone&&(this.onGenerateCallback&&this.onGenerateCallback(this.selectedTone,this.currentPlatform),this.hideModal())},resetSelections:function(){document.querySelectorAll(".tone-option").forEach(n=>{n.classList.remove("selected"),n.setAttribute("aria-checked","false")}),this.selectedToneId=null,this.selectedTone=null;let t=document.getElementById("tone-generate-btn");t&&(t.disabled=!0)},showToast:function(e){let t=document.createElement("div");t.className="tone-toast",t.textContent=e,t.style.cssText=`
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
      `,document.body.appendChild(t),setTimeout(()=>{t.style.animation="slideOutDown 0.3s ease",setTimeout(()=>t.remove(),300)},2e3)},show:function(e,t,n){this.onGenerateCallback=n,this.showModal(e,t)}};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>h.init()):h.init(),window.TabTalkToneSelector=h})();(function(){let h={currentView:"chat",init(){this.bindEvents(),this.updateActiveState("chat")},bindEvents(){document.querySelectorAll(".nav-item").forEach(t=>{t.addEventListener("click",n=>{n.preventDefault();let a=t.getAttribute("data-view");this.navigateToView(a)})})},navigateToView(e){window.TabTalkNavigation&&window.TabTalkNavigation.showView&&window.TabTalkNavigation.showView(e),this.updateActiveState(e),this.currentView=e},updateActiveState(e){document.querySelectorAll(".nav-item").forEach(n=>{n.getAttribute("data-view")===e?n.classList.add("active"):n.classList.remove("active")})},toggleVisibility(e){let t=document.getElementById("bottom-nav");t&&(t.style.display=e?"flex":"none")},setActive(e){this.updateActiveState(e),this.currentView=e}};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>h.init()):h.init(),window.BottomNav=h})();(function(){let h={selectedPersona:"educator",selectedFormat:"myth-busting",currentTopic:"",selectedHook:"",generatedThread:null,personas:{educator:{name:"Educator",emoji:"\u{1F393}",instructions:"Write as a patient teacher who breaks down complex topics into simple, digestible lessons. Use clear examples and encouraging language. Focus on helping the reader understand and grow. Include educational moments and learning takeaways.",hookDensity:"medium",sentenceLength:"medium",verbStyle:"explanatory",ctaStyle:"learning-focused"},operator:{name:"Operator",emoji:"\u2699\uFE0F",instructions:"Write as a practical builder who focuses on execution and results. Use direct, no-nonsense language. Emphasize systems, processes, and measurable outcomes. Include actionable steps and implementation details.",hookDensity:"low",sentenceLength:"short",verbStyle:"action-oriented",ctaStyle:"implementation-focused"},analyst:{name:"Analyst",emoji:"\u{1F4CA}",instructions:"Write as a data-driven expert who backs claims with evidence and logical reasoning. Use precise language and structured arguments. Include statistics, trends, and analytical insights. Maintain objectivity and credibility.",hookDensity:"medium",sentenceLength:"long",verbStyle:"analytical",ctaStyle:"insight-focused"},entertainer:{name:"Entertainer",emoji:"\u{1F3AD}",instructions:"Write as an engaging storyteller who captivates with humor, drama, and personality. Use vivid language, emotional appeal, and entertaining anecdotes. Include surprising twists and memorable moments.",hookDensity:"high",sentenceLength:"varied",verbStyle:"expressive",ctaStyle:"engagement-focused"},visionary:{name:"Visionary",emoji:"\u{1F52E}",instructions:"Write as a forward-thinking leader who paints pictures of what is possible. Use inspiring, future-focused language. Emphasize transformation, innovation, and paradigm shifts. Include bold predictions and visionary insights.",hookDensity:"high",sentenceLength:"long",verbStyle:"transformational",ctaStyle:"future-focused"},storyteller:{name:"Storyteller",emoji:"\u{1F4DA}",instructions:"Write as a master storyteller who weaves narratives that teach and inspire. Use classic story structures, character development, and narrative arcs. Include personal anecdotes, metaphors, and story-driven examples.",hookDensity:"medium",sentenceLength:"varied",verbStyle:"narrative",ctaStyle:"story-focused"},scientist:{name:"Scientist",emoji:"\u{1F52C}",instructions:"Write as a rigorous researcher who explores topics through scientific inquiry. Use precise, evidence-based language. Emphasize hypotheses, experiments, and data-driven conclusions. Include scientific method and logical reasoning.",hookDensity:"low",sentenceLength:"complex",verbStyle:"investigative",ctaStyle:"research-focused"},philosopher:{name:"Philosopher",emoji:"\u{1F914}",instructions:"Write as a deep thinker who explores fundamental questions and meanings. Use thoughtful, reflective language. Emphasize principles, ethics, and deeper truths. Include philosophical frameworks and wisdom insights.",hookDensity:"low",sentenceLength:"complex",verbStyle:"reflective",ctaStyle:"wisdom-focused"}},formats:{"myth-busting":{name:"Myth\u2011busting",emoji:"\u{1F9F1}",skeleton:"Hook (challenge common belief) \u2192 Why it is wrong \u2192 Evidence (3 bullet points) \u2192 What to do instead (steps) \u2192 CTA"},"status-shift":{name:"Status Shift",emoji:"\u26A1",skeleton:"Hook (unexpected realization) \u2192 Before vs After snapshot \u2192 Process (3-5 steps) \u2192 Proof \u2192 CTA"},"cheat-code":{name:"Cheat Code",emoji:"\u{1F3AE}",skeleton:"Hook (fast result promise) \u2192 Steps (ordered) \u2192 Common pitfalls \u2192 Bonus tip \u2192 CTA"},analogy:{name:"Analogy",emoji:"\u{1F517}",skeleton:"Hook (analogy) \u2192 Map analogy \u2192 Apply to topic \u2192 Example \u2192 CTA"},pain:{name:"Pain Point",emoji:"\u{1F4A1}",skeleton:"Hook (identify pain) \u2192 Amplify why it matters \u2192 Root cause \u2192 Solution steps \u2192 Transformation \u2192 CTA"},story:{name:"Story",emoji:"\u{1F4D6}",skeleton:"Hook (story opening) \u2192 Challenge faced \u2192 Journey/process \u2192 Resolution/lesson \u2192 Application for reader \u2192 CTA"},data:{name:"Data Driven",emoji:"\u{1F4CA}",skeleton:"Hook (surprising stat) \u2192 Context behind the data \u2192 Implications \u2192 What it means for reader \u2192 Action steps \u2192 CTA"},framework:{name:"Framework",emoji:"\u{1F3D7}\uFE0F",skeleton:"Hook (mental model) \u2192 Explain framework components \u2192 How to apply \u2192 Examples \u2192 Benefits \u2192 CTA"},future:{name:"Future Focus",emoji:"\u{1F52E}",skeleton:"Hook (future prediction) \u2192 Current trends \u2192 Timeline \u2192 What to prepare \u2192 First steps \u2192 CTA"},practical:{name:"Practical",emoji:"\u2699\uFE0F",skeleton:"Hook (practical problem) \u2192 Quick solution \u2192 Step-by-step guide \u2192 Pro tips \u2192 Results \u2192 CTA"},controversial:{name:"Controversial",emoji:"\u{1F525}",skeleton:"Hook (controversial take) \u2192 Why people disagree \u2192 Your evidence \u2192 Counterarguments \u2192 Strong conclusion \u2192 CTA"},inspirational:{name:"Inspirational",emoji:"\u2728",skeleton:"Hook (uplifting vision) \u2192 Current reality \u2192 Possibility \u2192 Motivational examples \u2192 Call to greatness \u2192 CTA"},"step-by-step":{name:"Step\u2011by\u2011Step",emoji:"\u{1F4DD}",skeleton:"Hook (process promise) \u2192 Why this process \u2192 Step 1 \u2192 Step 2 \u2192 Step 3 \u2192 Common mistakes \u2192 Success tips \u2192 CTA"},comparison:{name:"Comparison",emoji:"\u2696\uFE0F",skeleton:"Hook (comparison setup) \u2192 Option A analysis \u2192 Option B analysis \u2192 Decision criteria \u2192 Recommendation \u2192 CTA"},"case-study":{name:"Case Study",emoji:"\u{1F4CB}",skeleton:"Hook (intriguing result) \u2192 Background \u2192 Challenge \u2192 Solution \u2192 Measurable results \u2192 Lessons \u2192 CTA"},trend:{name:"Trend Alert",emoji:"\u{1F4C8}",skeleton:"Hook (trend observation) \u2192 Evidence it is growing \u2192 Why it matters \u2192 How to leverage \u2192 Timeline \u2192 CTA"},"myth-busting-plus":{name:"Myth+",emoji:"\u{1F9F1}",skeleton:"Hook (bold myth claim) \u2192 Multiple myths busted \u2192 Deeper truth revealed \u2192 System-level change \u2192 New paradigm \u2192 CTA"},"quick-win":{name:"Quick Win",emoji:"\u{1F3C6}",skeleton:"Hook (immediate result) \u2192 Simple action \u2192 Quick proof \u2192 Scaling tip \u2192 Long-term benefit \u2192 CTA"},"deep-dive":{name:"Deep Dive",emoji:"\u{1F93F}",skeleton:"Hook (complex question) \u2192 Surface-level answer \u2192 Deeper layers \u2192 Expert insight \u2192 Nuanced conclusion \u2192 CTA"},checklist:{name:"Checklist",emoji:"\u2705",skeleton:"Hook (checklist promise) \u2192 Overview \u2192 Item 1 with details \u2192 Item 2 \u2192 Item 3 \u2192 Implementation tips \u2192 CTA"}},hookPatterns:[{type:"AIDA Attention",template:"What if I told you that [topic] could change everything?"},{type:"AIDA Interest",template:"The hidden truth about [topic] that nobody is talking about."},{type:"AIDA Desire",template:"Imagine mastering [topic] in half the time it takes everyone else."},{type:"AIDA Action",template:"Here is exactly how you can start with [topic] right now."},{type:"PAS Problem",template:"[Topic] is failing for 90% of people. Here is why."},{type:"PAS Agitate",template:"Every time you struggle with [topic], you are making this one mistake."},{type:"PAS Solution",template:"I finally cracked the code for [topic]. This changes everything."},{type:"Status Shift",template:"Everything you know about [topic] is about to become obsolete."},{type:"Status Shift",template:"The old rules of [topic] no longer apply. Here are the new ones."},{type:"Status Shift",template:"Why experts are wrong about [topic] and what actually works."}],init(){this.bindEvents(),this.loadStoredPreferences()},bindEvents(){let e=document.getElementById("generate-thread-btn");e&&e.addEventListener("click",()=>this.generateThread()),document.addEventListener("click",i=>{i.target.closest(".persona-chip")&&this.selectPersona(i.target.closest(".persona-chip").dataset.persona),i.target.closest(".format-chip")&&this.selectFormat(i.target.closest(".format-chip").dataset.format),i.target.closest(".hook-item")&&this.selectHook(i.target.closest(".hook-item").dataset.hook)});let t=document.getElementById("generate-hooks-btn"),n=document.getElementById("generate-hooks-btn-modal");t&&t.addEventListener("click",()=>this.generateHooks()),n&&n.addEventListener("click",()=>this.generateHooks("modal"));let a=document.getElementById("trend-fusion-btn"),o=document.getElementById("trend-fusion-btn-modal");a&&a.addEventListener("click",()=>this.generateTrendFusion()),o&&o.addEventListener("click",()=>this.generateTrendFusion("modal"))},showEnhancedModal(){},hideModal(){},selectPersona(e){this.selectedPersona=e,document.querySelectorAll(".persona-chip").forEach(t=>{t.classList.toggle("active",t.dataset.persona===e)}),this.savePreferences()},selectFormat(e){this.selectedFormat=e,document.querySelectorAll(".format-chip").forEach(t=>{t.classList.toggle("active",t.dataset.format===e)}),this.savePreferences()},selectHook(e){this.selectedHook=e,document.querySelectorAll(".hook-item").forEach(t=>{t.classList.toggle("selected",t.dataset.hook===e)})},async generateHooks(e="view"){let t=e==="modal"?"thread-topic-modal":"thread-topic",n=document.getElementById(t);if(this.currentTopic=n?n.value.trim():"",!this.currentTopic){this.showToast("Enter a topic first",2e3);return}let a=e==="modal"?"generate-hooks-btn-modal":"generate-hooks-btn",o=document.getElementById(a),i=o.textContent;o.textContent="\u23F3 Generating...",o.disabled=!0;try{let s=await this.callGeminiAPI(this.buildHooksPrompt());this.displayHooks(s,e)}catch(s){console.error("Hook generation failed:",s),this.showToast("Failed to generate hooks",3e3)}finally{o.textContent=i,o.disabled=!1}},async generateTrendFusion(e="view"){let t=e==="modal"?"thread-topic-modal":"thread-topic",n=document.getElementById(t);if(this.currentTopic=n?n.value.trim():"",!this.currentTopic){this.showToast("Enter a topic first",2e3);return}let a=e==="modal"?"trend-fusion-btn-modal":"trend-fusion-btn",o=document.getElementById(a),i=o.textContent;o.textContent="\u23F3 Generating...",o.disabled=!0;try{let s=await this.callGeminiAPI(this.buildTrendFusionPrompt());this.displayTrendFusion(s,e)}catch(s){console.error("Trend fusion failed:",s),this.showToast("Failed to generate trend fusion",3e3)}finally{o.textContent=i,o.disabled=!1}},async generateThread(){let e=document.getElementById("thread-topic");if(this.currentTopic=e.value.trim(),!this.currentTopic){this.showToast("Enter a topic first",2e3);return}let t=document.getElementById("generate-thread-btn"),n=t.textContent;t.textContent="\u23F3 Generating...",t.disabled=!0;try{let a=await this.callGeminiAPI(this.buildThreadPrompt());this.generatedThread=a,this.displayThreadResult(a),this.saveToGallery(a,this.currentTopic,this.selectedFormat)}catch(a){console.error("Thread generation failed:",a),this.showToast("Failed to generate thread",3e3)}finally{t.textContent=n,t.disabled=!1}},buildHooksPrompt(){let e=this.personas[this.selectedPersona];return`Generate 10 powerful hooks for "${this.currentTopic}" using these frameworks:

${this.hookPatterns.map((t,n)=>`${n+1}. ${t.type}: ${t.template.replace("[topic]",this.currentTopic)}`).join(`
`)}

INSTRUCTIONS:
- Use the ${e.name} persona: ${e.instructions}
- Make each hook compelling and unique
- Keep hooks under 280 characters
- No hashtags or URLs
- Return as a numbered list`},buildTrendFusionPrompt(){let e=this.personas[this.selectedPersona];return`Create an evergreen + trend fusion hook for "${this.currentTopic}".

STRUCTURE: "Why [trend] matters for [evergreen topic] over next 6 months"

REQUIREMENTS:
- Use the ${e.name} persona: ${e.instructions}
- Connect a current trend to the evergreen topic
- Make it urgent and relevant
- Under 280 characters
- No hashtags or URLs

Example: "Why AI automation matters for content creators over next 6 months"

Generate 3 options, pick the best one.`},buildThreadPrompt(){let e=this.personas[this.selectedPersona],t=this.formats[this.selectedFormat],n=`Create a Twitter thread about "${this.currentTopic}" using the ${t.name} framework.

PERSONA: ${e.name}
${e.instructions}

FORMAT STRUCTURE: ${t.skeleton}

THREAD REQUIREMENTS:
- 8-15 tweets max
- Start each tweet with: 1/n:, 2/n:, etc.
- Use natural emojis (2-4 per thread)
- No hashtags, no URLs, no source mentions
- Write as ${e.name}: adjust sentence length, hooks, and CTAs accordingly

TOPIC: ${this.currentTopic}`;return this.selectedHook&&(n+=`

STARTING HOOK: Begin the first tweet with exactly: "${this.selectedHook}"`),n+=`

Generate the complete thread now:`,n},displayHooks(e,t="view"){let n=t==="modal"?"hooks-container-modal":"hooks-container",a=document.getElementById(n);if(!a)return;let o=this.parseHookList(e);a.innerHTML=o.map((i,s)=>`
        <div class="hook-item" data-hook="${i.text}">
          <div class="hook-text">${i.text}</div>
          <div class="hook-type">${i.type}</div>
        </div>
      `).join(""),a.classList.remove("hidden")},displayTrendFusion(e,t="view"){let n=t==="modal"?"trend-result-modal":"trend-result",a=document.getElementById(n);if(!a)return;let i=e.split(`
`).find(s=>s.includes("Why")&&s.includes("matters")&&s.includes("over next 6 months"))||e.trim();a.textContent=i,a.classList.remove("hidden")},parseHookList(e){let t=e.split(`
`),n=[];for(let a=0;a<t.length;a++){let i=t[a].trim().match(/^\d+\.\s*(.+)$/);if(i){let s=this.hookPatterns[Math.min(a,this.hookPatterns.length-1)].type;n.push({text:i[1],type:s})}}return n.length===0?this.hookPatterns.slice(0,10).map(a=>({text:a.template.replace("[topic]",this.currentTopic),type:a.type})):n.slice(0,10)},displayThreadResult(e){window.TabTalkUI&&window.TabTalkUI.showView("chat");let t={type:"thread",content:e,title:this.currentTopic,timestamp:new Date().toISOString(),tags:[this.selectedFormat,this.selectedPersona]},n=document.getElementById("messages-container");if(n&&window.TabTalkUI&&window.TabTalkUI.renderCard){let a=window.TabTalkUI.renderCard(t);n.appendChild(a)}},async callGeminiAPI(e){if(!window.TabTalkAPI?.callGeminiAPI)throw new Error("API not available");return await window.TabTalkAPI.callGeminiAPI(e)},saveToGallery(e,t,n){if(!window.TabTalkGallery)return;let a={id:Date.now().toString(),title:t,content:e,timestamp:new Date().toISOString(),tags:[n,this.selectedPersona],platform:"thread"};window.TabTalkGallery.saveContent(a)},loadStoredPreferences(){chrome.storage.local.get(["enhancedPersona","enhancedFormat"],e=>{e.enhancedPersona&&this.selectPersona(e.enhancedPersona),e.enhancedFormat&&this.selectFormat(e.enhancedFormat)})},savePreferences(){chrome.storage.local.set({enhancedPersona:this.selectedPersona,enhancedFormat:this.selectedFormat})},showToast(e,t=3e3){window.TabTalkUI?.showToast?window.TabTalkUI.showToast(e,t):console.log("Toast:",e)}};window.TabTalkEnhancedQuickActions=h,document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>h.init()):h.init()})();(()=>{var h=class{constructor(){this.apiKey=null,this.currentTab=null,this.pageContent=null,this.isLoading=!1,this.currentDomain=null,this.messagesContainer=document.getElementById("messages-container"),this.pageStatus=document.getElementById("page-status"),this.pageTitle=document.getElementById("page-title"),this.quickActions=document.getElementById("quick-actions"),this.sidebar=document.getElementById("sidebar"),this.quickTwitterBtn=document.getElementById("quick-twitter"),this.quickTwitterThreadBtn=document.getElementById("quick-twitter-thread"),this.quickCreateBtn=document.getElementById("quick-create"),this.welcomeView=document.getElementById("welcome-view"),this.apiSetupView=document.getElementById("api-setup-view"),this.chatView=document.getElementById("chat-view"),this.settingsView=document.getElementById("settings-view"),this.menuButton=document.getElementById("menu-button"),this.apiKeyInput=document.getElementById("api-key-input")||document.getElementById("settings-api-key"),this.inputActions=document.querySelector(".input-actions"),this.exportFormatSelect=document.getElementById("export-format-select"),this.statusText=document.getElementById("status-text"),this.views={welcome:this.welcomeView,"api-setup":this.apiSetupView,chat:this.chatView,settings:this.settingsView}}async init(){try{console.log("TabTalk AI: Initializing popup");let t=await chrome.tabs.query({active:!0,currentWindow:!0});!t||t.length===0?(console.error("TabTalk AI: Failed to get current tab"),this.pageStatus&&(this.pageStatus.textContent="\u274C Failed to access current tab")):(this.currentTab=t[0],console.log("TabTalk AI: Current tab:",this.currentTab.url)),await this.loadState();try{let a=await this.getStorageItem?await this.getStorageItem("theme"):null;a||(a="dark"),document.documentElement.setAttribute("data-theme",a)}catch{}if(this.migrateThreadsToGallery)try{await this.migrateThreadsToGallery()}catch(a){console.warn("Thread migration skipped",a)}this.bindEvents();let n=await this.getStorageItem("hasSeenWelcome");this.apiKey?(this.showView("chat"),await this.getAndCachePageContent()):n?this.showView("api-setup"):this.showView("welcome"),console.log("TabTalk AI: Popup initialized")}catch(t){console.error("TabTalk AI: Initialization error:",t),this.pageStatus&&(this.pageStatus.textContent=`\u274C Initialization failed: ${t.message}`),this.showView&&this.showView("welcome")}}bindEvents(){let t=document.getElementById("settings-cancel-button"),n=document.getElementById("settings-save-button");t&&t.addEventListener("click",()=>{this.updateViewState(this.apiKey?"chat":"settings")}),n&&n.addEventListener("click",()=>this.handleSaveSettings());let a=document.getElementById("delete-api-key-button");a&&a.addEventListener("click",()=>this.handleDeleteApiKey()),console.log("Menu Button:",this.menuButton),console.log("Sidebar:",this.sidebar),this.menuButton&&this.sidebar&&(this.menuButton.addEventListener("click",g=>{g.stopPropagation(),console.log("Menu button clicked!");let w=this.sidebar.classList.contains("hidden");w?(this.sidebar.classList.remove("hidden"),this.sidebar.style.display="block"):(this.sidebar.classList.add("hidden"),this.sidebar.style.display="none"),console.log("Sidebar is now:",w?"visible":"hidden"),this.sidebar.setAttribute("aria-expanded",w?"false":"true")}),document.addEventListener("click",g=>{this.sidebar.classList.contains("hidden")||!this.sidebar.contains(g.target)&&g.target!==this.menuButton&&(this.sidebar.classList.add("hidden"),this.sidebar.setAttribute("aria-expanded","false"))}),this.sidebar.addEventListener("keydown",g=>{g.key==="Escape"&&(this.sidebar.classList.add("hidden"),this.sidebar.setAttribute("aria-expanded","false"),this.menuButton.focus())}));let o=document.getElementById("menu-settings-link");o&&o.addEventListener("click",g=>{g.preventDefault(),this.updateViewState("settings"),this.sidebar&&this.sidebar.classList.add("hidden")});let i=document.getElementById("theme-toggle");i&&i.addEventListener("click",async()=>{let w=(document.documentElement.getAttribute("data-theme")||"light")==="dark"?"light":"dark";if(document.documentElement.setAttribute("data-theme",w),this.setStorageItem)try{await this.setStorageItem("theme",w)}catch{}});let s=document.getElementById("menu-gallery-link");s&&s.addEventListener("click",g=>{g.preventDefault(),this.showView("gallery")});let r=document.getElementById("welcome-get-started");r&&r.addEventListener("click",async()=>{await this.setStorageItem("hasSeenWelcome",!0),this.showView("api-setup")});let c=document.getElementById("welcome-start");c&&c.addEventListener("click",async()=>{await this.setStorageItem("hasSeenWelcome",!0),this.showView("api-setup")});let d=document.getElementById("api-setup-back");d&&d.addEventListener("click",()=>{this.showView("welcome")});let u=document.getElementById("api-setup-back-arrow");u&&u.addEventListener("click",()=>{this.showView("welcome")});let l=document.getElementById("api-setup-continue");l&&l.addEventListener("click",async()=>{let g=document.getElementById("onboarding-api-key").value.trim();g&&(await this.saveApiKey(g),this.showView("chat"),await this.getAndCachePageContent())});let m=document.getElementById("test-api-key");m&&m.addEventListener("click",async()=>{let g=document.getElementById("onboarding-api-key").value.trim();if(g){let w=await this.testApiKey(g),v=document.getElementById("api-setup-continue");w?(m.textContent="\u2713 Valid",m.style.background="#10b981",m.style.color="white",v.disabled=!1):(m.textContent="\u2717 Invalid",m.style.background="#ef4444",m.style.color="white",v.disabled=!0),setTimeout(()=>{m.textContent="Test",m.style.background="",m.style.color=""},2e3)}});let p=document.getElementById("onboarding-api-key");p&&p.addEventListener("input",()=>{let g=document.getElementById("api-setup-continue");g.disabled=!p.value.trim()}),this.menuButton&&this.menuButton.setAttribute("aria-label","Open menu"),this.apiKeyInput&&this.apiKeyInput.setAttribute("aria-label","Gemini API Key"),console.log("Button elements found:",{quickTwitterBtn:!!this.quickTwitterBtn,quickTwitterThreadBtn:!!this.quickTwitterThreadBtn,quickCreateBtn:!!this.quickCreateBtn}),this.quickTwitterBtn&&this.quickTwitterBtn.addEventListener("click",async()=>{this.resetScreenForGeneration&&this.resetScreenForGeneration(),await this.generateSocialContent("twitter")}),this.quickTwitterThreadBtn&&this.quickTwitterThreadBtn.addEventListener("click",async()=>{console.log("Thread button clicked - showing tone selector for thread generation"),this.resetScreenForGeneration&&this.resetScreenForGeneration(),await this.generateSocialContent("thread")}),this.quickCreateBtn&&this.quickCreateBtn.addEventListener("click",()=>{window.TabTalkThreadGenerator&&window.TabTalkThreadGenerator.showModal?window.TabTalkThreadGenerator.showModal(this):this.showView("thread-generator")});let y=document.getElementById("generate-thread-btn");y&&y.addEventListener("click",async()=>{this.handleThreadGeneratorSubmit&&await this.handleThreadGeneratorSubmit()}),this.initializeHorizontalScroll(),window.TabTalkThreadGenerator&&window.TabTalkThreadGenerator.init&&(console.log("TabTalk AI: Initializing Thread Generator modal..."),window.TabTalkThreadGenerator.init())}async testApiKey(t){try{let n=await chrome.runtime.sendMessage({action:"testApiKey",apiKey:t});return n&&n.success}catch(n){return console.error("Error testing API key:",n),!1}}async handleSaveSettings(){let t=this.apiKeyInput?this.apiKeyInput.value.trim():"";if(!t){alert("Please enter a valid API key");return}await this.testApiKey(t)?(await this.saveApiKey(t),console.log("TabTalk AI: Saving API key with key name 'geminiApiKey' successfully"),this.showView("chat"),await this.getAndCachePageContent()):alert("Invalid API key. Please try again.")}async getAndCachePageContent(){if(!(!this.currentTab||!this.apiKey)){this.setLoading(!0,"Reading page..."),this.pageStatus.textContent="Injecting script to read page...";try{if(this.currentTab.url?.startsWith("chrome://")||this.currentTab.url?.startsWith("https://chrome.google.com/webstore"))throw new Error("Cannot run on protected browser pages.");let t=await chrome.scripting.executeScript({target:{tabId:this.currentTab.id},files:["content.js"]});if(!t||t.length===0)throw new Error("Script injection failed.");let n=t[0].result;if(n.success)this.pageContent=n.content,this.pageStatus.textContent=`\u2705 Content loaded (${(n.content.length/1024).toFixed(1)} KB)`,this.updateQuickActionsVisibility();else throw new Error(n.error)}catch(t){console.error("TabTalk AI (popup):",t),this.pageStatus.textContent=`\u274C ${t.message}`}finally{this.setLoading(!1)}}}};let e=h.prototype.init;document.addEventListener("DOMContentLoaded",()=>{window.TabTalkAPI&&Object.assign(h.prototype,window.TabTalkAPI),window.TabTalkTwitter&&Object.assign(h.prototype,window.TabTalkTwitter),window.TabTalkThreadGenerator&&Object.assign(h.prototype,window.TabTalkThreadGenerator),window.TabTalkContentAnalysis&&Object.assign(h.prototype,window.TabTalkContentAnalysis),window.TabTalkSocialMedia&&Object.assign(h.prototype,window.TabTalkSocialMedia),window.TabTalkStorage&&Object.assign(h.prototype,window.TabTalkStorage),window.TabTalkUI&&Object.assign(h.prototype,window.TabTalkUI),window.TabTalkScroll&&Object.assign(h.prototype,window.TabTalkScroll),window.TabTalkNavigation&&Object.assign(h.prototype,window.TabTalkNavigation),h.prototype.init=async function(){return await e.call(this),this},new h().init().catch(t=>console.error("Initialization error:",t))})})();})();
