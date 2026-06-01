# 视觉设计作品集网站

这是一个面向视觉设计师的单页作品集网站，中文为主，适合手机端和 PC 浏览。

## 文件结构

```txt
personal_work_website
├─ index.html
├─ package.json
├─ README.md
└─ src
   ├─ main.jsx
   ├─ styles.css
   └─ works.js
```

## 本地运行

```bash
npm install
npm run dev
```

打开终端里显示的本地地址即可预览。

## 替换图片和 GIF

作品数据在 `src/works.js`。

如果使用本地图片，建议新建 `public/works` 文件夹，把图片或 GIF 放进去，然后这样填写：

```js
cover: "/works/project-01.jpg"
```

GIF 也一样：

```js
cover: "/works/event-video.gif"
```

每个作品可以填写：

- `title`：作品标题
- `type`：品牌视觉 / 活动视觉
- `year`：年份
- `cover`：封面图片或 GIF
- `images`：详情大图，可放多张

## 部署到 Vercel

1. 把项目上传到 GitHub。
2. 登录 Vercel，选择导入该 GitHub 仓库。
3. Framework Preset 选择 `Vite`。
4. Build Command 使用 `npm run build`。
5. Output Directory 使用 `dist`。
6. 点击 Deploy。
