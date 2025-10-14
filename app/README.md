# MikTik-WHN

MikTik-WHN adalah Sistem Manajemen ISP Terintegrasi dengan WhatsApp Gateway untuk GenieACS, MikroTik PPPoE, dan Hotspot Management. Aplikasi ini dirancang untuk memudahkan pengelolaan jaringan ISP dengan fitur lengkap billing, monitoring, dan komunikasi otomatis via WhatsApp.

## ✨ Fitur Utama

### 🎯 **Manajemen Billing & Pelanggan**
- Sistem billing otomatis dengan invoice
- Manajemen pelanggan lengkap
- Payment gateway integration (Midtrans, Xendit, Tripay)
- Auto-suspension untuk pelanggan yang belum bayar
- Export laporan ke Excel

### 🤖 **WhatsApp Bot Integration**
- Admin commands untuk kontrol sistem
- Technician commands untuk teknisi lapangan
- Customer commands untuk pelanggan
- Auto-notifications untuk PPPoE status
- QR code scanning untuk setup

### 📡 **Network Management**
- **MikroTik PPPoE Management**: Monitoring koneksi, auto-isolir
- **GenieACS Integration**: TR-069 device management
- **Hotspot Management**: Voucher system, bandwidth control
- **RX Power Monitoring**: Signal strength monitoring untuk ONU devices

### 🗺️ **Network Mapping**
- ODP (Optical Distribution Point) management
- Cable network routing
- Real-time device status monitoring
- Technician access control

### 👥 **Multi-Role System**
- **Admin**: Full system access
- **Technician**: Network maintenance access
- **Agent**: Sales & customer management
- **Collector**: Payment collection
- **Customer Portal**: Self-service billing

## 🔧 Persyaratan Sistem

### Minimum Requirements
- **Node.js**: v14.0.0 atau lebih tinggi (recommended v18+)
- **Database**: SQLite3 (terintegrasi)
- **Memory**: 512MB RAM minimum, 1GB recommended
- **Storage**: 500MB free space
- **OS**: Linux (Ubuntu 20.04+, CentOS 7+, Debian 10+)

### Dependencies
- Build tools (gcc, g++, make)
- Python 3.x untuk native modules
- SQLite3 development libraries

## 🚀 Instalasi & Setup

### Opsi 1: Setup di Ubuntu Server (20.04, 22.04, atau 24.04)

#### Persiapan Server
Sebelum memulai instalasi, pastikan server Ubuntu Anda memiliki:
- **Akses root atau sudo**: Diperlukan untuk instalasi paket sistem
- **Koneksi internet stabil**: Untuk download dependencies
- **Minimal 1GB RAM**: Recommended 2GB untuk performa optimal
- **Minimal 2GB storage**: Untuk aplikasi dan database

#### 1. **Update Sistem Operasi**
```bash
# Update package list dan upgrade sistem
sudo apt update && sudo apt upgrade -y

# Install essential tools
sudo apt install -y curl wget git nano htop
```
**Penjelasan**: Langkah ini memastikan sistem Ubuntu Anda up-to-date dengan security patches terbaru dan memiliki tools dasar yang diperlukan.

#### 2. **Install Node.js 20.x LTS**
```bash
# Tambahkan NodeSource repository untuk Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Install Node.js dan npm
sudo apt install -y nodejs

# Verifikasi instalasi
node --version  # Output: v20.x.x
npm --version   # Output: 10.x.x
```
**Penjelasan**: Node.js 20.x LTS adalah versi stabil yang direkomendasikan. NodeSource repository menyediakan paket resmi Node.js untuk Ubuntu.

#### 3. **Install Build Tools dan Dependencies Sistem**
```bash
# Install build tools untuk native modules
sudo apt install -y build-essential

# Install Python 3 dan development headers
sudo apt install -y python3 python3-dev python3-pip

# Install SQLite3 dan development libraries
sudo apt install -y sqlite3 libsqlite3-dev

# Install additional dependencies untuk WhatsApp bot
sudo apt install -y libnss3-dev libatk-bridge2.0-dev libdrm2 libxkbcommon-dev libxcomposite-dev libxdamage-dev libxrandr-dev libgbm-dev libxss1 libasound2-dev
```
**Penjelasan**: Dependencies ini diperlukan untuk kompilasi native modules seperti sqlite3 dan puppeteer (untuk WhatsApp automation).

#### 4. **Clone Repository MikTik-WHN**
```bash
# Clone repository dari GitHub
git clone https://github.com/mauljasmay/MikTik-WHN.git

# Masuk ke direktori aplikasi
cd MikTik-WHN

# Verifikasi files
ls -la
```
**Penjelasan**: Mengunduh source code aplikasi dari GitHub. Pastikan Anda berada di direktori yang benar sebelum melanjutkan.

