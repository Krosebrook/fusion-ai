# A/B Testing Deployment Pipeline — Complete Documentation

## Overview

The A/B Testing system enables seamless deployment of variant prompts, agents, and workflows with intelligent traffic splitting, real-time performance monitoring, and automatic winner promotion based on success criteria.

---

## Architecture

### Entity Models

**ABTestConfig** — Test metadata and configuration
- Test name, status (draft/active/completed/paused)
- Variant references (A=control, B=test)
- Traffic split config (percentage, canary, geographic, user segment)
- Success criteria with weighted metrics
- Auto-promotion rules (confidence level, min samples, delay)

**ABTestMetrics** — Per-variant performance data (5-min aggregations)
- Request counts, success/error rates
- Latency percentiles (p50, p95, p99)
- Cost per request, quality scores
- Composite scores based on success criteria
- Statistical significance (p-value, confidence intervals)

---

## Workflow

### 1. Create Test
```javascript
// Navigate to A/B Testing Manager → New A/B Test
const test = await base44.entities.ABTestConfig.create({
  name: "Prompt v2 vs Baseline",
  pipeline_id: "pipeline_xyz",
  variant_a_id: "deploy_abc",    // Control
  variant_b_id: "deploy_def",    // Test
  traffic_split: {
    variant_a_percentage: 90,
    variant_b_percentage: 10,
    split_strategy: "canary"
  },
  success_criteria: [
    { metric: "latency", operator: "lower_is_better", threshold: 150, weight: 2 },
    { metric: "success_rate", operator: "higher_is_better", threshold: 0.98, weight: 3 },
    { metric: "cost", operator: "lower_is_better", threshold: 0.02, weight: 1.5 },
    { metric: "quality_score", operator: "higher_is_better", threshold: 4.3, weight: 2 }
  ],
  auto_promote: {
    enabled: true,
    confidence_level: 0.95,    // 95% statistical confidence
    min_samples: 2000,         // Min requests before considering promotion
    promotion_delay_hours: 24  // Wait 24h after winning criteria met
  }
});
```

### 2. Traffic Split Strategies

**Percentage-Based** (Default)
- Simple 50/50 or custom distribution
- Best for: Quick validation, uniform rollout
- Example: Start 5% B, increase 10% daily

**Canary Release**
- Gradual rollout with automated safety gates
- Best for: Critical systems, high-stakes changes
- Example: 1% → 5% → 25% → 100%

**Geographic** (Beta)
- Route by user location
- Example: US/CA/MX get V2; EU/APAC get V1

**User Segment** (Beta)
- Target specific user groups
- Example: Premium users get V2, free get V1

### 3. Success Criteria
Define metrics determining the winner:

| Metric | Operator | Example | Weight | Use |
|--------|----------|---------|--------|-----|
| **Latency** | Lower Better | <100ms | 2x | Response time |
| **Success Rate** | Higher Better | >95% | 3x | Reliability |
| **Cost** | Lower Better | <$0.02 | 1.5x | Budget |
| **Quality Score** | Higher Better | >4.2/5 | 2x | Output quality |

**Weighting:** Primary metric gets 3x, secondary 2x, business metrics 1-1.5x

