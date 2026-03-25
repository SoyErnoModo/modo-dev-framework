#!/usr/bin/env python3
"""
Create Jira tasks from sprint plan.

Usage:
    python create_jira_tasks.py --project MODO --sprint-plan sprint_plan.json

Requires:
    - JIRA_URL env var (e.g., https://modo.atlassian.net)
    - JIRA_TOKEN env var (API token)
    - JIRA_EMAIL env var (your Jira email)
"""

import argparse
import json
import os
import sys
from typing import List, Dict, Any
from urllib.request import Request, urlopen
from urllib.error import URLError
import base64


def create_jira_issue(
    base_url: str,
    email: str,
    token: str,
    project_key: str,
    summary: str,
    description: str,
    issue_type: str = "Story",
    priority: str = "Medium",
) -> Dict[str, Any]:
    """Create a Jira issue via REST API."""

    # Jira REST API endpoint
    api_url = f"{base_url}/rest/api/3/issue"

    # Prepare auth
    auth_string = f"{email}:{token}"
    auth_bytes = auth_string.encode('ascii')
    base64_bytes = base64.b64encode(auth_bytes)
    base64_string = base64_bytes.decode('ascii')

    # Issue payload
    payload = {
        "fields": {
            "project": {"key": project_key},
            "summary": summary,
            "description": {
                "type": "doc",
                "version": 1,
                "content": [
                    {
                        "type": "paragraph",
                        "content": [
                            {
                                "type": "text",
                                "text": description
                            }
                        ]
                    }
                ]
            },
            "issuetype": {"name": issue_type},
            "priority": {"name": priority},
        }
    }

    request = Request(
        api_url,
        data=json.dumps(payload).encode('utf-8'),
        headers={
            "Authorization": f"Basic {base64_string}",
            "Content-Type": "application/json",
        },
        method="POST"
    )

    try:
        with urlopen(request, timeout=15) as response:
            result = json.loads(response.read())
            return {
                "key": result["key"],
                "url": f"{base_url}/browse/{result['key']}",
            }
    except URLError as e:
        print(f"Error creating Jira issue: {e}", file=sys.stderr)
        return None


def main():
    parser = argparse.ArgumentParser(description="Create Jira tasks")
    parser.add_argument(
        "--project", required=True, help="Jira project key (e.g., MODO)"
    )
    parser.add_argument(
        "--sprint-plan", required=True, help="Path to sprint plan JSON"
    )
    parser.add_argument(
        "--assignee", default="unassigned", help="Assignee (default: unassigned)"
    )
    parser.add_argument(
        "--dry-run", action="store_true", help="Don't actually create tasks"
    )

    args = parser.parse_args()

    # Get Jira credentials
    jira_url = os.getenv("JIRA_URL")
    jira_token = os.getenv("JIRA_TOKEN")
    jira_email = os.getenv("JIRA_EMAIL")

    if not all([jira_url, jira_token, jira_email]):
        print("❌ Error: Missing Jira credentials", file=sys.stderr)
        print("   Required env vars: JIRA_URL, JIRA_TOKEN, JIRA_EMAIL")
        sys.exit(1)

    # Load sprint plan
    with open(args.sprint_plan) as f:
        plan = json.load(f)

    print(f"📋 Creating Jira tasks for project: {args.project}")
    print(f"   Sprints: {plan['total_sprints']}")
    print(f"   Total tasks: {plan['total_tasks']}")

    if args.dry_run:
        print("\n🔍 DRY RUN MODE - No tasks will be created\n")

    created_tasks = []

    # Create epic for each sprint
    for sprint in plan["sprints"]:
        sprint_num = sprint["number"]

        # Create epic
        epic_summary = f"Sprint {sprint_num}: {len(sprint['tasks'])} tasks"
        epic_desc = f"Sprint {sprint_num} with {sprint['points']} story points"

        print(f"\n🎯 Sprint {sprint_num} Epic:")
        print(f"   {epic_summary}")

        if not args.dry_run:
            epic = create_jira_issue(
                jira_url,
                jira_email,
                jira_token,
                args.project,
                epic_summary,
                epic_desc,
                issue_type="Epic",
                priority="High"
            )

            if epic:
                print(f"   ✅ Created: {epic['url']}")
                created_tasks.append(epic)

        # Create stories for each task
        for task in sprint["tasks"]:
            task_summary = task["description"]
            task_desc = f"Complexity: {task['complexity']}\n\n{task.get('details', '')}"

            # Map complexity to priority
            priority_map = {"XL": "Highest", "L": "High", "M": "Medium", "S": "Low"}
            priority = priority_map.get(task["complexity"], "Medium")

            print(f"      📌 {task_summary[:50]}...")

            if not args.dry_run:
                story = create_jira_issue(
                    jira_url,
                    jira_email,
                    jira_token,
                    args.project,
                    task_summary,
                    task_desc,
                    issue_type="Story",
                    priority=priority
                )

                if story:
                    print(f"         ✅ {story['key']}")
                    created_tasks.append(story)

    print(f"\n✅ Done!")
    if not args.dry_run:
        print(f"   Created {len(created_tasks)} Jira tasks")
    else:
        print(f"   Would create {len(created_tasks)} Jira tasks (dry run)")


if __name__ == "__main__":
    main()
