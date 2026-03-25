#!/usr/bin/env python3
"""
Generate sprint plan from technical specs.

Usage:
    python generate_sprint_plan.py --specs specs.json --sprints 4
"""

import argparse
import json
from typing import List, Dict, Any


def estimate_complexity(task: str) -> str:
    """Estimate task complexity based on keywords."""
    task_lower = task.lower()

    # XL: New APIs, architecture changes, integrations
    xl_keywords = ["new api", "architecture", "integrate", "migration", "refactor"]
    if any(kw in task_lower for kw in xl_keywords):
        return "XL"

    # L: New components, complex features
    l_keywords = ["component", "feature", "implement", "build"]
    if any(kw in task_lower for kw in l_keywords):
        return "L"

    # M: UI updates, testing
    m_keywords = ["update", "test", "ui", "style", "error handling"]
    if any(kw in task_lower for kw in m_keywords):
        return "M"

    # S: Small fixes, config
    return "S"


def identify_dependencies(tasks: List[Dict[str, Any]]) -> Dict[str, List[str]]:
    """Identify task dependencies."""
    dependencies = {}

    for i, task in enumerate(tasks):
        task_id = f"task_{i+1}"
        deps = []

        # Simple heuristic: API tasks must come before component tasks
        if "api" in task["description"].lower():
            # API tasks have no dependencies (or minimal)
            pass
        elif "component" in task["description"].lower():
            # Components depend on APIs
            for j, other in enumerate(tasks[:i]):
                if "api" in other["description"].lower():
                    deps.append(f"task_{j+1}")

        dependencies[task_id] = deps

    return dependencies


def allocate_to_sprints(
    tasks: List[Dict[str, Any]],
    num_sprints: int
) -> List[Dict[str, Any]]:
    """Allocate tasks to sprints based on dependencies and complexity."""

    # Complexity points
    points = {"S": 1, "M": 2, "L": 3, "XL": 5}
    target_points_per_sprint = sum(points[t["complexity"]] for t in tasks) / num_sprints

    sprints = [{"number": i+1, "tasks": [], "points": 0} for i in range(num_sprints)]

    # Sort tasks by complexity (XL first for early planning)
    sorted_tasks = sorted(tasks, key=lambda t: points[t["complexity"]], reverse=True)

    for task in sorted_tasks:
        # Find sprint with least points
        sprint = min(sprints, key=lambda s: s["points"])
        sprint["tasks"].append(task)
        sprint["points"] += points[task["complexity"]]

    return sprints


def main():
    parser = argparse.ArgumentParser(description="Generate sprint plan")
    parser.add_argument(
        "--specs", required=True, help="Path to technical specs JSON"
    )
    parser.add_argument(
        "--sprints", type=int, default=4, help="Number of sprints (default: 4)"
    )
    parser.add_argument(
        "--output", default="sprint_plan.json", help="Output file"
    )

    args = parser.parse_args()

    # Load specs
    with open(args.specs) as f:
        specs = json.load(f)

    # Extract tasks (assuming specs have a "tasks" field)
    tasks = specs.get("tasks", [])

    if not tasks:
        print("❌ No tasks found in specs")
        return

    print(f"📋 Analyzing {len(tasks)} tasks...")

    # Estimate complexity
    for task in tasks:
        task["complexity"] = estimate_complexity(task["description"])

    # Identify dependencies
    dependencies = identify_dependencies(tasks)

    # Allocate to sprints
    sprints = allocate_to_sprints(tasks, args.sprints)

    # Generate output
    output = {
        "total_sprints": args.sprints,
        "total_tasks": len(tasks),
        "complexity_breakdown": {
            "S": len([t for t in tasks if t["complexity"] == "S"]),
            "M": len([t for t in tasks if t["complexity"] == "M"]),
            "L": len([t for t in tasks if t["complexity"] == "L"]),
            "XL": len([t for t in tasks if t["complexity"] == "XL"]),
        },
        "sprints": sprints,
        "dependencies": dependencies,
    }

    # Save
    with open(args.output, "w") as f:
        json.dump(output, f, indent=2)

    print(f"✅ Sprint plan generated!")
    print(f"   Sprints: {args.sprints}")
    print(f"   Complexity: {output['complexity_breakdown']}")
    print(f"\n📄 Plan: {args.output}")


if __name__ == "__main__":
    main()
