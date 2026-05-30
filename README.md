# 拾光集 | 校园二手前端

一个面向校园二手交易的轻量单页前端。页面包含首页、搜索、商品详情、发布、登录注册、消息聊天、个人中心和 AI 购买建议。

## 本地运行

```powershell
cd C:\Users\MECHFEVO\Desktop\aaaaa\campus-second-hand-ma
python -m http.server 5173
```

浏览器打开：

```text
http://localhost:5173
```

## 后端地址

前端 API 地址在 `js/config.js`：

```js
window.CAMPUS_API_BASE = "http://localhost:8080/api";
```

上服务器时改成你的后端地址，例如：

```js
window.CAMPUS_API_BASE = "https://你的域名/api";
```

## AI 接口

前端调用：

```text
POST /api/ai/products/{productId}/advice
```

真实 AI Key 不要放前端。请在后端配置：

```text
CAMPUS_AI_ENDPOINT
CAMPUS_AI_API_KEY
```

如果后端暂时没配置真实 AI，页面会展示后端或前端的兜底判断，不会让购买流程断掉。

## 旧页面兼容

旧入口如 `login.html`、`publish.html`、`product-detail.html?id=1` 会自动跳转到新版单页路由，方便部署时保留旧链接。
