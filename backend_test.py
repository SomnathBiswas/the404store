#!/usr/bin/env python3
"""
Comprehensive backend API test suite for THE 404 STORE
Tests auth, admin, coupons, loyalty, orders, products, wishlist
"""
import requests
import json
import time
from datetime import datetime, timedelta

BASE_URL = "https://not-found-style.preview.emergentagent.com/api"
ADMIN_EMAIL = "admin@404store.com"
ADMIN_PASSWORD = "admin404"

# Test state
customer_token = None
customer_user = None
admin_token = None
coupon_id_percent = None
coupon_id_flat = None
test_product_slug = "test-product-404"
order_id_for_delivery = None

def log(msg):
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}")

def test_auth_signup():
    """Test 1: POST /api/auth/signup - create customer account"""
    global customer_token, customer_user
    log("TEST 1: Auth signup")
    
    # Create unique email
    email = f"customer{int(time.time())}@404test.com"
    payload = {
        "name": "Test Customer",
        "email": email,
        "password": "test1234"
    }
    
    resp = requests.post(f"{BASE_URL}/auth/signup", json=payload)
    assert resp.status_code == 201, f"Expected 201, got {resp.status_code}: {resp.text}"
    
    data = resp.json()
    assert data.get("ok") == True, "Expected ok:true"
    assert "token" in data, "Expected token in response"
    assert "user" in data, "Expected user in response"
    assert data["user"]["email"] == email.lower(), "Email should be lowercase"
    assert data["user"]["loyaltyPoints"] == 0, "New user should have 0 loyalty points"
    assert data["user"]["role"] == "customer", "Role should be customer"
    
    customer_token = data["token"]
    customer_user = data["user"]
    log(f"✅ Signup successful: {customer_user['email']}, loyaltyPoints={customer_user['loyaltyPoints']}")
    
    # Test duplicate email
    resp2 = requests.post(f"{BASE_URL}/auth/signup", json=payload)
    assert resp2.status_code == 400, f"Duplicate email should return 400, got {resp2.status_code}"
    log("✅ Duplicate email correctly returns 400")

def test_auth_login_customer():
    """Test 2: POST /api/auth/login - customer login"""
    log("TEST 2: Customer login")
    
    payload = {
        "email": customer_user["email"],
        "password": "test1234"
    }
    
    resp = requests.post(f"{BASE_URL}/auth/login", json=payload)
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.text}"
    
    data = resp.json()
    assert data.get("ok") == True, "Expected ok:true"
    assert "token" in data, "Expected token"
    assert data["user"]["email"] == customer_user["email"], "Email should match"
    log(f"✅ Customer login successful")
    
    # Test wrong password
    wrong_payload = {
        "email": customer_user["email"],
        "password": "wrongpassword"
    }
    resp2 = requests.post(f"{BASE_URL}/auth/login", json=wrong_payload)
    assert resp2.status_code == 401, f"Wrong password should return 401, got {resp2.status_code}"
    log("✅ Wrong password correctly returns 401")

def test_auth_login_admin():
    """Test 3: POST /api/auth/login - admin login"""
    global admin_token
    log("TEST 3: Admin login")
    
    payload = {
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    }
    
    resp = requests.post(f"{BASE_URL}/auth/login", json=payload)
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.text}"
    
    data = resp.json()
    assert data.get("ok") == True, "Expected ok:true"
    assert "token" in data, "Expected token"
    assert data["user"]["role"] == "admin", f"Expected role=admin, got {data['user'].get('role')}"
    assert data["user"]["email"] == ADMIN_EMAIL.lower(), "Admin email should match"
    
    admin_token = data["token"]
    log(f"✅ Admin login successful, role={data['user']['role']}")

