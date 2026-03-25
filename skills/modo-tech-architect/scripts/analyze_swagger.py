#!/usr/bin/env python3
"""
Analyze Swagger/OpenAPI documentation and map to PRD requirements.

Usage:
    python analyze_swagger.py --url <swagger-url> --requirements "req1, req2, req3"
"""

import argparse
import json
import sys
from typing import Dict, List, Any
from urllib.request import urlopen
from urllib.error import URLError


def fetch_swagger(url: str) -> Dict[str, Any]:
    """Fetch Swagger/OpenAPI JSON from URL."""
    try:
        # Try common Swagger paths
        swagger_urls = [
            url,
            f"{url}/swagger.json",
            f"{url}/v3/api-docs",
            f"{url}/api-docs",
        ]

        for swagger_url in swagger_urls:
            try:
                with urlopen(swagger_url, timeout=10) as response:
                    return json.loads(response.read())
            except URLError:
                continue

        raise ValueError(f"Could not fetch Swagger from {url} or common paths")

    except Exception as e:
        print(f"Error fetching Swagger: {e}", file=sys.stderr)
        sys.exit(1)


def extract_endpoints(swagger: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Extract all endpoints from Swagger doc."""
    endpoints = []
    paths = swagger.get("paths", {})

    for path, methods in paths.items():
        for method, details in methods.items():
            if method.upper() not in ["GET", "POST", "PUT", "DELETE", "PATCH"]:
                continue

            endpoint = {
                "path": path,
                "method": method.upper(),
                "summary": details.get("summary", ""),
                "description": details.get("description", ""),
                "parameters": [],
                "required_params": [],
            }

            # Extract parameters
            for param in details.get("parameters", []):
                param_info = {
                    "name": param.get("name"),
                    "in": param.get("in"),
                    "type": param.get("schema", {}).get("type", "string"),
                    "required": param.get("required", False),
                }
                endpoint["parameters"].append(param_info)
                if param_info["required"]:
                    endpoint["required_params"].append(param_info["name"])

            endpoints.append(endpoint)

    return endpoints


def map_requirements_to_endpoints(
    requirements: List[str],
    endpoints: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """Map PRD requirements to available endpoints."""
    mapping = {
        "matched": {},
        "gaps": [],
    }

    for req in requirements:
        req = req.strip().lower()
        matched = False

        # Simple keyword matching (can be improved with NLP)
        for endpoint in endpoints:
            endpoint_text = (
                f"{endpoint['path']} {endpoint['summary']} {endpoint['description']}"
            ).lower()

            # Check if requirement keywords appear in endpoint
            req_keywords = req.split()
            if any(keyword in endpoint_text for keyword in req_keywords):
                if req not in mapping["matched"]:
                    mapping["matched"][req] = []
                mapping["matched"][req].append({
                    "endpoint": f"{endpoint['method']} {endpoint['path']}",
                    "summary": endpoint['summary'],
                    "required_params": endpoint['required_params'],
                    "all_params": [p["name"] for p in endpoint["parameters"]],
                })
                matched = True

        if not matched:
            mapping["gaps"].append(req)

    return mapping


def main():
    parser = argparse.ArgumentParser(
        description="Analyze Swagger/OpenAPI and map to requirements"
    )
    parser.add_argument(
        "--url", required=True, help="Swagger/OpenAPI URL"
    )
    parser.add_argument(
        "--requirements",
        required=True,
        help='Comma-separated requirements (e.g., "search promotions, list banks")'
    )
    parser.add_argument(
        "--output",
        default="swagger_analysis.json",
        help="Output JSON file"
    )

    args = parser.parse_args()

    # Parse requirements
    requirements = [r.strip() for r in args.requirements.split(",")]

    print(f"📡 Fetching Swagger from: {args.url}")
    swagger = fetch_swagger(args.url)

    print(f"📋 Extracting endpoints...")
    endpoints = extract_endpoints(swagger)
    print(f"   Found {len(endpoints)} endpoints")

    print(f"🔍 Mapping {len(requirements)} requirements to endpoints...")
    mapping = map_requirements_to_endpoints(requirements, endpoints)

    # Prepare output
    output = {
        "swagger_url": args.url,
        "total_endpoints": len(endpoints),
        "requirements": requirements,
        "mapping": mapping,
        "summary": {
            "matched_requirements": len(mapping["matched"]),
            "gap_requirements": len(mapping["gaps"]),
            "coverage": f"{len(mapping['matched']) / len(requirements) * 100:.1f}%",
        }
    }

    # Save to file
    with open(args.output, "w") as f:
        json.dump(output, f, indent=2)

    print(f"\n✅ Analysis complete!")
    print(f"   Matched: {output['summary']['matched_requirements']}/{len(requirements)}")
    print(f"   Gaps: {len(mapping['gaps'])}")
    print(f"   Coverage: {output['summary']['coverage']}")

    if mapping['gaps']:
        print(f"\n🔴 GAPS (no matching endpoints):")
        for gap in mapping['gaps']:
            print(f"   - {gap}")

    print(f"\n📄 Full report: {args.output}")


if __name__ == "__main__":
    main()
