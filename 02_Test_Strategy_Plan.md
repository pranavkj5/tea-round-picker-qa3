# Tea Round Picker - QA Test Strategy & Assessment
**Prepared by:** Pranav  
**Date:** October 10, 2025  
**Version:** 1.0

---

## Executive Summary

This document outlines a focused, practical testing approach for The Tea Round Picker application. Given real-world time constraints, I've prioritized testing the highest-risk areas that directly impact user experience and business value.

Key Focus Areas:
- Critical user journeys (both Round Initiator and Team Members)
- Timing mechanisms (the core business logic)
- Random selection fairness
- Authentication security
- Data integrity

**Testing Approach:** 
Mix of manual exploratory testing for user journeys and automated testing for regression and timing-critical features.

---

## 1. Testing Scope

### What I'm Testing (In Scope)
Complete Round Initiator and Team Member user journeys  
Timing windows (15-min participation, 10-min initiation deadline)  
Random selection algorithm fairness  
SSO authentication and authorization  
Data persistence and history features  
Core API endpoints  
Basic security (XSS, CSRF, SQL injection)  
Critical cross-browser compatibility (Chrome, Firefox, Safari)


---

## 2. Test Strategy

### Testing Approach

| Testing Type | Method | Priority | Why |
|--------------|--------|----------|-----|
| **Functional Testing** | Manual + Automated | HIGH | Core features must work |
| **Timing/Timeout Logic** | Automated | HIGH | Business-critical logic |
| **API Testing** | Automated (Postman) | HIGH | Backend reliability |
| **Security Testing** | Manual + OWASP ZAP | HIGH | Protect user data |
| **Cross-browser** | Manual | MEDIUM | User compatibility |

### Tools I'd Use
- **Test Management:** Excel
- **API Testing:** Postman + Newman (for CI automation)
- **UI Automation:** Playwright (modern, reliable)
- **Security:**  manual review
- **Bug Tracking:** Jira
- **CI Integration:** GitHub Actions

---

## 3. Critical Test Scenarios (Top 5)

I've identified the 5 most critical test scenarios that cover the highest-risk areas:

### Test Scenario 1: Complete Happy Path Round
**Priority:** CRITICAL | **Risk:** High impact if broken

**Test Steps:**
1. Round Initiator logs in via SSO
2. Creates new round, invites 5 team members
3. 3 team members accept, 2 don't respond
4. Wait 15 minutes
5. Initiator clicks "Choose"
6. Verify one of the 3 participants is randomly selected
7. Verify all participants receive correct notifications
8. Check history records the round correctly

**Expected Results:**
- Round completes successfully
- Only accepting participants eligible for selection
- Correct notifications sent to all parties
- History shows accurate data

**Why Critical:** This is the core use case. If this fails, the app has no value.

---

### Test Scenario 2: Auto-Cancel Timing Logic
**Priority:** CRITICAL | **Risk:** Business logic failure

**Test Steps:**
1. Round Initiator creates round at T=0
2. Team members join within 15 minutes
3. Initiator reviews participants at T=15 mins
4. Initiator does NOT click "Choose"
5. Wait until T=25 mins (15 min window + 10 min deadline)
6. Verify round auto-cancels exactly at 25 minutes
7. Verify all participants notified of cancellation

**Edge Cases to Test:**
- Initiator tries to choose at T=25:01 (should fail)
- Round auto-cancels while initiator is clicking "Choose" (race condition)
- Multiple rounds at different stages simultaneously

**Expected Results:**
- Round auto-cancels at exactly T=25 mins
- "Choose" button disabled after deadline
- Clear notification sent to all

**Why Critical:** Timing is core business logic. Wrong timing = broken feature + confused users.

---

### Test Scenario 3: Fairness of Random Selection
**Priority:** HIGH | **Risk:** User trust and adoption

**Test Approach:**
Run statistical analysis over multiple rounds to ensure no bias.

**Test Steps:**
1. Create automated test to run 100 rounds
2. Use same 10 participants for all rounds
3. Record who gets selected each time
4. Calculate selection frequency per participant
5. Analyze distribution

**Expected Results:**
- Each participant selected approximately 10 times (±20% acceptable variance)
- No single participant selected >15 times or <5 times
- Distribution follows random pattern (chi-square test)

**Statistical Formula:**
```
Expected: 100 rounds ÷ 10 participants = 10 selections each
Acceptable range: 8-12 selections per participant
Chi-square test: p-value > 0.05 indicates randomness
```

**Why Critical:** If selection appears biased, users won't trust or use the tool. This directly impacts adoption.

---

