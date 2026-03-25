#!/usr/bin/env python3
"""
Search Confluence spaces for documentation.

Usage:
    python search_confluence.py --space ENG --queries "auth,design system"

Requires:
    - CONFLUENCE_URL env var (e.g., https://modo.atlassian.net)
    - CONFLUENCE_TOKEN env var (API token)
"""

import argparse
import json
import os
import sys
from typing import List, Dict, Any
from urllib.request import Request, urlopen
from urllib.parse import quote
from urllib.error import URLError


def search_confluence(
    base_url: str,
    token: str,
    space: str,
    query: str
) -> List[Dict[str, Any]]:
    """Search Confluence for query in specific space."""

    # Confluence REST API search endpoint
    search_url = (
        f"{base_url}/wiki/rest/api/content/search"
        f"?cql=space={space} AND text~\"{query}\""
        f"&limit=10"
    )

    request = Request(search_url)
    request.add_header("Authorization", f"Bearer {token}")
    request.add_header("Content-Type", "application/json")

    try:
        with urlopen(request, timeout=15) as response:
            data = json.loads(response.read())
            results = []

            for result in data.get("results", []):
                results.append({
                    "title": result.get("title"),
                    "url": f"{base_url}/wiki{result['_links']['webui']}",
                    "type": result.get("type"),
                    "excerpt": result.get("excerpt", ""),
                })

            return results

    except URLError as e:
        print(f"Error searching Confluence: {e}", file=sys.stderr)
        return []


def main():
    parser = argparse.ArgumentParser(
        description="Search Confluence spaces"
    )
    parser.add_argument(
        "--space", required=True, help="Confluence space key (e.g., ENG)"
    )
    parser.add_argument(
        "--queries",
        required=True,
        help='Comma-separated search queries (e.g., "auth,design system")'
    )
    parser.add_argument(
        "--output",
        default="confluence_results.json",
        help="Output JSON file"
    )

    args = parser.parse_args()

    # Get Confluence credentials from env
    confluence_url = os.getenv("CONFLUENCE_URL")
    confluence_token = os.getenv("CONFLUENCE_TOKEN")

    if not confluence_url:
        print("❌ Error: CONFLUENCE_URL environment variable not set", file=sys.stderr)
        print("   Example: export CONFLUENCE_URL=https://modo.atlassian.net")
        sys.exit(1)

    if not confluence_token:
        print("❌ Error: CONFLUENCE_TOKEN environment variable not set", file=sys.stderr)
        print("   Get token from: https://id.atlassian.com/manage-profile/security/api-tokens")
        sys.exit(1)

    # Parse queries
    queries = [q.strip() for q in args.queries.split(",")]

    print(f"🔍 Searching Confluence space: {args.space}")
    print(f"   Queries: {len(queries)}")

    all_results = {}

    for query in queries:
        print(f"\n   Searching: '{query}'...")
        results = search_confluence(confluence_url, confluence_token, args.space, query)
        all_results[query] = results
        print(f"      Found: {len(results)} pages")

    # Save results
    output = {
        "space": args.space,
        "queries": queries,
        "results": all_results,
        "summary": {
            "total_pages": sum(len(r) for r in all_results.values()),
        }
    }

    with open(args.output, "w") as f:
        json.dump(output, f, indent=2)

    print(f"\n✅ Search complete!")
    print(f"   Total pages found: {output['summary']['total_pages']}")
    print(f"\n📄 Full results: {args.output}")


if __name__ == "__main__":
    main()