#### 5. **Install Dependencies Node.js**
```bash
# Install semua dependencies dari package.json
npm install

# Jika ada error, coba rebuild native modules
npm rebuild
```
**Penjelasan**: npm install akan mengunduh dan menginstall semua library JavaScript yang dibutuhkan aplikasi. Proses ini mungkin memakan waktu beberapa menit.

#### 6. **Konfigurasi Aplikasi**
```bash
# Copy template konfigurasi
cp settings.server.template.json settings.json

# Edit file konfigurasi dengan nano atau editor favorit Anda
nano settings.json
```
**Penjelasan**: File settings.json berisi konfigurasi aplikasi. Anda perlu mengubah parameter sesuai dengan environment server Anda.

**Konfigurasi penting yang perlu diubah:**
```json
{
  "server_host": "IP_SERVER_ANDA_ATAU_DOMAIN",
  "server_port": "3003",
  "admin_username": "admin",
  "admin_password": "UBAH_PASSWORD_INI_DENGAN_YANG_KUAT",
  "genieacs_url": "http://IP_SERVER_GENIEACS:7557",
  "mikrotik_host": "IP_MIKROTIK_ROUTER",
  "mikrotik_user": "admin",
  "mikrotik_password": "PASSWORD_MIKROTIK",
  "admins": ["628xxxxxxxxx", "628yyyyyyyyy"],
  "company_header": "Nama ISP Anda",
  "pppoe_monitor_enable": true,
  "auto_suspension_enabled": true
}
```
**Catatan**: Ganti semua placeholder dengan nilai yang sesuai. Password admin harus kuat dan unik.

#### 7. **Setup Database**
```bash
# Database SQLite akan dibuat otomatis saat aplikasi pertama kali dijalankan
# Jika Anda memiliki backup database, restore dengan:
# cp data/backup/billing.db.backup data/billing.db

# Set permissions untuk direktori database
chmod 755 data/
chmod 644 data/billing.db
```
**Penjelasan**: Aplikasi menggunakan SQLite sebagai database. Database akan dibuat otomatis dengan struktur tabel yang diperlukan.

#### 8. **Set Permissions dan Keamanan**
```bash
# Set permissions untuk direktori penting
chmod 755 data/ logs/ whatsapp-session/
chmod 644 settings.json

# Buat user khusus untuk menjalankan aplikasi (opsional tapi recommended)
sudo useradd -r -s /bin/false miktik-user
sudo chown -R miktik-user:miktik-user data/ logs/ whatsapp-session/
```
**Penjelasan**: Permissions yang benar penting untuk keamanan. Direktori data harus writable oleh aplikasi.

#### 9. **Jalankan Aplikasi**

**Mode Development (untuk testing):**
```bash
# Jalankan dengan nodemon untuk auto-restart
npm run dev
```

**Mode Production (recommended):**
```bash
# Jalankan langsung dengan Node.js
npm start
```

**Menggunakan PM2 (Recommended untuk production):**
```bash
# Install PM2 process manager
sudo npm install -g pm2

# Start aplikasi dengan PM2
pm2 start app.js --name miktik-whn

# Setup PM2 untuk auto-start saat boot
sudo pm2 startup
sudo pm2 save

# Monitor aplikasi
pm2 status miktik-whn
pm2 logs miktik-whn
```
**Penjelasan**: PM2 memastikan aplikasi tetap berjalan dan restart otomatis jika crash. Sangat recommended untuk production.

#### 10. **Konfigurasi Firewall (UFW)**
```bash
# Enable UFW firewall
sudo ufw enable

# Allow SSH (port 22)
sudo ufw allow ssh

# Allow aplikasi port (3003)
sudo ufw allow 3003

# Allow GenieACS jika di server yang sama
sudo ufw allow 7557

# Cek status firewall
sudo ufw status
```
**Penjelasan**: Firewall penting untuk keamanan server. Pastikan port yang dibutuhkan terbuka.

#### 11. **Setup SSL dengan Let's Encrypt (Opsional)**
```bash
# Install Certbot
sudo apt install -y certbot

# Jika menggunakan Apache
sudo apt install -y python3-certbot-apache

# Generate certificate
sudo certbot --apache -d domain-anda.com

# Setup auto-renewal
sudo crontab -e
# Tambahkan: 0 12 * * * /usr/bin/certbot renew --quiet
```
**Penjelasan**: SSL certificate membuat koneksi lebih aman. Let's Encrypt menyediakan certificate gratis.

