---
title: Slack Channel Map
description: Channel priority configuration for the slack-analyzer agent
tags: [slack, channels, communication, notifications]
---

# MODO Slack Channel Map

Configure this file with your actual Slack channels and their priority levels.
The slack-analyzer agent uses this to prioritize message analysis.

## Priority Levels
- **critical**: Production incidents, outages, security alerts
- **high**: Team channels, direct project work, blockers
- **medium**: Cross-team coordination, architecture discussions
- **low**: General, social, automated notifications

## Channel Configuration

### Critical
| Channel | Purpose |
|---------|---------|
| #incidents | Production incidents and alerts |
| #deploys | Deployment notifications and rollbacks |

### High
| Channel | Purpose |
|---------|---------|
| #backend | Backend team discussions |
| #frontend | Frontend team discussions |
| #mobile | Mobile team discussions |
| #platform | Platform/infra team |

### Medium
| Channel | Purpose |
|---------|---------|
| #architecture | Architecture decisions and RFCs |
| #code-review | PR discussions and review requests |
| #managers | Leadership coordination |
| #product | Product decisions and roadmap |

### Low
| Channel | Purpose |
|---------|---------|
| #general | Company-wide announcements |
| #random | Social and off-topic |
| #ci-cd | Automated CI/CD notifications |
| #bot-alerts | Automated bot messages |

## DMs and Group DMs
- Always classified as **high** priority
- Direct questions to you are classified as **needs-response**
