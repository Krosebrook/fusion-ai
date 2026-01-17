# 🚀 BuildBuddy Investor Onboarding Wizard — Complete Documentation

---

## 📋 Overview

The **Onboarding Wizard** is a cinematic, step-by-step flow that captures investor preferences to personalize their dashboard, deal recommendations, and community experience. The wizard spans **5 main steps** with contextual help, conditional branching, validation, and a final review screen.

**Key Goals:**
- Educate users on platform benefits
- Capture actionable investment criteria
- Minimize friction (5-minute experience)
- Build a structured investor profile for personalization

---

## 🗺️ Wizard Flow Architecture

### **Step 0: Welcome (Greeting & Overview)**
**Purpose:** Orient users; set expectations  
**Component:** Custom HTML in `OnboardingWizard.jsx`  
**Key Elements:**
- Warm greeting ("Welcome to Your Investment Journey")
- Value prop (Personalized Deal Flow, Smart Networking, Portfolio Insights)
- Time estimate: "Takes ~5 minutes. Skip optional steps anytime."
- No data capture—intro only

---

### **Step 1: Deal Sourcing Criteria** ✅ REQUIRED
**Component:** `DealSourcingStep.jsx`

| Question | Type | UI Pattern | Help Tip |
|----------|------|-----------|----------|
| **Target Industries** | Multi-select | Button grid | "Select 3–5 industries where you have domain expertise. Our AI will surface deals in these verticals first." |
| **Investment Range** | Number inputs | Min/Max USD boxes | "Set your typical check size. We'll weight opportunities within this range higher." |
| **Deal Structures** | Multi-select | Button grid | "Mix of equity and debt helps diversify risk. Start with what you understand best." |
| **Deal Stages** | Multi-select | Button grid | "Seed: Early validation. Series A: Product-market fit. Series B+: Scaling." |
| **Geography** | Multi-select | Button grid | "Choose regions. Our network spans all continents." |
| **Risk Tolerance** | Radio | 3 option cards | Conservative → Moderate → Aggressive |

**Data Output:**
```json
{
  "target_industries": ["SaaS", "FinTech"],
  "investment_range": { "min_usd": 50000, "max_usd": 500000 },
  "preferred_structures": ["Equity", "SAFE"],
  "deal_stage_focus": ["Seed", "Series A"],
  "geography": ["North America"],
  "risk_tolerance": "moderate"
}
```

---

### **Step 2: Portfolio Goals** ✅ REQUIRED
**Component:** `PortfolioGoalsStep.jsx`

| Question | Type | UI Pattern | Help Tip |
|----------|------|-----------|----------|
| **Time Horizon** | Radio | 3 option cards | Short (1–3y) → Medium (3–7y) → Long (7+y) |
| **Target Return** | Slider | Interactive slider (5–50%) | "Average venture: 15–25% IRR. Real estate: 8–12%." |
| **Diversification** | Radio | 3 option cards | High (15+ positions) → Moderate (5–10) → Focused (1–4) |
| **Sector Priorities** | Text + % | 3 input rows | "Optional: e.g., 40% FinTech, 30% HealthTech, 30% Other" |
| **Asset Classes** | Multi-select | Button grid | Venture Capital, Private Equity, Real Estate, etc. |

---

### **Step 3: Community Preferences** ⚠️ OPTIONAL
**Component:** `CommunityPreferencesStep.jsx`

| Question | Type | UI Pattern | Defaults |
|----------|------|-----------|----------|
| **Peer Groups** | Multi-select | Button list | Angels, Institutional, Operators, SMEs, Professionals |
| **Engagement Mode** | Radio | 3 option cards | Networking / Knowledge-Sharing / Both |
| **Notification Freq** | Radio | 5 option buttons | **Weekly** |
| **Share Portfolio** | Toggle | Checkbox | **No** |
| **Share Insights** | Toggle | Checkbox | **No** |
| **Privacy Tier** | Radio | 3 option cards | **Community Only** |

---

### **Step 4: Review & Confirmation**
**Component:** `ReviewStep.jsx`

- Summary cards for all 3 sections
- Editable inline (link back to step)
- Final CTA: "Complete Setup ✨"
- Reassurance: "You can update anytime in Settings"

---

## ✅ Validation Rules

| Field | Requirement | Error Message |
|-------|-------------|---------------|
| Industries | ≥1 selected | "Select at least one industry" |
| Investment min | Must be number | "Enter minimum investment" |
| Investment min/max | min < max | "Min must be less than Max" |
| Risk tolerance | Required | "Choose a risk tolerance" |
| Time horizon | Required | "Select a time horizon" |
| Target return | 5–50% | "Return must be 5–50%" |

---

## 📊 Profile Completeness Score

```
Filled / Total × 100 = %
```

**Weights:**
- Deal Sourcing: 5 fields (50%)
- Portfolio Goals: 3 fields (30%)
- Community: 2 fields (20%)

Example: 7/10 fields = 70% complete

---

## 🎨 Design System

### **Color Coding:**
- Step 0–1: Purple (primary action)
- Step 2: Cyan (portfolio)
- Step 3: Indigo (community)
- Step 4: Mixed (review)

### **Progress Indicator:**
- Linear bar at top
- Step dots at bottom (clickable)
- "Step X of 5" text

### **Motion:**
- Page transitions: 0.3s fade-in-right
- Progress bar: smooth width animation
- Button hover: subtle scale + shadow

---

## 📝 Microcopy Examples

### **Friendly, Conversational Tone:**
- ✅ "Which sectors excite you?"
- ❌ "Select target industries"

- ✅ "When do you expect returns?"
- ❌ "Specify investment time horizon"

- ✅ "Spread or concentrated bets?"
- ❌ "Configure diversification preference"

---

## 🚀 Implementation Timeline

1. ✅ Entity schema (`InvestorProfile`)
2. ✅ Step components (4 + Review)
3. ✅ Main wizard orchestrator
4. ✅ Validation & persistence
5. 🔄 Analytics integration (GA4 event tracking)
6. 🔄 Email confirmation automation
7. 🔄 Dashboard redirects + personalization

---

## 📚 File Structure

```
components/
  onboarding/
    OnboardingWizard.jsx         ← Main orchestrator
    DealSourcingStep.jsx         ← Step 1
    PortfolioGoalsStep.jsx       ← Step 2
    CommunityPreferencesStep.jsx ← Step 3
    ReviewStep.jsx               ← Step 4
    ONBOARDING_DOCUMENTATION.md  ← This file

pages/
  Onboarding.js                  ← Page entry point

entities/
  InvestorProfile.json           ← Data schema
```

---

**Status:** ✅ Production-ready. Cinematic, validated, scalable.