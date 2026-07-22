# 拼音王国 PK 后台部署

本文件夹是多人实时 PK 后台。前端在：

`pinyin-kingdom-7yo/pk.html`

## 最快部署方法（Cloudflare Dashboard）

1. 登录 Cloudflare。
2. 进入 **Workers & Pages**。
3. 点击 **Create**。
4. 选择 **Import a repository**。
5. 连接 GitHub 仓库：
   `darkgeneration77-spec/spm-question-intelligence`
6. Root directory 填：
   `pinyin-kingdom-7yo/pk-worker`
7. Framework preset 选择：
   `None`
8. Build command 留空。
9. Deploy command 填：
   `npx wrangler deploy`
10. 点击 **Save and Deploy**。

部署完成后，Cloudflare 会给出类似：

`https://pinyin-kingdom-pk.<你的账号>.workers.dev`

## 前端连接

打开 `pinyin-kingdom-7yo/pk.html`，把 Worker 地址填入页面中的服务器设置，或直接修改 `WORKER_URL` 常量。

例：

```js
const WORKER_URL = 'https://pinyin-kingdom-pk.example.workers.dev';
```

WebSocket 地址会自动转换为 `wss://`。

## 测试方法

1. 用老师电脑打开 PK 页面。
2. 创建房间。
3. 用两台手机打开同一个页面。
4. 输入同一个房间号码。
5. 两位学生点击准备。
6. 老师点击开始。
7. 检查题目、分数和排行榜是否同步。

## 重要说明

GitHub Pages 只负责显示网页；多人房间、实时分数和同步题目由 Cloudflare Worker + Durable Objects 处理。
