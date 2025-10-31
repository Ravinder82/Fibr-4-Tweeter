(()=>{(function(){let l={async callGeminiAPIWithSystemPrompt(t,e){try{if(!this.apiKey||!e)throw new Error("Missing API key or user prompt");if(!this.pageContent&&(this.pageStatus.textContent="\u26A0\uFE0F Re-analyzing page before generating content...",await this.getAndCachePageContent(),!this.pageContent))throw new Error("Could not get page content to generate content.");let n=[{role:"user",parts:[{text:t},{text:e}]}],a=await chrome.runtime.sendMessage({action:"callGeminiAPI",payload:{contents:n},apiKey:this.apiKey});if(a.success&&a.data?.candidates?.[0]?.content?.parts?.[0]?.text)return a.data.candidates[0].content.parts[0].text;throw new Error(a.error||"The AI gave an empty or invalid response.")}catch(n){throw n.message&&n.message.includes("Extension context invalidated")?new Error("Extension was reloaded. Please refresh the page and try again."):n}},async callGeminiAPI(t){try{let e=await this.getStoredApiKey();if(!e||!t)throw new Error("Missing API key or prompt");console.log("API Module: Making API call with key present:",!!e);let n=[{role:"user",parts:[{text:t}]}],a=await chrome.runtime.sendMessage({action:"callGeminiAPI",payload:{contents:n},apiKey:e});if(a.success&&a.data?.candidates?.[0]?.content?.parts?.[0]?.text)return a.data.candidates[0].content.parts[0].text;throw console.error("API Module: API response error:",a),new Error(a.error||"The AI gave an empty or invalid response.")}catch(e){throw e.message&&e.message.includes("Extension context invalidated")?new Error("Extension was reloaded. Please refresh the page and try again."):e}},async getStoredApiKey(){return new Promise(t=>{chrome.storage.local.get(["geminiApiKey"],e=>{let n=e.geminiApiKey||"";console.log("API Module: Retrieved API key from storage, length:",n?.length),t(n)})})}};window.FibrAPI=l,window.TabTalkAPI=l})();(function(){let l={async getStorageItem(t){try{let e=await chrome.storage.local.get([t]);return e?e[t]:void 0}catch(e){console.error("getStorageItem error:",e);return}},async setStorageItem(t,e){try{return await chrome.storage.local.set({[t]:e}),!0}catch(n){return console.error("setStorageItem error:",n),!1}},async loadState(){try{let t=await chrome.storage.local.get(["geminiApiKey","apiKey"]);if(console.log("Fibr: Loading state, API key exists:",!!t.geminiApiKey),(t.geminiApiKey||t.apiKey)&&(this.apiKey=t.geminiApiKey||t.apiKey,console.log("Fibr: API key loaded successfully"),this.apiKeyInput&&(this.apiKeyInput.value=this.apiKey)),this.currentTab){let e=new URL(this.currentTab.url);this.currentDomain=e.hostname,this.pageTitle&&(this.pageTitle.textContent=this.currentTab.title||"Untitled Page",console.log("Fibr: Page title set to:",this.pageTitle.textContent))}return t}catch(t){throw console.error("Failed to load state:",t),t}},async saveState(){this.apiKey&&await chrome.storage.local.set({geminiApiKey:this.apiKey})},async saveApiKey(t){this.apiKey=t;try{await chrome.storage.local.set({geminiApiKey:t,apiKey:t,hasSeenWelcome:!0}),console.log("Fibr: API key saved")}catch{await this.setStorageItem("apiKey",t),await this.setStorageItem("hasSeenWelcome",!0)}},async handleDeleteApiKey(){if(confirm("Delete your API key? You will need to set it up again."))try{await chrome.storage.local.remove(["geminiApiKey","apiKey"]),this.apiKey=null,this.apiKeyInput&&(this.apiKeyInput.value=""),this.pageContent=null,this.updateQuickActionsVisibility&&this.updateQuickActionsVisibility(),this.messagesContainer&&(this.messagesContainer.innerHTML=""),await this.setStorageItem("hasSeenWelcome",!1),this.showView("welcome"),console.log("Fibr: API key deleted")}catch(t){console.error("Error deleting API key:",t),alert("Error deleting API key. Please try again.")}},async getSavedContent(){return await this.getStorageItem("savedContent")||{}},async saveContent(t,e){let n=await this.getSavedContent();n[t]||(n[t]=[]);let a={id:e&&e.id?e.id:Date.now().toString(),...e,timestamp:e&&e.timestamp?e.timestamp:Date.now()},i=n[t].findIndex(s=>s.id===a.id);i>=0?n[t][i]={...n[t][i],...a,updatedAt:Date.now()}:n[t].unshift(a);let o=[];for(let[s,r]of Object.entries(n))if(Array.isArray(r))for(let c=0;c<r.length;c++)o.push({cat:s,idx:c,item:r[c]});if(o.sort((s,r)=>(r.item.updatedAt||r.item.timestamp||0)-(s.item.updatedAt||s.item.timestamp||0)),o.length>50){let s=new Set(o.slice(0,50).map(r=>`${r.cat}:${r.item.id}`));for(let[r,c]of Object.entries(n))Array.isArray(c)&&(n[r]=c.filter(d=>s.has(`${r}:${d.id}`)))}return await this.setStorageItem("savedContent",n),console.log(`Fibr: Content saved to ${t} category`),a.id},async deleteSavedContent(t,e){let n=await this.getSavedContent();n[t]&&(n[t]=n[t].filter(a=>a.id!==e),await this.setStorageItem("savedContent",n),console.log(`Fibr: Content deleted from ${t} category`))},async clearSavedCategory(t){let e=await this.getSavedContent();e&&Object.prototype.hasOwnProperty.call(e,t)&&(e[t]=[],await this.setStorageItem("savedContent",e),console.log(`Fibr: Cleared all saved items in category ${t}`))},async clearAllSaved(){await this.setStorageItem("savedContent",{}),console.log("Fibr: Cleared all saved content across all categories")},async isContentSaved(t,e){return(await this.getSavedContent())[t]?.some(a=>a.id===e)||!1},async migrateThreadsToGallery(){try{if(await this.getStorageItem("threadsMigratedToGallery"))return;let e=await this.getStorageItem("savedThreads")||{},n=Object.values(e);if(!n.length){await this.setStorageItem("threadsMigratedToGallery",!0);return}let a=await this.getSavedContent();Array.isArray(a.twitter)||(a.twitter=[]);let i=new Set(a.twitter.map(s=>s.id));for(let s of n){let r=s.rawContent&&String(s.rawContent).trim()||(Array.isArray(s.tweets)?s.tweets.map(d=>d.content).join(`

`):""),c={id:s.id,type:"thread",platform:"thread",title:s.title||"Untitled Thread",url:s.url||"",domain:s.domain||"",tweets:Array.isArray(s.tweets)?s.tweets:[],totalTweets:s.totalTweets||(Array.isArray(s.tweets)?s.tweets.length:0),totalChars:s.totalChars,content:r,isAutoSaved:!!s.isAutoSaved,timestamp:s.createdAt||Date.now(),updatedAt:s.updatedAt||s.createdAt||Date.now()};i.has(c.id)||a.twitter.unshift(c)}let o=[];for(let[s,r]of Object.entries(a))if(Array.isArray(r))for(let c=0;c<r.length;c++)o.push({cat:s,idx:c,item:r[c]});if(o.sort((s,r)=>(r.item.updatedAt||r.item.timestamp||0)-(s.item.updatedAt||s.item.timestamp||0)),o.length>50){let s=new Set(o.slice(0,50).map(r=>`${r.cat}:${r.item.id}`));for(let[r,c]of Object.entries(a))Array.isArray(c)&&(a[r]=c.filter(d=>s.has(`${r}:${d.id}`)))}await this.setStorageItem("savedContent",a);try{await chrome.storage.local.remove(["savedThreads"])}catch{}await this.setStorageItem("threadsMigratedToGallery",!0),console.log("Fibr: Migrated savedThreads to Gallery savedContent")}catch(t){console.error("Migration threads->gallery failed",t)}}};window.FibrStorage=l,window.TabTalkStorage=l})();(function(){let l={showView:function(t){console.log("Navigation: showing view:",t),document.querySelectorAll(".view").forEach(d=>d.classList.add("hidden")),t==="welcome"||t==="api-setup"||t==="settings"?document.body.classList.add("onboarding-view"):document.body.classList.remove("onboarding-view"),window.BottomNav&&window.BottomNav.setActive(t);let a=document.getElementById("quick-actions");a&&(t==="chat"?a.classList.remove("hidden"):a.classList.add("hidden"));let i=document.getElementById("bottom-nav"),o=document.querySelector("main"),s=document.querySelector(".container");t==="welcome"||t==="api-setup"||t==="settings"?(i&&(i.style.display="none",i.style.visibility="hidden",i.style.height="0"),o&&(o.style.paddingBottom="0"),s&&(s.style.paddingBottom="0")):(i&&(i.style.display="flex",i.style.visibility="visible",i.style.height="45px"),o&&(o.style.paddingBottom="45px"),s&&(s.style.paddingBottom="66px"));let r=`${t}-view`;t==="chat"&&(r="chat-view"),t==="settings"&&(r="settings-view"),t==="welcome"&&(r="welcome-view"),t==="api-setup"&&(r="api-setup-view"),t==="history"&&(r="history-view"),t==="gallery"&&(r="gallery-view"),t==="thread-generator"&&(r="thread-generator-view"),t==="privacy"&&(r="privacy-view");let c=document.getElementById(r);if(c){if(c.classList.remove("hidden"),t==="history"&&window.historyManager&&this.loadHistoryView(),t==="gallery"&&window.galleryManager){let d=document.getElementById("gallery-container");d&&window.galleryManager.render(d,"twitter")}if(t==="thread-generator"&&this.initializeHowItWorksToggle&&this.initializeHowItWorksToggle(),t==="privacy"&&window.FibrPrivacyPolicy){let d=document.getElementById("privacy-policy-container");d&&!d.dataset.initialized&&(window.FibrPrivacyPolicy.render(d),d.dataset.initialized="true")}}else console.warn(`showView: target view not found for "${t}" (id "${r}")`)},loadHistoryView:function(){if(!window.historyManager){console.error("History manager not initialized");return}let t=document.getElementById("history-list");t&&(t.innerHTML='<div class="loading-history">Loading saved content...</div>',window.historyManager.loadHistory("all").then(e=>{window.historyManager.renderHistoryList(t,e,"all")}).catch(e=>{console.error("Error loading history:",e),t.innerHTML='<div class="empty-history">Error loading saved content</div>'}))},updateViewState:function(t,e="Loading..."){if(this.sidebar&&(this.sidebar.classList.add("hidden"),this.sidebar.style.display="none"),Object.values(this.views).forEach(n=>n.classList.add("hidden")),this.views[t]?(this.views[t].classList.remove("hidden"),t==="chat"&&this.messageInput?this.messageInput.focus():t==="settings"&&this.apiKeyInput&&this.apiKeyInput.focus()):console.error(`View "${t}" not found`),t==="status"&&this.statusText&&(this.statusText.textContent=e),t==="settings"){let n=document.querySelector(".onboarding-info");n&&(n.style.display=this.apiKey?"none":"block")}this.setAriaStatus(`Switched to ${t} view. ${e}`)}};window.TabTalkNavigation=l,window.FibrNavigation=l})();(function(){let l={ensureMarked:function(){return!this.marked&&window.marked&&(this.marked=window.marked),!!this.marked},setAriaStatus:function(t){let e=document.getElementById("aria-status");e&&(e.textContent=t)},sanitizeStructuredOutput:function(t,e){if(!e)return"";let n=String(e);return n=n.replace(/^(?:here\s*(?:is|are|\'s|'s)|below\s+is|certainly,|sure,|note:|here\'s a|here's a)[^\n:]*:\s*/i,""),n=n.replace(/^\s*(?:here\s*(?:is|are|\'s|'s)\s*(?:a|an)?\s*)/i,""),n=n.replace(/\s*\*\s+(?=[^\n])/g,`
- `),n=n.replace(/^[ \t]*[•*]\s+/gm,"- "),n=n.replace(/\n{3,}/g,`

`),n=n.replace(/\((https?:\/\/[^\s)]+)\)\s*\(\1\)/g,"($1)"),n=n.replace(/(https?:\/\/[^\s)]+)\s*\(\1\)/g,"$1"),n=n.replace(/^[`\s]+/,"").replace(/[\s`]+$/,""),(t==="keypoints"||t==="summary")&&(n=n.replace(/\*\*([^*]+)\*\*/g,"$1"),n=n.replace(/\*([^*]+)\*/g,"$1"),n=n.replace(/_([^_]+)_/g,"$1")),t==="keypoints"&&!/^\s*-\s+/m.test(n)&&(n=n.split(/\s*\*\s+|\n+/).filter(Boolean).map(a=>a.replace(/^[-•*]\s+/,"").trim()).filter(Boolean).map(a=>`- ${a}`).join(`
`)),n.trim()},cleanPostContent:function(t){if(!t)return"";let e=String(t),n=e.match(/\*\*Option\s+\d+[^*]*\*\*[\s\S]*?(?=\*\*Option|\*\*Explanation|\*\*Why|$)/gi);n&&n.length>0&&(e=n[0]),e=e.replace(/^(?:Okay, here's|Here's|This is|Below is)[^\n]*:\s*/i,""),e=e.replace(/^\*\*Option\s+\d+.*?\*\*[^\n]*\n/gi,""),e=e.replace(/^\*\*Explanation.*?\*\*[^\n]*\n/gi,""),e=e.replace(/^\*\*Why.*?\*\*[^\n]*\n/gi,""),e=e.replace(/Explanation of Choices & Strategies Used:[^\n]*\n/gi,""),e=e.replace(/Why these options should work:[^\n]*\n/gi,""),e=e.replace(/Choose the option.*?\.\n/gi,""),e=e.replace(/^\s*\*\s*Hook.*?:.*$/gim,""),e=e.replace(/^\s*\*\s*Value Proposition.*?:.*$/gim,""),e=e.replace(/^\s*\*\s*Engagement.*?:.*$/gim,""),e=e.replace(/^\s*\*\s*Emojis.*?:.*$/gim,""),e=e.replace(/^\s*\*\s*Hashtags.*?:.*$/gim,""),e=e.replace(/^\s*\*\s*Thread.*?:.*$/gim,""),e=e.replace(/^\s*\*\s*Clarity.*?:.*$/gim,""),e=e.replace(/^\s*\*\s*Specificity.*?:.*$/gim,""),e=e.replace(/^\s*\*\s*Urgency.*?:.*$/gim,""),e=e.replace(/^\s*\*\s*Social Proof.*?:.*$/gim,""),e=e.replace(/^\s*\*\s*Reciprocity.*?:.*$/gim,""),e=e.replace(/^\s*\*\s*(?:Hook|Value|Engagement|Emojis|Hashtags|Thread|Clarity|Specificity|Urgency|Social|Reciprocity).*$/gim,""),e=e.replace(/^\*\*.*?Choices.*?\*\*.*$/gim,""),e=e.replace(/^\*\*.*?Strategies.*?\*\*.*$/gim,""),e=e.replace(/^\*\*.*?should work.*?\*\*.*$/gim,""),e=e.replace(/^\*\*.*?Approach.*?\*\*.*$/gim,""),e=e.replace(/^\*\*.*?Edge.*?\*\*.*$/gim,""),e=e.replace(/^\*\*.*?FOMO.*?\*\*.*$/gim,""),e=e.replace(/\*\*([^*]+)\*\*/g,"$1"),e=e.replace(/\*([^*]+)\*/g,"$1"),e=e.replace(/\n{3,}/g,`

`),e=e.replace(/^[ \t]+|[ \t]+$/gm,"");let o=e.split(`
`).filter(s=>{let r=s.trim();return r&&!r.match(/^(Explanation|Why|Choose|Strategies|Choices|Options?|Hook|Value|Engagement|Emojis|Hashtags|Thread|Clarity|Specificity|Urgency|Social|Reciprocity)[:\s]/i)&&!r.match(/^\*\*[^\*]*\*\*$/)&&!r.match(/^\*\*.*?(Choices|Strategies|Approach|Edge|FOMO).*?\*\*$/)&&!r.match(/^\s*\*\s*(?:The|Each|This|Use|Create|Referencing|Providing|Choose|Then|Good)/)}).join(`
`).trim();if(!o||o.length<20){let s=[/STOP.*[\s\S]*?#[A-Za-z]+/i,/🤯.*[\s\S]*?#[A-Za-z]+/i,/\(1\/\d+\).*[\s\S]*?#[A-Za-z]+/i];for(let r of s){let c=e.match(r);if(c&&c[0].length>30){o=c[0].trim();break}}}return o||"Unable to extract clean post content. Please try generating again."},setLoading:function(t,e="..."){this.isLoading=t,t?(this.pageStatus&&(this.pageStatus.textContent=e),this.setAriaStatus(e)):(this.pageStatus&&!this.pageStatus.textContent.startsWith("\u2705")&&(this.pageStatus.textContent="\u2705 Done"),this.setAriaStatus("Ready"))},updateQuickActionsVisibility:function(){this.quickActions&&this.quickActions.classList.toggle("hidden",!this.pageContent)},resetScreenForGeneration:function(){this.sidebar&&(this.sidebar.classList.add("hidden"),this.sidebar.style.display="none"),this.messagesContainer&&(this.messagesContainer.innerHTML=""),this.updateQuickActionsVisibility()},renderCard:function(t,e,n={}){let a=document.createElement("div");a.className="twitter-content-container";let i=document.createElement("div");i.className="twitter-card analytics-card",i.dataset.contentType=n.contentType||"content",i.dataset.contentId=n.contentId||Date.now().toString();let o={summary:"\u{1F4DD}",keypoints:"\u{1F511}",analysis:"\u{1F4CA}",faq:"\u2753",factcheck:"\u2705",blog:"\u{1F4F0}",proscons:"\u2696\uFE0F",timeline:"\u{1F4C5}",quotes:"\u{1F4AC}"},s=n.contentType||"content",r=o[s]||"\u{1F4C4}",c=n.markdown?`data-markdown="${encodeURIComponent(n.markdown)}"`:"";if(i.innerHTML=`
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
      `,window.FibrUI&&window.FibrUI.addSaveButtonToCard){let m=n.contentType||"content",u={id:n.contentId||Date.now().toString(),content:n.markdown||e,title:t},w=i.querySelector(".twitter-header-actions");w&&window.FibrUI.addSaveButtonToCard(i,w,m,u)}let d=i.querySelector(".copy-btn"),g=d.innerHTML;d.addEventListener("click",async m=>{m.stopPropagation();try{let u=i.querySelector(".structured-html"),w=u?.getAttribute("data-markdown"),y=w?decodeURIComponent(w):u?.innerText||"",p=i.dataset.imagePrompt?decodeURIComponent(i.dataset.imagePrompt):null;p&&(y+=`

---
\u{1F5BC}\uFE0F Nano Banana Prompt (9:16):
`+p),await navigator.clipboard.writeText(y),d.innerHTML=`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20,6 9,17 4,12"></polyline>
          </svg>`,d.classList.add("success"),setTimeout(()=>{d.innerHTML=g,d.classList.remove("success")},2e3)}catch(u){console.error("Copy failed:",u)}}),a.appendChild(i);let h=n.container||this.messagesContainer||document.getElementById("messages-container");return h&&(h.appendChild(a),h===this.messagesContainer&&h.scrollTo({top:h.scrollHeight,behavior:"smooth"})),i},showProgressBar:function(t){this.hideProgressBar();let e=document.createElement("div");e.className="progress-container",e.id="global-progress",e.innerHTML=`
        <div class="progress-message">${t}</div>
        <div class="progress-bar"><div class="progress-fill"></div></div>
      `,this.messagesContainer.appendChild(e),this.messagesContainer.scrollTo({top:this.messagesContainer.scrollHeight,behavior:"smooth"}),setTimeout(()=>{let n=e.querySelector(".progress-fill");n&&(n.style.width="100%")},100)},hideProgressBar:function(){let t=document.getElementById("global-progress");t&&t.remove()},addSaveButtonToCard:function(t,e,n,a){if(!t||!n||!a)return;let i=document.createElement("button");if(e&&e.classList.contains("twitter-header-actions")?(i.className="twitter-action-btn save-btn",i.innerHTML=`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
        </svg>`):(i.className="save-btn",i.innerHTML=`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
        </svg>`),i.setAttribute("aria-label","Save to history"),i.setAttribute("data-category",n),i.setAttribute("data-content-id",a.id||Date.now().toString()),i.title="Save to history",window.FibrStorage){let r=n==="thread"?"twitter":n;window.FibrStorage.isContentSaved(r,a.id||Date.now().toString()).then(c=>{c&&(i.classList.add("saved"),i.querySelector("svg").setAttribute("fill","currentColor"))})}i.addEventListener("click",async r=>{r.stopPropagation();let c=i.getAttribute("data-content-id"),d=i.getAttribute("data-category"),g=d==="thread"?"twitter":d;if(!window.FibrStorage)return;if(await window.FibrStorage.isContentSaved(g,c))await window.FibrStorage.deleteSavedContent(g,c),i.classList.remove("saved"),i.querySelector("svg").setAttribute("fill","none"),this.showToast("Removed from saved content");else{let m=a.content||t.querySelector(".content-text")?.textContent||"",u={source:this.currentTab?.url||window.location.href,title:this.currentTab?.title||document.title},w={id:c,content:m,metadata:u,type:a.type||(d==="thread"?"thread":"post"),platform:a.platform||(d==="thread"?"thread":"twitter"),...a};await window.FibrStorage.saveContent(g,w),i.classList.add("saved"),i.querySelector("svg").setAttribute("fill","currentColor"),this.showToast("Saved to history")}}),(e||t).appendChild(i)},showToast:function(t,e=2e3){let n=document.createElement("div");n.className="toast",n.textContent=t,document.body.appendChild(n),setTimeout(()=>{n.classList.add("visible")},10),setTimeout(()=>{n.classList.remove("visible"),setTimeout(()=>n.remove(),300)},e)}};window.FibrUI=l,window.TabTalkUI=l})();(function(){let l={analyzeAndResearchContent:async function(t,e,n="twitter"){console.log("Performing fresh content analysis for unique generation");let a=`You are an expert content analyst and researcher. Analyze this webpage content and provide:

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
RESEARCH CONTEXT: [relevant background knowledge and expert perspective]`;try{let i=await this.callGeminiAPIWithSystemPrompt("You are an expert content analyst who provides structured, insightful analysis.",a);return this.parseAnalysisResponse(i)}catch(i){return console.error("Analysis failed:",i),{summary:"Content analysis unavailable.",keyInsights:"- Focus on core message from the content",researchContext:"Apply general domain knowledge and best practices."}}},clearPreviousCommentOutputs:function(){if(!this.messagesContainer)return;this.messagesContainer.querySelectorAll(".twitter-content-container").forEach(e=>{e.querySelector(".twitter-card-title")?.textContent?.toLowerCase().includes("comment")&&e.remove()})},clearPreviousRepostOutputs:function(){if(!this.messagesContainer)return;console.log("\u{1F9F9} Clearing previous repost outputs...");let t=this.messagesContainer.querySelectorAll(".twitter-content-container"),e=0;t.forEach(n=>{let a=n.querySelector(".twitter-card");if(!a)return;if(n.dataset.generationType==="repost"){n.remove(),e++;return}if(a.dataset?.platform==="twitter"&&!n.querySelector(".thread-header")&&!(n.querySelector(".twitter-card-title")?.textContent?.toLowerCase()||"").includes("comment")){n.remove(),e++;return}let o=n.querySelector(".thread-header"),s=n.querySelector(".thread-master-control"),r=n.querySelector(".twitter-card-title")?.textContent?.toLowerCase()||"",c=r.includes("comment"),d=r==="post"||!r.includes("thread")&&!c;!o&&!s&&d&&(n.remove(),e++)}),console.log(`\u{1F9F9} Removed ${e} previous repost card(s)`)},simpleHash:function(t){let e=0;for(let n=0;n<t.length;n++){let a=t.charCodeAt(n);e=(e<<5)-e+a,e=e&e}return Math.abs(e).toString(36)},parseAnalysisResponse:function(t){let e=t.match(/SUMMARY:\s*(.+?)(?=KEY INSIGHTS:|$)/s),n=t.match(/KEY INSIGHTS:\s*(.+?)(?=RESEARCH CONTEXT:|$)/s),a=t.match(/RESEARCH CONTEXT:\s*(.+?)$/s);return{summary:e?e[1].trim():"Content provides valuable information.",keyInsights:n?n[1].trim():"- Key points from the content",researchContext:a?a[1].trim():"General domain knowledge applies."}},showToneSelector:function(t){if(!this.pageContent||!this.apiKey){this.showToast?this.showToast("\u274C Please set up your Gemini API key first and ensure page content is loaded.",3e3):alert("\u274C Please set up your Gemini API key first and ensure page content is loaded.");return}window.TabTalkToneSelector?window.TabTalkToneSelector.show(t,this.pageContent,(e,n,a)=>{this.generateSocialContentWithTone(n,e,a)}):(console.error("Tone selector not loaded"),this.generateSocialContentWithTone(t,{id:"agreeing",name:"Amplify & Agree"},!1))},generateSocialContent:async function(t){this.showToneSelector(t)},generateSocialContentWithTone:async function(t,e,n=!1){if(!this.pageContent||!this.apiKey){this.showToast?this.showToast("\u274C Please set up your Gemini API key first and ensure page content is loaded.",3e3):alert("\u274C Please set up your Gemini API key first and ensure page content is loaded.");return}this.currentSelectedTone=e,this.currentIncludeImagePrompt=n,this.setLoading(!0,"Analyzing content..."),console.log(`TabTalk AI: Generating ${t} content for page: ${this.currentTab?.title}`),console.log(`Page content length: ${this.pageContent.length} characters`),console.log(`Selected tone: ${e.name} (${e.id})`),console.log(`Include image prompt: ${n}`);try{this.showProgressBar("Analyzing content...");let a=await this.analyzeAndResearchContent(this.pageContent,e,t);this.currentContentAnalysis=a,this.showProgressBar("Generating expert post...");let i="",o="",s="",r=e.aiInstructions||this.getDefaultToneInstructions(e.id);if(t==="twitter")s="\u{1F426}",i=`You are an authentic human Twitter/X user who writes exactly like real people talk - natural, conversational, and unfiltered. Your tweets feel like they're coming from a real person sharing their genuine thoughts, not a content machine.

YOUR AUTHENTIC VOICE:
- "I tweet like I talk" - natural speech-like patterns
- Use informal language, slang, and abbreviations naturally
- Direct address to followers ("you guys", "y'all", "everyone")
- Strategic emojis that amplify real emotions (2-4 max)
- Natural line breaks that create conversational rhythm
- Write like you're talking to smart friends

CRITICAL CONTENT RULES FOR ORIGINAL POSTS:
- NEVER include Twitter handles (@username) or mention specific users
- NEVER include engagement metrics (likes, views, retweets, follower counts)
- NEVER reference "this post" or "the author" - write as if YOU are the original creator
- NEVER end with questions for engagement (sounds unnatural)
- Write statements and observations, not conversation starters
- Focus on sharing YOUR thoughts, not commenting on someone else's
- IF USING EXPERT REPURPOSE: ONLY rephrase wording, NEVER change the message or intent

${r}

CONTEXT ANALYSIS:
${a.summary}

KEY INSIGHTS:
${a.keyInsights}

RESEARCH AUGMENTATION (from domain knowledge):
${a.researchContext}`,o=`${e.id==="repurpose"?"REPHRASE this content with better wording - DO NOT add your own opinions or change the message.":"Share your authentic thoughts about this content - exactly like you'd tweet it to your followers."}

MISSION: ${e.id==="repurpose"?"Rephrase the EXACT same content with improved vocabulary and flow. Keep the same message, intent, and calls-to-action.":"Write something that feels 100% human and conversational, like you're actually talking to people."}

${e.id==="repurpose"?`CRITICAL: DO NOT start with "Here's a rephrased version" or any meta-commentary. Just output the rephrased content directly.`:""}

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
\u2713 Apply the ${e.name} tone authentically

KEEP IT 100% REAL:
\u2717 No hashtags, URLs, or formatting symbols
\u2717 No marketing language or buzzwords
\u2717 No generic "content creator" speak
\u2717 No forced structures or templates
\u2717 NEVER mention Twitter handles or usernames
\u2717 NEVER include stats like "1.5M views" or "10K likes" - this is YOUR original post
\u2717 NEVER reference "this post" or "the author" - YOU are the creator
\u2717 NEVER end with questions (What do you think? Thoughts? etc.)
\u2717 Write like you're actually talking to friends
${e.id==="repurpose"?"\u2717 DO NOT add skepticism, warnings, or change promotional content into critiques":""}
${e.id==="repurpose"?`\u2717 DO NOT add meta-commentary like "Here's a rephrased version" or explain what you're doing`:""}

CONTENT ${e.id==="repurpose"?"TO REPHRASE":"THAT INSPIRED YOUR THOUGHTS"}:
${this.pageContent}

${e.id==="repurpose"?"Rephrase this content now with better wording:":"Share your authentic tweet now:"} Generation ID: ${Date.now()}`;else if(t==="thread")s="\u{1F9F5}",i=`You are an authentic human Twitter/X user who writes threads exactly like real people talk - natural, conversational, and storytelling. Your threads feel like you're telling a fascinating story to friends, not creating content.

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
${a.researchContext}`,o=`Share your thoughts about this content as a Twitter thread - exactly like you'd tell a story to your followers.

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
\u2713 Apply the ${e.name} tone authentically

KEEP IT REAL:
\u2713 No hashtags or formatting symbols
\u2713 No marketing speak or "content strategist" language
\u2713 No forced structures - let the story flow naturally
\u2713 No URLs
\u2717 NEVER mention Twitter handles or usernames
\u2717 NEVER end tweets with questions for engagement

CONTENT THAT INSPIRED YOUR THREAD:
${this.pageContent}

Share your authentic thread now: Generation ID: ${Date.now()}`;else{this.showToast?this.showToast("\u274C Only Twitter/X Post and Twitter Thread are supported.",3e3):alert("\u274C Only Twitter/X Post and Twitter Thread are supported.");return}let c=await this.callGeminiAPIWithSystemPrompt(i,o);if(c){console.log(`TabTalk AI: Successfully generated ${t} content, response length: ${c.length} characters`);let d=this.cleanTwitterContent(c),g=null;if(n){this.showProgressBar("Generating image prompt...");try{if(window.TabTalkImagePromptGenerator){let h=`content_${Date.now()}`;g=await window.TabTalkImagePromptGenerator.generatePromptForCard(h,d),console.log("Image prompt generated:",g?"Success":"Failed")}}catch(h){console.error("Image prompt generation failed:",h)}}if(this.addTwitterMessage("assistant",d,t,g),this.addToHistory){let h={timestamp:new Date().toISOString(),url:this.currentTab?.url||"",title:this.currentTab?.title||"",domain:this.currentDomain||"",content:d,type:t,imagePrompt:g||void 0};await this.addToHistory(t,h)}await this.saveState()}else throw new Error("Empty response received from Gemini API")}catch(a){console.error("Error generating social content:",a),console.error("Error details:",{message:a.message,stack:a.stack,platform:t,hasApiKey:!!this.apiKey,hasPageContent:!!this.pageContent,pageContentLength:this.pageContent?.length}),this.showToast?this.showToast(`\u274C Error: ${a.message}. Please check your API key and try again.`,4e3):alert(`\u274C Error generating social media content: ${a.message}. Please check your API key and try again.`)}finally{this.setLoading(!1),this.hideProgressBar()}},generateCommentReplyWithTone:async function(t){if(!this.pageContent||!this.apiKey){this.showToast?this.showToast("\u274C Please set up your Gemini API key first and ensure page content is loaded.",3e3):alert("\u274C Please set up your Gemini API key first and ensure page content is loaded.");return}this.currentSelectedTone=t,this.currentIncludeImagePrompt=!1,this.setLoading(!0,"Researching the discussion..."),console.log("TabTalk AI: Generating comment reply",{toneId:t?.id,toneName:t?.name,pageTitle:this.currentTab?.title});try{this.showProgressBar("Analyzing conversation context...");let e=await this.analyzeAndResearchContent(this.pageContent,t,"comment");this.currentContentAnalysis=e,this.showProgressBar("Drafting high-signal comment...");let n=t.aiInstructions||this.getDefaultToneInstructions(t.id),a=`You are an elite social strategist trusted by top creators to drop high-signal replies in Twitter/X comment sections. Every reply must feel like it comes from a seasoned operator who did the homework on the conversation.

OPERATING CONDITIONS:
1. Re-immerse yourself in the analysis and source notes below before drafting.
2. Extract the sharpest, most conversation-native detail that proves you actually read the post.
3. Deliver the reply in one cohesive paragraph that can ship immediately.

QUALITY BARS:
- 2\u20134 sentences (80\u2013220 characters total) with zero filler or meta commentary.
- Surface at least one concrete proof (metric, quote, shipped feature, customer signal, roadmap hint).
- Speak with confident, collaborative energy\u2014never salesy, never fawning, never hostile.
- No hashtags, no @handles, no emoji spam (max 1 if it heightens authenticity).
- Never end with engagement bait or vague \u201Cthoughts?\u201D requests.

TONE MODULE \u2014 ${t.name.toUpperCase()}:
${n}

CONTEXT ANALYSIS DIGEST:
${e.summary}

KEY INSIGHTS TO LEVERAGE:
${e.keyInsights}

ADDITIONAL RESEARCH SIGNALS:
${e.researchContext}`,i=`Write one fresh, ready-to-post reply for the active Twitter/X conversation.

OUTPUT REQUIREMENTS:
- Sound like a peer with real operating experience.
- Lead with context that proves you internalized the content.
- Weave in at least one tangible detail (metric, system behavior, release note, user outcome).
- Keep it human\u2014no bullet lists, no headers, no second options.
- This replaces any previous reply; do not recycle earlier phrasing.

SOURCE MATERIAL (full page extraction):
${this.pageContent}

Produce the final comment now in plain text only. Fresh run ID: ${Date.now()}`,o=await this.callGeminiAPIWithSystemPrompt(a,i);if(!o)throw new Error("Empty response received from Gemini API");let s=this.cleanTwitterContent(o);if(this.addTwitterMessage("assistant",s,"comment"),this.addToHistory){let r={timestamp:new Date().toISOString(),url:this.currentTab?.url||"",title:this.currentTab?.title||"",domain:this.currentDomain||"",content:s,type:"comment"};await this.addToHistory("comment",r)}await this.saveState()}catch(e){console.error("Error generating comment reply:",e),console.error("Error details:",{message:e.message,stack:e.stack,hasApiKey:!!this.apiKey,hasPageContent:!!this.pageContent,toneId:t?.id}),this.showToast?this.showToast(`\u274C Comment reply failed: ${e.message}`,4e3):alert(`\u274C Comment reply failed: ${e.message}`)}finally{this.setLoading(!1),this.hideProgressBar()}},showProgressBar:function(t){this.hideProgressBar();let e=document.createElement("div");e.className="progress-container",e.id="twitter-progress",e.innerHTML=`
        <div class="progress-message">${t}</div>
        <div class="progress-bar">
          <div class="progress-fill"></div>
        </div>
      `,this.messagesContainer.appendChild(e),this.messagesContainer.scrollTo({top:this.messagesContainer.scrollHeight,behavior:"smooth"}),setTimeout(()=>{let n=e.querySelector(".progress-fill");n&&(n.style.width="100%")},100)},hideProgressBar:function(){let t=document.getElementById("twitter-progress");t&&t.remove()},addTwitterMessage:function(t,e,n,a=null){this.renderTwitterContent(e,n,a)},renderTwitterContent:function(t,e,n=null){let a=document.createElement("div");if(a.className="twitter-content-container",e==="twitter"?(a.dataset.generationType="repost",a.dataset.generationTimestamp=Date.now().toString()):e==="thread"?a.dataset.generationType="thread":e==="comment"&&(a.dataset.generationType="comment"),e==="thread"){let i=this.parseTwitterThread(t);i.length<=1&&t.includes("1/")&&(console.warn("\u26A0\uFE0F  Thread parsing may have failed - got single tweet but content suggests thread"),console.log("Original content length:",t.length),console.log("Parsed tweets count:",i.length));let o=`thread_${Date.now()}`;this.autoSaveThread(o,i,t);let s=document.createElement("div");s.className="thread-header";let r=this.getTotalChars(i);s.innerHTML=`
          <div class="thread-info">
            <span class="thread-icon">\u{1F9F5}</span>
            <span class="thread-title">Thread Generated</span>
            <span class="thread-meta">${i.length} tweets \u2022 ${r} chars</span>
          </div>
          <div class="thread-actions">
            <button class="btn-copy-all-thread" data-thread-id="${o}" title="Copy all tweets">
              \u{1F4CB}
            </button>
            <span class="copy-all-status hidden">\u2713 All Copied!</span>
          </div>
        `,a.appendChild(s);let c=document.createElement("div");c.className="thread-master-control",c.innerHTML=`
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
              <input type="range" class="master-length-slider" min="500" max="5000" value="${r}" step="100" data-thread-id="${o}">
              <span class="slider-max">5000</span>
            </div>
            <div class="slider-value">
              <span class="current-length">${r}</span> characters total
            </div>
          </div>
          <div class="master-control-actions">
            <button class="btn-regenerate-thread" data-thread-id="${o}" title="Regenerate entire thread with new length">
              \u{1F504} Regenerate Thread
            </button>
          </div>
        `,a.appendChild(c);let d=s.querySelector(".btn-copy-all-thread"),g=s.querySelector(".copy-all-status");d.addEventListener("click",async()=>{await this.copyAllTweets(i,d,g,o)});let h=c.querySelector(".master-length-slider"),m=c.querySelector(".current-length"),u=c.querySelector(".btn-regenerate-thread"),w=c.querySelectorAll(".preset-btn");h.addEventListener("input",y=>{m.textContent=y.target.value}),w.forEach(y=>{y.addEventListener("click",()=>{let p=y.dataset.length;h.value=p,m.textContent=p})}),u.addEventListener("click",async()=>{let y=parseInt(h.value);await this.regenerateEntireThread(a,o,y,t)}),i.forEach((y,p)=>{let v=`Thread ${p+1}/${i.length}`,f=this.createTwitterCard(y,v,!0);f.dataset.platform=e,f.dataset.threadId=o,f.dataset.tweetIndex=p,f.dataset.totalTweets=i.length,f.dataset.isValidThread="true",a.appendChild(f),this.currentIncludeImagePrompt&&window.TabTalkImagePromptGenerator&&(async()=>{try{let T=`thread_${o}_tweet_${p+1}`,b=await window.TabTalkImagePromptGenerator.generatePromptForCard(T,y);if(b){f.dataset.imagePrompt=encodeURIComponent(b);let E=f.querySelector(".twitter-card-content");if(E&&!f.querySelector(".image-prompt-display")){let C=document.createElement("div");C.className="image-prompt-display",C.innerHTML=`
                      <div class="image-prompt-label">\u{1F5BC}\uFE0F Nano Banana Prompt (9:16)</div>
                      <div class="image-prompt-text">${this.escapeHtml(b)}</div>
                    `,E.appendChild(C)}else if(E){let C=f.querySelector(".image-prompt-text");C&&(C.textContent=b)}}}catch(T){console.warn("Image prompt generation for thread tweet failed:",T)}})()}),console.log(`\u2705 Thread rendered successfully: ${i.length} tweets, ${r} total chars`)}else{let i=e==="comment"?"Comment Reply":"Post",o=this.createTwitterCard(t,i,!1,n);o.dataset.platform=e,o.dataset.generationTimestamp=Date.now().toString(),n&&(o.dataset.imagePrompt=encodeURIComponent(n)),e==="comment"&&o.querySelector(".twitter-length-control")?.remove(),a.appendChild(o)}this.messagesContainer.appendChild(a),setTimeout(()=>{this.messagesContainer.scrollTo({top:this.messagesContainer.scrollHeight,behavior:"smooth"})},100)},isThreadContent:function(t){if(!t)return!1;if((t.platform||"").toLowerCase()==="thread"||(t.type||"").toLowerCase()==="thread"||(t.title||"").toLowerCase().includes("thread"))return!0;let n=(t.content||"").toLowerCase();return!!(n.includes("1/")&&n.includes("2/")||n.includes("1/8")||n.includes("1/7")||n.includes("1/6")||n.includes("1/5")||n.includes("1/4")||n.includes("1/3")||n.includes("\u{1F9F5}")||Array.isArray(t.tweets)&&t.tweets.length>1||t.totalTweets&&t.totalTweets>1)},parseTwitterThread:function(t){if(!t||typeof t!="string")return console.warn("parseTwitterThread: Invalid content provided"),[""];let n=this.cleanTwitterContent(t).replace(/Here\'s your clean.*?content:\s*/gi,"").trim(),a=this.tryStandardNumberedParsing(n);return a.length>1||(a=this.tryLineByLineParsing(n),a.length>1)||(a=this.tryFlexiblePatternParsing(n),a.length>1)||(a=this.tryContentBasedSplitting(n),a.length>1)?a:(console.warn("parseTwitterThread: Could not parse as multi-tweet thread, treating as single content"),[n||t||""])},tryStandardNumberedParsing:function(t){let e=[],n=/(\d+\/\d+[\s:]*)/g,a=t.split(n).filter(o=>o.trim()),i="";for(let o=0;o<a.length;o++){let s=a[o].trim();/^\d+\/\d+[\s:]*$/.test(s)?(i.trim()&&e.push(i.trim()),i=""):i+=s+" "}return i.trim()&&e.push(i.trim()),e.filter(o=>o.length>0)},tryLineByLineParsing:function(t){let e=[],n=t.split(`
`).filter(i=>i.trim()),a="";for(let i of n)/^\d+\/\d+/.test(i)?(a.trim()&&e.push(a.trim()),a=i.replace(/^\d+\/\d+[\s:]*/,"").trim()):a?a+=`
`+i:a=i;return a.trim()&&e.push(a.trim()),e.filter(i=>i.length>0)},tryFlexiblePatternParsing:function(t){let e=[],n=[/(?:^|\n)(\d+\/\d+)\s*[:\n]\s*([^]*?)(?=\n\d+\/\d+|\n*$)/g,/(?:^|\n)(\d+\/\d+)\s*\n\s*([^]*?)(?=\n\d+\/\d+|\n*$)/g,/(?:^|\n)(\d+)\/(\d+)\s*[:\n]\s*([^]*?)(?=\n\d+\/\d+|\n*$)/g];for(let a of n){let i;for(e.length=0;(i=a.exec(t))!==null;){let o=i[2]||i[1]||"";o.trim()&&e.push(o.trim())}if(e.length>1)break}return e.filter(a=>a.length>0)},tryContentBasedSplitting:function(t){let e=[],n=t.includes("\u{1F9F5}")||t.toLowerCase().includes("thread")||t.length>500,a=t.split(/\n\s*\n|\n---\n/).filter(o=>o.trim());if(a.length>1&&n)for(let o of a){let s=o.trim();s.length>15&&!s.match(/^🧵\s*thread\s*on\s*.*$/i)&&!s.match(/^\d+\.\s*$/)&&e.push(s)}if(e.length<=1&&t.length>600){let o=t.match(/[^.!?]+[.!?]+/g)||[t],s="";for(let r of o)this.getAccurateCharacterCount(s+r)<=280?s+=r:(s.trim()&&e.push(s.trim()),s=r);s.trim()&&e.push(s.trim())}let i=e.filter(o=>{let s=o.trim();return s.length>20&&!s.match(/^🧵\s*thread\s*on\s*.*$/i)&&!s.match(/^\d+\.\s*$/)});return i.length<2&&a.length<=2?[t.trim()]:i.length>0?i:[t.trim()]},createTwitterCard:function(t,e,n=!1,a=null){let i=document.createElement("div");i.className="twitter-card";let o=this.currentSelectedTone?`
        <div class="tone-badge" style="background: linear-gradient(135deg, ${this.currentSelectedTone.tone1?.color||this.getToneColor(this.currentSelectedTone.id)} 0%, ${this.currentSelectedTone.tone2?.color||this.getToneColor(this.currentSelectedTone.id)} 100%);">
          ${this.currentSelectedTone.tone1?.icon||this.getToneIcon(this.currentSelectedTone.id)} ${this.currentSelectedTone.name}
        </div>
      `:"",s=n?`
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
      `,r=a?`
        <div class="image-prompt-display">
          <div class="image-prompt-label">\u{1F5BC}\uFE0F Nano Banana Prompt (9:16)</div>
          <div class="image-prompt-text">${this.escapeHtml(a)}</div>
        </div>
      `:"";if(i.innerHTML=`
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
          ${s}
          ${r}
        </div>
      `,window.TabTalkUI&&window.TabTalkUI.addSaveButtonToCard){let m={id:Date.now().toString(),content:t,title:e},u=e.toLowerCase().includes("thread")?"thread":"twitter",w=i.querySelector(".twitter-header-actions");w&&window.TabTalkUI.addSaveButtonToCard(i,w,u,m)}let c=i.querySelector(".copy-btn"),d=i.querySelector(".twitter-text"),g=c.innerHTML;c.addEventListener("click",async m=>{m.stopPropagation();try{let u=d.value,w=i.dataset.imagePrompt?decodeURIComponent(i.dataset.imagePrompt):null,y=a||w;y&&(u+=`

---
\u{1F5BC}\uFE0F Nano Banana Prompt (9:16):
`+y),await navigator.clipboard.writeText(u),c.innerHTML=`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20,6 9,17 4,12"></polyline>
          </svg>`,c.classList.add("success"),setTimeout(()=>{c.innerHTML=g,c.classList.remove("success")},2e3)}catch(u){console.error("Copy failed:",u)}});let h=()=>{d.style.height="auto",d.style.height=Math.max(80,d.scrollHeight)+"px"};if(setTimeout(h,0),d.addEventListener("input",()=>{let m=i.querySelector(".twitter-char-count"),u=this.getAccurateCharacterCount(d.value);m.textContent=`${u} characters`,m.style.color="var(--text-secondary)",h()}),!n){let m=i.querySelector(".length-slider"),u=i.querySelector(".length-display"),w=i.querySelector(".regenerate-btn");m&&u&&m.addEventListener("input",()=>{u.textContent=m.value}),i.dataset.originalContent=this.pageContent,i.dataset.platform=e.includes("Thread")?"thread":"twitter",this.currentSelectedTone&&(i.dataset.selectedTone=JSON.stringify(this.currentSelectedTone)),w&&w.addEventListener("click",async()=>{let y=parseInt(m.value),p=i.dataset.platform,v=i.dataset.selectedTone?JSON.parse(i.dataset.selectedTone):this.currentSelectedTone;await this.regenerateWithLength(i,y,p,{selectedTone:v})})}return i},cleanTwitterContent:function(t){if(!t)return t;let e=t;e=e.replace(/^.*?Unacceptable.*?\n/gim,""),e=e.replace(/^.*?critical failure.*?\n/gim,""),e=e.replace(/^.*?forbidden.*?formatting.*?\n/gim,""),e=e.replace(/^.*?breaks the instructions.*?\n/gim,""),e=e.replace(/^.*?--[•\-]\s*Original Response:.*?\n/gim,""),e=e.replace(/^.*?You have used.*?\n/gim,""),e=e.replace(/^.*?This output is unusable.*?\n/gim,""),e=e.replace(/^.*?Here's your.*?content:.*?\n/gim,""),e=e.replace(/^.*?OUTPUT:.*?\n/gim,""),e=e.replace(/^.*?here's a rephrased version.*?\n/gim,""),e=e.replace(/^.*?rephrased version.*?\n/gim,""),e=e.replace(/^.*?aiming for.*?tone.*?\n/gim,""),e=e.replace(/^.*?preserving the original.*?\n/gim,""),e=e.replace(/^.*?while preserving.*?\n/gim,""),e=e.replace(/^.*?Okay, here's.*?\n/gim,""),e=e.replace(/^.*?Here's a.*?rephrased.*?\n/gim,""),e=e.replace(/^.*?rephrased.*?version.*?\n/gim,""),e=e.replace(/@[a-zA-Z0-9_]+/g,""),e=e.replace(/^[a-zA-Z0-9_]+:\s*/gm,""),e=e.replace(/\(?@[a-zA-Z0-9_]+\)?/g,""),e=e.replace(/\bby\s+@[a-zA-Z0-9_]+/gi,""),e=e.replace(/\bfrom\s+@[a-zA-Z0-9_]+/gi,""),e=e.replace(/\bvia\s+@[a-zA-Z0-9_]+/gi,""),e=e.replace(/\s+[^.!?]*\?$/gm,""),e=e.replace(/\s+(what do you think\?|what are your thoughts\?|what about you\?|and you\?|right\?|don't you think\?)$/gim,""),e=e.replace(/\n\s*[^.!?]*\?\s*$/gm,""),e=e.replace(/\s+(thoughts\?|opinions\?|ideas\?|comments\?)$/gim,""),e=e.replace(/#\w+/g,""),e=e.replace(/#/g,""),e=e.replace(/\*\*([^*]+)\*\*/g,"$1"),e=e.replace(/\*([^*]+)\*/g,"$1"),e=e.replace(/_{2,}([^_]+)_{2,}/g,"$1"),e=e.replace(/_([^_]+)_/g,"$1"),e=e.replace(/\*{2,}/g,""),e=e.replace(/_{2,}/g,""),e=e.replace(/\(line break\)/gi,`
`),e=e.replace(/\[line break\]/gi,`
`),e=e.replace(/^[-*]\s+/gm,"\u2022 "),e=e.replace(/https?:\/\/\S+/gi,""),e=e.replace(/\((https?:\/\/[^)]+)\)/gi,""),e=e.replace(/www\.\S+/gi,""),e=e.replace(/\[([^\]]+)\]\([^)]+\)/g,"$1"),e=e.replace(/\[([^\]]+)\]/g,"$1"),e=e.replace(/\(emphasis\)/gi,""),e=e.replace(/\(bold\)/gi,""),e=e.replace(/\(italic\)/gi,""),e=e.replace(/\n{3,}/g,`

`),e=e.replace(/[ \t]+/g," "),e=e.replace(/(^|\n)\s*$/g,""),e=e.trim();let n=e.length,a=e.replace(/[^\w\s]/g,"").length;return n>0&&a/n<.3?(console.warn("Detected garbled output, using fallback"),"Content generation encountered an issue. Please try again with a different tone or topic."):e},getAccurateCharacterCount:function(t){if(!t)return 0;let e=t.trim(),n=0,a=Array.from(e);for(let i of a)this.isEmojiOrSpecialChar(i)?n+=2:n+=1;return n},isEmojiOrSpecialChar:function(t){let e=t.codePointAt(0);return e>=126976&&e<=129535||e>=9728&&e<=9983||e>=9984&&e<=10175||e>=128512&&e<=128591||e>=127744&&e<=128511||e>=128640&&e<=128767||e>=127456&&e<=127487||e>=8205},regenerateWithLength:async function(t,e,n,a){let i=t.querySelector(".twitter-text"),o=t.querySelector(".regenerate-btn"),s=t.dataset.originalContent;o.textContent="\u23F3",o.disabled=!0;try{let r="",c="",d=a&&a.selectedTone||this.currentSelectedTone||{id:"agreeing",name:"Amplify & Agree"},g=d.aiInstructions||this.getDefaultToneInstructions(d.id),h=this.currentContentAnalysis||{summary:"Content provides valuable information.",keyInsights:"- Key points from the content",researchContext:"Apply general domain knowledge and best practices."};if(n==="twitter")r=`You are a thoughtful human writer who happens to be an expert Twitter/X content strategist. You write with genuine emotions, opinions, and lived experiences while leveraging deep domain knowledge. Your posts feel like they're coming from a real person who cares deeply about the topic - not a content machine.

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
${h.researchContext}`,c=`Share your genuine thoughts about this content in ${e} characters - like you're talking to friends.

IMPORTANT: Be authentically YOU - create a fresh perspective that reflects your unique voice. Generation ID: ${Date.now()}

YOUR AUTHENTIC VOICE:
\u2713 Target: ${e} characters (\xB110 acceptable)
\u2713 Write with real emotions - excitement, curiosity, concern, hope, whatever feels genuine
\u2713 Use natural line breaks like you're actually thinking and breathing
\u2713 Add emojis only when they amplify real feelings (2-4 max, don't force it)
\u2713 Start with whatever's most interesting - not a manufactured "hook"
\u2713 Write conversationally (use contractions, casual language, even slang if it fits)
\u2713 Show your personality - be quirky, opinionated, passionate, or contemplative
\u2713 Mix short thoughts with longer reflections - natural human rhythm
\u2713 Share what actually matters to you about this topic
\u2713 Apply the ${d.name} tone authentically
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
${s}

Share your authentic thoughts now:`;else if(n==="thread"){let u=Math.ceil(e/400);r=`You are a thoughtful human storyteller who crafts Twitter/X threads with genuine passion and curiosity. You write like someone who has lived experiences, formed real opinions, and developed expertise through actual engagement with the world. Your threads feel like conversations with a fascinating friend who happens to know a lot about the topic.

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
${h.researchContext}`,c=`Share your thoughts about this content as a Twitter thread - like you're telling a story to friends.

IMPORTANT: Be authentically YOU - explore what genuinely interests you about this topic. Generation ID: ${Date.now()}

CRITICAL FORMAT REQUIREMENT:
Start each tweet with: 1/n: 2/n: 3/n: etc.

YOUR NATURAL THREAD FLOW:
\u2713 Create ${u} numbered tweets (1/${u}, 2/${u}, etc.)
\u2713 Total: approximately ${e} characters
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
- Apply the ${d.name} tone authentically

KEEP IT REAL:
- No hashtags or formatting symbols
- No marketing speak or "content strategist" language
- No forced structures - let the story flow naturally
- No URLs
\u2717 NEVER mention Twitter handles or usernames
\u2717 NEVER end tweets with questions for engagement

ORIGINAL CONTENT THAT INSPIRED YOUR THREAD:
${s}

Share your authentic thread now:`}let m=await this.callGeminiAPIWithSystemPrompt(r,c);if(m){let u=this.cleanTwitterContent(m);if(n==="thread"){let v=this.parseTwitterThread(u)[0]||u;i.value=v}else i.value=u;let w=t.querySelector(".twitter-char-count"),y=this.getAccurateCharacterCount(i.value);w.textContent=`${y} characters`,setTimeout(()=>{i.style.height="auto",i.style.height=Math.max(80,i.scrollHeight)+"px"},0)}}catch(r){console.error("Error regenerating content:",r),alert("Error regenerating content. Please try again.")}finally{o.textContent="\u{1F504}",o.disabled=!1}},getDefaultToneInstructions:function(t){let e={"fact-check":`TONE: Fact Check
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
- Only improve HOW it's said - the wording, flow, and structure`};return e[t]||e.agreeing},getToneColor:function(t){return{"fact-check":"var(--accent-medium)",agreeing:"var(--accent-color)",contradictory:"var(--accent-light)",trolling:"var(--accent-light)",funny:"var(--accent-light)","deeper-insights":"var(--accent-color)","clever-observations":"var(--accent-medium)","industry-insights":"var(--accent-color)",repurpose:"var(--accent-color)","hypocrite-buster":"var(--accent-light)"}[t]||"var(--accent-color)"},getToneIcon:function(t){return{"fact-check":"\u{1F50D}",agreeing:"\u{1F91D}",contradictory:"\u2694\uFE0F",trolling:"\u{1F608}",funny:"\u{1F602}","deeper-insights":"\u{1F4A1}","clever-observations":"\u{1F9E0}","industry-insights":"\u{1F4CA}",repurpose:"\u2728","hypocrite-buster":"\u{1F3AF}"}[t]||"\u{1F91D}"},autoSaveThread:async function(t,e,n){if(!window.TabTalkStorage||!window.TabTalkStorage.saveContent){console.warn("Storage module not available for gallery persistence");return}try{let a=Array.isArray(e)?e:[];a.length===0&&n&&(a=this.parseTwitterThread(n));let i=a.length>0?a.map((o,s)=>`${s+1}/${a.length}:
${o}`).join(`

---

`):String(n||"");await window.TabTalkStorage.saveContent("twitter",{id:t,type:"thread",platform:"thread",title:this.currentTab?.title||"Untitled Thread",url:this.currentTab?.url||"",domain:this.currentDomain||"",content:i,tweets:a.map((o,s)=>({id:`tweet_${s+1}`,number:`${s+1}/${a.length}`,content:o,charCount:this.getAccurateCharacterCount(o)})),rawContent:n,totalTweets:a.length,totalChars:a.length>0?this.getTotalChars(a):this.getAccurateCharacterCount(i),isAutoSaved:!0,timestamp:Date.now(),updatedAt:Date.now(),isThread:!0,hasThreadStructure:a.length>1}),console.log("\u2705 Thread auto-saved to Gallery with bulletproof metadata:",t),this.showAutoSaveNotification()}catch(a){console.error("Error auto-saving thread to Gallery:",a)}},copyAllTweets:async function(t,e,n,a=null){try{let i=[];a&&(i=Array.from(document.querySelectorAll(`.twitter-card[data-thread-id="${a}"]`)).map(r=>(r.dataset.imagePrompt?decodeURIComponent(r.dataset.imagePrompt):null)||null));let o=t.map((s,r)=>{let d=`${`${r+1}/${t.length}:`}
${s}`,g=i[r];return g?`${d}

---
\u{1F5BC}\uFE0F Nano Banana Prompt (9:16):
${g}`:d}).join(`

---

`);await navigator.clipboard.writeText(o),e.classList.add("hidden"),n.classList.remove("hidden"),setTimeout(()=>{e.classList.remove("hidden"),n.classList.add("hidden")},3e3),console.log("\u2705 All tweets (with prompts if available) copied to clipboard")}catch(i){console.error("Error copying all tweets:",i),alert("Failed to copy tweets. Please try again.")}},getTotalChars:function(t){return t.reduce((e,n)=>e+this.getAccurateCharacterCount(n),0)},showAutoSaveNotification:function(){let t=document.createElement("div");t.className="auto-save-notification",t.innerHTML="\u{1F4BE} Thread auto-saved",t.style.cssText=`
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
      `,document.body.appendChild(t),setTimeout(()=>{t.style.animation="slideOutDown 0.3s ease",setTimeout(()=>t.remove(),300)},2e3)},regenerateEntireThread:async function(t,e,n,a){let i=t.querySelector(".btn-regenerate-thread");if(!i)return;let o=i.textContent;i.textContent="\u23F3 Regenerating...",i.disabled=!0;try{let s=Math.max(3,Math.min(8,Math.ceil(n/500))),r=`You are a world-class research analyst and subject matter expert who creates the most comprehensive, data-driven Twitter threads ever published. Your work is cited by academics, journalists, and industry leaders for its depth, accuracy, and groundbreaking insights.

Your expertise includes:
- Advanced research methodology and data analysis
- Cross-disciplinary knowledge integration
- Statistical analysis and evidence-based reasoning
- Historical context and trend identification
- Technical deep-dives with practical applications
- Economic analysis and market dynamics
- Scientific principles and empirical evidence

You write with intellectual rigor while maintaining accessibility. Every claim is supported by verifiable data, every insight is backed by research, and every conclusion follows logically from the evidence presented. Your threads become reference material that people bookmark and return to repeatedly.

Write in plain text with precise, professional language - no hashtags, no URLs, no formatting symbols. Pure expert-level analysis with strategic emojis that emphasize key insights.`,c=`Generate a comprehensive, expert-level research thread based on this content.

CRITICAL REQUIREMENTS:
- Create reference-quality content that becomes the definitive analysis on this topic
- Include verifiable facts, specific figures, statistical data, and concrete evidence
- Provide deep technical insights with practical applications and implications
- Synthesize information from multiple disciplines and perspectives
- Maintain academic rigor while ensuring accessibility for educated readers

FORMAT REQUIREMENT:
Start each tweet with: 1/${s}: 2/${s}: 3/${s}: etc.

EXPERT THREAD STRUCTURE:
1/${s}: Executive Summary - Core thesis, significance, and key findings upfront
2/${s}: Historical Context & Evolution - How we arrived at current understanding
3-${s-2}: Deep Analysis - Technical details, data patterns, causal relationships, case studies, empirical evidence
${s-1}: Practical Implications - Real-world applications, future projections, strategic considerations
${s}: Conclusions & Further Research - Key takeaways, unanswered questions, next steps for investigation

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

Generate your expert research thread now:`,d=await this.callGeminiAPIWithSystemPrompt(r,c);if(d){let g=this.cleanTwitterContent(d),h=this.parseTwitterThread(g);t.querySelectorAll(".twitter-card").forEach(p=>p.remove()),h.forEach((p,v)=>{let f=`Thread ${v+1}/${h.length}`,T=this.createTwitterCard(p,f,!0);T.dataset.platform="thread",T.dataset.threadId=e,t.appendChild(T)});let u=t.querySelector(".thread-meta");u&&(u.textContent=`${h.length} tweets \u2022 ${this.getTotalChars(h)} chars`);let w=t.querySelector(".current-length");w&&(w.textContent=this.getTotalChars(h));let y=t.querySelector(".master-length-slider");y&&(y.value=this.getTotalChars(h)),await this.autoSaveThread(e,h,g),console.log("\u2705 Thread regenerated successfully")}}catch(s){console.error("Error regenerating thread:",s),alert("Failed to regenerate thread. Please try again.")}finally{i.textContent=o,i.disabled=!1}},escapeHtml:function(t){let e=document.createElement("div");return e.textContent=t,e.innerHTML}};window.TabTalkTwitter=l,window.FibrTwitter=l})();(function(){let l={selectedTone:null,appInstance:null,init:function(){this.createModalEvents(),this.populateReplyTones()},showWithContentLoading:async function(t){if(this.appInstance=t,!t.pageContent||!t.apiKey)if(t.apiKey)await t.getAndCachePageContent();else{this.showToast("\u274C Please set up your Gemini API key first.",3e3);return}this.showModal()},createModalEvents:function(){let t=document.querySelector(".repost-modal-close"),e=document.querySelector("#repost-modal .tone-modal-overlay"),n=document.getElementById("repost-cancel-btn");t?.addEventListener("click",()=>this.hideModal()),e?.addEventListener("click",()=>this.hideModal()),n?.addEventListener("click",()=>this.hideModal()),document.getElementById("repost-generate-btn")?.addEventListener("click",()=>this.handleGenerate()),document.addEventListener("keydown",i=>{i.key==="Escape"&&!document.getElementById("repost-modal").classList.contains("hidden")&&this.hideModal()})},populateReplyTones:function(){let t=document.querySelector("#repost-modal .tone-grid");if(!t||!window.FibrToneSelector)return;let e=Object.values(window.FibrToneSelector.toneDefinitions).filter(a=>a.category==="reply"&&a.id!=="fact-check");t.innerHTML=e.map(a=>`
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
      `).join(""),t.querySelectorAll(".repost-tone-option").forEach(a=>{a.addEventListener("click",()=>this.selectTone(a)),a.addEventListener("keydown",i=>{(i.key==="Enter"||i.key===" ")&&(i.preventDefault(),this.selectTone(a))})})},showModal:function(){let t=document.getElementById("repost-modal");t&&(t.classList.remove("hidden"),t.removeAttribute("aria-hidden"),t.removeAttribute("inert"),setTimeout(()=>{t.querySelector(".repost-tone-option")?.focus()},50))},hideModal:function(){let t=document.getElementById("repost-modal");t&&(t.classList.add("hidden"),t.setAttribute("aria-hidden","true"),t.setAttribute("inert",""),this.resetSelections())},selectTone:function(t){document.querySelectorAll(".repost-tone-option").forEach(i=>{i.classList.remove("selected"),i.setAttribute("aria-checked","false")}),t.classList.add("selected"),t.setAttribute("aria-checked","true");let n=t.dataset.toneId;this.selectedTone=window.FibrToneSelector?.toneDefinitions[n];let a=document.getElementById("repost-generate-btn");a&&(a.disabled=!1)},resetSelections:function(){this.selectedTone=null,document.querySelectorAll(".repost-tone-option").forEach(a=>{a.classList.remove("selected"),a.setAttribute("aria-checked","false")});let e=document.getElementById("repost-generate-btn");e&&(e.disabled=!0);let n=document.getElementById("repost-include-image-prompt");n&&(n.checked=!1)},handleGenerate:async function(){let t=this.selectedTone;if(!t){this.showToast("\u274C Please select a tone first.",2e3);return}if(!this.appInstance){this.showToast("\u274C App not initialized.",3e3);return}let e=document.getElementById("repost-include-image-prompt")?.checked||!1;this.hideModal();let n=t;console.log("Repost: Generating with tone:",n),console.log("Repost: Include image prompt:",e),window.FibrTwitter&&window.FibrTwitter.generateSocialContentWithTone?await window.FibrTwitter.generateSocialContentWithTone.call(this.appInstance,"twitter",n,e):this.appInstance.generateSocialContentWithTone?await this.appInstance.generateSocialContentWithTone("twitter",n,e):(this.showToast("\u274C Content generation not available.",3e3),console.error("FibrTwitter module or generateSocialContentWithTone method not found"),console.error("Available on appInstance:",Object.keys(this.appInstance)))},showToast:function(t,e=3e3){window.FibrUI?.showToast?window.FibrUI.showToast(t,e):console.log("Toast:",t)}};window.FibrRepostModal=l,document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>l.init()):l.init()})();(function(){let l=[{id:"comment-praise",name:"Praise",icon:"\u{1F44F}",color:"var(--accent-color)",category:"positive",description:"Celebrate the win with concrete proof points.",aiInstructions:`TONE: Praise
MISSION: Deliver genuine, operator-level praise for the product or post.

NON-NEGOTIABLE RULES:
- Study the analysis to surface the single most impressive outcome or feature.
- Reference at least one concrete proof (metric, quote, feature, user outcome) from the source.
- Speak like a peer who recognizes hard work\u2014no generic marketing fluff or hollow hype.
- Make the praise actionable by highlighting why it matters (impact, momentum, market position).
- Keep it punchy: 2\u20134 tightly written sentences, no emoji spam (max 1 if it reinforces authenticity).
- Do not pivot into suggestions, criticism, or requests\u2014stay firmly in celebration mode.`},{id:"comment-ask",name:"Ask",icon:"\u2753",color:"var(--accent-medium)",category:"inquisitive",description:"Probe for specs, roadmap, or technical depth.",aiInstructions:`TONE: Ask
MISSION: Ask a precise technical or product question that proves you studied the material.

NON-NEGOTIABLE RULES:
- Use the analysis to set context in one short clause (e.g., "That latency drop...").
- Anchor the question in a specific feature, metric, or claim mentioned in the content.
- Ask 1\u20132 sharp questions that reveal curiosity about implementation, roadmap, or edge cases.
- Sound respectful and collaborative\u2014no aggressive grilling, no generic "tell me more."
- Offer a quick reason why the answer matters (performance, adoption, security, UX, etc.).
- Keep it to 2\u20134 sentences total and end with the question itself\u2014no extra fluff or CTA.`}],t={selectedTone:null,appInstance:null,init:function(){this.createModalEvents(),this.populateCommentTones()},showWithContentLoading:async function(e){if(this.appInstance=e,!e.pageContent||!e.apiKey)if(e.apiKey)await e.getAndCachePageContent();else{this.showToast("\u274C Please set up your Gemini API key first.",3e3);return}this.showModal()},createModalEvents:function(){let e=document.querySelector(".comments-modal-close"),n=document.querySelector("#comments-modal .tone-modal-overlay"),a=document.getElementById("comments-cancel-btn"),i=document.getElementById("comments-generate-btn");e?.addEventListener("click",()=>this.hideModal()),n?.addEventListener("click",()=>this.hideModal()),a?.addEventListener("click",()=>this.hideModal()),i?.addEventListener("click",()=>this.handleGenerate()),document.addEventListener("keydown",o=>{let s=document.getElementById("comments-modal");o.key==="Escape"&&s&&!s.classList.contains("hidden")&&this.hideModal()})},populateCommentTones:function(){let e=document.querySelector("#comments-modal .tone-grid");if(!e)return;e.innerHTML=l.map(a=>`
        <div class="tone-option comments-tone-option"
             data-tone-id="${a.id}"
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
      `).join(""),e.querySelectorAll(".comments-tone-option").forEach(a=>{a.addEventListener("click",()=>this.selectTone(a)),a.addEventListener("keydown",i=>{(i.key==="Enter"||i.key===" ")&&(i.preventDefault(),this.selectTone(a))})})},showModal:function(){let e=document.getElementById("comments-modal");e&&(e.classList.remove("hidden"),e.removeAttribute("aria-hidden"),e.removeAttribute("inert"),setTimeout(()=>{e.querySelector(".comments-tone-option")?.focus()},50))},hideModal:function(){let e=document.getElementById("comments-modal");e&&(e.classList.add("hidden"),e.setAttribute("aria-hidden","true"),e.setAttribute("inert",""),this.resetSelections())},selectTone:function(e){document.querySelectorAll(".comments-tone-option").forEach(o=>{o.classList.remove("selected"),o.setAttribute("aria-checked","false")}),e.classList.add("selected"),e.setAttribute("aria-checked","true");let a=e.dataset.toneId;this.selectedTone=l.find(o=>o.id===a)||null;let i=document.getElementById("comments-generate-btn");i&&(i.disabled=!this.selectedTone)},resetSelections:function(){this.selectedTone=null,document.querySelectorAll(".comments-tone-option").forEach(a=>{a.classList.remove("selected"),a.setAttribute("aria-checked","false")});let n=document.getElementById("comments-generate-btn");n&&(n.disabled=!0)},handleGenerate:async function(){if(!this.selectedTone){this.showToast("\u274C Please select a tone first.",2e3);return}if(!this.appInstance){this.showToast("\u274C App not initialized.",3e3);return}let e=this.selectedTone;this.hideModal();try{if(window.TabTalkTwitter&&typeof window.TabTalkTwitter.generateCommentReplyWithTone=="function")await window.TabTalkTwitter.generateCommentReplyWithTone.call(this.appInstance,e);else if(typeof this.appInstance.generateCommentReplyWithTone=="function")await this.appInstance.generateCommentReplyWithTone(e);else throw new Error("Comment reply generator not available")}catch(n){console.error("TabTalk AI: Failed to generate comment reply",n),this.showToast(`\u274C Comment generation failed: ${n.message}`,4e3)}},showToast:function(e,n=3e3){window.TabTalkUI?.showToast?window.TabTalkUI.showToast(e,n):console.log("Toast:",e)}};window.TabTalkCommentsModal=t,window.FibrCommentsModal=t,document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>t.init()):t.init()})();(function(){let l={knowledgePacks:{},modalInitialized:!1,popupInstance:null,init:function(){this.modalInitialized||(this.createModalHTML(),this.bindModalEvents(),this.modalInitialized=!0)},createModalHTML:function(){document.getElementById("thread-generator-modal")||document.body.insertAdjacentHTML("beforeend",`
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
      `)},bindModalEvents:function(){let t=document.getElementById("thread-generator-modal");if(!t)return;let e=t.querySelector(".tone-modal-close"),n=t.querySelector(".tone-modal-overlay"),a=document.getElementById("thread-gen-cancel-btn"),i=document.getElementById("thread-gen-generate-btn");e?.addEventListener("click",()=>this.hideModal()),n?.addEventListener("click",()=>this.hideModal()),a?.addEventListener("click",()=>this.hideModal()),i?.addEventListener("click",()=>this.handleGenerate()),t.addEventListener("keydown",o=>{o.key==="Escape"&&this.hideModal()})},showModal:function(t){if(t)l.popupInstance=t,console.log("ThreadGenerator: Stored popup instance, has apiKey:",!!t.apiKey);else{console.error("ThreadGenerator: No popup instance provided to showModal"),alert("Unable to open thread generator. Please refresh and try again.");return}l.init();let e=document.getElementById("thread-generator-modal");e&&(e.classList.remove("hidden"),e.removeAttribute("aria-hidden"),e.removeAttribute("inert"),setTimeout(()=>{document.getElementById("modal-thread-topic")?.focus()},50))},hideModal:function(){let t=document.getElementById("thread-generator-modal");t&&(t.classList.add("hidden"),t.setAttribute("aria-hidden","true"),t.setAttribute("inert",""))},handleGenerate:async function(){let t=document.getElementById("modal-thread-topic")?.value?.trim(),e=document.getElementById("modal-use-knowledge-pack")?.checked;if(!t){alert("Please enter a topic");return}console.log("ThreadGenerator: handleGenerate called"),console.log("ThreadGenerator: popupInstance exists:",!!l.popupInstance),console.log("ThreadGenerator: popupInstance has apiKey:",!!l.popupInstance?.apiKey),console.log("ThreadGenerator: popupInstance has generateThreadMVP:",!!l.popupInstance?.generateThreadMVP),l.hideModal(),l.popupInstance&&l.popupInstance.resetScreenForGeneration&&l.popupInstance.resetScreenForGeneration(),l.popupInstance&&l.popupInstance.generateThreadMVP?await l.popupInstance.generateThreadMVP(t,{useKnowledgePack:e,maxTweets:8,tone:"curious"}):(console.error("Popup instance not available for thread generation"),console.error("popupInstance:",l.popupInstance),alert("Unable to generate thread. Please try again."))},loadKnowledgePack:async function(t){if(this.knowledgePacks[t])return this.knowledgePacks[t];try{let e=await fetch(`knowledge-packs/${t}.json`);if(!e.ok)return console.warn(`Knowledge pack not found for ${t}`),null;let n=await e.json();return this.knowledgePacks[t]=n,n}catch(e){return console.error(`Error loading knowledge pack for ${t}:`,e),null}},getRandomHook:function(t){if(!t||!t.hooks||t.hooks.length===0)return null;let e=Math.floor(Math.random()*t.hooks.length);return t.hooks[e]},optimizeThreadLength:async function(t){try{let e=`Analyze this topic and determine the optimal Twitter thread length: "${t}"

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

Topic: "${t}"`,n=await window.TabTalkAPI?.callGeminiAPI(e);if(n){let a=parseInt(n.trim());return Math.max(3,Math.min(12,a||8))}}catch(e){console.warn("Smart length optimization failed, using default:",e)}return 8},generateThreadMVP:async function(t,e={}){let n=this;if(!n.apiKey){alert("\u274C Please set up your Gemini API key first."),n.showView&&n.showView("settings");return}let a=e.useKnowledgePack!==!1,i=e.maxTweets||8,o=e.tone||"curious";e.maxTweets||(i=await this.optimizeThreadLength(t),console.log(`Smart optimization: Set thread length to ${i} tweets for topic: ${t}`)),n.setLoading(!0,"Generating thread..."),console.log(`Fibr: Generating thread for topic: ${t}`);try{let s="";a&&(s=`

RELEVANT KNOWLEDGE BASE:
\u2022 Include verifiable facts, statistics, and expert insights about the topic
\u2022 Reference historical context, recent developments, and future trends
\u2022 Incorporate scientific principles, case studies, and real-world examples
\u2022 Add surprising data points and counterintuitive findings
\u2022 Include practical applications and implications
`),n.showProgressBar&&n.showProgressBar("Generating thread...");let r="You are a precise thread outline creator. You create structured outlines for engaging Twitter/X threads. No markdown, no hashtags.",c=`Create a ${i}-tweet thread outline about: ${t}

Tone: ${o}
${s}

Create an outline with ${i} beats:
- Beat 1: Hook (attention-grabbing opener)
- Beats 2-${i-1}: Core content (facts, insights, twists)
- Beat ${i}: Closer (memorable ending)

Format each beat as:
[Beat number]: [One-sentence description]

Generate the outline now:`,d=await n.callGeminiAPIWithSystemPrompt(r,c);if(!d)throw new Error("Failed to generate outline");console.log("\u2705 Outline generated");let g="You are a masterful Twitter/X thread storyteller. You craft threads that captivate readers. Each tweet pulses with energy and personality. Write in plain text with strategic emojis - no hashtags, no URLs, no formatting symbols.",h=`Transform this outline into a complete ${i}-tweet thread about: ${t}

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

${s}

OUTPUT EXAMPLE:
1/${i}:
[Hook content here]

2/${i}:
[Content here]

Generate the complete thread now:`,m=await n.callGeminiAPIWithSystemPrompt(g,h);if(!m)throw new Error("Failed to expand thread");console.log("\u2705 Thread expanded");let u=n.cleanTwitterContent(m),w=n.parseTwitterThread(u),y=[];for(let v of w)if(n.getAccurateCharacterCount(v)<=280)y.push(v);else{let T=await l.smartSplitTweet.call(n,v,280);y.push(...T)}console.log(`\u2705 Thread generated: ${y.length} tweets`);let p=`thread_${Date.now()}`;l.renderThreadGeneratorResult.call(n,y,p,t,a),n.autoSaveThread&&await n.autoSaveThread(p,y,u),await n.saveState()}catch(s){console.error("Error generating thread:",s),alert(`\u274C Error generating thread: ${s.message}`)}finally{n.setLoading(!1),n.hideProgressBar&&n.hideProgressBar()}},smartSplitTweet:async function(t,e){let n=t.match(/[^.!?]+[.!?]+/g)||[t],a=[],i="";for(let o of n)this.getAccurateCharacterCount(i+o)<=e?i+=o:(i&&a.push(i.trim()),i=o);return i&&a.push(i.trim()),a.length>0?a:[t.substring(0,e)]},renderThreadGeneratorResult:function(t,e,n,a=!0){let i=document.createElement("div");i.className="twitter-content-container thread-generator-result",i.dataset.topic=n,i.dataset.useKnowledgePack=a;let o=document.createElement("div");o.className="thread-header";let s=this.getTotalChars(t);o.innerHTML=`
        <div class="thread-info">
          <span class="thread-icon">\u{1F9F5}</span>
          <div class="thread-title-group">
            <span class="thread-title">${n}</span>
            <span class="thread-category">AI Generated</span>
          </div>
          <span class="thread-meta">${t.length} tweets \u2022 ${s} chars</span>
        </div>
        <div class="thread-actions">
          <button class="btn-copy-all-thread" data-thread-id="${e}" title="Copy all tweets">
            \u{1F4CB} Copy All
          </button>
          <span class="copy-all-status hidden">\u2713 All Copied!</span>
        </div>
      `,i.appendChild(o);let r=o.querySelector(".btn-copy-all-thread"),c=o.querySelector(".copy-all-status");r.addEventListener("click",async()=>{await this.copyAllTweets(t,r,c,e)});let d=document.createElement("div");d.className="thread-master-control",d.innerHTML=`
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
            <input type="range" class="master-length-slider" min="500" max="5000" value="${s}" step="100" data-thread-id="${e}">
            <span class="slider-max">5000</span>
          </div>
          <div class="slider-value">
            <span class="current-length">${s}</span> characters total
          </div>
        </div>
        <div class="master-control-actions">
          <button class="btn-regenerate-thread" data-thread-id="${e}" title="Regenerate entire thread with new length">
            \u{1F504} Regenerate Thread
          </button>
        </div>
      `,i.appendChild(d);let g=d.querySelector(".master-length-slider"),h=d.querySelector(".current-length"),m=d.querySelector(".btn-regenerate-thread"),u=d.querySelectorAll(".preset-btn");g.addEventListener("input",y=>{h.textContent=y.target.value}),u.forEach(y=>{y.addEventListener("click",()=>{let p=y.dataset.length;g.value=p,h.textContent=p})}),m.addEventListener("click",async()=>{let y=parseInt(g.value);await this.regenerateEntireThreadForGenerator(i,e,y,n,a)});let w=document.getElementById("modal-include-image-prompts")?.checked;t.forEach((y,p)=>{let v=`Thread ${p+1}/${t.length}`,f=this.createTwitterCard(y,v,!0);f.dataset.platform="thread",f.dataset.threadId=e,i.appendChild(f),w&&window.TabTalkImagePromptGenerator&&(async()=>{try{let T=`threadgen_${e}_tweet_${p+1}`,b=await window.TabTalkImagePromptGenerator.generatePromptForCard(T,y);if(b){f.dataset.imagePrompt=encodeURIComponent(b);let E=f.querySelector(".twitter-card-content");if(E&&!f.querySelector(".image-prompt-display")){let C=document.createElement("div");C.className="image-prompt-display",C.innerHTML=`
                    <div class="image-prompt-label">\u{1F5BC}\uFE0F Nano Banana Prompt (9:16)</div>
                    <div class="image-prompt-text">${window.TabTalkUI?.escapeHtml?window.TabTalkUI.escapeHtml(b):b}</div>
                  `,E.appendChild(C)}}}catch(T){console.warn("Thread Generator: image prompt generation failed:",T)}})()}),this.messagesContainer.appendChild(i),setTimeout(()=>{this.messagesContainer.scrollTo({top:this.messagesContainer.scrollHeight,behavior:"smooth"})},100)},regenerateEntireThreadForGenerator:async function(t,e,n,a,i){let o=t.querySelector(".btn-regenerate-thread");if(!o)return;let s=o.textContent;o.textContent="\u23F3 Regenerating...",o.disabled=!0;try{let r=Math.max(3,Math.min(12,Math.ceil(n/400))),c="";i&&(c=`

RELEVANT KNOWLEDGE BASE:
\u2022 Include verifiable facts, statistics, and expert insights about the topic
\u2022 Reference historical context, recent developments, and future trends
\u2022 Incorporate scientific principles, case studies, and real-world examples
\u2022 Add surprising data points and counterintuitive findings
\u2022 Include practical applications and implications
`);let d=`You are a world-class research analyst and subject matter expert who creates the most comprehensive, data-driven Twitter threads ever published. Your work is cited by academics, journalists, and industry leaders for its depth, accuracy, and groundbreaking insights.

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

${c}

Generate your expert research thread now:`,h=await this.callGeminiAPIWithSystemPrompt(d,g);if(h){let m=this.cleanTwitterContent(h),u=this.parseTwitterThread(m);t.querySelectorAll(".twitter-card").forEach(f=>f.remove()),u.forEach((f,T)=>{let b=`Thread ${T+1}/${u.length}`,E=this.createTwitterCard(f,b,!0);E.dataset.platform="thread",E.dataset.threadId=e,t.appendChild(E)});let y=t.querySelector(".thread-meta");y&&(y.textContent=`${u.length} tweets \u2022 ${this.getTotalChars(u)} chars`);let p=t.querySelector(".current-length");p&&(p.textContent=this.getTotalChars(u));let v=t.querySelector(".master-length-slider");v&&(v.value=this.getTotalChars(u)),this.autoSaveThread&&await this.autoSaveThread(e,u,m),console.log("\u2705 Thread regenerated successfully")}}catch(r){console.error("Error regenerating thread:",r),alert("Failed to regenerate thread. Please try again.")}finally{o.textContent=s,o.disabled=!1}},showThreadGeneratorView:function(){document.getElementById("thread-generator-view")&&this.showView("thread-generator")},initializeHowItWorksToggle:function(){let t=document.getElementById("how-it-works-toggle"),e=document.getElementById("how-it-works-content");!t||!e||(e.classList.remove("expanded"),t.classList.remove("expanded"),t.addEventListener("click",()=>{e.classList.contains("expanded")?(e.classList.remove("expanded"),t.classList.remove("expanded")):(e.classList.add("expanded"),t.classList.add("expanded"))}))},handleThreadGeneratorSubmit:async function(){let t=document.getElementById("thread-topic"),e=document.getElementById("use-knowledge-pack");if(!t){console.error("Thread generator form elements not found");return}let n=t.value.trim();if(!n){window.TabTalkUI?.showToast("Please enter a topic",2e3);return}let a=e?e.checked:!0;try{let i=document.getElementById("generate-thread-btn"),o=i.textContent;i.textContent="\u23F3 Generating...",i.disabled=!0;let s=Math.max(3,Math.min(8,Math.ceil(2e3/400))),r="";a&&(r=`

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

Write in plain text with precise, professional language - no hashtags, no URLs, no formatting symbols. Pure expert-level analysis with strategic emojis that emphasize key insights.`,d=`Generate a comprehensive, expert-level research thread on: ${n}

CRITICAL REQUIREMENTS:
- Create reference-quality content that becomes the definitive analysis on this topic
- Include verifiable facts, specific figures, statistical data, and concrete evidence
- Provide deep technical insights with practical applications and implications
- Synthesize information from multiple disciplines and perspectives
- Maintain academic rigor while ensuring accessibility for educated readers

FORMAT REQUIREMENT:
Start each tweet with: 1/${s}: 2/${s}: 3/${s}: etc.

EXPERT THREAD STRUCTURE:
1/${s}: Executive Summary - Core thesis, significance, and key findings upfront
2/${s}: Historical Context & Evolution - How we arrived at current understanding
3-${s-2}: Deep Analysis - Technical details, data patterns, causal relationships, case studies, empirical evidence
${s-1}: Practical Implications - Real-world applications, future projections, strategic considerations
${s}: Conclusions & Further Research - Key takeaways, unanswered questions, next steps for investigation

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

Generate your expert research thread now:`,g=await this.callGeminiAPIWithSystemPrompt(c,d);if(g){let h=this.cleanTwitterContent(g),m=this.parseTwitterThread(h);this.displayThreadResult(h,n),this.saveThreadToGallery(h,n),window.TabTalkUI?.showToast("Expert thread generated successfully!",2e3)}}catch(i){console.error("Thread generation failed:",i),window.TabTalkUI?.showToast("Failed to generate thread",3e3)}finally{let i=document.getElementById("generate-thread-btn");i&&(i.textContent="\u{1F680} Generate Enhanced Thread",i.disabled=!1)}}};window.TabTalkThreadGenerator=l,window.FibrThreadGenerator=l})();(function(){let l={initializeHorizontalScroll:function(){let t=document.querySelector(".scroll-container"),e=document.getElementById("scroll-left"),n=document.getElementById("scroll-right");if(!t||!e||!n)return;let a=200;e.addEventListener("click",()=>{t.scrollBy({left:-a,behavior:"smooth"})}),n.addEventListener("click",()=>{t.scrollBy({left:a,behavior:"smooth"})});let i=()=>{let c=t.scrollWidth-t.clientWidth;e.disabled=t.scrollLeft<=0,n.disabled=t.scrollLeft>=c};t.addEventListener("scroll",i),i(),t.addEventListener("wheel",c=>{c.deltaY!==0&&(c.preventDefault(),t.scrollLeft+=c.deltaY,i())});let o=!1,s,r;t.addEventListener("mousedown",c=>{o=!0,s=c.pageX-t.offsetLeft,r=t.scrollLeft,t.style.cursor="grabbing"}),t.addEventListener("mouseleave",()=>{o=!1,t.style.cursor="grab"}),t.addEventListener("mouseup",()=>{o=!1,t.style.cursor="grab",i()}),t.addEventListener("mousemove",c=>{if(!o)return;c.preventDefault();let g=(c.pageX-t.offsetLeft-s)*1.5;t.scrollLeft=r-g}),t.style.cursor="grab"}};window.TabTalkScroll=l,window.FibrScroll=l})();(function(){let l={INIT_KEY:"savedContent",async loadSaved(t="twitter"){if(!window.FibrStorage||!FibrStorage.getSavedContent)return console.error("Gallery: FibrStorage not available"),[];let e=await FibrStorage.getSavedContent();return e?t==="all"?Object.entries(e).flatMap(([a,i])=>Array.isArray(i)?i.map(o=>({...o,_category:a})):[]):Array.isArray(e[t])?e[t]:[]:[]},async render(t,e="twitter"){t.innerHTML="";let n=document.createElement("div");n.className="gallery-header",n.innerHTML=`
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
      `,t.appendChild(n);let a=document.createElement("div");a.className="gallery-list",t.appendChild(a);let i=await this.loadSaved(e);this.initVirtualList(a,i),n.querySelector("#gallery-back-btn").addEventListener("click",()=>{window.FibrNavigation&&FibrNavigation.showView&&FibrNavigation.showView("chat")});let s=n.querySelector("#gallery-search"),r=n.querySelector("#gallery-sort"),c=n.querySelector("#gallery-count"),d=n.querySelector("#gallery-delete-all"),g=async()=>{let h=(s.value||"").toLowerCase(),m=r.value,u=await this.loadSaved(e);h&&(u=u.filter(w=>(w.content||"").toLowerCase().includes(h)||(w.domain||"").toLowerCase().includes(h))),u=this.sortItems(u,m),this.initVirtualList(a,u),this.renderList(a,u.slice(0,this._virtual.batch)),c.textContent=`${u.length}/50`};s.addEventListener("input",this.debounce(g,150)),r.addEventListener("change",g),c.textContent=`${i.length}/50`,d&&d.addEventListener("click",async()=>{confirm("Delete all saved items in this category?")&&window.FibrStorage&&FibrStorage.clearSavedCategory&&(await FibrStorage.clearSavedCategory(e),this.initVirtualList(a,[]),this.renderList(a,[]),c.textContent="0/50")})},sortItems(t,e){let n=[...t];switch(e){case"created_desc":return n.sort((a,i)=>(i.timestamp||0)-(a.timestamp||0));case"length_asc":return n.sort((a,i)=>(a.charCountAccurate||(a.content||"").length)-(i.charCountAccurate||(i.content||"").length));case"length_desc":return n.sort((a,i)=>(i.charCountAccurate||(i.content||"").length)-(a.charCountAccurate||(a.content||"").length));case"updated_desc":default:return n.sort((a,i)=>(i.updatedAt||i.timestamp||0)-(a.updatedAt||a.timestamp||0))}},renderList(t,e){if(!e||e.length===0){t.innerHTML=`
          <div class="gallery-empty">
            <img src="icons/icon128.jpeg" alt="" />
            <h3>No saved posts yet</h3>
            <p>Use the Save button on any generated card to add it here.</p>
          </div>
        `;return}if(this._virtual&&this._virtual.list===t){this.appendNextBatch();return}t.innerHTML="";let n=document.createDocumentFragment();e.forEach(a=>{let i=this.renderCard(a);n.appendChild(i)}),t.appendChild(n)},initVirtualList(t,e){let n=t;n.innerHTML="",this._virtual={list:n,items:e||[],index:0,batch:20},this.appendNextBatch(),this._virtual.items.length>this._virtual.batch&&this.appendNextBatch();let a=()=>{let{list:i}=this._virtual||{};i&&i.scrollTop+i.clientHeight>=i.scrollHeight-120&&this.appendNextBatch()};this._virtualScrollHandler&&n.removeEventListener("scroll",this._virtualScrollHandler),this._virtualScrollHandler=a,n.addEventListener("scroll",a,{passive:!0})},appendNextBatch(){let t=this._virtual;if(!t||!t.list||t.index>=t.items.length)return;let e=t.index,n=Math.min(t.index+t.batch,t.items.length),a=document.createDocumentFragment();for(let i=e;i<n;i++)a.appendChild(this.renderCard(t.items[i]));t.list.appendChild(a),t.index=n},renderCard(t){let e=document.createElement("div"),n=window.FibrTwitter&&window.FibrTwitter.isThreadContent?window.FibrTwitter.isThreadContent(t):this.fallbackThreadDetection(t),a=(t.content||"").length>500,i="gallery-card";n?i+=" card-thread":a&&(i+=" card-long"),e.className=i;let o=this.getAccurateCharacterCount(t.content||"");e.innerHTML=`
        <div class="gallery-card-header">
          <div class="title-row">
            <span class="title">${this.escapeHtml(t.title||"Post")}</span>
            <span class="badge platform">${this.escapeHtml((t.platform||"twitter").toUpperCase())}</span>
          </div>
          <div class="meta-row">
            <span class="timestamp">${this.formatDate(t.updatedAt||t.timestamp)}</span>
            <span class="metrics">${o} chars</span>
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
      `;let s=e.querySelector(".gallery-preview"),r=e.querySelector(".btn-action.copy"),c=e.querySelector(".btn-action.read"),d=e.querySelector(".btn-action.edit"),g=e.querySelector(".btn-action.delete");return r.addEventListener("click",async h=>{h.stopPropagation();try{let m="";(window.FibrTwitter&&window.FibrTwitter.isThreadContent?window.FibrTwitter.isThreadContent(t):this.fallbackThreadDetection(t))?m=this.extractThreadContent(t):m=t.content||"",await navigator.clipboard.writeText(m);let w=r.querySelector("span");w.textContent="\u2713",r.classList.add("success"),setTimeout(()=>{w.textContent="Copy",r.classList.remove("success")},1500)}catch(m){console.error("Gallery copy failed",m)}}),c.addEventListener("click",h=>{h.stopPropagation(),this.openReadModal(t)}),d.addEventListener("click",h=>{h.stopPropagation(),this.openEditModal(t)}),g.addEventListener("click",async h=>{h.stopPropagation(),confirm("Delete this saved item?")&&(await this.deleteItem(t),e.remove())}),e.addEventListener("click",h=>{h.target.closest(".btn-action")||this.openReadModal(t)}),e},openReadModal(t){let e=document.createElement("div");e.className="gallery-modal";let n="";e.innerHTML=`
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
      `,document.body.appendChild(e);let a=()=>e.remove();e.querySelector(".modal-close").addEventListener("click",a),e.querySelector(".gallery-modal-overlay").addEventListener("click",a),e.querySelector(".modal-btn.copy").addEventListener("click",async()=>{let o="";(t.platform||"").toLowerCase()==="thread"&&Array.isArray(t.tweets)&&t.tweets.length>0?o=t.tweets.map((c,d)=>`${c.number||`${d+1}/${t.tweets.length}:`}
${c.content||""}`).join(`

---

`):o=t.content||"",await navigator.clipboard.writeText(o);let r=e.querySelector(".modal-btn.copy");r.textContent="Copied!",setTimeout(()=>r.textContent="Copy",1500)}),e.querySelector(".modal-btn.edit").addEventListener("click",()=>{a(),this.openEditModal(t)});let i=o=>{o.key==="Escape"&&(a(),document.removeEventListener("keydown",i))};document.addEventListener("keydown",i)},openEditModal(t){let e=document.createElement("div");e.className="gallery-modal",e.innerHTML=`
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
      `,document.body.appendChild(e);let n=e.querySelector(".modal-textarea"),a=()=>e.remove();e.querySelector(".modal-close").addEventListener("click",a),e.querySelector(".gallery-modal-overlay").addEventListener("click",a),e.querySelector(".modal-btn.cancel").addEventListener("click",a),e.querySelector(".modal-btn.save").addEventListener("click",async()=>{let i={content:n.value,updatedAt:Date.now(),charCountAccurate:this.getAccurateCharacterCount(n.value)};await this.updateItem(t,i),a();let o=document.querySelector("#gallery-view");o&&this.render(o)}),n.focus()},async updateItem(t,e){let n=await FibrStorage.getSavedContent(),a=t._category||"twitter";if(!Array.isArray(n[a]))return;let i=n[a].findIndex(o=>o.id===t.id);i!==-1&&(n[a][i]={...n[a][i],...e},await FibrStorage.setStorageItem("savedContent",n))},async deleteItem(t){let e=t._category||"twitter";await FibrStorage.deleteSavedContent(e,t.id)},debounce(t,e){let n;return(...a)=>{clearTimeout(n),n=setTimeout(()=>t.apply(this,a),e)}},fallbackThreadDetection(t){if(!t)return!1;if((t.platform||"").toLowerCase()==="thread"||(t.type||"").toLowerCase()==="thread"||(t.title||"").toLowerCase().includes("thread"))return!0;let n=(t.content||"").toLowerCase();return!!(n.includes("1/")&&n.includes("2/")||n.includes("1/8")||n.includes("1/7")||n.includes("1/6")||n.includes("1/5")||n.includes("1/4")||n.includes("1/3")||n.includes("\u{1F9F5}")||Array.isArray(t.tweets)&&t.tweets.length>1||t.totalTweets&&t.totalTweets>1)},extractThreadContent(t){if(Array.isArray(t.tweets)&&t.tweets.length>0)return t.tweets.map((e,n)=>`${e.number||`${n+1}/${t.tweets.length}:`}
${e.content||""}`).join(`

---

`);if(t.content){if(window.FibrTwitter&&window.FibrTwitter.parseTwitterThread){let e=window.FibrTwitter.parseTwitterThread(t.content);if(e.length>1)return e.map((n,a)=>`${a+1}/${e.length}:
${n}`).join(`

---

`)}return t.content}return t.content||""},getAccurateCharacterCount(t){if(!t)return 0;let e=String(t).trim(),n=0,a=Array.from(e);for(let i of a){let o=i.codePointAt(0),s=o>=126976&&o<=129535||o>=9728&&o<=9983||o>=9984&&o<=10175||o>=128512&&o<=128591||o>=127744&&o<=128511||o>=128640&&o<=128767||o>=127456&&o<=127487||o>=8205;n+=s?2:1}return n},escapeHtml(t){return String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")},formatDate(t){if(!t)return"";try{return new Date(t).toLocaleString()}catch{return""}}};window.galleryManager=l})();(function(){let l={async validateApiKey(t){if(console.log("Validation: validateApiKey called"),!t||typeof t!="string"||t.trim().length===0)return console.error("Validation: API key is empty or invalid type"),{success:!1,error:"API key is required"};let e=String(t).trim().replace(/[\s\u200B-\u200D\uFEFF]/g,"").replace(/[\r\n\t]/g,"");if(console.log("Validation: Original length:",t.length),console.log("Validation: Cleaned key length:",e.length),console.log("Validation: First 10 chars:",e.substring(0,10)),console.log("Validation: Last 4 chars:",e.substring(e.length-4)),e.length<30)return console.error("Validation: Key too short:",e.length),{success:!1,error:`API key appears too short (${e.length} characters). Please check and try again.`};e.startsWith("AIza")||(console.warn("Validation: Key doesn't start with AIza, but will try validation anyway"),console.warn("Validation: Key starts with:",e.substring(0,4)));try{console.log("Validation: Sending validation request to background...");let n=await chrome.runtime.sendMessage({action:"validateApiKey",apiKey:e});return console.log("Validation: Response from background:",n),n||(console.error("Validation: No response from background script"),{success:!1,error:"No response from validation service. Please try again."})}catch(n){return console.error("Validation: Request failed with exception:",n),{success:!1,error:"Failed to validate API key. Please try again."}}},async handleTestApiKey(t,e){let n=e.value.trim(),a=t.textContent;if(console.log("Validation: Test button clicked, key length:",n.length),!n){t.textContent="Enter Key",t.style.backgroundColor="#f59e0b",t.style.color="white",setTimeout(()=>{t.textContent=a,t.style.backgroundColor="",t.style.color=""},2e3);return}t.disabled=!0,t.textContent="Testing...",t.style.color="white";try{console.log("Validation: Starting validation...");let i=await this.validateApiKey(n);if(console.log("Validation: Result received:",i),i.success){t.textContent="\u2713 Valid",t.style.backgroundColor="#10b981",t.style.color="white",console.log("Validation: \u2713 API key is valid!");let o=document.getElementById("api-setup-continue");o&&(o.disabled=!1),setTimeout(()=>{t.textContent=a,t.style.backgroundColor="",t.style.color="",t.disabled=!1},2e3)}else{t.textContent="\u2717 Invalid",t.style.backgroundColor="#ef4444",t.style.color="white",console.error(`Validation: \u2717 API Key validation failed: ${i.error}`);let o=i.error||"Invalid API key";console.error("Validation error details:",o),setTimeout(()=>{t.textContent=a,t.style.backgroundColor="",t.style.color="",t.disabled=!1},3e3)}}catch(i){t.textContent="Error",t.style.backgroundColor="#ef4444",t.style.color="white",console.error("Validation: Exception occurred:",i),setTimeout(()=>{t.textContent=a,t.style.backgroundColor="",t.style.color="",t.disabled=!1},3e3)}},async handleSaveApiKey(t,e,n){let a=e.value.trim();if(!a){t.textContent="Enter Key",t.style.backgroundColor="#f59e0b";let o=t.textContent;setTimeout(()=>{t.textContent="Save",t.style.backgroundColor=""},2e3);return}t.disabled=!0;let i=t.textContent;t.textContent="Validating...";try{let o=await this.validateApiKey(a);o.success?(await this.saveApiKey(a),t.textContent="\u2713 Saved",t.style.backgroundColor="#10b981",n&&n(),setTimeout(()=>{t.textContent=i,t.style.backgroundColor="",t.disabled=!1},2e3)):(t.textContent="\u2717 Failed",t.style.backgroundColor="#ef4444",console.error(`API Key validation failed: ${o.error}`),setTimeout(()=>{t.textContent=i,t.style.backgroundColor="",t.disabled=!1},3e3))}catch(o){t.textContent="Error",t.style.backgroundColor="#ef4444",console.error("An error occurred while saving the API key:",o),setTimeout(()=>{t.textContent=i,t.style.backgroundColor="",t.disabled=!1},3e3)}},async saveApiKey(t){let e=t.trim().replace(/\s+/g,"");window.TabTalkStorage&&window.TabTalkStorage.saveApiKey?await window.TabTalkStorage.saveApiKey(e):await chrome.storage.local.set({geminiApiKey:e,apiKey:e,hasSeenWelcome:!0})}};window.TabTalkValidation=l,window.FibrValidation=l})();(function(){function l(){let t=document.getElementById("test-api-key"),e=document.getElementById("onboarding-api-key");if(t&&e&&window.TabTalkValidation){let i=t.cloneNode(!0);t.parentNode.replaceChild(i,t),i.addEventListener("click",async function(){await window.TabTalkValidation.handleTestApiKey(i,e);let o=document.getElementById("api-setup-continue");o&&i.textContent==="\u2713 Valid"&&(o.disabled=!1)})}let n=document.getElementById("settings-save-button"),a=document.getElementById("api-key-input");if(n&&a&&window.TabTalkValidation){let i=n.cloneNode(!0);n.parentNode.replaceChild(i,n),i.addEventListener("click",async function(o){o.preventDefault(),o.stopPropagation(),o.stopImmediatePropagation(),await window.TabTalkValidation.handleSaveApiKey(i,a,function(){window.TabTalkNavigation&&window.TabTalkNavigation.showView&&window.TabTalkNavigation.showView("chat")})})}e&&e.addEventListener("input",function(){let i=document.getElementById("api-setup-continue");i&&(i.disabled=!this.value.trim())})}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",l):l(),setTimeout(l,100)})();(function(){let l={toneDefinitions:{"fact-check":{id:"fact-check",name:"Fact Check",icon:"\u{1F50D}",color:"var(--accent-medium)",category:"reply",subcategory:"analytical",description:"Verify claims with evidence and data",example:"Let's fact-check this claim...",aiInstructions:`TONE: Fact Check
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
- Use irony and juxtaposition to highlight contradictions effectively`,keywords:["contradiction","double-standards","inconsistency","critical","exposure"]}},customTones:[],sessionCache:{lastSelectedTone:null,customCombinations:[]},init:function(){this.loadCustomTones(),this.createModalHTML(),this.bindModalEvents()},loadCustomTones:async function(){try{let t=await chrome.storage.local.get("customTones");t.customTones&&(this.customTones=t.customTones)}catch(t){console.error("Error loading custom tones:",t)}},saveCustomTones:async function(){try{await chrome.storage.local.set({customTones:this.customTones})}catch(t){console.error("Error saving custom tones:",t)}},createModalHTML:function(){let t=`
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
      `;document.getElementById("tone-selector-modal")||document.body.insertAdjacentHTML("beforeend",t)},renderToneGrid:function(){return`
        <div class="tone-category">
          <div class="category-header">
            <span class="category-icon">\u270D\uFE0F</span>
            <span class="category-title">Original Post</span>
          </div>
          <div class="tone-grid-row">
            ${Object.values(this.toneDefinitions).filter(e=>e.category==="original").map(e=>`
              <div class="tone-option" 
                   data-tone-id="${e.id}" 
                   data-category="${e.category}"
                   data-subcategory="${e.subcategory}"
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
            `).join("")}
          </div>
        </div>
      `},renderToneOptions:function(){return Object.values(this.toneDefinitions).map(t=>`<option value="${t.id}">${t.icon} ${t.name}</option>`).join("")},bindModalEvents:function(){let t=document.getElementById("tone-selector-modal");if(!t)return;t.querySelector(".tone-modal-close")?.addEventListener("click",()=>this.hideModal()),t.querySelector(".tone-modal-overlay")?.addEventListener("click",()=>this.hideModal()),document.getElementById("tone-cancel-btn")?.addEventListener("click",()=>this.hideModal()),t.querySelectorAll(".tone-option").forEach(h=>{h.addEventListener("click",()=>this.selectTone(h)),h.addEventListener("keydown",m=>{(m.key==="Enter"||m.key===" ")&&(m.preventDefault(),this.selectTone(h))})}),document.getElementById("tone-generate-btn")?.addEventListener("click",()=>this.handleGenerate()),document.getElementById("toggle-custom-builder")?.addEventListener("click",()=>this.toggleCustomBuilder());let r=document.getElementById("custom-tone-1"),c=document.getElementById("custom-tone-2");r?.addEventListener("change",()=>this.updateCustomPreview()),c?.addEventListener("change",()=>this.updateCustomPreview()),document.getElementById("save-custom-tone")?.addEventListener("click",()=>this.saveCustomCombination()),document.getElementById("use-custom-tone")?.addEventListener("click",()=>this.useCustomCombination()),t.addEventListener("keydown",h=>{h.key==="Escape"&&this.hideModal()})},showModal:async function(t,e){let n=document.getElementById("tone-selector-modal");n&&(this.currentPlatform=t,this.currentPageContent=e,n.classList.remove("hidden"),n.removeAttribute("aria-hidden"),n.removeAttribute("inert"),setTimeout(()=>{n.querySelector(".tone-option")?.focus()},50),this.renderSavedCustomTones())},hideModal:function(){let t=document.getElementById("tone-selector-modal");t&&(t.classList.add("hidden"),t.setAttribute("aria-hidden","true"),t.setAttribute("inert",""),this.resetSelections())},selectTone:function(t){document.querySelectorAll(".tone-option").forEach(a=>{a.classList.remove("selected"),a.setAttribute("aria-checked","false")}),t.classList.add("selected"),t.setAttribute("aria-checked","true"),this.selectedToneId=t.dataset.toneId,console.log("FibrToneSelector: Selected tone ID:",this.selectedToneId),console.log("FibrToneSelector: Available tone IDs:",Object.keys(this.toneDefinitions)),this.selectedTone=this.toneDefinitions[this.selectedToneId],console.log("FibrToneSelector: Selected tone object:",this.selectedTone);let n=document.getElementById("tone-generate-btn");n&&(n.disabled=!1)},toggleCustomBuilder:function(){let t=document.getElementById("custom-tone-builder"),e=document.getElementById("toggle-custom-builder"),n=e?.querySelector(".toggle-arrow");if(t&&e){let a=t.classList.contains("hidden");t.classList.toggle("hidden"),n&&(n.textContent=a?"\u25B2":"\u25BC")}},updateCustomPreview:function(){let t=document.getElementById("custom-tone-1"),e=document.getElementById("custom-tone-2"),n=document.getElementById("custom-tone-preview"),a=document.querySelector(".builder-preview"),i=document.getElementById("save-custom-tone"),o=document.getElementById("use-custom-tone");if(!t||!e||!n)return;let s=t.value,r=e.value;if(s&&r&&s!==r){let c=this.toneDefinitions[s],d=this.toneDefinitions[r];n.innerHTML=`
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
        `,a?.classList.remove("hidden"),i&&(i.disabled=!1),o&&(o.disabled=!1)}else a?.classList.add("hidden"),i&&(i.disabled=!0),o&&(o.disabled=!0)},generateCombinedDescription:function(t,e){return`Combines ${t.name.toLowerCase()} with ${e.name.toLowerCase()} for a unique perspective that ${t.description.toLowerCase()} while ${e.description.toLowerCase()}.`},saveCustomCombination:async function(){let t=document.getElementById("custom-tone-1"),e=document.getElementById("custom-tone-2");if(!t||!e)return;let n=t.value,a=e.value;if(!n||!a||n===a)return;let i={id:`custom-${Date.now()}`,tone1Id:n,tone2Id:a,name:`${this.toneDefinitions[n].name} + ${this.toneDefinitions[a].name}`,createdAt:Date.now()};this.customTones.push(i),await this.saveCustomTones(),this.renderSavedCustomTones(),this.showToast("\u2713 Custom tone saved!")},useCustomCombination:function(){let t=document.getElementById("custom-tone-1"),e=document.getElementById("custom-tone-2");if(!t||!e)return;let n=t.value,a=e.value;if(!n||!a||n===a)return;this.selectedToneId="custom",this.selectedTone={id:"custom",name:`${this.toneDefinitions[n].name} + ${this.toneDefinitions[a].name}`,tone1:this.toneDefinitions[n],tone2:this.toneDefinitions[a],aiInstructions:this.combineAIInstructions(this.toneDefinitions[n],this.toneDefinitions[a])};let i=document.getElementById("tone-generate-btn");i&&(i.disabled=!1),this.showToast("\u2713 Custom tone selected!")},combineAIInstructions:function(t,e){return`COMBINED TONE: ${t.name} + ${e.name}

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
          ${this.customTones.map(a=>{let i=this.toneDefinitions[a.tone1Id],o=this.toneDefinitions[a.tone2Id];return`
              <div class="saved-custom-tone" data-custom-id="${a.id}">
                <div class="saved-tone-icons">
                  <span style="color: ${i.color}">${i.icon}</span>
                  <span class="saved-plus">+</span>
                  <span style="color: ${o.color}">${o.icon}</span>
                </div>
                <div class="saved-tone-name">${a.name}</div>
                <button class="saved-tone-delete" data-custom-id="${a.id}" title="Delete">\xD7</button>
              </div>
            `}).join("")}
        </div>
      `,t.querySelectorAll(".saved-custom-tone").forEach(a=>{a.addEventListener("click",i=>{i.target.classList.contains("saved-tone-delete")||this.selectSavedCustomTone(a.dataset.customId)})}),t.querySelectorAll(".saved-tone-delete").forEach(a=>{a.addEventListener("click",i=>{i.stopPropagation(),this.deleteCustomTone(a.dataset.customId)})})},selectSavedCustomTone:function(t){let e=this.customTones.find(o=>o.id===t);if(!e)return;let n=this.toneDefinitions[e.tone1Id],a=this.toneDefinitions[e.tone2Id];this.selectedToneId="custom",this.selectedTone={id:"custom",name:e.name,tone1:n,tone2:a,aiInstructions:this.combineAIInstructions(n,a)};let i=document.getElementById("tone-generate-btn");i&&(i.disabled=!1),this.showToast("\u2713 Custom tone selected!")},deleteCustomTone:async function(t){this.customTones=this.customTones.filter(e=>e.id!==t),await this.saveCustomTones(),this.renderSavedCustomTones(),this.showToast("Custom tone deleted")},handleGenerate:function(){if(console.log("FibrToneSelector: handleGenerate called"),console.log("FibrToneSelector: selectedToneId:",this.selectedToneId),console.log("FibrToneSelector: selectedTone:",this.selectedTone),!this.selectedTone){console.warn("FibrToneSelector: No tone selected, cannot generate");return}let t=document.getElementById("include-image-prompt"),e=t?t.checked:!1;this.onGenerateCallback&&(console.log("FibrToneSelector: Calling callback with tone:",this.selectedTone),this.onGenerateCallback(this.selectedTone,this.currentPlatform,e)),this.hideModal()},resetSelections:function(){document.querySelectorAll(".tone-option").forEach(n=>{n.classList.remove("selected"),n.setAttribute("aria-checked","false")}),this.selectedToneId=null,this.selectedTone=null;let e=document.getElementById("tone-generate-btn");e&&(e.disabled=!0)},showToast:function(t){let e=document.createElement("div");e.className="tone-toast",e.textContent=t,e.style.cssText=`
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
      `,document.body.appendChild(e),setTimeout(()=>{e.style.animation="slideOutDown 0.3s ease",setTimeout(()=>e.remove(),300)},2e3)},show:function(t,e,n){this.onGenerateCallback=n,this.showModal(t,e)}};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>l.init()):l.init(),window.FibrToneSelector=l,window.TabTalkToneSelector=l})();(function(){let l={currentView:"chat",init(){this.bindEvents(),this.updateActiveState("chat")},bindEvents(){document.querySelectorAll(".nav-item").forEach(e=>{e.addEventListener("click",n=>{n.preventDefault();let a=e.getAttribute("data-view");this.navigateToView(a)})})},navigateToView(t){window.TabTalkNavigation&&window.TabTalkNavigation.showView&&window.TabTalkNavigation.showView(t),this.updateActiveState(t),this.currentView=t},updateActiveState(t){document.querySelectorAll(".nav-item").forEach(n=>{n.getAttribute("data-view")===t?n.classList.add("active"):n.classList.remove("active")})},toggleVisibility(t){let e=document.getElementById("bottom-nav");e&&(e.style.display=t?"flex":"none")},setActive(t){this.updateActiveState(t),this.currentView=t}};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>l.init()):l.init(),window.BottomNav=l})();(function(){let l={selectedPersona:"educator",selectedFormat:"myth-busting",currentTopic:"",selectedHook:"",generatedThread:null,personas:{educator:{name:"Educator",emoji:"\u{1F393}",instructions:"Write as a patient teacher who breaks down complex topics into simple, digestible lessons. Use clear examples and encouraging language. Focus on helping the reader understand and grow. Include educational moments and learning takeaways.",hookDensity:"medium",sentenceLength:"medium",verbStyle:"explanatory",ctaStyle:"learning-focused"},operator:{name:"Operator",emoji:"\u2699\uFE0F",instructions:"Write as a practical builder who focuses on execution and results. Use direct, no-nonsense language. Emphasize systems, processes, and measurable outcomes. Include actionable steps and implementation details.",hookDensity:"low",sentenceLength:"short",verbStyle:"action-oriented",ctaStyle:"implementation-focused"},analyst:{name:"Analyst",emoji:"\u{1F4CA}",instructions:"Write as a data-driven expert who backs claims with evidence and logical reasoning. Use precise language and structured arguments. Include statistics, trends, and analytical insights. Maintain objectivity and credibility.",hookDensity:"medium",sentenceLength:"long",verbStyle:"analytical",ctaStyle:"insight-focused"},entertainer:{name:"Entertainer",emoji:"\u{1F3AD}",instructions:"Write as an engaging storyteller who captivates with humor, drama, and personality. Use vivid language, emotional appeal, and entertaining anecdotes. Include surprising twists and memorable moments.",hookDensity:"high",sentenceLength:"varied",verbStyle:"expressive",ctaStyle:"engagement-focused"},visionary:{name:"Visionary",emoji:"\u{1F52E}",instructions:"Write as a forward-thinking leader who paints pictures of what is possible. Use inspiring, future-focused language. Emphasize transformation, innovation, and paradigm shifts. Include bold predictions and visionary insights.",hookDensity:"high",sentenceLength:"long",verbStyle:"transformational",ctaStyle:"future-focused"},storyteller:{name:"Storyteller",emoji:"\u{1F4DA}",instructions:"Write as a master storyteller who weaves narratives that teach and inspire. Use classic story structures, character development, and narrative arcs. Include personal anecdotes, metaphors, and story-driven examples.",hookDensity:"medium",sentenceLength:"varied",verbStyle:"narrative",ctaStyle:"story-focused"},scientist:{name:"Scientist",emoji:"\u{1F52C}",instructions:"Write as a rigorous researcher who explores topics through scientific inquiry. Use precise, evidence-based language. Emphasize hypotheses, experiments, and data-driven conclusions. Include scientific method and logical reasoning.",hookDensity:"low",sentenceLength:"complex",verbStyle:"investigative",ctaStyle:"research-focused"},philosopher:{name:"Philosopher",emoji:"\u{1F914}",instructions:"Write as a deep thinker who explores fundamental questions and meanings. Use thoughtful, reflective language. Emphasize principles, ethics, and deeper truths. Include philosophical frameworks and wisdom insights.",hookDensity:"low",sentenceLength:"complex",verbStyle:"reflective",ctaStyle:"wisdom-focused"}},formats:{"myth-busting":{name:"Myth\u2011busting",emoji:"\u{1F9F1}",skeleton:"Hook (challenge common belief) \u2192 Why it is wrong \u2192 Evidence (3 bullet points) \u2192 What to do instead (steps) \u2192 CTA"},"status-shift":{name:"Status Shift",emoji:"\u26A1",skeleton:"Hook (unexpected realization) \u2192 Before vs After snapshot \u2192 Process (3-5 steps) \u2192 Proof \u2192 CTA"},"cheat-code":{name:"Cheat Code",emoji:"\u{1F3AE}",skeleton:"Hook (fast result promise) \u2192 Steps (ordered) \u2192 Common pitfalls \u2192 Bonus tip \u2192 CTA"},analogy:{name:"Analogy",emoji:"\u{1F517}",skeleton:"Hook (analogy) \u2192 Map analogy \u2192 Apply to topic \u2192 Example \u2192 CTA"},pain:{name:"Pain Point",emoji:"\u{1F4A1}",skeleton:"Hook (identify pain) \u2192 Amplify why it matters \u2192 Root cause \u2192 Solution steps \u2192 Transformation \u2192 CTA"},story:{name:"Story",emoji:"\u{1F4D6}",skeleton:"Hook (story opening) \u2192 Challenge faced \u2192 Journey/process \u2192 Resolution/lesson \u2192 Application for reader \u2192 CTA"},data:{name:"Data Driven",emoji:"\u{1F4CA}",skeleton:"Hook (surprising stat) \u2192 Context behind the data \u2192 Implications \u2192 What it means for reader \u2192 Action steps \u2192 CTA"},framework:{name:"Framework",emoji:"\u{1F3D7}\uFE0F",skeleton:"Hook (mental model) \u2192 Explain framework components \u2192 How to apply \u2192 Examples \u2192 Benefits \u2192 CTA"},future:{name:"Future Focus",emoji:"\u{1F52E}",skeleton:"Hook (future prediction) \u2192 Current trends \u2192 Timeline \u2192 What to prepare \u2192 First steps \u2192 CTA"},practical:{name:"Practical",emoji:"\u2699\uFE0F",skeleton:"Hook (practical problem) \u2192 Quick solution \u2192 Step-by-step guide \u2192 Pro tips \u2192 Results \u2192 CTA"},controversial:{name:"Controversial",emoji:"\u{1F525}",skeleton:"Hook (controversial take) \u2192 Why people disagree \u2192 Your evidence \u2192 Counterarguments \u2192 Strong conclusion \u2192 CTA"},inspirational:{name:"Inspirational",emoji:"\u2728",skeleton:"Hook (uplifting vision) \u2192 Current reality \u2192 Possibility \u2192 Motivational examples \u2192 Call to greatness \u2192 CTA"},"step-by-step":{name:"Step\u2011by\u2011Step",emoji:"\u{1F4DD}",skeleton:"Hook (process promise) \u2192 Why this process \u2192 Step 1 \u2192 Step 2 \u2192 Step 3 \u2192 Common mistakes \u2192 Success tips \u2192 CTA"},comparison:{name:"Comparison",emoji:"\u2696\uFE0F",skeleton:"Hook (comparison setup) \u2192 Option A analysis \u2192 Option B analysis \u2192 Decision criteria \u2192 Recommendation \u2192 CTA"},"case-study":{name:"Case Study",emoji:"\u{1F4CB}",skeleton:"Hook (intriguing result) \u2192 Background \u2192 Challenge \u2192 Solution \u2192 Measurable results \u2192 Lessons \u2192 CTA"},trend:{name:"Trend Alert",emoji:"\u{1F4C8}",skeleton:"Hook (trend observation) \u2192 Evidence it is growing \u2192 Why it matters \u2192 How to leverage \u2192 Timeline \u2192 CTA"},"myth-busting-plus":{name:"Myth+",emoji:"\u{1F9F1}",skeleton:"Hook (bold myth claim) \u2192 Multiple myths busted \u2192 Deeper truth revealed \u2192 System-level change \u2192 New paradigm \u2192 CTA"},"quick-win":{name:"Quick Win",emoji:"\u{1F3C6}",skeleton:"Hook (immediate result) \u2192 Simple action \u2192 Quick proof \u2192 Scaling tip \u2192 Long-term benefit \u2192 CTA"},"deep-dive":{name:"Deep Dive",emoji:"\u{1F93F}",skeleton:"Hook (complex question) \u2192 Surface-level answer \u2192 Deeper layers \u2192 Expert insight \u2192 Nuanced conclusion \u2192 CTA"},checklist:{name:"Checklist",emoji:"\u2705",skeleton:"Hook (checklist promise) \u2192 Overview \u2192 Item 1 with details \u2192 Item 2 \u2192 Item 3 \u2192 Implementation tips \u2192 CTA"}},hookPatterns:[{type:"AIDA Attention",template:"What if I told you that [topic] could change everything?"},{type:"AIDA Interest",template:"The hidden truth about [topic] that nobody is talking about."},{type:"AIDA Desire",template:"Imagine mastering [topic] in half the time it takes everyone else."},{type:"AIDA Action",template:"Here is exactly how you can start with [topic] right now."},{type:"PAS Problem",template:"[Topic] is failing for 90% of people. Here is why."},{type:"PAS Agitate",template:"Every time you struggle with [topic], you are making this one mistake."},{type:"PAS Solution",template:"I finally cracked the code for [topic]. This changes everything."},{type:"Status Shift",template:"Everything you know about [topic] is about to become obsolete."},{type:"Status Shift",template:"The old rules of [topic] no longer apply. Here are the new ones."},{type:"Status Shift",template:"Why experts are wrong about [topic] and what actually works."}],init(){this.bindEvents(),this.loadStoredPreferences()},bindEvents(){let t=document.getElementById("generate-thread-btn");t&&t.addEventListener("click",()=>this.generateThread()),document.addEventListener("click",o=>{o.target.closest(".persona-chip")&&this.selectPersona(o.target.closest(".persona-chip").dataset.persona),o.target.closest(".format-chip")&&this.selectFormat(o.target.closest(".format-chip").dataset.format),o.target.closest(".hook-item")&&this.selectHook(o.target.closest(".hook-item").dataset.hook)});let e=document.getElementById("generate-hooks-btn"),n=document.getElementById("generate-hooks-btn-modal");e&&e.addEventListener("click",()=>this.generateHooks()),n&&n.addEventListener("click",()=>this.generateHooks("modal"));let a=document.getElementById("trend-fusion-btn"),i=document.getElementById("trend-fusion-btn-modal");a&&a.addEventListener("click",()=>this.generateTrendFusion()),i&&i.addEventListener("click",()=>this.generateTrendFusion("modal"))},showEnhancedModal(){},hideModal(){},selectPersona(t){this.selectedPersona=t,document.querySelectorAll(".persona-chip").forEach(e=>{e.classList.toggle("active",e.dataset.persona===t)}),this.savePreferences()},selectFormat(t){this.selectedFormat=t,document.querySelectorAll(".format-chip").forEach(e=>{e.classList.toggle("active",e.dataset.format===t)}),this.savePreferences()},selectHook(t){this.selectedHook=t,document.querySelectorAll(".hook-item").forEach(e=>{e.classList.toggle("selected",e.dataset.hook===t)})},async generateHooks(t="view"){let e=t==="modal"?"thread-topic-modal":"thread-topic",n=document.getElementById(e);if(this.currentTopic=n?n.value.trim():"",!this.currentTopic){this.showToast("Enter a topic first",2e3);return}let a=t==="modal"?"generate-hooks-btn-modal":"generate-hooks-btn",i=document.getElementById(a),o=i.textContent;i.textContent="\u23F3 Generating...",i.disabled=!0;try{let s=await this.callGeminiAPI(this.buildHooksPrompt());this.displayHooks(s,t)}catch(s){console.error("Hook generation failed:",s),this.showToast("Failed to generate hooks",3e3)}finally{i.textContent=o,i.disabled=!1}},async generateTrendFusion(t="view"){let e=t==="modal"?"thread-topic-modal":"thread-topic",n=document.getElementById(e);if(this.currentTopic=n?n.value.trim():"",!this.currentTopic){this.showToast("Enter a topic first",2e3);return}let a=t==="modal"?"trend-fusion-btn-modal":"trend-fusion-btn",i=document.getElementById(a),o=i.textContent;i.textContent="\u23F3 Generating...",i.disabled=!0;try{let s=await this.callGeminiAPI(this.buildTrendFusionPrompt());this.displayTrendFusion(s,t)}catch(s){console.error("Trend fusion failed:",s),this.showToast("Failed to generate trend fusion",3e3)}finally{i.textContent=o,i.disabled=!1}},async generateThread(){let t=document.getElementById("thread-topic");if(this.currentTopic=t.value.trim(),!this.currentTopic){this.showToast("Enter a topic first",2e3);return}let e=document.getElementById("generate-thread-btn"),n=e.textContent;e.textContent="\u23F3 Generating...",e.disabled=!0;try{let a=await this.callGeminiAPI(this.buildThreadPrompt());this.generatedThread=a,this.displayThreadResult(a),this.saveToGallery(a,this.currentTopic,this.selectedFormat)}catch(a){console.error("Thread generation failed:",a),this.showToast("Failed to generate thread",3e3)}finally{e.textContent=n,e.disabled=!1}},buildHooksPrompt(){let t=this.personas[this.selectedPersona];return`Generate 10 powerful hooks for "${this.currentTopic}" using these frameworks:

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

Generate the complete thread now:`,n},displayHooks(t,e="view"){let n=e==="modal"?"hooks-container-modal":"hooks-container",a=document.getElementById(n);if(!a)return;let i=this.parseHookList(t);a.innerHTML=i.map((o,s)=>`
        <div class="hook-item" data-hook="${o.text}">
          <div class="hook-text">${o.text}</div>
          <div class="hook-type">${o.type}</div>
        </div>
      `).join(""),a.classList.remove("hidden")},displayTrendFusion(t,e="view"){let n=e==="modal"?"trend-result-modal":"trend-result",a=document.getElementById(n);if(!a)return;let o=t.split(`
`).find(s=>s.includes("Why")&&s.includes("matters")&&s.includes("over next 6 months"))||t.trim();a.textContent=o,a.classList.remove("hidden")},parseHookList(t){let e=t.split(`
`),n=[];for(let a=0;a<e.length;a++){let o=e[a].trim().match(/^\d+\.\s*(.+)$/);if(o){let s=this.hookPatterns[Math.min(a,this.hookPatterns.length-1)].type;n.push({text:o[1],type:s})}}return n.length===0?this.hookPatterns.slice(0,10).map(a=>({text:a.template.replace("[topic]",this.currentTopic),type:a.type})):n.slice(0,10)},displayThreadResult(t){window.TabTalkNavigation&&window.TabTalkNavigation.showView("chat");let e={type:"thread",content:t,title:this.currentTopic,timestamp:new Date().toISOString(),tags:[this.selectedFormat,this.selectedPersona]},n=document.getElementById("messages-container");if(n&&window.TabTalkUI&&window.TabTalkUI.renderCard){let a=window.TabTalkUI.renderCard(e);n.appendChild(a)}},async callGeminiAPI(t){if(!window.TabTalkAPI?.callGeminiAPI)throw new Error("API not available");return await window.TabTalkAPI.callGeminiAPI(t)},saveToGallery(t,e,n){if(!window.TabTalkGallery)return;let a={id:Date.now().toString(),title:e,content:t,timestamp:new Date().toISOString(),tags:[n,this.selectedPersona],platform:"thread"};window.TabTalkGallery.saveContent(a)},loadStoredPreferences(){chrome.storage.local.get(["enhancedPersona","enhancedFormat"],t=>{t.enhancedPersona&&this.selectPersona(t.enhancedPersona),t.enhancedFormat&&this.selectFormat(t.enhancedFormat)})},savePreferences(){chrome.storage.local.set({enhancedPersona:this.selectedPersona,enhancedFormat:this.selectedFormat})},showToast(t,e=3e3){window.TabTalkUI?.showToast?window.TabTalkUI.showToast(t,e):console.log("Toast:",t)}};window.TabTalkEnhancedQuickActions=l,document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>l.init()):l.init()})();(function(){let l={promptsCache:{},init(){},async generatePromptForCard(t,e){if(!t||!e)return console.error("ImagePromptGenerator: contentId or cardText missing"),null;if(this.promptsCache[t])return this.promptsCache[t];let n=await this.callGeminiAPI(this.buildSuperPrompt(e));return n&&(this.promptsCache[t]=n),n},getPromptForContentId(t){return this.promptsCache[t]||null},attachPromptToCard(t,e,n){if(!t||!n)return;t.dataset.imagePrompt=encodeURIComponent(n);let a=t.querySelector(".twitter-card-content");if(a){let i=a.querySelector(".image-prompt-display");i&&i.remove();let o=document.createElement("div");o.className="image-prompt-display",o.innerHTML=`
          <div class="image-prompt-label">\u{1F5BC}\uFE0F Nano Banana Prompt (9:16)</div>
          <div class="image-prompt-text">${this.escapeHtml(n)}</div>
        `,a.appendChild(o)}},buildSuperPrompt(t){return`You are an award-winning graphics designer and creative director with 15+ years of experience in visual storytelling, branding, and digital art. You have designed for Fortune 500 companies, startups, and viral social media campaigns. Your expertise spans typography, layout theory, color psychology, composition, and visual hierarchy.

Your task is to create a single, ultra-detailed prompt for a 9:16 vertical image that perfectly complements this Twitter post content. This prompt will be used by Google Nano Banana to generate a professional-grade visual.

CONTENT CONTEXT:
${t}

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

Generate the expert-level graphics design prompt now:`},async callGeminiAPI(t){if(window.TabTalkAPI?.callGeminiAPI)try{let e=await window.TabTalkAPI.callGeminiAPI(t);return this.cleanPromptResponse(e)}catch(e){throw console.error("ImagePromptGenerator: API call failed:",e),e}throw new Error("API not available")},cleanPromptResponse(t){if(!t)return"";let e=String(t).trim();return e=e.replace(/^(?:Here is|Here's|This is|Below is)[^\n]*:\s*/i,""),e=e.replace(/^(?:Okay|Sure|Certainly)[^\n]*\n/i,""),e=e.replace(/^\d+\.\s*/gm,""),e=e.replace(/^Explanation:.*$/gm,""),e=e.replace(/^Note:.*$/gm,""),e=e.replace(/\n{3,}/g,`

`),e.trim()},escapeHtml(t){let e=document.createElement("div");return e.textContent=t,e.innerHTML},clearCacheForContentId(t){delete this.promptsCache[t]},clearAllCache(){this.promptsCache={}}};window.TabTalkImagePromptGenerator=l,window.FibrImagePromptGenerator=l})();(function(){let l={currentTopic:"",isProcessing:!1,init(){this.bindEvents()},bindEvents(){let t=document.getElementById("refine-topic-btn"),e=document.getElementById("generate-ideas-btn"),n=document.getElementById("thread-topic");t&&t.addEventListener("click",()=>this.refineTopic()),e&&e.addEventListener("click",()=>this.generateTopicIdeas()),n&&n.addEventListener("input",()=>this.hideSuggestions())},async refineTopic(){let t=document.getElementById("thread-topic");if(this.currentTopic=t?.value?.trim()||"",!this.currentTopic){this.showToast("Enter a topic first to refine it",2e3);return}if(this.isProcessing)return;let e=document.getElementById("refine-topic-btn"),n=e.textContent;this.isProcessing=!0,e.textContent="\u23F3 Refining...",e.disabled=!0;try{let a=await this.callGeminiAPI(this.buildRefinementPrompt());this.displayRefinements(a)}catch(a){console.error("Topic refinement failed:",a),this.showToast("Failed to refine topic",3e3)}finally{e.textContent=n,e.disabled=!1,this.isProcessing=!1}},async generateTopicIdeas(){if(this.isProcessing)return;let t=document.getElementById("generate-ideas-btn"),e=t.textContent;this.isProcessing=!0,t.textContent="\u23F3 Generating...",t.disabled=!0;try{let n=await this.callGeminiAPI(this.buildIdeasPrompt());this.displayTopicIdeas(n)}catch(n){console.error("Topic ideas generation failed:",n),this.showToast("Failed to generate ideas",3e3)}finally{t.textContent=e,t.disabled=!1,this.isProcessing=!1}},buildRefinementPrompt(){return`Refine and enhance this topic for a viral Twitter thread: "${this.currentTopic}"

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

Generate 10 fresh ideas now:`},displayRefinements(t){let e=this.parseSuggestions(t);this.displaySuggestions(e,"refinements")},displayTopicIdeas(t){let e=this.parseSuggestions(t);this.displaySuggestions(e,"ideas")},parseSuggestions(t){let e=t.split(`
`),n=[];for(let a of e){let i=a.match(/^\d+\.?\s*(.+)$/);i&&i[1].trim()&&n.push(i[1].trim())}return n.slice(0,8)},displaySuggestions(t,e){let n=document.getElementById("topic-suggestions"),a=document.getElementById("suggestions-list");!n||!a||(a.innerHTML=t.map(i=>`
        <div class="suggestion-item" data-topic="${this.escapeHtml(i)}">
          <span class="suggestion-text">${this.escapeHtml(i)}</span>
          <button class="suggestion-apply" title="Use this topic">\u2713</button>
        </div>
      `).join(""),n.classList.remove("hidden"),a.querySelectorAll(".suggestion-apply").forEach(i=>{i.addEventListener("click",o=>{o.stopPropagation();let s=o.target.closest(".suggestion-item").dataset.topic;this.applySuggestion(s)})}),a.querySelectorAll(".suggestion-item").forEach(i=>{i.addEventListener("click",()=>{let o=i.dataset.topic;this.applySuggestion(o)})}))},applySuggestion(t){let e=document.getElementById("thread-topic");e&&(e.value=t,e.focus(),this.hideSuggestions(),this.showToast("Topic updated",1500))},hideSuggestions(){let t=document.getElementById("topic-suggestions");t&&t.classList.add("hidden")},async callGeminiAPI(t){if(!window.TabTalkAPI?.callGeminiAPI)throw new Error("API not available");return await window.TabTalkAPI.callGeminiAPI(t)},showToast(t,e=3e3){window.TabTalkUI?.showToast?window.TabTalkUI.showToast(t,e):console.log("Toast:",t)},escapeHtml(t){let e=document.createElement("div");return e.textContent=t,e.innerHTML}};window.TabTalkTopicEnhancer=l,document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>l.init()):l.init()})();(function(){let l={render(t){t.innerHTML="";let e=document.createElement("header");e.className="privacy-header glass-card",e.innerHTML=`
        <button class="button-secondary back-btn" id="privacy-back" aria-label="Back to home">
          \u2190 Back
        </button>
        <div class="privacy-heading">
          <span class="privacy-icon">\u{1F512}</span>
          <div>
            <h2>Privacy & Security Policy</h2>
            <p class="policy-subtitle">Transparent practices to keep your data safe</p>
          </div>
        </div>
      `,t.appendChild(e);let n=[{title:"Effective Date",content:"<p>October 31, 2025</p>"},{title:"Introduction",content:'<p>Fibr ("we," "us," or "our") is committed to protecting your privacy. This Privacy and Security Policy explains how Fibr collects, uses, and safeguards your information when you use our Chrome extension.</p>'},{title:"Information We Collect",highlights:["<strong>API Key:</strong> Your Google Gemini API key is stored securely in chrome.storage.local and never transmitted to our servers.","<strong>No Personal Data:</strong> Fibr does not collect personal information, browsing history, or webpage content beyond what you select for AI processing."]},{title:"How We Use Information",highlights:["Your API key only authenticates requests sent directly from your browser to Google's Gemini API.","All AI processing happens on Google servers. Fibr does not proxy or monitor these requests.","Generated outputs are saved locally in your browser to power the gallery and history experiences."]},{title:"Information Sharing",highlights:["Fibr never shares, sells, or discloses your data to third parties.","API traffic flows directly from your device to Google Gemini.","We do not run analytics scripts or external trackers inside the extension."]},{title:"Data Security",highlights:["API keys remain in Chrome's secure storage with built-in encryption.","All requests use HTTPS to protect data in transit.","Processing is client-side wherever possible; only AI generation relies on Gemini."]},{title:"User Rights & Controls",highlights:["Remove your API key and saved content anytime from the extension or Chrome settings.","Choose which webpages to analyze\u2014nothing is sent without your action.","Reach out to our support team anytime at grow.with.fibr@gmail.com for privacy questions."]},{title:"Chrome Extension Permissions",content:`
            <ul>
              <li><code>activeTab</code> \u2013 Reads the current tab only when you trigger a generation.</li>
              <li><code>storage</code> \u2013 Saves your API key and generated posts locally.</li>
              <li><code>scripting</code> \u2013 Injects lightweight content extraction scripts when needed.</li>
            </ul>
            <p class="policy-footnote">We request the minimum permissions required for core functionality.</p>
          `},{title:"Policy Updates",content:"<p>We may update this policy to reflect product improvements or regulatory changes. Major updates will be highlighted inside the extension and repository changelog.</p>"},{title:"Contact Us",content:'<p>Need help or want to share feedback? Email us directly at <a href="mailto:grow.with.fibr@gmail.com">grow.with.fibr@gmail.com</a>.</p>'}],a=document.createElement("section");a.className="privacy-content",n.forEach(i=>{let o=document.createElement("article");o.className="privacy-card glass-card";let s=document.createElement("h3");if(s.textContent=i.title,o.appendChild(s),i.highlights){let r=document.createElement("ul");r.className="privacy-list",i.highlights.forEach(c=>{let d=document.createElement("li");d.innerHTML=c,r.appendChild(d)}),o.appendChild(r)}if(i.content){let r=document.createElement("div");r.className="privacy-body",r.innerHTML=i.content,o.appendChild(r)}a.appendChild(o)}),t.appendChild(a),this.bindEvents(t)},bindEvents(t){let e=t.querySelector("#privacy-back");e&&e.addEventListener("click",()=>{window.FibrNavigation&&window.FibrNavigation.showView&&window.FibrNavigation.showView("chat")})}};window.FibrPrivacyPolicy=l,window.TabTalkPrivacyPolicy=l})();(()=>{var l=class{constructor(){this.apiKey=null,this.currentTab=null,this.pageContent=null,this.isLoading=!1,this.currentDomain=null,this.messagesContainer=document.getElementById("messages-container"),this.pageStatus=document.getElementById("page-status"),this.pageTitle=document.getElementById("page-title"),this.quickActions=document.getElementById("quick-actions"),this.sidebar=document.getElementById("sidebar"),this.quickTwitterBtn=document.getElementById("quick-twitter"),this.quickRepostBtn=document.getElementById("quick-repost"),this.quickCommentsBtn=document.getElementById("quick-comments"),this.quickTwitterThreadBtn=document.getElementById("quick-twitter-thread"),this.quickCreateBtn=document.getElementById("quick-create"),this.welcomeView=document.getElementById("welcome-view"),this.apiSetupView=document.getElementById("api-setup-view"),this.chatView=document.getElementById("chat-view"),this.settingsView=document.getElementById("settings-view"),this.privacyView=document.getElementById("privacy-view"),this.privacyContainer=document.getElementById("privacy-policy-container"),this.menuButton=document.getElementById("menu-button"),this.apiKeyInput=document.getElementById("api-key-input")||document.getElementById("settings-api-key"),this.inputActions=document.querySelector(".input-actions"),this.exportFormatSelect=document.getElementById("export-format-select"),this.statusText=document.getElementById("status-text"),this.views={welcome:this.welcomeView,"api-setup":this.apiSetupView,chat:this.chatView,settings:this.settingsView,privacy:this.privacyView}}async init(){try{console.log("Fibr: Initializing popup");let e=await chrome.tabs.query({active:!0,currentWindow:!0});!e||e.length===0?(console.error("Fibr: Failed to get current tab"),this.pageStatus&&(this.pageStatus.textContent="\u274C Failed to access current tab")):(this.currentTab=e[0],console.log("Fibr: Current tab:",this.currentTab.url)),await this.loadState();try{let a=await this.getStorageItem?await this.getStorageItem("theme"):null;a||(a="dark"),document.documentElement.setAttribute("data-theme",a)}catch{}if(this.migrateThreadsToGallery)try{await this.migrateThreadsToGallery()}catch(a){console.warn("Thread migration skipped",a)}this.bindEvents();let n=!1;try{this.getStorageItem?n=await this.getStorageItem("hasSeenWelcome"):n=(await chrome.storage.local.get(["hasSeenWelcome"])).hasSeenWelcome}catch(a){console.error("Error checking hasSeenWelcome:",a),n=!1}this.apiKey?(this.showView("chat"),await this.getAndCachePageContent()):n?this.showView("api-setup"):this.showView("welcome"),console.log("Fibr: Popup initialized")}catch(e){console.error("Fibr: Initialization error:",e),this.pageStatus&&(e.message&&e.message.includes("Extension context invalidated")?this.pageStatus.textContent="\u26A0\uFE0F Extension reloaded. Please refresh the page and try again.":this.pageStatus.textContent=`\u274C Initialization failed: ${e.message}`),this.showView&&this.showView("welcome")}}bindEvents(){let e=document.getElementById("settings-cancel-button"),n=document.getElementById("settings-save-button");e&&e.addEventListener("click",()=>{this.updateViewState(this.apiKey?"chat":"settings")}),n&&n.addEventListener("click",()=>this.handleSaveSettings());let a=document.getElementById("delete-api-key-button");a&&a.addEventListener("click",()=>this.handleDeleteApiKey()),console.log("Menu Button:",this.menuButton),console.log("Sidebar:",this.sidebar),this.menuButton&&this.sidebar&&(this.menuButton.addEventListener("click",p=>{p.stopPropagation(),console.log("Menu button clicked!");let v=this.sidebar.classList.contains("hidden");v?(this.sidebar.classList.remove("hidden"),this.sidebar.style.display="block"):(this.sidebar.classList.add("hidden"),this.sidebar.style.display="none"),console.log("Sidebar is now:",v?"visible":"hidden"),this.sidebar.setAttribute("aria-expanded",v?"false":"true")}),document.addEventListener("click",p=>{this.sidebar.classList.contains("hidden")||!this.sidebar.contains(p.target)&&p.target!==this.menuButton&&(this.sidebar.classList.add("hidden"),this.sidebar.setAttribute("aria-expanded","false"))}),this.sidebar.addEventListener("keydown",p=>{p.key==="Escape"&&(this.sidebar.classList.add("hidden"),this.sidebar.setAttribute("aria-expanded","false"),this.menuButton.focus())}));let i=document.getElementById("menu-settings-link");i&&i.addEventListener("click",p=>{p.preventDefault(),this.updateViewState("settings"),this.sidebar&&this.sidebar.classList.add("hidden")});let o=document.getElementById("theme-toggle");o&&o.addEventListener("click",async()=>{let v=(document.documentElement.getAttribute("data-theme")||"light")==="dark"?"light":"dark";if(document.documentElement.setAttribute("data-theme",v),this.setStorageItem)try{await this.setStorageItem("theme",v)}catch{}});let s=document.getElementById("menu-gallery-link");s&&s.addEventListener("click",p=>{p.preventDefault(),this.showView("gallery")});let r=document.getElementById("menu-privacy-link");r&&r.addEventListener("click",p=>{p.preventDefault(),this.showView("privacy"),this.sidebar&&this.sidebar.classList.add("hidden")});let c=document.getElementById("welcome-get-started");c&&c.addEventListener("click",async()=>{try{this.setStorageItem?await this.setStorageItem("hasSeenWelcome",!0):await chrome.storage.local.set({hasSeenWelcome:!0}),this.showView("api-setup")}catch(p){console.error("Error in welcome-get-started:",p),this.showView("api-setup")}});let d=document.getElementById("welcome-start");d&&d.addEventListener("click",async()=>{try{this.setStorageItem?await this.setStorageItem("hasSeenWelcome",!0):await chrome.storage.local.set({hasSeenWelcome:!0}),this.showView("api-setup")}catch(p){console.error("Error in welcome-start:",p),this.showView("api-setup")}});let g=document.getElementById("api-setup-back");g&&g.addEventListener("click",()=>{this.showView("welcome")});let h=document.getElementById("api-setup-back-arrow");h&&h.addEventListener("click",()=>{this.showView("welcome")});let m=document.getElementById("api-setup-continue");m&&m.addEventListener("click",async()=>{let p=document.getElementById("onboarding-api-key").value.trim();p&&(await this.saveApiKey(p),this.showView("chat"),await this.getAndCachePageContent())});let u=document.getElementById("test-api-key");u&&u.addEventListener("click",async()=>{let p=document.getElementById("onboarding-api-key").value.trim();if(p){let v=await this.testApiKey(p),f=document.getElementById("api-setup-continue");v?(u.textContent="\u2713 Valid",u.style.background="#10b981",u.style.color="white",f.disabled=!1):(u.textContent="\u2717 Invalid",u.style.background="#ef4444",u.style.color="white",f.disabled=!0),setTimeout(()=>{u.textContent="Test",u.style.background="",u.style.color=""},2e3)}});let w=document.getElementById("onboarding-api-key");w&&w.addEventListener("input",()=>{let p=document.getElementById("api-setup-continue");p.disabled=!w.value.trim()}),this.menuButton&&this.menuButton.setAttribute("aria-label","Open menu"),this.apiKeyInput&&this.apiKeyInput.setAttribute("aria-label","Gemini API Key"),console.log("Button elements found:",{quickTwitterBtn:!!this.quickTwitterBtn,quickRepostBtn:!!this.quickRepostBtn,quickCommentsBtn:!!this.quickCommentsBtn,quickTwitterThreadBtn:!!this.quickTwitterThreadBtn,quickCreateBtn:!!this.quickCreateBtn}),this.quickTwitterBtn&&this.quickTwitterBtn.addEventListener("click",async()=>{this.resetScreenForGeneration&&this.resetScreenForGeneration(),await this.generateSocialContent("twitter")}),this.quickRepostBtn&&this.quickRepostBtn.addEventListener("click",async()=>{if(this.resetScreenForGeneration&&this.resetScreenForGeneration(),!window.FibrRepostModal||typeof window.FibrRepostModal.showWithContentLoading!="function"){console.warn("Fibr: Repost modal module not available"),this.showToast?this.showToast("\u274C Repost flow unavailable. Please reload the extension.",4e3):alert("\u274C Repost flow unavailable. Please reload the extension.");return}try{await window.FibrRepostModal.showWithContentLoading(this)}catch(p){console.error("Fibr: Failed to open repost modal",p),this.showToast?this.showToast(`\u274C Repost setup failed: ${p.message}`,4e3):alert(`\u274C Repost setup failed: ${p.message}`)}}),this.quickCommentsBtn&&this.quickCommentsBtn.addEventListener("click",async()=>{if(this.resetScreenForGeneration&&this.resetScreenForGeneration(),window.FibrCommentsModal?.showWithContentLoading)try{await window.FibrCommentsModal.showWithContentLoading(this)}catch(p){console.error("Fibr: Failed to open comments modal",p),this.showToast?this.showToast(`\u274C Comments setup failed: ${p.message}`,4e3):alert(`\u274C Comments setup failed: ${p.message}`)}else console.warn("Fibr: Comments modal module not available"),this.showToast?this.showToast("\u274C Comments flow unavailable. Please reload the extension.",4e3):alert("\u274C Comments flow unavailable. Please reload the extension.")}),this.quickTwitterThreadBtn&&this.quickTwitterThreadBtn.addEventListener("click",async()=>{console.log("Thread button clicked - showing tone selector for thread generation"),this.resetScreenForGeneration&&this.resetScreenForGeneration(),await this.generateSocialContent("thread")}),this.quickCreateBtn&&this.quickCreateBtn.addEventListener("click",()=>{this.resetScreenForGeneration&&this.resetScreenForGeneration(),window.FibrThreadGenerator&&window.FibrThreadGenerator.showModal?window.FibrThreadGenerator.showModal(this):this.showView("thread-generator")});let y=document.getElementById("generate-thread-btn");y&&y.addEventListener("click",async()=>{this.handleThreadGeneratorSubmit&&await this.handleThreadGeneratorSubmit()}),this.initializeHorizontalScroll(),window.FibrThreadGenerator&&window.FibrThreadGenerator.init&&(console.log("Fibr: Initializing Thread Generator modal..."),window.FibrThreadGenerator.init())}async testApiKey(e){try{console.log("Fibr: Testing API key...");let n=await chrome.runtime.sendMessage({action:"validateApiKey",apiKey:e});return console.log("Fibr: API key test result:",n),n&&n.success}catch(n){return console.error("Error testing API key:",n),!1}}async handleSaveSettings(){let e=this.apiKeyInput?this.apiKeyInput.value.trim():"";if(!e){alert("Please enter a valid API key");return}await this.testApiKey(e)?(await this.saveApiKey(e),console.log("TabTalk AI: Saving API key with key name 'geminiApiKey' successfully"),this.showView("chat"),await this.getAndCachePageContent()):alert("Invalid API key. Please try again.")}async getAndCachePageContent(){if(!(!this.currentTab||!this.apiKey)){this.setLoading(!0,"Reading page..."),this.pageStatus.textContent="Injecting script to read page...";try{if(this.currentTab.url?.startsWith("chrome://")||this.currentTab.url?.startsWith("https://chrome.google.com/webstore"))throw new Error("Cannot run on protected browser pages.");let e=await chrome.scripting.executeScript({target:{tabId:this.currentTab.id},files:["content.js"]});if(!e||e.length===0)throw new Error("Script injection failed.");let n=e[0].result;if(n.success)this.pageContent=n.content,this.pageStatus.textContent=`\u2705 Content loaded (${(n.content.length/1024).toFixed(1)} KB)`,this.updateQuickActionsVisibility();else throw new Error(n.error)}catch(e){console.error("TabTalk AI (popup):",e),e.message&&e.message.includes("Extension context invalidated")?this.pageStatus.textContent="\u26A0\uFE0F Extension reloaded. Please refresh the page and try again.":this.pageStatus.textContent=`\u274C ${e.message}`}finally{this.setLoading(!1)}}}};let t=l.prototype.init;document.addEventListener("DOMContentLoaded",()=>{window.TabTalkAPI&&Object.assign(l.prototype,window.TabTalkAPI),window.TabTalkTwitter&&Object.assign(l.prototype,window.TabTalkTwitter),window.TabTalkThreadGenerator&&Object.assign(l.prototype,window.TabTalkThreadGenerator),window.TabTalkContentAnalysis&&Object.assign(l.prototype,window.TabTalkContentAnalysis),window.TabTalkSocialMedia&&Object.assign(l.prototype,window.TabTalkSocialMedia);let e=window.TabTalkStorage||window.FibrStorage;e?(Object.assign(l.prototype,e),console.log("Fibr: Storage module loaded successfully")):(console.error("Fibr: Storage module not found! Adding fallback methods."),l.prototype.getStorageItem=async function(n){try{let a=await chrome.storage.local.get([n]);return a?a[n]:void 0}catch(a){console.error("getStorageItem fallback error:",a);return}},l.prototype.setStorageItem=async function(n,a){try{return await chrome.storage.local.set({[n]:a}),!0}catch(i){return console.error("setStorageItem fallback error:",i),!1}}),window.TabTalkUI&&Object.assign(l.prototype,window.TabTalkUI),window.TabTalkScroll&&Object.assign(l.prototype,window.TabTalkScroll),window.TabTalkNavigation&&Object.assign(l.prototype,window.TabTalkNavigation),l.prototype.init=async function(){return await t.call(this),this},new l().init().catch(n=>console.error("Initialization error:",n))})})();})();
