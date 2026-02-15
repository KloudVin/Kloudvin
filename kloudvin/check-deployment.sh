#!/bin/bash

echo "========================================="
echo "  KloudVin Deployment Monitor"
echo "========================================="
echo ""

# Test the Data API endpoint
echo "Testing Data API endpoint..."
RESPONSE=$(curl -s "https://kloudvin.com/data-api/rest/Article?\$orderby=created_at%20desc")
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://kloudvin.com/data-api/rest/Article?\$orderby=created_at%20desc")

echo "HTTP Status: $HTTP_STATUS"
echo ""

if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ Data API is working!"
    echo ""
    echo "Response preview:"
    echo "$RESPONSE" | head -20
else
    echo "❌ Data API returned error: $HTTP_STATUS"
    echo ""
    echo "Response:"
    echo "$RESPONSE"
fi

echo ""
echo "========================================="
echo "Checking Azure deployment status..."
echo "========================================="
az staticwebapp environment list --name kloudvin --resource-group Kloudvin --query "[?name=='default'].{Status:status,LastUpdated:lastUpdatedOn}" --output table
