# CJJ × XME 相册

源码仓库：https://github.com/18238901658x-lab/cjj-xme
网站：https://18238901658x-lab.github.io/cjj-xme/

## 发布方式

main 分支保存完整源码；gh-pages 分支根目录保存 dist/ 的内容。
GitHub Settings → Pages 的发布源为 gh-pages 分支、根目录。
更新 main 不会直接更新网页；将新的 dist/ 内容同步到 gh-pages 后，GitHub Pages 自动发布。
本次通过 GitHub 官方 CLI 与 Git Data API 上传，以避开本机 Git HTTPS 连接超时。

## 替换照片

将图片放入 dist/assets/，编辑 dist/photos.js 中 publishedPhotos 的路径、标题、日期和分类。首页照片框的路径在 dist/index.html 中。将更新同步到 gh-pages 即可发布。

仓库和网站均公开。已发布第一批 22 张照片；使用高清压缩副本，原图保留在本机。首页从已发布照片中抽取 3 张，每到北京时间 0、3、6、9、12、15、18、21 点换一组，同一时段所有访客使用相同组合。网页“添加照片”只保存在当前浏览器，不会上传到仓库或跨设备同步。

## 本地运行

运行 npm run check 检查脚本；运行 npm start 后访问 http://127.0.0.1:4173/。
当前视觉为奶油白、雾蓝、淡杏色的 CSS 3D 相册，包含动态小猫、心跳、轮播、分类与图片缩放。