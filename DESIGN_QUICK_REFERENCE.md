# 🎯 JobTracker - Design Quick Reference

## Color Scheme
```
Primary Gradient: #667eea → #764ba2 (Purple)
Applied Status:   #667eea (Blue)
Interview Status: #f5a623 (Orange)
Offer Status:     #27ae60 (Green)
Rejected Status:  #e74c3c (Red)
Background:       #f8f9fa (Light Gray)
Text:             #000 / #333 (Dark)
Borders:          #e0e0e0 (Light Gray)
```

## Pages Structure

### 🏠 HOME PAGE (/)
```
┌─────────────────────────────────────┐
│         HERO SECTION                │
│  Purple Gradient Background         │
│  Headline + Subheading              │
│  📊 + "Get Started Free" CTA         │
│  Job App Mockup Card                │
└─────────────────────────────────────┘
        ↓
┌─────────────────────────────────────┐
│      STATS SECTION                  │
│  10K+ Users | 50K+ Jobs | 15K+ Offers│
└─────────────────────────────────────┘
        ↓
┌─────────────────────────────────────┐
│    FEATURES SECTION (6 cards)       │
│  📋 📊 💼 ⚡ 📝 🎯                   │
│  Hover effects, cards lift up       │
└─────────────────────────────────────┘
        ↓
┌─────────────────────────────────────┐
│   HOW IT WORKS (4 steps)            │
│  1️⃣ 2️⃣ 3️⃣ 4️⃣                        │
└─────────────────────────────────────┘
        ↓
┌─────────────────────────────────────┐
│     CTA SECTION (Call to Action)    │
│  "Ready to Organize?" + Button      │
└─────────────────────────────────────┘
```

### 📊 DASHBOARD PAGE (/dashboard)
```
┌──────────────────────────────────────────────┐
│  Header: "📊 Job Application Dashboard"      │
│  + "Add New Application" Button              │
└──────────────────────────────────────────────┘
        ↓
┌──────────┬──────────┬──────────┬──────────┐
│ 📋 Total │ 🚀 Success│ 💬 Interview│✨ Offers│
│   Apps   │   Rate   │  Count   │  Count   │
└──────────┴──────────┴──────────┴──────────┘
        ↓
┌─────────────────┬──────────────────┐
│ Status          │ Key              │
│ Distribution    │ Insights         │
│ Chart           │ Metrics          │
└─────────────────┴──────────────────┘
        ↓
┌──────────────────────────────────────────────┐
│ All Applications ({count})                   │
├──────────────────────────────────────────────┤
│ ┌─ Job Card #1 (Click to expand)           │
│ │ • Company Name | Position                 │
│ │ • Applied Date | Status Badge | Salary   │
│ │ • [On Click] Edit | Note | View | Delete │
│ └──────────────────────────────────────────│
│ ┌─ Job Card #2 (...)                       │
│ │ ...                                       │
│ └──────────────────────────────────────────│
└──────────────────────────────────────────────┘
```

### 📝 ADD JOB MODAL
```
┌────────────────────────────────────┐
│ Add New Job Application        ✕   │
├────────────────────────────────────┤
│ Company Name *                     │
│ [________________]                 │
│                                    │
│ Position *                         │
│ [________________]                 │
│                                    │
│ Status                             │
│ [Applied ▼]                        │
│                                    │
│ Salary Range                       │
│ [________________]                 │
│                                    │
│ [Create Application] [Cancel]      │
└────────────────────────────────────┘
```

### 🧭 NAVBAR
```
┌──────────────────────────────────────┐
│ 📊 JobTracker    Home   Dashboard    │
│                         [Get Started]│
└──────────────────────────────────────┘
```

## Component Styling Guide

### Status Badges
```
Applied:  Background: #e8ecfc  | Text: #667eea
Interview: Background: #fff4e6 | Text: #f5a623
Offer:    Background: #e6f9f0 | Text: #27ae60
Rejected: Background: #fadbd8 | Text: #e74c3c
```

### Cards
```
Background:  White (#ffffff)
Border:      1px solid #e0e0e0
Border-left: 4px colored (matches status)
Padding:     20px
Border-radius: 12px
Shadow:      0 2px 8px rgba(0, 0, 0, 0.06)
Hover:       Slightly elevated, more shadow
```

### Buttons (Gradient)
```
Background: linear-gradient(135deg, #667eea → #764ba2)
Color:      White
Padding:    12px 28px
Border:     None
Border-radius: 8px
Font-weight: 700
Cursor:     pointer
Shadow:     0 4px 12px rgba(102, 126, 234, 0.3)
```

## Responsive Breakpoints
- Mobile: Full width, single column
- Tablet: 2 columns for analytics
- Desktop: 4 columns for metrics, 2 for analytics

## Key Numbers
- Total Jobs: 7 (mock data)
- Applied: 3
- Interview: 2  
- Offer: 1
- Rejected: 1
- Success Rate: 43%
- Rejection Rate: 14%

## Typography Scale
```
H1 (Page titles):    2.5rem | weight 800
H2 (Card titles):    1.3rem | weight 700
H3 (Section titles): 1.5rem | weight 700
Body:                0.95rem | weight 400/600
Small:               0.85-0.9rem | weight 400/600
```

## Spacing
```
Container padding: 40px
Gap between cards: 20px (metrics), 20-30px (analytics)
Internal padding: 20-30px per card
Button padding: 8-16px (small), 12-28px (large)
```

## Interactions
- Card hover: Lift effect with `transform: translateY(-8px)`
- Button hover: Subtle scale/shadow increase
- Modal: Fixed overlay with 50% opacity dark background
- Form submit: Updates state (not connected to DB yet)

---

**Ready to code?** All files are styled and ready for backend integration! 🚀
