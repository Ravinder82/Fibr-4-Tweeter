---
description: Project/new_chat intialisation prompt.
auto_execution_mode: 3
---

# /Analyse - Master Initialization Prompt for Fibr Chrome Extension

I'm working on **Fibr** - an AI-powered Twitter/X Chrome extension that generates premium content using Google's Gemini API. Here are the key documents to help you understand the current state and context:

## START HERE (Current Status & Priorities):
@README.md - Complete project overview with features, architecture, and development workflow
@package.json - Dependencies, build scripts, and project configuration
@CHROME_STORE_COMPLIANCE_REPORT.md - Critical compliance fixes and Manifest V3 requirements
@prompts.md - Complete tone system and AI prompt engineering (11 tones, detailed instructions)

## Product Requirements (PRDs):
Main PRD (Vision): @README.md - Fibr transforms webpages into Twitter content with 11 AI tones
Community Features: @docs/RATE_LIMITING_SYSTEM.md - Multi-layer rate limiting and queue management
Support Features: @CHROME_STORE_COMPLIANCE_REPORT.md - Chrome Web Store compliance and security
Progress Features: @docs/development/ - Complete development history and implementation decisions

## Technical Specifications:
@src/extension/manifest.json - Manifest V3 configuration and permissions
@src/extension/popup.html - Glassmorphism UI structure
@src/extension/popup.js - Main application logic and quick actions
@src/extension/modules/ - Modular architecture (api.js, twitter.js, tone-selector.js, gallery.js, etc.)
@dist/extension/ - Production build files

## Critical Implementation Knowledge:
@docs/development/ENHANCED_TONE_SYSTEM.md - 11-tone system with custom mixing
@docs/development/TONE_SELECTOR_IMPLEMENTATION.md - Tone selection architecture
@docs/development/GALLERY_MODAL_COMPLETE_REBUILD.md - Rich gallery with virtual scrolling
@docs/development/REPHRASE_FINAL_POLISH.md - Expert Repurpose tone engineering
@docs/development/CONTENT_QUALITY_RESTORED.md - Content generation quality fixes
@docs/development/CRITICAL_FIXES_CONTENT_GENERATION.md - Content generation system
@docs/implementation/BULLETPROOF_THREAD_SYSTEM.md - Thread generation architecture
@docs/implementation/THREAD_GENERATOR_MVP.md - Custom topic thread creation

## Development Guidelines & Standards:
@docs/development/MODULE_NAMING_GUIDE.md - Consistent module naming conventions
@docs/development/DEVELOPMENT_JOURNEY.md - Project evolution and key decisions
@docs/development/PROMPT_ENGINEERING_FIX.md - AI prompt optimization strategies
@docs/development/UI_IMPROVEMENTS_VISUAL_GUIDE.md - Glassmorphism design system
@docs/development/BLACK_WHITE_THEME_GUIDE.md - Theme implementation details

## Memory & Context Archives:
- **Tone System Evolution**: Enhanced from 6 to 11 tones with custom mixing capability
- **Chrome Store Compliance**: Resolved Manifest V3 violations, eliminated dynamic script injection
- **Rate Limiting**: 4-layer defense system with ultra-conservative queuing (4 req/min, 15s spacing)
- **Content Quality**: Multi-layer prompt engineering with explicit prohibitions and self-check mechanisms
- **Architecture**: Modular design with separate modules for API, UI, Twitter, gallery, and navigation

## Your task is to review these documents and then help me with [current task].

---

## Key Context Points for Deep Analysis:

### Project Identity
- **Name**: Fibr (formerly TabTalk AI)
- **Purpose**: AI-powered Twitter/X content generator
- **Technology**: Chrome Extension (Manifest V3) + Google Gemini 2.0 Flash API
- **Architecture**: Vanilla JavaScript, modular design, glassmorphism UI

### Core Features
1. **5 Quick Actions**: Post, Repost, Comments, Thread, Create
2. **11 AI Tones**: 6 original post tones, 5 reply tones, custom mixing
3. **Rich Gallery**: Save/search/sort 50 items with virtual scrolling
4. **Rate Limiting**: 4-layer defense system prevents API errors
5. **Thread Generation**: From current page or custom topics with image prompts

### Critical Technical Constraints
- **Manifest V3 Compliance**: No dynamic script injection, static loading only
- **Rate Limits**: 15 requests/minute, 1500/day (Gemini API limits)
- **Chrome Store Ready**: 100% compliant, security audited
- **Performance**: Ultra-conservative queuing (4 req/min, 15s spacing)

### Development Workflow
```bash
npm run build:extension  # Build to dist/extension/
npm run dev:extension    # Development mode with watch
npm run package:extension # Create zip for Chrome Store
```

### Memory System Integration
This workflow maintains awareness of:
- Tone system evolution and prompt engineering fixes
- Chrome Store compliance journey and solutions
- Rate limiting implementation and optimization
- Content quality improvements and anti-pattern prevention
- Architecture decisions and modular design patterns

**Generation ID: ${Date.now()}**