def test_auth_me():
    """Test 4: GET /api/auth/me - verify token"""
    log("TEST 4: Auth /me endpoint")
    
    # Valid customer token
    headers = {"Authorization": f"Bearer {customer_token}"}
    resp = requests.get(f"{BASE_URL}/auth/me", headers=headers)
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.text}"
    
    data = resp.json()
    assert "user" in data, "Expected user in response"
    assert data["user"]["email"] == customer_user["email"], "Email should match"
    log(f"✅ /me with valid token returns user")
    
    # Invalid token
    bad_headers = {"Authorization": "Bearer invalid.token.here"}
    resp2 = requests.get(f"{BASE_URL}/auth/me", headers=bad_headers)
    assert resp2.status_code == 401, f"Invalid token should return 401, got {resp2.status_code}"
    log("✅ /me with invalid token returns 401")
    
    # No token
    resp3 = requests.get(f"{BASE_URL}/auth/me")
    assert resp3.status_code == 401, f"No token should return 401, got {resp3.status_code}"
    log("✅ /me with no token returns 401")

def test_admin_endpoints_require_admin():
    """Test 5: Admin endpoints require admin token"""
    log("TEST 5: Admin endpoints authorization")
    
    endpoints = [
        "/admin/products",
        "/admin/coupons",
        "/admin/orders",
        "/admin/users",
        "/admin/stats"
    ]
    
    for endpoint in endpoints:
        # No token
        resp1 = requests.get(f"{BASE_URL}{endpoint}")
        assert resp1.status_code == 401, f"{endpoint} with no token should return 401, got {resp1.status_code}"
        
        # Customer token
        headers = {"Authorization": f"Bearer {customer_token}"}
        resp2 = requests.get(f"{BASE_URL}{endpoint}", headers=headers)
        assert resp2.status_code == 401, f"{endpoint} with customer token should return 401, got {resp2.status_code}"
        
        # Admin token
        admin_headers = {"Authorization": f"Bearer {admin_token}"}
        resp3 = requests.get(f"{BASE_URL}{endpoint}", headers=admin_headers)
        assert resp3.status_code == 200, f"{endpoint} with admin token should return 200, got {resp3.status_code}"
        
        log(f"✅ {endpoint}: 401 for customer/none, 200 for admin")

def test_admin_coupons_crud():
    """Test 6: Admin coupon CRUD operations"""
    global coupon_id_percent, coupon_id_flat
    log("TEST 6: Admin coupon CRUD")
    
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    
    # Create percent coupon
    percent_payload = {
        "code": "TEST10",
        "type": "percent",
        "value": 10,
        "minOrder": 1000,
        "expiresAt": (datetime.now() + timedelta(days=30)).isoformat()
    }
    resp1 = requests.post(f"{BASE_URL}/admin/coupons", json=percent_payload, headers=admin_headers)
    assert resp1.status_code == 201, f"Expected 201, got {resp1.status_code}: {resp1.text}"
    data1 = resp1.json()
    assert "coupon" in data1, "Expected coupon in response"
    assert "id" in data1["coupon"], "Expected UUID id"
    assert data1["coupon"]["code"] == "TEST10", "Code should be TEST10"
    assert data1["coupon"]["type"] == "percent", "Type should be percent"
    coupon_id_percent = data1["coupon"]["id"]
    log(f"✅ Created percent coupon: {coupon_id_percent}")
    
    # Create flat coupon
    flat_payload = {
        "code": "FLAT200",
        "type": "flat",
        "value": 200,
        "minOrder": 500
    }
    resp2 = requests.post(f"{BASE_URL}/admin/coupons", json=flat_payload, headers=admin_headers)
    assert resp2.status_code == 201, f"Expected 201, got {resp2.status_code}: {resp2.text}"
    data2 = resp2.json()
    coupon_id_flat = data2["coupon"]["id"]
    log(f"✅ Created flat coupon: {coupon_id_flat}")
    
    # List coupons
    resp3 = requests.get(f"{BASE_URL}/admin/coupons", headers=admin_headers)
    assert resp3.status_code == 200, f"Expected 200, got {resp3.status_code}"
    data3 = resp3.json()
    assert "coupons" in data3, "Expected coupons array"
    assert len(data3["coupons"]) >= 2, "Should have at least 2 coupons"
    log(f"✅ Listed coupons: {len(data3['coupons'])} total")
    
    # Toggle active
    toggle_payload = {"active": False}
    resp4 = requests.put(f"{BASE_URL}/admin/coupons/{coupon_id_percent}", json=toggle_payload, headers=admin_headers)
    assert resp4.status_code == 200, f"Expected 200, got {resp4.status_code}"
    data4 = resp4.json()
    assert data4["coupon"]["active"] == False, "Coupon should be inactive"
    log(f"✅ Toggled coupon to inactive")
    
    # Toggle back to active
    toggle_back = {"active": True}
    resp5 = requests.put(f"{BASE_URL}/admin/coupons/{coupon_id_percent}", json=toggle_back, headers=admin_headers)
    assert resp5.status_code == 200, f"Expected 200, got {resp5.status_code}"
    log(f"✅ Toggled coupon back to active")

