---
description: >
  Post structured progress updates to Slack. Supports milestones: started, in-progress,
  blocked, ready-for-review, merged, deployed. Tags relevant team members.
argument-hint: <milestone> [--channel "#channel"] [--mention @person]
---

# /dev-notify - Team Notification

Post structured progress updates to Slack for the active feature.

## Step 0: Parse Arguments

- **milestone**: started | in-progress | blocked | ready-for-review | merged | deployed
- **--channel**: Override target (default: team channel from work-pilot references)
- **--mention**: Additional people to tag

## Step 1: Load Context

From engram `dev-guardian/features/{ticket-id}`:
- Ticket ID, title, URL
- Branch, PR URL (if exists)
- AC completion %, quality score
- Duration since start
- Latest check/critique results

## Step 2: Determine Channel and Mentions

Use work-pilot's `references/team-structure.md` and `references/modo-channels.md`:
- Default: team channel based on ticket labels/project
- Reviewers: from team structure and PR assignees
- Blockers: mention tech lead + relevant person

## Step 3: Format Message by Milestone

### started
```
:rocket: *Feature Started*
*{ticket-id}*: {title}
Ticket: {url}
Branch: `{branch}`
AC Score: {score}/100 ({count} criteria)
```

### in-progress
```
:construction: *Feature Update*
*{ticket-id}*: {title}
Progress: {AC%}% ({done}/{total} criteria)
Quality: {score}/100
Branch: +{add}/-{del} ({commits} commits)
```

### blocked
```
:octagonal_sign: *Feature Blocked*
*{ticket-id}*: {title}
Blocker: {description}
Needs: {what/who needed}
cc: {mentions}
```

### ready-for-review
```
:eyes: *Ready for Review*
*{ticket-id}*: {title}
PR: {pr-url}
AC Coverage: {%}% | Quality: {score}/100
Changes: +{add}/-{del} across {files} files
Reviewers: {mentions}
```

### merged
```
:white_check_mark: *Feature Merged*
*{ticket-id}*: {title}
PR: {pr-url}
Duration: {start to merge}
Lifecycle Grade: {grade}
```

### deployed
```
:ship: *Feature Deployed*
*{ticket-id}*: {title}
Environment: {staging/production}
Duration: {start to deploy}
Docs: available in dev-vault
```

## Step 4: Post via Slack MCP

Use Slack MCP `post_message` to send to target channel.

## Step 5: Log to Journal

```markdown
---

## {YYYY-MM-DD HH:MM} - Slack Notification: {milestone}

- Channel: #{channel}
- Mentions: {people}
```

## Step 6: Update Engram

Update feature status with latest milestone.

## Rules

- Anti-spam: check engram for last notification time, warn if < 2 hours ago
- Blockers always go to team channel, not side channel
- ready-for-review tags specific reviewers, not whole team
- Keep messages concise and scannable
- Always include ticket and PR links