#### 12. **Akses dan Testing Aplikasi**
- **Admin Portal**: `http://IP_SERVER:3003/admin/login`
- **Customer Portal**: `http://IP_SERVER:3003/customer/login`
- **Health Check**: `http://IP_SERVER:3003/health`
- **API Documentation**: `http://IP_SERVER:3003/api/docs`

**Testing koneksi:**
```bash
# Test health endpoint
curl http://localhost:3003/health

# Test admin login
curl -X POST http://localhost:3003/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password-anda"}'
```

### Opsi 2: Setup di cPanel Shared Hosting

#### ⚠️ **Peringatan Penting**
cPanel shared hosting **TIDAK DIREKOMENDASIKAN** untuk MikTik-WHN karena keterbatasan teknis yang signifikan. Aplikasi ini membutuhkan:
- Persistent background processes (untuk WhatsApp bot)
- Kontrol penuh atas server resources
- Kemampuan menjalankan cron jobs yang reliable
- Memory minimal 1GB (shared hosting biasanya 512MB)

**Alternatif yang lebih baik:**
- VPS Ubuntu/CentOS (DigitalOcean, Vultr, Linode)
- Cloud server (AWS EC2, Google Cloud, Azure)
- Dedicated server

Jika tetap ingin menggunakan cPanel, pastikan provider Anda mendukung:
- Node.js applications (versi 18+)
- SSH access penuh
- Cron jobs tanpa batasan
- Memory minimal 1GB
- Persistent processes

#### 1. **Persiapan Akun cPanel**
- Pastikan akun cPanel Anda memiliki **SSH access**
- Cek versi Node.js yang didukung (minimal 18.x)
- Pastikan quota disk minimal 2GB
- Backup semua data penting sebelum mulai

#### 2. **Upload Files ke Server**
**Opsi A: Upload via File Manager cPanel**
- Buka cPanel > File Manager
- Upload file `MikTik-WHN.zip` ke `public_html` atau buat folder baru
- Extract file ZIP

**Opsi B: Clone via Git (jika SSH tersedia)**
```bash
# Via SSH terminal cPanel
cd ~/public_html
git clone https://github.com/mauljasmay/MikTik-WHN.git
cd MikTik-WHN
```

#### 3. **Setup Node.js Environment**
```bash
# Masuk ke direktori aplikasi
cd ~/public_html/MikTik-WHN

# Cek versi Node.js
node --version  # Harus 18.x atau lebih tinggi
npm --version   # Harus 8.x atau lebih tinggi

# Jika Node.js tidak tersedia, hubungi provider hosting
# Beberapa provider perlu mengaktifkan Node.js via cPanel
```

#### 4. **Install Dependencies**
```bash
# Install npm dependencies
npm install

# Jika gagal karena memory limit, coba:
npm install --no-optional

# Atau install per bagian
npm install express sqlite3 whatsapp-web.js
npm install puppeteer @adiwajshing/baileys
```

**Catatan**: Proses install mungkin gagal karena memory limit. Jika gagal, pertimbangkan upgrade hosting plan atau pindah ke VPS.

#### 5. **Konfigurasi Aplikasi untuk cPanel**
```bash
# Copy template settings
cp settings.server.template.json settings.json

# Edit dengan nano atau cPanel File Manager
nano settings.json
```

**Konfigurasi khusus cPanel:**
```json
{
  "server_host": "domain-anda.com",
  "server_port": "3003",
  "whatsapp_keep_alive": true,
  "whatsapp_restart_on_error": true,
  "pppoe_monitor_enable": false,
  "auto_suspension_enabled": false,
  "cache_enabled": true,
  "log_level": "error",
  "memory_optimization": true
}
```
**Penjelasan konfigurasi:**
- `pppoe_monitor_enable: false` - Matikan monitoring untuk menghemat memory
- `auto_suspension_enabled: false` - Matikan auto-suspension jika cron tidak reliable
- `memory_optimization: true` - Aktifkan optimasi memory

#### 6. **Setup Database dan Permissions**
```bash
# Set permissions untuk direktori
chmod 755 data/ logs/ whatsapp-session/
chmod 644 settings.json

# Jika cPanel menggunakan suPHP atau mod_ruid2
find . -type f -name "*.js" -exec chmod 644 {} \;
find . -type d -exec chmod 755 {} \;
```

#### 7. **Setup Cron Job untuk Auto-Restart**
Via cPanel > Cron Jobs:
```
# Jalankan setiap 5 menit untuk restart aplikasi
*/5 * * * * cd ~/public_html/MikTik-WHN && /usr/local/bin/node app.js > /dev/null 2>&1

# Atau jika Node.js path berbeda
*/5 * * * * cd ~/public_html/MikTik-WHN && /opt/cpanel/ea-nodejs18/bin/node app.js > /dev/null 2>&1
```

