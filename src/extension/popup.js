// Import all modules so esbuild can bundle them correctly
import './modules/api.js';
import './modules/storage.js';
import './modules/navigation.js';
import './modules/ui-render.js';
import './modules/twitter.js';
import './modules/thread-generator.js';
import './modules/scroll.js';
import './modules/gallery.js';
import './modules/validation.js';
import './modules/validation-handlers.js';
import './modules/tone-selector.js';
import './modules/bottom-nav.js';

(() => {
  (() => {
    var l = class {
      constructor() {
        ((this.apiKey = null),
          (this.currentTab = null),
          (this.pageContent = null),
          (this.isLoading = !1),
          (this.currentDomain = null),
          (this.messagesContainer =
            document.getElementById("messages-container")),
          (this.pageStatus = document.getElementById("page-status")),
          (this.pageTitle = document.getElementById("page-title")),
          (this.quickActions = document.getElementById("quick-actions")),
          (this.sidebar = document.getElementById("sidebar")),
          (this.quickTwitterBtn = document.getElementById("quick-twitter")),
          (this.quickTwitterThreadBtn = document.getElementById("quick-twitter-thread")),
          (this.quickCreateBtn = document.getElementById("quick-create")),
          (this.welcomeView = document.getElementById("welcome-view")),
          (this.apiSetupView = document.getElementById("api-setup-view")),
          (this.chatView = document.getElementById("chat-view")),
          (this.settingsView = document.getElementById("settings-view")),
          (this.menuButton = document.getElementById("menu-button")),
          (this.apiKeyInput =
            document.getElementById("api-key-input") ||
            document.getElementById("settings-api-key")),
          (this.inputActions = document.querySelector(".input-actions")),
          (this.exportFormatSelect = document.getElementById(
            "export-format-select",
          )),
          (this.statusText = document.getElementById("status-text")),
          (this.views = {
            welcome: this.welcomeView,
            "api-setup": this.apiSetupView,
            chat: this.chatView,
            settings: this.settingsView,
          }));
      }
      async init() {
        try {
          console.log("TabTalk AI: Initializing popup");

          const tabs = await chrome.tabs.query({ active: !0, currentWindow: !0 });
          if (!tabs || tabs.length === 0) {
            console.error("TabTalk AI: Failed to get current tab");
            if (this.pageStatus) {
              this.pageStatus.textContent = "\u274C Failed to access current tab";
            }
          } else {
            this.currentTab = tabs[0];
            console.log("TabTalk AI: Current tab:", this.currentTab.url);
          }

          await this.loadState();

          // Initialize theme from storage, default to dark mode
          try {
            let theme = await this.getStorageItem ? await this.getStorageItem("theme") : null;
            if (!theme) {
              theme = 'dark'; // Default to dark mode
            }
            document.documentElement.setAttribute('data-theme', theme);
          } catch (e) {}
          // One-time migration: move old savedThreads into Gallery savedContent
          if (this.migrateThreadsToGallery) {
            try { await this.migrateThreadsToGallery(); } catch (e) { console.warn('Thread migration skipped', e); }
          }
          this.bindEvents();

          const hasSeenWelcome = await this.getStorageItem("hasSeenWelcome");

          if (this.apiKey) {
            this.showView("chat");
            await this.getAndCachePageContent();
          } else if (hasSeenWelcome) {
            this.showView("api-setup");
          } else {
            this.showView("welcome");
          }

          console.log("TabTalk AI: Popup initialized");
        } catch (error) {
          console.error("TabTalk AI: Initialization error:", error);
          if (this.pageStatus) {
            this.pageStatus.textContent = `\u274C Initialization failed: ${error.message}`;
          }
          // Fallback to welcome view so UI does not remain blank
          if (this.showView) {
            this.showView("welcome");
          }
        }
      }
      bindEvents() {
        let t = document.getElementById("settings-cancel-button"),
          e = document.getElementById("settings-save-button");
        (t &&
          t.addEventListener("click", () => {
            this.updateViewState(this.apiKey ? "chat" : "settings");
          }),
          e && e.addEventListener("click", () => this.handleSaveSettings()));
        let n = document.getElementById("delete-api-key-button");
        (n && n.addEventListener("click", () => this.handleDeleteApiKey()),
          console.log("Menu Button:", this.menuButton),
          console.log("Sidebar:", this.sidebar),
          this.menuButton &&
            this.sidebar &&
            (this.menuButton.addEventListener("click", (s) => {
              (s.stopPropagation(), console.log("Menu button clicked!"));
              let d = this.sidebar.classList.contains("hidden");
              (d
                ? (this.sidebar.classList.remove("hidden"),
                  (this.sidebar.style.display = "block"))
                : (this.sidebar.classList.add("hidden"),
                  (this.sidebar.style.display = "none")),
                console.log("Sidebar is now:", d ? "visible" : "hidden"),
                this.sidebar.setAttribute(
                  "aria-expanded",
                  d ? "false" : "true",
                ));
            }),
            document.addEventListener("click", (s) => {
              this.sidebar.classList.contains("hidden") ||
                (!this.sidebar.contains(s.target) &&
                  s.target !== this.menuButton &&
                  (this.sidebar.classList.add("hidden"),
                  this.sidebar.setAttribute("aria-expanded", "false")));
            }),
            this.sidebar.addEventListener("keydown", (s) => {
              s.key === "Escape" &&
                (this.sidebar.classList.add("hidden"),
                this.sidebar.setAttribute("aria-expanded", "false"),
                this.menuButton.focus());
            })));
        let i = document.getElementById("menu-settings-link");
        i &&
          i.addEventListener("click", (s) => {
            (s.preventDefault(),
              this.updateViewState("settings"),
              this.sidebar && this.sidebar.classList.add("hidden"));
          });
        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
          themeToggle.addEventListener('click', async () => {
            const current = document.documentElement.getAttribute('data-theme') || 'light';
            const next = current === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            if (this.setStorageItem) {
              try { await this.setStorageItem('theme', next); } catch {}
            }
          });
        }
        // New: Gallery link
        let ig = document.getElementById("menu-gallery-link");
        ig &&
          ig.addEventListener("click", (s) => {
            s.preventDefault();
            this.showView("gallery");
            if (this.sidebar) {
              this.sidebar.classList.add("hidden");
              this.sidebar.style.display = "none";
            }
          });
        // Removed: Thread Library link (Threads feature deprecated)
        let r = document.getElementById("welcome-get-started");
        r &&
          r.addEventListener("click", async () => {
            (await this.setStorageItem("hasSeenWelcome", !0),
              this.showView("api-setup"));
          });
        let o = document.getElementById("welcome-start");
        o &&
          o.addEventListener("click", async () => {
            (await this.setStorageItem("hasSeenWelcome", !0),
              this.showView("api-setup"));
          });
        let u = document.getElementById("api-setup-back");
        u &&
          u.addEventListener("click", () => {
            this.showView("welcome");
          });
        let h = document.getElementById("api-setup-back-arrow");
        h &&
          h.addEventListener("click", () => {
            this.showView("welcome");
          });
        let w = document.getElementById("api-setup-continue");
        w &&
          w.addEventListener("click", async () => {
            let s = document.getElementById("onboarding-api-key").value.trim();
            s &&
              (await this.saveApiKey(s),
              this.showView("chat"),
              await this.getAndCachePageContent());
          });
        let c = document.getElementById("test-api-key");
        c &&
          c.addEventListener("click", async () => {
            let s = document.getElementById("onboarding-api-key").value.trim();
            if (s) {
              let d = await this.testApiKey(s),
                S = document.getElementById("api-setup-continue");
              (d
                ? ((c.textContent = "\u2713 Valid"),
                  (c.style.background = "#10b981"),
                  (c.style.color = "white"),
                  (S.disabled = !1))
                : ((c.textContent = "\u2717 Invalid"),
                  (c.style.background = "#ef4444"),
                  (c.style.color = "white"),
                  (S.disabled = !0)),
                setTimeout(() => {
                  ((c.textContent = "Test"),
                    (c.style.background = ""),
                    (c.style.color = ""));
                }, 2e3));
            }
          });
        let y = document.getElementById("onboarding-api-key");
        y &&
          y.addEventListener("input", () => {
            let s = document.getElementById("api-setup-continue");
            s.disabled = !y.value.trim();
          });
        (
          this.menuButton &&
            this.menuButton.setAttribute("aria-label", "Open menu"),
          this.apiKeyInput &&
            this.apiKeyInput.setAttribute("aria-label", "Gemini API Key"),
          this.quickTwitterBtn &&
            this.quickTwitterBtn.addEventListener("click", async () => {
              (this.resetScreenForGeneration && this.resetScreenForGeneration(),
                await this.generateSocialContent("twitter"));
            }),
          this.quickTwitterThreadBtn &&
            this.quickTwitterThreadBtn.addEventListener("click", async () => {
              (this.resetScreenForGeneration && this.resetScreenForGeneration(),
                await this.generateSocialContent("thread"));
            }),
          this.quickCreateBtn &&
            this.quickCreateBtn.addEventListener("click", () => {
              if (
                window.TabTalkThreadGenerator &&
                window.TabTalkThreadGenerator.showModal
              ) {
                window.TabTalkThreadGenerator.showModal(this);
              } else {
                this.showView("thread-generator");
              }
            }));
        // Thread Generator button
        let generateThreadBtn = document.getElementById("generate-thread-btn");
        generateThreadBtn &&
          generateThreadBtn.addEventListener("click", async () => {
            if (this.handleThreadGeneratorSubmit) {
              await this.handleThreadGeneratorSubmit();
            }
          });
        this.initializeHorizontalScroll();

        // Initialize modules that need the DOM now that it's safe
        if (window.TabTalkThreadGenerator && window.TabTalkThreadGenerator.init) {
          console.log('TabTalk AI: Initializing Thread Generator modal...');
          window.TabTalkThreadGenerator.init();
        }
      }
      async testApiKey(t) {
        try {
          let e = await chrome.runtime.sendMessage({
            action: "testApiKey",
            apiKey: t,
          });
          return e && e.success;
        } catch (e) {
          return (console.error("Error testing API key:", e), !1);
        }
      }
      async handleSaveSettings() {
        let t = this.apiKeyInput ? this.apiKeyInput.value.trim() : "";
        if (!t) {
          alert("Please enter a valid API key");
          return;
        }
        (await this.testApiKey(t))
          ? (await this.saveApiKey(t),
            console.log(
              "TabTalk AI: Saving API key with key name 'geminiApiKey' successfully",
            ),
            this.showView("chat"),
            await this.getAndCachePageContent())
          : alert("Invalid API key. Please try again.");
      }
      async getAndCachePageContent() {
        if (!(!this.currentTab || !this.apiKey)) {
          (this.setLoading(!0, "Reading page..."),
            (this.pageStatus.textContent = "Injecting script to read page..."));
          try {
            if (
              this.currentTab.url?.startsWith("chrome://") ||
              this.currentTab.url?.startsWith(
                "https://chrome.google.com/webstore",
              )
            )
              throw new Error("Cannot run on protected browser pages.");
            let t = await chrome.scripting.executeScript({
              target: { tabId: this.currentTab.id },
              files: ["content.js"],
            });
            if (!t || t.length === 0)
              throw new Error("Script injection failed.");
            let e = t[0].result;
            if (e.success)
              ((this.pageContent = e.content),
                (this.pageStatus.textContent = `\u2705 Content loaded (${(e.content.length / 1024).toFixed(1)} KB)`),
                this.updateQuickActionsVisibility());
            else throw new Error(e.error);
          } catch (t) {
            (console.error("TabTalk AI (popup):", t),
              (this.pageStatus.textContent = `\u274C ${t.message}`));
          } finally {
            this.setLoading(!1);
          }
        }
      }
      
    };
    
    // Store the original init for later wrapping
    let T = l.prototype.init;
    
    // Wait for DOM and modules to be ready before assembling the class
    document.addEventListener("DOMContentLoaded", () => {
      // Now that all modules have executed, copy their methods to the main class
      window.TabTalkAPI && Object.assign(l.prototype, window.TabTalkAPI);
      window.TabTalkTwitter && Object.assign(l.prototype, window.TabTalkTwitter);
      window.TabTalkThreadGenerator && Object.assign(l.prototype, window.TabTalkThreadGenerator);
      window.TabTalkContentAnalysis && Object.assign(l.prototype, window.TabTalkContentAnalysis);
      window.TabTalkSocialMedia && Object.assign(l.prototype, window.TabTalkSocialMedia);
      window.TabTalkStorage && Object.assign(l.prototype, window.TabTalkStorage);
      window.TabTalkUI && Object.assign(l.prototype, window.TabTalkUI);
      window.TabTalkScroll && Object.assign(l.prototype, window.TabTalkScroll);
      window.TabTalkNavigation && Object.assign(l.prototype, window.TabTalkNavigation);
      
      // Wrap the init method
      l.prototype.init = async function () {
        return (await T.call(this), this);
      };
      
      // Now instantiate and initialize
      new l().init().catch((t) => console.error("Initialization error:", t));
    });
  })();
})();
