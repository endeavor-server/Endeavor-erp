#!/bin/bash
# Deploy Endeavor CRM + Supabase to Coolify
# Usage: ./deploy-to-coolify.sh [ENVIRONMENT]

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Deploying Endeavor SUPER CRM to Coolify...${NC}"

# Configuration
COOLIFY_URL="https://coolify.endeavoracademy.us"
COOLIFY_TOKEN="1|M0sPjnOn4HJkXVjqLvdysAWaNyruJcHPeJJ2SaNJfd51bf7f"
PROJECT_UUID="skgcc8okg8sgs44occg44gww"
ENV_UUID="bossg0w40ko8g4w8gwo8so4c"
SERVER_UUID="jkk4o4804ggsgkw4k40okow4"

# Check if running in Coolify environment
if [ -z "$GIT_REPOSITORY" ]; then
    echo -e "${YELLOW}⚠️  Please set your GitHub repository URL:${NC}"
    echo "export GIT_REPOSITORY=https://github.com/YOUR_USERNAME/endeavor-super-crm"
    exit 1
fi

echo -e "${GREEN}📦 Step 1: Creating CRM Application...${NC}"

# Create CRM Application
response=$(curl -s -X POST \
    -H "Authorization: Bearer $COOLIFY_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
        \"project_uuid\": \"$PROJECT_UUID\",
        \"environment_uuid\": \"$ENV_UUID\",
        \"server_uuid\": \"$SERVER_UUID\",
        \"git_repository\": \"$GIT_REPOSITORY\",
        \"git_branch\": \"main\",
        \"build_pack\": \"dockerfile\",
        \"name\": \"Endeavor Super CRM\",
        \"description\": \"Enterprise CRM with GST compliance - 900+ workforce\",
        \"ports_exposes\": \"80\",
        \"instant_deploy\": false
    }" \
    "$COOLIFY_URL/api/v1/applications/public" 2>&1)

if echo "$response" | grep -q "error\|message"; then
    echo -e "${RED}❌ Failed to create application${NC}"
    echo "$response"
    exit 1
fi

echo -e "${GREEN}✅ CRM Application created${NC}"
echo "$response" | python3 -m json.tool 2>/dev/null || echo "$response"

# Extract application UUID
APP_UUID=$(echo "$response" | grep -o '"uuid":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$APP_UUID" ]; then
    echo -e "${YELLOW}⚠️  Could not extract app UUID. Please check manually in Coolify UI.${NC}"
    exit 1
fi

echo -e "${GREEN}📋 App UUID: $APP_UUID${NC}"

echo -e "${GREEN}⚙️  Step 2: Setting Environment Variables...${NC}"

# Note: Coolify API for env vars may need different endpoint
# This is a placeholder - actual implementation depends on Coolify API
echo -e "${YELLOW}⚠️  Please set environment variables manually in Coolify UI:${NC}"
echo ""
echo "Required Variables:"
echo "  VITE_SUPABASE_URL=your-supabase-url"
echo "  VITE_SUPABASE_ANON_KEY=your-anon-key"
echo ""

echo -e "${GREEN}🎉 Deployment Configuration Complete!${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Go to: $COOLIFY_URL"
echo "2. Navigate to: Projects → Endeavor Academy → Endeavor Super CRM"
echo "3. Set environment variables (see above)"
echo "4. Click 'Deploy'"
echo ""
echo -e "${GREEN}Expected URL after deploy: https://endeavor-super-crm.endeavoracademy.us${NC}"