**Penjelasan**: Cron job diperlukan karena cPanel sering kill background processes. Interval 5 menit adalah kompromi antara reliability dan resource usage.

#### 8. **Setup Reverse Proxy dengan .htaccess**
Buat file `.htaccess` di root folder aplikasi:
```apache
# MikTik-WHN Reverse Proxy Configuration
RewriteEngine On

# Redirect root ke aplikasi Node.js
RewriteRule ^$ http://127.0.0.1:3003/ [P,L]

# Proxy semua request ke Node.js app
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://127.0.0.1:3003/$1 [P,L]

# Header untuk WebSocket (WhatsApp bot)
RewriteCond %{HTTP:Upgrade} websocket [NC]
RewriteRule ^(.*)$ ws://127.0.0.1:3003/$1 [P,L]

# Security headers
Header always set X-Frame-Options DENY
Header always set X-Content-Type-Options nosniff
```

#### 9. **Start Aplikasi Manual**
```bash
# Via SSH terminal
cd ~/public_html/MikTik-WHN

# Start aplikasi di background
nohup npm start > app.log 2>&1 &

# Cek apakah berjalan
ps aux | grep node
curl http://localhost:3003/health
```

#### 10. **Konfigurasi PHP (jika diperlukan)**
Jika cPanel memerlukan wrapper PHP:
```bash
# Buat file php.ini khusus jika diperlukan
# Namun MikTik-WHN tidak memerlukan PHP
```

#### ⚠️ **Keterbatasan dan Masalah Umum cPanel**

**Memory Issues:**
- Aplikasi sering crash karena memory limit 512MB
- Solusi: Matikan fitur yang memory-intensive (monitoring, caching)

**Process Killing:**
- cPanel kill background processes setiap beberapa jam
- Solusi: Cron job restart setiap 5 menit (boros resource)

**Port Restrictions:**
- Port 3003 mungkin blocked oleh firewall
- Solusi: Gunakan reverse proxy atau minta provider buka port

**WhatsApp Bot Issues:**
- IP shared hosting sering berubah
- WhatsApp mendeteksi sebagai suspicious activity
- Solusi: Gunakan VPS dedicated untuk WhatsApp bot

**Performance Issues:**
- Response time lambat karena shared resources
- Database locking issues karena I/O limit
- Solusi: Optimize queries dan matikan fitur tidak essential

#### **Rekomendasi untuk cPanel**
Jika tetap menggunakan cPanel:
1. Upgrade ke hosting plan dengan 1GB+ RAM
2. Gunakan VPS untuk WhatsApp bot terpisah
3. Monitor aplikasi 24/7
4. Backup database regularly
5. Siap-siap migrasi ke VPS jika masalah bertambah

**Testing di cPanel:**
```bash
# Test health endpoint
curl https://domain-anda.com/health

# Test admin login
curl -X POST https://domain-anda.com/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password-anda"}'
```

### Opsi 3: Menggunakan Docker

#### Persiapan Docker Environment
Docker adalah cara termudah untuk menjalankan MikTik-WHN karena semua dependencies sudah termasuk dalam container. Pastikan Anda memiliki:
- Docker Engine 20.10+
- Docker Compose (recommended)
- Minimal 2GB RAM untuk container
- Port 3003 tersedia

#### 1. **Build Docker Image**
```bash
# Clone repository jika belum
git clone https://github.com/mauljasmay/MikTik-WHN.git
cd MikTik-WHN

# Build image dengan tag
docker build -t miktik-whn:latest .

# Verifikasi image berhasil dibuat
docker images miktik-whn
```
**Penjelasan**: Dockerfile akan build image dengan semua dependencies yang diperlukan.

#### 2. **Prepare Configuration Files**
```bash
# Copy template settings
cp settings.server.template.json settings.json

# Edit konfigurasi untuk Docker
nano settings.json
```
**Konfigurasi untuk Docker:**
```json
{
  "server_host": "0.0.0.0",
  "server_port": "3003",
  "admin_username": "admin",
  "admin_password": "UBAH_PASSWORD_INI",
  "genieacs_url": "http://host.docker.internal:7557",
  "mikrotik_host": "host.docker.internal",
  "mikrotik_user": "admin",
  "mikrotik_password": "PASSWORD_MIKROTIK"
}
```
**Catatan**: Gunakan `host.docker.internal` untuk mengakses services di host machine.

