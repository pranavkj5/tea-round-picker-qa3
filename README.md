# Tea Round Picker - QA Test Assessment

**Prepared by:** Pranav  


---

## Contents of This Submission

This submission contains my complete QA assessment for The Tea Round Picker application:

```
# Tea Round Picker QA - Playwright Test Suite

This repository contains the **QA and automation testing project** for the **Tea Round Picker** application.  
It demonstrates end-to-end testing using **Playwright with JavaScript**, simulating the Round Initiator and Team Member journeys.

---

## Test Automation Overview

**Tool:** [Playwright](https://playwright.dev)  
**Language:** JavaScript (Node.js)  
**Browsers Tested:** Chromium, Firefox, WebKit  
**Mock Server:** [WireMock](https://wiremock.org/) used for simulating backend APIs  

---

## Folder Structure
tea-round-picker-qa-assessment-pranav/
│
├── README.md # Project overview
├── Test_Strategy_Plan.md # Test strategy and scope
├── Test_Execution_Tracker.csv # Manual test tracking
├── Bug_Report_Template.md # Standardized bug report format
├── Tea_Round_Picker_API_Tests.postman_collection.json # Postman tests
└── playwright-tests/ #  Folder containing Playwright tests
├── tests/
│ └── mytest.spec.js
├── playwright.config.js
├── package.json
└── .gitignore
```

---

##Executive Summary

I've developed a **focused, risk-based testing strategy** for The Tea Round Picker application, concentrating on **5 critical test scenarios** that cover the highest-risk areas:

1. **Complete Happy Path** - Core user journey from start to finish
2. **Auto-Cancel Timing Logic** - Business-critical timing mechanisms (15-min window, 10-min deadline)
3. **Fairness of Random Selection** - Statistical validation to ensure unbiased tea-maker selection
4. **Authentication & Security** 
5. **Edge Cases & Error Handling** - Zero participants, late joiners, concurrent operations

### Why These 5 Scenarios?

They cover:
- Core functionality that must work for the app to have any value
- Business-critical logic (timing) that affects user trust
- Algorithm fairness that impacts adoption
- Security vulnerabilities that could be catastrophic
- Edge cases where users get frustrated

---


### For Reviewers

**Read this first:** `Test_Strategy_Plan.md` 
- Contains complete testing approach, all 5 scenarios in detail, risk assessment, and test results

**Then explore:**
- `Test_Execution_Tracker.csv` 
- `Bug_Report_Template.md` 
- `Tea_Round_Picker_API_Tests.postman_collection.json` - Import into Postman to run API tests
- `Presentation_Guide.md` 

### For Running Tests

See the **"How to Reproduce My Tests"** section in `Test_Strategy_Plan.md` for complete setup instructions.

---

## Key Findings Summary

If I had fully executed these tests, here's what I would expect:





### Testing Methods

| Testing Type | Method | Priority | Rationale |
|--------------|--------|----------|-----------|
| **Functional Testing** | Manual + Automated | HIGH | Core features must work |
| **Timing/Timeout Logic** | Automated | HIGH | Business-critical logic |
| **API Testing** | Automated (Postman) | HIGH | Backend reliability |
| **Security Testing** | Manual + OWASP ZAP | HIGH | Protect user data |
| **Fairness Analysis** | Automated Statistical | HIGH | User trust depends on it |
| **Cross-browser** | Manual | MEDIUM | User compatibility |

### Tools Used
- **Test Management:** Excel
- **API Testing:** Postman
- **UI Automation:** Playwright 
- **Security:** OWASP ZAP, manual testing
- **Statistical Analysis:** Custom scripts for fairness validation

---

## Document Descriptions

### Test_Strategy_Plan.md (Main Document)


Complete test strategy including:
- Testing scope and objectives
- 5 detailed test scenarios with specific test cases
- Risk assessment matrix
- 5-phase execution plan
- API testing approach
- Sample bug report
- Reproducibility instructions
- Test results summary
- Presentation tips

### Test_Execution_Tracker.csv

### Bug_Report_Template.md
Jira

### Tea_Round_Picker_API_Tests.postman_collection.json
Postman collection covering:
- Authentication endpoints (login, invalid credentials)
- Round management (create, retrieve, validation)
- Participant management (join, decline, late join)
- Selection trigger (valid, unauthorized, edge cases)
- History retrieval

**To use:**
1. Import into Postman
2. Set `base_url` variable
3. Run collection
4. Or use Newman for CI: `newman run Tea_Round_Picker_API_Tests.postman_collection.json`

##  How to Reproduce My Tests

### Prerequisites
```bash
- Docker Desktop
- Node.js 18+
- Git
- Postman (or Newman CLI)
- Modern browsers (Chrome, Firefox, Safari)
```

### Environment Setup

```bash
# 1. Clone and run application
git clone [tea-round-picker-repo-url]
cd tea-round-picker
npm install
docker-compose up -d

# 2. Database setup
npm run db:migrate
npm run seed:test-data

# 3. Verify app is running
curl http://localhost:3000/api/health
# Should return: {"status": "ok"}
```

### Test User Accounts
- **Initiators:** `initiator1@test.com` through `initiator3@test.com`
- **Members:** `member1@test.com` through `member15@test.com`
- **All passwords:** `password123`

### Running Manual Tests

1. Open browser to `http://localhost:3000`
2. Login with test credentials
3. Follow test steps in `Test_Strategy_Plan.md` Section 3
4. Record results in `Test_Execution_Tracker.csv`

**Mocking Time for Timing Tests:**
```javascript
// In browser console
const originalTime = Date.now();

// Fast-forward 15 minutes
Date.now = () => originalTime + (15 * 60 * 1000);

// Fast-forward 25 minutes
Date.now = () => originalTime + (25 * 60 * 1000);
```

### Running API Tests

```bash
# Using Postman GUI
1. Import Tea_Round_Picker_API_Tests.postman_collection.json
2. Set environment: base_url = http://localhost:3000
3. Run collection

# Using Newman CLI
newman run Tea_Round_Picker_API_Tests.postman_collection.json \
  --env-var "base_url=http://localhost:3000" \
  --reporters cli,json
```

### Running Automated Tests (if implemented)

```bash
# Run all tests
npm test

# Run specific scenario
npm test -- --grep "Scenario 2"

# Run with visible browser
npm test -- --headed

# Generate coverage report
npm test -- --coverage
```

---

## Test Coverage Analysis

| Area | Coverage | Status |
|------|----------|--------|

---

## Risk Assessment

### Highest Risk Areas

### Before Production Release



---


