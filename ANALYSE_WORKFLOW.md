# /Analyse - Universal Master Initialization Prompt

## 🚨 GLOBAL WORKFLOW RULES (APPLY TO ALL PROJECTS):

### Core Operating Principles:
- **DEEP CONTEXT ANALYSIS**: Always read all referenced documents before providing solutions
- **ATOMIC CHANGES**: Make minimal, focused changes. Prefer upstream fixes over downstream workarounds
- **VERIFICATION FIRST**: Use existing automated testing before manual verification
- **MEMORY INTEGRATION**: Maintain awareness of project evolution, decisions, and lessons learned
- **ROOT CAUSE FOCUS**: Identify and fix underlying issues, not just symptoms

### Quality Standards:
- **NO ASSUMPTIONS**: Verify file existence, structure, and context before making changes
- **MINIMAL DEPENDENCIES**: Never introduce new libraries without explicit user approval
- **SECURITY FIRST**: Never hardcode secrets, always use environment variables or secure storage
- **PERFORMANCE AWARE**: Consider impact on build size, load time, and runtime performance
- **ACCESSIBILITY**: Ensure changes maintain or improve accessibility standards

### Communication Protocol:
- **FACT-BASED RESPONSES**: Provide accurate, technical information without fluff
- **CITATION REQUIRED**: Reference specific files, functions, and line numbers when applicable
- **PROGRESS TRACKING**: Use todo lists for complex tasks with clear status updates
- **CLARITY FIRST**: Ask for clarification when requirements are ambiguous

### Development Best Practices:
- **FOLLOW PATTERNS**: Match existing code style, naming conventions, and architectural patterns
- **TEST DRIVEN**: Write or update tests when implementing new functionality
- **DOCUMENTATION**: Update README.md and relevant docs when changing functionality
- **BACKWARD COMPATIBLE**: Ensure changes don't break existing functionality unless explicitly requested

---

## PROJECT-SPECIFIC CONTEXT: Fibr Chrome Extension

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

## Your task is to:
1. **Review the Global Workflow Rules** above - these apply to ALL projects we work on
2. **Study the Fibr-specific context** in the sections below
3. **Help me with [current task]** following both global and project-specific guidelines

---

## 🎯 HOW TO USE THIS WORKFLOW:

### For Any Project:
1. Replace the "PROJECT-SPECIFIC CONTEXT" section with your project details
2. Update the @mentions to reference your project's key files
3. Keep the GLOBAL WORKFLOW RULES unchanged - they're universal

### For Fibr (Current Project):
Use the complete workflow as-is. All project-specific context, file references, and implementation patterns are already configured.

---

**Generation ID: ${Date.now()}**