#### 3. **Run Container dengan Manual Command**
```bash
# Run container di background
docker run -d \
  --name miktik-whn \
  --restart unless-stopped \
  -p 3003:3003 \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/logs:/app/logs \
  -v $(pwd)/whatsapp-session:/app/whatsapp-session \
  -v $(pwd)/settings.json:/app/settings.json \
  miktik-whn:latest

# Cek status container
docker ps

# Monitor logs
docker logs -f miktik-whn
```
**Penjelasan volume mounts:**
- `data:/app/data` - Database dan file data
- `logs:/app/logs` - Log files
- `whatsapp-session:/app/whatsapp-session` - WhatsApp session data
- `settings.json:/app/settings.json` - Konfigurasi aplikasi

#### 4. **Menggunakan Docker Compose (Recommended)**
Buat file `docker-compose.yml`:
```yaml
version: '3.8'

services:
  miktik-whn:
    build: .
    container_name: miktik-whn
    restart: unless-stopped
    ports:
      - "3003:3003"
    volumes:
      - ./data:/app/data
      - ./logs:/app/logs
      - ./whatsapp-session:/app/whatsapp-session
      - ./settings.json:/app/settings.json
    environment:
      - NODE_ENV=production
      - TZ=Asia/Jakarta
    networks:
      - miktik-network

  # Optional: GenieACS container
  genieacs:
    image: genieacs/genieacs:latest
    container_name: genieacs
    restart: unless-stopped
    ports:
      - "7547:7547"  # CWMP
      - "7557:7557"  # NBI
      - "7567:7567"  # FS
    volumes:
      - ./genieacs-config:/opt/genieacs/config
    networks:
      - miktik-network

networks:
  miktik-network:
    driver: bridge
```

**Jalankan dengan Docker Compose:**
```bash
# Start semua services
docker-compose up -d

# Cek status
docker-compose ps

# Monitor logs
docker-compose logs -f miktik-whn

# Stop services
docker-compose down

# Update aplikasi
docker-compose pull && docker-compose up -d
```

#### 5. **Konfigurasi Firewall untuk Docker**
```bash
# Allow port 3003
sudo ufw allow 3003

# Jika menggunakan GenieACS
sudo ufw allow 7547
sudo ufw allow 7557
sudo ufw allow 7567
```

#### 6. **Backup dan Restore dengan Docker**
```bash
# Backup database
docker exec miktik-whn sqlite3 /app/data/billing.db ".backup /app/data/backup_$(date +%Y%m%d_%H%M%S).db"

# Copy backup ke host
docker cp miktik-whn:/app/data/backup_20231201_120000.db ./backups/

# Restore database
docker cp ./backups/backup_20231201_120000.db miktik-whn:/app/data/billing.db
```

#### 7. **Troubleshooting Docker Issues**
```bash
# Cek container logs
docker logs miktik-whn

# Masuk ke container untuk debug
docker exec -it miktik-whn /bin/bash

# Restart container
docker restart miktik-whn

# Rebuild image jika ada perubahan
docker build --no-cache -t miktik-whn:latest .
```

#### 8. **Monitoring Docker Container**
```bash
# Monitor resource usage
docker stats miktik-whn

# Cek container health
curl http://localhost:3003/health

# View real-time logs
docker logs -f miktik-whn
```

#### **Keuntungan Menggunakan Docker:**
- Environment konsisten di semua platform
- Isolasi aplikasi dari host system
- Mudah scaling dan deployment
- Built-in backup dan restore
- Automatic dependency management

#### **Akses Aplikasi:**
- **Admin Portal**: `http://localhost:3003/admin/login`
- **Customer Portal**: `http://localhost:3003/customer/login`
- **Health Check**: `http://localhost:3003/health`

### Opsi 4: Setup di Linux Lainnya (CentOS, Rocky Linux, Fedora, Debian, dll.)

#### Persiapan Sistem Linux
MikTik-WHN dapat diinstall di berbagai distribusi Linux. Berikut panduan untuk distribusi populer lainnya selain Ubuntu.

#### **CentOS/Rocky Linux/Red Hat Enterprise Linux**

##### 1. **Update Sistem**
```bash
# Update packages
sudo yum update -y

# Install EPEL repository
sudo yum install -y epel-release

# Install essential tools
sudo yum install -y curl wget git nano htop
```

##### 2. **Install Node.js 18.x**
```bash
# Install Node.js menggunakan NodeSource repository
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -

# Install Node.js dan npm
sudo yum install -y nodejs

# Verifikasi instalasi
node --version  # Harus v18.x.x
npm --version   # Harus 9.x.x
```

