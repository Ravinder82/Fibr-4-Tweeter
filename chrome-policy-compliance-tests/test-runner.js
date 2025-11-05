#!/usr/bin/env node

/**
 * Chrome Web Store Compliance Test Runner
 * 
 * Executes comprehensive compliance tests against Chrome extension codebase
 * Based on Chrome Web Store Developer Program Policies
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const TEST_RESULTS = {
  passed: [],
  failed: [],
  warnings: []
};

const SEVERITY = {
  CRITICAL: 'CRITICAL',
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW'
};

class ComplianceTester {
  constructor(extensionPath) {
    this.extensionPath = extensionPath;
    // Try multiple manifest locations
    const manifestPaths = [
      path.join(extensionPath, 'src', 'extension', 'manifest.json'),
      path.join(extensionPath, 'dist', 'extension', 'manifest.json'),
      path.join(extensionPath, 'manifest.json')
    ];
    
    this.manifestPath = manifestPaths.find(p => fs.existsSync(p)) || manifestPaths[0];
    this.srcPath = path.join(extensionPath, 'src', 'extension');
    this.distPath = path.join(extensionPath, 'dist', 'extension');
  }

  // ============================================================================
  // TEST 1: Manifest V3 Compliance
  // ============================================================================
  testManifestV3() {
    const testName = 'Manifest V3 Compliance';
    try {
      const manifest = JSON.parse(fs.readFileSync(this.manifestPath, 'utf8'));
      
      // Check manifest version
      if (manifest.manifest_version !== 3) {
        this.fail(testName, 'Manifest must be version 3', SEVERITY.CRITICAL, {
          found: manifest.manifest_version,
          required: 3
        });
        return;
      }

      // Check required fields
      const requiredFields = ['name', 'version', 'manifest_version'];
      const missingFields = requiredFields.filter(field => !manifest[field]);
      if (missingFields.length > 0) {
        this.fail(testName, `Missing required manifest fields: ${missingFields.join(', ')}`, SEVERITY.CRITICAL, {
          missing: missingFields
        });
        return;
      }

      // Check service worker configuration
      if (manifest.background && manifest.background.type === 'module') {
        this.fail(testName, 'Service worker cannot use ES modules (type: module)', SEVERITY.CRITICAL, {
          issue: 'ES modules not supported in service workers'
        });
        return;
      }

      // Check action field (required for MV3)
      if (!manifest.action && !manifest.browser_action) {
        this.fail(testName, 'Missing action or browser_action field', SEVERITY.HIGH, {
          note: 'MV3 requires action field'
        });
      }

      this.pass(testName, 'Manifest V3 compliant');
    } catch (error) {
      this.fail(testName, `Manifest parse error: ${error.message}`, SEVERITY.CRITICAL, {
        error: error.message
      });
    }
  }

  // ============================================================================
  // TEST 2: Remotely Hosted Code Prohibition
  // ============================================================================
  testRemotelyHostedCode() {
    const testName = 'Remotely Hosted Code Prohibition';
    const violations = [];

    // Patterns to detect remotely hosted code
    const dangerousPatterns = [
      {
        pattern: /createElement\s*\(\s*['"`]script['"`]\s*\)/gi,
        description: 'Dynamic script element creation'
      },
      {
        pattern: /importScripts\s*\(/gi,
        description: 'Dynamic script import'
      },
      {
        pattern: /\beval\s*\(/g,
        description: 'eval() usage'
      },
      {
        pattern: /new\s+Function\s*\(/g,
        description: 'new Function() usage'
      },
      {
        pattern: /document\.write\s*\(/g,
        description: 'document.write() usage'
      },
      {
        pattern: /innerHTML\s*=\s*['"`]<script/gi,
        description: 'Script injection via innerHTML'
      }
    ];

    const scanDirectory = (dir) => {
      if (!fs.existsSync(dir)) return;
      
      const files = fs.readdirSync(dir, { recursive: true });
      for (const file of files) {
        const filePath = path.join(dir, file);
        if (!fs.statSync(filePath).isFile()) continue;
        if (!['.js', '.html'].includes(path.extname(filePath))) continue;
        
        const content = fs.readFileSync(filePath, 'utf8');
        
        for (const { pattern, description } of dangerousPatterns) {
          const matches = content.match(pattern);
          if (matches) {
            // Check if it's in a comment or string literal
            const lines = content.split('\n');
            lines.forEach((line, idx) => {
              if (pattern.test(line)) {
                // Skip if in comment
                const trimmed = line.trim();
                if (trimmed.startsWith('//') || trimmed.startsWith('/*')) return;
                
                violations.push({
                  file: filePath,
                  line: idx + 1,
                  pattern: description,
                  snippet: line.trim().substring(0, 100)
                });
              }
            });
          }
        }
      }
    };

    scanDirectory(this.srcPath);
    scanDirectory(this.distPath);

    if (violations.length > 0) {
      this.fail(testName, `Found ${violations.length} remotely hosted code violations`, SEVERITY.CRITICAL, {
        violations: violations.slice(0, 10) // Limit to first 10
      });
    } else {
      this.pass(testName, 'No remotely hosted code detected');
    }
  }

  // ============================================================================
  // TEST 3: External Resource Loading
  // ============================================================================
  testExternalResources() {
    const testName = 'External Resource Loading';
    const violations = [];

    const allowedDomains = [
      'generativelanguage.googleapis.com',
      'aistudio.google.com',
      'chrome.google.com'
    ];

    const scanDirectory = (dir) => {
      if (!fs.existsSync(dir)) return;
      
      const files = fs.readdirSync(dir, { recursive: true });
      for (const file of files) {
        const filePath = path.join(dir, file);
        if (!fs.statSync(filePath).isFile()) continue;
        if (!['.js', '.html', '.css', '.json'].includes(path.extname(filePath))) continue;
        
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Match HTTP/HTTPS URLs
        const urlPattern = /https?:\/\/([^\s"'`<>]+)/gi;
        const matches = [...content.matchAll(urlPattern)];
        
        for (const match of matches) {
          const url = match[0];
          const domain = match[1].split('/')[0];
          
        // Skip if in comment
        const lineNum = content.substring(0, match.index).split('\n').length;
        const line = content.split('\n')[lineNum - 1];
        if (line.trim().startsWith('//') || line.trim().startsWith('/*')) continue;
        
        // Skip if in string literal but not actually loading code
        const isInString = line.includes('"') || line.includes("'") || line.includes('`');
        const isCommentString = /\/\/|<!--|#/.test(line.substring(0, match.index % line.length));
        if (isCommentString) continue;
        
        // Skip homepage_url and allowed documentation URLs
        if (line.includes('homepage_url') || line.includes('github.com') || line.includes('aistudio.google.com')) {
          continue;
        }
        
        // Check if domain is allowed
        const isAllowed = allowedDomains.some(allowed => domain.includes(allowed));
          
          if (!isAllowed && !domain.includes('localhost') && !domain.includes('127.0.0.1')) {
            violations.push({
              file: filePath,
              line: lineNum,
              url: url.substring(0, 100),
              domain
            });
          }
        }
      }
    };

    scanDirectory(this.srcPath);
    scanDirectory(this.distPath);

    // Check for CDN references
    const cdnPatterns = [
      /cdn\./i,
      /unpkg\.com/i,
      /jsdelivr\.net/i,
      /cdnjs\.cloudflare\.com/i
    ];

    const checkCDN = (dir) => {
      if (!fs.existsSync(dir)) return;
      const files = fs.readdirSync(dir, { recursive: true });
      for (const file of files) {
        const filePath = path.join(dir, file);
        if (!fs.statSync(filePath).isFile()) continue;
        const content = fs.readFileSync(filePath, 'utf8');
        for (const pattern of cdnPatterns) {
          if (pattern.test(content)) {
            violations.push({
              file: filePath,
              type: 'CDN reference',
              pattern: pattern.source
            });
          }
        }
      }
    };

    checkCDN(this.srcPath);
    checkCDN(this.distPath);

    if (violations.length > 0) {
      this.fail(testName, `Found ${violations.length} external resource violations`, SEVERITY.HIGH, {
        violations: violations.slice(0, 10)
      });
    } else {
      this.pass(testName, 'No external resource violations detected');
    }
  }

  // ============================================================================
  // TEST 4: Permission Usage Analysis
  // ============================================================================
  testPermissionUsage() {
    const testName = 'Permission Usage Analysis';
    try {
      const manifest = JSON.parse(fs.readFileSync(this.manifestPath, 'utf8'));
      
      const declaredPermissions = manifest.permissions || [];
      const declaredHostPermissions = manifest.host_permissions || [];
      
      // Check for overly broad permissions
      const broadPermissions = declaredPermissions.filter(p => 
        p === '<all_urls>' || p === '*://*/*' || p === 'http://*/*' || p === 'https://*/*'
      );
      
      if (broadPermissions.length > 0) {
        this.fail(testName, 'Overly broad permissions detected', SEVERITY.HIGH, {
          permissions: broadPermissions,
          recommendation: 'Use activeTab or specific host permissions'
        });
      }

      // Check if permissions are actually used
      const permissionUsage = {
        'activeTab': false,
        'tabs': false,
        'storage': false,
        'scripting': false
      };

      const scanCode = (dir) => {
        if (!fs.existsSync(dir)) return;
        const files = fs.readdirSync(dir, { recursive: true });
        for (const file of files) {
          const filePath = path.join(dir, file);
          if (!fs.statSync(filePath).isFile()) continue;
          if (!['.js'].includes(path.extname(filePath))) continue;
          const content = fs.readFileSync(filePath, 'utf8');
          
          if (content.includes('chrome.tabs')) permissionUsage.tabs = true;
          if (content.includes('chrome.storage')) permissionUsage.storage = true;
          if (content.includes('chrome.scripting')) permissionUsage.scripting = true;
          if (manifest.permissions?.includes('activeTab')) permissionUsage.activeTab = true;
        }
      };

      scanCode(this.srcPath);

      // Check for unused permissions
      const unusedPermissions = declaredPermissions.filter(p => {
        if (p === 'activeTab') return !permissionUsage.activeTab;
        if (p === 'tabs') return !permissionUsage.tabs;
        if (p === 'storage') return !permissionUsage.storage;
        if (p === 'scripting') return !permissionUsage.scripting;
        return false;
      });

      if (unusedPermissions.length > 0) {
        this.warn(testName, `Potentially unused permissions: ${unusedPermissions.join(', ')}`, {
          permissions: unusedPermissions,
          note: 'Review and remove if not needed'
        });
      }

      if (broadPermissions.length === 0) {
        this.pass(testName, 'Permissions are appropriately scoped');
      }
    } catch (error) {
      this.fail(testName, `Permission analysis error: ${error.message}`, SEVERITY.MEDIUM, {
        error: error.message
      });
    }
  }

  // ============================================================================
  // TEST 5: Privacy Policy Verification
  // ============================================================================
  testPrivacyPolicy() {
    const testName = 'Privacy Policy Verification';
    try {
      const manifest = JSON.parse(fs.readFileSync(this.manifestPath, 'utf8'));
      
      // Check for privacy_policy field
      if (!manifest.privacy_policy) {
        this.fail(testName, 'Missing privacy_policy field in manifest', SEVERITY.CRITICAL, {
          requirement: 'Extensions handling user data must include privacy_policy URL'
        });
        return;
      }

      // Check if privacy policy URL is valid
      const privacyUrl = manifest.privacy_policy;
      if (!privacyUrl.startsWith('http://') && !privacyUrl.startsWith('https://')) {
        this.fail(testName, 'Invalid privacy_policy URL format', SEVERITY.CRITICAL, {
          url: privacyUrl,
          requirement: 'Must be a valid HTTP/HTTPS URL'
        });
        return;
      }

      // Check if privacy policy content exists locally
      const localPrivacyPath = path.join(this.extensionPath, 'privacy-policy.html');
      if (!fs.existsSync(localPrivacyPath)) {
        this.warn(testName, 'No local privacy policy file found', {
          note: 'Ensure privacy policy is hosted and accessible'
        });
      }

      this.pass(testName, 'Privacy policy configured');
    } catch (error) {
      this.fail(testName, `Privacy policy check error: ${error.message}`, SEVERITY.CRITICAL, {
        error: error.message
      });
    }
  }

  // ============================================================================
  // TEST 6: API Key Security
  // ============================================================================
  testApiKeySecurity() {
    const testName = 'API Key Security';
    const violations = [];

    const scanCode = (dir) => {
      if (!fs.existsSync(dir)) return;
      const files = fs.readdirSync(dir, { recursive: true });
      for (const file of files) {
        const filePath = path.join(dir, file);
        if (!fs.statSync(filePath).isFile()) continue;
        if (!['.js'].includes(path.extname(filePath))) continue;
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Check for API key in code (should be in storage only)
        const apiKeyPatterns = [
          /AIza[0-9A-Za-z_-]{35}/g, // Google API key pattern
          /['"`]api[_-]?key['"`]\s*[:=]\s*['"`][^'"`]{20,}['"`]/gi,
          /['"`]apikey['"`]\s*[:=]\s*['"`][^'"`]{20,}['"`]/gi
        ];

        for (const pattern of apiKeyPatterns) {
          const matches = content.match(pattern);
          if (matches) {
            const lines = content.split('\n');
            lines.forEach((line, idx) => {
              if (pattern.test(line)) {
                const trimmed = line.trim();
                if (trimmed.startsWith('//') || trimmed.startsWith('/*')) return;
                violations.push({
                  file: filePath,
                  line: idx + 1,
                  snippet: line.trim().substring(0, 100)
                });
              }
            });
          }
        }

        // Check for API key transmission to unauthorized domains
        const fetchPattern = /fetch\s*\([^)]*['"`](https?:\/\/[^'"`]+)['"`]/gi;
        const fetchMatches = [...content.matchAll(fetchPattern)];
        for (const match of fetchMatches) {
          const url = match[1];
          if (!url.includes('generativelanguage.googleapis.com') && 
              !url.includes('googleapis.com')) {
            // Check if API key might be sent here
            const context = content.substring(Math.max(0, match.index - 200), match.index + 200);
            if (context.includes('apiKey') || context.includes('api_key')) {
              violations.push({
                file: filePath,
                type: 'Potential API key transmission to unauthorized domain',
                domain: url
              });
            }
          }
        }
      }
    };

    scanCode(this.srcPath);
    scanCode(this.distPath);

    if (violations.length > 0) {
      this.fail(testName, `Found ${violations.length} API key security violations`, SEVERITY.HIGH, {
        violations: violations.slice(0, 10)
      });
    } else {
      this.pass(testName, 'API key security checks passed');
    }
  }

  // ============================================================================
  // TEST 7: Code Obfuscation Check
  // ============================================================================
  testCodeObfuscation() {
    const testName = 'Code Obfuscation Check';
    const warnings = [];

    const scanCode = (dir) => {
      if (!fs.existsSync(dir)) return;
      const files = fs.readdirSync(dir, { recursive: true });
      for (const file of files) {
        const filePath = path.join(dir, file);
        if (!fs.statSync(filePath).isFile()) continue;
        if (!['.js'].includes(path.extname(filePath))) continue;
        
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Check for obfuscation indicators
        const obfuscationPatterns = [
          {
            pattern: /[a-zA-Z_$][a-zA-Z0-9_$]{0,2}\s*=\s*['"`]\\x[0-9a-fA-F]{2}/g,
            description: 'Hex-encoded strings'
          },
          {
            pattern: /['"`]\\u[0-9a-fA-F]{4}/g,
            description: 'Unicode-encoded strings'
          },
          {
            pattern: /\b[_$][a-zA-Z0-9_$]{1,3}\b/g,
            description: 'Single/double character variable names'
          },
          {
            pattern: /eval\s*\(|Function\s*\(|atob\s*\(|btoa\s*\(/g,
            description: 'Dynamic code execution'
          }
        ];

        // Skip if file is minified library or build output
        // Chrome Web Store accepts standard minification, we only check source code
        if (filePath.includes('.min.js') || 
            filePath.includes('node_modules') ||
            filePath.includes('dist/') ||
            filePath.includes('build/')) {
          continue;
        }

        for (const { pattern, description } of obfuscationPatterns) {
          const matches = content.match(pattern);
          if (matches && matches.length > 10) { // Threshold for warning
            warnings.push({
              file: filePath,
              pattern: description,
              occurrences: matches.length
            });
          }
        }
      }
    };

    scanCode(this.srcPath);
    scanCode(this.distPath);

    if (warnings.length > 0) {
      this.warn(testName, `Found ${warnings.length} potential obfuscation indicators`, {
        warnings: warnings.slice(0, 5),
        note: 'Review code for readability. Chrome Web Store may reject heavily obfuscated code.'
      });
    } else {
      this.pass(testName, 'No obfuscation detected');
    }
  }

  // ============================================================================
  // TEST 8: Content Security Policy
  // ============================================================================
  testContentSecurityPolicy() {
    const testName = 'Content Security Policy';
    try {
      const manifest = JSON.parse(fs.readFileSync(this.manifestPath, 'utf8'));
      
      if (!manifest.content_security_policy) {
        this.warn(testName, 'No explicit CSP defined', {
          note: 'Chrome will apply default CSP. Consider defining explicit CSP for security.'
        });
        return;
      }

      const csp = manifest.content_security_policy;
      const cspString = typeof csp === 'object' ? csp.extension_pages : csp;

      // Check for unsafe directives
      if (cspString.includes("'unsafe-eval'")) {
        this.fail(testName, "CSP contains 'unsafe-eval'", SEVERITY.HIGH, {
          issue: 'unsafe-eval is dangerous and may cause rejection',
          recommendation: 'Remove eval() usage and unsafe-eval directive'
        });
        return;
      }

      if (cspString.includes("'unsafe-inline'")) {
        this.warn(testName, "CSP contains 'unsafe-inline'", {
          issue: 'unsafe-inline reduces security',
          recommendation: 'Use nonces or hashes instead'
        });
      }

      this.pass(testName, 'CSP configured');
    } catch (error) {
      this.fail(testName, `CSP check error: ${error.message}`, SEVERITY.MEDIUM, {
        error: error.message
      });
    }
  }

  // ============================================================================
  // TEST 9: innerHTML Usage Analysis
  // ============================================================================
  testInnerHTMLUsage() {
    const testName = 'innerHTML Usage Analysis';
    const violations = [];

    const scanCode = (dir) => {
      if (!fs.existsSync(dir)) return;
      const files = fs.readdirSync(dir, { recursive: true });
      for (const file of files) {
        const filePath = path.join(dir, file);
        if (!fs.statSync(filePath).isFile()) continue;
        if (!['.js'].includes(path.extname(filePath))) continue;
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Find innerHTML usage
        const innerHTMLPattern = /\.innerHTML\s*=\s*['"`]([^'"`]*)['"`]/gi;
        const matches = [...content.matchAll(innerHTMLPattern)];
        
        for (const match of matches) {
          const value = match[1];
          // Check for script tags in innerHTML
          if (/<script/i.test(value)) {
            violations.push({
              file: filePath,
              line: content.substring(0, match.index).split('\n').length,
              issue: 'Script tag in innerHTML',
              snippet: value.substring(0, 100)
            });
          }
        }
      }
    };

    scanCode(this.srcPath);
    scanCode(this.distPath);

    if (violations.length > 0) {
      this.fail(testName, `Found ${violations.length} unsafe innerHTML usages`, SEVERITY.HIGH, {
        violations: violations.slice(0, 10),
        recommendation: 'Sanitize HTML content before setting innerHTML'
      });
    } else {
      this.pass(testName, 'innerHTML usage appears safe');
    }
  }

  // ============================================================================
  // TEST 10: Manifest Required Fields
  // ============================================================================
  testManifestRequiredFields() {
    const testName = 'Manifest Required Fields';
    try {
      const manifest = JSON.parse(fs.readFileSync(this.manifestPath, 'utf8'));
      
      const requiredFields = {
        name: 'string',
        version: 'string',
        manifest_version: 'number'
      };

      const missingFields = [];
      const invalidFields = [];

      for (const [field, type] of Object.entries(requiredFields)) {
        if (!manifest[field]) {
          missingFields.push(field);
        } else if (typeof manifest[field] !== type) {
          invalidFields.push({ field, expected: type, got: typeof manifest[field] });
        }
      }

      if (missingFields.length > 0) {
        this.fail(testName, `Missing required fields: ${missingFields.join(', ')}`, SEVERITY.CRITICAL, {
          missing: missingFields
        });
        return;
      }

      if (invalidFields.length > 0) {
        this.fail(testName, `Invalid field types`, SEVERITY.CRITICAL, {
          invalid: invalidFields
        });
        return;
      }

      // Check for recommended fields
      if (!manifest.description) {
        this.warn(testName, 'Missing description field', {
          note: 'Description helps users understand extension purpose'
        });
      }

      if (!manifest.icons || !manifest.icons['128']) {
        this.warn(testName, 'Missing or incomplete icons', {
          note: 'Icons required for Chrome Web Store listing'
        });
      }

      this.pass(testName, 'All required manifest fields present');
    } catch (error) {
      this.fail(testName, `Manifest validation error: ${error.message}`, SEVERITY.CRITICAL, {
        error: error.message
      });
    }
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================
  pass(testName, message) {
    TEST_RESULTS.passed.push({ test: testName, message });
    console.log(`✅ PASS: ${testName} - ${message}`);
  }

  fail(testName, message, severity, details = {}) {
    TEST_RESULTS.failed.push({ test: testName, message, severity, details });
    console.log(`❌ FAIL: ${testName} (${severity}) - ${message}`);
  }

  warn(testName, message, details = {}) {
    TEST_RESULTS.warnings.push({ test: testName, message, details });
    console.log(`⚠️  WARN: ${testName} - ${message}`);
  }

  // ============================================================================
  // Run All Tests
  // ============================================================================
  runAllTests() {
    console.log('\n🧪 Chrome Web Store Compliance Testing\n');
    console.log('='.repeat(60));
    
    this.testManifestV3();
    this.testRemotelyHostedCode();
    this.testExternalResources();
    this.testPermissionUsage();
    this.testPrivacyPolicy();
    this.testApiKeySecurity();
    this.testCodeObfuscation();
    this.testContentSecurityPolicy();
    this.testInnerHTMLUsage();
    this.testManifestRequiredFields();

    console.log('\n' + '='.repeat(60));
    console.log('\n📊 Test Summary:');
    console.log(`✅ Passed: ${TEST_RESULTS.passed.length}`);
    console.log(`❌ Failed: ${TEST_RESULTS.failed.length}`);
    console.log(`⚠️  Warnings: ${TEST_RESULTS.warnings.length}`);

    return TEST_RESULTS;
  }
}

// Run tests if executed directly
if (require.main === module) {
  const extensionPath = process.argv[2] || process.cwd();
  const tester = new ComplianceTester(extensionPath);
  const results = tester.runAllTests();
  
  // Write results to file
  const resultsPath = path.join(extensionPath, 'chrome-policy-compliance-tests', 'test-results.json');
  fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  
  // Exit with error code if critical failures
  const criticalFailures = results.failed.filter(f => f.severity === SEVERITY.CRITICAL);
  process.exit(criticalFailures.length > 0 ? 1 : 0);
}

module.exports = { ComplianceTester, TEST_RESULTS, SEVERITY };

