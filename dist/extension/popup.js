(()=>{(function(){let d={async callGeminiAPIWithSystemPrompt(e,t){try{if(!this.apiKey||!t)throw new Error("Missing API key or user prompt");if(!this.pageContent&&(this.pageStatus.textContent="\u26A0\uFE0F Re-analyzing page before generating content...",await this.getAndCachePageContent(),!this.pageContent))throw new Error("Could not get page content to generate content.");let n=[{role:"user",parts:[{text:e},{text:t}]}],a=await chrome.runtime.sendMessage({action:"callGeminiAPI",payload:{contents:n},apiKey:this.apiKey});if(a.success&&a.data?.candidates?.[0]?.content?.parts?.[0]?.text)return a.data.candidates[0].content.parts[0].text;throw new Error(a.error||"The AI gave an empty or invalid response.")}catch(n){throw n.message&&n.message.includes("Extension context invalidated")?new Error("Extension was reloaded. Please refresh the page and try again."):n}},async callGeminiAPI(e){try{let t=await this.getStoredApiKey();if(!t||!e)throw new Error("Missing API key or prompt");console.log("API Module: Making API call with key present:",!!t);let n=[{role:"user",parts:[{text:e}]}],a=await chrome.runtime.sendMessage({action:"callGeminiAPI",payload:{contents:n},apiKey:t});if(a.success&&a.data?.candidates?.[0]?.content?.parts?.[0]?.text)return a.data.candidates[0].content.parts[0].text;throw console.error("API Module: API response error:",a),new Error(a.error||"The AI gave an empty or invalid response.")}catch(t){throw t.message&&t.message.includes("Extension context invalidated")?new Error("Extension was reloaded. Please refresh the page and try again."):t}},async getStoredApiKey(){return new Promise(e=>{chrome.storage.local.get(["geminiApiKey"],t=>{let n=t.geminiApiKey||"";console.log("API Module: Retrieved API key from storage, length:",n?.length),e(n)})})}};window.TabTalkAPI=d})();(function(){let d={async getStorageItem(e){try{let t=await chrome.storage.local.get([e]);return t?t[e]:void 0}catch(t){console.error("getStorageItem error:",t);return}},async setStorageItem(e,t){try{return await chrome.storage.local.set({[e]:t}),!0}catch(n){return console.error("setStorageItem error:",n),!1}},async loadState(){try{let e=await chrome.storage.local.get(["geminiApiKey","apiKey"]);if(console.log("TabTalk AI: Loading state, API key exists:",!!e.geminiApiKey),(e.geminiApiKey||e.apiKey)&&(this.apiKey=e.geminiApiKey||e.apiKey,console.log("TabTalk AI: API key loaded successfully"),this.apiKeyInput&&(this.apiKeyInput.value=this.apiKey)),this.currentTab){let t=new URL(this.currentTab.url);this.currentDomain=t.hostname,this.pageTitle&&(this.pageTitle.textContent=this.currentTab.title||"Untitled Page",console.log("TabTalk AI: Page title set to:",this.pageTitle.textContent))}return e}catch(e){throw console.error("Failed to load state:",e),e}},async saveState(){this.apiKey&&await chrome.storage.local.set({geminiApiKey:this.apiKey})},async saveApiKey(e){this.apiKey=e;try{await chrome.storage.local.set({geminiApiKey:e,apiKey:e,hasSeenWelcome:!0}),console.log("TabTalk AI: API key saved")}catch{await this.setStorageItem("apiKey",e),await this.setStorageItem("hasSeenWelcome",!0)}},async handleDeleteApiKey(){if(confirm("Delete your API key? You will need to set it up again."))try{await chrome.storage.local.remove(["geminiApiKey","apiKey"]),this.apiKey=null,this.apiKeyInput&&(this.apiKeyInput.value=""),this.pageContent=null,this.updateQuickActionsVisibility&&this.updateQuickActionsVisibility(),this.messagesContainer&&(this.messagesContainer.innerHTML=""),await this.setStorageItem("hasSeenWelcome",!1),this.showView("welcome"),console.log("TabTalk AI: API key deleted")}catch(e){console.error("Error deleting API key:",e),alert("Error deleting API key. Please try again.")}},async getSavedContent(){return await this.getStorageItem("savedContent")||{}},async saveContent(e,t){let n=await this.getSavedContent();n[e]||(n[e]=[]);let a={id:t&&t.id?t.id:Date.now().toString(),...t,timestamp:t&&t.timestamp?t.timestamp:Date.now()},i=n[e].findIndex(o=>o.id===a.id);i>=0?n[e][i]={...n[e][i],...a,updatedAt:Date.now()}:n[e].unshift(a);let s=[];for(let[o,r]of Object.entries(n))if(Array.isArray(r))for(let l=0;l<r.length;l++)s.push({cat:o,idx:l,item:r[l]});if(s.sort((o,r)=>(r.item.updatedAt||r.item.timestamp||0)-(o.item.updatedAt||o.item.timestamp||0)),s.length>50){let o=new Set(s.slice(0,50).map(r=>`${r.cat}:${r.item.id}`));for(let[r,l]of Object.entries(n))Array.isArray(l)&&(n[r]=l.filter(c=>o.has(`${r}:${c.id}`)))}return await this.setStorageItem("savedContent",n),console.log(`TabTalk AI: Content saved to ${e} category`),a.id},async deleteSavedContent(e,t){let n=await this.getSavedContent();n[e]&&(n[e]=n[e].filter(a=>a.id!==t),await this.setStorageItem("savedContent",n),console.log(`TabTalk AI: Content deleted from ${e} category`))},async clearSavedCategory(e){let t=await this.getSavedContent();t&&Object.prototype.hasOwnProperty.call(t,e)&&(t[e]=[],await this.setStorageItem("savedContent",t),console.log(`TabTalk AI: Cleared all saved items in category ${e}`))},async clearAllSaved(){await this.setStorageItem("savedContent",{}),console.log("TabTalk AI: Cleared all saved content across all categories")},async isContentSaved(e,t){return(await this.getSavedContent())[e]?.some(a=>a.id===t)||!1},async migrateThreadsToGallery(){try{if(await this.getStorageItem("threadsMigratedToGallery"))return;let t=await this.getStorageItem("savedThreads")||{},n=Object.values(t);if(!n.length){await this.setStorageItem("threadsMigratedToGallery",!0);return}let a=await this.getSavedContent();Array.isArray(a.twitter)||(a.twitter=[]);let i=new Set(a.twitter.map(o=>o.id));for(let o of n){let r=o.rawContent&&String(o.rawContent).trim()||(Array.isArray(o.tweets)?o.tweets.map(c=>c.content).join(`

`):""),l={id:o.id,type:"thread",platform:"thread",title:o.title||"Untitled Thread",url:o.url||"",domain:o.domain||"",tweets:Array.isArray(o.tweets)?o.tweets:[],totalTweets:o.totalTweets||(Array.isArray(o.tweets)?o.tweets.length:0),totalChars:o.totalChars,content:r,isAutoSaved:!!o.isAutoSaved,timestamp:o.createdAt||Date.now(),updatedAt:o.updatedAt||o.createdAt||Date.now()};i.has(l.id)||a.twitter.unshift(l)}let s=[];for(let[o,r]of Object.entries(a))if(Array.isArray(r))for(let l=0;l<r.length;l++)s.push({cat:o,idx:l,item:r[l]});if(s.sort((o,r)=>(r.item.updatedAt||r.item.timestamp||0)-(o.item.updatedAt||o.item.timestamp||0)),s.length>50){let o=new Set(s.slice(0,50).map(r=>`${r.cat}:${r.item.id}`));for(let[r,l]of Object.entries(a))Array.isArray(l)&&(a[r]=l.filter(c=>o.has(`${r}:${c.id}`)))}await this.setStorageItem("savedContent",a);try{await chrome.storage.local.remove(["savedThreads"])}catch{}await this.setStorageItem("threadsMigratedToGallery",!0),console.log("TabTalk AI: Migrated savedThreads to Gallery savedContent")}catch(e){console.error("Migration threads->gallery failed",e)}}};window.TabTalkStorage=d})();(function(){let d={showView:function(e){console.log("Navigation: showing view:",e),document.querySelectorAll(".view").forEach(c=>c.classList.add("hidden")),e==="welcome"||e==="api-setup"||e==="settings"?document.body.classList.add("onboarding-view"):document.body.classList.remove("onboarding-view"),window.BottomNav&&window.BottomNav.setActive(e);let a=document.getElementById("quick-actions");a&&(e==="chat"?a.classList.remove("hidden"):a.classList.add("hidden"));let i=document.getElementById("bottom-nav"),s=document.querySelector("main"),o=document.querySelector(".container");e==="welcome"||e==="api-setup"||e==="settings"?(i&&(i.style.display="none",i.style.visibility="hidden",i.style.height="0"),s&&(s.style.paddingBottom="0"),o&&(o.style.paddingBottom="0")):(i&&(i.style.display="flex",i.style.visibility="visible",i.style.height="45px"),s&&(s.style.paddingBottom="45px"),o&&(o.style.paddingBottom="66px"));let r=`${e}-view`;e==="chat"&&(r="chat-view"),e==="settings"&&(r="settings-view"),e==="welcome"&&(r="welcome-view"),e==="api-setup"&&(r="api-setup-view"),e==="history"&&(r="history-view"),e==="gallery"&&(r="gallery-view"),e==="thread-generator"&&(r="thread-generator-view");let l=document.getElementById(r);if(l){if(l.classList.remove("hidden"),e==="history"&&window.historyManager&&this.loadHistoryView(),e==="gallery"&&window.galleryManager){let c=document.getElementById("gallery-container");c&&window.galleryManager.render(c,"twitter")}e==="thread-generator"&&this.initializeHowItWorksToggle&&this.initializeHowItWorksToggle()}else console.warn(`showView: target view not found for "${e}" (id "${r}")`)},loadHistoryView:function(){if(!window.historyManager){console.error("History manager not initialized");return}let e=document.getElementById("history-list");e&&(e.innerHTML='<div class="loading-history">Loading saved content...</div>',window.historyManager.loadHistory("all").then(t=>{window.historyManager.renderHistoryList(e,t,"all")}).catch(t=>{console.error("Error loading history:",t),e.innerHTML='<div class="empty-history">Error loading saved content</div>'}))},updateViewState:function(e,t="Loading..."){if(this.sidebar&&(this.sidebar.classList.add("hidden"),this.sidebar.style.display="none"),Object.values(this.views).forEach(n=>n.classList.add("hidden")),this.views[e]?(this.views[e].classList.remove("hidden"),e==="chat"&&this.messageInput?this.messageInput.focus():e==="settings"&&this.apiKeyInput&&this.apiKeyInput.focus()):console.error(`View "${e}" not found`),e==="status"&&this.statusText&&(this.statusText.textContent=t),e==="settings"){let n=document.querySelector(".onboarding-info");n&&(n.style.display=this.apiKey?"none":"block")}this.setAriaStatus(`Switched to ${e} view. ${t}`)}};window.TabTalkNavigation=d})();(function(){let d={ensureMarked:function(){return!this.marked&&window.marked&&(this.marked=window.marked),!!this.marked},setAriaStatus:function(e){let t=document.getElementById("aria-status");t&&(t.textContent=e)},sanitizeStructuredOutput:function(e,t){if(!t)return"";let n=String(t);return n=n.replace(/^(?:here\s*(?:is|are|\'s|'s)|below\s+is|certainly,|sure,|note:|here\'s a|here's a)[^\n:]*:\s*/i,""),n=n.replace(/^\s*(?:here\s*(?:is|are|\'s|'s)\s*(?:a|an)?\s*)/i,""),n=n.replace(/\s*\*\s+(?=[^\n])/g,`
- `),n=n.replace(/^[ \t]*[•*]\s+/gm,"- "),n=n.replace(/\n{3,}/g,`

`),n=n.replace(/\((https?:\/\/[^\s)]+)\)\s*\(\1\)/g,"($1)"),n=n.replace(/(https?:\/\/[^\s)]+)\s*\(\1\)/g,"$1"),n=n.replace(/^[`\s]+/,"").replace(/[\s`]+$/,""),(e==="keypoints"||e==="summary")&&(n=n.replace(/\*\*([^*]+)\*\*/g,"$1"),n=n.replace(/\*([^*]+)\*/g,"$1"),n=n.replace(/_([^_]+)_/g,"$1")),e==="keypoints"&&!/^\s*-\s+/m.test(n)&&(n=n.split(/\s*\*\s+|\n+/).filter(Boolean).map(a=>a.replace(/^[-•*]\s+/,"").trim()).filter(Boolean).map(a=>`- ${a}`).join(`
`)),n.trim()},cleanPostContent:function(e){if(!e)return"";let t=String(e),n=t.match(/\*\*Option\s+\d+[^*]*\*\*[\s\S]*?(?=\*\*Option|\*\*Explanation|\*\*Why|$)/gi);n&&n.length>0&&(t=n[0]),t=t.replace(/^(?:Okay, here's|Here's|This is|Below is)[^\n]*:\s*/i,""),t=t.replace(/^\*\*Option\s+\d+.*?\*\*[^\n]*\n/gi,""),t=t.replace(/^\*\*Explanation.*?\*\*[^\n]*\n/gi,""),t=t.replace(/^\*\*Why.*?\*\*[^\n]*\n/gi,""),t=t.replace(/Explanation of Choices & Strategies Used:[^\n]*\n/gi,""),t=t.replace(/Why these options should work:[^\n]*\n/gi,""),t=t.replace(/Choose the option.*?\.\n/gi,""),t=t.replace(/^\s*\*\s*Hook.*?:.*$/gim,""),t=t.replace(/^\s*\*\s*Value Proposition.*?:.*$/gim,""),t=t.replace(/^\s*\*\s*Engagement.*?:.*$/gim,""),t=t.replace(/^\s*\*\s*Emojis.*?:.*$/gim,""),t=t.replace(/^\s*\*\s*Hashtags.*?:.*$/gim,""),t=t.replace(/^\s*\*\s*Thread.*?:.*$/gim,""),t=t.replace(/^\s*\*\s*Clarity.*?:.*$/gim,""),t=t.replace(/^\s*\*\s*Specificity.*?:.*$/gim,""),t=t.replace(/^\s*\*\s*Urgency.*?:.*$/gim,""),t=t.replace(/^\s*\*\s*Social Proof.*?:.*$/gim,""),t=t.replace(/^\s*\*\s*Reciprocity.*?:.*$/gim,""),t=t.replace(/^\s*\*\s*(?:Hook|Value|Engagement|Emojis|Hashtags|Thread|Clarity|Specificity|Urgency|Social|Reciprocity).*$/gim,""),t=t.replace(/^\*\*.*?Choices.*?\*\*.*$/gim,""),t=t.replace(/^\*\*.*?Strategies.*?\*\*.*$/gim,""),t=t.replace(/^\*\*.*?should work.*?\*\*.*$/gim,""),t=t.replace(/^\*\*.*?Approach.*?\*\*.*$/gim,""),t=t.replace(/^\*\*.*?Edge.*?\*\*.*$/gim,""),t=t.replace(/^\*\*.*?FOMO.*?\*\*.*$/gim,""),t=t.replace(/\*\*([^*]+)\*\*/g,"$1"),t=t.replace(/\*([^*]+)\*/g,"$1"),t=t.replace(/\n{3,}/g,`

`),t=t.replace(/^[ \t]+|[ \t]+$/gm,"");let s=t.split(`
`).filter(o=>{let r=o.trim();return r&&!r.match(/^(Explanation|Why|Choose|Strategies|Choices|Options?|Hook|Value|Engagement|Emojis|Hashtags|Thread|Clarity|Specificity|Urgency|Social|Reciprocity)[:\s]/i)&&!r.match(/^\*\*[^\*]*\*\*$/)&&!r.match(/^\*\*.*?(Choices|Strategies|Approach|Edge|FOMO).*?\*\*$/)&&!r.match(/^\s*\*\s*(?:The|Each|This|Use|Create|Referencing|Providing|Choose|Then|Good)/)}).join(`
`).trim();if(!s||s.length<20){let o=[/STOP.*[\s\S]*?#[A-Za-z]+/i,/🤯.*[\s\S]*?#[A-Za-z]+/i,/\(1\/\d+\).*[\s\S]*?#[A-Za-z]+/i];for(let r of o){let l=t.match(r);if(l&&l[0].length>30){s=l[0].trim();break}}}return s||"Unable to extract clean post content. Please try generating again."},setLoading:function(e,t="..."){this.isLoading=e,e?(this.pageStatus&&(this.pageStatus.textContent=t),this.setAriaStatus(t)):(this.pageStatus&&!this.pageStatus.textContent.startsWith("\u2705")&&(this.pageStatus.textContent="\u2705 Done"),this.setAriaStatus("Ready"))},updateQuickActionsVisibility:function(){this.quickActions&&this.quickActions.classList.toggle("hidden",!this.pageContent)},resetScreenForGeneration:function(){this.sidebar&&(this.sidebar.classList.add("hidden"),this.sidebar.style.display="none"),this.messagesContainer&&(this.messagesContainer.innerHTML=""),this.updateQuickActionsVisibility()},renderCard:function(e,t,n={}){let a=document.createElement("div");a.className="twitter-content-container";let i=document.createElement("div");i.className="twitter-card analytics-card",i.dataset.contentType=n.contentType||"content",i.dataset.contentId=n.contentId||Date.now().toString();let s={summary:"\u{1F4DD}",keypoints:"\u{1F511}",analysis:"\u{1F4CA}",faq:"\u2753",factcheck:"\u2705",blog:"\u{1F4F0}",proscons:"\u2696\uFE0F",timeline:"\u{1F4C5}",quotes:"\u{1F4AC}"},o=n.contentType||"content",r=s[o]||"\u{1F4C4}",l=n.markdown?`data-markdown="${encodeURIComponent(n.markdown)}"`:"";if(i.innerHTML=`
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
          <div class="structured-html content-text" ${l}>${t}</div>
        </div>
      `,window.TabTalkUI&&window.TabTalkUI.addSaveButtonToCard){let m=n.contentType||"content",p={id:n.contentId||Date.now().toString(),content:n.markdown||t,title:e},w=i.querySelector(".twitter-header-actions");w&&window.TabTalkUI.addSaveButtonToCard(i,w,m,p)}let c=i.querySelector(".copy-btn"),g=c.innerHTML;c.addEventListener("click",async m=>{m.stopPropagation();try{let p=i.querySelector(".structured-html"),w=p?.getAttribute("data-markdown"),u=w?decodeURIComponent(w):p?.innerText||"",y=i.dataset.imagePrompt?decodeURIComponent(i.dataset.imagePrompt):null;y&&(u+=`

---
\u{1F5BC}\uFE0F Nano Banana Prompt (9:16):
`+y),await navigator.clipboard.writeText(u),c.innerHTML=`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20,6 9,17 4,12"></polyline>
          </svg>`,c.classList.add("success"),setTimeout(()=>{c.innerHTML=g,c.classList.remove("success")},2e3)}catch(p){console.error("Copy failed:",p)}}),a.appendChild(i);let h=n.container||this.messagesContainer||document.getElementById("messages-container");return h&&(h.appendChild(a),h===this.messagesContainer&&h.scrollTo({top:h.scrollHeight,behavior:"smooth"})),i},showProgressBar:function(e){this.hideProgressBar();let t=document.createElement("div");t.className="progress-container",t.id="global-progress",t.innerHTML=`
        <div class="progress-message">${e}</div>
        <div class="progress-bar"><div class="progress-fill"></div></div>
      `,this.messagesContainer.appendChild(t),this.messagesContainer.scrollTo({top:this.messagesContainer.scrollHeight,behavior:"smooth"}),setTimeout(()=>{let n=t.querySelector(".progress-fill");n&&(n.style.width="100%")},100)},hideProgressBar:function(){let e=document.getElementById("global-progress");e&&e.remove()},addSaveButtonToCard:function(e,t,n,a){if(!e||!n||!a)return;let i=document.createElement("button");if(t&&t.classList.contains("twitter-header-actions")?(i.className="twitter-action-btn save-btn",i.innerHTML=`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
        </svg>`):(i.className="save-btn",i.innerHTML=`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
        </svg>`),i.setAttribute("aria-label","Save to history"),i.setAttribute("data-category",n),i.setAttribute("data-content-id",a.id||Date.now().toString()),i.title="Save to history",window.TabTalkStorage){let r=n==="thread"?"twitter":n;window.TabTalkStorage.isContentSaved(r,a.id||Date.now().toString()).then(l=>{l&&(i.classList.add("saved"),i.querySelector("svg").setAttribute("fill","currentColor"))})}i.addEventListener("click",async r=>{r.stopPropagation();let l=i.getAttribute("data-content-id"),c=i.getAttribute("data-category"),g=c==="thread"?"twitter":c;if(!window.TabTalkStorage)return;if(await window.TabTalkStorage.isContentSaved(g,l))await window.TabTalkStorage.deleteSavedContent(g,l),i.classList.remove("saved"),i.querySelector("svg").setAttribute("fill","none"),this.showToast("Removed from saved content");else{let m=a.content||e.querySelector(".content-text")?.textContent||"",p={source:this.currentTab?.url||window.location.href,title:this.currentTab?.title||document.title},w={id:l,content:m,metadata:p,type:a.type||(c==="thread"?"thread":"post"),platform:a.platform||(c==="thread"?"thread":"twitter"),...a};await window.TabTalkStorage.saveContent(g,w),i.classList.add("saved"),i.querySelector("svg").setAttribute("fill","currentColor"),this.showToast("Saved to history")}}),(t||e).appendChild(i)},showToast:function(e,t=2e3){let n=document.createElement("div");n.className="toast",n.textContent=e,document.body.appendChild(n),setTimeout(()=>{n.classList.add("visible")},10),setTimeout(()=>{n.classList.remove("visible"),setTimeout(()=>n.remove(),300)},t)}};window.TabTalkUI=d})();(function(){let d={analyzeAndResearchContent:async function(e,t){let n=this.simpleHash(e.substring(0,500)),a=`analysis_${this.currentTab?.url}_${t.id}_${n}`;try{let s=await chrome.storage.local.get(a);if(s[a]&&Date.now()-s[a].timestamp<18e5)return console.log("Using cached content analysis"),s[a].analysis}catch(s){console.warn("Cache check failed:",s)}let i=`You are an expert content analyst and researcher. Analyze this webpage content and provide:

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
RESEARCH CONTEXT: [relevant background knowledge and expert perspective]`;try{let s=await this.callGeminiAPIWithSystemPrompt("You are an expert content analyst who provides structured, insightful analysis.",i),o=this.parseAnalysisResponse(s);try{let r={};r[a]={analysis:o,timestamp:Date.now()},await chrome.storage.local.set(r)}catch(r){console.warn("Failed to cache analysis:",r)}return o}catch(s){return console.error("Analysis failed:",s),{summary:"Content analysis unavailable.",keyInsights:"- Focus on core message from the content",researchContext:"Apply general domain knowledge and best practices."}}},simpleHash:function(e){let t=0;for(let n=0;n<e.length;n++){let a=e.charCodeAt(n);t=(t<<5)-t+a,t=t&t}return Math.abs(t).toString(36)},parseAnalysisResponse:function(e){let t=e.match(/SUMMARY:\s*(.+?)(?=KEY INSIGHTS:|$)/s),n=e.match(/KEY INSIGHTS:\s*(.+?)(?=RESEARCH CONTEXT:|$)/s),a=e.match(/RESEARCH CONTEXT:\s*(.+?)$/s);return{summary:t?t[1].trim():"Content provides valuable information.",keyInsights:n?n[1].trim():"- Key points from the content",researchContext:a?a[1].trim():"General domain knowledge applies."}},showToneSelector:function(e){if(!this.pageContent||!this.apiKey){this.showToast?this.showToast("\u274C Please set up your Gemini API key first and ensure page content is loaded.",3e3):alert("\u274C Please set up your Gemini API key first and ensure page content is loaded.");return}window.TabTalkToneSelector?window.TabTalkToneSelector.show(e,this.pageContent,(t,n,a)=>{this.generateSocialContentWithTone(n,t,a)}):(console.error("Tone selector not loaded"),this.generateSocialContentWithTone(e,{id:"agreeing",name:"Amplify & Agree"},!1))},generateSocialContent:async function(e){this.showToneSelector(e)},generateSocialContentWithTone:async function(e,t,n=!1){if(!this.pageContent||!this.apiKey){this.showToast?this.showToast("\u274C Please set up your Gemini API key first and ensure page content is loaded.",3e3):alert("\u274C Please set up your Gemini API key first and ensure page content is loaded.");return}this.currentSelectedTone=t,this.currentIncludeImagePrompt=n,this.setLoading(!0,"Analyzing content..."),console.log(`TabTalk AI: Generating ${e} content for page: ${this.currentTab?.title}`),console.log(`Page content length: ${this.pageContent.length} characters`),console.log(`Selected tone: ${t.name} (${t.id})`),console.log(`Include image prompt: ${n}`);try{this.showProgressBar("Analyzing content...");let a=await this.analyzeAndResearchContent(this.pageContent,t);this.currentContentAnalysis=a,this.showProgressBar("Generating expert post...");let i="",s="",o="",r=t.aiInstructions||this.getDefaultToneInstructions(t.id);if(e==="twitter")o="\u{1F426}",i=`You are an authentic human Twitter/X user who writes exactly like real people talk - natural, conversational, and unfiltered. Your tweets feel like they're coming from a real person sharing their genuine thoughts, not a content machine.

YOUR AUTHENTIC VOICE:
- "I tweet like I talk" - natural speech-like patterns
- Use informal language, slang, and abbreviations naturally
- Direct address to followers ("you guys", "y'all", "everyone")
- Strategic emojis that amplify real emotions (2-4 max)
- Natural line breaks that create conversational rhythm
- Write like you're talking to smart friends

CRITICAL CONTENT RULES:
- NEVER include Twitter handles (@username) or mention specific users
- NEVER end with questions for engagement (sounds unnatural)
- Write statements and observations, not conversation starters
- Focus on sharing thoughts, not soliciting responses
- IF USING EXPERT REPURPOSE: ONLY rephrase wording, NEVER change the message or intent

${r}

CONTEXT ANALYSIS:
${a.summary}

KEY INSIGHTS:
${a.keyInsights}

RESEARCH AUGMENTATION (from domain knowledge):
${a.researchContext}`,s=`${t.id==="repurpose"?"REPHRASE this content with better wording - DO NOT add your own opinions or change the message.":"Share your authentic thoughts about this content - exactly like you'd tweet it to your followers."}

MISSION: ${t.id==="repurpose"?"Rephrase the EXACT same content with improved vocabulary and flow. Keep the same message, intent, and calls-to-action.":"Write something that feels 100% human and conversational, like you're actually talking to people."}

${t.id==="repurpose"?`CRITICAL: DO NOT start with "Here's a rephrased version" or any meta-commentary. Just output the rephrased content directly.`:""}

YOUR AUTHENTIC TWEET STYLE:
\u2713 Write like you talk - natural speech patterns
\u2713 Use informal language, slang, abbreviations
\u2713 Direct address: "you guys", "y'all", "everyone"
\u2713 Strategic emojis that amplify real feelings
\u2713 Natural line breaks for conversational flow
\u2713 Start with whatever's most interesting - no forced hooks
\u2713 Show your genuine personality and voice
\u2713 Mix short and long sentences like real speech
\u2713 End naturally - a thought, observation, or takeaway
\u2713 Apply the ${t.name} tone authentically

KEEP IT 100% REAL:
\u2717 No hashtags, URLs, or formatting symbols
\u2717 No marketing language or buzzwords
\u2717 No generic "content creator" speak
\u2717 No forced structures or templates
\u2717 NEVER mention Twitter handles or usernames
\u2717 NEVER end with questions (What do you think? Thoughts? etc.)
\u2717 Write like you're actually talking to friends
${t.id==="repurpose"?"\u2717 DO NOT add skepticism, warnings, or change promotional content into critiques":""}
${t.id==="repurpose"?`\u2717 DO NOT add meta-commentary like "Here's a rephrased version" or explain what you're doing`:""}

CONTENT ${t.id==="repurpose"?"TO REPHRASE":"THAT INSPIRED YOUR THOUGHTS"}:
${this.pageContent}

${t.id==="repurpose"?"Rephrase this content now with better wording:":"Share your authentic tweet now:"} Generation ID: ${Date.now()}`;else if(e==="thread")o="\u{1F9F5}",i=`You are an authentic human Twitter/X user who writes threads exactly like real people talk - natural, conversational, and storytelling. Your threads feel like you're telling a fascinating story to friends, not creating content.

YOUR AUTHENTIC THREAD VOICE:
- "I tweet like I talk" - natural speech-like patterns throughout
- Use informal language, slang, and abbreviations naturally
- Direct address to followers ("you guys", "y'all", "everyone")
- Strategic emojis that amplify real emotions (1-2 per tweet)
- Natural line breaks that create conversational rhythm
- Write like you're telling a story to smart friends
- Each tweet flows naturally into the next

CRITICAL CONTENT RULES:
- NEVER include Twitter handles (@username) or mention specific users
- NEVER end tweets with questions for engagement (sounds unnatural)
- Write statements and observations, not conversation starters
- Focus on sharing thoughts, not soliciting responses

${r}

CONTEXT ANALYSIS:
${a.summary}

KEY INSIGHTS:
${a.keyInsights}

RESEARCH AUGMENTATION (from domain knowledge):
${a.researchContext}`,s=`Share your thoughts about this content as a Twitter thread - exactly like you'd tell a story to your followers.

MISSION: Write a thread that feels 100% human and conversational, like you're actually talking to people and telling a story.

CRITICAL FORMAT REQUIREMENT:
Start each tweet with: 1/n: 2/n: 3/n: etc.

YOUR AUTHENTIC THREAD STYLE:
\u2713 Write like you talk - natural speech patterns
\u2713 Use informal language, slang, abbreviations
\u2713 Direct address: "you guys", "y'all", "everyone"
\u2713 Strategic emojis that amplify real feelings (1-2 per tweet)
\u2713 Natural line breaks for conversational flow
\u2713 Tweet 1: What first grabbed your attention
\u2713 Tweet 2: Your initial thoughts or what surprised you
\u2713 Middle Tweets: What fascinates you - insights, questions, connections
\u2713 Final Tweet: What you're left thinking or hoping others consider
\u2713 Apply the ${t.name} tone authentically

KEEP IT REAL:
\u2713 No hashtags or formatting symbols
\u2713 No marketing speak or "content strategist" language
\u2713 No forced structures - let the story flow naturally
\u2713 No URLs
\u2717 NEVER mention Twitter handles or usernames
\u2717 NEVER end tweets with questions for engagement

CONTENT THAT INSPIRED YOUR THREAD:
${this.pageContent}

Share your authentic thread now: Generation ID: ${Date.now()}`;else{this.showToast?this.showToast("\u274C Only Twitter/X Post and Twitter Thread are supported.",3e3):alert("\u274C Only Twitter/X Post and Twitter Thread are supported.");return}let l=await this.callGeminiAPIWithSystemPrompt(i,s);if(l){console.log(`TabTalk AI: Successfully generated ${e} content, response length: ${l.length} characters`);let c=this.cleanTwitterContent(l),g=null;if(n){this.showProgressBar("Generating image prompt...");try{if(window.TabTalkImagePromptGenerator){let h=`content_${Date.now()}`;g=await window.TabTalkImagePromptGenerator.generatePromptForCard(h,c),console.log("Image prompt generated:",g?"Success":"Failed")}}catch(h){console.error("Image prompt generation failed:",h)}}if(this.addTwitterMessage("assistant",c,e,g),this.addToHistory){let h={timestamp:new Date().toISOString(),url:this.currentTab?.url||"",title:this.currentTab?.title||"",domain:this.currentDomain||"",content:c,type:e,imagePrompt:g||void 0};await this.addToHistory(e,h)}await this.saveState()}else throw new Error("Empty response received from Gemini API")}catch(a){console.error("Error generating social content:",a),console.error("Error details:",{message:a.message,stack:a.stack,platform:e,hasApiKey:!!this.apiKey,hasPageContent:!!this.pageContent,pageContentLength:this.pageContent?.length}),this.showToast?this.showToast(`\u274C Error: ${a.message}. Please check your API key and try again.`,4e3):alert(`\u274C Error generating social media content: ${a.message}. Please check your API key and try again.`)}finally{this.setLoading(!1),this.hideProgressBar()}},showProgressBar:function(e){this.hideProgressBar();let t=document.createElement("div");t.className="progress-container",t.id="twitter-progress",t.innerHTML=`
        <div class="progress-message">${e}</div>
        <div class="progress-bar">
          <div class="progress-fill"></div>
        </div>
      `,this.messagesContainer.appendChild(t),this.messagesContainer.scrollTo({top:this.messagesContainer.scrollHeight,behavior:"smooth"}),setTimeout(()=>{let n=t.querySelector(".progress-fill");n&&(n.style.width="100%")},100)},hideProgressBar:function(){let e=document.getElementById("twitter-progress");e&&e.remove()},addTwitterMessage:function(e,t,n,a=null){this.renderTwitterContent(t,n,a)},renderTwitterContent:function(e,t,n=null){let a=document.createElement("div");if(a.className="twitter-content-container",t==="thread"){let i=this.parseTwitterThread(e);i.length<=1&&e.includes("1/")&&(console.warn("\u26A0\uFE0F  Thread parsing may have failed - got single tweet but content suggests thread"),console.log("Original content length:",e.length),console.log("Parsed tweets count:",i.length));let s=`thread_${Date.now()}`;this.autoSaveThread(s,i,e);let o=document.createElement("div");o.className="thread-header";let r=this.getTotalChars(i);o.innerHTML=`
          <div class="thread-info">
            <span class="thread-icon">\u{1F9F5}</span>
            <span class="thread-title">Thread Generated</span>
            <span class="thread-meta">${i.length} tweets \u2022 ${r} chars</span>
          </div>
          <div class="thread-actions">
            <button class="btn-copy-all-thread" data-thread-id="${s}" title="Copy all tweets">
              \u{1F4CB}
            </button>
            <span class="copy-all-status hidden">\u2713 All Copied!</span>
          </div>
        `,a.appendChild(o);let l=document.createElement("div");l.className="thread-master-control",l.innerHTML=`
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
              <input type="range" class="master-length-slider" min="500" max="5000" value="${r}" step="100" data-thread-id="${s}">
              <span class="slider-max">5000</span>
            </div>
            <div class="slider-value">
              <span class="current-length">${r}</span> characters total
            </div>
          </div>
          <div class="master-control-actions">
            <button class="btn-regenerate-thread" data-thread-id="${s}" title="Regenerate entire thread with new length">
              \u{1F504} Regenerate Thread
            </button>
          </div>
        `,a.appendChild(l);let c=o.querySelector(".btn-copy-all-thread"),g=o.querySelector(".copy-all-status");c.addEventListener("click",async()=>{await this.copyAllTweets(i,c,g,s)});let h=l.querySelector(".master-length-slider"),m=l.querySelector(".current-length"),p=l.querySelector(".btn-regenerate-thread"),w=l.querySelectorAll(".preset-btn");h.addEventListener("input",u=>{m.textContent=u.target.value}),w.forEach(u=>{u.addEventListener("click",()=>{let y=u.dataset.length;h.value=y,m.textContent=y})}),p.addEventListener("click",async()=>{let u=parseInt(h.value);await this.regenerateEntireThread(a,s,u,e)}),i.forEach((u,y)=>{let T=`Thread ${y+1}/${i.length}`,f=this.createTwitterCard(u,T,!0);f.dataset.platform=t,f.dataset.threadId=s,f.dataset.tweetIndex=y,f.dataset.totalTweets=i.length,f.dataset.isValidThread="true",a.appendChild(f),this.currentIncludeImagePrompt&&window.TabTalkImagePromptGenerator&&(async()=>{try{let v=`thread_${s}_tweet_${y+1}`,b=await window.TabTalkImagePromptGenerator.generatePromptForCard(v,u);if(b){f.dataset.imagePrompt=encodeURIComponent(b);let k=f.querySelector(".twitter-card-content");if(k&&!f.querySelector(".image-prompt-display")){let E=document.createElement("div");E.className="image-prompt-display",E.innerHTML=`
                      <div class="image-prompt-label">\u{1F5BC}\uFE0F Nano Banana Prompt (9:16)</div>
                      <div class="image-prompt-text">${this.escapeHtml(b)}</div>
                    `,k.appendChild(E)}else if(k){let E=f.querySelector(".image-prompt-text");E&&(E.textContent=b)}}}catch(v){console.warn("Image prompt generation for thread tweet failed:",v)}})()}),console.log(`\u2705 Thread rendered successfully: ${i.length} tweets, ${r} total chars`)}else{let i=this.createTwitterCard(e,"Post",!1,n);i.dataset.platform=t,n&&(i.dataset.imagePrompt=encodeURIComponent(n)),a.appendChild(i)}this.messagesContainer.appendChild(a),setTimeout(()=>{this.messagesContainer.scrollTo({top:this.messagesContainer.scrollHeight,behavior:"smooth"})},100)},isThreadContent:function(e){if(!e)return!1;if((e.platform||"").toLowerCase()==="thread"||(e.type||"").toLowerCase()==="thread"||(e.title||"").toLowerCase().includes("thread"))return!0;let n=(e.content||"").toLowerCase();return!!(n.includes("1/")&&n.includes("2/")||n.includes("1/8")||n.includes("1/7")||n.includes("1/6")||n.includes("1/5")||n.includes("1/4")||n.includes("1/3")||n.includes("\u{1F9F5}")||Array.isArray(e.tweets)&&e.tweets.length>1||e.totalTweets&&e.totalTweets>1)},parseTwitterThread:function(e){if(!e||typeof e!="string")return console.warn("parseTwitterThread: Invalid content provided"),[""];let n=this.cleanTwitterContent(e).replace(/Here\'s your clean.*?content:\s*/gi,"").trim(),a=this.tryStandardNumberedParsing(n);return a.length>1||(a=this.tryLineByLineParsing(n),a.length>1)||(a=this.tryFlexiblePatternParsing(n),a.length>1)||(a=this.tryContentBasedSplitting(n),a.length>1)?a:(console.warn("parseTwitterThread: Could not parse as multi-tweet thread, treating as single content"),[n||e||""])},tryStandardNumberedParsing:function(e){let t=[],n=/(\d+\/\d+[\s:]*)/g,a=e.split(n).filter(s=>s.trim()),i="";for(let s=0;s<a.length;s++){let o=a[s].trim();/^\d+\/\d+[\s:]*$/.test(o)?(i.trim()&&t.push(i.trim()),i=""):i+=o+" "}return i.trim()&&t.push(i.trim()),t.filter(s=>s.length>0)},tryLineByLineParsing:function(e){let t=[],n=e.split(`
`).filter(i=>i.trim()),a="";for(let i of n)/^\d+\/\d+/.test(i)?(a.trim()&&t.push(a.trim()),a=i.replace(/^\d+\/\d+[\s:]*/,"").trim()):a?a+=`
`+i:a=i;return a.trim()&&t.push(a.trim()),t.filter(i=>i.length>0)},tryFlexiblePatternParsing:function(e){let t=[],n=[/(?:^|\n)(\d+\/\d+)\s*[:\n]\s*([^]*?)(?=\n\d+\/\d+|\n*$)/g,/(?:^|\n)(\d+\/\d+)\s*\n\s*([^]*?)(?=\n\d+\/\d+|\n*$)/g,/(?:^|\n)(\d+)\/(\d+)\s*[:\n]\s*([^]*?)(?=\n\d+\/\d+|\n*$)/g];for(let a of n){let i;for(t.length=0;(i=a.exec(e))!==null;){let s=i[2]||i[1]||"";s.trim()&&t.push(s.trim())}if(t.length>1)break}return t.filter(a=>a.length>0)},tryContentBasedSplitting:function(e){let t=[],n=e.includes("\u{1F9F5}")||e.toLowerCase().includes("thread")||e.length>500,a=e.split(/\n\s*\n|\n---\n/).filter(s=>s.trim());if(a.length>1&&n)for(let s of a){let o=s.trim();o.length>15&&!o.match(/^🧵\s*thread\s*on\s*.*$/i)&&!o.match(/^\d+\.\s*$/)&&t.push(o)}if(t.length<=1&&e.length>600){let s=e.match(/[^.!?]+[.!?]+/g)||[e],o="";for(let r of s)this.getAccurateCharacterCount(o+r)<=280?o+=r:(o.trim()&&t.push(o.trim()),o=r);o.trim()&&t.push(o.trim())}let i=t.filter(s=>{let o=s.trim();return o.length>20&&!o.match(/^🧵\s*thread\s*on\s*.*$/i)&&!o.match(/^\d+\.\s*$/)});return i.length<2&&a.length<=2?[e.trim()]:i.length>0?i:[e.trim()]},createTwitterCard:function(e,t,n=!1,a=null){let i=document.createElement("div");i.className="twitter-card";let s=this.currentSelectedTone?`
        <div class="tone-badge" style="background: linear-gradient(135deg, ${this.currentSelectedTone.tone1?.color||this.getToneColor(this.currentSelectedTone.id)} 0%, ${this.currentSelectedTone.tone2?.color||this.getToneColor(this.currentSelectedTone.id)} 100%);">
          ${this.currentSelectedTone.tone1?.icon||this.getToneIcon(this.currentSelectedTone.id)} ${this.currentSelectedTone.name}
        </div>
      `:"",o=n?`
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
      `,r=a?`
        <div class="image-prompt-display">
          <div class="image-prompt-label">\u{1F5BC}\uFE0F Nano Banana Prompt (9:16)</div>
          <div class="image-prompt-text">${this.escapeHtml(a)}</div>
        </div>
      `:"";if(i.innerHTML=`
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
          ${o}
          ${r}
        </div>
      `,window.TabTalkUI&&window.TabTalkUI.addSaveButtonToCard){let m={id:Date.now().toString(),content:e,title:t},p=t.toLowerCase().includes("thread")?"thread":"twitter",w=i.querySelector(".twitter-header-actions");w&&window.TabTalkUI.addSaveButtonToCard(i,w,p,m)}let l=i.querySelector(".copy-btn"),c=i.querySelector(".twitter-text"),g=l.innerHTML;l.addEventListener("click",async m=>{m.stopPropagation();try{let p=c.value,w=i.dataset.imagePrompt?decodeURIComponent(i.dataset.imagePrompt):null,u=a||w;u&&(p+=`

---
\u{1F5BC}\uFE0F Nano Banana Prompt (9:16):
`+u),await navigator.clipboard.writeText(p),l.innerHTML=`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20,6 9,17 4,12"></polyline>
          </svg>`,l.classList.add("success"),setTimeout(()=>{l.innerHTML=g,l.classList.remove("success")},2e3)}catch(p){console.error("Copy failed:",p)}});let h=()=>{c.style.height="auto",c.style.height=Math.max(80,c.scrollHeight)+"px"};if(setTimeout(h,0),c.addEventListener("input",()=>{let m=i.querySelector(".twitter-char-count"),p=this.getAccurateCharacterCount(c.value);m.textContent=`${p} characters`,m.style.color="var(--text-secondary)",h()}),!n){let m=i.querySelector(".length-slider"),p=i.querySelector(".length-display"),w=i.querySelector(".regenerate-btn");m&&p&&m.addEventListener("input",()=>{p.textContent=m.value}),i.dataset.originalContent=this.pageContent,i.dataset.platform=t.includes("Thread")?"thread":"twitter",this.currentSelectedTone&&(i.dataset.selectedTone=JSON.stringify(this.currentSelectedTone)),w&&w.addEventListener("click",async()=>{let u=parseInt(m.value),y=i.dataset.platform,T=i.dataset.selectedTone?JSON.parse(i.dataset.selectedTone):this.currentSelectedTone;await this.regenerateWithLength(i,u,y,{selectedTone:T})})}return i},cleanTwitterContent:function(e){if(!e)return e;let t=e;t=t.replace(/^.*?Unacceptable.*?\n/gim,""),t=t.replace(/^.*?critical failure.*?\n/gim,""),t=t.replace(/^.*?forbidden.*?formatting.*?\n/gim,""),t=t.replace(/^.*?breaks the instructions.*?\n/gim,""),t=t.replace(/^.*?--[•\-]\s*Original Response:.*?\n/gim,""),t=t.replace(/^.*?You have used.*?\n/gim,""),t=t.replace(/^.*?This output is unusable.*?\n/gim,""),t=t.replace(/^.*?Here's your.*?content:.*?\n/gim,""),t=t.replace(/^.*?OUTPUT:.*?\n/gim,""),t=t.replace(/^.*?here's a rephrased version.*?\n/gim,""),t=t.replace(/^.*?rephrased version.*?\n/gim,""),t=t.replace(/^.*?aiming for.*?tone.*?\n/gim,""),t=t.replace(/^.*?preserving the original.*?\n/gim,""),t=t.replace(/^.*?while preserving.*?\n/gim,""),t=t.replace(/^.*?Okay, here's.*?\n/gim,""),t=t.replace(/^.*?Here's a.*?rephrased.*?\n/gim,""),t=t.replace(/^.*?rephrased.*?version.*?\n/gim,""),t=t.replace(/@[a-zA-Z0-9_]+/g,""),t=t.replace(/^[a-zA-Z0-9_]+:\s*/gm,""),t=t.replace(/\(?@[a-zA-Z0-9_]+\)?/g,""),t=t.replace(/\bby\s+@[a-zA-Z0-9_]+/gi,""),t=t.replace(/\bfrom\s+@[a-zA-Z0-9_]+/gi,""),t=t.replace(/\bvia\s+@[a-zA-Z0-9_]+/gi,""),t=t.replace(/\s+[^.!?]*\?$/gm,""),t=t.replace(/\s+(what do you think\?|what are your thoughts\?|what about you\?|and you\?|right\?|don't you think\?)$/gim,""),t=t.replace(/\n\s*[^.!?]*\?\s*$/gm,""),t=t.replace(/\s+(thoughts\?|opinions\?|ideas\?|comments\?)$/gim,""),t=t.replace(/#\w+/g,""),t=t.replace(/#/g,""),t=t.replace(/\*\*([^*]+)\*\*/g,"$1"),t=t.replace(/\*([^*]+)\*/g,"$1"),t=t.replace(/_{2,}([^_]+)_{2,}/g,"$1"),t=t.replace(/_([^_]+)_/g,"$1"),t=t.replace(/\*{2,}/g,""),t=t.replace(/_{2,}/g,""),t=t.replace(/\(line break\)/gi,`
`),t=t.replace(/\[line break\]/gi,`
`),t=t.replace(/^[-*]\s+/gm,"\u2022 "),t=t.replace(/https?:\/\/\S+/gi,""),t=t.replace(/\((https?:\/\/[^)]+)\)/gi,""),t=t.replace(/www\.\S+/gi,""),t=t.replace(/\[([^\]]+)\]\([^)]+\)/g,"$1"),t=t.replace(/\[([^\]]+)\]/g,"$1"),t=t.replace(/\(emphasis\)/gi,""),t=t.replace(/\(bold\)/gi,""),t=t.replace(/\(italic\)/gi,""),t=t.replace(/\n{3,}/g,`

`),t=t.replace(/[ \t]+/g," "),t=t.replace(/(^|\n)\s*$/g,""),t=t.trim();let n=t.length,a=t.replace(/[^\w\s]/g,"").length;return n>0&&a/n<.3?(console.warn("Detected garbled output, using fallback"),"Content generation encountered an issue. Please try again with a different tone or topic."):t},getAccurateCharacterCount:function(e){if(!e)return 0;let t=e.trim(),n=0,a=Array.from(t);for(let i of a)this.isEmojiOrSpecialChar(i)?n+=2:n+=1;return n},isEmojiOrSpecialChar:function(e){let t=e.codePointAt(0);return t>=126976&&t<=129535||t>=9728&&t<=9983||t>=9984&&t<=10175||t>=128512&&t<=128591||t>=127744&&t<=128511||t>=128640&&t<=128767||t>=127456&&t<=127487||t>=8205},regenerateWithLength:async function(e,t,n,a){let i=e.querySelector(".twitter-text"),s=e.querySelector(".regenerate-btn"),o=e.dataset.originalContent;s.textContent="\u23F3",s.disabled=!0;try{let r="",l="",c=a&&a.selectedTone||this.currentSelectedTone||{id:"agreeing",name:"Amplify & Agree"},g=c.aiInstructions||this.getDefaultToneInstructions(c.id),h=this.currentContentAnalysis||{summary:"Content provides valuable information.",keyInsights:"- Key points from the content",researchContext:"Apply general domain knowledge and best practices."};if(n==="twitter")r=`You are a thoughtful human writer who happens to be an expert Twitter/X content strategist. You write with genuine emotions, opinions, and lived experiences while leveraging deep domain knowledge. Your posts feel like they're coming from a real person who cares deeply about the topic - not a content machine.

You write naturally, with authentic emotional rhythms. Sometimes you're excited, sometimes skeptical, sometimes hopeful. You have real opinions and aren't afraid to show vulnerability or passion. Your insights come from both research and personal reflection.

Write in plain text only - no hashtags, no URLs, no formatting symbols. Just authentic human expression with strategic emojis that amplify real emotions.

CRITICAL CONTENT RULES:
- NEVER include Twitter handles (@username) or mention specific users
- NEVER end with questions for engagement (sounds unnatural)
- Write statements and observations, not conversation starters
- Focus on sharing thoughts, not soliciting responses
- IF USING EXPERT REPURPOSE: ONLY rephrase wording, NEVER change the message or intent

${g}

CONTEXT ANALYSIS:
${h.summary}

KEY INSIGHTS:
${h.keyInsights}

RESEARCH AUGMENTATION:
${h.researchContext}`,l=`Share your genuine thoughts about this content in ${t} characters - like you're talking to friends.

IMPORTANT: Be authentically YOU - create a fresh perspective that reflects your unique voice. Generation ID: ${Date.now()}

YOUR AUTHENTIC VOICE:
\u2713 Target: ${t} characters (\xB110 acceptable)
\u2713 Write with real emotions - excitement, curiosity, concern, hope, whatever feels genuine
\u2713 Use natural line breaks like you're actually thinking and breathing
\u2713 Add emojis only when they amplify real feelings (2-4 max, don't force it)
\u2713 Start with whatever's most interesting - not a manufactured "hook"
\u2713 Write conversationally (use contractions, casual language, even slang if it fits)
\u2713 Show your personality - be quirky, opinionated, passionate, or contemplative
\u2713 Mix short thoughts with longer reflections - natural human rhythm
\u2713 Share what actually matters to you about this topic
\u2713 Apply the ${c.name} tone authentically
\u2713 End with whatever's on your mind - a thought, a hope, a concern, a takeaway

KEEP IT AUTHENTIC:
\u2717 No hashtags or # symbols
\u2717 No bold/italic markdown
\u2717 No URLs
\u2717 No marketing language or "content strategist" speak
\u2717 No forced structures or templates
\u2717 NEVER mention Twitter handles or usernames
\u2717 NEVER end with questions for engagement

ORIGINAL CONTENT THAT INSPIRED YOUR THOUGHTS:
${o}

Share your authentic thoughts now:`;else if(n==="thread"){let p=Math.ceil(t/400);r=`You are a thoughtful human storyteller who crafts Twitter/X threads with genuine passion and curiosity. You write like someone who has lived experiences, formed real opinions, and developed expertise through actual engagement with the world. Your threads feel like conversations with a fascinating friend who happens to know a lot about the topic.

You write with authentic emotional depth - sometimes excited, sometimes questioning, sometimes passionate. You're not afraid to show vulnerability, admit uncertainty, or express strong feelings. Your expertise comes from both research and life experience, and you share it in a way that feels personal and relatable.

Write in plain text with strategic emojis that amplify real emotions - no hashtags, no URLs, no formatting symbols. Authentic human storytelling that resonates.

CRITICAL CONTENT RULES:
- NEVER include Twitter handles (@username) or mention specific users
- NEVER end tweets with questions for engagement (sounds unnatural)
- Write statements and observations, not conversation starters
- Focus on sharing thoughts, not soliciting responses

${g}

CONTEXT ANALYSIS:
${h.summary}

KEY INSIGHTS:
${h.keyInsights}

RESEARCH AUGMENTATION:
${h.researchContext}`,l=`Share your thoughts about this content as a Twitter thread - like you're telling a story to friends.

IMPORTANT: Be authentically YOU - explore what genuinely interests you about this topic. Generation ID: ${Date.now()}

CRITICAL FORMAT REQUIREMENT:
Start each tweet with: 1/n: 2/n: 3/n: etc.

YOUR NATURAL THREAD FLOW:
\u2713 Create ${p} numbered tweets (1/${p}, 2/${p}, etc.)
\u2713 Total: approximately ${t} characters
\u2713 Tweet 1: What first grabbed your attention or made you curious
\u2713 Tweet 2: Your initial thoughts or what surprised you
\u2713 Middle Tweets: Dive deeper into what fascinates you - insights, questions, personal connections
\u2713 Final Tweet: What you're left thinking or what you hope others consider

YOUR AUTHENTIC VOICE:
- Write with real emotions and curiosity
- Be conversational (use contractions, casual language)
- Show your personality - be thoughtful, excited, questioning, passionate
- Include 1-2 emojis per tweet only when they amplify real feelings
- Use natural line breaks like you're actually talking
- Share personal insights or connections when they feel genuine
- Apply the ${c.name} tone authentically

KEEP IT REAL:
- No hashtags or formatting symbols
- No marketing speak or "content strategist" language
- No forced structures - let the story flow naturally
- No URLs
\u2717 NEVER mention Twitter handles or usernames
\u2717 NEVER end tweets with questions for engagement

ORIGINAL CONTENT THAT INSPIRED YOUR THREAD:
${o}

Share your authentic thread now:`}let m=await this.callGeminiAPIWithSystemPrompt(r,l);if(m){let p=this.cleanTwitterContent(m);if(n==="thread"){let T=this.parseTwitterThread(p)[0]||p;i.value=T}else i.value=p;let w=e.querySelector(".twitter-char-count"),u=this.getAccurateCharacterCount(i.value);w.textContent=`${u} characters`,setTimeout(()=>{i.style.height="auto",i.style.height=Math.max(80,i.scrollHeight)+"px"},0)}}catch(r){console.error("Error regenerating content:",r),alert("Error regenerating content. Please try again.")}finally{s.textContent="\u{1F504}",s.disabled=!1}},getDefaultToneInstructions:function(e){let t={"fact-check":`TONE: Fact Check
- Systematic claim verification
- Evidence-based analysis
- Objective truth-seeking`,"hypocrite-buster":`TONE: Hypocrite Buster
- Identify contradictions or double standards in the content
- Point out when arguments conflict with obvious counterexamples
- Use logical takedowns based on the content itself`,contradictory:`TONE: Fact Check & Counter
- Counter-evidence challenges
- Alternative perspectives
- Evidence-based disagreement`,trolling:`TONE: Savage & Smart
- Playful jabs with data backing
- Internet culture references
- Fun but factual`,funny:`TONE: Funny
- Humorous analogies
- Pop culture references
- Witty, accessible humor`,"deeper-insights":`TONE: Deeper Insights
- Hidden pattern revelation
- Interdisciplinary connections
- Non-obvious implications`,"clever-observations":`TONE: Clever Observations
- Smart cultural references
- Current slang and memes
- Playful intelligence`,"industry-insights":`TONE: Industry Insights
- Professional expertise
- Market analysis
- Technical terminology`,repurpose:`TONE: Expert Repurpose
- CRITICAL: You MUST rephrase the EXACT same content with better wording
- Preserve the original message, intent, and meaning completely
- Only improve HOW it's said - the wording, flow, and structure`};return t[e]||t.agreeing},getToneColor:function(e){return{"fact-check":"var(--accent-medium)",agreeing:"var(--accent-color)",contradictory:"var(--accent-light)",trolling:"var(--accent-light)",funny:"var(--accent-light)","deeper-insights":"var(--accent-color)","clever-observations":"var(--accent-medium)","industry-insights":"var(--accent-color)",repurpose:"var(--accent-color)","hypocrite-buster":"var(--accent-light)"}[e]||"var(--accent-color)"},getToneIcon:function(e){return{"fact-check":"\u{1F50D}",agreeing:"\u{1F91D}",contradictory:"\u2694\uFE0F",trolling:"\u{1F608}",funny:"\u{1F602}","deeper-insights":"\u{1F4A1}","clever-observations":"\u{1F9E0}","industry-insights":"\u{1F4CA}",repurpose:"\u2728","hypocrite-buster":"\u{1F3AF}"}[e]||"\u{1F91D}"},autoSaveThread:async function(e,t,n){if(!window.TabTalkStorage||!window.TabTalkStorage.saveContent){console.warn("Storage module not available for gallery persistence");return}try{let a=Array.isArray(t)?t:[];a.length===0&&n&&(a=this.parseTwitterThread(n));let i=a.length>0?a.map((s,o)=>`${o+1}/${a.length}:
${s}`).join(`

---

`):String(n||"");await window.TabTalkStorage.saveContent("twitter",{id:e,type:"thread",platform:"thread",title:this.currentTab?.title||"Untitled Thread",url:this.currentTab?.url||"",domain:this.currentDomain||"",content:i,tweets:a.map((s,o)=>({id:`tweet_${o+1}`,number:`${o+1}/${a.length}`,content:s,charCount:this.getAccurateCharacterCount(s)})),rawContent:n,totalTweets:a.length,totalChars:a.length>0?this.getTotalChars(a):this.getAccurateCharacterCount(i),isAutoSaved:!0,timestamp:Date.now(),updatedAt:Date.now(),isThread:!0,hasThreadStructure:a.length>1}),console.log("\u2705 Thread auto-saved to Gallery with bulletproof metadata:",e),this.showAutoSaveNotification()}catch(a){console.error("Error auto-saving thread to Gallery:",a)}},copyAllTweets:async function(e,t,n,a=null){try{let i=[];a&&(i=Array.from(document.querySelectorAll(`.twitter-card[data-thread-id="${a}"]`)).map(r=>(r.dataset.imagePrompt?decodeURIComponent(r.dataset.imagePrompt):null)||null));let s=e.map((o,r)=>{let c=`${`${r+1}/${e.length}:`}
${o}`,g=i[r];return g?`${c}

---
\u{1F5BC}\uFE0F Nano Banana Prompt (9:16):
${g}`:c}).join(`

---

`);await navigator.clipboard.writeText(s),t.classList.add("hidden"),n.classList.remove("hidden"),setTimeout(()=>{t.classList.remove("hidden"),n.classList.add("hidden")},3e3),console.log("\u2705 All tweets (with prompts if available) copied to clipboard")}catch(i){console.error("Error copying all tweets:",i),alert("Failed to copy tweets. Please try again.")}},getTotalChars:function(e){return e.reduce((t,n)=>t+this.getAccurateCharacterCount(n),0)},showAutoSaveNotification:function(){let e=document.createElement("div");e.className="auto-save-notification",e.innerHTML="\u{1F4BE} Thread auto-saved",e.style.cssText=`
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
      `,document.body.appendChild(e),setTimeout(()=>{e.style.animation="slideOutDown 0.3s ease",setTimeout(()=>e.remove(),300)},2e3)},regenerateEntireThread:async function(e,t,n,a){let i=e.querySelector(".btn-regenerate-thread");if(!i)return;let s=i.textContent;i.textContent="\u23F3 Regenerating...",i.disabled=!0;try{let o=Math.max(3,Math.min(8,Math.ceil(n/500))),r=`You are a world-class research analyst and subject matter expert who creates the most comprehensive, data-driven Twitter threads ever published. Your work is cited by academics, journalists, and industry leaders for its depth, accuracy, and groundbreaking insights.

Your expertise includes:
- Advanced research methodology and data analysis
- Cross-disciplinary knowledge integration
- Statistical analysis and evidence-based reasoning
- Historical context and trend identification
- Technical deep-dives with practical applications
- Economic analysis and market dynamics
- Scientific principles and empirical evidence

You write with intellectual rigor while maintaining accessibility. Every claim is supported by verifiable data, every insight is backed by research, and every conclusion follows logically from the evidence presented. Your threads become reference material that people bookmark and return to repeatedly.

Write in plain text with precise, professional language - no hashtags, no URLs, no formatting symbols. Pure expert-level analysis with strategic emojis that emphasize key insights.`,l=`Generate a comprehensive, expert-level research thread based on this content.

CRITICAL REQUIREMENTS:
- Create reference-quality content that becomes the definitive analysis on this topic
- Include verifiable facts, specific figures, statistical data, and concrete evidence
- Provide deep technical insights with practical applications and implications
- Synthesize information from multiple disciplines and perspectives
- Maintain academic rigor while ensuring accessibility for educated readers

FORMAT REQUIREMENT:
Start each tweet with: 1/${o}: 2/${o}: 3/${o}: etc.

EXPERT THREAD STRUCTURE:
1/${o}: Executive Summary - Core thesis, significance, and key findings upfront
2/${o}: Historical Context & Evolution - How we arrived at current understanding
3-${o-2}: Deep Analysis - Technical details, data patterns, causal relationships, case studies, empirical evidence
${o-1}: Practical Implications - Real-world applications, future projections, strategic considerations
${o}: Conclusions & Further Research - Key takeaways, unanswered questions, next steps for investigation

RESEARCH STANDARDS:
\u2713 Include specific numbers, percentages, dates, and measurable metrics
\u2713 Cite studies, reports, or data sources when relevant
\u2713 Explain technical concepts with precision and clarity
\u2713 Identify causal relationships vs. correlations
\u2713 Address counterarguments and limitations
\u2713 Provide actionable insights based on evidence
\u2713 Use professional terminology with explanations when needed
\u2713 Include 1-2 strategic emojis to highlight critical insights

CONTENT QUALITY:
- Every claim must be supported by evidence or logical reasoning
- Include surprising or counterintuitive findings that challenge conventional wisdom
- Connect abstract concepts to concrete real-world examples
- Demonstrate depth of knowledge through nuanced analysis
- Balance technical accuracy with readability

SOURCE CONTENT FOR ANALYSIS:
${this.pageContent||a}

Generate your expert research thread now:`,c=await this.callGeminiAPIWithSystemPrompt(r,l);if(c){let g=this.cleanTwitterContent(c),h=this.parseTwitterThread(g);e.querySelectorAll(".twitter-card").forEach(y=>y.remove()),h.forEach((y,T)=>{let f=`Thread ${T+1}/${h.length}`,v=this.createTwitterCard(y,f,!0);v.dataset.platform="thread",v.dataset.threadId=t,e.appendChild(v)});let p=e.querySelector(".thread-meta");p&&(p.textContent=`${h.length} tweets \u2022 ${this.getTotalChars(h)} chars`);let w=e.querySelector(".current-length");w&&(w.textContent=this.getTotalChars(h));let u=e.querySelector(".master-length-slider");u&&(u.value=this.getTotalChars(h)),await this.autoSaveThread(t,h,g),console.log("\u2705 Thread regenerated successfully")}}catch(o){console.error("Error regenerating thread:",o),alert("Failed to regenerate thread. Please try again.")}finally{i.textContent=s,i.disabled=!1}},escapeHtml:function(e){let t=document.createElement("div");return t.textContent=e,t.innerHTML}};window.TabTalkTwitter=d})();(function(){let d={selectedTone:null,appInstance:null,init:function(){this.createModalEvents(),this.populateReplyTones()},showWithContentLoading:async function(e){if(this.appInstance=e,!e.pageContent||!e.apiKey)if(e.apiKey)await e.getAndCachePageContent();else{this.showToast("\u274C Please set up your Gemini API key first.",3e3);return}this.showModal()},createModalEvents:function(){let e=document.querySelector(".repost-modal-close"),t=document.querySelector("#repost-modal .tone-modal-overlay"),n=document.getElementById("repost-cancel-btn");e?.addEventListener("click",()=>this.hideModal()),t?.addEventListener("click",()=>this.hideModal()),n?.addEventListener("click",()=>this.hideModal()),document.getElementById("repost-generate-btn")?.addEventListener("click",()=>this.handleGenerate()),document.addEventListener("keydown",i=>{i.key==="Escape"&&!document.getElementById("repost-modal").classList.contains("hidden")&&this.hideModal()})},populateReplyTones:function(){let e=document.querySelector("#repost-modal .tone-grid");if(!e||!window.TabTalkToneSelector)return;let t=Object.values(window.TabTalkToneSelector.toneDefinitions).filter(a=>a.category==="reply"&&a.id!=="fact-check");e.innerHTML=t.map(a=>`
        <div class="tone-option repost-tone-option" 
             data-tone-id="${a.id}" 
             data-category="${a.category}"
             data-subcategory="${a.subcategory}"
             role="radio"
             aria-checked="false"
             tabindex="0">
          <div class="tone-icon">${a.icon}</div>
          <div class="tone-info">
            <div class="tone-name">${a.name}</div>
            <div class="tone-description">${a.description}</div>
          </div>
          <div class="tone-check">\u2713</div>
        </div>
      `).join(""),e.querySelectorAll(".repost-tone-option").forEach(a=>{a.addEventListener("click",()=>this.selectTone(a)),a.addEventListener("keydown",i=>{(i.key==="Enter"||i.key===" ")&&(i.preventDefault(),this.selectTone(a))})})},showModal:function(){let e=document.getElementById("repost-modal");if(!e)return;e.classList.remove("hidden"),e.setAttribute("aria-hidden","false"),e.querySelector(".repost-tone-option")?.focus()},hideModal:function(){let e=document.getElementById("repost-modal");e&&(e.classList.add("hidden"),e.setAttribute("aria-hidden","true"),this.resetSelections())},selectTone:function(e){document.querySelectorAll(".repost-tone-option").forEach(i=>{i.classList.remove("selected"),i.setAttribute("aria-checked","false")}),e.classList.add("selected"),e.setAttribute("aria-checked","true");let n=e.dataset.toneId;this.selectedTone=window.TabTalkToneSelector?.toneDefinitions[n];let a=document.getElementById("repost-generate-btn");a&&(a.disabled=!1)},resetSelections:function(){this.selectedTone=null,document.querySelectorAll(".repost-tone-option").forEach(a=>{a.classList.remove("selected"),a.setAttribute("aria-checked","false")});let t=document.getElementById("repost-generate-btn");t&&(t.disabled=!0);let n=document.getElementById("repost-include-image-prompt");n&&(n.checked=!1)},handleGenerate:async function(){let e=this.selectedTone;if(!e){this.showToast("\u274C Please select a tone first.",2e3);return}if(!this.appInstance){this.showToast("\u274C App not initialized.",3e3);return}let t=document.getElementById("repost-include-image-prompt")?.checked||!1;this.hideModal();let n=e;console.log("Repost: Generating with tone:",n),console.log("Repost: Include image prompt:",t),window.TabTalkTwitter&&window.TabTalkTwitter.generateSocialContentWithTone?await window.TabTalkTwitter.generateSocialContentWithTone.call(this.appInstance,"twitter",n,t):this.appInstance.generateSocialContentWithTone?await this.appInstance.generateSocialContentWithTone("twitter",n,t):(this.showToast("\u274C Content generation not available.",3e3),console.error("TabTalkTwitter module or generateSocialContentWithTone method not found"),console.error("Available on appInstance:",Object.keys(this.appInstance)))},showToast:function(e,t=3e3){window.TabTalkUI?.showToast?window.TabTalkUI.showToast(e,t):console.log("Toast:",e)}};window.TabTalkRepostModal=d,document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>d.init()):d.init()})();(function(){let d={knowledgePacks:{},modalInitialized:!1,popupInstance:null,init:function(){this.modalInitialized||(this.createModalHTML(),this.bindModalEvents(),this.modalInitialized=!0)},createModalHTML:function(){document.getElementById("thread-generator-modal")||document.body.insertAdjacentHTML("beforeend",`
        <div id="thread-generator-modal" class="tone-modal hidden" role="dialog" aria-labelledby="thread-gen-title" aria-modal="true">
          <div class="tone-modal-overlay"></div>
          <div class="tone-modal-content">
            <div class="tone-modal-header">
              <h2 id="thread-gen-title">Create Thread</h2>
              <button class="tone-modal-close" aria-label="Close">&times;</button>
            </div>
            
            <div class="tone-grid" style="padding: 24px;">
              <div class="form-group" style="margin-bottom: 20px;">
                <label style="display: block; font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">Topic</label>
                <input type="text" id="modal-thread-topic" class="builder-select" placeholder="e.g., The future of artificial intelligence" style="width: 100%; padding: 10px 12px; border-radius: 10px; font-size: 14px;" />
                <small style="display: block; margin-top: 6px; font-size: 11px; color: var(--text-secondary);">Enter any topic you want to create a thread about</small>
              </div>
              
              <div class="form-group" style="margin-bottom: 8px;">
                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                  <input type="checkbox" id="modal-use-knowledge-pack" checked style="width: 16px; height: 16px;" />
                  <span style="font-size: 13px; font-weight: 500; color: var(--text-primary);">Use AI Knowledge Base</span>
                </label>
                <small style="display: block; margin-top: 4px; margin-left: 24px; font-size: 11px; color: var(--text-secondary);">Includes curated facts and hooks</small>
              </div>

              <div class="form-group" style="margin-bottom: 8px; margin-top: 6px;">
                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                  <input type="checkbox" id="modal-include-image-prompts" style="width: 16px; height: 16px;" />
                  <span style="font-size: 13px; font-weight: 500; color: var(--text-primary);">Generate per\u2011tweet Image Prompts (9:16)</span>
                </label>
                <small style="display: block; margin-top: 4px; margin-left: 24px; font-size: 11px; color: var(--text-secondary);">Live only. Not saved to Gallery.</small>
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
      `)},bindModalEvents:function(){let e=document.getElementById("thread-generator-modal");if(!e)return;let t=e.querySelector(".tone-modal-close"),n=e.querySelector(".tone-modal-overlay"),a=document.getElementById("thread-gen-cancel-btn"),i=document.getElementById("thread-gen-generate-btn");t?.addEventListener("click",()=>this.hideModal()),n?.addEventListener("click",()=>this.hideModal()),a?.addEventListener("click",()=>this.hideModal()),i?.addEventListener("click",()=>this.handleGenerate()),e.addEventListener("keydown",s=>{s.key==="Escape"&&this.hideModal()})},showModal:function(e){if(e)d.popupInstance=e,console.log("ThreadGenerator: Stored popup instance, has apiKey:",!!e.apiKey);else{console.error("ThreadGenerator: No popup instance provided to showModal"),alert("Unable to open thread generator. Please refresh and try again.");return}d.init();let t=document.getElementById("thread-generator-modal");if(!t)return;t.classList.remove("hidden"),t.setAttribute("aria-hidden","false"),document.getElementById("modal-thread-topic")?.focus()},hideModal:function(){let e=document.getElementById("thread-generator-modal");e&&(e.classList.add("hidden"),e.setAttribute("aria-hidden","true"))},handleGenerate:async function(){let e=document.getElementById("modal-thread-topic")?.value?.trim(),t=document.getElementById("modal-use-knowledge-pack")?.checked;if(!e){alert("Please enter a topic");return}console.log("ThreadGenerator: handleGenerate called"),console.log("ThreadGenerator: popupInstance exists:",!!d.popupInstance),console.log("ThreadGenerator: popupInstance has apiKey:",!!d.popupInstance?.apiKey),console.log("ThreadGenerator: popupInstance has generateThreadMVP:",!!d.popupInstance?.generateThreadMVP),d.hideModal(),d.popupInstance&&d.popupInstance.resetScreenForGeneration&&d.popupInstance.resetScreenForGeneration(),d.popupInstance&&d.popupInstance.generateThreadMVP?await d.popupInstance.generateThreadMVP(e,{useKnowledgePack:t,maxTweets:8,tone:"curious"}):(console.error("Popup instance not available for thread generation"),console.error("popupInstance:",d.popupInstance),alert("Unable to generate thread. Please try again."))},loadKnowledgePack:async function(e){if(this.knowledgePacks[e])return this.knowledgePacks[e];try{let t=await fetch(`knowledge-packs/${e}.json`);if(!t.ok)return console.warn(`Knowledge pack not found for ${e}`),null;let n=await t.json();return this.knowledgePacks[e]=n,n}catch(t){return console.error(`Error loading knowledge pack for ${e}:`,t),null}},getRandomHook:function(e){if(!e||!e.hooks||e.hooks.length===0)return null;let t=Math.floor(Math.random()*e.hooks.length);return e.hooks[t]},optimizeThreadLength:async function(e){try{let t=`Analyze this topic and determine the optimal Twitter thread length: "${e}"

Rate the topic complexity on a scale of 1-10:
1-3: Simple concepts (basic tips, opinions, quick takeaways)
4-6: Moderate complexity (explanations, how-to guides, analysis)
7-8: Complex topics (technical deep-dives, research, multi-faceted issues)
9-10: Very complex (academic subjects, comprehensive analysis, expert-level content)

Also consider:
- Does it require examples and case studies? (+1-2 tweets)
- Does it need historical context? (+1 tweet)
- Are there multiple subtopics to cover? (+1-3 tweets)
- Does it benefit from data and evidence? (+1-2 tweets)

RESPONSE FORMAT:
Just return a number between 3 and 12 for the optimal tweet count.

Topic: "${e}"`,n=await window.TabTalkAPI?.callGeminiAPI(t);if(n){let a=parseInt(n.trim());return Math.max(3,Math.min(12,a||8))}}catch(t){console.warn("Smart length optimization failed, using default:",t)}return 8},generateThreadMVP:async function(e,t={}){let n=this;if(!n.apiKey){alert("\u274C Please set up your Gemini API key first."),n.showView&&n.showView("settings");return}let a=t.useKnowledgePack!==!1,i=t.maxTweets||8,s=t.tone||"curious";t.maxTweets||(i=await this.optimizeThreadLength(e),console.log(`Smart optimization: Set thread length to ${i} tweets for topic: ${e}`)),n.setLoading(!0,"Generating thread..."),console.log(`Fibr: Generating thread for topic: ${e}`);try{let o="";a&&(o=`

RELEVANT KNOWLEDGE BASE:
\u2022 Include verifiable facts, statistics, and expert insights about the topic
\u2022 Reference historical context, recent developments, and future trends
\u2022 Incorporate scientific principles, case studies, and real-world examples
\u2022 Add surprising data points and counterintuitive findings
\u2022 Include practical applications and implications
`),n.showProgressBar&&n.showProgressBar("Generating thread...");let r="You are a precise thread outline creator. You create structured outlines for engaging Twitter/X threads. No markdown, no hashtags.",l=`Create a ${i}-tweet thread outline about: ${e}

Tone: ${s}
${o}

Create an outline with ${i} beats:
- Beat 1: Hook (attention-grabbing opener)
- Beats 2-${i-1}: Core content (facts, insights, twists)
- Beat ${i}: Closer (memorable ending)

Format each beat as:
[Beat number]: [One-sentence description]

Generate the outline now:`,c=await n.callGeminiAPIWithSystemPrompt(r,l);if(!c)throw new Error("Failed to generate outline");console.log("\u2705 Outline generated");let g="You are a masterful Twitter/X thread storyteller. You craft threads that captivate readers. Each tweet pulses with energy and personality. Write in plain text with strategic emojis - no hashtags, no URLs, no formatting symbols.",h=`Transform this outline into a complete ${i}-tweet thread about: ${e}

OUTLINE:
${c}

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

${o}

OUTPUT EXAMPLE:
1/${i}:
[Hook content here]

2/${i}:
[Content here]

Generate the complete thread now:`,m=await n.callGeminiAPIWithSystemPrompt(g,h);if(!m)throw new Error("Failed to expand thread");console.log("\u2705 Thread expanded");let p=n.cleanTwitterContent(m),w=n.parseTwitterThread(p),u=[];for(let T of w)if(n.getAccurateCharacterCount(T)<=280)u.push(T);else{let v=await d.smartSplitTweet.call(n,T,280);u.push(...v)}console.log(`\u2705 Thread generated: ${u.length} tweets`);let y=`thread_${Date.now()}`;d.renderThreadGeneratorResult.call(n,u,y,e,a),n.autoSaveThread&&await n.autoSaveThread(y,u,p),await n.saveState()}catch(o){console.error("Error generating thread:",o),alert(`\u274C Error generating thread: ${o.message}`)}finally{n.setLoading(!1),n.hideProgressBar&&n.hideProgressBar()}},smartSplitTweet:async function(e,t){let n=e.match(/[^.!?]+[.!?]+/g)||[e],a=[],i="";for(let s of n)this.getAccurateCharacterCount(i+s)<=t?i+=s:(i&&a.push(i.trim()),i=s);return i&&a.push(i.trim()),a.length>0?a:[e.substring(0,t)]},renderThreadGeneratorResult:function(e,t,n,a=!0){let i=document.createElement("div");i.className="twitter-content-container thread-generator-result",i.dataset.topic=n,i.dataset.useKnowledgePack=a;let s=document.createElement("div");s.className="thread-header";let o=this.getTotalChars(e);s.innerHTML=`
        <div class="thread-info">
          <span class="thread-icon">\u{1F9F5}</span>
          <div class="thread-title-group">
            <span class="thread-title">${n}</span>
            <span class="thread-category">AI Generated</span>
          </div>
          <span class="thread-meta">${e.length} tweets \u2022 ${o} chars</span>
        </div>
        <div class="thread-actions">
          <button class="btn-copy-all-thread" data-thread-id="${t}" title="Copy all tweets">
            \u{1F4CB} Copy All
          </button>
          <span class="copy-all-status hidden">\u2713 All Copied!</span>
        </div>
      `,i.appendChild(s);let r=s.querySelector(".btn-copy-all-thread"),l=s.querySelector(".copy-all-status");r.addEventListener("click",async()=>{await this.copyAllTweets(e,r,l,t)});let c=document.createElement("div");c.className="thread-master-control",c.innerHTML=`
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
            <input type="range" class="master-length-slider" min="500" max="5000" value="${o}" step="100" data-thread-id="${t}">
            <span class="slider-max">5000</span>
          </div>
          <div class="slider-value">
            <span class="current-length">${o}</span> characters total
          </div>
        </div>
        <div class="master-control-actions">
          <button class="btn-regenerate-thread" data-thread-id="${t}" title="Regenerate entire thread with new length">
            \u{1F504} Regenerate Thread
          </button>
        </div>
      `,i.appendChild(c);let g=c.querySelector(".master-length-slider"),h=c.querySelector(".current-length"),m=c.querySelector(".btn-regenerate-thread"),p=c.querySelectorAll(".preset-btn");g.addEventListener("input",u=>{h.textContent=u.target.value}),p.forEach(u=>{u.addEventListener("click",()=>{let y=u.dataset.length;g.value=y,h.textContent=y})}),m.addEventListener("click",async()=>{let u=parseInt(g.value);await this.regenerateEntireThreadForGenerator(i,t,u,n,a)});let w=document.getElementById("modal-include-image-prompts")?.checked;e.forEach((u,y)=>{let T=`Thread ${y+1}/${e.length}`,f=this.createTwitterCard(u,T,!0);f.dataset.platform="thread",f.dataset.threadId=t,i.appendChild(f),w&&window.TabTalkImagePromptGenerator&&(async()=>{try{let v=`threadgen_${t}_tweet_${y+1}`,b=await window.TabTalkImagePromptGenerator.generatePromptForCard(v,u);if(b){f.dataset.imagePrompt=encodeURIComponent(b);let k=f.querySelector(".twitter-card-content");if(k&&!f.querySelector(".image-prompt-display")){let E=document.createElement("div");E.className="image-prompt-display",E.innerHTML=`
                    <div class="image-prompt-label">\u{1F5BC}\uFE0F Nano Banana Prompt (9:16)</div>
                    <div class="image-prompt-text">${window.TabTalkUI?.escapeHtml?window.TabTalkUI.escapeHtml(b):b}</div>
                  `,k.appendChild(E)}}}catch(v){console.warn("Thread Generator: image prompt generation failed:",v)}})()}),this.messagesContainer.appendChild(i),setTimeout(()=>{this.messagesContainer.scrollTo({top:this.messagesContainer.scrollHeight,behavior:"smooth"})},100)},regenerateEntireThreadForGenerator:async function(e,t,n,a,i){let s=e.querySelector(".btn-regenerate-thread");if(!s)return;let o=s.textContent;s.textContent="\u23F3 Regenerating...",s.disabled=!0;try{let r=Math.max(3,Math.min(12,Math.ceil(n/400))),l="";i&&(l=`

RELEVANT KNOWLEDGE BASE:
\u2022 Include verifiable facts, statistics, and expert insights about the topic
\u2022 Reference historical context, recent developments, and future trends
\u2022 Incorporate scientific principles, case studies, and real-world examples
\u2022 Add surprising data points and counterintuitive findings
\u2022 Include practical applications and implications
`);let c=`You are a world-class research analyst and subject matter expert who creates the most comprehensive, data-driven Twitter threads ever published. Your work is cited by academics, journalists, and industry leaders for its depth, accuracy, and groundbreaking insights.

Your expertise includes:
- Advanced research methodology and data analysis
- Cross-disciplinary knowledge integration
- Statistical analysis and evidence-based reasoning
- Historical context and trend identification
- Technical deep-dives with practical applications
- Economic analysis and market dynamics
- Scientific principles and empirical evidence

You write with intellectual rigor while maintaining accessibility. Every claim is supported by verifiable data, every insight is backed by research, and every conclusion follows logically from the evidence presented. Your threads become reference material that people bookmark and return to repeatedly.

Write in plain text with precise, professional language - no hashtags, no URLs, no formatting symbols. Pure expert-level analysis with strategic emojis that emphasize key insights.`,g=`Generate a comprehensive, expert-level research thread on: ${a}

CRITICAL REQUIREMENTS:
- Create reference-quality content that becomes the definitive analysis on this topic
- Include verifiable facts, specific figures, statistical data, and concrete evidence
- Provide deep technical insights with practical applications and implications
- Synthesize information from multiple disciplines and perspectives
- Maintain academic rigor while ensuring accessibility for educated readers

FORMAT REQUIREMENT:
Start each tweet with: 1/${r}: 2/${r}: 3/${r}: etc.

EXPERT THREAD STRUCTURE:
1/${r}: Executive Summary - Core thesis, significance, and key findings upfront
2/${r}: Historical Context & Evolution - How we arrived at current understanding
3-${r-2}: Deep Analysis - Technical details, data patterns, causal relationships, case studies, empirical evidence
${r-1}: Practical Implications - Real-world applications, future projections, strategic considerations
${r}: Conclusions & Further Research - Key takeaways, unanswered questions, next steps for investigation

RESEARCH STANDARDS:
\u2713 Include specific numbers, percentages, dates, and measurable metrics
\u2713 Cite studies, reports, or data sources when relevant
\u2713 Explain technical concepts with precision and clarity
\u2713 Identify causal relationships vs. correlations
\u2713 Address counterarguments and limitations
\u2713 Provide actionable insights based on evidence
\u2713 Use professional terminology with explanations when needed
\u2713 Include 1-2 strategic emojis to highlight critical insights

CONTENT QUALITY:
- Every claim must be supported by evidence or logical reasoning
- Include surprising or counterintuitive findings that challenge conventional wisdom
- Connect abstract concepts to concrete real-world examples
- Demonstrate depth of knowledge through nuanced analysis
- Balance technical accuracy with readability

${l}

Generate your expert research thread now:`,h=await this.callGeminiAPIWithSystemPrompt(c,g);if(h){let m=this.cleanTwitterContent(h),p=this.parseTwitterThread(m);e.querySelectorAll(".twitter-card").forEach(f=>f.remove()),p.forEach((f,v)=>{let b=`Thread ${v+1}/${p.length}`,k=this.createTwitterCard(f,b,!0);k.dataset.platform="thread",k.dataset.threadId=t,e.appendChild(k)});let u=e.querySelector(".thread-meta");u&&(u.textContent=`${p.length} tweets \u2022 ${this.getTotalChars(p)} chars`);let y=e.querySelector(".current-length");y&&(y.textContent=this.getTotalChars(p));let T=e.querySelector(".master-length-slider");T&&(T.value=this.getTotalChars(p)),this.autoSaveThread&&await this.autoSaveThread(t,p,m),console.log("\u2705 Thread regenerated successfully")}}catch(r){console.error("Error regenerating thread:",r),alert("Failed to regenerate thread. Please try again.")}finally{s.textContent=o,s.disabled=!1}},showThreadGeneratorView:function(){document.getElementById("thread-generator-view")&&this.showView("thread-generator")},initializeHowItWorksToggle:function(){let e=document.getElementById("how-it-works-toggle"),t=document.getElementById("how-it-works-content");!e||!t||(t.classList.remove("expanded"),e.classList.remove("expanded"),e.addEventListener("click",()=>{t.classList.contains("expanded")?(t.classList.remove("expanded"),e.classList.remove("expanded")):(t.classList.add("expanded"),e.classList.add("expanded"))}))},handleThreadGeneratorSubmit:async function(){let e=document.getElementById("thread-topic"),t=document.getElementById("use-knowledge-pack");if(!e){console.error("Thread generator form elements not found");return}let n=e.value.trim();if(!n){window.TabTalkUI?.showToast("Please enter a topic",2e3);return}let a=t?t.checked:!0;try{let i=document.getElementById("generate-thread-btn"),s=i.textContent;i.textContent="\u23F3 Generating...",i.disabled=!0;let o=Math.max(3,Math.min(8,Math.ceil(2e3/400))),r="";a&&(r=`

RELEVANT KNOWLEDGE BASE:
\u2022 Include verifiable facts, statistics, and expert insights about the topic
\u2022 Reference historical context, recent developments, and future trends
\u2022 Incorporate scientific principles, case studies, and real-world examples
\u2022 Add surprising data points and counterintuitive findings
\u2022 Include practical applications and implications
`);let l=`You are a world-class research analyst and subject matter expert who creates the most comprehensive, data-driven Twitter threads ever published. Your work is cited by academics, journalists, and industry leaders for its depth, accuracy, and groundbreaking insights.

Your expertise includes:
- Advanced research methodology and data analysis
- Cross-disciplinary knowledge integration
- Statistical analysis and evidence-based reasoning
- Historical context and trend identification
- Technical deep-dives with practical applications
- Economic analysis and market dynamics
- Scientific principles and empirical evidence

You write with intellectual rigor while maintaining accessibility. Every claim is supported by verifiable data, every insight is backed by research, and every conclusion follows logically from the evidence presented. Your threads become reference material that people bookmark and return to repeatedly.

Write in plain text with precise, professional language - no hashtags, no URLs, no formatting symbols. Pure expert-level analysis with strategic emojis that emphasize key insights.`,c=`Generate a comprehensive, expert-level research thread on: ${n}

CRITICAL REQUIREMENTS:
- Create reference-quality content that becomes the definitive analysis on this topic
- Include verifiable facts, specific figures, statistical data, and concrete evidence
- Provide deep technical insights with practical applications and implications
- Synthesize information from multiple disciplines and perspectives
- Maintain academic rigor while ensuring accessibility for educated readers

FORMAT REQUIREMENT:
Start each tweet with: 1/${o}: 2/${o}: 3/${o}: etc.

EXPERT THREAD STRUCTURE:
1/${o}: Executive Summary - Core thesis, significance, and key findings upfront
2/${o}: Historical Context & Evolution - How we arrived at current understanding
3-${o-2}: Deep Analysis - Technical details, data patterns, causal relationships, case studies, empirical evidence
${o-1}: Practical Implications - Real-world applications, future projections, strategic considerations
${o}: Conclusions & Further Research - Key takeaways, unanswered questions, next steps for investigation

RESEARCH STANDARDS:
\u2713 Include specific numbers, percentages, dates, and measurable metrics
\u2713 Cite studies, reports, or data sources when relevant
\u2713 Explain technical concepts with precision and clarity
\u2713 Identify causal relationships vs. correlations
\u2713 Address counterarguments and limitations
\u2713 Provide actionable insights based on evidence
\u2713 Use professional terminology with explanations when needed
\u2713 Include 1-2 strategic emojis to highlight critical insights

CONTENT QUALITY:
- Every claim must be supported by evidence or logical reasoning
- Include surprising or counterintuitive findings that challenge conventional wisdom
- Connect abstract concepts to concrete real-world examples
- Demonstrate depth of knowledge through nuanced analysis
- Balance technical accuracy with readability

${r}

Generate your expert research thread now:`,g=await this.callGeminiAPIWithSystemPrompt(l,c);if(g){let h=this.cleanTwitterContent(g),m=this.parseTwitterThread(h);this.displayThreadResult(h,n,category),this.saveThreadToGallery(h,n,category),window.TabTalkUI?.showToast("Expert thread generated successfully!",2e3)}}catch(i){console.error("Thread generation failed:",i),window.TabTalkUI?.showToast("Failed to generate thread",3e3)}finally{let i=document.getElementById("generate-thread-btn");i&&(i.textContent="\u{1F680} Generate Enhanced Thread",i.disabled=!1)}}};window.TabTalkThreadGenerator=d})();(function(){let d={initializeHorizontalScroll:function(){let e=document.querySelector(".scroll-container"),t=document.getElementById("scroll-left"),n=document.getElementById("scroll-right");if(!e||!t||!n)return;let a=200;t.addEventListener("click",()=>{e.scrollBy({left:-a,behavior:"smooth"})}),n.addEventListener("click",()=>{e.scrollBy({left:a,behavior:"smooth"})});let i=()=>{let l=e.scrollWidth-e.clientWidth;t.disabled=e.scrollLeft<=0,n.disabled=e.scrollLeft>=l};e.addEventListener("scroll",i),i(),e.addEventListener("wheel",l=>{l.deltaY!==0&&(l.preventDefault(),e.scrollLeft+=l.deltaY,i())});let s=!1,o,r;e.addEventListener("mousedown",l=>{s=!0,o=l.pageX-e.offsetLeft,r=e.scrollLeft,e.style.cursor="grabbing"}),e.addEventListener("mouseleave",()=>{s=!1,e.style.cursor="grab"}),e.addEventListener("mouseup",()=>{s=!1,e.style.cursor="grab",i()}),e.addEventListener("mousemove",l=>{if(!s)return;l.preventDefault();let g=(l.pageX-e.offsetLeft-o)*1.5;e.scrollLeft=r-g}),e.style.cursor="grab"}};window.TabTalkScroll=d})();(function(){let d={INIT_KEY:"savedContent",async loadSaved(e="twitter"){if(!window.TabTalkStorage||!TabTalkStorage.getSavedContent)return console.error("Gallery: TabTalkStorage not available"),[];let t=await TabTalkStorage.getSavedContent();return t?e==="all"?Object.entries(t).flatMap(([a,i])=>Array.isArray(i)?i.map(s=>({...s,_category:a})):[]):Array.isArray(t[e])?t[e]:[]:[]},async render(e,t="twitter"){e.innerHTML="";let n=document.createElement("div");n.className="gallery-header",n.innerHTML=`
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
      `,e.appendChild(n);let a=document.createElement("div");a.className="gallery-list",e.appendChild(a);let i=await this.loadSaved(t);this.initVirtualList(a,i),n.querySelector("#gallery-back-btn").addEventListener("click",()=>{window.TabTalkNavigation&&TabTalkNavigation.showView&&TabTalkNavigation.showView("chat")});let o=n.querySelector("#gallery-search"),r=n.querySelector("#gallery-sort"),l=n.querySelector("#gallery-count"),c=n.querySelector("#gallery-delete-all"),g=async()=>{let h=(o.value||"").toLowerCase(),m=r.value,p=await this.loadSaved(t);h&&(p=p.filter(w=>(w.content||"").toLowerCase().includes(h)||(w.domain||"").toLowerCase().includes(h))),p=this.sortItems(p,m),this.initVirtualList(a,p),this.renderList(a,p.slice(0,this._virtual.batch)),l.textContent=`${p.length}/50`};o.addEventListener("input",this.debounce(g,150)),r.addEventListener("change",g),l.textContent=`${i.length}/50`,c&&c.addEventListener("click",async()=>{confirm("Delete all saved items in this category?")&&window.TabTalkStorage&&TabTalkStorage.clearSavedCategory&&(await TabTalkStorage.clearSavedCategory(t),this.initVirtualList(a,[]),this.renderList(a,[]),l.textContent="0/50")})},sortItems(e,t){let n=[...e];switch(t){case"created_desc":return n.sort((a,i)=>(i.timestamp||0)-(a.timestamp||0));case"length_asc":return n.sort((a,i)=>(a.charCountAccurate||(a.content||"").length)-(i.charCountAccurate||(i.content||"").length));case"length_desc":return n.sort((a,i)=>(i.charCountAccurate||(i.content||"").length)-(a.charCountAccurate||(a.content||"").length));case"updated_desc":default:return n.sort((a,i)=>(i.updatedAt||i.timestamp||0)-(a.updatedAt||a.timestamp||0))}},renderList(e,t){if(!t||t.length===0){e.innerHTML=`
          <div class="gallery-empty">
            <img src="icons/icon128.jpeg" alt="" />
            <h3>No saved posts yet</h3>
            <p>Use the Save button on any generated card to add it here.</p>
          </div>
        `;return}if(this._virtual&&this._virtual.list===e){this.appendNextBatch();return}e.innerHTML="";let n=document.createDocumentFragment();t.forEach(a=>{let i=this.renderCard(a);n.appendChild(i)}),e.appendChild(n)},initVirtualList(e,t){let n=e;n.innerHTML="",this._virtual={list:n,items:t||[],index:0,batch:20},this.appendNextBatch(),this._virtual.items.length>this._virtual.batch&&this.appendNextBatch();let a=()=>{let{list:i}=this._virtual||{};i&&i.scrollTop+i.clientHeight>=i.scrollHeight-120&&this.appendNextBatch()};this._virtualScrollHandler&&n.removeEventListener("scroll",this._virtualScrollHandler),this._virtualScrollHandler=a,n.addEventListener("scroll",a,{passive:!0})},appendNextBatch(){let e=this._virtual;if(!e||!e.list||e.index>=e.items.length)return;let t=e.index,n=Math.min(e.index+e.batch,e.items.length),a=document.createDocumentFragment();for(let i=t;i<n;i++)a.appendChild(this.renderCard(e.items[i]));e.list.appendChild(a),e.index=n},renderCard(e){let t=document.createElement("div"),n=window.TabTalkTwitter&&window.TabTalkTwitter.isThreadContent?window.TabTalkTwitter.isThreadContent(e):this.fallbackThreadDetection(e),a=(e.content||"").length>500,i="gallery-card";n?i+=" card-thread":a&&(i+=" card-long"),t.className=i;let s=this.getAccurateCharacterCount(e.content||"");t.innerHTML=`
        <div class="gallery-card-header">
          <div class="title-row">
            <span class="title">${this.escapeHtml(e.title||"Post")}</span>
            <span class="badge platform">${this.escapeHtml((e.platform||"twitter").toUpperCase())}</span>
          </div>
          <div class="meta-row">
            <span class="timestamp">${this.formatDate(e.updatedAt||e.timestamp)}</span>
            <span class="metrics">${s} chars</span>
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
      `;let o=t.querySelector(".gallery-preview"),r=t.querySelector(".btn-action.copy"),l=t.querySelector(".btn-action.read"),c=t.querySelector(".btn-action.edit"),g=t.querySelector(".btn-action.delete");return r.addEventListener("click",async h=>{h.stopPropagation();try{let m="";(window.TabTalkTwitter&&window.TabTalkTwitter.isThreadContent?window.TabTalkTwitter.isThreadContent(e):this.fallbackThreadDetection(e))?m=this.extractThreadContent(e):m=e.content||"",await navigator.clipboard.writeText(m);let w=r.querySelector("span");w.textContent="\u2713",r.classList.add("success"),setTimeout(()=>{w.textContent="Copy",r.classList.remove("success")},1500)}catch(m){console.error("Gallery copy failed",m)}}),l.addEventListener("click",h=>{h.stopPropagation(),this.openReadModal(e)}),c.addEventListener("click",h=>{h.stopPropagation(),this.openEditModal(e)}),g.addEventListener("click",async h=>{h.stopPropagation(),confirm("Delete this saved item?")&&(await this.deleteItem(e),t.remove())}),t.addEventListener("click",h=>{h.target.closest(".btn-action")||this.openReadModal(e)}),t},openReadModal(e){let t=document.createElement("div");t.className="gallery-modal";let n="";t.innerHTML=`
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
      `,document.body.appendChild(t);let a=()=>t.remove();t.querySelector(".modal-close").addEventListener("click",a),t.querySelector(".gallery-modal-overlay").addEventListener("click",a),t.querySelector(".modal-btn.copy").addEventListener("click",async()=>{let s="";(e.platform||"").toLowerCase()==="thread"&&Array.isArray(e.tweets)&&e.tweets.length>0?s=e.tweets.map((l,c)=>`${l.number||`${c+1}/${e.tweets.length}:`}
${l.content||""}`).join(`

---

`):s=e.content||"",await navigator.clipboard.writeText(s);let r=t.querySelector(".modal-btn.copy");r.textContent="Copied!",setTimeout(()=>r.textContent="Copy",1500)}),t.querySelector(".modal-btn.edit").addEventListener("click",()=>{a(),this.openEditModal(e)});let i=s=>{s.key==="Escape"&&(a(),document.removeEventListener("keydown",i))};document.addEventListener("keydown",i)},openEditModal(e){let t=document.createElement("div");t.className="gallery-modal",t.innerHTML=`
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
      `,document.body.appendChild(t);let n=t.querySelector(".modal-textarea"),a=()=>t.remove();t.querySelector(".modal-close").addEventListener("click",a),t.querySelector(".gallery-modal-overlay").addEventListener("click",a),t.querySelector(".modal-btn.cancel").addEventListener("click",a),t.querySelector(".modal-btn.save").addEventListener("click",async()=>{let i={content:n.value,updatedAt:Date.now(),charCountAccurate:this.getAccurateCharacterCount(n.value)};await this.updateItem(e,i),a();let s=document.querySelector("#gallery-view");s&&this.render(s)}),n.focus()},async updateItem(e,t){let n=await TabTalkStorage.getSavedContent(),a=e._category||"twitter";if(!Array.isArray(n[a]))return;let i=n[a].findIndex(s=>s.id===e.id);i!==-1&&(n[a][i]={...n[a][i],...t},await TabTalkStorage.setStorageItem("savedContent",n))},async deleteItem(e){let t=e._category||"twitter";await TabTalkStorage.deleteSavedContent(t,e.id)},debounce(e,t){let n;return(...a)=>{clearTimeout(n),n=setTimeout(()=>e.apply(this,a),t)}},fallbackThreadDetection(e){if(!e)return!1;if((e.platform||"").toLowerCase()==="thread"||(e.type||"").toLowerCase()==="thread"||(e.title||"").toLowerCase().includes("thread"))return!0;let n=(e.content||"").toLowerCase();return!!(n.includes("1/")&&n.includes("2/")||n.includes("1/8")||n.includes("1/7")||n.includes("1/6")||n.includes("1/5")||n.includes("1/4")||n.includes("1/3")||n.includes("\u{1F9F5}")||Array.isArray(e.tweets)&&e.tweets.length>1||e.totalTweets&&e.totalTweets>1)},extractThreadContent(e){if(Array.isArray(e.tweets)&&e.tweets.length>0)return e.tweets.map((t,n)=>`${t.number||`${n+1}/${e.tweets.length}:`}
${t.content||""}`).join(`

---

`);if(e.content){if(window.TabTalkTwitter&&window.TabTalkTwitter.parseTwitterThread){let t=window.TabTalkTwitter.parseTwitterThread(e.content);if(t.length>1)return t.map((n,a)=>`${a+1}/${t.length}:
${n}`).join(`

---

`)}return e.content}return e.content||""},getAccurateCharacterCount(e){if(!e)return 0;let t=String(e).trim(),n=0,a=Array.from(t);for(let i of a){let s=i.codePointAt(0),o=s>=126976&&s<=129535||s>=9728&&s<=9983||s>=9984&&s<=10175||s>=128512&&s<=128591||s>=127744&&s<=128511||s>=128640&&s<=128767||s>=127456&&s<=127487||s>=8205;n+=o?2:1}return n},escapeHtml(e){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")},formatDate(e){if(!e)return"";try{return new Date(e).toLocaleString()}catch{return""}}};window.galleryManager=d})();(function(){let d={async validateApiKey(e){if(!e||typeof e!="string"||e.trim().length===0)return{success:!1,error:"API key is required"};let t=e.trim().replace(/\s+/g,"");if(!t.startsWith("AIza"))return{success:!1,error:'Invalid API key format. Gemini API keys should start with "AIza"'};if(t.length<30)return{success:!1,error:"API key appears too short. Please check and try again."};try{return await chrome.runtime.sendMessage({action:"validateApiKey",apiKey:t})}catch(n){return console.error("Validation request failed:",n),{success:!1,error:"Failed to validate API key. Please try again."}}},async handleTestApiKey(e,t){let n=t.value.trim(),a=e.textContent;if(!n){e.textContent="Enter Key",e.style.backgroundColor="#f59e0b",setTimeout(()=>{e.textContent=a,e.style.backgroundColor=""},2e3);return}e.disabled=!0,e.textContent="Testing...";try{let i=await this.validateApiKey(n);i.success?(e.textContent="\u2713 Valid",e.style.backgroundColor="#10b981",setTimeout(()=>{e.textContent=a,e.style.backgroundColor="",e.disabled=!1},2e3)):(e.textContent="\u2717 Invalid",e.style.backgroundColor="#ef4444",console.error(`API Key validation failed: ${i.error}`),setTimeout(()=>{e.textContent=a,e.style.backgroundColor="",e.disabled=!1},3e3))}catch(i){e.textContent="Error",e.style.backgroundColor="#ef4444",console.error("An error occurred while validating the API key:",i),setTimeout(()=>{e.textContent=a,e.style.backgroundColor="",e.disabled=!1},3e3)}},async handleSaveApiKey(e,t,n){let a=t.value.trim();if(!a){e.textContent="Enter Key",e.style.backgroundColor="#f59e0b";let s=e.textContent;setTimeout(()=>{e.textContent="Save",e.style.backgroundColor=""},2e3);return}e.disabled=!0;let i=e.textContent;e.textContent="Validating...";try{let s=await this.validateApiKey(a);s.success?(await this.saveApiKey(a),e.textContent="\u2713 Saved",e.style.backgroundColor="#10b981",n&&n(),setTimeout(()=>{e.textContent=i,e.style.backgroundColor="",e.disabled=!1},2e3)):(e.textContent="\u2717 Failed",e.style.backgroundColor="#ef4444",console.error(`API Key validation failed: ${s.error}`),setTimeout(()=>{e.textContent=i,e.style.backgroundColor="",e.disabled=!1},3e3))}catch(s){e.textContent="Error",e.style.backgroundColor="#ef4444",console.error("An error occurred while saving the API key:",s),setTimeout(()=>{e.textContent=i,e.style.backgroundColor="",e.disabled=!1},3e3)}},async saveApiKey(e){let t=e.trim().replace(/\s+/g,"");window.TabTalkStorage&&window.TabTalkStorage.saveApiKey?await window.TabTalkStorage.saveApiKey(t):await chrome.storage.local.set({geminiApiKey:t,apiKey:t,hasSeenWelcome:!0})}};window.TabTalkValidation=d})();(function(){function d(){let e=document.getElementById("test-api-key"),t=document.getElementById("onboarding-api-key");if(e&&t&&window.TabTalkValidation){let i=e.cloneNode(!0);e.parentNode.replaceChild(i,e),i.addEventListener("click",async function(){await window.TabTalkValidation.handleTestApiKey(i,t);let s=document.getElementById("api-setup-continue");s&&i.textContent==="\u2713 Valid"&&(s.disabled=!1)})}let n=document.getElementById("settings-save-button"),a=document.getElementById("api-key-input");if(n&&a&&window.TabTalkValidation){let i=n.cloneNode(!0);n.parentNode.replaceChild(i,n),i.addEventListener("click",async function(s){s.preventDefault(),s.stopPropagation(),s.stopImmediatePropagation(),await window.TabTalkValidation.handleSaveApiKey(i,a,function(){window.TabTalkNavigation&&window.TabTalkNavigation.showView&&window.TabTalkNavigation.showView("chat")})})}t&&t.addEventListener("input",function(){let i=document.getElementById("api-setup-continue");i&&(i.disabled=!this.value.trim())})}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",d):d(),setTimeout(d,100)})();(function(){let d={toneDefinitions:{"fact-check":{id:"fact-check",name:"Fact Check",icon:"\u{1F50D}",color:"var(--accent-medium)",category:"reply",subcategory:"analytical",description:"Verify claims with evidence and data",example:"Let's fact-check this claim...",aiInstructions:`TONE: Fact Check
- Systematically verify claims made in the content
- Use "Claim vs. Reality" or "Fact Check" structure
- Provide verifiable evidence, data, and sources
- Highlight inaccuracies without being aggressive
- Use phrases like "The data shows...", "Independent verification confirms...", "This claim is [supported/refuted] by..."
- Maintain objective, evidence-based approach
- Focus on truth and accuracy
- Cite specific studies or reliable sources`,keywords:["verification","evidence-based","accurate","objective","truth-seeking"]},agreeing:{id:"agreeing",name:"Amplify & Agree",icon:"\u{1F91D}",color:"var(--accent-color)",category:"reply",subcategory:"positive",description:"Support and amplify the message",example:"This is absolutely right because...",aiInstructions:`TONE: Agreeing
- Find common ground and validate the core message
- Add supporting evidence or personal confirmation
- Use collaborative and affirming language
- Share why you agree with specific examples
- Use phrases like "I completely agree because...", "This resonates because...", "My experience confirms..."
- Build on the original points with additional insights
- Show genuine alignment with the message
- Encourage others to join the agreement`,keywords:["supportive","collaborative","affirming","aligned","validating"]},contradictory:{id:"contradictory",name:"Fact Check & Counter",icon:"\u2694\uFE0F",color:"var(--accent-light)",category:"reply",subcategory:"critical",description:"Challenge with counter-evidence",example:"Actually, the evidence suggests otherwise...",aiInstructions:`TONE: Contradictory
- Directly challenge the main claims with counter-evidence
- Present opposing data or alternative perspectives
- Use respectful but firm disagreement
- Provide specific examples that contradict the content
- Use phrases like "However, research shows...", "This contradicts...", "An alternative view suggests..."
- Maintain intellectual honesty and rigor
- Acknowledge valid points while highlighting disagreements
- Focus on evidence-based contradiction`,keywords:["challenging","counter-evidence","disagreeing","alternative","critical"]},trolling:{id:"trolling",name:"Savage & Smart",icon:"\u{1F608}",color:"var(--accent-light)",category:"reply",subcategory:"playful",description:"Playful jabs backed by evidence",example:"Don't @ me, but the numbers say...",aiInstructions:`TONE: Trolling
- Use playful jabs, memes, and pop culture references
- Back EVERY claim with verifiable data or facts
- Maintain humor without being mean-spirited
- Use internet slang and casual language appropriately
- Include phrases like "Don't @ me but...", "The receipts say...", "Plot twist..."
- Balance sass with substance
- Keep it fun but factual`,keywords:["playful","humorous","sassy","internet-culture","evidence-backed"]},funny:{id:"funny",name:"Funny",icon:"\u{1F602}",color:"var(--accent-light)",category:"original",subcategory:"playful",description:"Humorous take with clever observations",example:"This is like when your cat tries to code...",aiInstructions:`TONE: Funny
- Find humor in the content through relatable analogies
- Use witty observations and clever comparisons
- Include pop culture references or memes when appropriate
- Keep jokes light and accessible, not offensive
- Use phrases like "This reminds me of...", "It's like that time...", "Plot twist..."
- Balance humor with actual insights
- Use self-deprecating humor when it fits
- Make complex topics fun and approachable`,keywords:["humorous","witty","entertaining","clever","relatable"]},"deeper-insights":{id:"deeper-insights",name:"Deeper Insights",icon:"\u{1F4A1}",color:"var(--accent-color)",category:"original",subcategory:"analytical",description:"Reveal hidden patterns and connections",example:"What everyone's missing is the deeper pattern...",aiInstructions:`TONE: Deeper Insights
- Go beyond surface-level analysis to reveal hidden patterns
- Connect seemingly unrelated concepts or trends
- Provide "aha!" moments that others might miss
- Use interdisciplinary thinking and synthesis
- Use phrases like "The deeper pattern here is...", "What connects these is...", "The hidden insight is..."
- Show how this fits into larger trends or cycles
- Provide non-obvious connections and implications
- Offer perspectives that require deeper thinking`,keywords:["insightful","analytical","pattern-recognition","synthesis","profound"]},"clever-observations":{id:"clever-observations",name:"Clever Observations",icon:"\u{1F9E0}",color:"var(--accent-medium)",category:"original",subcategory:"playful",description:"Quick wit and smart cultural references",example:"This is giving main character energy...",aiInstructions:`TONE: Clever Observations
- Make smart, witty observations about the content
- Use current slang, memes, and pop culture references
- Include self-deprecating humor when appropriate
- Keep tone playful but intelligent
- Use phrases like "This is giving...", "The math is mathing...", "No way...", "It's the... for me"
- Reference internet culture and trends authentically
- Balance humor with genuine insights
- Make connections others might miss but find obvious once pointed out`,keywords:["witty","clever","trendy","relatable","observant"]},"industry-insights":{id:"industry-insights",name:"Industry Insights",icon:"\u{1F4CA}",color:"var(--accent-color)",category:"original",subcategory:"professional",description:"Professional expertise and market analysis",example:"From an industry perspective, this signals...",aiInstructions:`TONE: Industry Insights
- Provide professional expertise and insider knowledge
- Analyze market trends and industry implications
- Use technical terminology with clear explanations
- Share insights that come from deep domain experience
- Use phrases like "From an industry perspective...", "This signals a shift in...", "Professional analysis shows..."
- Include specific metrics, benchmarks, or industry standards
- Demonstrate deep understanding of the field
- Connect content to broader industry context and future trends`,keywords:["professional","expert","industry","analytical","specialized"]},repurpose:{id:"repurpose",name:"Expert Repurpose",icon:"\u2728",color:"var(--accent-color)",category:"original",subcategory:"creative",description:"Rephrase content with better wording",example:"Let me rephrase this more effectively...",aiInstructions:`TONE: Expert Repurpose

ABSOLUTE CRITICAL RULES - YOU MUST FOLLOW THESE EXACTLY:
1. REPHRASE THE EXACT SAME CONTENT - Do NOT create new content
2. PRESERVE THE ORIGINAL MESSAGE 100% - Same intent, same purpose, same offer
3. DO NOT add your own opinions, skepticism, or commentary
4. DO NOT change promotional content into warnings or critiques
5. If the original is promotional, your output MUST be promotional
6. If the original has a call-to-action, keep the EXACT same call-to-action
7. ONLY change the wording, vocabulary, and sentence structure
8. Think of it as translating to better English, not changing the message

WHAT TO DO:
- Use stronger, more professional vocabulary
- Improve sentence flow and transitions
- Make it sound more polished and compelling
- Enhance readability while keeping the same meaning
- Example: "HOLY SH*T" \u2192 "This is incredible" (same excitement, better wording)

WHAT NOT TO DO:
- Do NOT question the content's validity
- Do NOT add warnings or skepticism
- Do NOT change the tone from positive to negative
- Do NOT remove calls-to-action or promotional elements
- Do NOT add your own analysis or commentary`,keywords:["rephrase","enhance","improve","professional","polished"]},"content-like-this":{id:"content-like-this",name:"Content like this",icon:"\u{1F3AD}",color:"var(--accent-medium)",category:"original",subcategory:"creative",description:"Create similar content in the same style",example:"Here's more content like this...",aiInstructions:`TONE: Content like this

MISSION: Analyze the webpage content to understand its essence, then create entirely NEW content that captures the same spirit, style, and approach. You are NOT rephrasing - you are creating fresh, original content inspired by the source.

CONTENT ANALYSIS PHASE:
1. Identify the content type and format (blog post, tutorial, opinion piece, case study, etc.)
2. Detect the writing style (conversational, formal, technical, storytelling, etc.)
3. Understand the core purpose (educate, entertain, persuade, inspire, etc.)
4. Note the structure and flow patterns
5. Identify the target audience and expertise level

CONTENT CREATION RULES:
1. CREATE ENTIRELY NEW CONTENT - Do NOT copy or rephrase the original
2. Match the STYLE and FORMAT, not the specific words
3. Use the same TONE and VOICE as the original
4. Apply the same STRUCTURE and organization patterns
5. Target the same AUDIENCE with similar complexity
6. Maintain the same PURPOSE and intent
7. Use analogous examples and scenarios (not the same ones)
8. Keep similar length and depth

STYLE MATCHING:
- If original is conversational \u2192 Write conversationally
- If original is technical \u2192 Use technical language appropriately
- If original is storytelling \u2192 Create a new story with similar structure
- If original is data-driven \u2192 Use data and examples in your new content
- If original is inspirational \u2192 Write inspiring content with fresh examples

CONTENT TYPES TO RECOGNIZE AND REPLICATE:
\u2022 Tutorials \u2192 Create new tutorial with different steps/examples
\u2022 Opinion pieces \u2192 Write new opinion on related topic with same stance
\u2022 Case studies \u2192 Create new case study with different scenario
\u2022 Listicles \u2192 Make new list with different items but same theme
\u2022 How-to guides \u2192 Create new guide for different but related task
\u2022 Personal stories \u2192 Share new personal story with same emotional arc
\u2022 Educational content \u2192 Teach new concept with same teaching style
\u2022 Promotional content \u2192 Create new promotion for different but related product/service

ABSOLUTE REQUIREMENTS:
\u2713 MUST be entirely new content - no copying sentences
\u2713 MUST capture the same essence and spirit
\u2713 MUST match the writing style perfectly
\u2713 MUST serve the same purpose for the same audience
\u2713 MUST feel like it was written by the same author
\u2713 MUST impress with creativity while maintaining style consistency

OUTPUT REQUIREMENTS:
\u2713 Generate exactly ONE complete piece of content
\u2713 Make it substantial and comprehensive (not just a brief mention)
\u2713 Focus all creative energy on making this single piece exceptional
\u2713 Do not provide multiple options or variations
\u2713 Deliver one polished, ready-to-use result

THE GOAL: Create ONE impressive piece of content that perfectly matches the original's style and voice, making people say "Wow, this is exactly like [original content] but completely fresh and new!"`,keywords:["emulate","style-match","create-similar","replicate-style","fresh-content"]},"hypocrite-buster":{id:"hypocrite-buster",name:"Hypocrite Buster",icon:"\u{1F3AF}",color:"var(--accent-light)",category:"reply",subcategory:"critical",description:"Point out contradictions and double standards",example:"Interesting how they ignore their own past stance...",aiInstructions:`TONE: Hypocrite Buster
- Identify contradictions or double standards in the content
- Point out when arguments conflict with obvious counterexamples
- Highlight selective reasoning or convenient inconsistencies
- Use logical takedowns based on the content itself
- Focus on "this contradicts that" patterns within the material
- Use phrases like "Funny how...", "Conveniently ignoring...", "The irony is..."
- Maintain sharp, critical tone without being aggressive
- Point out flawed reasoning or selective evidence use
- Connect dots that show inconsistency in positions
- Use irony and juxtaposition to highlight contradictions effectively`,keywords:["contradiction","double-standards","inconsistency","critical","exposure"]}},customTones:[],sessionCache:{lastSelectedTone:null,customCombinations:[]},init:function(){this.loadCustomTones(),this.createModalHTML(),this.bindModalEvents()},loadCustomTones:async function(){try{let e=await chrome.storage.local.get("customTones");e.customTones&&(this.customTones=e.customTones)}catch(e){console.error("Error loading custom tones:",e)}},saveCustomTones:async function(){try{await chrome.storage.local.set({customTones:this.customTones})}catch(e){console.error("Error saving custom tones:",e)}},createModalHTML:function(){let e=`
        <div id="tone-selector-modal" class="tone-modal hidden" role="dialog" aria-labelledby="tone-modal-title" aria-modal="true">
          <div class="tone-modal-overlay"></div>
          <div class="tone-modal-content">
            <div class="tone-modal-header">
              <h2 id="tone-modal-title">Select Content Tone</h2>
              <button class="tone-modal-close" aria-label="Close">&times;</button>
            </div>

            <!-- Tone Grid -->
            <div class="modal-section">
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

            <!-- Image Prompt Option -->
            <div class="image-prompt-section">
              <label class="image-prompt-toggle">
                <input type="checkbox" id="include-image-prompt" class="image-prompt-checkbox">
                <span class="image-prompt-label">
                  <svg class="image-prompt-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                  Generate Image Prompt (9:16 Nano Banana)
                </span>
              </label>
              <p class="image-prompt-description">AI will create an optimized image prompt for your content</p>
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
      `;document.getElementById("tone-selector-modal")||document.body.insertAdjacentHTML("beforeend",e)},renderToneGrid:function(){return`
        <div class="tone-category">
          <div class="category-header">
            <span class="category-icon">\u270D\uFE0F</span>
            <span class="category-title">Original Post</span>
          </div>
          <div class="tone-grid-row">
            ${Object.values(this.toneDefinitions).filter(t=>t.category==="original").map(t=>`
              <div class="tone-option" 
                   data-tone-id="${t.id}" 
                   data-category="${t.category}"
                   data-subcategory="${t.subcategory}"
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
            `).join("")}
          </div>
        </div>
      `},renderToneOptions:function(){return Object.values(this.toneDefinitions).map(e=>`<option value="${e.id}">${e.icon} ${e.name}</option>`).join("")},bindModalEvents:function(){let e=document.getElementById("tone-selector-modal");if(!e)return;e.querySelector(".tone-modal-close")?.addEventListener("click",()=>this.hideModal()),e.querySelector(".tone-modal-overlay")?.addEventListener("click",()=>this.hideModal()),document.getElementById("tone-cancel-btn")?.addEventListener("click",()=>this.hideModal()),e.querySelectorAll(".tone-option").forEach(h=>{h.addEventListener("click",()=>this.selectTone(h)),h.addEventListener("keydown",m=>{(m.key==="Enter"||m.key===" ")&&(m.preventDefault(),this.selectTone(h))})}),document.getElementById("tone-generate-btn")?.addEventListener("click",()=>this.handleGenerate()),document.getElementById("toggle-custom-builder")?.addEventListener("click",()=>this.toggleCustomBuilder());let r=document.getElementById("custom-tone-1"),l=document.getElementById("custom-tone-2");r?.addEventListener("change",()=>this.updateCustomPreview()),l?.addEventListener("change",()=>this.updateCustomPreview()),document.getElementById("save-custom-tone")?.addEventListener("click",()=>this.saveCustomCombination()),document.getElementById("use-custom-tone")?.addEventListener("click",()=>this.useCustomCombination()),e.addEventListener("keydown",h=>{h.key==="Escape"&&this.hideModal()})},showModal:async function(e,t){let n=document.getElementById("tone-selector-modal");if(!n)return;this.currentPlatform=e,this.currentPageContent=t,n.classList.remove("hidden"),n.setAttribute("aria-hidden","false"),n.querySelector(".tone-option")?.focus(),this.renderSavedCustomTones()},hideModal:function(){let e=document.getElementById("tone-selector-modal");e&&(e.classList.add("hidden"),e.setAttribute("aria-hidden","true"),this.resetSelections())},selectTone:function(e){document.querySelectorAll(".tone-option").forEach(a=>{a.classList.remove("selected"),a.setAttribute("aria-checked","false")}),e.classList.add("selected"),e.setAttribute("aria-checked","true"),this.selectedToneId=e.dataset.toneId,console.log("TabTalkToneSelector: Selected tone ID:",this.selectedToneId),console.log("TabTalkToneSelector: Available tone IDs:",Object.keys(this.toneDefinitions)),this.selectedTone=this.toneDefinitions[this.selectedToneId],console.log("TabTalkToneSelector: Selected tone object:",this.selectedTone);let n=document.getElementById("tone-generate-btn");n&&(n.disabled=!1)},toggleCustomBuilder:function(){let e=document.getElementById("custom-tone-builder"),t=document.getElementById("toggle-custom-builder"),n=t?.querySelector(".toggle-arrow");if(e&&t){let a=e.classList.contains("hidden");e.classList.toggle("hidden"),n&&(n.textContent=a?"\u25B2":"\u25BC")}},updateCustomPreview:function(){let e=document.getElementById("custom-tone-1"),t=document.getElementById("custom-tone-2"),n=document.getElementById("custom-tone-preview"),a=document.querySelector(".builder-preview"),i=document.getElementById("save-custom-tone"),s=document.getElementById("use-custom-tone");if(!e||!t||!n)return;let o=e.value,r=t.value;if(o&&r&&o!==r){let l=this.toneDefinitions[o],c=this.toneDefinitions[r];n.innerHTML=`
          <div class="preview-tones">
            <span class="preview-tone" style="color: ${l.color}">
              ${l.icon} ${l.name}
            </span>
            <span class="preview-plus">+</span>
            <span class="preview-tone" style="color: ${c.color}">
              ${c.icon} ${c.name}
            </span>
          </div>
          <div class="preview-description">
            ${this.generateCombinedDescription(l,c)}
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
      `,e.querySelectorAll(".saved-custom-tone").forEach(a=>{a.addEventListener("click",i=>{i.target.classList.contains("saved-tone-delete")||this.selectSavedCustomTone(a.dataset.customId)})}),e.querySelectorAll(".saved-tone-delete").forEach(a=>{a.addEventListener("click",i=>{i.stopPropagation(),this.deleteCustomTone(a.dataset.customId)})})},selectSavedCustomTone:function(e){let t=this.customTones.find(s=>s.id===e);if(!t)return;let n=this.toneDefinitions[t.tone1Id],a=this.toneDefinitions[t.tone2Id];this.selectedToneId="custom",this.selectedTone={id:"custom",name:t.name,tone1:n,tone2:a,aiInstructions:this.combineAIInstructions(n,a)};let i=document.getElementById("tone-generate-btn");i&&(i.disabled=!1),this.showToast("\u2713 Custom tone selected!")},deleteCustomTone:async function(e){this.customTones=this.customTones.filter(t=>t.id!==e),await this.saveCustomTones(),this.renderSavedCustomTones(),this.showToast("Custom tone deleted")},handleGenerate:function(){if(console.log("TabTalkToneSelector: handleGenerate called"),console.log("TabTalkToneSelector: selectedToneId:",this.selectedToneId),console.log("TabTalkToneSelector: selectedTone:",this.selectedTone),!this.selectedTone){console.warn("TabTalkToneSelector: No tone selected, cannot generate");return}let e=document.getElementById("include-image-prompt"),t=e?e.checked:!1;this.onGenerateCallback&&(console.log("TabTalkToneSelector: Calling callback with tone:",this.selectedTone),this.onGenerateCallback(this.selectedTone,this.currentPlatform,t)),this.hideModal()},resetSelections:function(){document.querySelectorAll(".tone-option").forEach(n=>{n.classList.remove("selected"),n.setAttribute("aria-checked","false")}),this.selectedToneId=null,this.selectedTone=null;let t=document.getElementById("tone-generate-btn");t&&(t.disabled=!0)},showToast:function(e){let t=document.createElement("div");t.className="tone-toast",t.textContent=e,t.style.cssText=`
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
      `,document.body.appendChild(t),setTimeout(()=>{t.style.animation="slideOutDown 0.3s ease",setTimeout(()=>t.remove(),300)},2e3)},show:function(e,t,n){this.onGenerateCallback=n,this.showModal(e,t)}};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>d.init()):d.init(),window.TabTalkToneSelector=d})();(function(){let d={currentView:"chat",init(){this.bindEvents(),this.updateActiveState("chat")},bindEvents(){document.querySelectorAll(".nav-item").forEach(t=>{t.addEventListener("click",n=>{n.preventDefault();let a=t.getAttribute("data-view");this.navigateToView(a)})})},navigateToView(e){window.TabTalkNavigation&&window.TabTalkNavigation.showView&&window.TabTalkNavigation.showView(e),this.updateActiveState(e),this.currentView=e},updateActiveState(e){document.querySelectorAll(".nav-item").forEach(n=>{n.getAttribute("data-view")===e?n.classList.add("active"):n.classList.remove("active")})},toggleVisibility(e){let t=document.getElementById("bottom-nav");t&&(t.style.display=e?"flex":"none")},setActive(e){this.updateActiveState(e),this.currentView=e}};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>d.init()):d.init(),window.BottomNav=d})();(function(){let d={selectedPersona:"educator",selectedFormat:"myth-busting",currentTopic:"",selectedHook:"",generatedThread:null,personas:{educator:{name:"Educator",emoji:"\u{1F393}",instructions:"Write as a patient teacher who breaks down complex topics into simple, digestible lessons. Use clear examples and encouraging language. Focus on helping the reader understand and grow. Include educational moments and learning takeaways.",hookDensity:"medium",sentenceLength:"medium",verbStyle:"explanatory",ctaStyle:"learning-focused"},operator:{name:"Operator",emoji:"\u2699\uFE0F",instructions:"Write as a practical builder who focuses on execution and results. Use direct, no-nonsense language. Emphasize systems, processes, and measurable outcomes. Include actionable steps and implementation details.",hookDensity:"low",sentenceLength:"short",verbStyle:"action-oriented",ctaStyle:"implementation-focused"},analyst:{name:"Analyst",emoji:"\u{1F4CA}",instructions:"Write as a data-driven expert who backs claims with evidence and logical reasoning. Use precise language and structured arguments. Include statistics, trends, and analytical insights. Maintain objectivity and credibility.",hookDensity:"medium",sentenceLength:"long",verbStyle:"analytical",ctaStyle:"insight-focused"},entertainer:{name:"Entertainer",emoji:"\u{1F3AD}",instructions:"Write as an engaging storyteller who captivates with humor, drama, and personality. Use vivid language, emotional appeal, and entertaining anecdotes. Include surprising twists and memorable moments.",hookDensity:"high",sentenceLength:"varied",verbStyle:"expressive",ctaStyle:"engagement-focused"},visionary:{name:"Visionary",emoji:"\u{1F52E}",instructions:"Write as a forward-thinking leader who paints pictures of what is possible. Use inspiring, future-focused language. Emphasize transformation, innovation, and paradigm shifts. Include bold predictions and visionary insights.",hookDensity:"high",sentenceLength:"long",verbStyle:"transformational",ctaStyle:"future-focused"},storyteller:{name:"Storyteller",emoji:"\u{1F4DA}",instructions:"Write as a master storyteller who weaves narratives that teach and inspire. Use classic story structures, character development, and narrative arcs. Include personal anecdotes, metaphors, and story-driven examples.",hookDensity:"medium",sentenceLength:"varied",verbStyle:"narrative",ctaStyle:"story-focused"},scientist:{name:"Scientist",emoji:"\u{1F52C}",instructions:"Write as a rigorous researcher who explores topics through scientific inquiry. Use precise, evidence-based language. Emphasize hypotheses, experiments, and data-driven conclusions. Include scientific method and logical reasoning.",hookDensity:"low",sentenceLength:"complex",verbStyle:"investigative",ctaStyle:"research-focused"},philosopher:{name:"Philosopher",emoji:"\u{1F914}",instructions:"Write as a deep thinker who explores fundamental questions and meanings. Use thoughtful, reflective language. Emphasize principles, ethics, and deeper truths. Include philosophical frameworks and wisdom insights.",hookDensity:"low",sentenceLength:"complex",verbStyle:"reflective",ctaStyle:"wisdom-focused"}},formats:{"myth-busting":{name:"Myth\u2011busting",emoji:"\u{1F9F1}",skeleton:"Hook (challenge common belief) \u2192 Why it is wrong \u2192 Evidence (3 bullet points) \u2192 What to do instead (steps) \u2192 CTA"},"status-shift":{name:"Status Shift",emoji:"\u26A1",skeleton:"Hook (unexpected realization) \u2192 Before vs After snapshot \u2192 Process (3-5 steps) \u2192 Proof \u2192 CTA"},"cheat-code":{name:"Cheat Code",emoji:"\u{1F3AE}",skeleton:"Hook (fast result promise) \u2192 Steps (ordered) \u2192 Common pitfalls \u2192 Bonus tip \u2192 CTA"},analogy:{name:"Analogy",emoji:"\u{1F517}",skeleton:"Hook (analogy) \u2192 Map analogy \u2192 Apply to topic \u2192 Example \u2192 CTA"},pain:{name:"Pain Point",emoji:"\u{1F4A1}",skeleton:"Hook (identify pain) \u2192 Amplify why it matters \u2192 Root cause \u2192 Solution steps \u2192 Transformation \u2192 CTA"},story:{name:"Story",emoji:"\u{1F4D6}",skeleton:"Hook (story opening) \u2192 Challenge faced \u2192 Journey/process \u2192 Resolution/lesson \u2192 Application for reader \u2192 CTA"},data:{name:"Data Driven",emoji:"\u{1F4CA}",skeleton:"Hook (surprising stat) \u2192 Context behind the data \u2192 Implications \u2192 What it means for reader \u2192 Action steps \u2192 CTA"},framework:{name:"Framework",emoji:"\u{1F3D7}\uFE0F",skeleton:"Hook (mental model) \u2192 Explain framework components \u2192 How to apply \u2192 Examples \u2192 Benefits \u2192 CTA"},future:{name:"Future Focus",emoji:"\u{1F52E}",skeleton:"Hook (future prediction) \u2192 Current trends \u2192 Timeline \u2192 What to prepare \u2192 First steps \u2192 CTA"},practical:{name:"Practical",emoji:"\u2699\uFE0F",skeleton:"Hook (practical problem) \u2192 Quick solution \u2192 Step-by-step guide \u2192 Pro tips \u2192 Results \u2192 CTA"},controversial:{name:"Controversial",emoji:"\u{1F525}",skeleton:"Hook (controversial take) \u2192 Why people disagree \u2192 Your evidence \u2192 Counterarguments \u2192 Strong conclusion \u2192 CTA"},inspirational:{name:"Inspirational",emoji:"\u2728",skeleton:"Hook (uplifting vision) \u2192 Current reality \u2192 Possibility \u2192 Motivational examples \u2192 Call to greatness \u2192 CTA"},"step-by-step":{name:"Step\u2011by\u2011Step",emoji:"\u{1F4DD}",skeleton:"Hook (process promise) \u2192 Why this process \u2192 Step 1 \u2192 Step 2 \u2192 Step 3 \u2192 Common mistakes \u2192 Success tips \u2192 CTA"},comparison:{name:"Comparison",emoji:"\u2696\uFE0F",skeleton:"Hook (comparison setup) \u2192 Option A analysis \u2192 Option B analysis \u2192 Decision criteria \u2192 Recommendation \u2192 CTA"},"case-study":{name:"Case Study",emoji:"\u{1F4CB}",skeleton:"Hook (intriguing result) \u2192 Background \u2192 Challenge \u2192 Solution \u2192 Measurable results \u2192 Lessons \u2192 CTA"},trend:{name:"Trend Alert",emoji:"\u{1F4C8}",skeleton:"Hook (trend observation) \u2192 Evidence it is growing \u2192 Why it matters \u2192 How to leverage \u2192 Timeline \u2192 CTA"},"myth-busting-plus":{name:"Myth+",emoji:"\u{1F9F1}",skeleton:"Hook (bold myth claim) \u2192 Multiple myths busted \u2192 Deeper truth revealed \u2192 System-level change \u2192 New paradigm \u2192 CTA"},"quick-win":{name:"Quick Win",emoji:"\u{1F3C6}",skeleton:"Hook (immediate result) \u2192 Simple action \u2192 Quick proof \u2192 Scaling tip \u2192 Long-term benefit \u2192 CTA"},"deep-dive":{name:"Deep Dive",emoji:"\u{1F93F}",skeleton:"Hook (complex question) \u2192 Surface-level answer \u2192 Deeper layers \u2192 Expert insight \u2192 Nuanced conclusion \u2192 CTA"},checklist:{name:"Checklist",emoji:"\u2705",skeleton:"Hook (checklist promise) \u2192 Overview \u2192 Item 1 with details \u2192 Item 2 \u2192 Item 3 \u2192 Implementation tips \u2192 CTA"}},hookPatterns:[{type:"AIDA Attention",template:"What if I told you that [topic] could change everything?"},{type:"AIDA Interest",template:"The hidden truth about [topic] that nobody is talking about."},{type:"AIDA Desire",template:"Imagine mastering [topic] in half the time it takes everyone else."},{type:"AIDA Action",template:"Here is exactly how you can start with [topic] right now."},{type:"PAS Problem",template:"[Topic] is failing for 90% of people. Here is why."},{type:"PAS Agitate",template:"Every time you struggle with [topic], you are making this one mistake."},{type:"PAS Solution",template:"I finally cracked the code for [topic]. This changes everything."},{type:"Status Shift",template:"Everything you know about [topic] is about to become obsolete."},{type:"Status Shift",template:"The old rules of [topic] no longer apply. Here are the new ones."},{type:"Status Shift",template:"Why experts are wrong about [topic] and what actually works."}],init(){this.bindEvents(),this.loadStoredPreferences()},bindEvents(){let e=document.getElementById("generate-thread-btn");e&&e.addEventListener("click",()=>this.generateThread()),document.addEventListener("click",s=>{s.target.closest(".persona-chip")&&this.selectPersona(s.target.closest(".persona-chip").dataset.persona),s.target.closest(".format-chip")&&this.selectFormat(s.target.closest(".format-chip").dataset.format),s.target.closest(".hook-item")&&this.selectHook(s.target.closest(".hook-item").dataset.hook)});let t=document.getElementById("generate-hooks-btn"),n=document.getElementById("generate-hooks-btn-modal");t&&t.addEventListener("click",()=>this.generateHooks()),n&&n.addEventListener("click",()=>this.generateHooks("modal"));let a=document.getElementById("trend-fusion-btn"),i=document.getElementById("trend-fusion-btn-modal");a&&a.addEventListener("click",()=>this.generateTrendFusion()),i&&i.addEventListener("click",()=>this.generateTrendFusion("modal"))},showEnhancedModal(){},hideModal(){},selectPersona(e){this.selectedPersona=e,document.querySelectorAll(".persona-chip").forEach(t=>{t.classList.toggle("active",t.dataset.persona===e)}),this.savePreferences()},selectFormat(e){this.selectedFormat=e,document.querySelectorAll(".format-chip").forEach(t=>{t.classList.toggle("active",t.dataset.format===e)}),this.savePreferences()},selectHook(e){this.selectedHook=e,document.querySelectorAll(".hook-item").forEach(t=>{t.classList.toggle("selected",t.dataset.hook===e)})},async generateHooks(e="view"){let t=e==="modal"?"thread-topic-modal":"thread-topic",n=document.getElementById(t);if(this.currentTopic=n?n.value.trim():"",!this.currentTopic){this.showToast("Enter a topic first",2e3);return}let a=e==="modal"?"generate-hooks-btn-modal":"generate-hooks-btn",i=document.getElementById(a),s=i.textContent;i.textContent="\u23F3 Generating...",i.disabled=!0;try{let o=await this.callGeminiAPI(this.buildHooksPrompt());this.displayHooks(o,e)}catch(o){console.error("Hook generation failed:",o),this.showToast("Failed to generate hooks",3e3)}finally{i.textContent=s,i.disabled=!1}},async generateTrendFusion(e="view"){let t=e==="modal"?"thread-topic-modal":"thread-topic",n=document.getElementById(t);if(this.currentTopic=n?n.value.trim():"",!this.currentTopic){this.showToast("Enter a topic first",2e3);return}let a=e==="modal"?"trend-fusion-btn-modal":"trend-fusion-btn",i=document.getElementById(a),s=i.textContent;i.textContent="\u23F3 Generating...",i.disabled=!0;try{let o=await this.callGeminiAPI(this.buildTrendFusionPrompt());this.displayTrendFusion(o,e)}catch(o){console.error("Trend fusion failed:",o),this.showToast("Failed to generate trend fusion",3e3)}finally{i.textContent=s,i.disabled=!1}},async generateThread(){let e=document.getElementById("thread-topic");if(this.currentTopic=e.value.trim(),!this.currentTopic){this.showToast("Enter a topic first",2e3);return}let t=document.getElementById("generate-thread-btn"),n=t.textContent;t.textContent="\u23F3 Generating...",t.disabled=!0;try{let a=await this.callGeminiAPI(this.buildThreadPrompt());this.generatedThread=a,this.displayThreadResult(a),this.saveToGallery(a,this.currentTopic,this.selectedFormat)}catch(a){console.error("Thread generation failed:",a),this.showToast("Failed to generate thread",3e3)}finally{t.textContent=n,t.disabled=!1}},buildHooksPrompt(){let e=this.personas[this.selectedPersona];return`Generate 10 powerful hooks for "${this.currentTopic}" using these frameworks:

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

Generate the complete thread now:`,n},displayHooks(e,t="view"){let n=t==="modal"?"hooks-container-modal":"hooks-container",a=document.getElementById(n);if(!a)return;let i=this.parseHookList(e);a.innerHTML=i.map((s,o)=>`
        <div class="hook-item" data-hook="${s.text}">
          <div class="hook-text">${s.text}</div>
          <div class="hook-type">${s.type}</div>
        </div>
      `).join(""),a.classList.remove("hidden")},displayTrendFusion(e,t="view"){let n=t==="modal"?"trend-result-modal":"trend-result",a=document.getElementById(n);if(!a)return;let s=e.split(`
`).find(o=>o.includes("Why")&&o.includes("matters")&&o.includes("over next 6 months"))||e.trim();a.textContent=s,a.classList.remove("hidden")},parseHookList(e){let t=e.split(`
`),n=[];for(let a=0;a<t.length;a++){let s=t[a].trim().match(/^\d+\.\s*(.+)$/);if(s){let o=this.hookPatterns[Math.min(a,this.hookPatterns.length-1)].type;n.push({text:s[1],type:o})}}return n.length===0?this.hookPatterns.slice(0,10).map(a=>({text:a.template.replace("[topic]",this.currentTopic),type:a.type})):n.slice(0,10)},displayThreadResult(e){window.TabTalkUI&&window.TabTalkUI.showView("chat");let t={type:"thread",content:e,title:this.currentTopic,timestamp:new Date().toISOString(),tags:[this.selectedFormat,this.selectedPersona]},n=document.getElementById("messages-container");if(n&&window.TabTalkUI&&window.TabTalkUI.renderCard){let a=window.TabTalkUI.renderCard(t);n.appendChild(a)}},async callGeminiAPI(e){if(!window.TabTalkAPI?.callGeminiAPI)throw new Error("API not available");return await window.TabTalkAPI.callGeminiAPI(e)},saveToGallery(e,t,n){if(!window.TabTalkGallery)return;let a={id:Date.now().toString(),title:t,content:e,timestamp:new Date().toISOString(),tags:[n,this.selectedPersona],platform:"thread"};window.TabTalkGallery.saveContent(a)},loadStoredPreferences(){chrome.storage.local.get(["enhancedPersona","enhancedFormat"],e=>{e.enhancedPersona&&this.selectPersona(e.enhancedPersona),e.enhancedFormat&&this.selectFormat(e.enhancedFormat)})},savePreferences(){chrome.storage.local.set({enhancedPersona:this.selectedPersona,enhancedFormat:this.selectedFormat})},showToast(e,t=3e3){window.TabTalkUI?.showToast?window.TabTalkUI.showToast(e,t):console.log("Toast:",e)}};window.TabTalkEnhancedQuickActions=d,document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>d.init()):d.init()})();(function(){let d={promptsCache:{},init(){},async generatePromptForCard(e,t){if(!e||!t)return console.error("ImagePromptGenerator: contentId or cardText missing"),null;if(this.promptsCache[e])return this.promptsCache[e];let n=await this.callGeminiAPI(this.buildSuperPrompt(t));return n&&(this.promptsCache[e]=n),n},getPromptForContentId(e){return this.promptsCache[e]||null},attachPromptToCard(e,t,n){if(!e||!n)return;e.dataset.imagePrompt=encodeURIComponent(n);let a=e.querySelector(".twitter-card-content");if(a){let i=a.querySelector(".image-prompt-display");i&&i.remove();let s=document.createElement("div");s.className="image-prompt-display",s.innerHTML=`
          <div class="image-prompt-label">\u{1F5BC}\uFE0F Nano Banana Prompt (9:16)</div>
          <div class="image-prompt-text">${this.escapeHtml(n)}</div>
        `,a.appendChild(s)}},buildSuperPrompt(e){return`You are an award-winning graphics designer and creative director with 15+ years of experience in visual storytelling, branding, and digital art. You have designed for Fortune 500 companies, startups, and viral social media campaigns. Your expertise spans typography, layout theory, color psychology, composition, and visual hierarchy.

Your task is to create a single, ultra-detailed prompt for a 9:16 vertical image that perfectly complements this Twitter post content. This prompt will be used by Google Nano Banana to generate a professional-grade visual.

CONTENT CONTEXT:
${e}

DESIGN EXCELLENCE REQUIREMENTS:
- Generate ONLY the final prompt string. No explanations, no options, no commentary.
- Aspect ratio MUST be exactly 9:16 (vertical mobile format optimized for social media).
- Create visually stunning, context-aware graphics that stand out in mobile feeds.
- Apply professional design principles: visual hierarchy, balance, contrast, and flow.
- Include specific typography treatments, color palettes, and compositional guidelines.
- Consider readability, brand consistency, and emotional impact.
- Add negative prompts to ensure professional quality output.

EXPERT DESIGN ELEMENTS TO INCLUDE:
1. **Layout & Composition**: Grid-based design, rule of thirds, visual hierarchy, focal points
2. **Typography**: Font styles, hierarchy (headlines, body text), text treatments, kerning, leading
3. **Color Scheme**: Primary/secondary colors, gradients, psychological color associations
4. **Visual Style**: Photorealistic, illustration, infographic, minimalist, bold, etc.
5. **Graphics & Icons**: Custom icons, illustrations, data visualizations, decorative elements
6. **Text Integration**: How text interacts with images, overlay techniques, readability
7. **Lighting & Atmosphere**: Mood lighting, shadows, depth, dimension
8. **Technical Quality**: Resolution, rendering style, post-processing effects

CONTENT-SYPE DESIGN STRATEGIES:
- **Data/Statistics**: Clean infographics with clear data visualization, charts, graphs
- **Tutorials**: Step-by-step visual guides with numbered steps, icons, progress indicators
- **Controversial Content**: Bold typography, high-contrast colors, impactful imagery
- **Products**: Lifestyle shots, clean backgrounds, feature highlights, benefit visualization
- **AI/Tech**: Futuristic aesthetics, circuit patterns, holographic elements, sleek interfaces
- **Business/Finance**: Professional charts, growth visualizations, trust indicators
- **Health/Wellness**: Calming colors, organic shapes, inspirational imagery

ADVANCED PROMPT STRUCTURE:
1. Primary visual concept and subject matter
2. Layout composition and framing (9:16 optimized)
3. Typography hierarchy and text treatment
4. Color palette and psychological associations
5. Graphic elements and visual metaphors
6. Lighting, atmosphere, and mood
7. Technical specifications and rendering style
8. Negative prompts for quality control

PROFESSIONAL FORMATTING GUIDELINES:
- Use design terminology: "leading", "kerning", "visual hierarchy", "negative space"
- Specify composition: "golden ratio", "rule of thirds", "symmetrical balance"
- Include color specifics: "monochromatic with accent", "complementary colors", "gradient overlay"
- Define typography: "sans-serif headline", "body text readability", "text hierarchy"
- Add rendering details: "photorealistic", "vector illustration", "3D rendering", "cinematic lighting"

Generate the expert-level graphics design prompt now:`},async callGeminiAPI(e){if(window.TabTalkAPI?.callGeminiAPI)try{let t=await window.TabTalkAPI.callGeminiAPI(e);return this.cleanPromptResponse(t)}catch(t){throw console.error("ImagePromptGenerator: API call failed:",t),t}throw new Error("API not available")},cleanPromptResponse(e){if(!e)return"";let t=String(e).trim();return t=t.replace(/^(?:Here is|Here's|This is|Below is)[^\n]*:\s*/i,""),t=t.replace(/^(?:Okay|Sure|Certainly)[^\n]*\n/i,""),t=t.replace(/^\d+\.\s*/gm,""),t=t.replace(/^Explanation:.*$/gm,""),t=t.replace(/^Note:.*$/gm,""),t=t.replace(/\n{3,}/g,`

`),t.trim()},escapeHtml(e){let t=document.createElement("div");return t.textContent=e,t.innerHTML},clearCacheForContentId(e){delete this.promptsCache[e]},clearAllCache(){this.promptsCache={}}};window.TabTalkImagePromptGenerator=d})();(function(){let d={currentTopic:"",isProcessing:!1,init(){this.bindEvents()},bindEvents(){let e=document.getElementById("refine-topic-btn"),t=document.getElementById("generate-ideas-btn"),n=document.getElementById("thread-topic");e&&e.addEventListener("click",()=>this.refineTopic()),t&&t.addEventListener("click",()=>this.generateTopicIdeas()),n&&n.addEventListener("input",()=>this.hideSuggestions())},async refineTopic(){let e=document.getElementById("thread-topic");if(this.currentTopic=e?.value?.trim()||"",!this.currentTopic){this.showToast("Enter a topic first to refine it",2e3);return}if(this.isProcessing)return;let t=document.getElementById("refine-topic-btn"),n=t.textContent;this.isProcessing=!0,t.textContent="\u23F3 Refining...",t.disabled=!0;try{let a=await this.callGeminiAPI(this.buildRefinementPrompt());this.displayRefinements(a)}catch(a){console.error("Topic refinement failed:",a),this.showToast("Failed to refine topic",3e3)}finally{t.textContent=n,t.disabled=!1,this.isProcessing=!1}},async generateTopicIdeas(){if(this.isProcessing)return;let e=document.getElementById("generate-ideas-btn"),t=e.textContent;this.isProcessing=!0,e.textContent="\u23F3 Generating...",e.disabled=!0;try{let n=await this.callGeminiAPI(this.buildIdeasPrompt());this.displayTopicIdeas(n)}catch(n){console.error("Topic ideas generation failed:",n),this.showToast("Failed to generate ideas",3e3)}finally{e.textContent=t,e.disabled=!1,this.isProcessing=!1}},buildRefinementPrompt(){return`Refine and enhance this topic for a viral Twitter thread: "${this.currentTopic}"

Generate 5 refined versions that are:
- More specific and focused
- More engaging and clickable
- More likely to go viral
- Under 60 characters each
- Clear and compelling

Format as a numbered list. No explanations, just the refined topics.

Example:
Input: "productivity"
1. "The 5-minute productivity hack"
2. "Why productivity apps fail"
3. "Productivity secrets of CEOs"
4. "The dark side of productivity"
5. "Productivity vs. effectiveness"

Now refine: "${this.currentTopic}"`},buildIdeasPrompt(){return`Generate 10 viral thread ideas that blend evergreen topics with current trends.

TRENDING CONTEXT: ${["Artificial Intelligence","Remote Work","Climate Change","Mental Health","Web3 & Blockchain","Creator Economy","Personal Finance","Health & Wellness","Future of Education","Sustainable Living","Digital Privacy","Side Hustles"].sort(()=>.5-Math.random()).slice(0,3).join(", ")}

REQUIREMENTS:
- Each idea should be specific and compelling
- Under 60 characters
- Mix of educational, controversial, and practical topics
- High engagement potential
- Clear value proposition

FORMAT: Numbered list only, no explanations

Examples:
1. "AI tools that actually save time"
2. "Remote work is making us lonely"
3. "The climate solution nobody discusses"
4. "Why therapists quit social media"
5. "Web3 isn't dead, it's evolving"

Generate 10 fresh ideas now:`},displayRefinements(e){let t=this.parseSuggestions(e);this.displaySuggestions(t,"refinements")},displayTopicIdeas(e){let t=this.parseSuggestions(e);this.displaySuggestions(t,"ideas")},parseSuggestions(e){let t=e.split(`
`),n=[];for(let a of t){let i=a.match(/^\d+\.?\s*(.+)$/);i&&i[1].trim()&&n.push(i[1].trim())}return n.slice(0,8)},displaySuggestions(e,t){let n=document.getElementById("topic-suggestions"),a=document.getElementById("suggestions-list");!n||!a||(a.innerHTML=e.map(i=>`
        <div class="suggestion-item" data-topic="${this.escapeHtml(i)}">
          <span class="suggestion-text">${this.escapeHtml(i)}</span>
          <button class="suggestion-apply" title="Use this topic">\u2713</button>
        </div>
      `).join(""),n.classList.remove("hidden"),a.querySelectorAll(".suggestion-apply").forEach(i=>{i.addEventListener("click",s=>{s.stopPropagation();let o=s.target.closest(".suggestion-item").dataset.topic;this.applySuggestion(o)})}),a.querySelectorAll(".suggestion-item").forEach(i=>{i.addEventListener("click",()=>{let s=i.dataset.topic;this.applySuggestion(s)})}))},applySuggestion(e){let t=document.getElementById("thread-topic");t&&(t.value=e,t.focus(),this.hideSuggestions(),this.showToast("Topic updated",1500))},hideSuggestions(){let e=document.getElementById("topic-suggestions");e&&e.classList.add("hidden")},async callGeminiAPI(e){if(!window.TabTalkAPI?.callGeminiAPI)throw new Error("API not available");return await window.TabTalkAPI.callGeminiAPI(e)},showToast(e,t=3e3){window.TabTalkUI?.showToast?window.TabTalkUI.showToast(e,t):console.log("Toast:",e)},escapeHtml(e){let t=document.createElement("div");return t.textContent=e,t.innerHTML}};window.TabTalkTopicEnhancer=d,document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>d.init()):d.init()})();(()=>{var d=class{constructor(){this.apiKey=null,this.currentTab=null,this.pageContent=null,this.isLoading=!1,this.currentDomain=null,this.messagesContainer=document.getElementById("messages-container"),this.pageStatus=document.getElementById("page-status"),this.pageTitle=document.getElementById("page-title"),this.quickActions=document.getElementById("quick-actions"),this.sidebar=document.getElementById("sidebar"),this.quickTwitterBtn=document.getElementById("quick-twitter"),this.quickRepostBtn=document.getElementById("quick-repost"),this.quickTwitterThreadBtn=document.getElementById("quick-twitter-thread"),this.quickCreateBtn=document.getElementById("quick-create"),this.welcomeView=document.getElementById("welcome-view"),this.apiSetupView=document.getElementById("api-setup-view"),this.chatView=document.getElementById("chat-view"),this.settingsView=document.getElementById("settings-view"),this.menuButton=document.getElementById("menu-button"),this.apiKeyInput=document.getElementById("api-key-input")||document.getElementById("settings-api-key"),this.inputActions=document.querySelector(".input-actions"),this.exportFormatSelect=document.getElementById("export-format-select"),this.statusText=document.getElementById("status-text"),this.views={welcome:this.welcomeView,"api-setup":this.apiSetupView,chat:this.chatView,settings:this.settingsView}}async init(){try{console.log("TabTalk AI: Initializing popup");let t=await chrome.tabs.query({active:!0,currentWindow:!0});!t||t.length===0?(console.error("TabTalk AI: Failed to get current tab"),this.pageStatus&&(this.pageStatus.textContent="\u274C Failed to access current tab")):(this.currentTab=t[0],console.log("TabTalk AI: Current tab:",this.currentTab.url)),await this.loadState();try{let a=await this.getStorageItem?await this.getStorageItem("theme"):null;a||(a="dark"),document.documentElement.setAttribute("data-theme",a)}catch{}if(this.migrateThreadsToGallery)try{await this.migrateThreadsToGallery()}catch(a){console.warn("Thread migration skipped",a)}this.bindEvents();let n=await this.getStorageItem("hasSeenWelcome");this.apiKey?(this.showView("chat"),await this.getAndCachePageContent()):n?this.showView("api-setup"):this.showView("welcome"),console.log("TabTalk AI: Popup initialized")}catch(t){console.error("TabTalk AI: Initialization error:",t),this.pageStatus&&(t.message&&t.message.includes("Extension context invalidated")?this.pageStatus.textContent="\u26A0\uFE0F Extension reloaded. Please refresh the page and try again.":this.pageStatus.textContent=`\u274C Initialization failed: ${t.message}`),this.showView&&this.showView("welcome")}}bindEvents(){let t=document.getElementById("settings-cancel-button"),n=document.getElementById("settings-save-button");t&&t.addEventListener("click",()=>{this.updateViewState(this.apiKey?"chat":"settings")}),n&&n.addEventListener("click",()=>this.handleSaveSettings());let a=document.getElementById("delete-api-key-button");a&&a.addEventListener("click",()=>this.handleDeleteApiKey()),console.log("Menu Button:",this.menuButton),console.log("Sidebar:",this.sidebar),this.menuButton&&this.sidebar&&(this.menuButton.addEventListener("click",u=>{u.stopPropagation(),console.log("Menu button clicked!");let y=this.sidebar.classList.contains("hidden");y?(this.sidebar.classList.remove("hidden"),this.sidebar.style.display="block"):(this.sidebar.classList.add("hidden"),this.sidebar.style.display="none"),console.log("Sidebar is now:",y?"visible":"hidden"),this.sidebar.setAttribute("aria-expanded",y?"false":"true")}),document.addEventListener("click",u=>{this.sidebar.classList.contains("hidden")||!this.sidebar.contains(u.target)&&u.target!==this.menuButton&&(this.sidebar.classList.add("hidden"),this.sidebar.setAttribute("aria-expanded","false"))}),this.sidebar.addEventListener("keydown",u=>{u.key==="Escape"&&(this.sidebar.classList.add("hidden"),this.sidebar.setAttribute("aria-expanded","false"),this.menuButton.focus())}));let i=document.getElementById("menu-settings-link");i&&i.addEventListener("click",u=>{u.preventDefault(),this.updateViewState("settings"),this.sidebar&&this.sidebar.classList.add("hidden")});let s=document.getElementById("theme-toggle");s&&s.addEventListener("click",async()=>{let y=(document.documentElement.getAttribute("data-theme")||"light")==="dark"?"light":"dark";if(document.documentElement.setAttribute("data-theme",y),this.setStorageItem)try{await this.setStorageItem("theme",y)}catch{}});let o=document.getElementById("menu-gallery-link");o&&o.addEventListener("click",u=>{u.preventDefault(),this.showView("gallery")});let r=document.getElementById("welcome-get-started");r&&r.addEventListener("click",async()=>{await this.setStorageItem("hasSeenWelcome",!0),this.showView("api-setup")});let l=document.getElementById("welcome-start");l&&l.addEventListener("click",async()=>{await this.setStorageItem("hasSeenWelcome",!0),this.showView("api-setup")});let c=document.getElementById("api-setup-back");c&&c.addEventListener("click",()=>{this.showView("welcome")});let g=document.getElementById("api-setup-back-arrow");g&&g.addEventListener("click",()=>{this.showView("welcome")});let h=document.getElementById("api-setup-continue");h&&h.addEventListener("click",async()=>{let u=document.getElementById("onboarding-api-key").value.trim();u&&(await this.saveApiKey(u),this.showView("chat"),await this.getAndCachePageContent())});let m=document.getElementById("test-api-key");m&&m.addEventListener("click",async()=>{let u=document.getElementById("onboarding-api-key").value.trim();if(u){let y=await this.testApiKey(u),T=document.getElementById("api-setup-continue");y?(m.textContent="\u2713 Valid",m.style.background="#10b981",m.style.color="white",T.disabled=!1):(m.textContent="\u2717 Invalid",m.style.background="#ef4444",m.style.color="white",T.disabled=!0),setTimeout(()=>{m.textContent="Test",m.style.background="",m.style.color=""},2e3)}});let p=document.getElementById("onboarding-api-key");p&&p.addEventListener("input",()=>{let u=document.getElementById("api-setup-continue");u.disabled=!p.value.trim()}),this.menuButton&&this.menuButton.setAttribute("aria-label","Open menu"),this.apiKeyInput&&this.apiKeyInput.setAttribute("aria-label","Gemini API Key"),console.log("Button elements found:",{quickTwitterBtn:!!this.quickTwitterBtn,quickRepostBtn:!!this.quickRepostBtn,quickTwitterThreadBtn:!!this.quickTwitterThreadBtn,quickCreateBtn:!!this.quickCreateBtn}),this.quickTwitterBtn&&this.quickTwitterBtn.addEventListener("click",async()=>{this.resetScreenForGeneration&&this.resetScreenForGeneration(),await this.generateSocialContent("twitter")}),this.quickRepostBtn&&this.quickRepostBtn.addEventListener("click",async()=>{if(!window.TabTalkRepostModal||typeof window.TabTalkRepostModal.showWithContentLoading!="function"){console.warn("TabTalk AI: Repost modal module not available"),this.showToast?this.showToast("\u274C Repost flow unavailable. Please reload the extension.",4e3):alert("\u274C Repost flow unavailable. Please reload the extension.");return}try{await window.TabTalkRepostModal.showWithContentLoading(this)}catch(u){console.error("TabTalk AI: Failed to open repost modal",u),this.showToast?this.showToast(`\u274C Repost setup failed: ${u.message}`,4e3):alert(`\u274C Repost setup failed: ${u.message}`)}}),this.quickTwitterThreadBtn&&this.quickTwitterThreadBtn.addEventListener("click",async()=>{console.log("Thread button clicked - showing tone selector for thread generation"),this.resetScreenForGeneration&&this.resetScreenForGeneration(),await this.generateSocialContent("thread")}),this.quickCreateBtn&&this.quickCreateBtn.addEventListener("click",()=>{window.TabTalkThreadGenerator&&window.TabTalkThreadGenerator.showModal?window.TabTalkThreadGenerator.showModal(this):this.showView("thread-generator")});let w=document.getElementById("generate-thread-btn");w&&w.addEventListener("click",async()=>{this.handleThreadGeneratorSubmit&&await this.handleThreadGeneratorSubmit()}),this.initializeHorizontalScroll(),window.TabTalkThreadGenerator&&window.TabTalkThreadGenerator.init&&(console.log("TabTalk AI: Initializing Thread Generator modal..."),window.TabTalkThreadGenerator.init())}async testApiKey(t){try{let n=await chrome.runtime.sendMessage({action:"testApiKey",apiKey:t});return n&&n.success}catch(n){return console.error("Error testing API key:",n),!1}}async handleSaveSettings(){let t=this.apiKeyInput?this.apiKeyInput.value.trim():"";if(!t){alert("Please enter a valid API key");return}await this.testApiKey(t)?(await this.saveApiKey(t),console.log("TabTalk AI: Saving API key with key name 'geminiApiKey' successfully"),this.showView("chat"),await this.getAndCachePageContent()):alert("Invalid API key. Please try again.")}async getAndCachePageContent(){if(!(!this.currentTab||!this.apiKey)){this.setLoading(!0,"Reading page..."),this.pageStatus.textContent="Injecting script to read page...";try{if(this.currentTab.url?.startsWith("chrome://")||this.currentTab.url?.startsWith("https://chrome.google.com/webstore"))throw new Error("Cannot run on protected browser pages.");let t=await chrome.scripting.executeScript({target:{tabId:this.currentTab.id},files:["content.js"]});if(!t||t.length===0)throw new Error("Script injection failed.");let n=t[0].result;if(n.success)this.pageContent=n.content,this.pageStatus.textContent=`\u2705 Content loaded (${(n.content.length/1024).toFixed(1)} KB)`,this.updateQuickActionsVisibility();else throw new Error(n.error)}catch(t){console.error("TabTalk AI (popup):",t),t.message&&t.message.includes("Extension context invalidated")?this.pageStatus.textContent="\u26A0\uFE0F Extension reloaded. Please refresh the page and try again.":this.pageStatus.textContent=`\u274C ${t.message}`}finally{this.setLoading(!1)}}}};let e=d.prototype.init;document.addEventListener("DOMContentLoaded",()=>{window.TabTalkAPI&&Object.assign(d.prototype,window.TabTalkAPI),window.TabTalkTwitter&&Object.assign(d.prototype,window.TabTalkTwitter),window.TabTalkThreadGenerator&&Object.assign(d.prototype,window.TabTalkThreadGenerator),window.TabTalkContentAnalysis&&Object.assign(d.prototype,window.TabTalkContentAnalysis),window.TabTalkSocialMedia&&Object.assign(d.prototype,window.TabTalkSocialMedia),window.TabTalkStorage&&Object.assign(d.prototype,window.TabTalkStorage),window.TabTalkUI&&Object.assign(d.prototype,window.TabTalkUI),window.TabTalkScroll&&Object.assign(d.prototype,window.TabTalkScroll),window.TabTalkNavigation&&Object.assign(d.prototype,window.TabTalkNavigation),d.prototype.init=async function(){return await e.call(this),this},new d().init().catch(t=>console.error("Initialization error:",t))})})();})();