##### 3. **Install Build Tools dan Dependencies**
```bash
# Install development tools
sudo yum groupinstall -y "Development Tools"

# Install Python 3
sudo yum install -y python3 python3-devel python3-pip

# Install SQLite3
sudo yum install -y sqlite sqlite-devel

# Install additional dependencies untuk WhatsApp
sudo yum install -y libX11 libXcomposite libXdamage libXext libXfixes libXrandr libxcb libxkbcommon libgbm libasound mesa-libGL
```

##### 4. **Setup Firewall (firewalld)**
```bash
# Enable dan start firewalld
sudo systemctl enable firewalld
sudo systemctl start firewalld

# Allow port 3003
sudo firewall-cmd --permanent --add-port=3003/tcp
sudo firewall-cmd --reload

# Allow GenieACS ports jika diperlukan
sudo firewall-cmd --permanent --add-port=7557/tcp
sudo firewall-cmd --reload
```

##### 5. **Install dan Konfigurasi MikTik-WHN**
```bash
# Clone repository
git clone https://github.com/mauljasmay/MikTik-WHN.git
cd MikTik-WHN

# Install dependencies
npm install

# Setup konfigurasi (sama seperti Ubuntu)
cp settings.server.template.json settings.json
nano settings.json

# Set permissions
chmod 755 data/ logs/ whatsapp-session/
chmod 644 settings.json
```

##### 6. **Jalankan Aplikasi**
```bash
# Menggunakan systemd (recommended untuk RHEL/CentOS)
sudo nano /etc/systemd/system/miktik-whn.service
```

**Isi file miktik-whn.service:**
```ini
[Unit]
Description=MikTik-WHN ISP Management System
After=network.target

[Service]
Type=simple
User=miktik
Group=miktik
WorkingDirectory=/home/miktik/MikTik-WHN
ExecStart=/usr/bin/node app.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

```bash
# Buat user untuk aplikasi
sudo useradd -r -s /bin/false miktik

# Set ownership
sudo chown -R miktik:miktik /home/miktik/MikTik-WHN

# Enable dan start service
sudo systemctl daemon-reload
sudo systemctl enable miktik-whn
sudo systemctl start miktik-whn

# Cek status
sudo systemctl status miktik-whn
```

#### **Debian**

##### 1. **Update Sistem**
```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Install essential tools
sudo apt install -y curl wget git nano htop
```

##### 2. **Install Node.js 18.x**
```bash
# Install Node.js menggunakan NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verifikasi
node --version
npm --version
```

##### 3. **Install Dependencies**
```bash
# Build tools
sudo apt install -y build-essential

# Python dan SQLite
sudo apt install -y python3 python3-dev python3-pip sqlite3 libsqlite3-dev

# WhatsApp dependencies
sudo apt install -y libnss3 libatk-bridge2.0-0 libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 libxrandr2 libgbm1 libxss1 libasound2
```

##### 4. **Setup MikTik-WHN**
```bash
# Clone dan install (sama seperti Ubuntu)
git clone https://github.com/mauljasmay/MikTik-WHN.git
cd MikTik-WHN
npm install

# Konfigurasi
cp settings.server.template.json settings.json
nano settings.json

# Permissions
chmod 755 data/ logs/ whatsapp-session/
chmod 644 settings.json
```

##### 5. **Jalankan dengan systemd**
```bash
# Buat service file
sudo nano /etc/systemd/system/miktik-whn.service
```

**Isi service file:**
```ini
[Unit]
Description=MikTik-WHN ISP Management System
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/MikTik-WHN
ExecStart=/usr/bin/node app.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

```bash
# Set permissions
sudo chown -R www-data:www-data /var/www/MikTik-WHN

# Enable dan start
sudo systemctl daemon-reload
sudo systemctl enable miktik-whn
sudo systemctl start miktik-whn

# Monitor
sudo systemctl status miktik-whn
sudo journalctl -u miktik-whn -f
```

#### **Fedora**

##### 1. **Update Sistem**
```bash
# Update packages
sudo dnf update -y

# Install essential tools
sudo dnf install -y curl wget git nano htop
```

##### 2. **Install Node.js**
```bash
# Install Node.js dari repository
sudo dnf module install -y nodejs:18/common

# Verifikasi
node --version
npm --version
```

##### 3. **Install Dependencies**
```bash
# Development tools
sudo dnf groupinstall -y "Development Tools"

# Python dan SQLite
sudo dnf install -y python3 python3-devel sqlite sqlite-devel

# WhatsApp dependencies
sudo dnf install -y libX11 libXcomposite libXdamage libXext libXfixes libXrandr libxcb libxkbcommon libgbm libasound mesa-libGL
```

