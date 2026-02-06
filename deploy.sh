#!/bin/bash

# Qosmos Deployment Script
# Usage: ./deploy.sh

set -e

# Configuration
DOMAIN="qosmos.one"
PROJECT_DIR="/home/www/qosmos"
BACKUP_DIR="/home/www/backups"
LOG_FILE="/var/log/qosmos-deploy.log"

echo "🚀 Starting Qosmos deployment..."

# Function to log
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a $LOG_FILE
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    log "⚠️  Please run as root (use sudo)"
    exit 1
fi

# 1. Build the project
log "📦 Building project..."
cd "$(dirname "$0")"
npm run build
log "✅ Build complete"

# 2. Create deployment directory
log "📁 Setting up directories..."
mkdir -p $PROJECT_DIR
mkdir -p $BACKUP_DIR
mkdir -p /var/log/nginx

# 3. Backup existing deployment
if [ -d "$PROJECT_DIR/out" ]; then
    log "💾 Backing up existing deployment..."
    BACKUP_NAME="qosmos-$(date +%Y%m%d-%H%M%S)"
    tar -czf $BACKUP_DIR/$BACKUP_NAME.tar.gz -C $PROJECT_DIR out subscribers.json .last_email_sent 2>/dev/null || true
    log "✅ Backup saved to $BACKUP_DIR/$BACKUP_NAME.tar.gz"
fi

# 4. Copy new files
log "📂 Copying new files..."
cp -r out $PROJECT_DIR/
cp server.js $PROJECT_DIR/
cp subscribers.json $PROJECT_DIR/
cp .last_email_sent $PROJECT_DIR/ 2>/dev/null || true

# 5. Set permissions
log "🔐 Setting permissions..."
chown -R www:www $PROJECT_DIR
chmod -R 755 $PROJECT_DIR

# 6. Install and configure Nginx
log "🌐 Configuring Nginx..."
cp deploy/nginx.conf /etc/nginx/sites-available/$DOMAIN
ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
nginx -t

# 7. Set up SSL with Let's Encrypt
log "🔒 Setting up SSL..."
if [ -f /etc/letsencrypt/live/$DOMAIN/fullchain.pem ]; then
    log "✅ SSL certificate already exists"
else
    certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos -m admin@$DOMAIN || {
        log "⚠️  SSL setup failed, will use HTTP only"
    }
fi

# 8. Configure firewall
log "🔥 Configuring firewall..."
ufw allow 80/tcp 2>/dev/null || true
ufw allow 443/tcp 2>/dev/null || true
ufw allow 22/tcp 2>/dev/null || true

# 9. Restart services
log "🔄 Restarting services..."
systemctl daemon-reload
systemctl restart nginx
systemctl restart qosmos || systemctl start qosmos

# 10. Verify deployment
log "✅ Verifying deployment..."
sleep 2
curl -s http://localhost/health | tee -a $LOG_FILE

# 11. Summary
log ""
log "═══════════════════════════════════════"
log "🎉 Deployment Complete!"
log "═══════════════════════════════════════"
log "Domain: https://$DOMAIN"
log "API: https://$DOMAIN/api/subscribe"
log "Stats: https://$DOMAIN/api/stats"
log ""
log "Useful commands:"
log "  systemctl status qosmos      - Check service status"
log "  journalctl -u qosmos -f     - View logs"
log "  curl http://localhost/api/stats - View subscriber count"
log "  curl -X POST http://localhost/api/send-report - Send daily report"
log ""