def test_coupon_validate():
    """Test 7: GET /api/coupons/validate - coupon validation and math"""
    log("TEST 7: Coupon validation")
    
    # Percent coupon: 10% of 2499 = 250 (rounded)
    resp1 = requests.get(f"{BASE_URL}/coupons/validate?code=TEST10&subtotal=2499")
    assert resp1.status_code == 200, f"Expected 200, got {resp1.status_code}: {resp1.text}"
    data1 = resp1.json()
    expected_discount = round(2499 * 10 / 100)  # 250
    assert data1["discount"] == expected_discount, f"Expected discount {expected_discount}, got {data1['discount']}"
    assert data1["coupon"]["code"] == "TEST10", "Coupon code should match"
    log(f"✅ Percent coupon: 10% of ₹2499 = ₹{data1['discount']}")
    
    # Flat coupon: min(200, 1500) = 200
    resp2 = requests.get(f"{BASE_URL}/coupons/validate?code=FLAT200&subtotal=1500")
    assert resp2.status_code == 200, f"Expected 200, got {resp2.status_code}"
    data2 = resp2.json()
    assert data2["discount"] == 200, f"Expected discount 200, got {data2['discount']}"
    log(f"✅ Flat coupon: min(200, 1500) = ₹{data2['discount']}")
    
    # Flat coupon with subtotal < value but > minOrder: min(200, 150) = 150
    # First create a coupon without minOrder for this test
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    small_flat = {
        "code": "FLAT150TEST",
        "type": "flat",
        "value": 150,
        "minOrder": 0
    }
    resp_create = requests.post(f"{BASE_URL}/admin/coupons", json=small_flat, headers=admin_headers)
    small_coupon_id = resp_create.json()["coupon"]["id"]
    
    resp3 = requests.get(f"{BASE_URL}/coupons/validate?code=FLAT150TEST&subtotal=100")
    assert resp3.status_code == 200, f"Expected 200, got {resp3.status_code}"
    data3 = resp3.json()
    assert data3["discount"] == 100, f"Expected discount 100 (capped at subtotal), got {data3['discount']}"
    log(f"✅ Flat coupon capped: min(150, 100) = ₹{data3['discount']}")
    
    # Clean up
    requests.delete(f"{BASE_URL}/admin/coupons/{small_coupon_id}", headers=admin_headers)
    
    # Below minOrder (TEST10 requires 1000)
    resp4 = requests.get(f"{BASE_URL}/coupons/validate?code=TEST10&subtotal=500")
    assert resp4.status_code == 400, f"Below minOrder should return 400, got {resp4.status_code}"
    log(f"✅ Below minOrder correctly returns 400")
    
    # Inactive coupon - first deactivate
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    requests.put(f"{BASE_URL}/admin/coupons/{coupon_id_flat}", json={"active": False}, headers=admin_headers)
    resp5 = requests.get(f"{BASE_URL}/coupons/validate?code=FLAT200&subtotal=1000")
    assert resp5.status_code == 400, f"Inactive coupon should return 400, got {resp5.status_code}"
    log(f"✅ Inactive coupon correctly returns 400")
    
    # Reactivate for later tests
    requests.put(f"{BASE_URL}/admin/coupons/{coupon_id_flat}", json={"active": True}, headers=admin_headers)

