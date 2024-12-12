# WebRTC test
## HTTPS化
### 証明書の発行
```sh
sudo apt install mkcert
mkcert -install
mkcert yuta-air.local 169.254.67.230

cp cert.pem cert.crt
```
cert.crtをiOSに転送