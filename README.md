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
2. ~~Số điện thoại, địa chỉ~~ — đã cập nhật số thật (Mr Sáng: 0866 262 688) và địa chỉ thật (Thủy Nguyên, Khu đô thị Ecopark, xã Phụng Công, Hưng Yên) trong `public/index.html` và footer.
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

Đây là ứng dụng Node.js có backend (không phải site tĩnh thuần) — **không deploy được lên Vercel** vì Vercel chạy theo kiểu serverless (ổ đĩa tạm, không giữ được `data/leads.json` và phiên đăng nhập admin giữa các lượt truy cập). Cần host hỗ trợ chạy Node liên tục. Hướng dẫn dưới đây dùng **Render** (có gói miễn phí).

### Deploy lên Render — các bước

Repo Git cục bộ đã được khởi tạo sẵn tại thư mục này (`thamdatrilieu/`), đã commit đầy đủ code (không kèm `.env` hay `data/*.json`). Còn 3 bước sau cần tự làm (đăng nhập tài khoản là việc chỉ chủ tài khoản mới làm được):

1. **Đưa code lên GitHub** (nếu chưa có sẵn repo):
   - Vào [github.com/new](https://github.com/new), tạo 1 repo mới (ví dụ `thamdatrilieu`), để trống, không tick thêm README.
   - Trong thư mục `thamdatrilieu/` trên máy, chạy:
     ```
     git remote add origin https://github.com/<ten-tai-khoan>/thamdatrilieu.git
     git branch -M main
     git push -u origin main
     ```
2. **Tạo dịch vụ trên Render**:
   - Đăng nhập [render.com](https://render.com) (có thể dùng tài khoản GitHub để đăng nhập nhanh).
   - Chọn **New > Blueprint**, trỏ tới repo `thamdatrilieu` vừa tạo — Render sẽ tự đọc file `render.yaml` đã có sẵn trong repo và cấu hình đúng lệnh build/start.
   - Nếu không dùng Blueprint, chọn **New > Web Service** thủ công với: Build command `npm install`, Start command `npm start`.
3. **Khai báo biến môi trường** trong tab Environment của service trên Render:
   - `ADMIN_PASSWORD` — đặt mật khẩu quản trị mới, khác giá trị mẫu trong `.env.example`.
   - `SESSION_SECRET` — một chuỗi ngẫu nhiên bất kỳ, càng dài càng tốt.
   - (Không cần khai báo `PORT`, Render tự cấp qua biến môi trường và server đã đọc `process.env.PORT`.)
   - Bấm Deploy. Sau khi build xong, Render cấp sẵn 1 địa chỉ dạng `https://thamdatrilieu-jm365.onrender.com` — có thể trỏ tên miền riêng vào đó sau trong tab Custom Domain.

### Lưu ý về dữ liệu khách hàng khi dùng gói Render miễn phí

Gói miễn phí của Render **không có ổ đĩa lưu trữ lâu dài** — nếu **không** cấu hình database bên ngoài, dữ liệu trong `data/leads.json` sẽ mất khi service khởi động lại hoặc deploy bản mới. Backend đã hỗ trợ sẵn 2 lớp an toàn (bật bằng biến môi trường, không bật thì tự chạy bằng file như cũ):

#### 1) Lưu vĩnh viễn vào MongoDB (khuyến nghị)

Khi có biến `MONGODB_URI`, toàn bộ lượt truy cập và lead được lưu vào MongoDB thay vì file — không mất khi restart. Vẫn xem/xuất CSV qua `/admin` như bình thường.

- Tạo cluster miễn phí tại [mongodb.com/atlas](https://www.mongodb.com/atlas) (gói **M0 Free**, dung lượng 512MB, miễn phí vĩnh viễn).
- Tạo 1 database user (đặt username/password), và ở mục **Network Access** chọn **Allow access from anywhere** (0.0.0.0/0) để Render kết nối được.
- Bấm **Connect > Drivers**, copy chuỗi kết nối dạng `mongodb+srv://<user>:<password>@...` — nhớ thay `<password>` bằng mật khẩu thật.
- Trên Render, tab **Environment**, thêm biến `MONGODB_URI` = chuỗi kết nối đó. (Tuỳ chọn: `MONGODB_DB` để đổi tên database, mặc định `thamdatrilieu`.)

#### 2) Nhận email mỗi khi có khách mới (khuyến nghị đi kèm)

Khi có `RESEND_API_KEY` và `NOTIFY_EMAIL`, mỗi lead mới sẽ được gửi email báo ngay (họ tên, SĐT, ghi chú) — dữ liệu nằm vĩnh viễn trong hòm mail, xem được ngay trên điện thoại.

- Đăng ký miễn phí tại [resend.com](https://resend.com) (free 3.000 email/tháng), vào **API Keys** tạo 1 key.
- Trên Render, tab **Environment**, thêm:
  - `RESEND_API_KEY` = key vừa tạo.
  - `NOTIFY_EMAIL` = email muốn nhận thông báo (nên dùng chính email đã đăng ký Resend để không cần xác minh tên miền).
  - (Tuỳ chọn: `NOTIFY_FROM` = địa chỉ gửi đi; mặc định `onboarding@resend.dev`. Muốn gửi từ email thương hiệu riêng thì cần xác minh tên miền trong Resend trước.)

Sau khi thêm biến môi trường, Render tự deploy lại; các tính năng trên tự bật. Nếu **không** cấu hình gì, trang vẫn chạy bình thường bằng file (và nên xuất CSV định kỳ từ `/admin`).
