# Qosmos Deployment Guide

## Prerequisites

- VPS with Ubuntu 20.04/22.04
- Domain `qosmos.one` pointing to your VPS IP
- SSH access to the server

## Initial Server Setup

```bash
# 1. Connect to your VPS
ssh root@198.13.57.142

# 2. Update system
apt update && apt upgrade -y

# 3. Install required packages
apt install -y nginx nodejs npm certbot python3-certbot-nginx ufw git

# 4. Create deployment user
useradd -m -s /bin/bash www
usermod -aG sudo www

# 5. Create directories
mkdir -p /home/www/qosmos /home/www/backups /var/log/nginx

# 6. Set permissions
chown -R www:www /home/www
```

## Upload Files

```bash
# From your local machine, upload the project
scp -r quaternity-brochure/* root@198.13.57.142:/tmp/

# On the server
mv /tmp/* /home/www/qosmos/
chown -R www:www /home/www/qosmos
```

## Configure Environment

Edit the server configuration:
```bash
nano /home/www/qosmos/server.js
```

Or set environment variables in the systemd service file.

## Install and Configure

```bash
# 1. Install Node.js dependencies
cd /home/www/qosmos
npm install --production

# 2. Copy Nginx config
cp deploy/nginx.conf /etc/nginx/sites-available/qosmos.one
ln -sf /etc/nginx/sites-available/qosmos.one /etc/nginx/sites-enabled/
nginx -t

# 3. Copy systemd service
cp deploy/qosmos.service /etc/systemd/system/
systemctl daemon-reload

# 4. Start the service
systemctl start qosmos
systemctl enable qosmos

# 5. Configure firewall
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp
ufw --force enable

# 6. Set up SSL (Let's Encrypt)
certbot --nginx -d qosmos.one -d www.qosmos.one --non-interactive --agree-tos -m admin@qosmos.one

# 7. Restart Nginx
systemctl restart nginx
```

## Verify Deployment

```bash
# Check service status
systemctl status qosmos

# Check logs
journalctl -u qosmos -f

# Test API
curl http://localhost/api/stats
curl -X POST http://localhost/api/subscribe -H "Content-Type: application/json" -d '{"email":"test@example.com"}'

# Check subscribers
cat /home/www/qosmos/subscribers.json
```

## Managing Subscribers

### View all subscribers
```bash
cat /home/www/qosmos/subscribers.json
```

### Send daily report manually
```bash
curl -X POST http://localhost/api/send-report
```

### Export subscribers
```bash
cat /home/www/qosmos/subscribers.json | jq '.[] | .email' > emails.txt
```

## Project Structure

```
qosmos/
├── out/                    # Static website files
│   ├── index.html
│   ├── 404.html
│   └── _next/
├── server.js              # Production server
├── subscribers.json       # Email database
├── .last_email_sent       # Email report tracker
├── deploy/
│   ├── nginx.conf         # Nginx configuration
│   └── qosmos.service     # Systemd service
└── deploy.sh             # Automated deployment script
```

## Daily Email Reports

The system automatically sends reports at 9 AM daily. To configure email delivery:

### Option 1: Use SMTP (Recommended)

Edit the systemd service file and add environment variables:
```ini
Environment=SMTP_HOST=smtp.your-provider.com
Environment=SMTP_PORT=587
Environment=SMTP_USER=your-email@qosmos.one
Environment=SMTP_PASS=your-app-password
```

### Option 2: Use mail command

Install and configure mailutils:
```bash
apt install -y mailutils
echo "Report content" | mail -s "Qosmos Daily Report" contact@qosmos.one
```

## Troubleshooting

### Service won't start
```bash
# Check for errors
journalctl -u qosmos --no-pager
```

### Nginx errors
```bash
# Test config
nginx -t
# Check logs
tail -f /var/log/nginx/qosmos_*.log
```

### SSL certificate issues
```bash
# Renew certificate
certbot renew
# Or get new certificate
certbot delete --cert-name qosmos.one
certbot --nginx -d qosmos.one -d www.qosmos.one
```

## Updating the Website

```bash
# 1. Upload new files
scp -r out/* root@198.13.57.142:/home/www/qosmos/out/

# 2. Restart service
systemctl restart qosmos

# 3. Verify
curl https://qosmos.one/api/stats
```

## Backup and Restore

### Backup
```bash
tar -czf /home/www/backups/qosmos-$(date +%Y%m%d).tar.gz /home/www/qosmos
```

### Restore
```bash
tar -xzf /home/www/backups/qosmos-20240101.tar.gz -C /
systemctl restart qosmos
```