##### 4. **Setup Firewall**
```bash
# Enable firewalld
sudo systemctl enable firewalld
sudo systemctl start firewalld

# Allow ports
sudo firewall-cmd --permanent --add-port=3003/tcp
sudo firewall-cmd --reload
```

##### 5. **Install MikTik-WHN**
```bash
# Clone dan setup (sama seperti distro lain)
git clone https://github.com/mauljasmay/MikTik-WHN.git
cd MikTik-WHN
npm install

# Konfigurasi
cp settings.server.template.json settings.json
nano settings.json

# Permissions
chmod 755 data/ logs/ whatsapp-session/
chmod 644 settings.json
```

##### 6. **Jalankan dengan systemd**
```bash
# Buat service file (sama seperti CentOS)
sudo nano /etc/systemd/system/miktik-whn.service

# Isi dengan konfigurasi yang sama
# Enable dan start service
sudo systemctl daemon-reload
sudo systemctl enable miktik-whn
sudo systemctl start miktik-whn
```

#### **Arch Linux**

##### 1. **Update Sistem**
```bash
# Update packages
sudo pacman -Syu

# Install essential tools
sudo pacman -S curl wget git nano htop
```

##### 2. **Install Node.js**
```bash
# Install Node.js LTS
sudo pacman -S nodejs npm

# Verifikasi
node --version
npm --version
```

##### 3. **Install Dependencies**
```bash
# Build tools
sudo pacman -S base-devel

# Python dan SQLite
sudo pacman -S python python-pip sqlite

# WhatsApp dependencies
sudo pacman -S libx11 libxcomposite libxdamage libxext libxfixes libxrandr libxcb libxkbcommon libgbm alsa-lib mesa
```

##### 4. **Install MikTik-WHN**
```bash
# Clone dan install
git clone https://github.com/mauljasmay/MikTik-WHN.git
cd MikTik-WHN
npm install

# Setup konfigurasi
cp settings.server.template.json settings.json
nano settings.json

# Permissions
chmod 755 data/ logs/ whatsapp-session/
chmod 644 settings.json
```

##### 5. **Jalankan Aplikasi**
```bash
# Menggunakan systemd
sudo nano /etc/systemd/system/miktik-whn.service

# Konfigurasi service sama seperti distro lain
# Enable dan start
sudo systemctl enable miktik-whn
sudo systemctl start miktik-whn
```

#### **Konfigurasi Nginx Reverse Proxy (untuk semua distro)**

Jika ingin menggunakan Nginx sebagai reverse proxy:

##### Install Nginx
```bash
# Ubuntu/Debian
sudo apt install -y nginx

# CentOS/RHEL
sudo yum install -y nginx

# Fedora
sudo dnf install -y nginx

# Arch
sudo pacman -S nginx
```

##### Konfigurasi Nginx
```bash
# Buat konfigurasi site
sudo nano /etc/nginx/sites-available/miktik-whn
```

**Isi file konfigurasi:**
```nginx
server {
    listen 80;
    server_name domain-anda.com;

    location / {
        proxy_pass http://127.0.0.1:3003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/miktik-whn /etc/nginx/sites-enabled/

# Test konfigurasi
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

#### **Monitoring dan Maintenance untuk Linux**

##### Log Monitoring
```bash
# Monitor aplikasi logs
tail -f logs/combined.log

# Monitor systemd service
sudo journalctl -u miktik-whn -f

# Monitor system resources
htop
```

##### Backup Script
```bash
# Buat backup script
sudo nano /usr/local/bin/backup-miktik.sh
```

**Isi script:**
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/miktik-whn"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
sqlite3 /path/to/MikTik-WHN/data/billing.db ".backup $BACKUP_DIR/backup_$DATE.db"

# Backup konfigurasi
cp /path/to/MikTik-WHN/settings.json $BACKUP_DIR/settings_$DATE.json

# Backup logs (opsional)
tar -czf $BACKUP_DIR/logs_$DATE.tar.gz /path/to/MikTik-WHN/logs/

# Hapus backup lama (lebih dari 30 hari)
find $BACKUP_DIR -name "*.db" -mtime +30 -delete
find $BACKUP_DIR -name "*.json" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "Backup completed: $DATE"
```

```bash
# Set executable dan schedule dengan cron
sudo chmod +x /usr/local/bin/backup-miktik.sh
sudo crontab -e
# Tambahkan: 0 2 * * * /usr/local/bin/backup-miktik.sh
```

## ⚙️ Konfigurasi Lengkap

### Settings.json Parameters

