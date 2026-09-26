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

def test_password_forgot_reset_flow():
    """Test 14: Password reset flow - forgot, reset, login with new password"""
    log("TEST 14: Password reset flow")
    
    # Create a new user for this test
    reset_email = f"resettest{int(time.time())}@404test.com"
    old_password = "oldpass123"
    new_password = "newpass456"
    
    # Signup
    signup_payload = {
        "name": "Reset Test User",
        "email": reset_email,
        "password": old_password
    }
    resp1 = requests.post(f"{BASE_URL}/auth/signup", json=signup_payload)
    assert resp1.status_code == 201, f"Expected 201, got {resp1.status_code}: {resp1.text}"
    log(f"✅ Created test user: {reset_email}")
    
    # Test forgot with existing email
    forgot_payload = {"email": reset_email}
    resp2 = requests.post(f"{BASE_URL}/auth/forgot", json=forgot_payload)
    assert resp2.status_code == 200, f"Expected 200, got {resp2.status_code}: {resp2.text}"
    data2 = resp2.json()
    assert data2.get("ok") == True, "Expected ok:true"
    assert "code" in data2, "Expected code in response"
    assert "email" in data2, "Expected email in response"
    assert data2["email"] == reset_email.lower(), "Email should match"
    reset_code = data2["code"]
    assert len(reset_code) == 6, f"Code should be 6 digits, got {len(reset_code)}"
    assert reset_code.isdigit(), f"Code should be numeric, got {reset_code}"
    log(f"✅ Forgot password returned 6-digit code: {reset_code}")
    
    # Test forgot with unknown email
    resp3 = requests.post(f"{BASE_URL}/auth/forgot", json={"email": "unknown@404test.com"})
    assert resp3.status_code == 404, f"Unknown email should return 404, got {resp3.status_code}"
    data3 = resp3.json()
    assert "error" in data3, "Expected error message"
    log(f"✅ Forgot with unknown email correctly returns 404")
    
    # Test reset with invalid code
    invalid_reset = {
        "email": reset_email,
        "code": "999999",
        "password": new_password
    }
    resp4 = requests.post(f"{BASE_URL}/auth/reset", json=invalid_reset)
    assert resp4.status_code == 400, f"Invalid code should return 400, got {resp4.status_code}"
    log(f"✅ Reset with invalid code correctly returns 400")
    
    # Test reset with missing fields
    resp5 = requests.post(f"{BASE_URL}/auth/reset", json={"email": reset_email})
    assert resp5.status_code == 400, f"Missing fields should return 400, got {resp5.status_code}"
    log(f"✅ Reset with missing fields correctly returns 400")
    
    # Test reset with valid code
    valid_reset = {
        "email": reset_email,
        "code": reset_code,
        "password": new_password
    }
    resp6 = requests.post(f"{BASE_URL}/auth/reset", json=valid_reset)
    assert resp6.status_code == 200, f"Expected 200, got {resp6.status_code}: {resp6.text}"
    data6 = resp6.json()
    assert data6.get("ok") == True, "Expected ok:true"
    assert "token" in data6, "Expected token in response"
    assert "user" in data6, "Expected user in response"
    new_token = data6["token"]
    log(f"✅ Reset password successful, received new token")
    
    # Test code reuse (should fail)
    resp7 = requests.post(f"{BASE_URL}/auth/reset", json=valid_reset)
    assert resp7.status_code == 400, f"Code reuse should return 400, got {resp7.status_code}"
    data7 = resp7.json()
    assert "error" in data7, "Expected error message"
    assert "Invalid reset" in data7["error"] or "Invalid reset code" in data7["error"], f"Expected 'Invalid reset request' or 'Invalid reset code', got {data7['error']}"
    log(f"✅ Code reuse correctly returns 400 with error: {data7['error']}")
    
    # Test login with old password (should fail)
    old_login = {
        "email": reset_email,
        "password": old_password
    }
    resp8 = requests.post(f"{BASE_URL}/auth/login", json=old_login)
    assert resp8.status_code == 401, f"Login with old password should return 401, got {resp8.status_code}"
    log(f"✅ Login with old password correctly fails (401)")
    
    # Test login with new password (should succeed)
    new_login = {
        "email": reset_email,
        "password": new_password
    }
    resp9 = requests.post(f"{BASE_URL}/auth/login", json=new_login)
    assert resp9.status_code == 200, f"Expected 200, got {resp9.status_code}: {resp9.text}"
    data9 = resp9.json()
    assert data9.get("ok") == True, "Expected ok:true"
    assert "token" in data9, "Expected token"
    log(f"✅ Login with new password successful")

