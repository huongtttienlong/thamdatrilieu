# Thảm Đa Trị Liệu - Landing Page

Landing page bán **Thảm Massage Trị Liệu JM 365**, kèm backend nhỏ để đo lượt truy cập và lưu thông tin khách hàng để lại, cộng trang quản trị riêng.

## Chạy thử trên máy

```
cd thamdatrilieu
npm install
copy .env.example .env    (hoặc: cp .env.example .env)
npm run dev
```

Mở `http://localhost:3000`. Trang quản trị tại `http://localhost:3000/admin` (mật khẩu lấy từ biến `ADMIN_PASSWORD` trong file `.env`).

## Việc cần làm trước khi đưa lên internet thật

1. **Đổi mật khẩu quản trị** và `SESSION_SECRET` trong `.env` (đừng dùng giá trị mẫu).
2. ~~Số điện thoại, địa chỉ~~ — đã cập nhật số thật (Mr Sáng: 0866 2626 88) và địa chỉ thật (Thủy Nguyên, Khu đô thị Ecopark, xã Phụng Công, Hưng Yên) trong `public/index.html` và footer.
3. ~~Hình ảnh sản phẩm~~ — đã thay bằng ảnh thật trích từ tài liệu hướng dẫn sử dụng JM365 (ảnh phòng ngủ, ảnh thảm, sơ đồ bộ điều khiển, bộ phụ kiện 5-trong-1) tại `public/assets/`. Nếu có thêm ảnh thật chụp sản phẩm/khách hàng thực tế thì càng tốt cho độ tin cậy.
4. ~~Video demo~~ — đã bỏ khối video mượn tạm từ YouTube (rủi ro bản quyền) khỏi hero, thay bằng ảnh hero thật. Nếu sau này có video sản phẩm tự quay, có thể chèn lại vào section hero.
5. ~~Testimonials~~ — đã bỏ mục đánh giá khách hàng minh hoạ (tránh rủi ro đánh giá giả), thay bằng mục "Cam kết từ chúng tôi" (bảo hành, chuẩn Hàn Quốc, giao hàng, tư vấn). Khi có đánh giá thật từ khách hàng đã mua (kèm sự đồng ý của họ), nên bổ sung lại mục testimonials.
6. **Tên miền thật**: `https://thamdatrilieu.vn/` trong thẻ `canonical`, Open Graph, `sitemap.xml`, `robots.txt`, JSON-LD vẫn là domain mẫu — sửa cho khớp domain thật khi deploy.
7. Nội dung công dụng/thông số kỹ thuật (nhiệt độ 30-70°C, công suất 460W, kích thước 155x195cm, bảo hành 2 năm, 5 chức năng trị liệu) đã lấy đúng theo tài liệu hướng dẫn sử dụng JM365 do anh cung cấp — nếu công ty có cập nhật thông số mới hơn thì sửa lại trong `public/index.html` (mục "Thông số kỹ thuật").

## Cấu trúc dự án

- `public/index.html` — landing page (SEO meta, JSON-LD, các section)
- `public/css/style.css` — giao diện (nền vàng, chữ trắng, font Anton + Arimo)
- `public/js/main.js` — tracking lượt truy cập, gửi form, FAQ accordion, phát video
- `public/admin/login.html` — đăng nhập quản trị
- `server/index.js` — Express server, API `/api/track`, `/api/leads`, `/api/admin/*`
- `server/views/dashboard.html` — giao diện trang quản trị (chỉ xem được sau khi đăng nhập)
- `server/store.js` — lưu dữ liệu vào `data/visits.json` và `data/leads.json`

## Dữ liệu khách hàng

Thông tin khách để lại (họ tên, SĐT, ghi chú) lưu tại `data/leads.json`. File này **không** đưa lên Git (đã có trong `.gitignore`) vì chứa thông tin cá nhân. Có thể xuất CSV trực tiếp từ trang quản trị.

## Triển khai (deploy)

Đây là ứng dụng Node.js có backend (không phải site tĩnh thuần), cần host hỗ trợ chạy Node liên tục, ví dụ: Render, Railway, VPS riêng... Nhớ cấu hình biến môi trường `ADMIN_PASSWORD`, `SESSION_SECRET`, `PORT` trên nơi triển khai.
