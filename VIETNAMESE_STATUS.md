# Việt hóa Đào Nguyên Hương 3.1.0 — Final Pass

## Trạng thái
- Nền tảng nguồn: Taoyuan 3.1.0.
- Giữ nguyên cơ chế/gameplay của bản 3.1.0; chỉ Việt hóa nội dung hiển thị và thông báo.
- Đã tiếp tục port dữ liệu tiếng Việt từ APK cũ 2.10.0 và xử lý các nội dung mới của 3.1.0.
- Đã Việt hóa các khu vực còn sót: câu cá, khai khoáng, nhân giống, ao cá, công hội, Hãn Hải, nhà/kho, nông trại, chế biến, NPC, minigame, cài đặt WebDAV, nhiệm vụ, túi đồ, cửa hàng, thành tựu và các thông báo hệ thống.
- Kiểm tra lại toàn bộ text node/thuộc tính giao diện `.vue`: không còn ký tự Trung Quốc trong phần hiển thị.
- Kiểm tra string literals trong `.ts/.vue`: không còn ký tự Trung Quốc trong nội dung chuỗi.
- TypeScript `tsc --noEmit --skipLibCheck`: PASS.
- Kiểm tra cú pháp các `<script>` trong toàn bộ `.vue` bằng TypeScript transpile: PASS.
- Kiểm tra cân bằng `<template>`, `<script>` và `{{ }}` trong `.vue`: PASS.

## Lưu ý
- Một số comment kỹ thuật trong mã nguồn vẫn có tiếng Trung/mixed language. Đây là comment, không xuất hiện trong APK và không ảnh hưởng gameplay.
- Nên build APK bằng GitHub Actions trước khi phát hành để kiểm tra thêm bước build SFC/template và runtime trên Android.