def test_public_order_tracking():
    """Test 15: GET /api/track/{orderId} - public endpoint"""
    log("TEST 15: Public order tracking")
    
    # Create an order first
    headers = {"Authorization": f"Bearer {customer_token}"}
    order_payload = {
        "items": [
            {"name": "Tracking Test Product", "price": 1500, "quantity": 1, "size": "M", "slug": "test-track"}
        ]
    }
    resp1 = requests.post(f"{BASE_URL}/orders", json=order_payload, headers=headers)
    assert resp1.status_code == 201, f"Expected 201, got {resp1.status_code}: {resp1.text}"
    data1 = resp1.json()
    track_order_id = data1["order"]["id"]
    log(f"✅ Created order for tracking: {track_order_id}")
    
    # Test public tracking WITHOUT auth (should work)
    resp2 = requests.get(f"{BASE_URL}/track/{track_order_id}")
    assert resp2.status_code == 200, f"Expected 200, got {resp2.status_code}: {resp2.text}"
    data2 = resp2.json()
    assert "order" in data2, "Expected order in response"
    order = data2["order"]
    
    # Verify required fields
    assert order["id"] == track_order_id, "Order ID should match"
    assert "status" in order, "Expected status field"
    assert "createdAt" in order, "Expected createdAt field"
    assert "items" in order, "Expected items array"
    assert "total" in order, "Expected total field"
    assert "customerName" in order, "Expected customerName field"
    assert "pointsEarned" in order, "Expected pointsEarned field"
    assert order["total"] == 1500, f"Expected total 1500, got {order['total']}"
    assert order["pointsEarned"] == 100, f"Expected pointsEarned 100, got {order['pointsEarned']}"
    assert len(order["items"]) == 1, f"Expected 1 item, got {len(order['items'])}"
    log(f"✅ Public tracking returned order with all required fields")
    
    # Test tracking with unknown order ID
    resp3 = requests.get(f"{BASE_URL}/track/unknown-order-id-12345")
    assert resp3.status_code == 404, f"Unknown order should return 404, got {resp3.status_code}"
    data3 = resp3.json()
    assert "error" in data3, "Expected error message"
    log(f"✅ Tracking unknown order correctly returns 404")

def test_order_status_timestamps():
    """Test 16: Order status updates with shippedAt and deliveredAt timestamps"""
    log("TEST 16: Order status timestamps")
    
    # Create an order
    headers = {"Authorization": f"Bearer {customer_token}"}
    order_payload = {
        "items": [
            {"name": "Timestamp Test Product", "price": 2000, "quantity": 1, "size": "L", "slug": "test-timestamp"}
        ]
    }
    resp1 = requests.post(f"{BASE_URL}/orders", json=order_payload, headers=headers)
    assert resp1.status_code == 201, f"Expected 201, got {resp1.status_code}: {resp1.text}"
    data1 = resp1.json()
    timestamp_order_id = data1["order"]["id"]
    log(f"✅ Created order for timestamp test: {timestamp_order_id}")
    
    # Update status to 'shipped'
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    resp2 = requests.put(f"{BASE_URL}/admin/orders/{timestamp_order_id}", json={"status": "shipped"}, headers=admin_headers)
    assert resp2.status_code == 200, f"Expected 200, got {resp2.status_code}: {resp2.text}"
    data2 = resp2.json()
    assert data2["order"]["status"] == "shipped", "Status should be shipped"
    assert "shippedAt" in data2["order"], "Expected shippedAt field"
    assert data2["order"]["shippedAt"] is not None, "shippedAt should not be null"
    shipped_at = data2["order"]["shippedAt"]
    log(f"✅ Order status updated to 'shipped', shippedAt: {shipped_at}")
    
    # Verify shippedAt is an ISO string
    try:
        from dateutil import parser
        parsed_shipped = parser.isoparse(shipped_at)
        log(f"✅ shippedAt is valid ISO string: {shipped_at}")
    except:
        # Fallback if dateutil not available
        assert "T" in shipped_at or "-" in shipped_at, f"shippedAt should be ISO format, got {shipped_at}"
        log(f"✅ shippedAt appears to be ISO format: {shipped_at}")
    
    # Update status to 'delivered'
    resp3 = requests.put(f"{BASE_URL}/admin/orders/{timestamp_order_id}", json={"status": "delivered"}, headers=admin_headers)
    assert resp3.status_code == 200, f"Expected 200, got {resp3.status_code}: {resp3.text}"
    data3 = resp3.json()
    assert data3["order"]["status"] == "delivered", "Status should be delivered"
    assert "deliveredAt" in data3["order"], "Expected deliveredAt field"
    assert data3["order"]["deliveredAt"] is not None, "deliveredAt should not be null"
    delivered_at = data3["order"]["deliveredAt"]
    log(f"✅ Order status updated to 'delivered', deliveredAt: {delivered_at}")
    
    # Verify deliveredAt is an ISO string
    try:
        from dateutil import parser
        parsed_delivered = parser.isoparse(delivered_at)
        log(f"✅ deliveredAt is valid ISO string: {delivered_at}")
    except:
        assert "T" in delivered_at or "-" in delivered_at, f"deliveredAt should be ISO format, got {delivered_at}"
        log(f"✅ deliveredAt appears to be ISO format: {delivered_at}")
    
    # Verify both timestamps appear via public tracking
    resp4 = requests.get(f"{BASE_URL}/track/{timestamp_order_id}")
    assert resp4.status_code == 200, f"Expected 200, got {resp4.status_code}"
    data4 = resp4.json()
    track_order = data4["order"]
    assert track_order["shippedAt"] == shipped_at, f"shippedAt should match: expected {shipped_at}, got {track_order['shippedAt']}"
    assert track_order["deliveredAt"] == delivered_at, f"deliveredAt should match: expected {delivered_at}, got {track_order['deliveredAt']}"
    log(f"✅ Both timestamps visible via GET /api/track/{timestamp_order_id}")
    
    # Test idempotent loyalty credit (set delivered again)
    # Get customer points before
    resp5 = requests.get(f"{BASE_URL}/auth/me", headers=headers)
    data5 = resp5.json()
    points_before = data5["user"]["loyaltyPoints"]
    log(f"✅ Customer points before second delivery: {points_before}")
    
    # Set delivered again
    resp6 = requests.put(f"{BASE_URL}/admin/orders/{timestamp_order_id}", json={"status": "delivered"}, headers=admin_headers)
    assert resp6.status_code == 200, f"Expected 200, got {resp6.status_code}"
    log(f"✅ Set order to delivered again (idempotent test)")
    
    # Get customer points after
    resp7 = requests.get(f"{BASE_URL}/auth/me", headers=headers)
    data7 = resp7.json()
    points_after = data7["user"]["loyaltyPoints"]
    assert points_after == points_before, f"Points should not change on second delivery: before={points_before}, after={points_after}"
    log(f"✅ Customer points unchanged after second delivery: {points_after} (no double credit)")

