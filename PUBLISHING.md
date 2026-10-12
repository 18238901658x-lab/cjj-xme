# CJJ × XME 相册发布

## GitHub Pages

将本项目推送到 GitHub 仓库的 `main` 分支，在 Settings → Pages → Build and deployment 中将 Source 设为 GitHub Actions。工作流会检查 JavaScript 并只发布 `dist/` 中的网页与照片。

推送更新后，在 Actions 中等待 Publish album to GitHub Pages 成功，再打开 Pages 中显示的网址。

## 替换为自己的照片

1. 将压缩后的 JPG、PNG 或 WebP 文件放到 `dist/assets/`，建议使用简单英文文件名。
2. 编辑 `dist/app.js` 开头的 `samples` 列表，填写图片路径、标题、日期和分类。每个 `id` 保持唯一。
3. 首页的三个照片框直接引用 `dist/index.html` 中的图片路径，也可一起替换。
4. 提交并推送到 `main`，等待自动发布完成。

仓库中的照片会随网站公开展示。网页中的“添加照片”仅供当前浏览器本地预览，不会写入 GitHub、不会跨设备同步。本地上传内容、设置和浏览器数据库不包含在仓库中。

## 本地检查

```sh
npm run check
npm start
```

本地访问 `http://127.0.0.1:4173/`。所有资源使用相对路径，可部署到 GitHub Pages 的仓库子路径。
