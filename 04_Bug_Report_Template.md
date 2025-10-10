

## Bug Report

**BUG ID:** TB-XXX  
**TITLE:** [Brief, descriptive title]

---

### Classification

**SEVERITY:** [Select one]
- [ ] CRITICAL (P1) - Complete failure, data loss, security breach
- [ ] HIGH (P2) - Major feature broken, difficult workaround
- [ ] MEDIUM (P3) - Feature partially working, reasonable workaround
- [ ] LOW (P4) - Cosmetic issue, easy workaround

**PRIORITY:** [Select one]
- [ ] P1 - Fix immediately, blocks release
- [ ] P2 - Fix before release
- [ ] P3 - Fix in next sprint
- [ ] P4 - Fix when time permits

**STATUS:** [Select one]
- [ ] New
- [ ] In Progress
- [ ] Fixed - Awaiting Verification
- [ ] Verified - Closed
- [ ] Won't Fix
- [ ] Duplicate

---

### Environment

**Browser:** []  
**Operating System:** []  
**Build/Version:** []  
**Date Found:** []  
**Tester:** []

---

### Description

[Clear, concise description of the bug]

---

### Steps to Reproduce

1. [First step]
2. [Second step]
3. [Third step]
4. ...

**Pre-conditions:**
- [Any setup required before executing steps]
- [e.g., "User must be logged in as Round Initiator"]

---

### Expected Result

[What should happen]

---

### Actual Result

[What actually happened]

---

### Evidence

**Screenshots:**
- [Attach or reference screenshot files]
- Screenshot 1: bug-tb-xxx-screen1.png
- Screenshot 2: bug-tb-xxx-screen2.png

**Console Errors:**
```
[Paste any browser console errors here]
```

**Network Logs:**
```
[Paste relevant network request/response if applicable]
```

**Video Recording:**
- [Link to screen recording if available]

---

### Impact Assessment

**Who is affected:**
- [ ] All users
- [ ] Round Initiators only
- [ ] Team Members only
- [ ] Specific user roles: ___________

**Frequency:**
- [ ] Always reproducible (100%)
- [ ] Frequently reproducible (>50%)
- [ ] Occasionally reproducible (<50%)
- [ ] Rare / Cannot consistently reproduce

**Workaround Available:**
- [ ] Yes (describe below)
- [ ] No

**Workaround Description:**
[If available, describe how users can work around this issue]

---

### Business Impact

[Describe how this bug affects business goals, user experience, or adoption]

Examples:
- "Users cannot complete tea rounds, core functionality broken"
- "Timing inaccuracy reduces user trust in the system"
- "Cosmetic issue, does not impact functionality"

---

### Root Cause (if known)

[Technical analysis of why this bug occurs]

Examples:
- "Timer uses setTimeout which drifts by ~2 seconds over 25 minutes"
- "Missing database transaction causes race condition"
- "CSS flex layout breaks below 768px viewport width"

---

### Suggested Fix

[Your recommendation ]

---

### Related Information

**Related Test Case:** []  
**Related Bugs:** []  
**Duplicate of:** [Bug ID if this is a duplicate]

---

### Developer Notes



---

### Verification Notes

**Verified By:** ___________  
**Verification Date:** ___________  
**Verification Build:** ___________  
**Status:** [ ] Verified - Pass | [ ] Verification Failed

---

## Example Bug Report

**BUG ID:** TB-001  
**TITLE:** Round auto-cancel triggers 2 seconds early at 24:58 instead of 25:00

---

### Classification

**SEVERITY:** HIGH (P2)  
**PRIORITY:** P2 - Fix before release  
**STATUS:** New

---

### Environment

**Browser:** Chrome 118.0.5993.88  
**Operating System:** macOS 14.0  
**Build/Version:** v1.2.3  
**Date Found:** 2025-10-10  
**Tester:** Pranav

---

### Description

The round auto-cancellation feature is triggering approximately 2 seconds early. Instead of cancelling at exactly T=25:00 (15 min participation window + 10 min initiation deadline), the system is cancelling at T=24:58.

---

### Steps to Reproduce

1. Login as Round Initiator (initiator1@test.com)
2. Create new round at exactly 10:00:00 AM (record exact time)
3. Invite 5 team members
4. Have 3 team members accept invitation
5. Wait for 15 minutes (participation window closes at 10:15:00)
6. Do NOT click "Choose" button
7. Observe round status at various times:
   - At 10:24:50 - Round still active ✓
   - At 10:24:58 - Round auto-cancelled ✗
   - Expected: 10:25:00

**Pre-conditions:**
- Clean database
- System time synchronized
- No other active rounds

---

### Expected Result

Round should auto-cancel at exactly T=25:00 (10:25:00 AM in this example). All participants should receive cancellation notification at 10:25:00.

---

### Actual Result

Round auto-cancelled at T=24:58 (10:24:58 AM). Cancellation occurred 2 seconds early. All participants received notification at 10:24:58.

---

### Evidence

**Screenshots:**
- Screenshot 1: Shows round created at 10:00:00
- Screenshot 2: Shows "Round Cancelled" message with timestamp 10:24:58

**Console Errors:**
```javascript


**Expected console output:**
```javascript


**Video Recording:**
- screencast-timing-bug.mp4 (uploaded to bug-reports folder)

---

### Impact Assessment

**Who is affected:** All users (Round Initiators and Team Members)

**Frequency:** Always reproducible (100%) - tested 5 times, all showed same ~2 second early cancellation

**Workaround Available:** No reliable workaround. Users lose 2 seconds of decision time.

---

### Business Impact

While only a 2-second discrepancy, this impacts:
1. **User trust** - If timing isn't accurate, users won't trust other features
2. **User experience** - Initiator might click "Choose" in that 2-second window and get an error
3. **Documentation** - We advertise "exactly 25 minutes" which is inaccurate

Not a blocker, but should be fixed before production release to maintain quality standards.

---

### Root Cause (if known)

Likely cause: JavaScript `setTimeout` function accumulates drift over long durations. After 25 minutes (1,500,000 ms), setTimeout can drift by 1-3 seconds due to:
- Event loop delays
- Browser tab throttling
- System resource contention

Current implementation probably uses:
```javascript
setTimeout(() => {
  cancelRound();
}, 25 * 60 * 1000);
```

---

### Suggested Fix

**Option 1:** Use interval checking with Date.now()
```javascript
const targetTime = Date.now() + (25 * 60 * 1000);
const interval = setInterval(() => {
  if (Date.now() >= targetTime) {
    cancelRound();
    clearInterval(interval);
  }
}, 1000); // Check every second
```

**Option 2:** Use server-side scheduling
- Store expected cancellation time in database
- Use cron job or task scheduler to check for expired rounds
- More reliable, not affected by client-side issues

**Recommendation:** Option 2 for production reliability

---

### Related Information

**Related Test Case:** TS2-TC4 (Verify auto-cancel at T=25 mins exactly)  
**Related Bugs:** None  
**Duplicate of:** N/A

---

### Developer Notes

[Space for dev team to add implementation notes]

---

### Verification Notes

[Will be filled out after fix is implemented]

**Verified By:** ___________  
**Verification Date:** ___________  
**Verification Build:** ___________  
**Status:** [ ] Verified - Pass | [ ] Verification Failed
