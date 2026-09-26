#!/usr/bin/env python3
"""
Backend API Test Suite for THE 404 STORE
Tests MongoDB-backed endpoints at the configured public URL
"""
import requests
import sys
import json
from typing import Dict, Any

# Load base URL from .env
BASE_URL = "https://not-found-style.preview.emergentagent.com/api"

def test_get_products():
    """Test GET /api/products - should return 15 products with UUID ids"""
    print("\n=== TEST 1: GET /api/products ===")
    try:
        response = requests.get(f"{BASE_URL}/products", timeout=10)
        print(f"Status: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAILED: Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        
        # Check structure
        if 'products' not in data or 'count' not in data or 'categories' not in data:
            print(f"❌ FAILED: Missing required keys. Got: {list(data.keys())}")
            return False
        
        products = data['products']
        count = data['count']
        categories = data['categories']
        
        print(f"Products count: {count}")
        print(f"Categories: {categories}")
        
        # Should have 15 products after seeding
        if count != 15:
            print(f"❌ FAILED: Expected 15 products, got {count}")
            return False
        
        # Check first product structure
        if products:
            p = products[0]
            required_fields = ['id', 'slug', 'name', 'price', 'sizes', 'image', 'category']
            missing = [f for f in required_fields if f not in p]
            if missing:
                print(f"❌ FAILED: Product missing fields: {missing}")
                return False
            
            # Verify UUID format (basic check)
            if not isinstance(p['id'], str) or len(p['id']) < 32:
                print(f"❌ FAILED: Product id doesn't look like UUID: {p['id']}")
                return False
            
            # Verify category is one of the expected
            expected_cats = ['Shirt', 'Tshirt', 'Jeans', 'Newdrop', 'Sale']
            if p['category'] not in expected_cats:
                print(f"❌ FAILED: Unexpected category: {p['category']}")
                return False
            
            print(f"Sample product: {p['name']} ({p['category']}) - ${p['price']/100:.2f}")
        
        print("✅ PASSED: GET /api/products returns correct structure with 15 products")
        return True
        
    except Exception as e:
        print(f"❌ FAILED: Exception - {e}")
        return False


def test_category_filters():
    """Test GET /api/products?category=<X> for each category"""
    print("\n=== TEST 2: Category Filters ===")
    categories = ['Shirt', 'Tshirt', 'Jeans', 'Newdrop', 'Sale']
    all_passed = True
    
    for cat in categories:
        try:
            response = requests.get(f"{BASE_URL}/products?category={cat}", timeout=10)
            print(f"\nCategory: {cat} - Status: {response.status_code}")
            
            if response.status_code != 200:
                print(f"❌ FAILED: Expected 200, got {response.status_code}")
                all_passed = False
                continue
            
            data = response.json()
            products = data.get('products', [])
            count = len(products)
            
            print(f"  Products returned: {count}")
            
            # Each category should have exactly 3 products
            if count != 3:
                print(f"❌ FAILED: Expected 3 products for {cat}, got {count}")
                all_passed = False
                continue
            
            # Verify all products match the category
            for p in products:
                if p['category'].lower() != cat.lower():
                    print(f"❌ FAILED: Product {p['name']} has category {p['category']}, expected {cat}")
                    all_passed = False
                    break
            else:
                print(f"✅ PASSED: {cat} returns 3 matching products")
                
        except Exception as e:
            print(f"❌ FAILED: Exception for {cat} - {e}")
            all_passed = False
    
    return all_passed


def test_search_query():
    """Test GET /api/products?q=hoodie - should return Error Hoodie"""
    print("\n=== TEST 3: Search Query (q=hoodie) ===")
    try:
        response = requests.get(f"{BASE_URL}/products?q=hoodie", timeout=10)
        print(f"Status: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAILED: Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        products = data.get('products', [])
        
        print(f"Products found: {len(products)}")
        
        # Should find Error Hoodie
        hoodie_found = False
        for p in products:
            print(f"  - {p['name']} (slug: {p['slug']})")
            if p['slug'] == 'error-hoodie':
                hoodie_found = True
        
        if not hoodie_found:
            print(f"❌ FAILED: Error Hoodie not found in search results")
            return False
        
        print("✅ PASSED: Search returns Error Hoodie")
        return True
        
    except Exception as e:
        print(f"❌ FAILED: Exception - {e}")
        return False


def test_sorting():
    """Test GET /api/products?sort=price-asc/price-desc/newest"""
    print("\n=== TEST 4: Sorting ===")
    all_passed = True
    
    # Test price-asc
    try:
        response = requests.get(f"{BASE_URL}/products?sort=price-asc", timeout=10)
        print(f"\nSort: price-asc - Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            products = data.get('products', [])
            prices = [p['price'] for p in products]
            
            if prices == sorted(prices):
                print(f"✅ PASSED: price-asc sorts correctly")
                print(f"  Price range: ${prices[0]/100:.2f} to ${prices[-1]/100:.2f}")
            else:
                print(f"❌ FAILED: price-asc not sorted correctly")
                print(f"  Prices: {[p/100 for p in prices[:5]]}")
                all_passed = False
        else:
            print(f"❌ FAILED: Expected 200, got {response.status_code}")
            all_passed = False
    except Exception as e:
        print(f"❌ FAILED: Exception - {e}")
        all_passed = False
    
    # Test price-desc
    try:
        response = requests.get(f"{BASE_URL}/products?sort=price-desc", timeout=10)
        print(f"\nSort: price-desc - Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            products = data.get('products', [])
            prices = [p['price'] for p in products]
            
            if prices == sorted(prices, reverse=True):
                print(f"✅ PASSED: price-desc sorts correctly")
                print(f"  Price range: ${prices[0]/100:.2f} to ${prices[-1]/100:.2f}")
            else:
                print(f"❌ FAILED: price-desc not sorted correctly")
                print(f"  Prices: {[p/100 for p in prices[:5]]}")
                all_passed = False
        else:
            print(f"❌ FAILED: Expected 200, got {response.status_code}")
            all_passed = False
    except Exception as e:
        print(f"❌ FAILED: Exception - {e}")
        all_passed = False
    
    # Test newest
    try:
        response = requests.get(f"{BASE_URL}/products?sort=newest", timeout=10)
        print(f"\nSort: newest - Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            products = data.get('products', [])
            print(f"✅ PASSED: newest sort returns {len(products)} products")
        else:
            print(f"❌ FAILED: Expected 200, got {response.status_code}")
            all_passed = False
    except Exception as e:
        print(f"❌ FAILED: Exception - {e}")
        all_passed = False
    
    return all_passed


def test_product_detail():
    """Test GET /api/products/error-hoodie - should return product + related"""
    print("\n=== TEST 5: Product Detail (error-hoodie) ===")
    try:
        response = requests.get(f"{BASE_URL}/products/error-hoodie", timeout=10)
        print(f"Status: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAILED: Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        
        if 'product' not in data or 'related' not in data:
            print(f"❌ FAILED: Missing required keys. Got: {list(data.keys())}")
            return False
        
        product = data['product']
        related = data['related']
        
        print(f"Product: {product['name']} ({product['category']})")
        print(f"Related products: {len(related)}")
        
        # Verify product is Error Hoodie
        if product['slug'] != 'error-hoodie':
            print(f"❌ FAILED: Expected error-hoodie, got {product['slug']}")
            return False
        
        # Related should be from same category (Newdrop) but not same slug
        if len(related) > 4:
            print(f"❌ FAILED: Related should be max 4, got {len(related)}")
            return False
        
        for r in related:
            if r['slug'] == 'error-hoodie':
                print(f"❌ FAILED: Related includes the same product")
                return False
            if r['category'] != 'Newdrop':
                print(f"❌ FAILED: Related product {r['name']} not in same category")
                return False
            print(f"  - {r['name']}")
        
        print("✅ PASSED: Product detail returns correct structure")
        return True
        
    except Exception as e:
        print(f"❌ FAILED: Exception - {e}")
        return False


def test_product_not_found():
    """Test GET /api/products/does-not-exist - should return 404"""
    print("\n=== TEST 6: Product Not Found ===")
    try:
        response = requests.get(f"{BASE_URL}/products/does-not-exist", timeout=10)
        print(f"Status: {response.status_code}")
        
        if response.status_code != 404:
            print(f"❌ FAILED: Expected 404, got {response.status_code}")
            return False
        
        data = response.json()
        if 'error' not in data:
            print(f"❌ FAILED: Expected error message in response")
            return False
        
        print(f"Error message: {data['error']}")
        print("✅ PASSED: Non-existent product returns 404")
        return True
        
    except Exception as e:
        print(f"❌ FAILED: Exception - {e}")
        return False


def test_newsletter():
    """Test POST /api/newsletter with valid and invalid emails"""
    print("\n=== TEST 7: Newsletter Subscription ===")
    all_passed = True
    
    # Test valid email
    try:
        response = requests.post(
            f"{BASE_URL}/newsletter",
            json={"email": "test@example.com"},
            timeout=10
        )
        print(f"\nValid email - Status: {response.status_code}")
        
        if response.status_code != 201:
            print(f"❌ FAILED: Expected 201, got {response.status_code}")
            all_passed = False
        else:
            data = response.json()
            if data.get('ok') != True:
                print(f"❌ FAILED: Expected ok: true, got {data}")
                all_passed = False
            else:
                print("✅ PASSED: Valid email returns 201")
    except Exception as e:
        print(f"❌ FAILED: Exception - {e}")
        all_passed = False
    
    # Test missing email
    try:
        response = requests.post(
            f"{BASE_URL}/newsletter",
            json={},
            timeout=10
        )
        print(f"\nMissing email - Status: {response.status_code}")
        
        if response.status_code != 400:
            print(f"❌ FAILED: Expected 400, got {response.status_code}")
            all_passed = False
        else:
            print("✅ PASSED: Missing email returns 400")
    except Exception as e:
        print(f"❌ FAILED: Exception - {e}")
        all_passed = False
    
    # Test invalid email
    try:
        response = requests.post(
            f"{BASE_URL}/newsletter",
            json={"email": "notanemail"},
            timeout=10
        )
        print(f"\nInvalid email - Status: {response.status_code}")
        
        if response.status_code != 400:
            print(f"❌ FAILED: Expected 400, got {response.status_code}")
            all_passed = False
        else:
            print("✅ PASSED: Invalid email returns 400")
    except Exception as e:
        print(f"❌ FAILED: Exception - {e}")
        all_passed = False
    
    return all_passed


def test_orders():
    """Test POST /api/orders with items and total"""
    print("\n=== TEST 8: Create Order ===")
    try:
        order_data = {
            "items": [
                {"slug": "error-hoodie", "quantity": 1, "price": 2499}
            ],
            "total": 2499
        }
        
        response = requests.post(
            f"{BASE_URL}/orders",
            json=order_data,
            timeout=10
        )
        print(f"Status: {response.status_code}")
        
        if response.status_code != 201:
            print(f"❌ FAILED: Expected 201, got {response.status_code}")
            return False
        
        data = response.json()
        
        if 'order' not in data or 'id' not in data['order']:
            print(f"❌ FAILED: Missing order or order.id in response")
            return False
        
        order_id = data['order']['id']
        print(f"Order ID: {order_id}")
        
        # Verify UUID format
        if not isinstance(order_id, str) or len(order_id) < 32:
            print(f"❌ FAILED: Order id doesn't look like UUID: {order_id}")
            return False
        
        print("✅ PASSED: Order created with UUID id")
        return True
        
    except Exception as e:
        print(f"❌ FAILED: Exception - {e}")
        return False


def test_seed():
    """Test GET /api/seed - should return ok: true"""
    print("\n=== TEST 9: Seed Endpoint ===")
    try:
        response = requests.get(f"{BASE_URL}/seed", timeout=10)
        print(f"Status: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAILED: Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        
        if 'ok' not in data or data['ok'] != True:
            print(f"❌ FAILED: Expected ok: true, got {data}")
            return False
        
        print(f"Seeded: {data.get('seeded')}")
        print(f"Count: {data.get('count')}")
        
        if data.get('count') != 15:
            print(f"❌ FAILED: Expected count 15, got {data.get('count')}")
            return False
        
        print("✅ PASSED: Seed endpoint returns ok: true with count 15")
        return True
        
    except Exception as e:
        print(f"❌ FAILED: Exception - {e}")
        return False


def test_node_syntax():
    """Test Node syntax of route.js, seed.js, mongo.js"""
    print("\n=== TEST 10: Node Syntax Check ===")
    import subprocess
    
    files = [
        "/app/app/api/[[...path]]/route.js",
        "/app/lib/seed.js",
        "/app/lib/mongo.js"
    ]
    
    all_passed = True
    
    for file_path in files:
        try:
            result = subprocess.run(
                ["node", "--check", file_path],
                capture_output=True,
                text=True,
                timeout=5
            )
            
            if result.returncode == 0:
                print(f"✅ PASSED: {file_path} - No syntax errors")
            else:
                print(f"❌ FAILED: {file_path} - Syntax errors:")
                print(result.stderr)
                all_passed = False
                
        except Exception as e:
            print(f"❌ FAILED: {file_path} - Exception: {e}")
            all_passed = False
    
    return all_passed


def main():
    """Run all tests"""
    print("=" * 70)
    print("THE 404 STORE - Backend API Test Suite")
    print(f"Testing against: {BASE_URL}")
    print("=" * 70)
    
    results = {
        "GET /api/products": test_get_products(),
        "Category Filters": test_category_filters(),
        "Search Query": test_search_query(),
        "Sorting": test_sorting(),
        "Product Detail": test_product_detail(),
        "Product Not Found": test_product_not_found(),
        "Newsletter": test_newsletter(),
        "Orders": test_orders(),
        "Seed": test_seed(),
        "Node Syntax": test_node_syntax(),
    }
    
    print("\n" + "=" * 70)
    print("TEST SUMMARY")
    print("=" * 70)
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{status}: {test_name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    print("=" * 70)
    
    return 0 if passed == total else 1


if __name__ == "__main__":
    sys.exit(main())