### Test Scenario 4: Authentication & Authorization
**Priority:** CRITICAL | **Risk:** Security breach

**Test Cases:**

**4a. SSO Integration**
- Valid SSO login → Successfully authenticated
- Invalid credentials → Access denied
- Session timeout → Requires re-authentication
- SSO service unavailable → Graceful error message

**4b. Authorization**
- User A cannot access User B's team rounds
- Non-participant cannot view round details
- Only Round Initiator can click "Choose" button
- Cannot join rounds without authentication

**4c. Security Vulnerabilities**
- Test JWT manipulation: Modify token, should be rejected

**Expected Results:**
- All security tests should fail gracefully
- No unauthorized access granted
- User data properly escaped/sanitized
- HTTPS enforced for all connections

**Why Critical:** Security breach would be catastrophic for user trust and company reputation.

---

### Test Scenario 5: Edge Cases & Error Handling
**Priority:** HIGH | **Risk:** Poor user experience

**Critical Edge Cases:**

**5a. Zero Participants**
- Round initiated but everyone declined
- Expected: Error message, "Choose" disabled or appropriate handling

**5b. Only One Participant (The Initiator)**
- Initiator participates but no one else joins
- Expected: Initiator selected by default OR error requiring minimum 2 people

**5c. Late Joiners**
- User tries to accept invitation at T=16 mins (after 15-min window)
- Expected: Cannot join, clear error message shown

**5d. Concurrent Operations**
- Two initiators create rounds simultaneously
- Same user invited to multiple rounds
- Expected: No data conflicts, each round independent

**5e. Container/Service Restart**
- Application restarts during active round (T=10 mins)
- Expected: Round state persists OR users notified of issue

**5f. Notification Failures**
- Selected tea-maker offline when chosen
- Expected: Notification queued/retried OR logged for follow-up

**Expected Results:**
- Graceful error messages (user-friendly language)
- No data loss or corruption
- System remains stable
- Clear guidance for users on what to do next

**Why Critical:** Edge cases are where users get frustrated. Good error handling = professional app.

---

## 4. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Timing logic fails** | Medium | HIGH | Extensive automated timing tests, monitoring |
| **Biased random selection** | Low | HIGH | Statistical analysis over 100+ rounds |
| **Race conditions** | Medium | Medium | Concurrency testing, database locking |
| **SSO integration breaks** | Low | HIGH | Mock SSO for testing, fallback handling |
| **Data loss on restart** | Low | HIGH | Test persistence, transaction handling |
| **Zero participants** | High | Low | Clear error handling, UI validation |

**Highest Risk Areas:**
1. Timing mechanisms (auto-cancel, 15-min window)
2. Random selection fairness
3. Authentication security

---

## 5. API Testing Approach

### Core Endpoints to Test

**1. Create Round**
```
POST /api/rounds
Body: {
  "initiatorId": "user123",
  "invitedMembers": ["user456", "user789"]
}

Test Cases:
Valid request → 201 Created
Missing initiatorId → 400 Bad Request
Duplicate active round → 409 Conflict
Unauthorized user → 401 Unauthorized
```

**2. Join Round**
```
POST /api/rounds/{id}/participants
Body: {
  "userId": "user456",
  "status": "accepted"
}

Test Cases:
Within 15-min window → 200 OK
After 15 minutes → 400 Bad Request
Already joined → 200 OK (idempotent)
Invalid round ID → 404 Not Found
```

**3. Trigger Selection**
```
POST /api/rounds/{id}/choose

Test Cases:
Valid request by initiator → 200 OK + selected user ID
Before 15 minutes → 400 Bad Request
After 25 minutes → 400 Bad Request (expired)
Non-initiator attempts → 403 Forbidden
Zero participants → 400 Bad Request
```

**4. Get History**
```
GET /api/rounds/history

Test Cases:
Returns user's round history
Pagination works correctly
Filters by date range
Unauthorized → 401
```

### Postman Collection
I would create a Postman collection with:
- Pre-request scripts for authentication
- Environment variables for test data
- Automated assertions for response validation
- Newman integration for CI/CD pipeline

---

## 6. Test Execution Plan

### Phase 1: Smoke Testing (2 hours)
**Goal:** Verify app is testable

- Can login via SSO 
- Can create a round 
- Can accept invitation 
- Can trigger selection 
- Can view history 

**Exit Criteria:** All smoke tests pass, no blockers

---

### Phase 2: Critical Scenarios (1 day)
**Goal:** Execute the 5 critical test scenarios

