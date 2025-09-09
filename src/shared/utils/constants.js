// src/shared/utils/constants.js
// Shared constants used across the application

export const API_CONFIG = {
  MODEL: 'gemini-2.0-flash',
  BASE_URL: 'https://generativelanguage.googleapis.com/v1beta/models/',
  MAX_CHAR_COUNT: 2000
};

export const CONTENT_TYPES = {
  SUMMARY: 'summary',
  KEYPOINTS: 'keypoints',
  ANALYSIS: 'analysis',
  FAQ: 'faq',
  FACTCHECK: 'factcheck'
};

export const STORAGE_KEYS = {
  API_KEY: 'geminiApiKey',
  DARK_MODE: 'darkMode',
  CHAT_HISTORY: 'chatHistory',
  API_KEY_SET: 'apiKeySet'
};

export const MESSAGES = {
  INITIALIZING: 'Initializing...',
  LOADING_PAGE: 'Reading page...',
  SENDING_MESSAGE: 'Sending message...',
  DONE: '✅ Done',
  ERROR_PREFIX: '❌ '
};

export const SPECIAL_CONTENT_PROMPTS = {
  [CONTENT_TYPES.SUMMARY]: {
    system: "You are an expert content summarizer. Create a concise summary of the provided webpage content. Focus on the main points and key information. Keep it under 200 words.",
    user: "Please provide a summary of this webpage content:"
  },
  [CONTENT_TYPES.KEYPOINTS]: {
    system: "You are a key point extractor. Identify and list the most important points from the provided content. Number each point and keep them brief but informative. Limit to 5-7 key points.",
    user: "Please extract the key points from this content:"
  },
  [CONTENT_TYPES.ANALYSIS]: {
    system: "You are a content analyst. Provide a detailed analysis of the provided webpage content. Include main themes, important facts, potential implications, and your expert insights. Structure your response with clear headings.",
    user: "Please analyze this content in detail:"
  },
  [CONTENT_TYPES.FAQ]: {
    system: "You are a FAQ generator. Based on the provided content, create 5-8 frequently asked questions and their answers. Make the questions relevant to readers who want to understand the content better.",
    user: "Please generate a FAQ based on this content:"
  },
  [CONTENT_TYPES.FACTCHECK]: {
    system: "You are a fact-checker. Identify any claims, statistics, or statements in the provided content that could be verified. For each, indicate whether it can be confirmed, disputed, or is unverifiable, and explain why.",
    user: "Please fact-check this content:"
  }
};