| Parameter | Default | Deskripsi |
|-----------|---------|-----------|
| `server_host` | SERVER_IP | IP atau domain server |
| `server_port` | 3003 | Port aplikasi |
| `admin_username` | admin | Username admin |
| `admin_password` | admin | Password admin (ubah!) |
| `genieacs_url` | http://SERVER_IP:7557 | URL GenieACS server |
| `mikrotik_host` | SERVER_IP | IP MikroTik router |
| `mikrotik_user` | admin | Username MikroTik |
| `mikrotik_password` | admin | Password MikroTik |
| `admins.0` | 628xxxxxxxxx | Nomor WhatsApp admin |
| `company_header` | MikTik-WHN | Nama perusahaan |
| `pppoe_monitor_enable` | true | Enable PPPoE monitoring |
| `rx_power_warning` | -35 | Threshold RX power warning |
| `auto_suspension_enabled` | true | Auto-suspend pelanggan belum bayar |

### WhatsApp Bot Setup

1. **Akses Admin Panel**: Login ke `/admin/login`
2. **Setup WhatsApp**: Pergi ke Settings > WhatsApp
3. **Scan QR Code**: Gunakan WhatsApp di HP untuk scan QR
4. **Test Bot**: Kirim pesan ke nomor bot

### MikroTik Setup

1. **Enable API**: Di MikroTik terminal:
   ```
   /ip service enable api
   /ip service set api port=8728
   ```

2. **Create API User**:
   ```
   /user group add name=api-group policy=api
   /user add name=api-user group=api-group password=your-password
   ```

### GenieACS Setup

1. **Install GenieACS**: Ikuti dokumentasi resmi
2. **Configure URL**: Pastikan `genieacs_url` di settings.json benar
3. **Device Provisioning**: Setup provisioning scripts

## 📱 Penggunaan

### Admin Portal
- **Dashboard**: Overview sistem
- **Billing**: Kelola invoice dan pembayaran
- **Customers**: Manajemen pelanggan
- **Network**: Monitoring jaringan
- **Settings**: Konfigurasi sistem

### WhatsApp Commands

#### Admin Commands
```
/status - Cek status sistem
/restart - Restart aplikasi
/backup - Backup database
/stats - Statistik sistem
```

#### Technician Commands
```
/cek [username] - Cek status pelanggan
/isolir [username] - Isolir pelanggan
/buka [username] - Buka isolir
/status - Status koneksi
```

#### Customer Commands
```
/cek - Cek tagihan
/bayar - Info pembayaran
/status - Status koneksi
/lapor - Laporkan masalah
```

## 🔧 Troubleshooting

### SQLite3 Error
```bash
# Rebuild native modules
npm rebuild sqlite3

# Atau build from source
npm install sqlite3 --build-from-source
```

### WhatsApp Connection Issues
- Hapus folder `whatsapp-session/`
- Restart aplikasi
- Pastikan koneksi internet stabil

### Port Already in Use
```bash
# Cek proses yang menggunakan port
sudo lsof -i :3003

# Kill proses
sudo kill -9 PID_NUMBER
```

### Memory Issues
```bash
# Monitor memory usage
pm2 monit miktik-whn

# Restart jika memory leak
pm2 restart miktik-whn
```

### cPanel Specific Issues
- **Process Killed**: Gunakan cron job untuk restart otomatis
- **Memory Limit**: Upgrade hosting plan
- **Port Issues**: Gunakan reverse proxy atau subdomain

## 📊 Monitoring & Maintenance

### Log Files
- `logs/combined.log` - Semua log
- `logs/error.log` - Error logs
- `logs/info.log` - Info logs

### Backup
```bash
# Manual backup
cp data/billing.db data/backup/$(date +%Y%m%d_%H%M%S)_billing.db

# Via admin panel
# Settings > Backup & Restore
```

### Update Aplikasi
```bash
# Pull latest changes
git pull origin main

# Install new dependencies
npm install

# Restart aplikasi
pm2 restart miktik-whn
```

## 🆘 Support & Contact

- **WhatsApp Support**: 085174451105
- **Telegram**: [https://t.me/maulmlj](https://t.me/maulmlj)
- **GitHub Issues**: [Buat Issue](https://github.com/mauljasmay/MikTik-WHN/issues)
- **Documentation**: [Wiki](https://github.com/mauljasmay/MikTik-WHN/wiki)

## 📄 Lisensi

ISC License - Lihat file LICENSE untuk detail lebih lanjut.

## 🙏 Credits

MOD By **mauljasmay** .

---

**MikTik-WHN v3.1.1** - WhatsApp Modular + Role System + Network Mapping
