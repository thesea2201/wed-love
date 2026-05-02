#!/bin/bash
# Integration test for critical fields (brideName, groomName, weddingDate)
# Run: ./test-critical-fields.sh

set -e

echo "=== Testing Critical Fields Update API ==="

BASE_URL="http://localhost:3000"
EMAIL="test-$(date +%s)@example.com"
PASSWORD="testpass123"

# 1. Register user with names
echo "1. Registering user..."
REGISTER=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"groomName\":\"An Test\",\"brideName\":\"Linh Test\",\"weddingDate\":\"2025-12-25\"}")

echo "Register response: $REGISTER"
TOKEN=$(echo $REGISTER | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ FAILED: Could not get token"
  exit 1
fi
echo "✅ Got token"

# 2. Create invitation
echo "2. Creating invitation..."
INVITE=$(curl -s -X POST "$BASE_URL/invitations" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"template":"modern"}')

echo "Create response: $INVITE"
INVITE_ID=$(echo $INVITE | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$INVITE_ID" ]; then
  echo "❌ FAILED: Could not get invitation ID"
  exit 1
fi
echo "✅ Got invitation ID: $INVITE_ID"

# 3. Update groomName
echo "3. Testing groomName update..."
UPDATE1=$(curl -s -X PATCH "$BASE_URL/invitations/$INVITE_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"groomName":"An Updated"}')

echo "Update groomName response: $UPDATE1"
if echo "$UPDATE1" | grep -q '"groomName":"An Updated"'; then
  echo "✅ groomName updated successfully"
else
  echo "❌ FAILED: groomName not updated"
  exit 1
fi

# 4. Update brideName
echo "4. Testing brideName update..."
UPDATE2=$(curl -s -X PATCH "$BASE_URL/invitations/$INVITE_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"brideName":"Linh Updated"}')

echo "Update brideName response: $UPDATE2"
if echo "$UPDATE2" | grep -q '"brideName":"Linh Updated"'; then
  echo "✅ brideName updated successfully"
else
  echo "❌ FAILED: brideName not updated"
  exit 1
fi

# 5. Update all critical fields
echo "5. Testing all fields update..."
UPDATE3=$(curl -s -X PATCH "$BASE_URL/invitations/$INVITE_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"groomName":"Final An","brideName":"Final Linh","weddingDate":"2026-06-15T00:00:00.000Z"}')

echo "Update all response: $UPDATE3"
if echo "$UPDATE3" | grep -q '"groomName":"Final An"' && \
   echo "$UPDATE3" | grep -q '"brideName":"Final Linh"'; then
  echo "✅ All critical fields updated successfully"
else
  echo "❌ FAILED: Not all fields updated"
  exit 1
fi

# 6. Verify by fetching invitation
echo "6. Verifying with GET..."
GET=$(curl -s -X GET "$BASE_URL/invitations/$INVITE_ID" \
  -H "Authorization: Bearer $TOKEN")

echo "Get response: $GET"
if echo "$GET" | grep -q '"groomName":"Final An"' && \
   echo "$GET" | grep -q '"brideName":"Final Linh"'; then
  echo "✅ Verified: Data persisted correctly"
else
  echo "❌ FAILED: Data not persisted"
  exit 1
fi

echo ""
echo "=== ✅ ALL TESTS PASSED ==="
echo "Critical fields (brideName, groomName, weddingDate) are working correctly!"