def test_order_creation_with_coupon_and_loyalty():
    """Test 8: POST /api/orders - order with coupon and loyalty redemption"""
    global order_id_for_delivery, customer_user
    log("TEST 8: Order creation with coupon and loyalty")
    
    # First, give customer some loyalty points
    # We'll create and deliver an order to earn points
    headers = {"Authorization": f"Bearer {customer_token}"}
    
    # Create first order to earn points
    order1_payload = {
        "items": [
            {"name": "Test Product", "price": 1000, "quantity": 1, "size": "M"}
        ]
    }
    resp1 = requests.post(f"{BASE_URL}/orders", json=order1_payload, headers=headers)
    assert resp1.status_code == 201, f"Expected 201, got {resp1.status_code}: {resp1.text}"
    data1 = resp1.json()
    first_order_id = data1["order"]["id"]
    assert data1["order"]["subtotal"] == 1000, "Subtotal should be 1000"
    assert data1["order"]["total"] == 1000, "Total should be 1000"
    assert data1["order"]["pointsEarned"] == 100, "Should earn 100 points"
    log(f"✅ Created first order: {first_order_id}, pointsEarned=100")
    
    # Deliver the order to credit points
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    resp2 = requests.put(f"{BASE_URL}/admin/orders/{first_order_id}", json={"status": "delivered"}, headers=admin_headers)
    assert resp2.status_code == 200, f"Expected 200, got {resp2.status_code}"
    log(f"✅ Delivered first order, customer should now have 100 points")
    
    # Verify customer has 100 points
    resp3 = requests.get(f"{BASE_URL}/auth/me", headers=headers)
    data3 = resp3.json()
    customer_user = data3["user"]
    assert customer_user["loyaltyPoints"] == 100, f"Expected 100 points, got {customer_user['loyaltyPoints']}"
    log(f"✅ Customer now has {customer_user['loyaltyPoints']} loyalty points")
    
    # Create order with coupon and loyalty redemption
    # Subtotal: 2500, Coupon TEST10 (10%): -250, Loyalty 100pts (₹25): -25, Total: 2225
    order2_payload = {
        "items": [
            {"name": "Premium Product", "price": 2500, "quantity": 1, "size": "L"}
        ],
        "couponCode": "TEST10",
        "redeemPoints": 100
    }
    resp4 = requests.post(f"{BASE_URL}/orders", json=order2_payload, headers=headers)
    assert resp4.status_code == 201, f"Expected 201, got {resp4.status_code}: {resp4.text}"
    data4 = resp4.json()
    order_id_for_delivery = data4["order"]["id"]
    
    assert data4["order"]["subtotal"] == 2500, f"Expected subtotal 2500, got {data4['order']['subtotal']}"
    assert data4["order"]["couponDiscount"] == 250, f"Expected coupon discount 250, got {data4['order']['couponDiscount']}"
    assert data4["order"]["pointsRedeemed"] == 100, f"Expected pointsRedeemed 100, got {data4['order']['pointsRedeemed']}"
    assert data4["order"]["pointsDiscount"] == 25, f"Expected pointsDiscount 25, got {data4['order']['pointsDiscount']}"
    assert data4["order"]["total"] == 2225, f"Expected total 2225, got {data4['order']['total']}"
    assert data4["order"]["pointsEarned"] == 100, "Should earn 100 points on delivery"
    log(f"✅ Order created: subtotal=2500, coupon=-250, loyalty=-25, total=2225")
    
    # Verify customer points decreased immediately
    resp5 = requests.get(f"{BASE_URL}/auth/me", headers=headers)
    data5 = resp5.json()
    assert data5["user"]["loyaltyPoints"] == 0, f"Expected 0 points after redemption, got {data5['user']['loyaltyPoints']}"
    log(f"✅ Customer points decreased immediately to {data5['user']['loyaltyPoints']}")

