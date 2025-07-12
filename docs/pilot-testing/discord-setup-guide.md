# Pilot Program Discord Setup Guide

## Table of Contents

1. [Overview](#overview)
2. [Server Structure](#server-structure)
  3. [Categories and Channels](#categories-and-channels)
  4. [Roles](#roles)
  5. [Permissions Setup](#permissions-setup)
    6. [@Pilot-Participant](#pilot-participant)
    7. [@Support](#support)
8. [Bot Setup](#bot-setup)
  9. [Welcome Bot Configuration](#welcome-bot-configuration)
  10. [Metrics Bot Commands](#metrics-bot-commands)
11. [Channel Templates](#channel-templates)
  12. [#pilot-guidelines](#pilot-guidelines)
13. [Program Duration](#program-duration)
14. [Your Commitments](#your-commitments)
15. [What We Track](#what-we-track)
16. [Support Priorities](#support-priorities)
17. [Privacy](#privacy)
  18. [#resources](#resources)
19. [Quick Links](#quick-links)
20. [Key Commands](#key-commands)
21. [Common Issues](#common-issues)
  22. [Daily Standup Template](#daily-standup-template)
23. [Moderation Guidelines](#moderation-guidelines)
  24. [Response Times](#response-times)
  25. [Escalation Path](#escalation-path)
26. [Weekly Activities](#weekly-activities)
  27. [Monday](#monday)
  28. [Wednesday](#wednesday)
  29. [Friday](#friday)
30. [Data Collection](#data-collection)
  31. [Automated Tracking](#automated-tracking)
  32. [Manual Collection](#manual-collection)
33. [Optimal Practices](#optimal-practices)
  34. [DO](#do)
  35. [DON'T](#dont)
36. [Emergency Procedures](#emergency-procedures)
  37. [Critical Bug Affecting All](#critical-bug-affecting-all)
  38. [Participant Withdrawal](#participant-withdrawal)
39. [Success Metrics](#success-metrics)

## Overview

This guide covers setting up a Discord server for the ProjectTemplate pilot program support channel.

## Server Structure

### Categories and Channels

```text
📋 PILOT PROGRAM INFO
├── 📢 announcements      (admin only)
├── 📖 pilot-guidelines   (read-only)
├── 🔗 resources         (read-only)
└── ❓ faq               (read-only)

💬 GENERAL
├── 👋 introductions
├── 💭 general-chat
└── 🎯 daily-check-ins

🛠️ TECHNICAL SUPPORT
├── 🚨 blocking-issues    (high priority)
├── 🐛 bug-reports
├── 💡 feature-requests
└── 🤝 peer-help

📊 FEEDBACK
├── 📈 metrics-discussion
├── 💭 qualitative-feedback
├── 🎯 weekly-surveys
└── 💡 suggestions

🔧 PILOT PHASES
├── 📏 week-1-baseline
├── 🚀 week-2-onboarding
├── 🏃 week-3-guided
└── 🎓 week-4-independent
```

### Roles

1. **@Admin** - Program coordinators
2. **@Pilot-Participant** - Active testers
3. **@Support** - Technical support team
4. **@Alumni** - Completed pilot participants

### Permissions Setup

#### @Pilot-Participant
- View all channels
- Send messages in general/support/feedback
- Cannot modify server settings
- Cannot create invites

#### @Support
- All participant permissions
- Pin messages
- Manage messages in support channels
- Priority speaker in voice channels

## Bot Setup

### Welcome Bot Configuration

```text
Welcome Message:
Welcome to the ProjectTemplate Pilot Program, {user}! 🎉

Please:
1. Read #pilot-guidelines
2. Introduce yourself in #introductions
3. Check #resources for setup guides
4. Post any blocking issues in #blocking-issues

Your pilot coordinator is @[Coordinator Name].
```

### Metrics Bot Commands

```text
!metrics start    - Begin tracking session
!metrics end      - End tracking session
!metrics report   - View your metrics
!friction <description> - Report friction point
!feedback <text>  - Submit quick feedback
```

## Channel Templates

### #pilot-guidelines

```markdown
# ProjectTemplate Pilot Program Guidelines

## Program Duration
4 weeks starting from your onboarding date

## Your Commitments
✅ Use ProjectTemplate in your daily workflow
✅ Track time spent on key tasks
✅ Report friction points as they occur
✅ Complete weekly surveys (15 min)
✅ Attend weekly check-in (optional but recommended)

## What We Track
- Component creation time
- API endpoint development time
- Code quality metrics
- Tool adoption patterns
- User satisfaction scores

## Support Priorities
🚨 **Blocking Issues** → #blocking-issues (< 2hr response)
🐛 **Bugs** → #bug-reports (< 24hr response)
💡 **Features** → #feature-requests (weekly review)

## Privacy
- All data is anonymized
- No personal/company code tracked
- You can withdraw anytime
```

### #resources

```markdown
# Pilot Program Resources

## Quick Links
- 📚 [ProjectTemplate Docs](../README.md)
- 🚀 [Quick Start Guide](../../QUICK-START.md)
- 🎥 [Video Tutorials](../../docs/guides/ai-development/ai-assistant-setup.md)
- 📊 [Metrics Dashboard](../../tools/metrics/README.md)

## Key Commands
\`\`\`bash
npm run setup:guided     # Initial setup
npm run g:c Component    # Generate component
npm run metrics:report   # View your metrics
npm run check:all       # Run all checks
\`\`\`

## Common Issues
- [Port conflicts troubleshooting]
- [Generator errors guide]
- [AI integration tips]
```

### Daily Standup Template

```text
📅 **Daily Check-in - [Date]**

Share your experience (optional):
1. What did you build with ProjectTemplate today?
2. Any friction points or blockers?
3. Time saved estimate: ⏱️

React with:
✅ Used ProjectTemplate today
⏸️ Didn't use today
❌ Blocked by issue
```

## Moderation Guidelines

### Response Times
- **Blocking issues**: < 2 hours during business hours
- **Bug reports**: < 24 hours
- **Feature requests**: Weekly batch review
- **General questions**: < 48 hours

### Escalation Path
1. Participant reports issue
2. Support team attempts resolution
3. If unresolved → escalate to dev team
4. If blocking → schedule 1:1 call

## Weekly Activities

### Monday
- Post weekly goals survey
- Review previous week's metrics

### Wednesday
- Mid-week check-in post
- Address any accumulated issues

### Friday
- Week wrap-up survey
- Metrics summary post
- Celebrate wins 🎉

## Data Collection

### Automated Tracking
- Message frequency by channel
- Response times to issues
- Feature request patterns
- Engagement metrics

### Manual Collection
- Weekly survey responses
- Qualitative feedback themes
- Success stories
- Pain point categories

## Optimal Practices

### DO
✅ Respond to blocking issues immediately
✅ Celebrate participant successes
✅ Share tips between participants
✅ Keep discussions focused
✅ Document common issues

### DON'T
❌ Share participant code/data
❌ Make promises about features
❌ Dismiss friction reports
❌ Allow off-topic discussions
❌ Ignore quiet participants

## Emergency Procedures

### Critical Bug Affecting All
1. Post in #announcements
2. Create workaround thread
3. Pin temporary solution
4. Track affected participants
5. Follow up individually

### Participant Withdrawal
1. Conduct exit interview
2. Collect final metrics
3. Move to @Alumni role
4. Thank for participation
5. Keep in database for future pilots

## Success Metrics

- 90%+ participant retention
- < 2hr blocking issue resolution
- 80%+ weekly survey completion
- Active daily engagement
- Positive sentiment analysis

This setup ensures smooth pilot program operation and robust participant experience.