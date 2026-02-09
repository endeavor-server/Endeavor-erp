#!/bin/sh
# =============================================================================
# Docker Health Check Script
# Used by Dockerfile HEALTHCHECK instruction
# =============================================================================

# Check if nginx is running
if ! pgrep -x "nginx" > /dev/null; then
    echo "Nginx is not running"
    exit 1
fi

# Check if nginx is responding to health endpoint
if ! wget --no-verbose --tries=1 --spider --timeout=5 http://localhost/health 2>/dev/null; then
    echo "Health endpoint not responding"
    exit 1
fi

# Check if static files are accessible
if [ ! -f /usr/share/nginx/html/index.html ]; then
    echo "Static files not found"
    exit 1
fi

# All checks passed
echo "Health check passed"
exit 0