def test_order_delivery_loyalty_credit():
    """Test 9: PUT /api/admin/orders/{id} - delivery credits loyalty once"""
    log("TEST 9: Order delivery loyalty credit (idempotent)")
    
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    customer_headers = {"Authorization": f"Bearer {customer_token}"}
    
    # Deliver the order
    resp1 = requests.put(f"{BASE_URL}/admin/orders/{order_id_for_delivery}", json={"status": "delivered"}, headers=admin_headers)
    assert resp1.status_code == 200, f"Expected 200, got {resp1.status_code}: {resp1.text}"
    log(f"✅ Delivered order {order_id_for_delivery}")
    
    # Check customer points (should be 100 now)
    resp2 = requests.get(f"{BASE_URL}/auth/me", headers=customer_headers)
    data2 = resp2.json()
    points_after_first = data2["user"]["loyaltyPoints"]
    assert points_after_first == 100, f"Expected 100 points after delivery, got {points_after_first}"
    log(f"✅ Customer has {points_after_first} points after first delivery")
    
    # Deliver again (should not double credit)
    resp3 = requests.put(f"{BASE_URL}/admin/orders/{order_id_for_delivery}", json={"status": "delivered"}, headers=admin_headers)
    assert resp3.status_code == 200, f"Expected 200, got {resp3.status_code}"
    log(f"✅ Delivered order again (idempotent test)")
    
    # Check customer points (should still be 100)
    resp4 = requests.get(f"{BASE_URL}/auth/me", headers=customer_headers)
    data4 = resp4.json()
    points_after_second = data4["user"]["loyaltyPoints"]
    assert points_after_second == 100, f"Expected 100 points (no double credit), got {points_after_second}"
    log(f"✅ Customer still has {points_after_second} points (no double credit)")

def test_admin_products_crud():
    """Test 10: Admin product CRUD"""
    log("TEST 10: Admin product CRUD")
    
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    
    # Create product
    product_payload = {
        "name": "Test 404 Product",
        "slug": test_product_slug,
        "price": 1999,
        "category": "Tshirt",
        "color": "Black",
        "description": "Test product for API testing"
    }
    resp1 = requests.post(f"{BASE_URL}/admin/products", json=product_payload, headers=admin_headers)
    assert resp1.status_code == 201, f"Expected 201, got {resp1.status_code}: {resp1.text}"
    data1 = resp1.json()
    assert "product" in data1, "Expected product in response"
    assert data1["product"]["slug"] == test_product_slug, "Slug should match"
    log(f"✅ Created product: {test_product_slug}")
    
    # Get product by slug
    resp2 = requests.get(f"{BASE_URL}/products/{test_product_slug}")
    assert resp2.status_code == 200, f"Expected 200, got {resp2.status_code}"
    data2 = resp2.json()
    assert "product" in data2, "Expected product in response"
    assert data2["product"]["slug"] == test_product_slug, "Slug should match"
    log(f"✅ Retrieved product: {test_product_slug}")
    
    # Delete product
    resp3 = requests.delete(f"{BASE_URL}/admin/products/{test_product_slug}", headers=admin_headers)
    assert resp3.status_code == 200, f"Expected 200, got {resp3.status_code}"
    log(f"✅ Deleted product: {test_product_slug}")
    
    # Verify deletion
    resp4 = requests.get(f"{BASE_URL}/products/{test_product_slug}")
    assert resp4.status_code == 404, f"Deleted product should return 404, got {resp4.status_code}"
    log(f"✅ Verified product deletion (404)")