- Complete happy path (Scenario 1)
- Timing logic tests (Scenario 2)
- Begin fairness analysis (Scenario 3)
- Security testing (Scenario 4)
- Edge case testing (Scenario 5)

**Exit Criteria:** 90%+ pass rate on critical tests

---

### Phase 3: API & Integration (4 hours)
**Goal:** Validate backend reliability

- Run Postman collection for all endpoints
- Test concurrent operations
- Verify data persistence
- Check error handling

**Exit Criteria:** All API tests pass, no data integrity issues

---

### Phase 4: Cross-Browser & Regression (4 hours)
**Goal:** Ensure compatibility

- Test happy path in Chrome, Firefox, Safari
- Re-test any fixed bugs
- Document browser-specific issues

**Exit Criteria:** Core functionality works in all browsers

---

### Phase 5: Documentation & Reporting (2 hours)
**Goal:** Deliver results

- Compile test results
- Document bugs found
- Write recommendations
- Prepare presentation

---

## 7. Sample Bug Report

```
BUG ID: TB-001
TITLE: Round auto-cancel triggers 2 seconds early at 24:58 instead of 25:00

SEVERITY: HIGH
PRIORITY: P2

ENVIRONMENT:
- Browser: Chrome 118.0
- OS: macOS 14.0
- Build: v1.2.3
- Date: 2025-10-10

STEPS TO REPRODUCE:
1. Login as Round Initiator
2. Create new round at T=0 (10:00:00 AM)
3. Invite 5 team members, all accept
4. Wait 15 minutes for review period
5. Do NOT click "Choose" button
6. Observe round status at T=24:58

EXPECTED RESULT:
Round should auto-cancel at exactly T=25:00 (10:25:00 AM)

ACTUAL RESULT:
Round auto-cancelled at T=24:58 (10:24:58 AM)
Notification sent 2 seconds early

EVIDENCE:
- Screenshot: bug-tb001-timestamp.png
- Console log shows: "Round cancelled at 10:24:58.142"
- Expected: "10:25:00.000"

IMPACT:
Users lose 2 seconds of decision time. Not critical but affects 
user trust in timing accuracy. May cause confusion if initiator 
clicks "Choose" in that 2-second window.

SUGGESTED FIX:
Review timer implementation, likely setTimeout drift issue.
Consider using more precise timing mechanism.

WORKAROUND:
None currently. Users should be aware of ~2 second margin.
```

---

## 8. How Someone Else Can Reproduce My Tests

### Prerequisites
```bash
- Docker Desktop installed
- Node.js 18+ 
- Git
- Postman (for API tests)
- Chrome, Firefox, Safari browsers
```

### Setup Steps

**1. Clone and Run Application**
```bash
git clone [repository-url]
cd tea-round-picker
npm install
docker-compose up -d
npm run db:migrate
npm run seed:test-data
```

**2. Access Application**
- Open browser to `http://localhost:3000`
- You should see SSO login page

**3. Test User Accounts**
Use these pre-seeded accounts:
- Initiator: `initiator1@test.com` / `password123`
- Members: `member1@test.com` through `member5@test.com` / `password123`

### Running Manual Tests

**For Scenario 1 (Happy Path):**

1. Open Chrome browser
2. Navigate to `http://localhost:3000`
3. Login as `initiator1@test.com`
4. Click "Start New Round"
5. Select members 1-5, click "Invite"
6. Open 3 incognito windows
7. Login as member1, member2, member3
8. Click "Accept" in each
9. Wait 15 minutes (or mock time - see below)
10. Back to initiator window, click "Choose"
11. Verify selection appears
12. Check each member window for notifications

**Mocking Time (for faster testing):**
```javascript
// In browser console:
// Fast-forward 15 minutes
Date.now = () => originalTime + (15 * 60 * 1000);
```

### Running API Tests

**1. Import Postman Collection**
- File included: `Tea_Round_Picker_API_Tests.postman_collection.json`
- Import into Postman
- Set environment variable `base_url` = `http://localhost:3000`

**2. Run Collection**
- Click "Run Collection"
- Verify all tests pass
- Check test results tab

**3. Automated API Testing**
```bash
# Using Newman (Postman CLI)
newman run Tea_Round_Picker_API_Tests.postman_collection.json \
  --environment test-env.json \
  --reporters cli,json
```

### Running Automated Tests

```bash
# Run all automated tests
npm test

# Run specific scenario
npm test -- --grep "Scenario 2"

# Run with headed browser (see what's happening)
npm test -- --headed

# Generate coverage report
npm test -- --coverage
```

### Test Data Reset
```bash
# Reset database to clean state
npm run db:reset
npm run seed:test-data