def test_regression_existing_features():
    """Test 17: Regression check for existing features"""
    log("TEST 17: Regression check")
    
    # Test GET /api/products
    resp1 = requests.get(f"{BASE_URL}/products")
    assert resp1.status_code == 200, f"GET /api/products failed: {resp1.status_code}"
    data1 = resp1.json()
    assert "products" in data1, "Expected products array"
    assert len(data1["products"]) > 0, "Should have products"
    log(f"✅ GET /api/products works ({len(data1['products'])} products)")
    
    # Test GET /api/products/{slug} with non-existent slug
    resp2 = requests.get(f"{BASE_URL}/products/not-found-style-xyz")
    assert resp2.status_code == 404, f"Non-existent product should return 404, got {resp2.status_code}"
    log(f"✅ GET /api/products/not-found-style returns 404")
    
    # Test auth signup (create new user)
    signup_email = f"regression{int(time.time())}@404test.com"
    resp3 = requests.post(f"{BASE_URL}/auth/signup", json={
        "name": "Regression Test",
        "email": signup_email,
        "password": "test1234"
    })
    assert resp3.status_code == 201, f"Signup failed: {resp3.status_code}"
    regression_token = resp3.json()["token"]
    log(f"✅ POST /api/auth/signup works")
    
    # Test auth login
    resp4 = requests.post(f"{BASE_URL}/auth/login", json={
        "email": signup_email,
        "password": "test1234"
    })
    assert resp4.status_code == 200, f"Login failed: {resp4.status_code}"
    log(f"✅ POST /api/auth/login works")
    
    # Test coupon validation
    resp5 = requests.get(f"{BASE_URL}/coupons/validate?code=INVALID&subtotal=1000")
    assert resp5.status_code == 400, f"Invalid coupon should return 400, got {resp5.status_code}"
    log(f"✅ GET /api/coupons/validate works")
    
    # Test order creation
    headers = {"Authorization": f"Bearer {regression_token}"}
    resp6 = requests.post(f"{BASE_URL}/orders", json={
        "items": [{"name": "Regression Product", "price": 1000, "quantity": 1, "size": "M"}]
    }, headers=headers)
    assert resp6.status_code == 201, f"Order creation failed: {resp6.status_code}"
    log(f"✅ POST /api/orders works")
    
    # Test admin endpoints (already tested in detail, just verify they still work)
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    resp7 = requests.get(f"{BASE_URL}/admin/products", headers=admin_headers)
    assert resp7.status_code == 200, f"Admin products failed: {resp7.status_code}"
    log(f"✅ Admin CRUD endpoints work")
    
    log(f"✅ All regression checks passed")

def run_all_tests():
    """Run all backend tests in sequence"""
    print("\n" + "="*80)
    print("THE 404 STORE - Comprehensive Backend API Test Suite (Sequence 9)")
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
        ("Password Reset Flow", test_password_forgot_reset_flow),
        ("Public Order Tracking", test_public_order_tracking),
        ("Order Status Timestamps", test_order_status_timestamps),
        ("Regression Check", test_regression_existing_features),
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