def test_wishlist_lookup():
    """Test 11: GET /api/wishlist/lookup?slugs=a,b"""
    log("TEST 11: Wishlist lookup")
    
    # Get some real product slugs first
    resp1 = requests.get(f"{BASE_URL}/products?limit=3")
    assert resp1.status_code == 200, f"Expected 200, got {resp1.status_code}"
    data1 = resp1.json()
    products = data1["products"]
    assert len(products) >= 2, "Need at least 2 products"
    
    slug1 = products[0]["slug"]
    slug2 = products[1]["slug"]
    
    # Lookup by slugs
    resp2 = requests.get(f"{BASE_URL}/wishlist/lookup?slugs={slug1},{slug2}")
    assert resp2.status_code == 200, f"Expected 200, got {resp2.status_code}"
    data2 = resp2.json()
    assert "products" in data2, "Expected products array"
    assert len(data2["products"]) == 2, f"Expected 2 products, got {len(data2['products'])}"
    
    returned_slugs = [p["slug"] for p in data2["products"]]
    assert slug1 in returned_slugs, f"Expected {slug1} in results"
    assert slug2 in returned_slugs, f"Expected {slug2} in results"
    log(f"✅ Wishlist lookup returned {len(data2['products'])} products for slugs: {slug1}, {slug2}")

def test_node_syntax():
    """Test 12: Node syntax check"""
    log("TEST 12: Node syntax check")
    
    import subprocess
    
    files = [
        "/app/app/api/[[...path]]/route.js",
        "/app/lib/auth.js",
        "/app/lib/session.js",
        "/app/lib/seed.js",
        "/app/lib/mongo.js"
    ]
    
    for file_path in files:
        result = subprocess.run(
            ["node", "--check", file_path],
            capture_output=True,
            text=True
        )
        assert result.returncode == 0, f"Syntax error in {file_path}: {result.stderr}"
        log(f"✅ Syntax check passed: {file_path}")

def test_coupon_delete():
    """Test 13: DELETE /api/admin/coupons/{id}"""
    log("TEST 13: Delete coupons")
    
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    
    # Delete percent coupon
    resp1 = requests.delete(f"{BASE_URL}/admin/coupons/{coupon_id_percent}", headers=admin_headers)
    assert resp1.status_code == 200, f"Expected 200, got {resp1.status_code}"
    log(f"✅ Deleted percent coupon: {coupon_id_percent}")
    
    # Delete flat coupon
    resp2 = requests.delete(f"{BASE_URL}/admin/coupons/{coupon_id_flat}", headers=admin_headers)
    assert resp2.status_code == 200, f"Expected 200, got {resp2.status_code}"
    log(f"✅ Deleted flat coupon: {coupon_id_flat}")

def run_all_tests():
    """Run all backend tests in sequence"""
    print("\n" + "="*80)
    print("THE 404 STORE - Comprehensive Backend API Test Suite")
    print("="*80 + "\n")
    
    tests = [
        ("Auth Signup", test_auth_signup),
        ("Auth Login (Customer)", test_auth_login_customer),
        ("Auth Login (Admin)", test_auth_login_admin),
        ("Auth /me Endpoint", test_auth_me),
        ("Admin Endpoints Authorization", test_admin_endpoints_require_admin),
        ("Admin Coupon CRUD", test_admin_coupons_crud),
        ("Coupon Validation & Math", test_coupon_validate),
        ("Order with Coupon & Loyalty", test_order_creation_with_coupon_and_loyalty),
        ("Order Delivery Loyalty Credit", test_order_delivery_loyalty_credit),
        ("Admin Product CRUD", test_admin_products_crud),
        ("Wishlist Lookup", test_wishlist_lookup),
        ("Node Syntax Check", test_node_syntax),
        ("Coupon Deletion", test_coupon_delete),
    ]
    
    passed = 0
    failed = 0
    
    for name, test_func in tests:
        try:
            test_func()
            passed += 1
            print(f"\n✅ PASSED: {name}\n")
        except AssertionError as e:
            failed += 1
            print(f"\n❌ FAILED: {name}")
            print(f"   Error: {str(e)}\n")
        except Exception as e:
            failed += 1
            print(f"\n❌ ERROR: {name}")
            print(f"   Exception: {str(e)}\n")
    
    print("\n" + "="*80)
    print(f"Test Results: {passed} passed, {failed} failed out of {len(tests)} total")
    print("="*80 + "\n")
    
    return failed == 0

if __name__ == "__main__":
    success = run_all_tests()
    exit(0 if success else 1)
