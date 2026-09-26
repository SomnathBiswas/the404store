import json
import re
import subprocess
import sys
import requests

BASE = "https://not-found-style.preview.emergentagent.com/api"


def check(condition, message):
    if not condition:
        raise AssertionError(message)
    print(f"PASS: {message}")


def get(path="/products", **kwargs):
    response = requests.get(BASE + path, timeout=20, **kwargs)
    print(f"GET {path} -> {response.status_code}")
    return response


def post_raw(body, content_type="application/json"):
    response = requests.post(BASE, data=body, headers={"Content-Type": content_type}, timeout=20)
    print(f"POST /api raw -> {response.status_code}")
    return response


def main():
    try:
        catalog = get()
        check(catalog.status_code == 200, "GET /api/products returns 200")
        data = catalog.json()
        check(isinstance(data.get("products"), list), "catalog includes products array")
        check(data["count"] == len(data["products"]), "catalog count matches product array length")
        check(len(data["products"]) == 8, "catalog returns all 8 mock products")
        check(all(isinstance(p.get("id"), str) and re.fullmatch(r"[A-Za-z0-9-]+", p["id"]) for p in data["products"]), "all product IDs are stable UUID-like strings")

        expected = {"Men": 2, "Women": 2, "Unisex": 4, "All": 8}
        for category, count in expected.items():
            result = get("/products", params={"category": category})
            check(result.status_code == 200, f"category={category} returns 200")
            payload = result.json()
            check(payload["count"] == count, f"category={category} returns expected count {count}")
            check(all(p["category"] == category or category == "All" for p in payload["products"]), f"category={category} subset is correct")

        search = get("/products", params={"q": "hoodie"})
        check(search.status_code == 200, "q search returns 200")
        search_data = search.json()
        check(search_data["count"] == 1 and search_data["products"][0]["name"] == "Error Hoodie", "q search matches product and count")

        valid = post_raw(json.dumps({"type": "newsletter", "email": "maya.chen@example.com"}))
        check(valid.status_code == 201 and valid.json().get("ok") is True, "valid newsletter email returns 201 success")
        for body in ({"type": "newsletter"}, {"type": "newsletter", "email": "invalid-email"}):
            invalid = post_raw(json.dumps(body))
            check(invalid.status_code == 400, "missing/invalid newsletter email returns 400")

        malformed = post_raw('{"type":"newsletter",')
        check(malformed.status_code == 400, "malformed JSON returns 400")

        proc = subprocess.run(["node", "--check", "app/api/[[...path]]/route.js"], capture_output=True, text=True)
        check(proc.returncode == 0, "route module passes Node syntax check without duplicate-export syntax errors")
        print("ALL BACKEND TESTS PASSED")
    except Exception as exc:
        print(f"FAIL: {exc}")
        sys.exit(1)


if __name__ == "__main__":
    main()
