(()=>{(function(){let d={async callGeminiAPIWithSystemPrompt(t,e){if(!this.apiKey||!e)throw new Error("Missing API key or user prompt");if(!this.pageContent&&(this.pageStatus.textContent="\u26A0\uFE0F Re-analyzing page before generating content...",await this.getAndCachePageContent(),!this.pageContent))throw new Error("Could not get page content to generate content.");let n=[{role:"user",parts:[{text:t},{text:e}]}],a=await chrome.runtime.sendMessage({action:"callGeminiAPI",payload:{contents:n},apiKey:this.apiKey});if(a.success&&a.data?.candidates?.[0]?.content?.parts?.[0]?.text)return a.data.candidates[0].content.parts[0].text;throw new Error(a.error||"The AI gave an empty or invalid response.")},async callGeminiAPI(t){let e=await this.getStoredApiKey();if(!e||!t)throw new Error("Missing API key or prompt");console.log("API Module: Making API call with key present:",!!e);let n=[{role:"user",parts:[{text:t}]}],a=await chrome.runtime.sendMessage({action:"callGeminiAPI",payload:{contents:n},apiKey:e});if(a.success&&a.data?.candidates?.[0]?.content?.parts?.[0]?.text)return a.data.candidates[0].content.parts[0].text;throw console.error("API Module: API response error:",a),new Error(a.error||"The AI gave an empty or invalid response.")},async getStoredApiKey(){return new Promise(t=>{chrome.storage.local.get(["geminiApiKey"],e=>{let n=e.geminiApiKey||"";console.log("API Module: Retrieved API key from storage, length:",n?.length),t(n)})})}};window.TabTalkAPI=d})();(function(){let d={async getStorageItem(t){try{let e=await chrome.storage.local.get([t]);return e?e[t]:void 0}catch(e){console.error("getStorageItem error:",e);return}},async setStorageItem(t,e){try{return await chrome.storage.local.set({[t]:e}),!0}catch(n){return console.error("setStorageItem error:",n),!1}},async loadState(){try{let t=await chrome.storage.local.get(["geminiApiKey","apiKey"]);if(console.log("TabTalk AI: Loading state, API key exists:",!!t.geminiApiKey),(t.geminiApiKey||t.apiKey)&&(this.apiKey=t.geminiApiKey||t.apiKey,console.log("TabTalk AI: API key loaded successfully"),this.apiKeyInput&&(this.apiKeyInput.value=this.apiKey)),this.currentTab){let e=new URL(this.currentTab.url);this.currentDomain=e.hostname,this.pageTitle&&(this.pageTitle.textContent=this.currentTab.title||"Untitled Page",console.log("TabTalk AI: Page title set to:",this.pageTitle.textContent))}return t}catch(t){throw console.error("Failed to load state:",t),t}},async saveState(){this.apiKey&&await chrome.storage.local.set({geminiApiKey:this.apiKey})},async saveApiKey(t){this.apiKey=t;try{await chrome.storage.local.set({geminiApiKey:t,apiKey:t,hasSeenWelcome:!0}),console.log("TabTalk AI: API key saved")}catch{await this.setStorageItem("apiKey",t),await this.setStorageItem("hasSeenWelcome",!0)}},async handleDeleteApiKey(){if(confirm("Delete your API key? You will need to set it up again."))try{await chrome.storage.local.remove(["geminiApiKey","apiKey"]),this.apiKey=null,this.apiKeyInput&&(this.apiKeyInput.value=""),this.pageContent=null,this.updateQuickActionsVisibility&&this.updateQuickActionsVisibility(),this.messagesContainer&&(this.messagesContainer.innerHTML=""),await this.setStorageItem("hasSeenWelcome",!1),this.showView("welcome"),console.log("TabTalk AI: API key deleted")}catch(t){console.error("Error deleting API key:",t),alert("Error deleting API key. Please try again.")}},async getSavedContent(){return await this.getStorageItem("savedContent")||{}},async saveContent(t,e){let n=await this.getSavedContent();n[t]||(n[t]=[]);let a={id:e&&e.id?e.id:Date.now().toString(),...e,timestamp:e&&e.timestamp?e.timestamp:Date.now()},o=n[t].findIndex(s=>s.id===a.id);o>=0?n[t][o]={...n[t][o],...a,updatedAt:Date.now()}:n[t].unshift(a);let i=[];for(let[s,r]of Object.entries(n))if(Array.isArray(r))for(let c=0;c<r.length;c++)i.push({cat:s,idx:c,item:r[c]});if(i.sort((s,r)=>(r.item.updatedAt||r.item.timestamp||0)-(s.item.updatedAt||s.item.timestamp||0)),i.length>50){let s=new Set(i.slice(0,50).map(r=>`${r.cat}:${r.item.id}`));for(let[r,c]of Object.entries(n))Array.isArray(c)&&(n[r]=c.filter(h=>s.has(`${r}:${h.id}`)))}return await this.setStorageItem("savedContent",n),console.log(`TabTalk AI: Content saved to ${t} category`),a.id},async deleteSavedContent(t,e){let n=await this.getSavedContent();n[t]&&(n[t]=n[t].filter(a=>a.id!==e),await this.setStorageItem("savedContent",n),console.log(`TabTalk AI: Content deleted from ${t} category`))},async clearSavedCategory(t){let e=await this.getSavedContent();e&&Object.prototype.hasOwnProperty.call(e,t)&&(e[t]=[],await this.setStorageItem("savedContent",e),console.log(`TabTalk AI: Cleared all saved items in category ${t}`))},async clearAllSaved(){await this.setStorageItem("savedContent",{}),console.log("TabTalk AI: Cleared all saved content across all categories")},async isContentSaved(t,e){return(await this.getSavedContent())[t]?.some(a=>a.id===e)||!1},async migrateThreadsToGallery(){try{if(await this.getStorageItem("threadsMigratedToGallery"))return;let e=await this.getStorageItem("savedThreads")||{},n=Object.values(e);if(!n.length){await this.setStorageItem("threadsMigratedToGallery",!0);return}let a=await this.getSavedContent();Array.isArray(a.twitter)||(a.twitter=[]);let o=new Set(a.twitter.map(s=>s.id));for(let s of n){let r=s.rawContent&&String(s.rawContent).trim()||(Array.isArray(s.tweets)?s.tweets.map(h=>h.content).join(`

`):""),c={id:s.id,type:"thread",platform:"thread",title:s.title||"Untitled Thread",url:s.url||"",domain:s.domain||"",tweets:Array.isArray(s.tweets)?s.tweets:[],totalTweets:s.totalTweets||(Array.isArray(s.tweets)?s.tweets.length:0),totalChars:s.totalChars,content:r,isAutoSaved:!!s.isAutoSaved,timestamp:s.createdAt||Date.now(),updatedAt:s.updatedAt||s.createdAt||Date.now()};o.has(c.id)||a.twitter.unshift(c)}let i=[];for(let[s,r]of Object.entries(a))if(Array.isArray(r))for(let c=0;c<r.length;c++)i.push({cat:s,idx:c,item:r[c]});if(i.sort((s,r)=>(r.item.updatedAt||r.item.timestamp||0)-(s.item.updatedAt||s.item.timestamp||0)),i.length>50){let s=new Set(i.slice(0,50).map(r=>`${r.cat}:${r.item.id}`));for(let[r,c]of Object.entries(a))Array.isArray(c)&&(a[r]=c.filter(h=>s.has(`${r}:${h.id}`)))}await this.setStorageItem("savedContent",a);try{await chrome.storage.local.remove(["savedThreads"])}catch{}await this.setStorageItem("threadsMigratedToGallery",!0),console.log("TabTalk AI: Migrated savedThreads to Gallery savedContent")}catch(t){console.error("Migration threads->gallery failed",t)}}};window.TabTalkStorage=d})();(function(){let d={showView:function(t){console.log("Navigation: showing view:",t),document.querySelectorAll(".view").forEach(h=>h.classList.add("hidden")),t==="welcome"||t==="api-setup"||t==="settings"?document.body.classList.add("onboarding-view"):document.body.classList.remove("onboarding-view"),window.BottomNav&&window.BottomNav.setActive(t);let a=document.getElementById("quick-actions");a&&(t==="chat"?a.classList.remove("hidden"):a.classList.add("hidden"));let o=document.getElementById("bottom-nav"),i=document.querySelector("main"),s=document.querySelector(".container");t==="welcome"||t==="api-setup"||t==="settings"?(o&&(o.style.display="none",o.style.visibility="hidden",o.style.height="0"),i&&(i.style.paddingBottom="0"),s&&(s.style.paddingBottom="0")):(o&&(o.style.display="flex",o.style.visibility="visible",o.style.height="45px"),i&&(i.style.paddingBottom="45px"),s&&(s.style.paddingBottom="66px"));let r=`${t}-view`;t==="chat"&&(r="chat-view"),t==="settings"&&(r="settings-view"),t==="welcome"&&(r="welcome-view"),t==="api-setup"&&(r="api-setup-view"),t==="history"&&(r="history-view"),t==="gallery"&&(r="gallery-view"),t==="thread-generator"&&(r="thread-generator-view");let c=document.getElementById(r);if(c){if(c.classList.remove("hidden"),t==="history"&&window.historyManager&&this.loadHistoryView(),t==="gallery"&&window.galleryManager){let h=document.getElementById("gallery-container");h&&window.galleryManager.render(h,"twitter")}t==="thread-generator"&&this.initializeHowItWorksToggle&&this.initializeHowItWorksToggle()}else console.warn(`showView: target view not found for "${t}" (id "${r}")`)},loadHistoryView:function(){if(!window.historyManager){console.error("History manager not initialized");return}let t=document.getElementById("history-list");t&&(t.innerHTML='<div class="loading-history">Loading saved content...</div>',window.historyManager.loadHistory("all").then(e=>{window.historyManager.renderHistoryList(t,e,"all")}).catch(e=>{console.error("Error loading history:",e),t.innerHTML='<div class="empty-history">Error loading saved content</div>'}))},updateViewState:function(t,e="Loading..."){if(this.sidebar&&(this.sidebar.classList.add("hidden"),this.sidebar.style.display="none"),Object.values(this.views).forEach(n=>n.classList.add("hidden")),this.views[t]?(this.views[t].classList.remove("hidden"),t==="chat"&&this.messageInput?this.messageInput.focus():t==="settings"&&this.apiKeyInput&&this.apiKeyInput.focus()):console.error(`View "${t}" not found`),t==="status"&&this.statusText&&(this.statusText.textContent=e),t==="settings"){let n=document.querySelector(".onboarding-info");n&&(n.style.display=this.apiKey?"none":"block")}this.setAriaStatus(`Switched to ${t} view. ${e}`)}};window.TabTalkNavigation=d})();(function(){let d={ensureMarked:function(){return!this.marked&&window.marked&&(this.marked=window.marked),!!this.marked},setAriaStatus:function(t){let e=document.getElementById("aria-status");e&&(e.textContent=t)},sanitizeStructuredOutput:function(t,e){if(!e)return"";let n=String(e);return n=n.replace(/^(?:here\s*(?:is|are|\'s|'s)|below\s+is|certainly,|sure,|note:|here\'s a|here's a)[^\n:]*:\s*/i,""),n=n.replace(/^\s*(?:here\s*(?:is|are|\'s|'s)\s*(?:a|an)?\s*)/i,""),n=n.replace(/\s*\*\s+(?=[^\n])/g,`
- `),n=n.replace(/^[ \t]*[•*]\s+/gm,"- "),n=n.replace(/\n{3,}/g,`

`),n=n.replace(/\((https?:\/\/[^\s)]+)\)\s*\(\1\)/g,"($1)"),n=n.replace(/(https?:\/\/[^\s)]+)\s*\(\1\)/g,"$1"),n=n.replace(/^[`\s]+/,"").replace(/[\s`]+$/,""),(t==="keypoints"||t==="summary")&&(n=n.replace(/\*\*([^*]+)\*\*/g,"$1"),n=n.replace(/\*([^*]+)\*/g,"$1"),n=n.replace(/_([^_]+)_/g,"$1")),t==="keypoints"&&!/^\s*-\s+/m.test(n)&&(n=n.split(/\s*\*\s+|\n+/).filter(Boolean).map(a=>a.replace(/^[-•*]\s+/,"").trim()).filter(Boolean).map(a=>`- ${a}`).join(`
`)),n.trim()},cleanPostContent:function(t){if(!t)return"";let e=String(t),n=e.match(/\*\*Option\s+\d+[^*]*\*\*[\s\S]*?(?=\*\*Option|\*\*Explanation|\*\*Why|$)/gi);n&&n.length>0&&(e=n[0]),e=e.replace(/^(?:Okay, here's|Here's|This is|Below is)[^\n]*:\s*/i,""),e=e.replace(/^\*\*Option\s+\d+.*?\*\*[^\n]*\n/gi,""),e=e.replace(/^\*\*Explanation.*?\*\*[^\n]*\n/gi,""),e=e.replace(/^\*\*Why.*?\*\*[^\n]*\n/gi,""),e=e.replace(/Explanation of Choices & Strategies Used:[^\n]*\n/gi,""),e=e.replace(/Why these options should work:[^\n]*\n/gi,""),e=e.replace(/Choose the option.*?\.\n/gi,""),e=e.replace(/^\s*\*\s*Hook.*?:.*$/gim,""),e=e.replace(/^\s*\*\s*Value Proposition.*?:.*$/gim,""),e=e.replace(/^\s*\*\s*Engagement.*?:.*$/gim,""),e=e.replace(/^\s*\*\s*Emojis.*?:.*$/gim,""),e=e.replace(/^\s*\*\s*Hashtags.*?:.*$/gim,""),e=e.replace(/^\s*\*\s*Thread.*?:.*$/gim,""),e=e.replace(/^\s*\*\s*Clarity.*?:.*$/gim,""),e=e.replace(/^\s*\*\s*Specificity.*?:.*$/gim,""),e=e.replace(/^\s*\*\s*Urgency.*?:.*$/gim,""),e=e.replace(/^\s*\*\s*Social Proof.*?:.*$/gim,""),e=e.replace(/^\s*\*\s*Reciprocity.*?:.*$/gim,""),e=e.replace(/^\s*\*\s*(?:Hook|Value|Engagement|Emojis|Hashtags|Thread|Clarity|Specificity|Urgency|Social|Reciprocity).*$/gim,""),e=e.replace(/^\*\*.*?Choices.*?\*\*.*$/gim,""),e=e.replace(/^\*\*.*?Strategies.*?\*\*.*$/gim,""),e=e.replace(/^\*\*.*?should work.*?\*\*.*$/gim,""),e=e.replace(/^\*\*.*?Approach.*?\*\*.*$/gim,""),e=e.replace(/^\*\*.*?Edge.*?\*\*.*$/gim,""),e=e.replace(/^\*\*.*?FOMO.*?\*\*.*$/gim,""),e=e.replace(/\*\*([^*]+)\*\*/g,"$1"),e=e.replace(/\*([^*]+)\*/g,"$1"),e=e.replace(/\n{3,}/g,`

`),e=e.replace(/^[ \t]+|[ \t]+$/gm,"");let i=e.split(`
`).filter(s=>{let r=s.trim();return r&&!r.match(/^(Explanation|Why|Choose|Strategies|Choices|Options?|Hook|Value|Engagement|Emojis|Hashtags|Thread|Clarity|Specificity|Urgency|Social|Reciprocity)[:\s]/i)&&!r.match(/^\*\*[^\*]*\*\*$/)&&!r.match(/^\*\*.*?(Choices|Strategies|Approach|Edge|FOMO).*?\*\*$/)&&!r.match(/^\s*\*\s*(?:The|Each|This|Use|Create|Referencing|Providing|Choose|Then|Good)/)}).join(`
`).trim();if(!i||i.length<20){let s=[/STOP.*[\s\S]*?#[A-Za-z]+/i,/🤯.*[\s\S]*?#[A-Za-z]+/i,/\(1\/\d+\).*[\s\S]*?#[A-Za-z]+/i];for(let r of s){let c=e.match(r);if(c&&c[0].length>30){i=c[0].trim();break}}}return i||"Unable to extract clean post content. Please try generating again."},setLoading:function(t,e="..."){this.isLoading=t,t?(this.pageStatus&&(this.pageStatus.textContent=e),this.setAriaStatus(e)):(this.pageStatus&&!this.pageStatus.textContent.startsWith("\u2705")&&(this.pageStatus.textContent="\u2705 Done"),this.setAriaStatus("Ready"))},updateQuickActionsVisibility:function(){this.quickActions&&this.quickActions.classList.toggle("hidden",!this.pageContent)},resetScreenForGeneration:function(){this.sidebar&&(this.sidebar.classList.add("hidden"),this.sidebar.style.display="none"),this.messagesContainer&&(this.messagesContainer.innerHTML=""),this.updateQuickActionsVisibility()},renderCard:function(t,e,n={}){let a=document.createElement("div");a.className="twitter-content-container";let o=document.createElement("div");o.className="twitter-card analytics-card",o.dataset.contentType=n.contentType||"content",o.dataset.contentId=n.contentId||Date.now().toString();let i={summary:"\u{1F4DD}",keypoints:"\u{1F511}",analysis:"\u{1F4CA}",faq:"\u2753",factcheck:"\u2705",blog:"\u{1F4F0}",proscons:"\u2696\uFE0F",timeline:"\u{1F4C5}",quotes:"\u{1F4AC}","click-farming":"\u{1F3AF}"},s=n.contentType||"content",r=i[s]||"\u{1F4C4}",c=n.markdown?`data-markdown="${encodeURIComponent(n.markdown)}"`:"";if(o.innerHTML=`
        <div class="twitter-card-header">
          <span class="twitter-card-title">${t}</span>
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
          <div class="structured-html content-text" ${c}>${e}</div>
        </div>
      `,window.TabTalkUI&&window.TabTalkUI.addSaveButtonToCard){let m=n.contentType||"content",p={id:n.contentId||Date.now().toString(),content:n.markdown||e,title:t},y=o.querySelector(".twitter-header-actions");y&&window.TabTalkUI.addSaveButtonToCard(y,m,p)}let h=o.querySelector(".copy-btn"),u=h.innerHTML;h.addEventListener("click",async m=>{m.stopPropagation();try{let p=o.querySelector(".structured-html"),y=p?.getAttribute("data-markdown"),g=y?decodeURIComponent(y):p?.innerText||"";await navigator.clipboard.writeText(g),h.innerHTML=`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20,6 9,17 4,12"></polyline>
          </svg>`,h.classList.add("success"),setTimeout(()=>{h.innerHTML=u,h.classList.remove("success")},2e3)}catch(p){console.error("Copy failed:",p)}}),a.appendChild(o);let l=n.container||this.messagesContainer||document.getElementById("messages-container");return l&&(l.appendChild(a),l===this.messagesContainer&&l.scrollTo({top:l.scrollHeight,behavior:"smooth"})),o},showProgressBar:function(t){this.hideProgressBar();let e=document.createElement("div");e.className="progress-container",e.id="global-progress",e.innerHTML=`
        <div class="progress-message">${t}</div>
        <div class="progress-bar"><div class="progress-fill"></div></div>
      `,this.messagesContainer.appendChild(e),this.messagesContainer.scrollTo({top:this.messagesContainer.scrollHeight,behavior:"smooth"}),setTimeout(()=>{let n=e.querySelector(".progress-fill");n&&(n.style.width="100%")},100)},hideProgressBar:function(){let t=document.getElementById("global-progress");t&&t.remove()},addSaveButtonToCard:function(t,e,n){if(!t||!e||!n)return;let a=document.createElement("button");if(t.classList.contains("twitter-header-actions")?(a.className="twitter-action-btn save-btn",a.innerHTML=`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
        </svg>`):(a.className="save-btn",a.innerHTML=`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
        </svg>`),a.setAttribute("aria-label","Save to history"),a.setAttribute("data-category",e),a.setAttribute("data-content-id",n.id||Date.now().toString()),a.title="Save to history",window.TabTalkStorage){let i=e==="thread"||e==="click-farming"?"twitter":e;window.TabTalkStorage.isContentSaved(i,n.id||Date.now().toString()).then(s=>{s&&(a.classList.add("saved"),a.querySelector("svg").setAttribute("fill","currentColor"))})}a.addEventListener("click",async i=>{i.stopPropagation();let s=a.getAttribute("data-content-id"),r=a.getAttribute("data-category"),c=r==="thread"||r==="click-farming"?"twitter":r;if(!window.TabTalkStorage)return;if(await window.TabTalkStorage.isContentSaved(c,s))await window.TabTalkStorage.deleteSavedContent(c,s),a.classList.remove("saved"),a.querySelector("svg").setAttribute("fill","none"),this.showToast("Removed from saved content");else{let u=n.content||t.querySelector(".content-text")?.textContent||"",l={source:this.currentTab?.url||window.location.href,title:this.currentTab?.title||document.title};await window.TabTalkStorage.saveContent(c,{id:s,content:u,metadata:l,type:n.type||(r==="thread"?"thread":"post"),platform:n.platform||(r==="thread"?"thread":"twitter"),...n}),a.classList.add("saved"),a.querySelector("svg").setAttribute("fill","currentColor"),this.showToast("Saved to history")}}),t.appendChild(a)},showToast:function(t,e=2e3){let n=document.createElement("div");n.className="toast",n.textContent=t,document.body.appendChild(n),setTimeout(()=>{n.classList.add("visible")},10),setTimeout(()=>{n.classList.remove("visible"),setTimeout(()=>n.remove(),300)},e)}};window.TabTalkUI=d})();(function(){let d={analyzeAndResearchContent:async function(t,e){let n=this.simpleHash(t.substring(0,500)),a=`analysis_${this.currentTab?.url}_${e.id}_${n}`;try{let i=await chrome.storage.local.get(a);if(i[a]&&Date.now()-i[a].timestamp<18e5)return console.log("Using cached content analysis"),i[a].analysis}catch(i){console.warn("Cache check failed:",i)}let o=`You are an expert content analyst and researcher. Analyze this webpage content and provide:

1. SUMMARY (2-3 sentences): Core message and main points
2. KEY INSIGHTS (3-5 bullet points): Most important facts, data, or claims
3. RESEARCH CONTEXT: Relevant domain knowledge, background, trends, or expert perspective from your training data (up to October 2024) that adds depth and credibility

Be concise, factual, and focus on what makes this content significant or noteworthy.

CONTENT:
${t.substring(0,3e3)}

Provide your analysis in this format:
SUMMARY: [your summary]
KEY INSIGHTS:
- [insight 1]
- [insight 2]
- [insight 3]
RESEARCH CONTEXT: [relevant background knowledge and expert perspective]`;try{let i=await this.callGeminiAPIWithSystemPrompt("You are an expert content analyst who provides structured, insightful analysis.",o),s=this.parseAnalysisResponse(i);try{let r={};r[a]={analysis:s,timestamp:Date.now()},await chrome.storage.local.set(r)}catch(r){console.warn("Failed to cache analysis:",r)}return s}catch(i){return console.error("Analysis failed:",i),{summary:"Content analysis unavailable.",keyInsights:"- Focus on core message from the content",researchContext:"Apply general domain knowledge and best practices."}}},simpleHash:function(t){let e=0;for(let n=0;n<t.length;n++){let a=t.charCodeAt(n);e=(e<<5)-e+a,e=e&e}return Math.abs(e).toString(36)},parseAnalysisResponse:function(t){let e=t.match(/SUMMARY:\s*(.+?)(?=KEY INSIGHTS:|$)/s),n=t.match(/KEY INSIGHTS:\s*(.+?)(?=RESEARCH CONTEXT:|$)/s),a=t.match(/RESEARCH CONTEXT:\s*(.+?)$/s);return{summary:e?e[1].trim():"Content provides valuable information.",keyInsights:n?n[1].trim():"- Key points from the content",researchContext:a?a[1].trim():"General domain knowledge applies."}},showToneSelector:function(t){if(!this.pageContent||!this.apiKey){this.showToast?this.showToast("\u274C Please set up your Gemini API key first and ensure page content is loaded.",3e3):alert("\u274C Please set up your Gemini API key first and ensure page content is loaded.");return}window.TabTalkToneSelector?window.TabTalkToneSelector.show(t,this.pageContent,(e,n)=>{this.generateSocialContentWithTone(n,e)}):(console.error("Tone selector not loaded"),this.generateSocialContentWithTone(t,{id:"supportive",name:"Supportive with Facts"}))},generateSocialContent:async function(t){this.showToneSelector(t)},generateSocialContentWithTone:async function(t,e){if(!this.pageContent||!this.apiKey){this.showToast?this.showToast("\u274C Please set up your Gemini API key first and ensure page content is loaded.",3e3):alert("\u274C Please set up your Gemini API key first and ensure page content is loaded.");return}this.currentSelectedTone=e,this.setLoading(!0,"Analyzing content..."),console.log(`TabTalk AI: Generating ${t} content for page: ${this.currentTab?.title}`),console.log(`Page content length: ${this.pageContent.length} characters`),console.log(`Selected tone: ${e.name} (${e.id})`);try{this.showProgressBar("Analyzing content...");let n=await this.analyzeAndResearchContent(this.pageContent,e);this.currentContentAnalysis=n,this.showProgressBar("Generating expert post...");let a="",o="",i="",s=e.aiInstructions||this.getDefaultToneInstructions(e.id);if(t==="twitter")i="\u{1F426}",a=`You are an expert Twitter/X content strategist who combines deep analysis with engaging storytelling. You leverage comprehensive research and domain expertise to create posts that are both intellectually rigorous and captivating. Your posts stop people mid-scroll because they offer genuine insights backed by evidence and expert knowledge.

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

Write your captivating post now:`;else if(t==="thread")i="\u{1F9F5}",a=`You are an expert Twitter/X thread strategist who combines deep analysis with compelling narrative structure. You leverage comprehensive research and domain expertise to create threads that educate, engage, and inspire. Each tweet builds on expert insights while maintaining human warmth and accessibility.

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

Generate your thread now:`;else{this.showToast?this.showToast("\u274C Only Twitter/X Post and Twitter Thread are supported.",3e3):alert("\u274C Only Twitter/X Post and Twitter Thread are supported.");return}let r=await this.callGeminiAPIWithSystemPrompt(a,o);if(r){console.log(`TabTalk AI: Successfully generated ${t} content, response length: ${r.length} characters`);let c=this.cleanTwitterContent(r);if(this.addTwitterMessage("assistant",c,t),this.addToHistory){let h={timestamp:new Date().toISOString(),url:this.currentTab?.url||"",title:this.currentTab?.title||"",domain:this.currentDomain||"",content:c,type:t};await this.addToHistory(t,h)}await this.saveState()}else throw new Error("Empty response received from Gemini API")}catch(n){console.error("Error generating social content:",n),console.error("Error details:",{message:n.message,stack:n.stack,platform:t,hasApiKey:!!this.apiKey,hasPageContent:!!this.pageContent,pageContentLength:this.pageContent?.length}),this.showToast?this.showToast(`\u274C Error: ${n.message}. Please check your API key and try again.`,4e3):alert(`\u274C Error generating social media content: ${n.message}. Please check your API key and try again.`)}finally{this.setLoading(!1),this.hideProgressBar()}},showProgressBar:function(t){this.hideProgressBar();let e=document.createElement("div");e.className="progress-container",e.id="twitter-progress",e.innerHTML=`
        <div class="progress-message">${t}</div>
        <div class="progress-bar">
          <div class="progress-fill"></div>
        </div>
      `,this.messagesContainer.appendChild(e),this.messagesContainer.scrollTo({top:this.messagesContainer.scrollHeight,behavior:"smooth"}),setTimeout(()=>{let n=e.querySelector(".progress-fill");n&&(n.style.width="100%")},100)},hideProgressBar:function(){let t=document.getElementById("twitter-progress");t&&t.remove()},addTwitterMessage:function(t,e,n){this.renderTwitterContent(e,n)},renderTwitterContent:function(t,e){let n=document.createElement("div");if(n.className="twitter-content-container",e==="thread"){let a=this.parseTwitterThread(t),o=`thread_${Date.now()}`;this.autoSaveThread(o,a,t);let i=document.createElement("div");i.className="thread-header";let s=this.getTotalChars(a);i.innerHTML=`
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
        `,n.appendChild(r);let c=i.querySelector(".btn-copy-all-thread"),h=i.querySelector(".copy-all-status");c.addEventListener("click",async()=>{await this.copyAllTweets(a,c,h)});let u=r.querySelector(".master-length-slider"),l=r.querySelector(".current-length"),m=r.querySelector(".btn-regenerate-thread"),p=r.querySelectorAll(".preset-btn");u.addEventListener("input",y=>{l.textContent=y.target.value}),p.forEach(y=>{y.addEventListener("click",()=>{let g=y.dataset.length;u.value=g,l.textContent=g})}),m.addEventListener("click",async()=>{let y=parseInt(u.value);await this.regenerateEntireThread(n,o,y,t)}),a.forEach((y,g)=>{let w=`Thread ${g+1}/${a.length}`,f=this.createTwitterCard(y,w,!0);f.dataset.platform=e,f.dataset.threadId=o,n.appendChild(f)})}else{let a=this.createTwitterCard(t,"Post");a.dataset.platform=e,n.appendChild(a)}this.messagesContainer.appendChild(n),setTimeout(()=>{this.messagesContainer.scrollTo({top:this.messagesContainer.scrollHeight,behavior:"smooth"})},100)},parseTwitterThread:function(t){let n=this.cleanTwitterContent(t).replace(/Here's your clean.*?content:\s*/gi,"").trim(),a=[],o=n.split(`
`),i="",s=null;for(let r of o){let c=r.trim(),h=c.match(/^(\d+)\/(\d+)[\s:]*(.*)$/);h?(i.trim()&&a.push(i.trim()),s=h[1],i=h[3]||""):s!==null&&c&&(i+=(i?`
`:"")+c)}return i.trim()&&a.push(i.trim()),a.length===0?(console.warn("Thread parsing failed, returning full content as single tweet"),[n||t]):(console.log(`\u2705 Parsed ${a.length} tweets from thread`),a)},createTwitterCard:function(t,e,n=!1){let a=document.createElement("div");a.className="twitter-card";let o=this.currentSelectedTone?`
        <div class="tone-badge" style="background: linear-gradient(135deg, ${this.currentSelectedTone.tone1?.color||this.getToneColor(this.currentSelectedTone.id)} 0%, ${this.currentSelectedTone.tone2?.color||this.getToneColor(this.currentSelectedTone.id)} 100%);">
          ${this.currentSelectedTone.tone1?.icon||this.getToneIcon(this.currentSelectedTone.id)} ${this.currentSelectedTone.name}
        </div>
      `:"",i=n?`
        <div class="twitter-controls">
          <div class="twitter-char-count">${this.getAccurateCharacterCount(t)} characters</div>
        </div>
      `:`
        <div class="twitter-controls">
          ${o}
          <div class="twitter-length-control">
            <label class="length-label">Target Length:</label>
            <input type="range" class="length-slider" min="50" max="2000" value="${Math.max(50,this.getAccurateCharacterCount(t))}" step="50">
            <span class="length-display">${Math.max(50,this.getAccurateCharacterCount(t))}</span>
            <button class="regenerate-btn" title="Regenerate with new length">\u{1F504}</button>
          </div>
          <div class="twitter-char-count">${this.getAccurateCharacterCount(t)} characters</div>
        </div>
      `;if(a.innerHTML=`
        <div class="twitter-card-header">
          <span class="twitter-card-title">${e}</span>
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
          <textarea class="twitter-text" placeholder="Edit your tweet content...">${t}</textarea>
          ${i}
        </div>
      `,window.TabTalkUI&&window.TabTalkUI.addSaveButtonToCard){let u={id:Date.now().toString(),content:t,title:e},l=e.toLowerCase().includes("thread")?"thread":"twitter",m=a.querySelector(".twitter-header-actions");m&&window.TabTalkUI.addSaveButtonToCard(m,l,u)}let s=a.querySelector(".copy-btn"),r=a.querySelector(".twitter-text"),c=s.innerHTML;s.addEventListener("click",async u=>{u.stopPropagation();try{await navigator.clipboard.writeText(r.value),s.innerHTML=`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20,6 9,17 4,12"></polyline>
          </svg>`,s.classList.add("success"),setTimeout(()=>{s.innerHTML=c,s.classList.remove("success")},2e3)}catch(l){console.error("Copy failed:",l)}});let h=()=>{r.style.height="auto",r.style.height=Math.max(80,r.scrollHeight)+"px"};if(setTimeout(h,0),r.addEventListener("input",()=>{let u=a.querySelector(".twitter-char-count"),l=this.getAccurateCharacterCount(r.value);u.textContent=`${l} characters`,u.style.color="var(--text-secondary)",h()}),!n){let u=a.querySelector(".length-slider"),l=a.querySelector(".length-display"),m=a.querySelector(".regenerate-btn");u&&l&&u.addEventListener("input",()=>{l.textContent=u.value}),a.dataset.originalContent=this.pageContent,a.dataset.platform=e.includes("Thread")?"thread":"twitter",this.currentSelectedTone&&(a.dataset.selectedTone=JSON.stringify(this.currentSelectedTone)),m&&m.addEventListener("click",async()=>{let p=parseInt(u.value),y=a.dataset.platform,g=a.dataset.selectedTone?JSON.parse(a.dataset.selectedTone):this.currentSelectedTone;await this.regenerateWithLength(a,p,y,{selectedTone:g})})}return a},cleanTwitterContent:function(t){if(!t)return t;let e=t;return e=e.replace(/^.*?Unacceptable.*?\n/gim,""),e=e.replace(/^.*?critical failure.*?\n/gim,""),e=e.replace(/^.*?forbidden.*?formatting.*?\n/gim,""),e=e.replace(/^.*?breaks the instructions.*?\n/gim,""),e=e.replace(/^.*?--[•\-]\s*Original Response:.*?\n/gim,""),e=e.replace(/^.*?You have used.*?\n/gim,""),e=e.replace(/^.*?This output is unusable.*?\n/gim,""),e=e.replace(/^.*?Here's your.*?content:.*?\n/gim,""),e=e.replace(/^.*?OUTPUT:.*?\n/gim,""),e=e.replace(/#\w+/g,""),e=e.replace(/#/g,""),e=e.replace(/\*\*([^*]+)\*\*/g,"$1"),e=e.replace(/\*([^*]+)\*/g,"$1"),e=e.replace(/_{2,}([^_]+)_{2,}/g,"$1"),e=e.replace(/_([^_]+)_/g,"$1"),e=e.replace(/\*{2,}/g,""),e=e.replace(/_{2,}/g,""),e=e.replace(/\(line break\)/gi,`
`),e=e.replace(/\[line break\]/gi,`
`),e=e.replace(/^[-*]\s+/gm,"\u2022 "),e=e.replace(/https?:\/\/\S+/gi,""),e=e.replace(/\((https?:\/\/[^)]+)\)/gi,""),e=e.replace(/www\.\S+/gi,""),e=e.replace(/\[([^\]]+)\]\([^)]+\)/g,"$1"),e=e.replace(/\[([^\]]+)\]/g,"$1"),e=e.replace(/\(emphasis\)/gi,""),e=e.replace(/\(bold\)/gi,""),e=e.replace(/\(italic\)/gi,""),e=e.replace(/\n{3,}/g,`

`),e=e.replace(/[ \t]+/g," "),e=e.replace(/(^|\n)\s*$/g,""),e=e.trim(),e},getAccurateCharacterCount:function(t){if(!t)return 0;let e=t.trim(),n=0,a=Array.from(e);for(let o of a)this.isEmojiOrSpecialChar(o)?n+=2:n+=1;return n},isEmojiOrSpecialChar:function(t){let e=t.codePointAt(0);return e>=126976&&e<=129535||e>=9728&&e<=9983||e>=9984&&e<=10175||e>=128512&&e<=128591||e>=127744&&e<=128511||e>=128640&&e<=128767||e>=127456&&e<=127487||e>=8205},regenerateWithLength:async function(t,e,n,a){let o=t.querySelector(".twitter-text"),i=t.querySelector(".regenerate-btn"),s=t.dataset.originalContent;i.textContent="\u23F3",i.disabled=!0;try{let r="",c="",h=a&&a.selectedTone||this.currentSelectedTone||{id:"supportive",name:"Supportive with Facts"},u=h.aiInstructions||this.getDefaultToneInstructions(h.id),l=this.currentContentAnalysis||{summary:"Content provides valuable information.",keyInsights:"- Key points from the content",researchContext:"Apply general domain knowledge and best practices."};if(n==="twitter")r=`You are an expert Twitter/X content strategist creating ${e}-character posts that combine deep analysis with engaging storytelling. Every word is backed by research and expertise while radiating personality and human warmth. Write in plain text with strategic emojis - no hashtags, no URLs, no formatting symbols.

${u}

CONTEXT ANALYSIS:
${l.summary}

KEY INSIGHTS:
${l.keyInsights}

RESEARCH AUGMENTATION:
${l.researchContext}`,c=`Recreate this as an expert ${e}-character Twitter post that combines insight with engagement.

YOUR APPROACH:
\u2713 Target: ${e} characters (\xB110 acceptable)
\u2713 Write with GENUINE excitement and energy
\u2713 Use natural line breaks for rhythm
\u2713 Include 2-4 emojis strategically placed
\u2713 Start with a scroll-stopping hook
\u2713 Add punchy, conversational language
\u2713 Mix short zingers with flowing sentences
\u2713 Apply the ${h.name} tone throughout
\u2713 End with impact or intrigue

KEEP IT CLEAN:
\u2717 No hashtags
\u2717 No formatting symbols
\u2717 No URLs
\u2717 No meta-commentary

ORIGINAL CONTENT:
${s}

Transform it now:`;else if(n==="thread"){let p=Math.ceil(e/400);r=`You are an expert Twitter/X thread strategist crafting ${p} tweets (${e} total characters) that combine deep analysis with compelling narrative. Each tweet builds on expert insights while maintaining human warmth and accessibility. Write in plain text with strategic emojis - no hashtags, no URLs, no formatting.

${u}

CONTEXT ANALYSIS:
${l.summary}

KEY INSIGHTS:
${l.keyInsights}

RESEARCH AUGMENTATION:
${l.researchContext}`,c=`Recreate this as an expert ${p}-tweet thread (around ${e} characters total).

YOUR STORYTELLING APPROACH:
\u2713 Create ${p} numbered tweets (1/${p}, 2/${p}, etc.)
\u2713 Total: approximately ${e} characters
\u2713 Write with genuine enthusiasm and energy
\u2713 Use line breaks for visual breathing room
\u2713 Include 1-2 emojis per tweet naturally
\u2713 Each tweet delivers a powerful insight
\u2713 Build narrative momentum throughout
\u2713 Mix punchy short lines with flowing explanations
\u2713 Apply the ${h.name} tone throughout
\u2713 End with an unforgettable closer

KEEP IT CLEAN:
\u2717 No hashtags
\u2717 No formatting symbols
\u2717 No URLs
\u2717 No explanations about format

ORIGINAL CONTENT:
${s}

Craft your thread now:`}let m=await this.callGeminiAPIWithSystemPrompt(r,c);if(m){let p=this.cleanTwitterContent(m);if(n==="thread"){let f=this.parseTwitterThread(p)[0]||p;o.value=f}else o.value=p;let y=t.querySelector(".twitter-char-count"),g=this.getAccurateCharacterCount(o.value);y.textContent=`${g} characters`,setTimeout(()=>{o.style.height="auto",o.style.height=Math.max(80,o.scrollHeight)+"px"},0)}}catch(r){console.error("Error regenerating content:",r),alert("Error regenerating content. Please try again.")}finally{i.textContent="\u{1F504}",i.disabled=!1}},getDefaultToneInstructions:function(t){let e={supportive:`TONE: Supportive with Facts
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
- Achievable steps`};return e[t]||e.supportive},getToneColor:function(t){return{supportive:"var(--accent-color)",critical:"var(--accent-medium)",trolling:"var(--accent-light)","anti-propaganda":"var(--accent-color)","critical-humor":"var(--accent-medium)",sarcastic:"var(--accent-light)",investigative:"var(--accent-color)",optimistic:"var(--accent-medium)",cautionary:"var(--accent-light)",empowering:"var(--accent-color)"}[t]||"var(--accent-color)"},getToneIcon:function(t){return{supportive:"\u{1F91D}",critical:"\u2694\uFE0F",trolling:"\u{1F608}","anti-propaganda":"\u{1F6E1}\uFE0F","critical-humor":"\u{1F605}",sarcastic:"\u{1F3AD}",investigative:"\u{1F50D}",optimistic:"\u{1F305}",cautionary:"\u26A0\uFE0F",empowering:"\u{1F4AA}"}[t]||"\u{1F3AD}"},autoSaveThread:async function(t,e,n){if(!window.TabTalkStorage||!window.TabTalkStorage.saveContent){console.warn("Storage module not available for gallery persistence");return}try{let a=Array.isArray(e)?e.map((o,i)=>`${i+1}/${e.length}:
${o}`).join(`

---

`):String(n||"");await window.TabTalkStorage.saveContent("twitter",{id:t,type:"thread",platform:"thread",title:this.currentTab?.title||"Untitled Thread",url:this.currentTab?.url||"",domain:this.currentDomain||"",content:a,tweets:Array.isArray(e)?e.map((o,i)=>({id:`tweet_${i+1}`,number:`${i+1}/${e.length}`,content:o,charCount:this.getAccurateCharacterCount(o)})):[],rawContent:n,totalTweets:Array.isArray(e)?e.length:0,totalChars:Array.isArray(e)?this.getTotalChars(e):this.getAccurateCharacterCount(a),isAutoSaved:!0,timestamp:Date.now(),updatedAt:Date.now()}),console.log("\u2705 Thread auto-saved to Gallery:",t),this.showAutoSaveNotification()}catch(a){console.error("Error auto-saving thread to Gallery:",a)}},copyAllTweets:async function(t,e,n){try{let a=t.map((o,i)=>`${i+1}/${t.length}:
${o}`).join(`

---

`);await navigator.clipboard.writeText(a),e.classList.add("hidden"),n.classList.remove("hidden"),setTimeout(()=>{e.classList.remove("hidden"),n.classList.add("hidden")},3e3),console.log("\u2705 All tweets copied to clipboard")}catch(a){console.error("Error copying all tweets:",a),alert("Failed to copy tweets. Please try again.")}},getTotalChars:function(t){return t.reduce((e,n)=>e+this.getAccurateCharacterCount(n),0)},showAutoSaveNotification:function(){let t=document.createElement("div");t.className="auto-save-notification",t.innerHTML="\u{1F4BE} Thread auto-saved",t.style.cssText=`
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
      `,document.body.appendChild(t),setTimeout(()=>{t.style.animation="slideOutDown 0.3s ease",setTimeout(()=>t.remove(),300)},2e3)},regenerateEntireThread:async function(t,e,n,a){let o=t.querySelector(".btn-regenerate-thread");if(!o)return;let i=o.textContent;o.textContent="\u23F3 Regenerating...",o.disabled=!0;try{let s=Math.max(3,Math.min(8,Math.ceil(n/500))),r=`You are a masterful Twitter/X thread storyteller crafting ${s} tweets (${n} total characters) that captivate from start to finish. Each tweet vibrates with personality, energy, and human warmth. You turn complex ideas into addictive narratives. Write in plain text with strategic emojis - no hashtags, no URLs, no formatting. Pure storytelling magic.`,c=`Create a magnetic Twitter thread with EXACTLY ${s} tweets totaling approximately ${n} characters.

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

Craft your ${n}-character thread now:`,h=await this.callGeminiAPIWithSystemPrompt(r,c);if(h){let u=this.cleanTwitterContent(h),l=this.parseTwitterThread(u);t.querySelectorAll(".twitter-card").forEach(w=>w.remove()),l.forEach((w,f)=>{let v=`Thread ${f+1}/${l.length}`,T=this.createTwitterCard(w,v,!0);T.dataset.platform="thread",T.dataset.threadId=e,t.appendChild(T)});let p=t.querySelector(".thread-meta");p&&(p.textContent=`${l.length} tweets \u2022 ${this.getTotalChars(l)} chars`);let y=t.querySelector(".current-length");y&&(y.textContent=this.getTotalChars(l));let g=t.querySelector(".master-length-slider");g&&(g.value=this.getTotalChars(l)),await this.autoSaveThread(e,l,u),console.log("\u2705 Thread regenerated successfully")}}catch(s){console.error("Error regenerating thread:",s),alert("Failed to regenerate thread. Please try again.")}finally{o.textContent=i,o.disabled=!1}}};window.TabTalkTwitter=d})();(function(){let d={knowledgePacks:{},modalInitialized:!1,popupInstance:null,init:function(){this.modalInitialized||(this.createModalHTML(),this.bindModalEvents(),this.modalInitialized=!0)},createModalHTML:function(){document.getElementById("thread-generator-modal")||document.body.insertAdjacentHTML("beforeend",`
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
      `)},bindModalEvents:function(){let t=document.getElementById("thread-generator-modal");if(!t)return;let e=t.querySelector(".tone-modal-close"),n=t.querySelector(".tone-modal-overlay"),a=document.getElementById("thread-gen-cancel-btn"),o=document.getElementById("thread-gen-generate-btn");e?.addEventListener("click",()=>this.hideModal()),n?.addEventListener("click",()=>this.hideModal()),a?.addEventListener("click",()=>this.hideModal()),o?.addEventListener("click",()=>this.handleGenerate()),t.addEventListener("keydown",i=>{i.key==="Escape"&&this.hideModal()})},showModal:function(t){if(t)d.popupInstance=t,console.log("ThreadGenerator: Stored popup instance, has apiKey:",!!t.apiKey);else{console.error("ThreadGenerator: No popup instance provided to showModal"),alert("Unable to open thread generator. Please refresh and try again.");return}d.init();let e=document.getElementById("thread-generator-modal");if(!e)return;e.classList.remove("hidden"),e.setAttribute("aria-hidden","false"),document.getElementById("modal-thread-topic")?.focus()},hideModal:function(){let t=document.getElementById("thread-generator-modal");t&&(t.classList.add("hidden"),t.setAttribute("aria-hidden","true"))},handleGenerate:async function(){let t=document.getElementById("modal-thread-category")?.value,e=document.getElementById("modal-thread-topic")?.value?.trim(),n=document.getElementById("modal-use-knowledge-pack")?.checked;if(!e){alert("Please enter a topic");return}console.log("ThreadGenerator: handleGenerate called"),console.log("ThreadGenerator: popupInstance exists:",!!d.popupInstance),console.log("ThreadGenerator: popupInstance has apiKey:",!!d.popupInstance?.apiKey),console.log("ThreadGenerator: popupInstance has generateThreadMVP:",!!d.popupInstance?.generateThreadMVP),d.hideModal(),d.popupInstance&&d.popupInstance.resetScreenForGeneration&&d.popupInstance.resetScreenForGeneration(),d.popupInstance&&d.popupInstance.generateThreadMVP?await d.popupInstance.generateThreadMVP(t,e,{useKnowledgePack:n,maxTweets:8,tone:"curious"}):(console.error("Popup instance not available for thread generation"),console.error("popupInstance:",d.popupInstance),alert("Unable to generate thread. Please try again."))},loadKnowledgePack:async function(t){if(this.knowledgePacks[t])return this.knowledgePacks[t];try{let e=await fetch(`knowledge-packs/${t}.json`);if(!e.ok)return console.warn(`Knowledge pack not found for ${t}`),null;let n=await e.json();return this.knowledgePacks[t]=n,n}catch(e){return console.error(`Error loading knowledge pack for ${t}:`,e),null}},getRandomHook:function(t){if(!t||!t.hooks||t.hooks.length===0)return null;let e=Math.floor(Math.random()*t.hooks.length);return t.hooks[e]},generateThreadMVP:async function(t,e,n={}){let a=this;if(!a.apiKey){alert("\u274C Please set up your Gemini API key first."),a.showView&&a.showView("settings");return}let o=n.useKnowledgePack!==!1,i=n.maxTweets||8,s=n.tone||"curious";a.setLoading(!0,`Generating ${t} thread...`),console.log(`Fibr: Generating thread for category: ${t}, topic: ${e}`);try{let r="";if(o){let v=await d.loadKnowledgePack(t);v&&v.facts&&(r=`

RELEVANT KNOWLEDGE BASE:
${v.facts.slice(0,5).map((T,b)=>`${b+1}. ${T}`).join(`
`)}
`)}a.showProgressBar&&a.showProgressBar(`Generating ${t} thread...`);let c=`You are a precise thread outline creator. You create structured outlines for engaging Twitter/X threads about ${t}. No markdown, no hashtags.`,h=`Create a ${i}-tweet thread outline about: ${e}

Category: ${t}
Tone: ${s}
${r}

Create an outline with ${i} beats:
- Beat 1: Hook (attention-grabbing opener)
- Beats 2-${i-1}: Core content (facts, insights, twists)
- Beat ${i}: Closer (memorable ending)

Format each beat as:
[Beat number]: [One-sentence description]

Generate the outline now:`,u=await a.callGeminiAPIWithSystemPrompt(c,h);if(!u)throw new Error("Failed to generate outline");console.log("\u2705 Outline generated");let l=`You are a masterful Twitter/X thread storyteller. You craft threads about ${t} that captivate readers. Each tweet pulses with energy and personality. Write in plain text with strategic emojis - no hashtags, no URLs, no formatting symbols.`,m=`Transform this outline into a complete ${i}-tweet thread about: ${e}

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

Generate the complete thread now:`,p=await a.callGeminiAPIWithSystemPrompt(l,m);if(!p)throw new Error("Failed to expand thread");console.log("\u2705 Thread expanded");let y=a.cleanTwitterContent(p),g=a.parseTwitterThread(y),w=[];for(let v of g)if(a.getAccurateCharacterCount(v)<=280)w.push(v);else{let b=await d.smartSplitTweet.call(a,v,280);w.push(...b)}console.log(`\u2705 Thread generated: ${w.length} tweets`);let f=`thread_${Date.now()}`;d.renderThreadGeneratorResult.call(a,w,f,t,e,o),a.autoSaveThread&&await a.autoSaveThread(f,w,y),await a.saveState()}catch(r){console.error("Error generating thread:",r),alert(`\u274C Error generating thread: ${r.message}`)}finally{a.setLoading(!1),a.hideProgressBar&&a.hideProgressBar()}},smartSplitTweet:async function(t,e){let n=t.match(/[^.!?]+[.!?]+/g)||[t],a=[],o="";for(let i of n)this.getAccurateCharacterCount(o+i)<=e?o+=i:(o&&a.push(o.trim()),o=i);return o&&a.push(o.trim()),a.length>0?a:[t.substring(0,e)]},renderThreadGeneratorResult:function(t,e,n,a,o=!0){let i=document.createElement("div");i.className="twitter-content-container thread-generator-result",i.dataset.category=n,i.dataset.topic=a,i.dataset.useKnowledgePack=o;let s=document.createElement("div");s.className="thread-header";let r=this.getTotalChars(t);s.innerHTML=`
        <div class="thread-info">
          <span class="thread-icon">\u{1F9F5}</span>
          <div class="thread-title-group">
            <span class="thread-title">${a}</span>
            <span class="thread-category">${n.charAt(0).toUpperCase()+n.slice(1)}</span>
          </div>
          <span class="thread-meta">${t.length} tweets \u2022 ${r} chars</span>
        </div>
        <div class="thread-actions">
          <button class="btn-copy-all-thread" data-thread-id="${e}" title="Copy all tweets">
            \u{1F4CB} Copy All
          </button>
          <span class="copy-all-status hidden">\u2713 All Copied!</span>
        </div>
      `,i.appendChild(s);let c=s.querySelector(".btn-copy-all-thread"),h=s.querySelector(".copy-all-status");c.addEventListener("click",async()=>{await this.copyAllTweets(t,c,h)});let u=document.createElement("div");u.className="thread-master-control",u.innerHTML=`
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
            <input type="range" class="master-length-slider" min="500" max="5000" value="${r}" step="100" data-thread-id="${e}">
            <span class="slider-max">5000</span>
          </div>
          <div class="slider-value">
            <span class="current-length">${r}</span> characters total
          </div>
        </div>
        <div class="master-control-actions">
          <button class="btn-regenerate-thread" data-thread-id="${e}" title="Regenerate entire thread with new length">
            \u{1F504} Regenerate Thread
          </button>
        </div>
      `,i.appendChild(u);let l=u.querySelector(".master-length-slider"),m=u.querySelector(".current-length"),p=u.querySelector(".btn-regenerate-thread"),y=u.querySelectorAll(".preset-btn");l.addEventListener("input",g=>{m.textContent=g.target.value}),y.forEach(g=>{g.addEventListener("click",()=>{let w=g.dataset.length;l.value=w,m.textContent=w})}),p.addEventListener("click",async()=>{let g=parseInt(l.value);await this.regenerateEntireThreadForGenerator(i,e,g,n,a,o)}),t.forEach((g,w)=>{let f=`Thread ${w+1}/${t.length}`,v=this.createTwitterCard(g,f,!0);v.dataset.platform="thread",v.dataset.threadId=e,v.dataset.category=n,i.appendChild(v)}),this.messagesContainer.appendChild(i),setTimeout(()=>{this.messagesContainer.scrollTo({top:this.messagesContainer.scrollHeight,behavior:"smooth"})},100)},regenerateEntireThreadForGenerator:async function(t,e,n,a,o,i){let s=t.querySelector(".btn-regenerate-thread");if(!s)return;let r=s.textContent;s.textContent="\u23F3 Regenerating...",s.disabled=!0;try{let c=Math.max(3,Math.min(12,Math.ceil(n/400))),h="";if(i){let p=await this.loadKnowledgePack(a);p&&p.facts&&(h=`

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

${h}

Craft your ${n}-character thread now:`,m=await this.callGeminiAPIWithSystemPrompt(u,l);if(m){let p=this.cleanTwitterContent(m),y=this.parseTwitterThread(p);t.querySelectorAll(".twitter-card").forEach(T=>T.remove()),y.forEach((T,b)=>{let C=`Thread ${b+1}/${y.length}`,k=this.createTwitterCard(T,C,!0);k.dataset.platform="thread",k.dataset.threadId=e,k.dataset.category=a,t.appendChild(k)});let w=t.querySelector(".thread-meta");w&&(w.textContent=`${y.length} tweets \u2022 ${this.getTotalChars(y)} chars`);let f=t.querySelector(".current-length");f&&(f.textContent=this.getTotalChars(y));let v=t.querySelector(".master-length-slider");v&&(v.value=this.getTotalChars(y)),this.autoSaveThread&&await this.autoSaveThread(e,y,p),console.log("\u2705 Thread regenerated successfully")}}catch(c){console.error("Error regenerating thread:",c),alert("Failed to regenerate thread. Please try again.")}finally{s.textContent=r,s.disabled=!1}},showThreadGeneratorView:function(){document.getElementById("thread-generator-view")&&this.showView("thread-generator")},initializeHowItWorksToggle:function(){let t=document.getElementById("how-it-works-toggle"),e=document.getElementById("how-it-works-content");!t||!e||(e.classList.remove("expanded"),t.classList.remove("expanded"),t.addEventListener("click",()=>{e.classList.contains("expanded")?(e.classList.remove("expanded"),t.classList.remove("expanded")):(e.classList.add("expanded"),t.classList.add("expanded"))}))},handleThreadGeneratorSubmit:async function(){let t=document.getElementById("thread-category"),e=document.getElementById("thread-topic"),n=document.getElementById("use-knowledge-pack");if(!t||!e){console.error("Thread generator form elements not found");return}let a=t.value,o=e.value.trim();if(!o){window.TabTalkUI?.showToast("Please enter a topic",2e3);return}if(window.TabTalkEnhancedQuickActions){window.TabTalkEnhancedQuickActions.generateThread();return}let i=n?n.checked:!0;try{let s=document.getElementById("generate-thread-btn"),r=s.textContent;s.textContent="\u23F3 Generating...",s.disabled=!0;let c=`Create an engaging Twitter thread about "${o}".`;a!=="general"&&(c+=` Use the ${a} knowledge base for relevant facts and insights.`),c+=` Create an 8-tweet thread with the following requirements:
- Start each tweet with "1/n:", "2/n:", etc.
- Use natural emojis (2-4 per thread total)
- No hashtags or URLs
- Include a compelling hook in the first tweet
- End with a clear call-to-action
- Use the ${a} style and tone appropriate for this topic`,i&&(c+=" Include relevant facts, statistics, and expert insights from the knowledge base.");let h=await window.TabTalkAPI?.callGeminiAPI(c);h&&(this.displayThreadResult(h,o,a),this.saveThreadToGallery(h,o,a),window.TabTalkUI?.showToast("Thread generated successfully!",2e3))}catch(s){console.error("Thread generation failed:",s),window.TabTalkUI?.showToast("Failed to generate thread",3e3)}finally{let s=document.getElementById("generate-thread-btn");s&&(s.textContent="\u{1F680} Generate Enhanced Thread",s.disabled=!1)}}};window.TabTalkThreadGenerator=d})();(function(){let d={initializeHorizontalScroll:function(){let t=document.querySelector(".scroll-container"),e=document.getElementById("scroll-left"),n=document.getElementById("scroll-right");if(!t||!e||!n)return;let a=200;e.addEventListener("click",()=>{t.scrollBy({left:-a,behavior:"smooth"})}),n.addEventListener("click",()=>{t.scrollBy({left:a,behavior:"smooth"})});let o=()=>{let c=t.scrollWidth-t.clientWidth;e.disabled=t.scrollLeft<=0,n.disabled=t.scrollLeft>=c};t.addEventListener("scroll",o),o(),t.addEventListener("wheel",c=>{c.deltaY!==0&&(c.preventDefault(),t.scrollLeft+=c.deltaY,o())});let i=!1,s,r;t.addEventListener("mousedown",c=>{i=!0,s=c.pageX-t.offsetLeft,r=t.scrollLeft,t.style.cursor="grabbing"}),t.addEventListener("mouseleave",()=>{i=!1,t.style.cursor="grab"}),t.addEventListener("mouseup",()=>{i=!1,t.style.cursor="grab",o()}),t.addEventListener("mousemove",c=>{if(!i)return;c.preventDefault();let u=(c.pageX-t.offsetLeft-s)*1.5;t.scrollLeft=r-u}),t.style.cursor="grab"}};window.TabTalkScroll=d})();(function(){let d={INIT_KEY:"savedContent",async loadSaved(t="twitter"){if(!window.TabTalkStorage||!TabTalkStorage.getSavedContent)return console.error("Gallery: TabTalkStorage not available"),[];let e=await TabTalkStorage.getSavedContent();return e?t==="all"?Object.entries(e).flatMap(([a,o])=>Array.isArray(o)?o.map(i=>({...i,_category:a})):[]):Array.isArray(e[t])?e[t]:[]:[]},async render(t,e="twitter"){t.innerHTML="";let n=document.createElement("div");n.className="gallery-header",n.innerHTML=`
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
      `,t.appendChild(n);let a=document.createElement("div");a.className="gallery-list",t.appendChild(a);let o=await this.loadSaved(e);this.initVirtualList(a,o),n.querySelector("#gallery-back-btn").addEventListener("click",()=>{window.TabTalkNavigation&&TabTalkNavigation.showView&&TabTalkNavigation.showView("chat")});let s=n.querySelector("#gallery-search"),r=n.querySelector("#gallery-sort"),c=n.querySelector("#gallery-count"),h=n.querySelector("#gallery-delete-all"),u=async()=>{let l=(s.value||"").toLowerCase(),m=r.value,p=await this.loadSaved(e);l&&(p=p.filter(y=>(y.content||"").toLowerCase().includes(l)||(y.domain||"").toLowerCase().includes(l))),p=this.sortItems(p,m),this.initVirtualList(a,p),this.renderList(a,p.slice(0,this._virtual.batch)),c.textContent=`${p.length}/50`};s.addEventListener("input",this.debounce(u,150)),r.addEventListener("change",u),c.textContent=`${o.length}/50`,h&&h.addEventListener("click",async()=>{confirm("Delete all saved items in this category?")&&window.TabTalkStorage&&TabTalkStorage.clearSavedCategory&&(await TabTalkStorage.clearSavedCategory(e),this.initVirtualList(a,[]),this.renderList(a,[]),c.textContent="0/50")})},sortItems(t,e){let n=[...t];switch(e){case"created_desc":return n.sort((a,o)=>(o.timestamp||0)-(a.timestamp||0));case"length_asc":return n.sort((a,o)=>(a.charCountAccurate||(a.content||"").length)-(o.charCountAccurate||(o.content||"").length));case"length_desc":return n.sort((a,o)=>(o.charCountAccurate||(o.content||"").length)-(a.charCountAccurate||(a.content||"").length));case"updated_desc":default:return n.sort((a,o)=>(o.updatedAt||o.timestamp||0)-(a.updatedAt||a.timestamp||0))}},renderList(t,e){if(!e||e.length===0){t.innerHTML=`
          <div class="gallery-empty">
            <img src="icons/icon128.jpeg" alt="" />
            <h3>No saved posts yet</h3>
            <p>Use the Save button on any generated card to add it here.</p>
          </div>
        `;return}if(this._virtual&&this._virtual.list===t){this.appendNextBatch();return}t.innerHTML="";let n=document.createDocumentFragment();e.forEach(a=>{let o=this.renderCard(a);n.appendChild(o)}),t.appendChild(n)},initVirtualList(t,e){let n=t;n.innerHTML="",this._virtual={list:n,items:e||[],index:0,batch:20},this.appendNextBatch(),this._virtual.items.length>this._virtual.batch&&this.appendNextBatch();let a=()=>{let{list:o}=this._virtual||{};o&&o.scrollTop+o.clientHeight>=o.scrollHeight-120&&this.appendNextBatch()};this._virtualScrollHandler&&n.removeEventListener("scroll",this._virtualScrollHandler),this._virtualScrollHandler=a,n.addEventListener("scroll",a,{passive:!0})},appendNextBatch(){let t=this._virtual;if(!t||!t.list||t.index>=t.items.length)return;let e=t.index,n=Math.min(t.index+t.batch,t.items.length),a=document.createDocumentFragment();for(let o=e;o<n;o++)a.appendChild(this.renderCard(t.items[o]));t.list.appendChild(a),t.index=n},renderCard(t){let e=document.createElement("div"),n=(t.platform||"").toLowerCase()==="thread"||(t.title||"").toLowerCase().includes("thread")||(t.content||"").includes("1/")||(t.content||"").includes("\u{1F9F5}"),a=(t.content||"").length>500,o="gallery-card";n?o+=" card-thread":a&&(o+=" card-long"),e.className=o;let i=this.getAccurateCharacterCount(t.content||"");e.innerHTML=`
        <div class="gallery-card-header">
          <div class="title-row">
            <span class="title">${this.escapeHtml(t.title||"Post")}</span>
            <span class="badge platform">${this.escapeHtml((t.platform||"twitter").toUpperCase())}</span>
          </div>
          <div class="meta-row">
            <span class="timestamp">${this.formatDate(t.updatedAt||t.timestamp)}</span>
            <span class="metrics">${i} chars</span>
          </div>
        </div>
        <div class="gallery-card-body">
          <div class="gallery-preview" data-content="${this.escapeHtml(t.content||"")}">
            ${this.escapeHtml(t.content||"").substring(0,200)}${(t.content||"").length>200?"...":""}
          </div>
        </div>
        <div class="gallery-card-footer">
          <button class="btn-action copy" title="Copy"><span>Copy</span></button>
          <button class="btn-action read" title="Read"><span>Read</span></button>
          <button class="btn-action edit" title="Edit"><span>Edit</span></button>
          <button class="btn-action delete" title="Delete"><span>Delete</span></button>
        </div>
      `;let s=e.querySelector(".gallery-preview"),r=e.querySelector(".btn-action.copy"),c=e.querySelector(".btn-action.read"),h=e.querySelector(".btn-action.edit"),u=e.querySelector(".btn-action.delete");return r.addEventListener("click",async l=>{l.stopPropagation();try{await navigator.clipboard.writeText(t.content||"");let m=r.querySelector("span");m.textContent="\u2713",r.classList.add("success"),setTimeout(()=>{m.textContent="Copy",r.classList.remove("success")},1500)}catch(m){console.error("Gallery copy failed",m)}}),c.addEventListener("click",l=>{l.stopPropagation(),this.openReadModal(t)}),h.addEventListener("click",l=>{l.stopPropagation(),this.openEditModal(t)}),u.addEventListener("click",async l=>{l.stopPropagation(),confirm("Delete this saved item?")&&(await this.deleteItem(t),e.remove())}),e.addEventListener("click",l=>{l.target.closest(".btn-action")||this.openReadModal(t)}),e},openReadModal(t){let e=document.createElement("div");e.className="gallery-modal",e.innerHTML=`
        <div class="gallery-modal-overlay"></div>
        <div class="gallery-modal-content">
          <div class="gallery-modal-header">
            <div>
              <h3>${this.escapeHtml(t.title||"Post")}</h3>
              <span class="modal-meta">${this.formatDate(t.updatedAt||t.timestamp)} \u2022 ${this.getAccurateCharacterCount(t.content||"")} chars</span>
            </div>
            <button class="modal-close" aria-label="Close">\xD7</button>
          </div>
          <div class="gallery-modal-body">
            <div class="modal-text">${this.escapeHtml(t.content||"").replace(/\n/g,"<br>")}</div>
          </div>
          <div class="gallery-modal-footer">
            <button class="modal-btn copy">Copy</button>
            <button class="modal-btn edit">Edit</button>
          </div>
        </div>
      `,document.body.appendChild(e);let n=()=>e.remove();e.querySelector(".modal-close").addEventListener("click",n),e.querySelector(".gallery-modal-overlay").addEventListener("click",n),e.querySelector(".modal-btn.copy").addEventListener("click",async()=>{await navigator.clipboard.writeText(t.content||"");let o=e.querySelector(".modal-btn.copy");o.textContent="Copied!",setTimeout(()=>o.textContent="Copy",1500)}),e.querySelector(".modal-btn.edit").addEventListener("click",()=>{n(),this.openEditModal(t)});let a=o=>{o.key==="Escape"&&(n(),document.removeEventListener("keydown",a))};document.addEventListener("keydown",a)},openEditModal(t){let e=document.createElement("div");e.className="gallery-modal",e.innerHTML=`
        <div class="gallery-modal-overlay"></div>
        <div class="gallery-modal-content">
          <div class="gallery-modal-header">
            <div>
              <h3>Edit: ${this.escapeHtml(t.title||"Post")}</h3>
              <span class="modal-meta">Editing mode</span>
            </div>
            <button class="modal-close" aria-label="Close">\xD7</button>
          </div>
          <div class="gallery-modal-body">
            <textarea class="modal-textarea" placeholder="Edit your content...">${this.escapeHtml(t.content||"")}</textarea>
          </div>
          <div class="gallery-modal-footer">
            <button class="modal-btn cancel">Cancel</button>
            <button class="modal-btn save primary">Save Changes</button>
          </div>
        </div>
      `,document.body.appendChild(e);let n=e.querySelector(".modal-textarea"),a=()=>e.remove();e.querySelector(".modal-close").addEventListener("click",a),e.querySelector(".gallery-modal-overlay").addEventListener("click",a),e.querySelector(".modal-btn.cancel").addEventListener("click",a),e.querySelector(".modal-btn.save").addEventListener("click",async()=>{let o={content:n.value,updatedAt:Date.now(),charCountAccurate:this.getAccurateCharacterCount(n.value)};await this.updateItem(t,o),a();let i=document.querySelector("#gallery-view");i&&this.render(i)}),n.focus()},async updateItem(t,e){let n=await TabTalkStorage.getSavedContent(),a=t._category||"twitter";if(!Array.isArray(n[a]))return;let o=n[a].findIndex(i=>i.id===t.id);o!==-1&&(n[a][o]={...n[a][o],...e},await TabTalkStorage.setStorageItem("savedContent",n))},async deleteItem(t){let e=t._category||"twitter";await TabTalkStorage.deleteSavedContent(e,t.id)},debounce(t,e){let n;return(...a)=>{clearTimeout(n),n=setTimeout(()=>t.apply(this,a),e)}},getAccurateCharacterCount(t){if(!t)return 0;let e=String(t).trim(),n=0,a=Array.from(e);for(let o of a){let i=o.codePointAt(0),s=i>=126976&&i<=129535||i>=9728&&i<=9983||i>=9984&&i<=10175||i>=128512&&i<=128591||i>=127744&&i<=128511||i>=128640&&i<=128767||i>=127456&&i<=127487||i>=8205;n+=s?2:1}return n},escapeHtml(t){return String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")},formatDate(t){if(!t)return"";try{return new Date(t).toLocaleString()}catch{return""}}};window.galleryManager=d})();(function(){let d={async validateApiKey(t){if(!t||typeof t!="string"||t.trim().length===0)return{success:!1,error:"API key is required"};let e=t.trim().replace(/\s+/g,"");if(!e.startsWith("AIza"))return{success:!1,error:'Invalid API key format. Gemini API keys should start with "AIza"'};if(e.length<30)return{success:!1,error:"API key appears too short. Please check and try again."};try{return await chrome.runtime.sendMessage({action:"validateApiKey",apiKey:e})}catch(n){return console.error("Validation request failed:",n),{success:!1,error:"Failed to validate API key. Please try again."}}},async handleTestApiKey(t,e){let n=e.value.trim(),a=t.textContent;if(!n){t.textContent="Enter Key",t.style.backgroundColor="#f59e0b",setTimeout(()=>{t.textContent=a,t.style.backgroundColor=""},2e3);return}t.disabled=!0,t.textContent="Testing...";try{let o=await this.validateApiKey(n);o.success?(t.textContent="\u2713 Valid",t.style.backgroundColor="#10b981",setTimeout(()=>{t.textContent=a,t.style.backgroundColor="",t.disabled=!1},2e3)):(t.textContent="\u2717 Invalid",t.style.backgroundColor="#ef4444",console.error(`API Key validation failed: ${o.error}`),setTimeout(()=>{t.textContent=a,t.style.backgroundColor="",t.disabled=!1},3e3))}catch(o){t.textContent="Error",t.style.backgroundColor="#ef4444",console.error("An error occurred while validating the API key:",o),setTimeout(()=>{t.textContent=a,t.style.backgroundColor="",t.disabled=!1},3e3)}},async handleSaveApiKey(t,e,n){let a=e.value.trim();if(!a){t.textContent="Enter Key",t.style.backgroundColor="#f59e0b";let i=t.textContent;setTimeout(()=>{t.textContent="Save",t.style.backgroundColor=""},2e3);return}t.disabled=!0;let o=t.textContent;t.textContent="Validating...";try{let i=await this.validateApiKey(a);i.success?(await this.saveApiKey(a),t.textContent="\u2713 Saved",t.style.backgroundColor="#10b981",n&&n(),setTimeout(()=>{t.textContent=o,t.style.backgroundColor="",t.disabled=!1},2e3)):(t.textContent="\u2717 Failed",t.style.backgroundColor="#ef4444",console.error(`API Key validation failed: ${i.error}`),setTimeout(()=>{t.textContent=o,t.style.backgroundColor="",t.disabled=!1},3e3))}catch(i){t.textContent="Error",t.style.backgroundColor="#ef4444",console.error("An error occurred while saving the API key:",i),setTimeout(()=>{t.textContent=o,t.style.backgroundColor="",t.disabled=!1},3e3)}},async saveApiKey(t){let e=t.trim().replace(/\s+/g,"");window.TabTalkStorage&&window.TabTalkStorage.saveApiKey?await window.TabTalkStorage.saveApiKey(e):await chrome.storage.local.set({geminiApiKey:e,apiKey:e,hasSeenWelcome:!0})}};window.TabTalkValidation=d})();(function(){function d(){let t=document.getElementById("test-api-key"),e=document.getElementById("onboarding-api-key");if(t&&e&&window.TabTalkValidation){let o=t.cloneNode(!0);t.parentNode.replaceChild(o,t),o.addEventListener("click",async function(){await window.TabTalkValidation.handleTestApiKey(o,e);let i=document.getElementById("api-setup-continue");i&&o.textContent==="\u2713 Valid"&&(i.disabled=!1)})}let n=document.getElementById("settings-save-button"),a=document.getElementById("api-key-input");if(n&&a&&window.TabTalkValidation){let o=n.cloneNode(!0);n.parentNode.replaceChild(o,n),o.addEventListener("click",async function(i){i.preventDefault(),i.stopPropagation(),i.stopImmediatePropagation(),await window.TabTalkValidation.handleSaveApiKey(o,a,function(){window.TabTalkNavigation&&window.TabTalkNavigation.showView&&window.TabTalkNavigation.showView("chat")})})}e&&e.addEventListener("input",function(){let o=document.getElementById("api-setup-continue");o&&(o.disabled=!this.value.trim())})}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",d):d(),setTimeout(d,100)})();(function(){let d={toneDefinitions:{supportive:{id:"supportive",name:"Supportive with Facts",icon:"\u{1F91D}",color:"var(--accent-color)",category:"positive",description:"Highlight strengths, build confidence",example:"This is brilliant because...",aiInstructions:`TONE: Supportive with Facts
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
- Make change feel achievable`,keywords:["action-oriented","motivating","empowering","practical","inspiring"]}},customTones:[],sessionCache:{lastSelectedTone:null,customCombinations:[]},init:function(){this.loadCustomTones(),this.createModalHTML(),this.bindModalEvents()},loadCustomTones:async function(){try{let t=await chrome.storage.local.get("customTones");t.customTones&&(this.customTones=t.customTones)}catch(t){console.error("Error loading custom tones:",t)}},saveCustomTones:async function(){try{await chrome.storage.local.set({customTones:this.customTones})}catch(t){console.error("Error saving custom tones:",t)}},createModalHTML:function(){let t=`
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
      `;document.getElementById("tone-selector-modal")||document.body.insertAdjacentHTML("beforeend",t)},renderToneGrid:function(){return Object.values(this.toneDefinitions).map(t=>`
        <div class="tone-option" 
             data-tone-id="${t.id}" 
             data-category="${t.category}"
             role="radio"
             aria-checked="false"
             tabindex="0">
          <div class="tone-icon">${t.icon}</div>
          <div class="tone-info">
            <div class="tone-name">${t.name}</div>
            <div class="tone-description">${t.description}</div>
          </div>
          <div class="tone-check">\u2713</div>
        </div>
      `).join("")},renderToneOptions:function(){return Object.values(this.toneDefinitions).map(t=>`<option value="${t.id}">${t.icon} ${t.name}</option>`).join("")},bindModalEvents:function(){let t=document.getElementById("tone-selector-modal");if(!t)return;t.querySelector(".tone-modal-close")?.addEventListener("click",()=>this.hideModal()),t.querySelector(".tone-modal-overlay")?.addEventListener("click",()=>this.hideModal()),document.getElementById("tone-cancel-btn")?.addEventListener("click",()=>this.hideModal()),t.querySelectorAll(".tone-option").forEach(l=>{l.addEventListener("click",()=>this.selectTone(l)),l.addEventListener("keydown",m=>{(m.key==="Enter"||m.key===" ")&&(m.preventDefault(),this.selectTone(l))})}),document.getElementById("tone-generate-btn")?.addEventListener("click",()=>this.handleGenerate()),document.getElementById("toggle-custom-builder")?.addEventListener("click",()=>this.toggleCustomBuilder());let r=document.getElementById("custom-tone-1"),c=document.getElementById("custom-tone-2");r?.addEventListener("change",()=>this.updateCustomPreview()),c?.addEventListener("change",()=>this.updateCustomPreview()),document.getElementById("save-custom-tone")?.addEventListener("click",()=>this.saveCustomCombination()),document.getElementById("use-custom-tone")?.addEventListener("click",()=>this.useCustomCombination()),t.addEventListener("keydown",l=>{l.key==="Escape"&&this.hideModal()})},showModal:async function(t,e){let n=document.getElementById("tone-selector-modal");if(!n)return;this.currentPlatform=t,this.currentPageContent=e,n.classList.remove("hidden"),n.setAttribute("aria-hidden","false"),n.querySelector(".tone-option")?.focus(),await this.generateRecommendations(e),this.renderSavedCustomTones()},hideModal:function(){let t=document.getElementById("tone-selector-modal");t&&(t.classList.add("hidden"),t.setAttribute("aria-hidden","true"),this.resetSelections())},selectTone:function(t){document.querySelectorAll(".tone-option").forEach(a=>{a.classList.remove("selected"),a.setAttribute("aria-checked","false")}),t.classList.add("selected"),t.setAttribute("aria-checked","true"),this.selectedToneId=t.dataset.toneId,this.selectedTone=this.toneDefinitions[this.selectedToneId];let n=document.getElementById("tone-generate-btn");n&&(n.disabled=!1),this.sessionCache.lastSelectedTone=this.selectedToneId},generateRecommendations:async function(t){let e=document.getElementById("tone-recommendations"),n=document.getElementById("recommended-tones");if(!(!e||!n))try{e.classList.remove("hidden"),n.innerHTML='<div class="recommendations-loading">Analyzing content...</div>';let a=await this.analyzeContentForTones(t);a.length>0?(n.innerHTML=a.map(i=>`
            <div class="recommended-tone" data-tone-id="${i.toneId}">
              <div class="rec-badge">Recommended</div>
              <div class="rec-tone-icon" style="color: ${i.color}">${i.icon}</div>
              <div class="rec-tone-info">
                <div class="rec-tone-name">${i.name}</div>
                <div class="rec-reason">${i.reason}</div>
                <div class="rec-confidence">Match: ${i.confidence}%</div>
              </div>
            </div>
          `).join(""),n.querySelectorAll(".recommended-tone").forEach(i=>{i.addEventListener("click",()=>{let s=i.dataset.toneId,r=document.querySelector(`.tone-option[data-tone-id="${s}"]`);r&&(this.selectTone(r),r.scrollIntoView({behavior:"smooth",block:"center"}))})})):n.innerHTML='<div class="no-recommendations">All tones work well for this content!</div>'}catch(a){console.error("Error generating recommendations:",a),n.innerHTML='<div class="recommendations-error">Could not analyze content</div>'}},analyzeContentForTones:async function(t){let e=t.toLowerCase(),n=[],a=/controversy|debate|disagree|conflict|dispute/i.test(t),o=/data|statistics|study|research|evidence|percent|number/i.test(t),i=/claim|assert|state|argue|maintain/i.test(t),s=/success|achievement|breakthrough|innovation|progress/i.test(t),r=/problem|issue|concern|risk|danger|failure/i.test(t),c=/funny|joke|ironic|amusing|hilarious/i.test(t),h=/future|upcoming|next|will|plan|forecast/i.test(t),u=/warning|caution|beware|careful|risk/i.test(t),l=t.length,m=t.split(/\s+/).length;return a&&o&&n.push({toneId:"critical",...this.toneDefinitions.critical,reason:"Content contains controversial claims with data - perfect for evidence-based critique",confidence:92}),i&&!o&&n.push({toneId:"anti-propaganda",...this.toneDefinitions["anti-propaganda"],reason:"Multiple claims detected without strong evidence - ideal for fact-checking",confidence:88}),s&&o&&n.push({toneId:"supportive",...this.toneDefinitions.supportive,reason:"Positive developments backed by data - great for supportive commentary",confidence:90}),a&&c&&n.push({toneId:"trolling",...this.toneDefinitions.trolling,reason:"Controversial topic with humorous elements - perfect for playful fact-based trolling",confidence:85}),r&&!a&&n.push({toneId:"critical-humor",...this.toneDefinitions["critical-humor"],reason:"Issues present without heated debate - ideal for witty critique",confidence:83}),h&&s&&n.push({toneId:"optimistic",...this.toneDefinitions.optimistic,reason:"Forward-looking content with positive outlook - great for optimistic framing",confidence:87}),(u||r&&o)&&n.push({toneId:"cautionary",...this.toneDefinitions.cautionary,reason:"Risks or concerns identified - suitable for cautionary perspective",confidence:84}),o&&l>2e3&&n.push({toneId:"investigative",...this.toneDefinitions.investigative,reason:"Substantial content with data - perfect for deep investigative analysis",confidence:86}),s&&m<500&&n.push({toneId:"empowering",...this.toneDefinitions.empowering,reason:"Concise positive content - ideal for empowering call-to-action",confidence:81}),n.sort((p,y)=>y.confidence-p.confidence).slice(0,3)},toggleCustomBuilder:function(){let t=document.getElementById("custom-tone-builder"),e=document.getElementById("toggle-custom-builder"),n=e?.querySelector(".toggle-arrow");if(t&&e){let a=t.classList.contains("hidden");t.classList.toggle("hidden"),n&&(n.textContent=a?"\u25B2":"\u25BC")}},updateCustomPreview:function(){let t=document.getElementById("custom-tone-1"),e=document.getElementById("custom-tone-2"),n=document.getElementById("custom-tone-preview"),a=document.querySelector(".builder-preview"),o=document.getElementById("save-custom-tone"),i=document.getElementById("use-custom-tone");if(!t||!e||!n)return;let s=t.value,r=e.value;if(s&&r&&s!==r){let c=this.toneDefinitions[s],h=this.toneDefinitions[r];n.innerHTML=`
          <div class="preview-tones">
            <span class="preview-tone" style="color: ${c.color}">
              ${c.icon} ${c.name}
            </span>
            <span class="preview-plus">+</span>
            <span class="preview-tone" style="color: ${h.color}">
              ${h.icon} ${h.name}
            </span>
          </div>
          <div class="preview-description">
            ${this.generateCombinedDescription(c,h)}
          </div>
        `,a?.classList.remove("hidden"),o&&(o.disabled=!1),i&&(i.disabled=!1)}else a?.classList.add("hidden"),o&&(o.disabled=!0),i&&(i.disabled=!0)},generateCombinedDescription:function(t,e){return`Combines ${t.name.toLowerCase()} with ${e.name.toLowerCase()} for a unique perspective that ${t.description.toLowerCase()} while ${e.description.toLowerCase()}.`},saveCustomCombination:async function(){let t=document.getElementById("custom-tone-1"),e=document.getElementById("custom-tone-2");if(!t||!e)return;let n=t.value,a=e.value;if(!n||!a||n===a)return;let o={id:`custom-${Date.now()}`,tone1Id:n,tone2Id:a,name:`${this.toneDefinitions[n].name} + ${this.toneDefinitions[a].name}`,createdAt:Date.now()};this.customTones.push(o),await this.saveCustomTones(),this.renderSavedCustomTones(),this.showToast("\u2713 Custom tone saved!")},useCustomCombination:function(){let t=document.getElementById("custom-tone-1"),e=document.getElementById("custom-tone-2");if(!t||!e)return;let n=t.value,a=e.value;if(!n||!a||n===a)return;this.selectedToneId="custom",this.selectedTone={id:"custom",name:`${this.toneDefinitions[n].name} + ${this.toneDefinitions[a].name}`,tone1:this.toneDefinitions[n],tone2:this.toneDefinitions[a],aiInstructions:this.combineAIInstructions(this.toneDefinitions[n],this.toneDefinitions[a])};let o=document.getElementById("tone-generate-btn");o&&(o.disabled=!1),this.showToast("\u2713 Custom tone selected!")},combineAIInstructions:function(t,e){return`COMBINED TONE: ${t.name} + ${e.name}

PRIMARY TONE (${t.name}):
${t.aiInstructions}

SECONDARY TONE (${e.name}):
${e.aiInstructions}

INTEGRATION RULES:
- Lead with the primary tone's approach
- Weave in secondary tone's characteristics naturally
- Balance both perspectives throughout
- Ensure cohesive voice, not jarring shifts
- Maintain factual accuracy from both tones`},renderSavedCustomTones:function(){let t=document.getElementById("saved-custom-tones");if(!t)return;if(this.customTones.length===0){t.classList.add("hidden");return}t.classList.remove("hidden"),t.innerHTML=`
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
      `,t.querySelectorAll(".saved-custom-tone").forEach(a=>{a.addEventListener("click",o=>{o.target.classList.contains("saved-tone-delete")||this.selectSavedCustomTone(a.dataset.customId)})}),t.querySelectorAll(".saved-tone-delete").forEach(a=>{a.addEventListener("click",o=>{o.stopPropagation(),this.deleteCustomTone(a.dataset.customId)})})},selectSavedCustomTone:function(t){let e=this.customTones.find(i=>i.id===t);if(!e)return;let n=this.toneDefinitions[e.tone1Id],a=this.toneDefinitions[e.tone2Id];this.selectedToneId="custom",this.selectedTone={id:"custom",name:e.name,tone1:n,tone2:a,aiInstructions:this.combineAIInstructions(n,a)};let o=document.getElementById("tone-generate-btn");o&&(o.disabled=!1),this.showToast("\u2713 Custom tone selected!")},deleteCustomTone:async function(t){this.customTones=this.customTones.filter(e=>e.id!==t),await this.saveCustomTones(),this.renderSavedCustomTones(),this.showToast("Custom tone deleted")},handleGenerate:function(){this.selectedTone&&(this.onGenerateCallback&&this.onGenerateCallback(this.selectedTone,this.currentPlatform),this.hideModal())},resetSelections:function(){document.querySelectorAll(".tone-option").forEach(n=>{n.classList.remove("selected"),n.setAttribute("aria-checked","false")}),this.selectedToneId=null,this.selectedTone=null;let e=document.getElementById("tone-generate-btn");e&&(e.disabled=!0)},showToast:function(t){let e=document.createElement("div");e.className="tone-toast",e.textContent=t,e.style.cssText=`
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
      `,document.body.appendChild(e),setTimeout(()=>{e.style.animation="slideOutDown 0.3s ease",setTimeout(()=>e.remove(),300)},2e3)},show:function(t,e,n){this.onGenerateCallback=n,this.showModal(t,e)}};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>d.init()):d.init(),window.TabTalkToneSelector=d})();(function(){let d={currentView:"chat",init(){this.bindEvents(),this.updateActiveState("chat")},bindEvents(){document.querySelectorAll(".nav-item").forEach(e=>{e.addEventListener("click",n=>{n.preventDefault();let a=e.getAttribute("data-view");this.navigateToView(a)})})},navigateToView(t){window.TabTalkNavigation&&window.TabTalkNavigation.showView&&window.TabTalkNavigation.showView(t),this.updateActiveState(t),this.currentView=t},updateActiveState(t){document.querySelectorAll(".nav-item").forEach(n=>{n.getAttribute("data-view")===t?n.classList.add("active"):n.classList.remove("active")})},toggleVisibility(t){let e=document.getElementById("bottom-nav");e&&(e.style.display=t?"flex":"none")},setActive(t){this.updateActiveState(t),this.currentView=t}};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>d.init()):d.init(),window.BottomNav=d})();(function(){let d={selectedPersona:"educator",selectedFormat:"myth-busting",currentTopic:"",selectedHook:"",generatedThread:null,personas:{educator:{name:"Educator",emoji:"\u{1F393}",instructions:"Write as a patient teacher who breaks down complex topics into simple, digestible lessons. Use clear examples and encouraging language. Focus on helping the reader understand and grow. Include educational moments and learning takeaways.",hookDensity:"medium",sentenceLength:"medium",verbStyle:"explanatory",ctaStyle:"learning-focused"},operator:{name:"Operator",emoji:"\u2699\uFE0F",instructions:"Write as a practical builder who focuses on execution and results. Use direct, no-nonsense language. Emphasize systems, processes, and measurable outcomes. Include actionable steps and implementation details.",hookDensity:"low",sentenceLength:"short",verbStyle:"action-oriented",ctaStyle:"implementation-focused"},analyst:{name:"Analyst",emoji:"\u{1F4CA}",instructions:"Write as a data-driven expert who backs claims with evidence and logical reasoning. Use precise language and structured arguments. Include statistics, trends, and analytical insights. Maintain objectivity and credibility.",hookDensity:"medium",sentenceLength:"long",verbStyle:"analytical",ctaStyle:"insight-focused"},entertainer:{name:"Entertainer",emoji:"\u{1F3AD}",instructions:"Write as an engaging storyteller who captivates with humor, drama, and personality. Use vivid language, emotional appeal, and entertaining anecdotes. Include surprising twists and memorable moments.",hookDensity:"high",sentenceLength:"varied",verbStyle:"expressive",ctaStyle:"engagement-focused"},visionary:{name:"Visionary",emoji:"\u{1F52E}",instructions:"Write as a forward-thinking leader who paints pictures of what is possible. Use inspiring, future-focused language. Emphasize transformation, innovation, and paradigm shifts. Include bold predictions and visionary insights.",hookDensity:"high",sentenceLength:"long",verbStyle:"transformational",ctaStyle:"future-focused"},storyteller:{name:"Storyteller",emoji:"\u{1F4DA}",instructions:"Write as a master storyteller who weaves narratives that teach and inspire. Use classic story structures, character development, and narrative arcs. Include personal anecdotes, metaphors, and story-driven examples.",hookDensity:"medium",sentenceLength:"varied",verbStyle:"narrative",ctaStyle:"story-focused"},scientist:{name:"Scientist",emoji:"\u{1F52C}",instructions:"Write as a rigorous researcher who explores topics through scientific inquiry. Use precise, evidence-based language. Emphasize hypotheses, experiments, and data-driven conclusions. Include scientific method and logical reasoning.",hookDensity:"low",sentenceLength:"complex",verbStyle:"investigative",ctaStyle:"research-focused"},philosopher:{name:"Philosopher",emoji:"\u{1F914}",instructions:"Write as a deep thinker who explores fundamental questions and meanings. Use thoughtful, reflective language. Emphasize principles, ethics, and deeper truths. Include philosophical frameworks and wisdom insights.",hookDensity:"low",sentenceLength:"complex",verbStyle:"reflective",ctaStyle:"wisdom-focused"}},formats:{"myth-busting":{name:"Myth\u2011busting",emoji:"\u{1F9F1}",skeleton:"Hook (challenge common belief) \u2192 Why it is wrong \u2192 Evidence (3 bullet points) \u2192 What to do instead (steps) \u2192 CTA"},"status-shift":{name:"Status Shift",emoji:"\u26A1",skeleton:"Hook (unexpected realization) \u2192 Before vs After snapshot \u2192 Process (3-5 steps) \u2192 Proof \u2192 CTA"},"cheat-code":{name:"Cheat Code",emoji:"\u{1F3AE}",skeleton:"Hook (fast result promise) \u2192 Steps (ordered) \u2192 Common pitfalls \u2192 Bonus tip \u2192 CTA"},analogy:{name:"Analogy",emoji:"\u{1F517}",skeleton:"Hook (analogy) \u2192 Map analogy \u2192 Apply to topic \u2192 Example \u2192 CTA"},pain:{name:"Pain Point",emoji:"\u{1F4A1}",skeleton:"Hook (identify pain) \u2192 Amplify why it matters \u2192 Root cause \u2192 Solution steps \u2192 Transformation \u2192 CTA"},story:{name:"Story",emoji:"\u{1F4D6}",skeleton:"Hook (story opening) \u2192 Challenge faced \u2192 Journey/process \u2192 Resolution/lesson \u2192 Application for reader \u2192 CTA"},data:{name:"Data Driven",emoji:"\u{1F4CA}",skeleton:"Hook (surprising stat) \u2192 Context behind the data \u2192 Implications \u2192 What it means for reader \u2192 Action steps \u2192 CTA"},framework:{name:"Framework",emoji:"\u{1F3D7}\uFE0F",skeleton:"Hook (mental model) \u2192 Explain framework components \u2192 How to apply \u2192 Examples \u2192 Benefits \u2192 CTA"},future:{name:"Future Focus",emoji:"\u{1F52E}",skeleton:"Hook (future prediction) \u2192 Current trends \u2192 Timeline \u2192 What to prepare \u2192 First steps \u2192 CTA"},practical:{name:"Practical",emoji:"\u2699\uFE0F",skeleton:"Hook (practical problem) \u2192 Quick solution \u2192 Step-by-step guide \u2192 Pro tips \u2192 Results \u2192 CTA"},controversial:{name:"Controversial",emoji:"\u{1F525}",skeleton:"Hook (controversial take) \u2192 Why people disagree \u2192 Your evidence \u2192 Counterarguments \u2192 Strong conclusion \u2192 CTA"},inspirational:{name:"Inspirational",emoji:"\u2728",skeleton:"Hook (uplifting vision) \u2192 Current reality \u2192 Possibility \u2192 Motivational examples \u2192 Call to greatness \u2192 CTA"},"step-by-step":{name:"Step\u2011by\u2011Step",emoji:"\u{1F4DD}",skeleton:"Hook (process promise) \u2192 Why this process \u2192 Step 1 \u2192 Step 2 \u2192 Step 3 \u2192 Common mistakes \u2192 Success tips \u2192 CTA"},comparison:{name:"Comparison",emoji:"\u2696\uFE0F",skeleton:"Hook (comparison setup) \u2192 Option A analysis \u2192 Option B analysis \u2192 Decision criteria \u2192 Recommendation \u2192 CTA"},"case-study":{name:"Case Study",emoji:"\u{1F4CB}",skeleton:"Hook (intriguing result) \u2192 Background \u2192 Challenge \u2192 Solution \u2192 Measurable results \u2192 Lessons \u2192 CTA"},trend:{name:"Trend Alert",emoji:"\u{1F4C8}",skeleton:"Hook (trend observation) \u2192 Evidence it is growing \u2192 Why it matters \u2192 How to leverage \u2192 Timeline \u2192 CTA"},"myth-busting-plus":{name:"Myth+",emoji:"\u{1F9F1}",skeleton:"Hook (bold myth claim) \u2192 Multiple myths busted \u2192 Deeper truth revealed \u2192 System-level change \u2192 New paradigm \u2192 CTA"},"quick-win":{name:"Quick Win",emoji:"\u{1F3C6}",skeleton:"Hook (immediate result) \u2192 Simple action \u2192 Quick proof \u2192 Scaling tip \u2192 Long-term benefit \u2192 CTA"},"deep-dive":{name:"Deep Dive",emoji:"\u{1F93F}",skeleton:"Hook (complex question) \u2192 Surface-level answer \u2192 Deeper layers \u2192 Expert insight \u2192 Nuanced conclusion \u2192 CTA"},checklist:{name:"Checklist",emoji:"\u2705",skeleton:"Hook (checklist promise) \u2192 Overview \u2192 Item 1 with details \u2192 Item 2 \u2192 Item 3 \u2192 Implementation tips \u2192 CTA"}},hookPatterns:[{type:"AIDA Attention",template:"What if I told you that [topic] could change everything?"},{type:"AIDA Interest",template:"The hidden truth about [topic] that nobody is talking about."},{type:"AIDA Desire",template:"Imagine mastering [topic] in half the time it takes everyone else."},{type:"AIDA Action",template:"Here is exactly how you can start with [topic] right now."},{type:"PAS Problem",template:"[Topic] is failing for 90% of people. Here is why."},{type:"PAS Agitate",template:"Every time you struggle with [topic], you are making this one mistake."},{type:"PAS Solution",template:"I finally cracked the code for [topic]. This changes everything."},{type:"Status Shift",template:"Everything you know about [topic] is about to become obsolete."},{type:"Status Shift",template:"The old rules of [topic] no longer apply. Here are the new ones."},{type:"Status Shift",template:"Why experts are wrong about [topic] and what actually works."}],init(){this.bindEvents(),this.loadStoredPreferences()},bindEvents(){let t=document.getElementById("generate-thread-btn");t&&t.addEventListener("click",()=>this.generateThread()),document.addEventListener("click",i=>{i.target.closest(".persona-chip")&&this.selectPersona(i.target.closest(".persona-chip").dataset.persona),i.target.closest(".format-chip")&&this.selectFormat(i.target.closest(".format-chip").dataset.format),i.target.closest(".hook-item")&&this.selectHook(i.target.closest(".hook-item").dataset.hook)});let e=document.getElementById("generate-hooks-btn"),n=document.getElementById("generate-hooks-btn-modal");e&&e.addEventListener("click",()=>this.generateHooks()),n&&n.addEventListener("click",()=>this.generateHooks("modal"));let a=document.getElementById("trend-fusion-btn"),o=document.getElementById("trend-fusion-btn-modal");a&&a.addEventListener("click",()=>this.generateTrendFusion()),o&&o.addEventListener("click",()=>this.generateTrendFusion("modal"))},showEnhancedModal(){},hideModal(){},selectPersona(t){this.selectedPersona=t,document.querySelectorAll(".persona-chip").forEach(e=>{e.classList.toggle("active",e.dataset.persona===t)}),this.savePreferences()},selectFormat(t){this.selectedFormat=t,document.querySelectorAll(".format-chip").forEach(e=>{e.classList.toggle("active",e.dataset.format===t)}),this.savePreferences()},selectHook(t){this.selectedHook=t,document.querySelectorAll(".hook-item").forEach(e=>{e.classList.toggle("selected",e.dataset.hook===t)})},async generateHooks(t="view"){let e=t==="modal"?"thread-topic-modal":"thread-topic",n=document.getElementById(e);if(this.currentTopic=n?n.value.trim():"",!this.currentTopic){this.showToast("Enter a topic first",2e3);return}let a=t==="modal"?"generate-hooks-btn-modal":"generate-hooks-btn",o=document.getElementById(a),i=o.textContent;o.textContent="\u23F3 Generating...",o.disabled=!0;try{let s=await this.callGeminiAPI(this.buildHooksPrompt());this.displayHooks(s,t)}catch(s){console.error("Hook generation failed:",s),this.showToast("Failed to generate hooks",3e3)}finally{o.textContent=i,o.disabled=!1}},async generateTrendFusion(t="view"){let e=t==="modal"?"thread-topic-modal":"thread-topic",n=document.getElementById(e);if(this.currentTopic=n?n.value.trim():"",!this.currentTopic){this.showToast("Enter a topic first",2e3);return}let a=t==="modal"?"trend-fusion-btn-modal":"trend-fusion-btn",o=document.getElementById(a),i=o.textContent;o.textContent="\u23F3 Generating...",o.disabled=!0;try{let s=await this.callGeminiAPI(this.buildTrendFusionPrompt());this.displayTrendFusion(s,t)}catch(s){console.error("Trend fusion failed:",s),this.showToast("Failed to generate trend fusion",3e3)}finally{o.textContent=i,o.disabled=!1}},async generateThread(){let t=document.getElementById("thread-topic");if(this.currentTopic=t.value.trim(),!this.currentTopic){this.showToast("Enter a topic first",2e3);return}let e=document.getElementById("generate-thread-btn"),n=e.textContent;e.textContent="\u23F3 Generating...",e.disabled=!0;try{let a=await this.callGeminiAPI(this.buildThreadPrompt());this.generatedThread=a,this.displayThreadResult(a),this.saveToGallery(a,this.currentTopic,this.selectedFormat)}catch(a){console.error("Thread generation failed:",a),this.showToast("Failed to generate thread",3e3)}finally{e.textContent=n,e.disabled=!1}},buildHooksPrompt(){let t=this.personas[this.selectedPersona];return`Generate 10 powerful hooks for "${this.currentTopic}" using these frameworks:

${this.hookPatterns.map((e,n)=>`${n+1}. ${e.type}: ${e.template.replace("[topic]",this.currentTopic)}`).join(`
`)}

INSTRUCTIONS:
- Use the ${t.name} persona: ${t.instructions}
- Make each hook compelling and unique
- Keep hooks under 280 characters
- No hashtags or URLs
- Return as a numbered list`},buildTrendFusionPrompt(){let t=this.personas[this.selectedPersona];return`Create an evergreen + trend fusion hook for "${this.currentTopic}".

STRUCTURE: "Why [trend] matters for [evergreen topic] over next 6 months"

REQUIREMENTS:
- Use the ${t.name} persona: ${t.instructions}
- Connect a current trend to the evergreen topic
- Make it urgent and relevant
- Under 280 characters
- No hashtags or URLs

Example: "Why AI automation matters for content creators over next 6 months"

Generate 3 options, pick the best one.`},buildThreadPrompt(){let t=this.personas[this.selectedPersona],e=this.formats[this.selectedFormat],n=`Create a Twitter thread about "${this.currentTopic}" using the ${e.name} framework.

PERSONA: ${t.name}
${t.instructions}

FORMAT STRUCTURE: ${e.skeleton}

THREAD REQUIREMENTS:
- 8-15 tweets max
- Start each tweet with: 1/n:, 2/n:, etc.
- Use natural emojis (2-4 per thread)
- No hashtags, no URLs, no source mentions
- Write as ${t.name}: adjust sentence length, hooks, and CTAs accordingly

TOPIC: ${this.currentTopic}`;return this.selectedHook&&(n+=`

STARTING HOOK: Begin the first tweet with exactly: "${this.selectedHook}"`),n+=`

Generate the complete thread now:`,n},displayHooks(t,e="view"){let n=e==="modal"?"hooks-container-modal":"hooks-container",a=document.getElementById(n);if(!a)return;let o=this.parseHookList(t);a.innerHTML=o.map((i,s)=>`
        <div class="hook-item" data-hook="${i.text}">
          <div class="hook-text">${i.text}</div>
          <div class="hook-type">${i.type}</div>
        </div>
      `).join(""),a.classList.remove("hidden")},displayTrendFusion(t,e="view"){let n=e==="modal"?"trend-result-modal":"trend-result",a=document.getElementById(n);if(!a)return;let i=t.split(`
`).find(s=>s.includes("Why")&&s.includes("matters")&&s.includes("over next 6 months"))||t.trim();a.textContent=i,a.classList.remove("hidden")},parseHookList(t){let e=t.split(`
`),n=[];for(let a=0;a<e.length;a++){let i=e[a].trim().match(/^\d+\.\s*(.+)$/);if(i){let s=this.hookPatterns[Math.min(a,this.hookPatterns.length-1)].type;n.push({text:i[1],type:s})}}return n.length===0?this.hookPatterns.slice(0,10).map(a=>({text:a.template.replace("[topic]",this.currentTopic),type:a.type})):n.slice(0,10)},displayThreadResult(t){window.TabTalkUI&&window.TabTalkUI.showView("chat");let e={type:"thread",content:t,title:this.currentTopic,timestamp:new Date().toISOString(),tags:[this.selectedFormat,this.selectedPersona]},n=document.getElementById("messages-container");if(n&&window.TabTalkUI&&window.TabTalkUI.renderCard){let a=window.TabTalkUI.renderCard(e);n.appendChild(a)}},async callGeminiAPI(t){if(!window.TabTalkAPI?.callGeminiAPI)throw new Error("API not available");return await window.TabTalkAPI.callGeminiAPI(t)},saveToGallery(t,e,n){if(!window.TabTalkGallery)return;let a={id:Date.now().toString(),title:e,content:t,timestamp:new Date().toISOString(),tags:[n,this.selectedPersona],platform:"thread"};window.TabTalkGallery.saveContent(a)},loadStoredPreferences(){chrome.storage.local.get(["enhancedPersona","enhancedFormat"],t=>{t.enhancedPersona&&this.selectPersona(t.enhancedPersona),t.enhancedFormat&&this.selectFormat(t.enhancedFormat)})},savePreferences(){chrome.storage.local.set({enhancedPersona:this.selectedPersona,enhancedFormat:this.selectedFormat})},showToast(t,e=3e3){window.TabTalkUI?.showToast?window.TabTalkUI.showToast(t,e):console.log("Toast:",t)}};window.TabTalkEnhancedQuickActions=d,document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>d.init()):d.init()})();(function(){let d={selectedContentType:"digital-product",selectedHookStyle:"scarcity",selectedCTA:"like-reply-dm",currentTopic:"",selectedProductType:"",generatedIdeas:[],contentTypes:{"digital-product":{name:"Digital Product",emoji:"\u{1F4E6}",description:"Promote downloadable resources, guides, templates",engagementTactics:["scarcity","social-proof","urgency"]},controversial:{name:"Controversial Take",emoji:"\u{1F525}",description:"Bold opinions that spark debate",engagementTactics:["controversy","curiosity","fomo"]},results:{name:"Results Showcase",emoji:"\u{1F4B0}",description:"Share impressive metrics and outcomes",engagementTactics:["social-proof","curiosity","urgency"]},tutorial:{name:"Tutorial Tease",emoji:"\u{1F393}",description:"Preview of valuable how-to content",engagementTactics:["curiosity","scarcity","urgency"]},question:{name:"Engagement Question",emoji:"\u2753",description:"Questions that demand responses",engagementTactics:["curiosity","controversy","social-proof"]},"ai-workflow":{name:"AI Workflow",emoji:"\u{1F916}",description:"Automation and AI tool showcases",engagementTactics:["curiosity","urgency","fomo"]}},hookStyles:{scarcity:{name:"Scarcity",emoji:"\u23F0",pattern:"Limited availability, exclusive access, time-sensitive",examples:["Only 50 spots left","Available for 24 hours only","Before it's gone"]},curiosity:{name:"Curiosity Gap",emoji:"\u{1F9E0}",pattern:"Incomplete information that demands completion",examples:["You won't believe what happened","The secret nobody talks about","What I discovered"]},"social-proof":{name:"Social Proof",emoji:"\u{1F465}",pattern:"Numbers, testimonials, popularity indicators",examples:["10,000+ people already using","Viral on Twitter","Everyone is talking about"]},urgency:{name:"Urgency",emoji:"\u26A1",pattern:"Time pressure, immediate action required",examples:["Act now","Don't miss this","Last chance"]},controversy:{name:"Controversy",emoji:"\u{1F4A5}",pattern:"Polarizing statements, challenge status quo",examples:["Unpopular opinion","Everyone is wrong about","The truth they hide"]},fomo:{name:"FOMO",emoji:"\u{1F631}",pattern:"Fear of missing out, competitive advantage",examples:["While you sleep, others are","Your competitors already know","Don't get left behind"]}},ctaTypes:{"like-reply-dm":{name:"Like + Reply + DM",template:`\u2764\uFE0F Like this
\u{1F4AC} Reply "[KEYWORD]"
\u{1F4E9} I'll DM you [PRODUCT]`,engagement:["like","reply","dm"]},"retweet-follow":{name:"Retweet + Follow",template:`\u{1F504} Retweet this
\u{1F464} Follow me
\u{1F4E9} I'll DM you [PRODUCT]`,engagement:["retweet","follow","dm"]},"reply-keyword":{name:"Reply Keyword",template:`\u{1F4AC} Reply "[KEYWORD]" and I'll send you [PRODUCT]`,engagement:["reply","dm"]},"engagement-combo":{name:"Full Combo",template:`\u2764\uFE0F Like
\u{1F4AC} Reply "[KEYWORD]"
\u{1F504} Retweet
\u{1F464} Follow me

\u{1F4E9} I'll DM you [PRODUCT] FREE`,engagement:["like","reply","retweet","follow","dm"]}},init(){this.bindEvents(),this.loadStoredPreferences()},bindEvents(){let t=document.getElementById("quick-click-farming");t&&t.addEventListener("click",()=>this.showModal()),document.addEventListener("keydown",e=>{let n=document.getElementById("click-farming-modal");e.key==="Escape"&&n&&!n.classList.contains("hidden")&&this.hideModal()}),document.addEventListener("click",e=>{e.target.closest(".content-type-chip")&&this.selectContentType(e.target.closest(".content-type-chip").dataset.type),e.target.closest(".hook-style-chip")&&this.selectHookStyle(e.target.closest(".hook-style-chip").dataset.style),e.target.closest(".cta-type-chip")&&this.selectCTA(e.target.closest(".cta-type-chip").dataset.cta),e.target.closest(".idea-item")&&this.selectIdea(e.target.closest(".idea-item").dataset.idea),(e.target.closest("#close-click-farming-modal")||e.target.closest("#cancel-click-farming"))&&this.hideModal(),e.target.classList.contains("modal-overlay")&&this.hideModal(),e.target.closest("#generate-ideas-btn")&&(e.preventDefault(),this.generateIdeas()),e.target.closest("#generate-click-farming")&&(e.preventDefault(),this.generatePost())})},showModal(){let t=document.getElementById("click-farming-modal");if(t){t.classList.remove("hidden");let e=document.getElementById("click-farming-topic");e&&setTimeout(()=>e.focus(),100)}},hideModal(){let t=document.getElementById("click-farming-modal");t&&t.classList.add("hidden")},selectContentType(t){this.selectedContentType=t,document.querySelectorAll(".content-type-chip").forEach(e=>{e.classList.toggle("active",e.dataset.type===t)}),this.savePreferences()},selectHookStyle(t){this.selectedHookStyle=t,document.querySelectorAll(".hook-style-chip").forEach(e=>{e.classList.toggle("active",e.dataset.style===t)}),this.savePreferences()},selectCTA(t){this.selectedCTA=t,document.querySelectorAll(".cta-type-chip").forEach(e=>{e.classList.toggle("active",e.dataset.cta===t)}),this.savePreferences()},selectIdea(t){let e=document.getElementById("click-farming-topic");e&&(e.value=t,this.currentTopic=t),document.querySelectorAll(".idea-item").forEach(n=>{n.classList.toggle("selected",n.dataset.idea===t)})},async generateIdeas(){let t=document.getElementById("click-farming-topic"),e=t?t.value.trim():"",n=document.getElementById("generate-ideas-btn"),a=n.textContent;n.textContent="\u23F3 Generating...",n.disabled=!0;try{let o=await this.callGeminiAPI(this.buildIdeasPrompt(e));this.displayIdeas(o)}catch(o){console.error("Idea generation failed:",o),this.showToast("Failed to generate ideas",3e3)}finally{n.textContent=a,n.disabled=!1}},async generatePost(){console.log("Click Farming: generatePost() called");let t=document.getElementById("click-farming-topic");if(this.currentTopic=t?t.value.trim():"",console.log("Click Farming: currentTopic =",this.currentTopic),!this.currentTopic){console.log("Click Farming: No topic entered"),this.showToast("Enter a topic first",2e3);return}let e=document.getElementById("product-type");this.selectedProductType=e?e.value:"",console.log("Click Farming: selectedProductType =",this.selectedProductType);let n=document.getElementById("generate-click-farming"),a=n.textContent;n.textContent="\u23F3 Generating...",n.disabled=!0;try{console.log("Click Farming: Building post prompt...");let o=this.buildPostPrompt();console.log("Click Farming: Prompt built, calling API...");let i=await this.callGeminiAPI(o);console.log("Click Farming: API response received, length:",i?.length),this.displayPostResult(i),this.hideModal(),this.showToast("Post generated successfully!",2e3)}catch(o){console.error("Click Farming: Post generation failed:",o),this.showToast("Failed to generate post: "+o.message,3e3)}finally{n.textContent=a,n.disabled=!1}},buildIdeasPrompt(t){let e=this.contentTypes[this.selectedContentType];return`Generate 5 viral Twitter post ideas for engagement farming.

CONTENT TYPE: ${e.name}
${e.description}

${t?`BASE TOPIC: ${t}`:"Generate diverse ideas across popular niches"}

REQUIREMENTS:
- Each idea should be highly engaging and clickable
- Focus on topics that naturally encourage replies, likes, and retweets
- Include specific angles (numbers, results, tools, etc.)
- Make them feel exclusive and valuable
- Keep each idea concise (1-2 sentences)

POPULAR NICHES TO CONSIDER:
- AI automation and tools
- Content creation shortcuts
- Money-making methods
- Productivity hacks
- Social media growth
- Design resources
- Coding/development tools

FORMAT: Return as a numbered list (1-5)

Generate 5 viral ideas now:`},buildPostPrompt(){let t=this.contentTypes[this.selectedContentType],e=this.hookStyles[this.selectedHookStyle],n=this.ctaTypes[this.selectedCTA];return`You are the world's best viral Twitter content strategist specializing in engagement farming and digital product promotion. Your posts consistently generate 10,000+ impressions and hundreds of engagements.

TASK: Create a high-engagement Twitter post about "${this.currentTopic}"

CONTENT TYPE: ${t.name}
- ${t.description}
- Recommended tactics: ${t.engagementTactics.join(", ")}

HOOK STYLE: ${e.name}
- Pattern: ${e.pattern}
- Examples: ${e.examples.join(" | ")}

CALL-TO-ACTION: ${n.name}
- Template: ${n.template}
- Engagement types: ${n.engagement.join(", ")}

${this.selectedProductType?`DIGITAL PRODUCT TYPE: ${this.selectedProductType}`:""}

VIRAL POST STRUCTURE:

1. **HOOK (First Line)** - Must stop the scroll
   - Use ${e.name} technique
   - Include specific numbers, timeframes, or bold claims
   - Create curiosity gap or emotional trigger
   - Examples:
     * "12 days. 11.7M views. $16.7K in ad revenue."
     * "HOLY SH*T... This AI Agent does everything"
     * "I heard Su-30s smoked several Western fighters..."

2. **VALUE PROPOSITION (2-4 lines)** - What they get
   - Be ultra-specific about the benefit
   - Use bullet points or line breaks for scannability
   - Include credibility markers (results, social proof)
   - Make it feel exclusive and valuable

3. **SOCIAL PROOF / CREDIBILITY (Optional)**
   - Numbers, testimonials, or authority signals
   - "Built in n8n", "Used by 10,000+ creators"
   - Results or case study snippets

4. **ENGAGEMENT MECHANISM** - The farming part
   - Clear, simple instructions
   - Use emojis for each action (\u2764\uFE0F \u{1F4AC} \u{1F504} \u{1F464})
   - Create urgency or scarcity
   - Make keyword memorable and relevant

5. **CALL-TO-ACTION** - The hook for DMs
   ${n.template.replace("[KEYWORD]",this.generateKeyword()).replace("[PRODUCT]",this.generateProductName())}

ENGAGEMENT PSYCHOLOGY PRINCIPLES:
\u2705 Reciprocity: Offer value first, ask for engagement
\u2705 Scarcity: Limited time, spots, or availability
\u2705 Social Proof: Numbers, popularity, testimonials
\u2705 Authority: Expertise, results, credentials
\u2705 Curiosity Gap: Incomplete information that demands completion
\u2705 FOMO: Fear of missing out on opportunity
\u2705 Specificity: Exact numbers, timeframes, results

FORMATTING RULES:
- Use line breaks for readability
- Include 3-5 relevant emojis (not excessive)
- Keep total length under 280 characters OR use thread format (1/n, 2/n)
- Use ALL CAPS sparingly for emphasis
- Include ellipsis (...) for dramatic pauses
- Use bullet points (\u2192 or \u2022) for lists

KEYWORD STRATEGY:
- Choose a memorable, relevant keyword (e.g., "SHORTS", "Steal", "AI", "FREE")
- Make it easy to type and remember
- Relate to the content topic

EXAMPLES OF VIRAL ENGAGEMENT POSTS:

Example 1 (Digital Product):
"Untapped Goldmine: YouTube Shorts

12 days. 11.7M views. $16.7K in ad revenue.

All I do? Cut trending long-form videos into short clips.

AI handles editing + uploads.

Almost no one is monetizing Shorts

Reply "SHORTS" like & Retweet \u2014 I'll DM you Follow Me"

Example 2 (AI Workflow):
"HOLY SH*T\u2026 This AI Agent does everything 

Built in n8n :
 \u2192 Clones viral TikToks
 \u2192 Rewrites w/ GPT-4o
 \u2192 Auto creates avatar videos
 \u2192 Adds captions & edits
 \u2192 Posts to 9 platforms (TikTok, IG, YT, X\u2026)

\u2764\uFE0F Like+RT
\u{1F4AC} Reply "Steal"
\u{1F464} Follow me & I'll DM you workflow FREE."

Example 3 (Controversial):
"I heard Su-30s smoked several Western fighters in Spain in the exercise where IAF was invited.

Can someone confirm this?"

Example 4 (Tutorial Tease):
"Create your own \u{1D5DB}\u{1D5EC}\u{1D5E3}\u{1D5D8}\u{1D5E5} \u{1D5E5}\u{1D5D8}\u{1D5D4}\u{1D5DF} \u{1D5E7}\u{1D5DC}\u{1D5E1}\u{1D5EC} version

\u2192 Open Seedream 4.0 or Gemini Nano Banana
\u2192 Upload your photo
\u2192 Paste the prompt (Prompt in ALT)

Your tiny self is ready!

Reply "TINY" for the full guide"

CRITICAL SUCCESS FACTORS:
1. First line MUST hook within 2 seconds
2. Value proposition MUST be crystal clear
3. CTA MUST be simple and actionable
4. Create urgency or scarcity
5. Make engagement feel rewarding
6. Use proven psychological triggers

TOPIC: ${this.currentTopic}

CRITICAL OUTPUT INSTRUCTIONS:
- Generate ONLY the viral post content
- DO NOT include explanations, strategies, or analysis
- DO NOT provide multiple options or variations
- DO NOT explain why the post works
- NO "Explanation of Choices" or "Why this should work" sections
- Output must be ready-to-post content ONLY

Now generate the perfect viral engagement post:`},generateKeyword(){let e={"digital-product":["FREE","SEND","GUIDE","PACK","TEMPLATE"],controversial:["DEBATE","THOUGHTS","OPINION","TAKE","VIEW"],results:["RESULTS","METHOD","SYSTEM","STRATEGY","BLUEPRINT"],tutorial:["TUTORIAL","GUIDE","STEPS","HOW","LEARN"],question:["ANSWER","REPLY","THOUGHTS","YES","NO"],"ai-workflow":["AI","WORKFLOW","AUTOMATION","TOOL","AGENT"]}[this.selectedContentType]||["INFO"];return e[Math.floor(Math.random()*e.length)]},generateProductName(){let e={"digital-product":["the complete guide","the full template","the resource pack"],controversial:["my full analysis","the detailed breakdown"],results:["the exact method","the full system","the complete strategy"],tutorial:["the step-by-step guide","the full tutorial","the complete walkthrough"],question:["my detailed answer","the full explanation"],"ai-workflow":["the workflow","the automation","the complete setup"]}[this.selectedContentType]||["the resource"];return e[Math.floor(Math.random()*e.length)]},displayIdeas(t){let e=document.getElementById("ideas-container");if(!e)return;let n=this.parseIdeasList(t);e.innerHTML=n.map((a,o)=>`
        <div class="idea-item" data-idea="${a}">
          <div class="idea-number">${o+1}</div>
          <div class="idea-text">${a}</div>
        </div>
      `).join(""),e.classList.remove("hidden")},parseIdeasList(t){let e=t.split(`
`),n=[];for(let a of e){let o=a.trim().match(/^\d+\.\s*(.+)$/);o&&n.push(o[1])}return n.length>0?n.slice(0,5):["AI automation workflow for content creators","YouTube Shorts monetization strategy","Viral Twitter growth tactics","Design template collection","Productivity system blueprint"]},displayPostResult(t){console.log("Click Farming: displayPostResult() called with post length:",t?.length),window.TabTalkNavigation&&window.TabTalkNavigation.showView("chat");let e=document.getElementById("messages-container");if(!e){console.error("Click Farming: messages-container not found"),this.showToast("Failed to display post - container not found",3e3);return}let n=window.TabTalkUI?window.TabTalkUI.cleanPostContent(t):this.cleanPostContent(t),a=n.replace(/\n/g,"<br>"),o=window.TabTalkUI.renderCard("\u{1F3AF} Click Farming Post",a,{contentType:"click-farming",contentId:Date.now().toString(),markdown:n,platform:"click-farming",hookStyle:this.selectedHookStyle,cta:this.selectedCTA,topic:this.currentTopic});o&&(o.dataset.platform="click-farming",o.dataset.contentType=this.selectedContentType,o.dataset.hookStyle=this.selectedHookStyle,o.dataset.cta=this.selectedCTA,o.dataset.topic=this.currentTopic),setTimeout(()=>{e.scrollTo({top:e.scrollHeight,behavior:"smooth"})},100),console.log("Click Farming: Card successfully displayed using standard UI")},cleanPostContent(t){if(!t)return"";let e=String(t);return e=e.replace(/^(?:Okay, here's|Here's|This is|Below is)[^\n]*:\s*/i,""),e=e.replace(/^\*\*Option\s+\d+.*?\*\*[^\n]*\n/gi,""),e=e.replace(/^\*\*Explanation.*?\*\*[^\n]*\n/gi,""),e=e.replace(/^\*\*Why.*?\*\*[^\n]*\n/gi,""),e=e.replace(/Explanation of Choices & Strategies Used:[^\n]*\n/gi,""),e=e.replace(/Why these options should work:[^\n]*\n/gi,""),e=e.replace(/Choose the option.*?\.\n/gi,""),e=e.replace(/\*\*([^*]+)\*\*/g,"$1"),e=e.replace(/\*([^*]+)\*/g,"$1"),e=e.replace(/\n{3,}/g,`

`),e=e.replace(/^[ \t]+|[ \t]+$/gm,""),e.split(`
`).filter(o=>{let i=o.trim();return i&&!i.match(/^(Explanation|Why|Choose|Strategies|Choices|Options?)[:\s]/i)&&!i.match(/^\*\*[^\*]*\*\*$/)}).join(`
`).trim()},showToast(t,e=3e3){window.TabTalkUI?.showToast?window.TabTalkUI.showToast(t,e):console.log("Toast:",t)},getAccurateCharacterCount(t){if(!t)return 0;let e=t.trim(),n=0,a=Array.from(e);for(let o of a)this.isEmojiOrSpecialChar(o)?n+=2:n+=1;return n},isEmojiOrSpecialChar(t){let e=t.codePointAt(0);return e>=127744&&e<=129535||e>=9728&&e<=9983||e>=9984&&e<=10175||e>=128512&&e<=128591||e>=128640&&e<=128767||e>=129280&&e<=129535||e>=127456&&e<=127487||e===8205},async callGeminiAPI(t){if(console.log("Click Farming: callGeminiAPI() called with prompt length:",t?.length),window.TabTalkAPI?.callGeminiAPI){console.log("Click Farming: Using window.TabTalkAPI.callGeminiAPI");try{let e=await window.TabTalkAPI.callGeminiAPI(t);return console.log("Click Farming: API call successful, result length:",e?.length),e}catch(e){throw console.error("Click Farming: API call failed:",e),e}}throw console.error("Click Farming: API not available - window.TabTalkAPI?.callGeminiAPI not found"),new Error("API not available. Please make sure your Gemini API key is set up.")},saveToGallery(t,e){if(!window.TabTalkGallery)return;let n={id:Date.now().toString(),title:`\u{1F3AF} ${e}`,content:t,timestamp:new Date().toISOString(),tags:["click-farming",this.selectedContentType,this.selectedCTA],platform:"twitter"};window.TabTalkGallery.saveContent(n)},loadStoredPreferences(){chrome.storage.local.get(["clickFarmingContentType","clickFarmingHookStyle","clickFarmingCTA"],t=>{t.clickFarmingContentType&&this.selectContentType(t.clickFarmingContentType),t.clickFarmingHookStyle&&this.selectHookStyle(t.clickFarmingHookStyle),t.clickFarmingCTA&&this.selectCTA(t.clickFarmingCTA)})},savePreferences(){chrome.storage.local.set({clickFarmingContentType:this.selectedContentType,clickFarmingHookStyle:this.selectedHookStyle,clickFarmingCTA:this.selectedCTA})}};window.TabTalkClickFarming=d,document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>d.init()):d.init()})();(()=>{var d=class{constructor(){this.apiKey=null,this.currentTab=null,this.pageContent=null,this.isLoading=!1,this.currentDomain=null,this.messagesContainer=document.getElementById("messages-container"),this.pageStatus=document.getElementById("page-status"),this.pageTitle=document.getElementById("page-title"),this.quickActions=document.getElementById("quick-actions"),this.sidebar=document.getElementById("sidebar"),this.quickTwitterBtn=document.getElementById("quick-twitter"),this.quickTwitterThreadBtn=document.getElementById("quick-twitter-thread"),this.quickCreateBtn=document.getElementById("quick-create"),this.welcomeView=document.getElementById("welcome-view"),this.apiSetupView=document.getElementById("api-setup-view"),this.chatView=document.getElementById("chat-view"),this.settingsView=document.getElementById("settings-view"),this.menuButton=document.getElementById("menu-button"),this.apiKeyInput=document.getElementById("api-key-input")||document.getElementById("settings-api-key"),this.inputActions=document.querySelector(".input-actions"),this.exportFormatSelect=document.getElementById("export-format-select"),this.statusText=document.getElementById("status-text"),this.views={welcome:this.welcomeView,"api-setup":this.apiSetupView,chat:this.chatView,settings:this.settingsView}}async init(){try{console.log("TabTalk AI: Initializing popup");let e=await chrome.tabs.query({active:!0,currentWindow:!0});!e||e.length===0?(console.error("TabTalk AI: Failed to get current tab"),this.pageStatus&&(this.pageStatus.textContent="\u274C Failed to access current tab")):(this.currentTab=e[0],console.log("TabTalk AI: Current tab:",this.currentTab.url)),await this.loadState();try{let a=await this.getStorageItem?await this.getStorageItem("theme"):null;a||(a="dark"),document.documentElement.setAttribute("data-theme",a)}catch{}if(this.migrateThreadsToGallery)try{await this.migrateThreadsToGallery()}catch(a){console.warn("Thread migration skipped",a)}this.bindEvents();let n=await this.getStorageItem("hasSeenWelcome");this.apiKey?(this.showView("chat"),await this.getAndCachePageContent()):n?this.showView("api-setup"):this.showView("welcome"),console.log("TabTalk AI: Popup initialized")}catch(e){console.error("TabTalk AI: Initialization error:",e),this.pageStatus&&(this.pageStatus.textContent=`\u274C Initialization failed: ${e.message}`),this.showView&&this.showView("welcome")}}bindEvents(){let e=document.getElementById("settings-cancel-button"),n=document.getElementById("settings-save-button");e&&e.addEventListener("click",()=>{this.updateViewState(this.apiKey?"chat":"settings")}),n&&n.addEventListener("click",()=>this.handleSaveSettings());let a=document.getElementById("delete-api-key-button");a&&a.addEventListener("click",()=>this.handleDeleteApiKey()),console.log("Menu Button:",this.menuButton),console.log("Sidebar:",this.sidebar),this.menuButton&&this.sidebar&&(this.menuButton.addEventListener("click",g=>{g.stopPropagation(),console.log("Menu button clicked!");let w=this.sidebar.classList.contains("hidden");w?(this.sidebar.classList.remove("hidden"),this.sidebar.style.display="block"):(this.sidebar.classList.add("hidden"),this.sidebar.style.display="none"),console.log("Sidebar is now:",w?"visible":"hidden"),this.sidebar.setAttribute("aria-expanded",w?"false":"true")}),document.addEventListener("click",g=>{this.sidebar.classList.contains("hidden")||!this.sidebar.contains(g.target)&&g.target!==this.menuButton&&(this.sidebar.classList.add("hidden"),this.sidebar.setAttribute("aria-expanded","false"))}),this.sidebar.addEventListener("keydown",g=>{g.key==="Escape"&&(this.sidebar.classList.add("hidden"),this.sidebar.setAttribute("aria-expanded","false"),this.menuButton.focus())}));let o=document.getElementById("menu-settings-link");o&&o.addEventListener("click",g=>{g.preventDefault(),this.updateViewState("settings"),this.sidebar&&this.sidebar.classList.add("hidden")});let i=document.getElementById("theme-toggle");i&&i.addEventListener("click",async()=>{let w=(document.documentElement.getAttribute("data-theme")||"light")==="dark"?"light":"dark";if(document.documentElement.setAttribute("data-theme",w),this.setStorageItem)try{await this.setStorageItem("theme",w)}catch{}});let s=document.getElementById("menu-gallery-link");s&&s.addEventListener("click",g=>{g.preventDefault(),this.showView("gallery")});let r=document.getElementById("welcome-get-started");r&&r.addEventListener("click",async()=>{await this.setStorageItem("hasSeenWelcome",!0),this.showView("api-setup")});let c=document.getElementById("welcome-start");c&&c.addEventListener("click",async()=>{await this.setStorageItem("hasSeenWelcome",!0),this.showView("api-setup")});let h=document.getElementById("api-setup-back");h&&h.addEventListener("click",()=>{this.showView("welcome")});let u=document.getElementById("api-setup-back-arrow");u&&u.addEventListener("click",()=>{this.showView("welcome")});let l=document.getElementById("api-setup-continue");l&&l.addEventListener("click",async()=>{let g=document.getElementById("onboarding-api-key").value.trim();g&&(await this.saveApiKey(g),this.showView("chat"),await this.getAndCachePageContent())});let m=document.getElementById("test-api-key");m&&m.addEventListener("click",async()=>{let g=document.getElementById("onboarding-api-key").value.trim();if(g){let w=await this.testApiKey(g),f=document.getElementById("api-setup-continue");w?(m.textContent="\u2713 Valid",m.style.background="#10b981",m.style.color="white",f.disabled=!1):(m.textContent="\u2717 Invalid",m.style.background="#ef4444",m.style.color="white",f.disabled=!0),setTimeout(()=>{m.textContent="Test",m.style.background="",m.style.color=""},2e3)}});let p=document.getElementById("onboarding-api-key");p&&p.addEventListener("input",()=>{let g=document.getElementById("api-setup-continue");g.disabled=!p.value.trim()}),this.menuButton&&this.menuButton.setAttribute("aria-label","Open menu"),this.apiKeyInput&&this.apiKeyInput.setAttribute("aria-label","Gemini API Key"),console.log("Button elements found:",{quickTwitterBtn:!!this.quickTwitterBtn,quickTwitterThreadBtn:!!this.quickTwitterThreadBtn,quickCreateBtn:!!this.quickCreateBtn}),this.quickTwitterBtn&&this.quickTwitterBtn.addEventListener("click",async()=>{this.resetScreenForGeneration&&this.resetScreenForGeneration(),await this.generateSocialContent("twitter")}),this.quickTwitterThreadBtn&&this.quickTwitterThreadBtn.addEventListener("click",async()=>{console.log("Thread button clicked - showing tone selector for thread generation"),this.resetScreenForGeneration&&this.resetScreenForGeneration(),await this.generateSocialContent("thread")}),this.quickCreateBtn&&this.quickCreateBtn.addEventListener("click",()=>{window.TabTalkThreadGenerator&&window.TabTalkThreadGenerator.showModal?window.TabTalkThreadGenerator.showModal(this):this.showView("thread-generator")});let y=document.getElementById("generate-thread-btn");y&&y.addEventListener("click",async()=>{this.handleThreadGeneratorSubmit&&await this.handleThreadGeneratorSubmit()}),this.initializeHorizontalScroll(),window.TabTalkThreadGenerator&&window.TabTalkThreadGenerator.init&&(console.log("TabTalk AI: Initializing Thread Generator modal..."),window.TabTalkThreadGenerator.init())}async testApiKey(e){try{let n=await chrome.runtime.sendMessage({action:"testApiKey",apiKey:e});return n&&n.success}catch(n){return console.error("Error testing API key:",n),!1}}async handleSaveSettings(){let e=this.apiKeyInput?this.apiKeyInput.value.trim():"";if(!e){alert("Please enter a valid API key");return}await this.testApiKey(e)?(await this.saveApiKey(e),console.log("TabTalk AI: Saving API key with key name 'geminiApiKey' successfully"),this.showView("chat"),await this.getAndCachePageContent()):alert("Invalid API key. Please try again.")}async getAndCachePageContent(){if(!(!this.currentTab||!this.apiKey)){this.setLoading(!0,"Reading page..."),this.pageStatus.textContent="Injecting script to read page...";try{if(this.currentTab.url?.startsWith("chrome://")||this.currentTab.url?.startsWith("https://chrome.google.com/webstore"))throw new Error("Cannot run on protected browser pages.");let e=await chrome.scripting.executeScript({target:{tabId:this.currentTab.id},files:["content.js"]});if(!e||e.length===0)throw new Error("Script injection failed.");let n=e[0].result;if(n.success)this.pageContent=n.content,this.pageStatus.textContent=`\u2705 Content loaded (${(n.content.length/1024).toFixed(1)} KB)`,this.updateQuickActionsVisibility();else throw new Error(n.error)}catch(e){console.error("TabTalk AI (popup):",e),this.pageStatus.textContent=`\u274C ${e.message}`}finally{this.setLoading(!1)}}}};let t=d.prototype.init;document.addEventListener("DOMContentLoaded",()=>{window.TabTalkAPI&&Object.assign(d.prototype,window.TabTalkAPI),window.TabTalkTwitter&&Object.assign(d.prototype,window.TabTalkTwitter),window.TabTalkThreadGenerator&&Object.assign(d.prototype,window.TabTalkThreadGenerator),window.TabTalkContentAnalysis&&Object.assign(d.prototype,window.TabTalkContentAnalysis),window.TabTalkSocialMedia&&Object.assign(d.prototype,window.TabTalkSocialMedia),window.TabTalkStorage&&Object.assign(d.prototype,window.TabTalkStorage),window.TabTalkUI&&Object.assign(d.prototype,window.TabTalkUI),window.TabTalkScroll&&Object.assign(d.prototype,window.TabTalkScroll),window.TabTalkNavigation&&Object.assign(d.prototype,window.TabTalkNavigation),d.prototype.init=async function(){return await t.call(this),this},new d().init().catch(e=>console.error("Initialization error:",e))})})();})();
