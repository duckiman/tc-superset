# Hướng Dẫn Chạy Apache Superset với Docker

## 📋 Yêu Cầu Hệ Thống

✅ Docker version 29.4.0 - ĐÃ CÀI ĐẶT
✅ Docker Compose v5.1.1 - ĐÃ CÀI ĐẶT

## 🚀 Các Bước Chạy Superset

### Bước 1: Khởi động các container

```bash
docker compose up
```

Hoặc chạy ở chế độ background (detached):

```bash
docker compose up -d
```

### Bước 2: Đợi khởi tạo hoàn tất

Quá trình khởi tạo database và load dữ liệu mẫu có thể mất **3-5 phút**.

Theo dõi logs để xem tiến trình:

```bash
docker compose logs -f superset-init
```

### Bước 3: Truy cập Superset

Sau khi khởi tạo xong, mở trình duyệt và truy cập:

**🌐 URL:** http://localhost:8088

**👤 Thông tin đăng nhập mặc định:**
- Username: `admin`
- Password: `admin`

## 📦 Các Service Đang Chạy

| Service | Port | Mô tả |
|---------|------|-------|
| **superset** | 8088 | Ứng dụng web chính |
| **superset-node** | 9000 | Webpack dev server (frontend) |
| **superset-websocket** | 8080 | WebSocket server |
| **nginx** | 80 | Reverse proxy |
| **db (PostgreSQL)** | 5433 | Database |
| **redis** | 6380 | Cache & message broker |

## 🛠️ Các Lệnh Hữu Ích

### Xem logs của tất cả services:
```bash
docker compose logs -f
```

### Xem logs của một service cụ thể:
```bash
docker compose logs -f superset
docker compose logs -f superset-worker
```

### Kiểm tra trạng thái các container:
```bash
docker compose ps
```

### Dừng tất cả services:
```bash
docker compose down
```

### Dừng và xóa volumes (reset toàn bộ dữ liệu):
```bash
docker compose down -v
```

### Rebuild containers (sau khi thay đổi code):
```bash
docker compose up --build
```

### Truy cập shell của container superset:
```bash
docker compose exec superset bash
```

### Chạy lệnh Superset CLI:
```bash
docker compose exec superset superset --help
```

## 🔧 Cấu Hình

### File cấu hình đã tạo:
- `docker/.env-local` - Biến môi trường local (đã có SECRET_KEY)

### Thay đổi cấu hình Python:
1. Copy file mẫu:
   ```bash
   cp docker/pythonpath_dev/superset_config_local.example docker/pythonpath_dev/superset_config_docker.py
   ```

2. Chỉnh sửa `docker/pythonpath_dev/superset_config_docker.py`

3. Restart containers:
   ```bash
   docker compose restart superset
   ```

## 🐛 Xử Lý Sự Cố

### Container không khởi động được:
```bash
# Xem logs chi tiết
docker compose logs superset-init

# Kiểm tra tài nguyên Docker
docker system df
```

### Port đã được sử dụng:
Thay đổi port trong `docker/.env-local`:
```bash
SUPERSET_PORT=8089
NGINX_PORT=81
```

### Reset hoàn toàn:
```bash
docker compose down -v
docker system prune -a
docker compose up --build
```

### Lỗi memory (trên macOS):
Tăng memory cho Docker Desktop:
- Docker Desktop → Settings → Resources → Memory (khuyến nghị: 4GB+)

## 📚 Tài Liệu Tham Khảo

- [Superset Documentation](https://superset.apache.org/docs/intro)
- [Docker Setup Guide](https://superset.apache.org/docs/installation/docker-compose)
- [Configuration Guide](https://superset.apache.org/docs/configuration/configuring-superset)

## 💡 Lưu Ý

- Lần đầu chạy sẽ mất thời gian build images (~10-15 phút)
- Dữ liệu mẫu (examples) sẽ được load tự động
- Development mode: code thay đổi sẽ tự động reload
- Để production, dùng: `docker-compose-non-dev.yml`
