# Chrome Policy Compliance Testing Framework

## Overview

This framework provides comprehensive Chrome Web Store compliance testing based on official Developer Program Policies, security requirements, and review process guidelines.

## Quick Start

### Run Compliance Tests

```bash
node chrome-policy-compliance-tests/test-runner.js
```

### Run Tests with Custom Path

```bash
node chrome-policy-compliance-tests/test-runner.js /path/to/extension
```

## Test Categories

### 1. Manifest V3 Compliance
- Verifies manifest version 3
- Checks required fields
- Validates service worker configuration

### 2. Remotely Hosted Code Prohibition
- Scans for dynamic script injection
- Detects `eval()`, `new Function()`, `importScripts()`
- Checks for script element creation

### 3. External Resource Loading
- Identifies external URLs
- Detects CDN references
- Validates allowed domains

### 4. Permission Usage Analysis
- Verifies minimal permissions
- Checks for overly broad permissions
- Validates permission justification

### 5. Privacy Policy Verification
- Checks for `privacy_policy` field
- Validates privacy policy URL format
- Verifies privacy policy accessibility

### 6. API Key Security
- Scans for hardcoded API keys
- Verifies secure storage methods
- Checks API key transmission security

### 7. Code Obfuscation Check
- Detects obfuscation patterns
- Verifies code readability
- Flags suspicious patterns

### 8. Content Security Policy
- Checks for CSP configuration
- Validates CSP directives
- Detects unsafe patterns

### 9. innerHTML Usage Analysis
- Scans for unsafe innerHTML usage
- Detects script injection risks
- Validates HTML sanitization

### 10. Manifest Required Fields
- Verifies required fields presence
- Validates field types
- Checks recommended fields

## Test Results

Results are saved to `chrome-policy-compliance-tests/test-results.json` after execution.

### Result Format

```json
{
  "passed": [
    {
      "test": "Test Name",
      "message": "Success message"
    }
  ],
  "failed": [
    {
      "test": "Test Name",
      "message": "Failure message",
      "severity": "CRITICAL|HIGH|MEDIUM|LOW",
      "details": {}
    }
  ],
  "warnings": [
    {
      "test": "Test Name",
      "message": "Warning message",
      "details": {}
    }
  ]
}
```

## Severity Levels

- **CRITICAL:** Immediate rejection, must fix before resubmission
- **HIGH:** Extended review, likely rejection, fix immediately
- **MEDIUM:** May cause rejection, fix before submission
- **LOW:** Warning, fix in next version

## Integration

### CI/CD Integration

```bash
# Exit code 1 if critical failures
node chrome-policy-compliance-tests/test-runner.js
```

### NPM Script

Add to `package.json`:

```json
{
  "scripts": {
    "test:compliance": "node chrome-policy-compliance-tests/test-runner.js"
  }
}
```

## Remediation

See `COMPLIANCE_REPORT.md` for detailed remediation steps for each test failure.

## Framework Documentation

- `compliance-framework.md` - Detailed framework documentation
- `COMPLIANCE_REPORT.md` - Current extension compliance report
- `test-runner.js` - Test execution engine

## Contributing

To add new tests:

1. Add test method to `ComplianceTester` class
2. Call test method in `runAllTests()`
3. Use `pass()`, `fail()`, or `warn()` methods
4. Document test in `compliance-framework.md`

## License

Same as main project.

