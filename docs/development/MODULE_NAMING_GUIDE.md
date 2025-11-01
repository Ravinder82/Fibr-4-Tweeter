# Fibr Module Naming Convention Guide

## Quick Reference for Developers

### ✅ Always Use These Names in New Code

When writing new code, **prefer the Fibr namespace**:

```javascript
// ✅ CORRECT - Use Fibr namespace
window.FibrAPI.callGeminiAPI(prompt);
window.FibrUI.showToast('Success!', 2000);
window.FibrNavigation.showView('chat');
window.FibrTwitter.generateSocialContent('twitter');
window.FibrStorage.getStorageItem('apiKey');
```

```javascript
// ⚠️ LEGACY - TabTalk namespace (still works for backward compatibility)
window.TabTalkAPI.callGeminiAPI(prompt);
window.TabTalkUI.showToast('Success!', 2000);
window.TabTalkNavigation.showView('chat');
```

---

## Complete Module Reference

### Core Modules

| Module | Fibr Name | TabTalk Name (Legacy) | Purpose |
|--------|-----------|----------------------|---------|
| API | `FibrAPI` | `TabTalkAPI` | Gemini API calls |
| Storage | `FibrStorage` | `TabTalkStorage` | Chrome storage wrapper |
| UI | `FibrUI` | `TabTalkUI` | UI utilities & toast |
| Navigation | `FibrNavigation` | `TabTalkNavigation` | View routing |

### Content Generation

| Module | Fibr Name | TabTalk Name (Legacy) | Purpose |
|--------|-----------|----------------------|---------|
| Twitter | `FibrTwitter` | `TabTalkTwitter` | Tweet generation |
| Thread Generator | `FibrThreadGenerator` | `TabTalkThreadGenerator` | Thread creation modal |
| Tone Selector | `FibrToneSelector` | `TabTalkToneSelector` | Tone selection UI |
| Repost Modal | `FibrRepostModal` | - | Repost generation |
| Comments Modal | `FibrCommentsModal` | `TabTalkCommentsModal` | Comment generation |

### Utilities

| Module | Fibr Name | TabTalk Name (Legacy) | Purpose |
|--------|-----------|----------------------|---------|
| Scroll | `FibrScroll` | `TabTalkScroll` | Horizontal scroll |
| Validation | `FibrValidation` | `TabTalkValidation` | Input validation |
| Image Prompt | `FibrImagePromptGenerator` | `TabTalkImagePromptGenerator` | AI image prompts |
| Privacy Policy | `FibrPrivacyPolicy` | `TabTalkPrivacyPolicy` | Privacy page |

---

## Common Patterns

### 1. Calling API Methods

```javascript
// Generate content
const response = await window.FibrAPI.callGeminiAPI(prompt);

// With system prompt
const response = await this.callGeminiAPIWithSystemPrompt(systemPrompt, userPrompt);
```

### 2. Navigation

```javascript
// Show a view
window.FibrNavigation.showView('chat');
window.FibrNavigation.showView('gallery');
window.FibrNavigation.showView('settings');
```

### 3. Storage Operations

```javascript
// Get item
const apiKey = await window.FibrStorage.getStorageItem('geminiApiKey');

// Set item
await window.FibrStorage.setStorageItem('theme', 'dark');

// Save content to gallery
await window.FibrStorage.saveContent('twitter', contentData);
```

### 4. UI Feedback

```javascript
// Show toast notification
window.FibrUI.showToast('✅ Success!', 2000);
window.FibrUI.showToast('❌ Error occurred', 3000);

// Escape HTML
const safe = window.FibrUI.escapeHtml(userInput);
```

### 5. Opening Modals

```javascript
// Tone selector
window.FibrToneSelector.show('twitter', pageContent, callback);

// Repost modal
await window.FibrRepostModal.showWithContentLoading(appInstance);

// Comments modal
await window.FibrCommentsModal.showWithContentLoading(appInstance);

// Thread generator
window.FibrThreadGenerator.showModal(appInstance);
```

---

## Module Availability Checks

Always check if a module exists before using it:

```javascript
// ✅ CORRECT - Check before use
if (window.FibrRepostModal?.showWithContentLoading) {
  await window.FibrRepostModal.showWithContentLoading(this);
} else {
  console.warn('Repost modal not available');
  this.showToast?.('❌ Feature unavailable', 3000);
}
```

```javascript
// ❌ WRONG - Will throw error if module not loaded
await window.FibrRepostModal.showWithContentLoading(this);
```

---

## Creating New Modules

When creating a new module, **always expose both names**:

```javascript
(function() {
  const MyNewModule = {
    myMethod: function() {
      // Your code here
    }
  };
  
  // ✅ CORRECT - Expose both names
  window.FibrMyNewModule = MyNewModule;
  window.TabTalkMyNewModule = MyNewModule; // Backward compatibility
})();
```

---

## Deprecation Timeline

| Phase | Status | Timeline |
|-------|--------|----------|
| Phase 1 | ✅ Complete | Oct 2025 |
| - Add Fibr aliases to all modules | ✅ | - |
| - Maintain TabTalk for compatibility | ✅ | - |
| Phase 2 | 🔄 In Progress | Nov 2025 |
| - Update all internal code to use Fibr | 🔄 | - |
| - Mark TabTalk as deprecated in docs | ⏳ | - |
| Phase 3 | ⏳ Planned | Dec 2025 |
| - Remove TabTalk aliases | ⏳ | - |
| - Final cleanup | ⏳ | - |

---

## Migration Checklist

When updating old code:

- [ ] Replace `TabTalk*` with `Fibr*` in function calls
- [ ] Update module checks (`window.TabTalk*` → `window.Fibr*`)
- [ ] Update comments and documentation
- [ ] Test thoroughly
- [ ] Check console for deprecation warnings

---

## FAQ

**Q: Why do we have both names?**  
A: Backward compatibility during the rebranding transition. Old code still works while we migrate.

**Q: Which name should I use in new code?**  
A: Always use `Fibr*` in new code. The `TabTalk*` names are legacy.

**Q: Will TabTalk names be removed?**  
A: Yes, eventually. But not until all code is migrated to Fibr names.

**Q: What if I see a module without a Fibr alias?**  
A: Report it! All modules should have both names now.

---

**Last Updated:** October 31, 2025  
**Maintained by:** Fibr Development Team