### 4. Configure Auto-Promotion
- **Confidence Level**: 80%, 90%, 95% (standard), or 99%
- **Min Samples**: Prevent premature promotion (1000-5000 typical)
- **Promotion Delay**: Wait 12-48 hours after winning (prevents winner's curse)

### 5. Monitor Performance
- **Real-time Charts**: Success rate, latency, cost trends
- **Timeline View**: Hourly evolution of metrics
- **Comparison Bar**: Side-by-side variant metrics
- **Statistical Badges**: Significance indicators

### 6. Automatic or Manual Promotion
**Auto-Promotion** when:
- All success criteria exceeded
- Confidence level reached (p < 0.05)
- Min samples threshold exceeded
- Promotion delay elapsed

**Manual Promotion**: Click "Promote Winner" to override

---

## Scoring Algorithm

### Composite Score Calculation

1. **Normalize each metric** (0-1 scale):
   ```
   if operator == "lower_is_better":
     normalized = max(0, (threshold - actual) / threshold)
   else:
     normalized = max(0, actual / threshold)
   ```

2. **Apply weights**:
   ```
   score = Σ(normalized_metric × weight) / Σ(weights)
   ```

3. **Winner determination**:
   ```
   winner = score_B > score_A ? "variant_b" : "variant_a"
   ```

### Example
```
Variant B vs Variant A:

Latency (weight: 2x):
  B: 92ms (threshold 150ms) → (150-92)/150 = 0.39 × 2 = 0.78
  A: 110ms → 0.27 × 2 = 0.53
  
Success Rate (weight: 3x):
  B: 98.5% (threshold 95%) → 0.985/0.95 = 1.0 × 3 = 3.0
  A: 97.2% → 0.97/0.95 = 1.0 × 3 = 3.0
  
Cost (weight: 1.5x):
  B: $0.015 (threshold $0.02) → (0.02-0.015)/0.02 = 0.25 × 1.5 = 0.375
  A: $0.018 → 0.1 × 1.5 = 0.15

Total Weight: 2 + 3 + 1.5 = 6.5

Variant B Score: (0.78 + 3.0 + 0.375) / 6.5 = 0.70
Variant A Score: (0.53 + 3.0 + 0.15) / 6.5 = 0.64

→ Variant B Wins (0.70 > 0.64)
```

---

## Statistical Significance

### P-Value Calculation (Two-Sample T-Test)
```
t = (mean_B - mean_A) / sqrt((var_A/n_A) + (var_B/n_B))
p_value = probability of observing this difference by chance
```

### Decision Rule
```
alpha = 1 - confidence_level
if p_value < alpha:
  "Statistically significant" → Can promote
else:
  "Not significant yet" → Continue test
```

### Confidence Levels
- **80%**: α=0.20, 1-in-5 chance wrong (experiments)
- **90%**: α=0.10, 1-in-10 chance wrong (rollouts)
- **95%**: α=0.05, 1-in-20 chance wrong (production, standard)
- **99%**: α=0.01, 1-in-100 chance wrong (critical systems)

### Min Sample Sizes
- **Small changes (<5% improvement)**: 5000+ samples
- **Medium changes (5-20%)**: 1000+ samples
- **Large changes (>20%)**: 300+ samples

---

## Real-World Example: Prompt Engineering

### Scenario
Testing new prompt template that should improve latency and quality

### Configuration
```
Name: Prompt v2 Validation
Variant A: Current production prompt (v1)
Variant B: New prompt with system context
Traffic: 50/50 split
Duration: 48 hours
Success Criteria:
  - Latency: <150ms (weight: 1.5x)
  - Quality: >4.2/5 (weight: 3x)
  - Success: >97% (weight: 2x)
Auto-Promote: Enabled (95% confidence, 2000 samples, 24h delay)
```

### Expected Results
After 48 hours:
- **V2 Latency**: 92ms vs 110ms (V1) ✅ Improvement
- **V2 Quality**: 4.45 vs 4.10 (V1) ✅ Improvement
- **V2 Success**: 98.2% vs 97.1% (V1) ✅ Improvement
- **Samples**: 5000+ requests per variant ✅
- **Significance**: p=0.008 < 0.05 ✅

**Result**: V2 automatically promoted to 100% production traffic

---

## Data Flow

```
Request → Check for Active Tests
         ↓
      Route to Variant A or B based on traffic split
         ↓
      Execute (measure latency, success, quality, cost)
         ↓
      Accumulate metrics (5-min buffer)
         ↓
      Flush to ABTestMetrics database
         ↓
      Calculate composite scores & statistics
         ↓
      Hourly auto-promotion check:
      - All criteria met? ✅
      - Min samples reached? ✅
      - Promotion delay elapsed? ✅
      - Statistical significance? ✅
         ↓
      If all pass → Promote winner to production
      Otherwise → Continue monitoring
```

---

## Best Practices

### Before Launch
- ✅ Verify both variant deployments are healthy
- ✅ Document expected improvement (e.g., "5-10% latency gain")
- ✅ Set realistic thresholds based on baseline metrics
- ✅ Have rollback plan if variant B fails
- ✅ Notify ops team to monitor dashboard

### During Test
- ✅ Check dashboard 2-3x daily first 48 hours
- ✅ Watch for unexpected patterns or anomalies
- ✅ Don't manually adjust traffic based on early results
- ✅ Pause immediately if error rate > 5%
- ✅ Keep variant A stable (don't change prod during test)

### After Test
- ✅ Review final metrics and confidence scores
- ✅ Document learnings in retrospective
- ✅ Keep test archived for future reference
- ✅ Share results with team
- ✅ Plan follow-up experiments

### Common Mistakes to Avoid
- ❌ Too small sample size → inconclusive results
- ❌ Adjusting traffic mid-test → corrupts statistics
- ❌ Ignoring secondary metrics → wins become losses
- ❌ Promoting too early → winner's curse effect
- ❌ Vague success criteria → no clear decision

---

## Traffic Routing Examples

### Percentage-Based Ramp
```
Day 1-2:  5% B, 95% A   (monitor for issues)
Day 3-4:  15% B, 85% A  (if healthy, increase)
Day 5-6:  50% B, 50% A  (full split)
Day 7:    100% B        (promote winner if passing)
```

### Canary Release
```
Stage 1 (0-1h):  1% traffic, <100 requests, <1% error
Stage 2 (1-4h):  5% traffic, validate latency/quality
Stage 3 (4-24h): 25% traffic, full metrics evaluation
Stage 4 (24h+):  100% traffic or rollback
```

### Geographic Split (Beta)
```
US/CA/MX → Variant B (new)
EU/UK/APAC → Variant A (stable)
Monitor: Regional latency, quality differences
Decision: If B performs better in US, roll out globally
```

---

## Troubleshooting

| Problem | Cause | Solution |
|---------|-------|----------|
| No clear winner | Similar performance | Extend test 48-72h or adjust thresholds |
| B performs worse | Bug, regression, or issue | Pause test, investigate, rollback |
| High error rate on B | Deployment failure | Check logs, revert B, redeploy |
| Inconclusive results | Insufficient samples | Extend test duration or increase traffic % |
| Auto-promotion stuck | Thresholds too high | Review success criteria vs metrics |

---

## API Reference

### Create Test
```javascript
await base44.entities.ABTestConfig.create({
  name: string,
  pipeline_id: string,
  variant_a_id: string,
  variant_b_id: string,
  traffic_split: { ... },
  success_criteria: [ ... ],
  auto_promote: { ... }
});
```

### Update Traffic Split
```javascript
await base44.entities.ABTestConfig.update(testId, {
  traffic_split: {
    variant_a_percentage: 50,
    variant_b_percentage: 50,
    split_strategy: "percentage"
  }
});
```

### Fetch Metrics
```javascript
const metrics = await base44.entities.ABTestMetrics.filter({
  test_id: testId,
  variant: "variant_b"
}, '-timestamp', 100);
```

### Promote Winner
```javascript
const result = await base44.functions.invoke('promoteABTestWinner', {
  testId: testId,
  winner: "variant_b"
});
```

---

## Components

### VariantMonitor
Real-time metrics visualization:
- Success rate timeline chart
- Latency distribution (p50, p95, p99)
- Cost comparison
- Request counts
- Winner badge (when determined)

### TrafficSplitter
Interactive traffic distribution control:
- Slider for percentage adjustment
- Visual bar showing distribution
- Strategy selector
- Auto-save on change

### SuccessCriteriaConfig
Define success metrics:
- Metric type selector
- Operator (lower/higher is better)
- Threshold input
- Weight slider (1-5x importance)
- Add/remove criteria

### AutoPromotionPanel
Configure automatic promotion:
- Enable/disable toggle
- Confidence level slider (0.80-0.99)
- Min samples input
- Promotion delay input
- Settings summary display

---

## Monitoring & Alerts

### Key Metrics to Watch
- Success rate (target: >97%)
- P99 latency (target: <200ms)
- Error rate (alert if >5%)
- Cost per request (target: stable)
- Quality score (target: improving)

### Alert Conditions
- Success rate drops below 90%
- Error count >5 consecutive minutes
- Cost increase >50%
- P99 latency >500ms
- Quality score regression >5%

---

## Security & Compliance

- ✅ Only test creator/admin can pause/resume
- ✅ Only admin can force promotion
- ✅ Immutable metrics (audit trail)
- ✅ No PII in metrics
- ✅ GDPR: Delete on request
- ✅ SOC2: Encrypted at rest

---

## Summary

The A/B Testing system provides a **production-ready** framework for safely deploying and validating variants with:

1. **Intelligent traffic routing** (percentage, canary, geographic, segment)
2. **Multi-metric success criteria** with weighted scoring
3. **Statistical significance testing** (p-value, confidence intervals)
4. **Automatic winner promotion** with safety gates
5. **Real-time monitoring** with actionable alerts
6. **Audit trail** for compliance and debugging

Use it to **optimize prompts, agents, and workflows** with confidence.

---

**Related:**
- [AB_TEST_MANAGER Component](../pages/ABTestManager.jsx)
- [ABTEST_CONFIG Entity](../entities/ABTestConfig.json)
- [ABTEST_METRICS Entity](../entities/ABTestMetrics.json)
- [PROMOTE_WINNER Function](../functions/promoteABTestWinner.js)