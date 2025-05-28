## User Routes

### 1. User Signup

```bash
curl -X POST http://localhost:3000/user/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "phone": 1234567890
  }'
```

### 2. User Signin

```bash
curl -X POST http://localhost:3000/user/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 3. Update User

```bash
curl -X PATCH http://localhost:3000/user/test@example.com \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "phone": 9876543210
  }'
```

### 4. Delete User

```bash
curl -X DELETE http://localhost:3000/user/test@example.com
```

## Product Routes

### 1. Get All Products

```bash
curl -X GET http://localhost:3000/product
```

### 2. Get Product by ID

```bash
curl -X GET http://localhost:3000/product/[PRODUCT_ID]
```

### 3. Create Product (requires authentication)

```bash
curl -X POST http://localhost:3000/product \
  -H "Content-Type: application/json" \
  -H "x-access-token: YOUR_JWT_TOKEN" \
  -d '{
    "name": "Product Name",
    "description": "Product Description",
    "price": 99.99,
    "category": "Tools",
    "location": "City, State",
    "renting": {
      "days": 99.99,
      "weeks": 299.99
    }
  }'
```

## Review Routes

### 1. Create a Review (requires authentication)

```bash
curl -X POST http://localhost:3000/review \
  -H "Content-Type: application/json" \
  -H "x-access-token: YOUR_JWT_TOKEN" \
  -d '{
    "productId": "PRODUCT_ID_HERE",
    "rating": 5,
    "comment": "This is an excellent product! Highly recommended."
  }'
```

### 2. Get Reviews for a Product

```bash
curl -X GET http://localhost:3000/review/product/PRODUCT_ID_HERE
```

### 3. Get Review Statistics for a Product

```bash
curl -X GET http://localhost:3000/review/stats/PRODUCT_ID_HERE
```

### 4. Update a Review (requires authentication)

```bash
curl -X PUT http://localhost:3000/review/REVIEW_ID_HERE \
  -H "Content-Type: application/json" \
  -H "x-access-token: YOUR_JWT_TOKEN" \
  -d '{
    "rating": 4,
    "comment": "Updated review comment - still a good product!"
  }'
```

### 5. Delete a Review (requires authentication)

```bash
curl -X DELETE http://localhost:3000/review/REVIEW_ID_HERE \
  -H "x-access-token: YOUR_JWT_TOKEN"
```

## Checkout Routes

### 1. Create a New Order (requires authentication)

```bash
curl -X POST http://localhost:3000/checkout \
  -H "Content-Type: application/json" \
  -H "x-access-token: YOUR_JWT_TOKEN" \
  -d '{
    "products": [
      {
        "productId": "PRODUCT_ID_HERE",
        "name": "Industrial Drill",
        "price": 25.00,
        "rentalDuration": "days",
        "rentalPeriod": 3
      },
      {
        "productId": "ANOTHER_PRODUCT_ID",
        "name": "Safety Helmet",
        "price": 5.00,
        "rentalDuration": "days",
        "rentalPeriod": 3
      }
    ],
    "address": {
      "label": "Home",
      "type": "Home",
      "fullAddress": "2118 Thornridge Cir. Syracuse, Connecticut 35624",
      "phone": "(209) 555-0104"
    },
    "subtotal": 90.00,
    "tax": 7.20,
    "total": 97.20,
    "paymentMethod": "card"
  }'
```

### 2. Get User Orders (requires authentication)

```bash
curl -X GET http://localhost:3000/checkout/my-orders \
  -H "x-access-token: YOUR_JWT_TOKEN"
```

### 3. Get Order by ID (requires authentication)

```bash
curl -X GET http://localhost:3000/checkout/ORDER_ID_HERE \
  -H "x-access-token: YOUR_JWT_TOKEN"
```

### 4. Update Order Status (requires authentication)

```bash
curl -X PATCH http://localhost:3000/checkout/ORDER_ID_HERE \
  -H "Content-Type: application/json" \
  -H "x-access-token: YOUR_JWT_TOKEN" \
  -d '{
    "status": "cancelled"
  }'
```

## Payment Routes

### 1. Process a Payment (requires authentication)

```bash
curl -X POST http://localhost:3000/payment/process \
  -H "Content-Type: application/json" \
  -H "x-access-token: YOUR_JWT_TOKEN" \
  -d '{
    "orderId": "ORDER_ID_HERE",
    "paymentMethod": "card",
    "paymentDetails": {
      "cardholderName": "John Doe",
      "last4": "4242",
      "expiryDate": "12/25"
    }
  }'
```

### 2. Get Payment Details for an Order (requires authentication)

```bash
curl -X GET http://localhost:3000/payment/order/ORDER_ID_HERE \
  -H "x-access-token: YOUR_JWT_TOKEN"
```

Note: For any protected routes requiring authentication, you'll need to include the JWT token received during login:

```bash
curl -X GET http://localhost:3000/protected-route \
  -H "x-access-token: YOUR_JWT_TOKEN"
```

To test the server connection:

```bash
curl http://localhost:3000
```
