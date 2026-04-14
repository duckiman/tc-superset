# Huong Dan Public IP Va Domain Cho Superset

Tai lieu nay mo ta:
- trang thai hien tai cua may chu
- cach mo truy cap bang public IP
- cach tich hop domain va HTTPS sau nay

## 1. Trang Thai Hien Tai

He thong Superset da duoc khoi dong thanh cong bang Docker tren may nay.

Thong tin hien tai:
- IP noi bo cua may: `172.31.23.178`
- Public IP hien tai: `118.70.177.132`
- URL LAN dang dung tot: `http://172.31.23.178/login/`
- URL local dang dung tot: `http://localhost/login/`
- URL app truc tiep: `http://172.31.23.178:8088/login/`

Trang thai service:
- `nginx`: dang chay, expose cong `80`
- `superset`: dang chay, expose cong `8088`
- `superset-node`: dang chay, chi bind local `127.0.0.1:9000`
- `superset-websocket`: dang chay, expose cong `8080`
- `db`: dang chay, chi bind local `127.0.0.1:5433`
- `redis`: dang chay, chi bind local `127.0.0.1:6380`

## 2. Ket Luan Quan Trong Ve Public IP

May nay khong co public IP gan truc tiep tren card mang. IP cua may la:
- `172.31.23.178` tren interface `eth0`

Public IP `118.70.177.132` duoc nhin thay tu Internet, nhung test tu may nay den:
- `http://118.70.177.132/login/`

khong tra ve trang Superset. Dieu nay cho thay rat co the:
- public IP nam o router/gateway/NAT phia truoc
- port forwarding tu public IP vao may `172.31.23.178` chua duoc cau hinh
- hoac firewall/security group cua tang mang chua mo dung

Noi cach khac:
- ung dung tren may nay da san sang
- nhung duong public tu Internet vao may nay chua duoc route dung

## 3. Cach Dung Ngay Bay Gio

Neu cac may khac o cung LAN hoac cung subnet voi may nay, co the truy cap ngay:
- `http://172.31.23.178/login/`

Tai khoan mac dinh:
- Username: `admin`
- Password: `admin`

Khuyen nghi doi mat khau ngay khi dua cho nguoi khac su dung.

## 4. Cach Mo Truy Cap Bang Public IP

Ban can cau hinh o tang mang, khong chi tren may chu.

### Buoc 1: Co dinh IP noi bo cua may chu

Can dam bao may chu luon giu cung mot IP noi bo:
- `172.31.23.178`

Co the lam bang mot trong hai cach:
- DHCP reservation tren router
- dat IP tinh tren may chu

Neu IP noi bo thay doi, rule NAT/port-forward se hong.

### Buoc 2: Mo port forwarding tren router hoac gateway

Can tao rule:
- TCP `80` -> `172.31.23.178:80`

Neu muon mo cong app truc tiep:
- TCP `8088` -> `172.31.23.178:8088`

Khuyen nghi chi mo:
- `80` cho reverse proxy nginx

Khong khuyen nghi mo:
- `5433`
- `6380`
- `9000`

### Buoc 3: Mo firewall/security group

Neu day la may ao tren cloud hoac sau firewall:
- allow inbound TCP `80`
- sau nay neu dung HTTPS thi allow them TCP `443`

Neu may co `ufw`, `firewalld`, security group, ACL, modem firewall, tat ca deu phai cho phep.

### Buoc 4: Kiem tra tu mot mang ben ngoai

Khong kiem tra bang chinh may chu. Hay dung:
- dien thoai bat 4G/5G
- mot may khac ngoai LAN
- hoac service kiem tra tu Internet

Lenh kiem tra:

```bash
curl -I http://118.70.177.132/login/
```

Ket qua mong doi:
- `HTTP/1.1 200 OK`

Neu van ra `404`, `timeout`, hoac den mot he thong khac:
- public IP chua tro vao may nay
- NAT/port-forward chua dung
- ISP/modem dang chan port

## 5. Kiem Tra Va Van Hanh Tren May Chu

### Kiem tra service

```bash
docker compose ps --all
```

### Kiem tra health

```bash
curl http://localhost:8088/health
```

Ket qua mong doi:

```text
OK
```

### Xem log

```bash
docker compose logs -f superset
docker compose logs -f nginx
docker compose logs -f superset-worker
```

### Khoi dong lai

```bash
docker compose up -d
```

### Dung he thong

```bash
docker compose down
```

## 6. Bao Mat Toi Thieu Nen Lam Ngay

Truoc khi mo cho nguoi khac truy cap, nen lam ngay:

1. Doi mat khau `admin`
2. Khong cong khai `8088` neu da co `nginx:80`
3. Khong mo `5433`, `6380`, `9000`
4. Giu `SUPERSET_SECRET_KEY` on dinh
5. Sau nay uu tien HTTPS thay vi HTTP

## 7. Tich Hop Domain Sau Nay

Khi ban co domain, luong cau hinh nen la:

1. Tao DNS record:
   - `A` record, vi du `superset.example.com` -> `118.70.177.132`
2. Mo firewall:
   - TCP `80`
   - TCP `443`
3. Cau hinh reverse proxy co SSL
4. Cap chung chi TLS
5. Kiem tra login, static files, websocket

## 8. Kien Truc Khuyen Nghi Khi Dung Domain

Khuyen nghi dung:
- `nginx` hoac `caddy` o phia truoc
- Superset app van chay noi bo
- Domain public tro vao reverse proxy

Kien truc:

```text
Internet
  -> public IP
  -> domain
  -> reverse proxy :80/:443
  -> Superset :8088
```

## 9. Huong Di HTTPS Don Gian Nhat

Phuong an de van hanh sau nay:
- giu Superset o `:8088`
- giu nginx reverse proxy o `:80`
- them reverse proxy SSL cho `:443`
- dung Let's Encrypt

Ban co the chon mot trong hai huong:
- dung `nginx + certbot`
- hoac chuyen sang `caddy` de tu cap SSL don gian hon

## 10. Mau Nginx Domain Cho Tuong Lai

Day la vi du mang tinh huong, chua ap dung ngay:

```nginx
server {
    listen 80;
    server_name superset.example.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name superset.example.com;

    ssl_certificate /etc/letsencrypt/live/superset.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/superset.example.com/privkey.pem;

    location /ws {
        proxy_pass http://host.docker.internal:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }

    location /static {
        proxy_pass http://host.docker.internal:9000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    location / {
        proxy_pass http://host.docker.internal:8088;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_http_version 1.1;
    }
}
```

## 11. Checklist Domain Sau Nay

Khi nao co domain, lam theo checklist nay:

- [ ] domain da co `A` record tro dung public IP
- [ ] port `80` mo
- [ ] port `443` mo
- [ ] reverse proxy co `server_name` dung domain
- [ ] SSL certificate da cap thanh cong
- [ ] truy cap `https://domain/login/` tra `200`
- [ ] websocket hoat dong
- [ ] dang nhap thanh cong
- [ ] doi mat khau admin

## 12. Ghi Chu Ve Gioi Han Hien Tai

Trang thai hien tai cho thay:
- ung dung da host tot trong LAN
- truy cap cong khai qua public IP chua the xac nhan tu ben ngoai
- can thao tac them o router, modem, gateway, cloud firewall, hoac security group

Neu ban muon, buoc tiep theo nen la:
- cau hinh NAT/port-forward tren router/gateway
- sau do test lai tu mang ben ngoai
- roi moi gan domain va bat HTTPS
