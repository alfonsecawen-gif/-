(function () {
    "use strict";

    const API_BASE = window.CAMPUS_API_BASE || "http://localhost:8080/api";
    const SESSION_KEY = "campus_second_hand_session";
    const CACHE_TTL = 30000;
    const apiCache = new Map();

    const appState = {
        homeProducts: [],
        homeFilter: "all",
        homeCampus: "all",
        campusMenuOpen: false,
        publishImages: [],
        lastApiError: "",
        dataMode: "live",
        loginPromptedPath: "",
        profileMenuStats: null,
        profileMenuStatsKey: "",
        profileMenuStatsLoading: false,
        captcha: null
    };

    const categories = [
        { id: "all", label: "猜你喜欢", icon: "集" },
        { id: "book", label: "教材资料", icon: "书" },
        { id: "elec", label: "数码电子", icon: "电" },
        { id: "life", label: "生活日用", icon: "物" },
        { id: "sport", label: "运动户外", icon: "动" },
        { id: "other", label: "其他闲置", icon: "闲" }
    ];

    const campusOptions = ["下沙校区", "仓前校区", "玉皇山校区"];
    const searchHints = ["电动车", "考研真题", "显示器", "笔记本", "手机壳", "耳机", "台灯", "自行车"];
    let searchHintIndex = 0;

    const demoProducts = [
        {
            id: "demo-1",
            title: "九成新 Sony 降噪耳机，图书馆自习很安静",
            price: 399,
            category: "elec",
            desc: "去年购入，平时主要在图书馆和宿舍使用。耳罩干净，续航正常，支持当面试听。适合需要备考、自习、通勤的同学。",
            images: ["./img/optimized/DSC00355-768.jpg"],
            contact: "站内聊",
            sellerUsername: "xiaohe",
            sellerDisplayName: "小禾同学",
            sellerAvatar: "",
            campus: "东区宿舍",
            createdAt: Date.now() - 1000 * 60 * 48,
            status: "onsale"
        },
        {
            id: "demo-2",
            title: "线性代数教材 + 期末复习笔记",
            price: 28,
            category: "book",
            desc: "教材有少量划线，笔记按章节整理，适合想快速过一遍重点的同学。可在教学楼门口交易。",
            images: ["./img/optimized/DSC00371_1-768.jpg"],
            contact: "站内聊",
            sellerUsername: "nanxi",
            sellerDisplayName: "南西",
            sellerAvatar: "",
            campus: "教学楼 A",
            createdAt: Date.now() - 1000 * 60 * 60 * 7,
            status: "onsale"
        },
        {
            id: "demo-3",
            title: "宿舍可用折叠小桌，桌面很稳",
            price: 45,
            category: "life",
            desc: "买来放床边写作业，桌腿稳，不晃。毕业搬寝室出掉，可小刀。",
            images: ["./img/optimized/DSC00454-768.jpg"],
            contact: "站内聊",
            sellerUsername: "lin",
            sellerDisplayName: "林同学",
            sellerAvatar: "",
            campus: "西区 6 栋",
            createdAt: Date.now() - 1000 * 60 * 60 * 23,
            status: "onsale"
        },
        {
            id: "demo-4",
            title: "山地车，适合校内通勤",
            price: 260,
            category: "sport",
            desc: "刹车正常，链条刚上油，坐垫有轻微使用痕迹。建议当面试骑后决定。",
            images: [],
            contact: "站内聊",
            sellerUsername: "moss",
            sellerDisplayName: "Moss",
            sellerAvatar: "",
            campus: "北门",
            createdAt: Date.now() - 1000 * 60 * 60 * 31,
            status: "onsale"
        },
        {
            id: "demo-5",
            title: "宿舍台灯，三档亮度，考研自习够用",
            price: 19.9,
            category: "life",
            desc: "台灯亮度正常，USB 供电，灯杆可调角度。",
            images: [],
            contact: "站内聊",
            sellerUsername: "yezi",
            sellerDisplayName: "叶子",
            sellerAvatar: "",
            campus: "图书馆",
            createdAt: Date.now() - 1000 * 60 * 60 * 3,
            status: "onsale"
        },
        {
            id: "demo-6",
            title: "四六级听力耳机，含电池",
            price: 16,
            category: "elec",
            desc: "考试用过一次，收音正常，适合下次四六级。",
            images: ["./img/optimized/DSC00355-768.jpg"],
            contact: "站内聊",
            sellerUsername: "mika",
            sellerDisplayName: "米卡",
            sellerAvatar: "",
            campus: "二教门口",
            createdAt: Date.now() - 1000 * 60 * 90,
            status: "onsale"
        },
        {
            id: "demo-7",
            title: "高数同济第七版，少量笔记",
            price: 12,
            category: "book",
            desc: "封面有点旧，里面完整不缺页。",
            images: [],
            contact: "站内聊",
            sellerUsername: "qiao",
            sellerDisplayName: "乔同学",
            sellerAvatar: "",
            campus: "南门",
            createdAt: Date.now() - 1000 * 60 * 60 * 12,
            status: "onsale"
        },
        {
            id: "demo-8",
            title: "羽毛球拍一支，适合新手",
            price: 35,
            category: "sport",
            desc: "拍框无裂，线还可以继续打，送一个旧拍套。",
            images: ["./img/optimized/DSC00454-768.jpg"],
            contact: "站内聊",
            sellerUsername: "river",
            sellerDisplayName: "River",
            sellerAvatar: "",
            campus: "体育馆",
            createdAt: Date.now() - 1000 * 60 * 60 * 18,
            status: "onsale"
        },
        {
            id: "demo-9",
            title: "小米充电宝 10000mAh，容量正常",
            price: 42,
            category: "elec",
            desc: "日常通勤备用，外壳有轻微划痕，功能正常。",
            images: [],
            contact: "站内聊",
            sellerUsername: "lulu",
            sellerDisplayName: "鹿鹿",
            sellerAvatar: "",
            campus: "东门",
            createdAt: Date.now() - 1000 * 60 * 60 * 26,
            status: "onsale"
        },
        {
            id: "demo-10",
            title: "宿舍收纳盒三件套，透明款",
            price: 18,
            category: "life",
            desc: "搬寝室用不上了，适合放文具、数据线和化妆品。",
            images: ["./img/optimized/DSC00371_1-768.jpg"],
            contact: "站内聊",
            sellerUsername: "an",
            sellerDisplayName: "安安",
            sellerAvatar: "",
            campus: "西区 3 栋",
            createdAt: Date.now() - 1000 * 60 * 60 * 34,
            status: "onsale"
        },
        {
            id: "demo-11",
            title: "考研英语真题，解析册齐全",
            price: 25,
            category: "book",
            desc: "做过一部分，铅笔痕迹居多，解析册都在。",
            images: [],
            contact: "站内聊",
            sellerUsername: "stone",
            sellerDisplayName: "石头",
            sellerAvatar: "",
            campus: "一食堂",
            createdAt: Date.now() - 1000 * 60 * 60 * 41,
            status: "onsale"
        },
        {
            id: "demo-12",
            title: "蓝牙键盘，适配平板和电脑",
            price: 55,
            category: "elec",
            desc: "按键正常，轻薄款，适合上课记笔记。",
            images: ["./img/optimized/DSC00355-768.jpg"],
            contact: "站内聊",
            sellerUsername: "orange",
            sellerDisplayName: "橙子",
            sellerAvatar: "",
            campus: "实验楼",
            createdAt: Date.now() - 1000 * 60 * 60 * 50,
            status: "onsale"
        }
    ];

    const app = document.querySelector("#app");
    const modalRoot = document.querySelector("[data-modal-root]");
    const loadingTemplate = document.querySelector("#loading-template");

    document.addEventListener("DOMContentLoaded", init);

    function init() {
        renderAuthChip();
        bindGlobalEvents();
        startSearchHintRotator();
        syncCurrentUser();
        registerServiceWorker();
        renderRoute();
        setTopbarState();
        window.addEventListener("hashchange", renderRoute);
        window.addEventListener("scroll", setTopbarState, { passive: true });
    }

    function bindGlobalEvents() {
        document.addEventListener("submit", handleSubmit);
        document.addEventListener("click", handleClick);
        document.addEventListener("change", handleChange);
        document.addEventListener("input", handleInput);
        document.addEventListener("load", handleImageLoad, true);
        document.addEventListener("error", handleImageLoad, true);
        document.addEventListener("dragover", handleDragOver);
        document.addEventListener("dragleave", handleDragLeave);
        document.addEventListener("drop", handleDrop);
    }

    function closeModal() {
        if (!modalRoot) return;
        modalRoot.classList.remove("is-open");
        modalRoot.innerHTML = "";
    }

    async function renderRoute() {
        const route = parseRoute();
        if (route.name === "auth") {
            if (!app.innerHTML.trim()) {
                await renderHome();
            }
            renderAuth(route);
            return;
        }
        closeModal();
        if (requiresLogin(route.name) && !getSession()) {
            if (!app.innerHTML.trim()) {
                await renderHome();
            }
            renderAuth({ query: { mode: "login", next: route.path || "/" } });
            return;
        }
        app.dataset.route = route.name;
        document.body.dataset.route = route.name;
        setSearchValue(route.query.q || "");
        app.innerHTML = loadingTemplate.innerHTML;
        appState.dataMode = "live";
        appState.lastApiError = "";

        try {
            if (route.name === "home") {
                await renderHome();
            } else if (route.name === "search") {
                await renderSearch(route);
            } else if (route.name === "product") {
                await renderProductDetail(route);
            } else if (route.name === "publish") {
                await renderPublish();
            } else if (route.name === "messages") {
                await renderMessages(route);
            } else if (route.name === "mine") {
                await renderCurrentUserProfile();
            } else if (route.name === "admin") {
                await renderAdmin();
            } else if (route.name === "user") {
                await renderUserProfile(route);
            } else {
                renderNotFound();
            }
        } catch (error) {
            renderFatalError(error);
        }

        markLoadedImages();
        promptLoginForRoute(route);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function promptLoginForRoute(route) {
        if (getSession()) return;
        if (!["home", "product"].includes(route.name)) return;
        if (appState.loginPromptedPath === route.path) return;
        appState.loginPromptedPath = route.path;
        const next = route.path === "/" ? "/" : route.path;
        window.setTimeout(() => renderAuth({ query: { mode: "login", next } }), 250);
    }

    function requiresLogin(routeName) {
        return ["publish", "messages", "mine", "admin"].includes(routeName);
    }

    function parseRoute() {
        const rawHash = window.location.hash ? window.location.hash.slice(1) : "/";
        const legacyAuthMode = rawHash === "register" ? "/auth?mode=register" : rawHash;
        const [pathRaw, queryRaw = ""] = legacyAuthMode.split("?");
        let path = pathRaw || "/";
        if (!path.startsWith("/")) path = `/${path}`;
        const parts = path.split("/").filter(Boolean).map(decodeURIComponent);
        const query = Object.fromEntries(new URLSearchParams(queryRaw));

        if (parts.length === 0) return { name: "home", path: "/", params: {}, query };
        if (parts[0] === "search") return { name: "search", path, params: {}, query };
        if (parts[0] === "product" && parts[1]) return { name: "product", path, params: { id: parts[1] }, query };
        if (parts[0] === "publish") return { name: "publish", path, params: {}, query };
        if (parts[0] === "messages") return { name: "messages", path, params: {}, query };
        if (parts[0] === "mine") return { name: "mine", path, params: {}, query };
        if (parts[0] === "admin") return { name: "admin", path, params: {}, query };
        if (parts[0] === "user" && parts[1]) return { name: "user", path, params: { username: parts[1] }, query };
        if (parts[0] === "auth") return { name: "auth", path, params: {}, query };
        return { name: "not-found", path, params: {}, query };
    }

    async function renderHome() {
        const products = await listProducts({ limit: 48 });
        appState.homeProducts = products;
        const campusCount = new Set(products.map((item) => item.campus).filter(Boolean)).size || 1;
        const recentCount = products.filter((item) => Date.now() - Number(item.createdAt || 0) < 1000 * 60 * 60 * 36).length || products.length;

        app.innerHTML = `
            <section class="page market-page">
                <section class="market-board">
                    <div class="board-head">
                        <div>
                            <p class="board-kicker">校园二手 · 当面交易 · AI 帮看价</p>
                        </div>
                        <div class="board-stats">
                            <span>${escapeHtml(recentCount)} 件新上架</span>
                            <span>${escapeHtml(campusCount)} 个校内地点</span>
                        </div>
                    </div>
                    ${dataModeNotice()}
                    ${renderFilterRail(appState.homeFilter, { variant: "home" })}
                    <div class="market-grid" data-home-grid>
                        ${renderProductGrid(filterProducts(products, appState.homeFilter, appState.homeCampus))}
                    </div>
                </section>
            </section>
        `;
    }

    async function renderSearch(route) {
        const query = (route.query.q || "").trim();
        const category = route.query.category || "all";
        const products = await listProducts({ q: query });
        const campus = route.query.campus || "all";
        const filtered = filterProducts(products, category, campus);
        app.innerHTML = `
            <section class="page market-page">
                <section class="market-board">
                    <div class="board-head">
                        <div>
                            <p class="board-kicker">搜索结果</p>
                            <h1>${query ? `「${escapeHtml(query)}」` : "校园集市"}</h1>
                        </div>
                        <a class="ghost-action" href="#/publish">发布闲置</a>
                    </div>
                    ${dataModeNotice()}
                    ${renderFilterRail(category, { search: query, category, campus, variant: "home" })}
                    <div class="market-grid">
                    ${filtered.length ? renderProductGrid(filtered) : renderEmpty("还没有找到合适的闲置", "换个关键词试试，或者抢先发布一个同学们可能正需要的物品。", "发布闲置", "#/publish")}
                    </div>
                </section>
            </section>
        `;
    }

    async function renderProductDetail(route) {
        const product = await getProduct(route.params.id);
        const comments = await listProductComments(product.id);
        const currentImage = product.images[0] || "";
        app.innerHTML = `
            <section class="page detail-page">
                ${renderSellerCardV2(product)}
                <div class="split-layout">
                    <div class="detail-gallery">
                        <div class="gallery-main" data-gallery-main>
                            ${currentImage ? `<img src="${escapeAttr(currentImage)}" decoding="async" alt="${escapeAttr(product.title)}">` : `<div class="gallery-placeholder">${escapeHtml(shortTitle(product.title, 4))}</div>`}
                        </div>
                        ${renderThumbs(product)}
                        ${renderCommentCard(product, comments)}
                    </div>

                    <aside class="detail-info">
                        <div class="detail-header">
                            <span class="eyebrow">${escapeHtml(getCategoryLabel(product.category))}</span>
                            <h1 class="detail-title">${escapeHtml(product.title)}</h1>
                            <div class="detail-price"><small>¥</small>${escapeHtml(formatPrice(product.price))}</div>
                            <div class="meta">
                                <span>${escapeHtml(product.campus || "校内面交")}</span>
                            </div>
                            <p class="detail-desc">${escapeHtml(product.desc || "暂无描述")}</p>
                        </div>
                        <div class="detail-side">
                            <div class="detail-actions-card">
                                <button class="seller-chat-action primary-chat" type="button" data-start-chat="${escapeAttr(product.id)}">聊一聊</button>
                            </div>
                            ${renderAiShell(product)}
                        </div>
                    </aside>
                </div>
            </section>
        `;
    }

    async function renderPublish() {
        const session = getSession();
        if (!session) {
            renderAuth({ query: { mode: "login", next: "/publish" } });
            return;
        }

        const selectedCampus = campusOptions.includes(session.campus) ? session.campus : campusOptions[0];

        app.innerHTML = `
            <section class="page publish-page">
                <header class="page-header publish-header">
                    <span class="eyebrow">Sell</span>
                    <h1 class="page-title">发布闲置</h1>
                    <p class="page-lede">放图、写描述、选校区。</p>
                </header>

                <form class="publish-sheet" data-publish-form>
                    <section class="publish-block">
                        <h2>基础信息</h2>
                        <div class="field is-wide image-first-field">
                            <label>宝贝图片 <span class="req-star" aria-hidden="true">*</span></label>
                            <label class="dropzone publish-dropzone" data-dropzone>
                                <input type="file" accept="image/*" multiple data-image-input>
                                <span class="upload-prompt">
                                    <span class="upload-tile">
                                        <b>+</b>
                                        <strong>添加图片</strong>
                                    </span>
                                </span>
                                <span class="preview-grid" data-preview-grid>${renderImagePreviews()}</span>
                            </label>
                        </div>

                        <div class="form-grid compact">
                            <div class="field is-wide">
                                <label for="publishTitle">标题</label>
                                <input class="input" id="publishTitle" name="title" required maxlength="80" placeholder="例如：九成新蓝牙耳机，图书馆自习很安静">
                            </div>
                            <div class="field">
                                <label for="publishPrice">价格 <span class="req-star" aria-hidden="true">*</span></label>
                                <input class="input price-field" id="publishPrice" name="price" type="number" min="1" step="1" required placeholder="¥ 0">
                            </div>
                            <div class="field is-wide">
                                <label>种类 <span class="req-star" aria-hidden="true">*</span></label>
                                <div class="category-options" role="radiogroup" aria-label="商品种类">
                                    ${categories.filter((item) => item.id !== "all").map((item, index) => `
                                        <label class="category-option">
                                            <input type="radio" name="category" value="${escapeAttr(item.id)}" ${index === 0 ? "checked" : ""}>
                                            <span>${escapeHtml(item.label)}</span>
                                        </label>
                                    `).join("")}
                                </div>
                            </div>
                        </div>

                        <div class="field is-wide">
                            <div class="desc-label-row">
                                <label for="publishDesc">宝贝描述 <span class="req-star" aria-hidden="true">*</span></label>
                                <button class="tiny-action ai-write-button" type="button" data-ai-description>AI 帮你写</button>
                            </div>
                            <textarea class="textarea publish-desc" id="publishDesc" name="desc" required maxlength="1500" placeholder="描述一下品牌型号、货品来源、成色、瑕疵、配件和适合谁用..."></textarea>
                            <div class="desc-helper">
                                <span data-desc-count>0/1500</span>
                                <span>AI 会重写当前描述。</span>
                            </div>
                        </div>

                    </section>

                    <section class="publish-block publish-campus-block">
                        <div class="section-inline">
                            <h2>所在校区</h2>
                            <span>首页会显示校区。</span>
                        </div>
                        <div class="campus-options" role="radiogroup" aria-label="所在校区">
                            ${campusOptions.map((campus, index) => `
                                <label class="campus-option">
                                    <input type="radio" name="campus" value="${escapeAttr(campus)}" ${campus === selectedCampus || (!selectedCampus && index === 0) ? "checked" : ""}>
                                    <span>${escapeHtml(campus)}</span>
                                </label>
                            `).join("")}
                        </div>
                    </section>

                    <div class="publish-footer">
                        <button class="ghost-action" type="button" data-clear-images>清空图片</button>
                        <button class="primary-action publish-submit" type="submit">发布</button>
                    </div>
                </form>
            </section>
        `;
    }

    async function renderMessages(route) {
        const session = getSession();
        if (!session) {
            renderAuth({ query: { mode: "login", next: "/messages" } });
            return;
        }

        const productHint = route.query.productId ? await getMessageProductHint(route.query.productId) : null;
        let threads = [];
        let threadError = "";
        try {
            threads = await api("/chats");
        } catch (error) {
            threadError = error.message;
        }
        const enriched = await enrichThreads(threads, productHint, route.query);
        const selected = selectThread(enriched, route.query);
        const pendingProduct = productHint && route.query.productId && !selected ? productHint : null;

        app.innerHTML = `
            <section class="page messages-page">
                <div class="messages-shell">
                    <aside class="thread-list">
                        <div class="messages-head">
                            <h1>消息</h1>
                            <span>${enriched.length} 个会话</span>
                        </div>
                        ${threadError ? `<p class="messages-warning">${escapeHtml(threadError)}</p>` : ""}
                        <div class="thread-scroll">
                            ${enriched.length ? enriched.map((thread) => renderThreadCard(thread, selected)).join("") : `<div class="messages-empty">还没有消息</div>`}
                        </div>
                    </aside>
                    <section class="conversation-panel">
                        ${selected ? await renderThreadConversation(selected) : (pendingProduct ? await renderPendingProductConversation(pendingProduct) : renderMessageBlank())}
                    </section>
                </div>
            </section>
        `;
    }

    async function renderAdmin() {
        const session = getSession();
        if (!session) {
            renderAuth({ query: { mode: "login", next: "/admin" } });
            return;
        }
        if (session.username !== "czq") {
            app.innerHTML = `<section class="page admin-page">${renderEmpty("没有管理员权限", "只有管理员账号可以进入这里。", "回到首页", "#/")}</section>`;
            return;
        }
        const data = await apiGet("/admin");
        app.innerHTML = `
            <section class="page admin-page">
                <header class="page-header">
                    <span class="eyebrow">Admin</span>
                    <h1 class="page-title">管理员页面</h1>
                    <p class="page-lede">管理注册用户和商品。密码不会明文展示，只显示加密状态。</p>
                </header>
                <section class="admin-panel">
                    <div class="card-title-row">
                        <h3>注册用户</h3>
                        <span>${(data.users || []).length} 人</span>
                    </div>
                    <div class="admin-table">
                        ${(data.users || []).map((user) => `
                            <article class="admin-row">
                                <div>
                                    <strong>${escapeHtml(user.displayName || user.username)}</strong>
                                    <p>登录账号：${escapeHtml(user.username)} · ${escapeHtml(user.campus || "未设置校区")}</p>
                                    <p>密码：${escapeHtml(user.passwordStatus || "已加密保存")} · 注册：${escapeHtml(formatTime(user.createdAt))}</p>
                                </div>
                                ${user.username === "czq" ? `<span class="admin-badge">管理员</span>` : `<button class="ghost-action danger-action" type="button" data-admin-delete-user="${escapeAttr(user.id)}">删除用户</button>`}
                            </article>
                        `).join("")}
                    </div>
                </section>
                <section class="admin-panel">
                    <div class="card-title-row">
                        <h3>所有商品</h3>
                        <span>${(data.products || []).length} 件</span>
                    </div>
                    <div class="admin-table">
                        ${(data.products || []).map((product) => `
                            <article class="admin-row">
                                <div>
                                    <strong>${escapeHtml(product.title || "未命名商品")}</strong>
                                    <p>卖家：${escapeHtml(product.sellerUsername || "")} · ${escapeHtml(product.campus || "未设置校区")} · ${escapeHtml(product.status || "")}</p>
                                    <p>价格：¥${escapeHtml(formatPrice(product.price))} · 发布：${escapeHtml(formatTime(product.publishedAt || product.createdAt))}</p>
                                </div>
                                <button class="ghost-action danger-action" type="button" data-admin-delete-product="${escapeAttr(product.id)}">删除商品</button>
                            </article>
                        `).join("")}
                    </div>
                </section>
            </section>
        `;
    }

    async function renderMine() {
        const session = getSession();
        if (!session) {
            renderAuth({ query: { mode: "login", next: "/mine" } });
            return;
        }

        let myProducts = [];
        try {
            myProducts = await api(`/products/seller/${encodeURIComponent(session.username)}`);
        } catch (error) {
            myProducts = [];
            appState.lastApiError = error.message;
        }
        myProducts = myProducts.map(normalizeProduct);

        app.innerHTML = `
            <section class="page">
                <header class="page-header">
                    <span class="eyebrow">Profile</span>
                    <h1 class="page-title">我的校园货架。</h1>
                    <p class="page-lede">这里管理个人资料和已发布的闲置。资料越清楚，买家越容易放心联系你。</p>
                </header>

                <div class="mine-layout">
                    <aside class="profile-card">
                        <div class="profile-hero">
                            ${avatarHtml(session.avatar, session.displayName || session.username)}
                            <div>
                                <h2>${escapeHtml(session.displayName || session.username)}</h2>
                                <p>@${escapeHtml(session.username)} · ${escapeHtml(session.campus || "未设置校区")}</p>
                            </div>
                        </div>
                        <div class="stat-strip">
                            <div class="stat"><strong>${myProducts.length}</strong><span>发布中</span></div>
                            <div class="stat"><strong>7天</strong><span>登录有效</span></div>
                        </div>
                        <form class="auth-form" data-profile-form>
                            <div class="field">
                                <label for="profileName">用户名</label>
                                <input class="input" id="profileName" name="displayName" value="${escapeAttr(session.displayName || "")}">
                            </div>
                            <div class="field">
                                <label for="profileCampus">所在校区</label>
                                <div class="campus-options compact" id="profileCampus" role="radiogroup" aria-label="所在校区">
                                    ${campusOptions.map((campus, index) => `
                                        <label class="campus-option">
                                            <input type="radio" name="campus" value="${escapeAttr(campus)}" ${session.campus === campus || (!session.campus && index === 0) ? "checked" : ""}>
                                            <span>${escapeHtml(campus)}</span>
                                        </label>
                                    `).join("")}
                                </div>
                            </div>
                            <div class="field">
                                <label for="profileAvatar">头像</label>
                                <div class="avatar-picker">
                                    <label class="avatar-preview" for="profileAvatar" data-avatar-preview>
                                        ${avatarHtml(session.avatar, session.displayName || session.username)}
                                        <span class="avatar-change-text">更换头像</span>
                                    </label>
                                    <input class="sr-only" id="profileAvatar" type="file" accept="image/*" data-avatar-input>
                                </div>
                            </div>
                            <div class="form-actions">
                                <button class="primary-action" type="submit">保存资料</button>
                                <button class="ghost-action" type="button" data-logout>退出登录</button>
                            </div>
                        </form>
                    </aside>

                    <section>
                        <div class="section-head">
                            <div>
                                <h2>我的发布</h2>
                                <p>${appState.lastApiError ? escapeHtml(appState.lastApiError) : "买家会从商品详情页发起聊天，你也可以在消息页统一回复。"}</p>
                            </div>
                        </div>
                        <div class="market-grid">
                            ${myProducts.length ? renderProductGrid(myProducts) : renderEmpty("还没有发布闲置", "第一件可以从教材、耳机、小桌子开始，很快就能让页面热起来。", "发布闲置", "#/publish")}
                        </div>
                    </section>
                </div>
            </section>
        `;
    }

    async function renderCurrentUserProfile() {
        const session = getSession();
        if (!session) {
            renderAuth({ query: { mode: "login", next: "/mine" } });
            return;
        }
        let products = [];
        try {
            products = await listSellerProducts(session.username, "all");
        } catch (error) {
            appState.lastApiError = error.message;
        }
        app.innerHTML = renderProfilePage({
            user: session,
            products,
            isMine: true,
            status: parseRoute().query.status || "onsale",
            error: appState.lastApiError
        });
    }

    async function renderUserProfile(route) {
        const username = route.params.username;
        const session = getSession();
        if (session && session.username === username) {
            await renderCurrentUserProfile();
            return;
        }
        const [user, products] = await Promise.all([
            getPublicUser(username),
            listSellerProducts(username, "all")
        ]);
        app.innerHTML = renderProfilePage({ user, products, isMine: false, status: route.query.status || "onsale" });
    }

    function renderProfilePage({ user, products, isMine, status = "onsale", error = "" }) {
        const normalized = (products || []).map(normalizeProduct);
        const onsaleProducts = normalized.filter((product) => product.status === "onsale");
        const soldProducts = normalized.filter((product) => product.status === "sold");
        const profileBio = user.bio || "还没有个性签名";
        return `
            <section class="page profile-page">
                <section class="seller-profile-hero">
                    <div class="seller-profile-bg" aria-hidden="true"></div>
                    <div class="seller-profile-main">
                        ${avatarHtml(user.avatar, user.displayName || user.username)}
                        <div>
                            <div class="profile-name-row">
                                <h1>${escapeHtml(user.displayName || user.username || "校园同学")}</h1>
                                <span class="profile-chip">${isMine ? "我的主页" : "校园卖家"}</span>
                                ${isMine ? `<button class="ghost-action profile-edit-inline" type="button" data-edit-profile>修改资料</button>` : ""}
                            </div>
                            <p>@${escapeHtml(user.username || "")} · ${escapeHtml(user.campus || "校内面交")}</p>
                            <p class="profile-bio">${escapeHtml(profileBio)}</p>
                        </div>
                    </div>
                    <div class="profile-stats-row">
                        <span><strong>${onsaleProducts.length}</strong> 在售</span>
                        <span><strong>${soldProducts.length}</strong> 已卖出</span>
                        <span><strong>${normalized.length}</strong> 全部</span>
                    </div>
                </section>

                ${renderProfileShelf({ user, products: normalized, isMine, status, error })}
            </section>
        `;
    }

    function renderProfileEditCard(user) {
        return `
            <form class="auth-form" data-profile-form>
                <div class="profile-hero compact">
                    <div class="avatar-picker inline-avatar-picker">
                        <label class="avatar-preview" for="profileAvatar" data-avatar-preview>
                            ${avatarHtml(user.avatar, user.displayName || user.username)}
                            <span class="avatar-change-text">更换头像</span>
                        </label>
                        <input class="sr-only" id="profileAvatar" type="file" accept="image/*" data-avatar-input>
                    </div>
                    <div>
                        <h2>${escapeHtml(user.displayName || user.username)}</h2>
                        <p>@${escapeHtml(user.username)} · ${escapeHtml(user.campus || "未设置校区")}</p>
                    </div>
                </div>
                <div class="field">
                    <label for="profileName">用户名</label>
                    <input class="input" id="profileName" name="displayName" value="${escapeAttr(user.displayName || "")}">
                </div>
                <div class="field">
                    <label for="profileCampus">所在校区</label>
                    <div class="campus-options compact" id="profileCampus" role="radiogroup" aria-label="所在校区">
                        ${campusOptions.map((campus, index) => `
                            <label class="campus-option">
                                <input type="radio" name="campus" value="${escapeAttr(campus)}" ${user.campus === campus || (!user.campus && index === 0) ? "checked" : ""}>
                                <span>${escapeHtml(campus)}</span>
                            </label>
                        `).join("")}
                    </div>
                </div>
                <div class="field">
                    <label for="profileBio">个性签名</label>
                    <textarea class="input textarea" id="profileBio" name="bio" maxlength="160" placeholder="还没有个性签名">${escapeHtml(user.bio || "")}</textarea>
                </div>
                <div class="form-actions">
                    <button class="primary-action" type="submit">保存资料</button>
                    <button class="ghost-action" type="button" data-logout>退出登录</button>
                </div>
            </form>
        `;
    }

    function renderProfileEditModal() {
        const session = getSession();
        if (!session || !modalRoot) return;
        modalRoot.classList.add("is-open");
        modalRoot.innerHTML = `
            <section class="auth-overlay">
                <button class="auth-scrim" type="button" aria-hidden="true" tabindex="-1"></button>
                <div class="auth-dialog profile-edit-dialog" role="dialog" aria-modal="true" aria-labelledby="profileEditTitle">
                    <button class="dialog-close" type="button" data-close-modal aria-label="关闭">×</button>
                    <div class="setup-heading">
                        <span>个人资料</span>
                        <h1 id="profileEditTitle">修改资料</h1>
                    </div>
                    ${renderProfileEditCard(session)}
                </div>
            </section>
        `;
    }

    function renderProfileShelf({ user, products, isMine, status = "onsale", error = "" }) {
        const username = user.username || "";
        const onsaleProducts = (products || []).filter((product) => product.status === "onsale");
        const soldProducts = (products || []).filter((product) => product.status === "sold");
        const activeStatus = ["onsale", "sold", "all"].includes(status) ? status : "onsale";
        const visibleProducts = activeStatus === "sold" ? soldProducts : activeStatus === "all" ? (products || []) : onsaleProducts;
        const basePath = isMine ? "#/mine" : `#/user/${encodeURIComponent(username)}`;
        const statusLabel = activeStatus === "sold" ? "已卖出" : activeStatus === "all" ? "全部" : "在售";
        return `
            <section class="profile-shelf">
                <div class="section-head">
                    <div>
                        <h2>${isMine ? "我的发布" : "他的闲置"}</h2>
                        <p>${error ? escapeHtml(error) : "在售和已卖出分开放，买家一眼就能看明白。"}</p>
                    </div>
                </div>
                <div class="profile-tabs">
                    <a class="filter-chip ${activeStatus === "onsale" ? "is-active" : ""}" href="${basePath}?status=onsale">在售 ${onsaleProducts.length}</a>
                    <a class="filter-chip ${activeStatus === "sold" ? "is-active sold-chip" : "sold-chip"}" href="${basePath}?status=sold">已卖出 ${soldProducts.length}</a>
                    <a class="filter-chip ${activeStatus === "all" ? "is-active" : ""}" href="${basePath}?status=all">全部 ${(products || []).length}</a>
                </div>
                <div class="profile-section">
                    <h3>${statusLabel}</h3>
                    <div class="market-grid">
                        ${visibleProducts.length ? renderProductGridV2(visibleProducts, { showOwnerActions: isMine && activeStatus !== "sold" }) : `<p class="tip">暂时还没有${statusLabel}商品。</p>`}
                    </div>
                </div>
            </section>
        `;
    }

    async function renderAuth(route) {
        const mode = route.query.mode === "register" ? "register" : "login";
        const next = route.query.next || "/";
        const title = mode === "login" ? "账号登录" : "创建账号";
        if (!modalRoot) return;
        modalRoot.classList.add("is-open");
        modalRoot.innerHTML = `
            <section class="auth-overlay">
                <button class="auth-scrim" type="button" aria-hidden="true" tabindex="-1"></button>
                <div class="auth-dialog" role="dialog" aria-modal="true" aria-labelledby="authTitle">
                    <button class="dialog-close" type="button" data-close-modal aria-label="关闭">×</button>
                    <div class="auth-dialog-main">
                        <div>
                            <h1 class="auth-title" id="authTitle">${title}</h1>
                        </div>
                        <div class="tabs">
                            <a class="tab-button ${mode === "login" ? "is-active" : ""}" href="#/auth?mode=login&next=${encodeURIComponent(next)}">登录</a>
                            <a class="tab-button ${mode === "register" ? "is-active" : ""}" href="#/auth?mode=register&next=${encodeURIComponent(next)}">注册</a>
                        </div>
                    </div>
                    <form class="auth-form" data-auth-form data-mode="${mode}" data-next="${escapeAttr(next)}">
                        <div class="field">
                            <label for="authUsername">账号</label>
                            <input class="input" id="authUsername" name="username" required autocomplete="username" pattern="[A-Za-z0-9_]{3,32}" title="账号只能使用 3-32 位英文、数字或下划线" placeholder="3-32 位英文、数字或下划线">
                        </div>
                        <div class="field">
                            <label for="authPassword">密码</label>
                            <input class="input" id="authPassword" name="password" type="password" required autocomplete="${mode === "login" ? "current-password" : "new-password"}" minlength="6" placeholder="至少 6 位">
                        </div>
                        ${mode === "register" ? `
                            <div class="field">
                                <label for="authPasswordConfirm">再次输入密码</label>
                                <input class="input" id="authPasswordConfirm" name="confirmPassword" type="password" required autocomplete="new-password" minlength="6" placeholder="再输一次密码">
                            </div>
                            <div class="field">
                                <label for="authCaptcha">验证码</label>
                                <div class="inline-input-action">
                                    <input class="input" id="authCaptcha" name="captchaAnswer" required inputmode="numeric" autocomplete="off" placeholder="正在生成验证码">
                                    <button class="tiny-action" type="button" data-refresh-captcha>换一题</button>
                                </div>
                                <small data-captcha-question>正在生成验证码...</small>
                            </div>
                        ` : ""}
                        <button class="primary-action auth-submit" type="submit">${mode === "login" ? "登录" : "注册"}</button>
                    </form>
                </div>
            </section>
        `;
        if (mode === "register") {
            refreshCaptcha();
        }
    }

    function renderOnboardingDialog(user, next = "/") {
        const account = user?.username || "";
        const displayName = user?.displayName && user.displayName !== account ? user.displayName : "";
        return `
            <section class="auth-overlay">
                <button class="auth-scrim" type="button" aria-hidden="true" tabindex="-1"></button>
                <div class="auth-dialog profile-setup-dialog" role="dialog" aria-modal="true" aria-labelledby="setupTitle">
                    <form class="auth-form" data-onboarding-form data-next="${escapeAttr(next)}" data-account="${escapeAttr(account)}">
                        <div class="setup-heading">
                            <span>注册成功</span>
                            <h1 id="setupTitle">设置头像和用户名</h1>
                            <p>账号用于登录，用户名会显示给其他同学。</p>
                        </div>
                        <div class="field">
                            <label for="setupAvatar">头像</label>
                            <div class="avatar-picker">
                                <label class="avatar-preview" for="setupAvatar" data-avatar-preview>
                                    ${avatarHtml(user?.avatar, displayName || account)}
                                    <span class="avatar-change-text">更换头像</span>
                                </label>
                                <input class="sr-only" id="setupAvatar" type="file" accept="image/*" data-avatar-input>
                            </div>
                        </div>
                        <div class="field">
                            <label for="setupDisplayName">用户名</label>
                            <div class="inline-input-action">
                                <input class="input" id="setupDisplayName" name="displayName" required maxlength="32" value="${escapeAttr(displayName)}" placeholder="别人看到的名字">
                                <button class="tiny-action icon-action" type="button" data-random-display-name="${escapeAttr(account)}" aria-label="随机生成用户名">↻</button>
                            </div>
                            <small>登录账号：${escapeHtml(account)}</small>
                        </div>
                        <button class="primary-action auth-submit" type="submit">完成</button>
                    </form>
                </div>
            </section>
        `;
    }

    function renderNotFound() {
        app.innerHTML = `<section class="page">${renderEmpty("页面走丢了", "这个入口不存在，回到首页重新逛逛吧。", "回到首页", "#/")}</section>`;
    }

    function renderFatalError(error) {
        app.innerHTML = `
            <section class="page">
                ${renderEmpty("页面加载遇到问题", error.message || "请稍后再试。", "回到首页", "#/")}
            </section>
        `;
    }

    async function handleSubmit(event) {
        const form = event.target;
        if (form.matches("[data-search-form]")) {
            event.preventDefault();
            const q = new FormData(form).get("q") || "";
            window.location.hash = `#/search${q.toString().trim() ? `?q=${encodeURIComponent(q.toString().trim())}` : ""}`;
            return;
        }

        if (form.matches("[data-auth-form]")) {
            event.preventDefault();
            await submitAuthForm(form);
            return;
        }

        if (form.matches("[data-publish-form]")) {
            event.preventDefault();
            await submitPublishForm(form);
            return;
        }

        if (form.matches("[data-chat-form]")) {
            event.preventDefault();
            await submitChatForm(form);
            return;
        }

        if (form.matches("[data-comment-form]")) {
            event.preventDefault();
            await submitCommentForm(form);
            return;
        }

        if (form.matches("[data-profile-form]")) {
            event.preventDefault();
            await submitProfileForm(form);
            return;
        }

        if (form.matches("[data-onboarding-form]")) {
            event.preventDefault();
            await submitOnboardingForm(form);
        }
    }

    async function handleClick(event) {
        const filter = event.target.closest("[data-filter]");
        if (filter) {
            event.preventDefault();
            const value = filter.getAttribute("data-filter") || "all";
            const route = parseRoute();
            if (route.name === "home") {
                appState.homeFilter = value;
                updateHomeGrid();
            } else {
                window.location.hash = buildSearchHash({ q: route.query.q || "", category: value, campus: route.query.campus || "all" });
            }
            return;
        }

        const campusFilter = event.target.closest("[data-campus-filter]");
        if (campusFilter) {
            event.preventDefault();
            const value = campusFilter.getAttribute("data-campus-filter") || "all";
            const route = parseRoute();
            appState.campusMenuOpen = false;
            if (route.name === "home") {
                appState.homeCampus = value;
                updateHomeGrid();
            } else {
                window.location.hash = buildSearchHash({ q: route.query.q || "", category: route.query.category || "all", campus: value });
            }
            document.querySelectorAll(".campus-filter.is-open").forEach((item) => item.classList.remove("is-open"));
            return;
        }

        const campusToggle = event.target.closest("[data-campus-toggle]");
        if (campusToggle) {
            event.preventDefault();
            const menu = campusToggle.closest(".campus-filter");
            const willOpen = !menu?.classList.contains("is-open");
            appState.campusMenuOpen = willOpen;
            document.querySelectorAll(".campus-filter.is-open").forEach((item) => {
                if (item !== menu) item.classList.remove("is-open");
            });
            menu?.classList.toggle("is-open", willOpen);
            campusToggle.setAttribute("aria-expanded", appState.campusMenuOpen ? "true" : "false");
            return;
        }

        if (appState.campusMenuOpen && !event.target.closest(".campus-filter")) {
            appState.campusMenuOpen = false;
            document.querySelectorAll(".campus-filter.is-open").forEach((item) => item.classList.remove("is-open"));
        }

        const thumb = event.target.closest("[data-thumb]");
        if (thumb) {
            event.preventDefault();
            switchGalleryImage(thumb);
            return;
        }

        const backTop = event.target.closest("[data-back-top]");
        if (backTop) {
            event.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
        }

        const aiButton = event.target.closest("[data-ai-button]");
        if (aiButton) {
            event.preventDefault();
            await runAiAdvice(aiButton);
            return;
        }

        const aiDescription = event.target.closest("[data-ai-description]");
        if (aiDescription) {
            event.preventDefault();
            await runAiDescription(aiDescription);
            return;
        }

        const startChat = event.target.closest("[data-start-chat]");
        if (startChat) {
            event.preventDefault();
            const productId = startChat.getAttribute("data-start-chat");
            if (!getSession()) {
                renderAuth({ query: { mode: "login", next: `/messages?productId=${encodeURIComponent(productId)}` } });
                return;
            }
            if (isDemoId(productId)) {
                showToast("这是本地预览商品，连接后端并发布真实商品后才能聊天", "error");
                return;
            }
            window.location.hash = `#/messages?productId=${encodeURIComponent(productId)}`;
            return;
        }

        const commentsTarget = event.target.closest("[data-scroll-comments]");
        if (commentsTarget) {
            event.preventDefault();
            document.querySelector("#comments")?.scrollIntoView({ behavior: "smooth", block: "start" });
            return;
        }

        const editProfile = event.target.closest("[data-edit-profile]");
        if (editProfile) {
            event.preventDefault();
            renderProfileEditModal();
            return;
        }

        const close = event.target.closest("[data-close-modal]");
        if (close) {
            event.preventDefault();
            closeModal();
            if (parseRoute().name === "auth") {
                window.location.hash = "#/";
            }
            return;
        }

        const markSold = event.target.closest("[data-mark-sold]");
        if (markSold) {
            event.preventDefault();
            await markProductSold(markSold);
            return;
        }

        const adminDeleteProduct = event.target.closest("[data-admin-delete-product]");
        if (adminDeleteProduct) {
            event.preventDefault();
            await adminDelete("product", adminDeleteProduct.getAttribute("data-admin-delete-product"));
            return;
        }

        const adminDeleteUser = event.target.closest("[data-admin-delete-user]");
        if (adminDeleteUser) {
            event.preventDefault();
            await adminDelete("user", adminDeleteUser.getAttribute("data-admin-delete-user"));
            return;
        }

        const clearImages = event.target.closest("[data-clear-images]");
        if (clearImages) {
            event.preventDefault();
            appState.publishImages = [];
            refreshImagePreviews();
            return;
        }

        const removeImage = event.target.closest("[data-remove-image]");
        if (removeImage) {
            event.preventDefault();
            const index = Number(removeImage.getAttribute("data-remove-image"));
            appState.publishImages.splice(index, 1);
            refreshImagePreviews();
            return;
        }

        const randomDisplayName = event.target.closest("[data-random-display-name]");
        if (randomDisplayName) {
            event.preventDefault();
            await fillRandomDisplayName(randomDisplayName);
            return;
        }

        const refreshCaptchaButton = event.target.closest("[data-refresh-captcha]");
        if (refreshCaptchaButton) {
            event.preventDefault();
            await refreshCaptcha();
            return;
        }

        const authTrigger = event.target.closest("[data-auth-trigger]");
        if (authTrigger) {
            event.preventDefault();
            renderAuth({
                query: {
                    mode: authTrigger.getAttribute("data-auth-mode") || "login",
                    next: authTrigger.getAttribute("data-auth-next") || window.location.hash.slice(1) || "/"
                }
            });
            return;
        }

        const logout = event.target.closest("[data-logout]");
        if (logout) {
            event.preventDefault();
            await logoutUser();
        }
    }

    async function handleChange(event) {
        const imageInput = event.target.closest("[data-image-input]");
        if (imageInput) {
            await addImages(imageInput.files);
            imageInput.value = "";
            return;
        }

        const avatarInput = event.target.closest("[data-avatar-input]");
        if (avatarInput && avatarInput.files && avatarInput.files[0]) {
            try {
                const avatar = await compressImage(avatarInput.files[0], { maxSize: 512, quality: 0.82 });
                avatarInput.dataset.avatar = avatar;
                const preview = avatarInput.closest(".avatar-picker")?.querySelector("[data-avatar-preview]");
                if (preview) {
                    const session = getSession();
                    preview.innerHTML = `${avatarHtml(avatar, session?.displayName || session?.username)}<span class="avatar-change-text">更换头像</span>`;
                    preview.classList.add("is-ready");
                }
                showToast("头像已准备好");
            } catch (error) {
                showToast(error.message, "error");
            }
        }
    }

    function handleInput(event) {
        if (event.target.matches("#publishDesc")) {
            updateDescriptionCount(event.target);
        }
    }

    function handleDragOver(event) {
        const zone = event.target.closest("[data-dropzone]");
        if (!zone) return;
        event.preventDefault();
        zone.classList.add("is-dragging");
    }

    function handleDragLeave(event) {
        const zone = event.target.closest("[data-dropzone]");
        if (!zone) return;
        zone.classList.remove("is-dragging");
    }

    async function handleDrop(event) {
        const zone = event.target.closest("[data-dropzone]");
        if (!zone) return;
        event.preventDefault();
        zone.classList.remove("is-dragging");
        await addImages(event.dataTransfer.files);
    }

    async function submitAuthForm(form) {
        const button = form.querySelector("button[type='submit']");
        setBusy(button, true);
        const data = Object.fromEntries(new FormData(form));
        const mode = form.dataset.mode;
        const next = form.dataset.next || "/";

        try {
            let auth;
            if (mode === "register") {
                if (data.password !== data.confirmPassword) {
                    throw new Error("两次输入的密码不一致");
                }
                const username = String(data.username || "").trim();
                auth = await api("/auth/register", {
                    method: "POST",
                    body: JSON.stringify({
                        username,
                        password: data.password,
                        displayName: username,
                        campus: "",
                        captchaId: appState.captcha?.captchaId || "",
                        captchaAnswer: data.captchaAnswer || "",
                        avatar: null
                    })
                });
            } else {
                auth = await api("/auth/login", {
                    method: "POST",
                    body: JSON.stringify({ username: data.username, password: data.password })
                });
            }
            setSession(auth);
            renderAuthChip();
            if (mode === "register") {
                showToast("账号创建成功");
                if (modalRoot) {
                    modalRoot.classList.add("is-open");
                    modalRoot.innerHTML = renderOnboardingDialog(auth.user || auth, next);
                }
            } else {
                showToast("登录成功");
                closeModal();
                window.location.hash = next.startsWith("/") ? `#${next}` : "#/";
            }
        } catch (error) {
            showToast(error.message, "error");
        } finally {
            setBusy(button, false);
        }
    }

    async function submitOnboardingForm(form) {
        const button = form.querySelector("button[type='submit']");
        const avatarInput = form.querySelector("[data-avatar-input]");
        const data = Object.fromEntries(new FormData(form));
        const next = form.dataset.next || "/";
        const account = form.dataset.account || "";
        const displayName = String(data.displayName || "").trim();

        if (!displayName) {
            showToast("请填写用户名", "error");
            return;
        }
        if (displayName.toLowerCase() === account.toLowerCase()) {
            showToast("用户名不要和登录账号一样", "error");
            return;
        }

        setBusy(button, true);
        try {
            const payload = {
                displayName,
                campus: ""
            };
            if (avatarInput && avatarInput.dataset.avatar) {
                payload.avatar = avatarInput.dataset.avatar;
            }
            const user = await api("/auth/me", {
                method: "PUT",
                body: JSON.stringify(payload)
            });
            const old = getSession();
            const nextUser = { ...user, ...payload };
            setSession({ token: old.token, expiresAt: old.expiresAt, user: nextUser });
            renderAuthChip();
            showToast("资料已完成");
            closeModal();
            window.location.hash = next.startsWith("/") ? `#${next}` : "#/";
        } catch (error) {
            showToast(error.message, "error");
        } finally {
            setBusy(button, false);
        }
    }

    async function fillRandomDisplayName(button) {
        const input = document.querySelector("#setupDisplayName");
        const account = button.getAttribute("data-random-display-name") || "";
        if (!input) return;
        setBusy(button, true);
        try {
            const response = await api(`/auth/random-display-name?account=${encodeURIComponent(account)}`);
            input.value = response.displayName || localDisplayName(account);
        } catch (error) {
            input.value = localDisplayName(account);
        } finally {
            setBusy(button, false);
            button.textContent = "↻";
        }
    }

    async function refreshCaptcha() {
        const question = document.querySelector("[data-captcha-question]");
        const input = document.querySelector("#authCaptcha");
        try {
            const captcha = await apiGet("/auth/captcha");
            appState.captcha = captcha;
            if (question) question.textContent = captcha.question || "请输入验证码";
            if (input) {
                input.value = "";
                input.placeholder = "填写结果";
            }
        } catch (error) {
            appState.captcha = null;
            if (question) question.textContent = error.message;
            if (input) input.placeholder = "验证码加载失败";
        }
    }

    function localDisplayName(account = "") {
        const adjectives = ["松果", "晴天", "小鹿", "海盐", "橘子", "山月", "白桃", "南风", "一禾", "星野"];
        const nouns = ["同学", "书友", "摊主", "小铺", "行李箱", "课代表", "收藏家", "骑手", "铅笔", "胶囊"];
        let value = `${adjectives[Math.floor(Math.random() * adjectives.length)]}${nouns[Math.floor(Math.random() * nouns.length)]}${Math.floor(10 + Math.random() * 90)}`;
        if (value === account) value = `校园${value}`;
        return value;
    }

    async function submitPublishForm(form) {
        const session = getSession();
        if (!session) {
            renderAuth({ query: { mode: "login", next: "/publish" } });
            return;
        }

        const button = form.querySelector("button[type='submit']");
        setBusy(button, true);
        const data = Object.fromEntries(new FormData(form));

        try {
            const product = await api("/products", {
                method: "POST",
                body: JSON.stringify({
                    title: data.title,
                    price: Number(data.price),
                    category: data.category,
                    desc: data.desc,
                    images: appState.publishImages,
                    campus: data.campus || session.campus || ""
                })
            });
            appState.publishImages = [];
            showToast("发布成功，已经放到校园货架上");
            window.location.hash = `#/product/${encodeURIComponent(product.id)}`;
        } catch (error) {
            showToast(error.message, "error");
        } finally {
            setBusy(button, false);
        }
    }

    async function submitChatForm(form) {
        const session = getSession();
        if (!session) {
            renderAuth({ query: { mode: "login", next: window.location.hash.slice(1) || "/" } });
            return;
        }

        const button = form.querySelector("button[type='submit']");
        const data = Object.fromEntries(new FormData(form));
        const contentInput = form.querySelector("input[name='content']");
        const content = (data.content || "").trim() || contentInput?.placeholder || "同学，这个还在吗？";
        if (!content) return;
        setBusy(button, true);

        try {
            if (isDemoId(data.productId)) {
                showToast("这是本地预览商品，真实聊天需要连接后端后使用", "error");
                return;
            }
            await api(`/chats/products/${encodeURIComponent(data.productId)}/messages`, {
                method: "POST",
                body: JSON.stringify({
                    buyerUsername: data.buyerUsername || undefined,
                    content
                })
            });
            showToast("消息已发送");
            const next = `#/messages?productId=${encodeURIComponent(data.productId)}${data.buyerUsername ? `&buyer=${encodeURIComponent(data.buyerUsername)}` : ""}`;
            if (window.location.hash === next) {
                await renderRoute();
            } else {
                window.location.hash = next;
            }
        } catch (error) {
            showToast(error.message, "error");
        } finally {
            setBusy(button, false);
        }
    }

    async function submitCommentForm(form) {
        const session = getSession();
        if (!session) {
            renderAuth({ query: { mode: "login", next: `/product/${encodeURIComponent(form.productId.value)}` } });
            return;
        }

        const button = form.querySelector("button[type='submit']");
        const data = Object.fromEntries(new FormData(form));
        const content = (data.content || "").trim();
        if (!content) return;
        const errorSlot = form.querySelector("[data-comment-error]");
        if (errorSlot) {
            errorSlot.hidden = true;
            errorSlot.textContent = "";
        }
        setBusy(button, true);

        try {
            const created = await createProductComment(data.productId, content);
            showToast("留言已发布");
            const card = form.closest(".comment-card");
            if (card) {
                const list = card.querySelector(".comment-list");
                const count = card.querySelector(".comment-count");
                const existing = Array.from(list?.querySelectorAll(".comment-item") || []).length;
                if (list) {
                    const tip = list.querySelector(".tip");
                    if (tip) tip.remove();
                    list.insertAdjacentHTML("afterbegin", renderCommentItem(created));
                }
                if (count) count.textContent = `${existing + 1} 条`;
            }
            form.reset();
        } catch (error) {
            if (errorSlot) {
                errorSlot.hidden = false;
                errorSlot.textContent = error.message;
            }
            showToast(error.message, "error");
        } finally {
            setBusy(button, false);
        }
    }

    async function submitProfileForm(form) {
        const button = form.querySelector("button[type='submit']");
        setBusy(button, true);
        const data = Object.fromEntries(new FormData(form));
        const avatarInput = form.querySelector("[data-avatar-input]");

        try {
            const payload = {
                displayName: data.displayName || "",
                campus: data.campus || "",
                bio: data.bio || ""
            };
            if (avatarInput && avatarInput.dataset.avatar) {
                payload.avatar = avatarInput.dataset.avatar;
            }
            const user = await api("/auth/me", {
                method: "PUT",
                body: JSON.stringify(payload)
            });
            const old = getSession();
            setSession({ token: old.token, expiresAt: old.expiresAt, user });
            renderAuthChip();
            showToast("资料已保存");
            await renderRoute();
        } catch (error) {
            showToast(error.message, "error");
        } finally {
            setBusy(button, false);
        }
    }

    async function markProductSold(button) {
        const id = button.getAttribute("data-mark-sold");
        if (!id) return;
        setBusy(button, true);
        try {
            if (isDemoId(id)) {
                const product = demoProducts.find((item) => String(item.id) === String(id));
                if (product) product.status = "sold";
            } else {
                await api(`/products/${encodeURIComponent(id)}/sold`, { method: "POST" });
            }
            showToast("已标记为卖出，首页不会再展示它");
            await renderRoute();
        } catch (error) {
            showToast(error.message, "error");
        } finally {
            setBusy(button, false);
        }
    }

    async function adminDelete(type, id) {
        if (!id) return;
        const label = type === "user" ? "用户" : "商品";
        if (!window.confirm(`确定删除这个${label}吗？此操作不可恢复。`)) return;
        try {
            await api(`/admin/${type === "user" ? "users" : "products"}/${encodeURIComponent(id)}`, { method: "DELETE" });
            showToast(`${label}已删除`);
            await renderRoute();
        } catch (error) {
            showToast(error.message, "error");
        }
    }

    async function runAiAdvice(button) {
        const productId = button.getAttribute("data-ai-button");
        const product = await getProduct(productId);
        const card = button.closest(".ai-card");
        if (!card) return;
        button.disabled = true;
        button.textContent = "AI 正在看图和价格...";

        try {
            const advice = await requestAiAdvice(productId, product);
            card.outerHTML = renderAiAdvice(product, advice);
            showToast("AI 建议已生成");
        } catch (error) {
            showToast(error.message, "error");
            button.disabled = false;
            button.textContent = "重新判断";
        }
    }

    async function requestAiAdvice(productId, product) {
        if (isDemoId(productId)) {
            return localAdvice(product, "demo");
        }

        try {
            const advice = await api(`/ai/products/${encodeURIComponent(productId)}/advice`, { method: "POST" });
            return normalizeAdvice(advice);
        } catch (error) {
            const fallback = localAdvice(product, "frontend-fallback");
            fallback.summary = `${fallback.summary} 后端 AI 暂时不可用，当前结果是前端轻量兜底判断。`;
            fallback.provider = "frontend-fallback";
            return fallback;
        }
    }

    async function runAiDescription(button) {
        const form = button.closest("[data-publish-form]");
        const descInput = form?.querySelector("#publishDesc");
        if (!form || !descInput) return;

        const payload = readDescriptionPayload(form);
        if (!payload.images.length && !payload.desc && !payload.title) {
            showToast("先加一张图片，或简单写几句商品信息，AI 才好帮你补描述", "error");
            return;
        }

        setBusy(button, true);
        button.textContent = "正在写...";
        descInput.value = "";
        descInput.dispatchEvent(new Event("input", { bubbles: true }));

        try {
            const response = await requestAiDescription(payload);
            descInput.value = response.description;
            descInput.dispatchEvent(new Event("input", { bubbles: true }));
            showToast("AI 已帮你整理好描述");
        } catch (error) {
            showToast(error.message, "error");
        } finally {
            setBusy(button, false);
            button.textContent = "AI 帮你写";
        }
    }

    function readDescriptionPayload(form) {
        const data = Object.fromEntries(new FormData(form));
        return {
            title: String(data.title || "").trim(),
            price: Number(data.price || 0),
            category: String(data.category || "other"),
            desc: String(data.desc || "").trim(),
            campus: String(data.campus || "").trim(),
            images: appState.publishImages
        };
    }

    async function requestAiDescription(payload) {
        try {
            const response = await api("/ai/description", {
                method: "POST",
                body: JSON.stringify(payload)
            });
            return normalizeDescription(response, payload);
        } catch (error) {
            return localDescription(payload, "frontend-fallback");
        }
    }

    async function renderChatRegion(product, selectedBuyer, context) {
        const session = getSession();
        if (!session) {
            return renderAuthRequired("登录后和卖家聊天", "先登录，再向卖家确认成色、配件和交易地点。", `#/auth?mode=login&next=/product/${encodeURIComponent(product.id)}`);
        }
        if (isDemoId(product.id)) {
            return `
                <div class="chat-card">
                    <div class="card-title-row"><h3>联系卖家</h3></div>
                    <p class="tip">当前是未连接后端时的本地预览商品。启动后端并发布真实商品后，这里会自动接入站内聊天。</p>
                </div>
            `;
        }

        const isSeller = session.username === product.sellerUsername;
        try {
            if (isSeller) {
                const threads = await api(`/chats/products/${encodeURIComponent(product.id)}/threads`);
                const buyer = selectedBuyer || (threads[0] && threads[0].buyerUsername) || "";
                const messages = buyer ? await api(`/chats/products/${encodeURIComponent(product.id)}/messages?buyerUsername=${encodeURIComponent(buyer)}`) : [];
                return renderSellerChat(product, threads, buyer, messages, context);
            }

            const messages = await api(`/chats/products/${encodeURIComponent(product.id)}/messages`);
            return renderChatBox(product, messages, "", context);
        } catch (error) {
            return `
                <div class="chat-card">
                    <div class="card-title-row"><h3>联系卖家</h3></div>
                    <p class="tip">${escapeHtml(error.message)}</p>
                    <form class="chat-form" data-chat-form>
                        <input type="hidden" name="productId" value="${escapeAttr(product.id)}">
                        <input class="input" name="content" maxlength="1000" placeholder="先发一句：同学，这个还在吗？">
                        <button class="primary-action" type="submit">发送</button>
                    </form>
                </div>
            `;
        }
    }

    function renderSellerChat(product, threads, selectedBuyer, messages, context, error = "") {
        if (!threads.length) {
            return `
                <div class="chat-card">
                    <div class="card-title-row"><h3>买家消息</h3></div>
                    <p class="tip">这件商品还没有买家发起聊天。有人咨询后，你可以在这里或消息页回复。</p>
                </div>
            `;
        }

        return `
            <div class="chat-card">
                ${renderConversationHead(product, selectedBuyer || (threads[0] && threads[0].buyerUsername), "买家消息")}
                <div class="filter-rail">
                    ${threads.map((thread) => `
                        <a class="filter-chip ${thread.buyerUsername === selectedBuyer ? "is-active" : ""}"
                           href="${context === "messages" ? `#/messages?productId=${encodeURIComponent(product.id)}&buyer=${encodeURIComponent(thread.buyerUsername)}` : `#/product/${encodeURIComponent(product.id)}?buyer=${encodeURIComponent(thread.buyerUsername)}`}">
                            ${escapeHtml(thread.buyerUsername)}
                        </a>
                    `).join("")}
                </div>
                ${renderMessagesList(messages, { product, buyerUsername: selectedBuyer })}
                ${error ? `<p class="messages-warning">${escapeHtml(error)}</p>` : ""}
                <form class="chat-form" data-chat-form>
                    <input type="hidden" name="productId" value="${escapeAttr(product.id)}">
                    <input type="hidden" name="buyerUsername" value="${escapeAttr(selectedBuyer)}">
                    <input class="input" name="content" maxlength="1000" placeholder="回复买家...">
                    <button class="primary-action" type="submit">发送</button>
                </form>
            </div>
        `;
    }

    function renderChatBox(product, messages, buyerUsername, context, error = "") {
        return `
            <div class="chat-card">
                ${renderConversationHead(product, product.sellerUsername, "联系卖家", context)}
                ${renderMessagesList(messages, { product, buyerUsername })}
                ${error ? `<p class="messages-warning">${escapeHtml(error)}</p>` : ""}
                <form class="chat-form" data-chat-form>
                    <input type="hidden" name="productId" value="${escapeAttr(product.id)}">
                    ${buyerUsername ? `<input type="hidden" name="buyerUsername" value="${escapeAttr(buyerUsername)}">` : ""}
                    <input class="input" name="content" maxlength="1000" placeholder="同学，这个还在吗？">
                    <button class="primary-action" type="submit">发送</button>
                </form>
            </div>
        `;
    }

    function renderConversationHead(product, counterpartUsername, title, context = "messages") {
        const session = getSession();
        const isSeller = session && session.username === product.sellerUsername;
        const counterpart = isSeller ? (counterpartUsername || "同学") : product.sellerUsername;
        const displayName = isSeller
            ? counterpart
            : (product.sellerDisplayName || product.sellerUsername || "同学");
        const avatar = isSeller ? "" : product.sellerAvatar;
        const userHref = counterpart ? `#/user/${encodeURIComponent(counterpart)}` : "#/messages";
        const detailLink = context === "messages"
            ? `<a class="tiny-action" href="#/product/${encodeURIComponent(product.id)}">商品</a>`
            : `<a class="tiny-action" href="#/messages?productId=${encodeURIComponent(product.id)}${counterpartUsername ? `&buyer=${encodeURIComponent(counterpartUsername)}` : ""}">消息页</a>`;
        return `
            <div class="conversation-head">
                <a class="seller-avatar-link" href="${userHref}" aria-label="进入主页">
                    ${avatarHtml(avatar, displayName)}
                </a>
                <div>
                    <h3>${escapeHtml(title)}</h3>
                    <p>${escapeHtml(displayName || "同学")} · ${escapeHtml(product.title || "商品")}</p>
                </div>
                ${detailLink}
            </div>
        `;
    }

    function renderMessagesList(messages, context = {}) {
        const session = getSession();
        if (!messages || !messages.length) {
            return `<div class="chat-messages"><p class="tip">还没有消息，先发一句问问成色和取货时间。</p></div>`;
        }
        return `
            <div class="chat-messages">
                ${messages.map((message) => {
                    const mine = session && message.senderUsername === session.username;
                    const displayName = resolveMessageSenderName(message, context);
                    const avatar = resolveMessageSenderAvatar(message, context);
                    const href = message.senderUsername ? `#/user/${encodeURIComponent(message.senderUsername)}` : "#/messages";
                    return `
                        <div class="message ${mine ? "is-mine" : ""}">
                            ${mine ? "" : `<a class="message-avatar" href="${href}" aria-label="进入主页">${avatarHtml(avatar, displayName)}</a>`}
                            <div class="message-stack">
                                <div class="message-bubble">${escapeHtml(message.content)}</div>
                                <div class="message-meta">${escapeHtml(displayName || message.senderUsername || "")} · ${escapeHtml(formatTime(message.sentAt || message.createdAt))}</div>
                            </div>
                            ${mine ? `<a class="message-avatar" href="#/mine" aria-label="进入我的主页">${avatarHtml(session.avatar, session.displayName || session.username)}</a>` : ""}
                        </div>
                    `;
                }).join("")}
            </div>
        `;
    }

    async function renderThreadConversation(thread) {
        const product = thread.product || await getProduct(thread.productId);
        const session = getSession();
        if (session && session.username === thread.sellerUsername && !thread.buyerUsername) {
            return renderSellerChat(product, [], "", [], "messages");
        }
        let messages = [];
        let error = "";
        try {
            messages = await api(`/chats/products/${encodeURIComponent(thread.productId)}/messages?buyerUsername=${encodeURIComponent(thread.buyerUsername || "")}`);
        } catch (requestError) {
            error = requestError.message;
        }
        if (session && session.username === thread.sellerUsername) {
            return renderSellerChat(product, [thread], thread.buyerUsername, messages, "messages", error);
        }
        return renderChatBox(product, messages, thread.buyerUsername, "messages", error);
    }

    async function renderPendingProductConversation(product) {
        const session = getSession();
        if (session && session.username === product.sellerUsername) {
            return renderSellerChat(product, [], "", [], "messages");
        }
        return renderChatBox(product, [], "", "messages");
    }

    function renderMessageBlank() {
        return `
            <div class="message-blank">
                <h2>选择一个会话</h2>
                <p>左侧会显示你参与过的商品聊天。</p>
            </div>
        `;
    }

    function renderThreadCard(thread, selected) {
        const isActive = selected && selected.productId === thread.productId && selected.buyerUsername === thread.buyerUsername;
        const session = getSession();
        const isSeller = session && session.username === thread.sellerUsername;
        const counterpart = isSeller ? thread.buyerUsername : thread.sellerUsername;
        const displayName = thread.counterpartUser?.displayName || (!isSeller ? thread.product?.sellerDisplayName : "") || counterpart || "同学";
        const avatar = thread.counterpartUser?.avatar || (!isSeller ? thread.product?.sellerAvatar : "") || "";
        return `
            <a class="thread-card ${isActive ? "is-active" : ""}" href="#/messages?productId=${encodeURIComponent(thread.productId)}&buyer=${encodeURIComponent(thread.buyerUsername || "")}">
                ${avatarHtml(avatar, displayName)}
                <div class="thread-main">
                    <strong>
                        <span>${escapeHtml(displayName || "同学")}</span>
                        <small>${escapeHtml(formatTimeAgo(thread.lastSentAt || thread.lastMessageAt))}</small>
                    </strong>
                    <p>${escapeHtml(thread.lastMessage || "暂无消息")}</p>
                    <em>${escapeHtml(thread.product ? thread.product.title : `商品 #${thread.productId}`)}</em>
                </div>
            </a>
        `;
    }

    function renderProductGrid(products) {
        return renderProductGridV2(products);
    }

    function renderProductCard(product, index = 0) {
        const firstImage = product.images[0] || "";
        return `
            <a class="product-card" href="#/product/${encodeURIComponent(product.id)}" style="animation-delay:${Math.min(index * 18, 140)}ms">
                <div class="product-media">
                    <span class="product-badge">${escapeHtml(getCategoryLabel(product.category))}</span>
                    ${firstImage ? `<img class="lazy-photo" src="${escapeAttr(firstImage)}" loading="lazy" decoding="async" alt="${escapeAttr(product.title)}">` : `<div class="product-placeholder">${escapeHtml(shortTitle(product.title, 4))}</div>`}
                </div>
                <div class="product-body">
                    <h3 class="product-title">${escapeHtml(product.title)}</h3>
                    <div class="price-line">
                        <div class="price"><small>¥</small>${escapeHtml(formatPrice(product.price))}</div>
                    </div>
                    <div class="meta">
                        <span>${escapeHtml(product.campus || "校内面交")}</span>
                        <span>${escapeHtml(formatTimeAgo(product.publishedAt || product.createdAt))}</span>
                    </div>
                    <div class="seller-row">
                        <span class="seller-mini">
                            ${avatarHtml(product.sellerAvatar, product.sellerDisplayName || product.sellerUsername)}
                            <span>${escapeHtml(product.sellerDisplayName || product.sellerUsername || "同学")}</span>
                        </span>
                    </div>
                </div>
            </a>
        `;
    }

    function renderProductGridV2(products, options = {}) {
        return products.map((product, index) => renderProductCardV2(product, index, options)).join("");
    }

    function renderProductCardV2(product, index = 0, options = {}) {
        const firstImage = product.images[0] || "";
        const isSold = product.status === "sold";
        const sellerHref = `#/user/${encodeURIComponent(product.sellerUsername || "")}`;
        return `
            <article class="product-card ${isSold ? "is-sold" : ""}" style="animation-delay:${Math.min(index * 18, 140)}ms">
                <a class="product-card-link" href="#/product/${encodeURIComponent(product.id)}">
                    <div class="product-media">
                        <span class="product-badge">${escapeHtml(getCategoryLabel(product.category))}</span>
                        ${isSold ? `<span class="sold-stamp">卖掉了</span>` : ""}
                        ${firstImage ? `<img class="lazy-photo" src="${escapeAttr(firstImage)}" loading="lazy" decoding="async" alt="${escapeAttr(product.title)}">` : `<div class="product-placeholder">${escapeHtml(shortTitle(product.title, 4))}</div>`}
                    </div>
                    <div class="product-body">
                        <h3 class="product-title">${escapeHtml(product.title)}</h3>
                        <div class="price-line">
                            <div class="price"><small>¥</small>${escapeHtml(formatPrice(product.price))}</div>
                        </div>
                        <div class="meta">
                            <span>${escapeHtml(product.campus || "校内面交")}</span>
                        </div>
                    </div>
                </a>
                <div class="seller-row">
                    <a class="seller-mini" href="${sellerHref}">
                        ${avatarHtml(product.sellerAvatar, product.sellerDisplayName || product.sellerUsername)}
                        <span>${escapeHtml(product.sellerDisplayName || product.sellerUsername || "同学")}</span>
                    </a>
                    ${options.showOwnerActions && !isSold ? `<button class="sold-action" type="button" data-mark-sold="${escapeAttr(product.id)}">设为已卖出</button>` : (isSold ? `<span>已卖出</span>` : "")}
                </div>
            </article>
        `;
    }

    function renderFilterRail(active, options = {}) {
        const campus = options.campus || appState.homeCampus || "all";
        return `
            <div class="filter-rail ${options.variant === "home" ? "home-filter-rail" : ""}" aria-label="分类筛选">
                ${options.variant === "home" ? renderCampusDropdown(campus, options) : ""}
                ${categories.map((category) => {
                    const href = options.search
                        ? buildSearchHash({ q: options.search, category: category.id, campus })
                        : `#/search?category=${encodeURIComponent(category.id)}`;
                    return `
                        <a class="filter-chip ${active === category.id ? "is-active" : ""}"
                           href="${href}"
                           data-filter="${escapeAttr(category.id)}">
                           ${escapeHtml(category.label)}
                        </a>
                    `;
                }).join("")}
            </div>
        `;
    }

    function renderCampusDropdown(active = "all", options = {}) {
        const current = active === "all" ? "全部校区" : active;
        return `
            <div class="campus-filter ${appState.campusMenuOpen ? "is-open" : ""}">
                <button class="campus-filter-button" type="button" data-campus-toggle aria-expanded="${appState.campusMenuOpen ? "true" : "false"}">
                    ${escapeHtml(current)}
                    <span aria-hidden="true">⌄</span>
                </button>
                <div class="campus-filter-menu">
                    ${["all", ...campusOptions].map((campus) => {
                        const label = campus === "all" ? "全部校区" : campus;
                        const href = options.search
                            ? buildSearchHash({ q: options.search, category: options.category || "all", campus })
                            : "#/";
                        return `
                            <a class="${active === campus ? "is-active" : ""}"
                               href="${href}"
                               data-campus-filter="${escapeAttr(campus)}">
                               ${escapeHtml(label)}
                            </a>
                        `;
                    }).join("")}
                </div>
            </div>
        `;
    }

    function buildSearchHash({ q = "", category = "all", campus = "all" } = {}) {
        const params = new URLSearchParams();
        if (q) params.set("q", q);
        if (category && category !== "all") params.set("category", category);
        if (campus && campus !== "all") params.set("campus", campus);
        const query = params.toString();
        return `#/search${query ? `?${query}` : ""}`;
    }

    function renderSellerCard(product) {
        const sellerHref = `#/user/${encodeURIComponent(product.sellerUsername || "")}`;
        return `
            <div class="seller-card">
                <div class="seller-card-head">
                    <a class="seller-avatar-link" href="${sellerHref}" aria-label="进入卖家主页">
                        ${avatarHtml(product.sellerAvatar, product.sellerDisplayName || product.sellerUsername)}
                    </a>
                    <a class="seller-name-link" href="${sellerHref}">
                        <strong>${escapeHtml(product.sellerDisplayName || product.sellerUsername || "同学")}</strong>
                        <span>${escapeHtml(product.campus || "校内")}</span>
                    </a>
                </div>
                <button class="seller-chat-action" type="button" data-start-chat="${escapeAttr(product.id)}">聊一聊</button>
            </div>
        `;
    }

    function renderSellerCardV2(product) {
        const sellerHref = `#/user/${encodeURIComponent(product.sellerUsername || "")}`;
        return `
            <div class="seller-card">
                <div class="seller-card-head">
                    <a class="seller-avatar-link" href="${sellerHref}" aria-label="进入卖家主页">
                        ${avatarHtml(product.sellerAvatar, product.sellerDisplayName || product.sellerUsername)}
                    </a>
                    <a class="seller-name-link" href="${sellerHref}">
                        <strong>${escapeHtml(product.sellerDisplayName || product.sellerUsername || "同学")}</strong>
                        <span>${escapeHtml(product.campus || "校内")}</span>
                    </a>
                </div>
                <button class="seller-chat-action" type="button" data-start-chat="${escapeAttr(product.id)}">聊一聊</button>
            </div>
        `;
    }

    function renderCommentCard(product, comments) {
        const session = getSession();
        return `
            <div class="comment-card" id="comments">
                <div class="card-title-row">
                    <h3>商品留言</h3>
                    <span class="comment-count">${comments.length} 条</span>
                </div>
                <div class="comment-list">
                    ${comments.length ? comments.map(renderCommentItem).join("") : `<p class="tip">还没有公开留言，可以先问问成色、配件或最低价。</p>`}
                </div>
                ${session ? `
                    <form class="comment-form" data-comment-form>
                        <input type="hidden" name="productId" value="${escapeAttr(product.id)}">
                        <textarea class="textarea" name="content" maxlength="500" required placeholder="给这个商品留一句公开留言，例如：可以在图书馆门口交易吗？"></textarea>
                        <p class="form-error" data-comment-error hidden></p>
                        <button class="primary-action" type="submit">发布留言</button>
                    </form>
                ` : `
                    <div class="comment-login-tip">
                        <span>登录后可以公开留言</span>
                        <button class="tiny-action" type="button" data-auth-trigger data-auth-next="/product/${encodeURIComponent(product.id)}">去登录</button>
                    </div>
                `}
            </div>
        `;
    }

    function renderCommentItem(comment) {
        return `
            <article class="comment-item">
                ${avatarHtml(comment.authorAvatar, comment.authorDisplayName || comment.authorUsername)}
                <div>
                    <div class="comment-meta">
                        <strong>${escapeHtml(comment.authorDisplayName || comment.authorUsername || "同学")}</strong>
                        <span>${escapeHtml(formatTimeAgo(comment.commentedAt || comment.createdAt))}</span>
                    </div>
                    <p>${escapeHtml(comment.content)}</p>
                </div>
            </article>
        `;
    }

    function renderAiShell(product) {
        return `
            <div class="ai-card">
                <div class="card-title-row">
                    <h3>AI 判断</h3>
                    <button class="tiny-action" type="button" data-ai-button="${escapeAttr(product.id)}">分析</button>
                </div>
                <p class="ai-summary">按图片、价格和描述给一个参考。</p>
            </div>
        `;
    }

    function renderAiAdvice(product, advice) {
        const normalized = normalizeAdvice(advice);
        return `
            <div class="ai-card">
                <div class="card-title-row">
                    <h3>AI 判断</h3>
                    <strong class="ai-verdict">${escapeHtml(normalized.verdict)}</strong>
                </div>
                <p class="ai-price-line">参考价 ¥${escapeHtml(formatPrice(normalized.suggestedPrice || product.price))}</p>
                <p class="ai-summary">${escapeHtml(normalized.summary)}</p>
                <div>
                    <strong>注意</strong>
                    <ul class="insight-list">${normalized.risks.slice(0, 2).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
                </div>
                <div>
                    <strong>可问</strong>
                    <ul class="insight-list">${normalized.questions.slice(0, 2).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
                </div>
            </div>
        `;
    }

    function renderThumbs(product) {
        if (!product.images.length) return "";
        return `
            <div class="thumb-row">
                ${product.images.map((image, index) => `
                    <button class="thumb ${index === 0 ? "is-active" : ""}" type="button" data-thumb="${escapeAttr(image)}" aria-label="查看第 ${index + 1} 张图">
                        <img src="${escapeAttr(image)}" loading="lazy" decoding="async" alt="">
                    </button>
                `).join("")}
            </div>
        `;
    }

    function renderEmpty(title, text, actionLabel, href) {
        return `
            <div class="empty-state">
                <h2>${escapeHtml(title)}</h2>
                <p>${escapeHtml(text)}</p>
                ${href ? `<a class="primary-action" href="${escapeAttr(href)}">${escapeHtml(actionLabel || "继续")}</a>` : ""}
            </div>
        `;
    }

    function renderAuthRequired(title, text, href) {
        window.setTimeout(() => {
            const next = href && href.includes("next=") ? href.split("next=")[1] : window.location.hash.slice(1) || "/";
            renderAuth({ query: { mode: "login", next: decodeURIComponent(next || "/") } });
        }, 0);
        return "";
    }

    function renderImagePreviews() {
        if (!appState.publishImages.length) {
            return "";
        }
        return appState.publishImages.map((image, index) => `
            <span class="preview-item">
                <img src="${escapeAttr(image)}" alt="待发布图片 ${index + 1}">
                <button type="button" data-remove-image="${index}" aria-label="移除第 ${index + 1} 张图片">×</button>
            </span>
        `).join("");
    }

    function dataModeNotice() {
        if (appState.dataMode !== "demo") return "";
        return `<p class="tip">当前为本地预览数据；启动后端后会自动切换真实商品、登录、发布、聊天和 AI。</p>`;
    }

    function quickLane(category, title, text, icon) {
        return `
            <a class="lane" href="#/search?category=${encodeURIComponent(category)}">
                <b>${escapeHtml(icon)}</b>
                <strong>${escapeHtml(title)}</strong>
                <span>${escapeHtml(text)}</span>
            </a>
        `;
    }

    async function listProducts({ q = "", limit = "" } = {}) {
        const params = new URLSearchParams();
        if (q) params.set("q", q);
        if (limit) params.set("limit", limit);
        const suffix = params.toString() ? `?${params.toString()}` : "";
        try {
            const data = await apiGet(`/products${suffix}`);
            appState.dataMode = "live";
            return data.map(normalizeProduct).filter((item) => item.status === "onsale");
        } catch (error) {
            appState.dataMode = "demo";
            appState.lastApiError = error.message;
            const query = q.trim().toLowerCase();
            let list = demoProducts.map(normalizeProduct);
            if (query) {
                list = list.filter((item) => `${item.title} ${item.desc} ${getCategoryLabel(item.category)}`.toLowerCase().includes(query));
            }
            return limit ? list.slice(0, Number(limit)) : list;
        }
    }

    async function getProduct(id) {
        if (isDemoId(id)) {
            const found = demoProducts.find((item) => item.id === id);
            if (found) return normalizeProduct(found);
        }
        const data = await apiGet(`/products/${encodeURIComponent(id)}`);
        return normalizeProduct(data);
    }

    async function getPublicUser(username) {
        const fallbackProducts = demoProducts.filter((item) => item.sellerUsername === username);
        if (fallbackProducts.length) {
            const first = fallbackProducts[0];
            return {
                username,
                displayName: first.sellerDisplayName || username,
                avatar: first.sellerAvatar || "",
                campus: first.campus || "校内面交",
                bio: "",
                createdAt: first.createdAt || Date.now()
            };
        }
        return apiGet(`/users/${encodeURIComponent(username)}`);
    }

    async function listSellerProducts(username, status = "onsale") {
        const params = new URLSearchParams();
        if (status) params.set("status", status);
        const suffix = params.toString() ? `?${params.toString()}` : "";
        try {
            const data = await apiGet(`/products/seller/${encodeURIComponent(username)}${suffix}`);
            return data.map(normalizeProduct);
        } catch (error) {
            const list = demoProducts
                .filter((item) => item.sellerUsername === username)
                .map(normalizeProduct);
            if (status === "all") return list;
            return list.filter((item) => item.status === status);
        }
    }

    async function listProductComments(productId) {
        if (isDemoId(productId)) {
            return readDemoComments(productId);
        }
        try {
            return await apiGet(`/products/${encodeURIComponent(productId)}/comments`);
        } catch (error) {
            return [];
        }
    }

    async function createProductComment(productId, content) {
        if (isDemoId(productId)) {
            const session = getSession();
            const comment = {
                id: `local-${Date.now()}`,
                productId,
                authorUsername: session.username,
                authorDisplayName: session.displayName || session.username,
                authorAvatar: session.avatar || "",
                content,
                createdAt: Date.now()
            };
            const comments = readDemoComments(productId);
            writeDemoComments(productId, [comment, ...comments]);
            return comment;
        }
        return api(`/products/${encodeURIComponent(productId)}/comments`, {
            method: "POST",
            body: JSON.stringify({ content })
        });
    }

    async function enrichThreads(threads, productHint = null, query = {}) {
        const session = getSession();
        const enriched = await Promise.all((threads || []).map(async (thread) => {
            let product = null;
            let counterpartUser = null;
            try {
                product = await getProduct(thread.productId);
            } catch (error) {
                product = null;
            }
            const counterpart = session && session.username === thread.sellerUsername ? thread.buyerUsername : thread.sellerUsername;
            if (counterpart) {
                try {
                    counterpartUser = await getPublicUser(counterpart);
                } catch (error) {
                    counterpartUser = null;
                }
            }
            return { ...thread, product, counterpartUser };
        }));
        if (!productHint || enriched.some((thread) => String(thread.productId) === String(productHint.id))) {
            return enriched;
        }
        return [
            {
                productId: productHint.id,
                buyerUsername: query.buyer || (session && session.username !== productHint.sellerUsername ? session.username : ""),
                sellerUsername: productHint.sellerUsername,
                lastMessage: "还没有消息",
                lastMessageAt: Date.now(),
                lastSentAt: Date.now(),
                product: productHint,
                counterpartUser: session && session.username !== productHint.sellerUsername ? {
                    username: productHint.sellerUsername,
                    displayName: productHint.sellerDisplayName,
                    avatar: productHint.sellerAvatar,
                    campus: productHint.campus
                } : null
            },
            ...enriched
        ];
    }

    async function getMessageProductHint(productId) {
        try {
            return await getProduct(productId);
        } catch (error) {
            return null;
        }
    }

    function selectThread(threads, query) {
        if (!threads.length) return null;
        if (!query.productId) return threads[0];
        const matched = threads.find((thread) =>
            String(thread.productId) === String(query.productId) &&
            (!query.buyer || String(thread.buyerUsername || "") === String(query.buyer || ""))
        );
        return matched || null;
    }

    function resolveMessageSenderName(message, context = {}) {
        const session = getSession();
        if (session && message.senderUsername === session.username) {
            return session.displayName || session.username;
        }
        if (context.product && message.senderUsername === context.product.sellerUsername) {
            return context.product.sellerDisplayName || context.product.sellerUsername;
        }
        return message.senderDisplayName || message.senderUsername || "同学";
    }

    function resolveMessageSenderAvatar(message, context = {}) {
        const session = getSession();
        if (session && message.senderUsername === session.username) {
            return session.avatar || "";
        }
        if (context.product && message.senderUsername === context.product.sellerUsername) {
            return context.product.sellerAvatar || "";
        }
        return message.senderAvatar || "";
    }

    async function apiGet(path) {
        const cached = apiCache.get(path);
        if (cached && Date.now() - cached.time < CACHE_TTL) {
            return cached.data;
        }
        const data = await api(path);
        apiCache.set(path, { time: Date.now(), data });
        return data;
    }

    async function api(path, options = {}) {
        const method = (options.method || "GET").toUpperCase();
        const headers = { ...(options.headers || {}) };
        const hasBody = options.body != null;
        if (hasBody && !headers["Content-Type"]) {
            headers["Content-Type"] = "application/json";
        }

        const session = getSession();
        if (session && session.token) {
            headers.Authorization = `Bearer ${session.token}`;
        }

        let response;
        try {
            response = await fetch(`${API_BASE}${path}`, { ...options, method, headers });
        } catch (error) {
            throw new Error("无法连接后端，请确认 campus-second-hand-api 已启动，或把 js/config.js 改成服务器 API 地址。");
        }

        if (method !== "GET") {
            apiCache.clear();
        }

        if (response.status === 204) return null;
        const text = await response.text();
        let payload = null;
        if (text) {
            try {
                payload = JSON.parse(text);
            } catch (error) {
                payload = { message: text };
            }
        }
        if (!response.ok) {
            const message = payload && (payload.message || payload.error || payload.detail);
            throw new Error(message || `请求失败：HTTP ${response.status}`);
        }
        return payload;
    }

    function getSession() {
        try {
            const raw = localStorage.getItem(SESSION_KEY);
            if (!raw) return null;
            const session = JSON.parse(raw);
            if (!session || !session.token) return null;
            if (session.expiresAt && Number(session.expiresAt) < Date.now()) {
                clearSession();
                return null;
            }
            return session;
        } catch (error) {
            return null;
        }
    }

    function setSession(auth) {
        const user = auth.user || auth;
        const session = {
            token: auth.token,
            expiresAt: auth.expiresAt,
            username: user.username,
            displayName: user.displayName || "",
            avatar: user.avatar || "",
            campus: user.campus || "",
            contact: user.contact || "",
            bio: user.bio || "",
            loginAt: Date.now()
        };
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        return session;
    }

    function clearSession() {
        localStorage.removeItem(SESSION_KEY);
    }

    async function syncCurrentUser() {
        if (!getSession()) return;
        try {
            const user = await api("/auth/me");
            const old = getSession();
            if (!old) return;
            setSession({ token: old.token, expiresAt: old.expiresAt, user });
            renderAuthChip();
        } catch (error) {
            clearSession();
            renderAuthChip();
        }
    }

    async function logoutUser() {
        try {
            if (getSession()) {
                await api("/auth/logout", { method: "POST" });
            }
        } catch (error) {
            // Local cleanup still wins when the server token already expired.
        }
        clearSession();
        renderAuthChip();
        showToast("已退出登录");
        window.location.hash = "#/";
    }

    function renderAuthChip() {
        const slot = document.querySelector("[data-auth-chip]");
        if (!slot) return;
        const session = getSession();
        if (!session) {
            slot.innerHTML = `<button class="login-pill" type="button" data-auth-trigger data-auth-next="${escapeAttr(window.location.hash.slice(1) || "/")}">登录</button>`;
            return;
        }
        const stats = appState.profileMenuStats || { onsale: 0, sold: 0, total: 0, messages: 0 };
        slot.innerHTML = `
            <div class="profile-menu-wrap">
                <a class="profile-avatar-link" href="#/mine" title="个人中心" aria-label="个人中心">
                    ${avatarHtml(session.avatar, session.displayName || session.username)}
                </a>
                <div class="profile-hover-card" role="menu">
                    <div class="profile-hover-head">
                        <div>
                            <strong>${escapeHtml(session.displayName || session.username)}</strong>
                            <span>@${escapeHtml(session.username || "")}</span>
                        </div>
                    </div>
                    <div class="profile-hover-stats">
                        <a href="#/mine?status=onsale"><strong>${escapeHtml(stats.onsale)}</strong>在售</a>
                        <a href="#/mine?status=sold"><strong>${escapeHtml(stats.sold)}</strong>已卖出</a>
                        <a href="#/mine?status=all"><strong>${escapeHtml(stats.total)}</strong>全部</a>
                        <a href="#/messages"><strong>${escapeHtml(stats.messages)}</strong>消息</a>
                    </div>
                    <div class="profile-hover-links">
                        <a href="#/messages">消息</a>
                        <a href="#/mine">个人中心</a>
                        ${session.username === "czq" ? `<a href="#/admin">管理员页面</a>` : ""}
                        <button type="button" data-logout>退出登录</button>
                    </div>
                </div>
            </div>
        `;
        loadProfileMenuStats(session);
    }

    async function loadProfileMenuStats(session) {
        if (!session || appState.profileMenuStatsLoading) return;
        const currentKey = `${session.username}:${session.loginAt || ""}`;
        if (appState.profileMenuStatsKey === currentKey) return;
        appState.profileMenuStatsLoading = true;
        try {
            const [products, threads] = await Promise.all([
                listSellerProducts(session.username, "all"),
                api("/chats").catch(() => [])
            ]);
            const normalized = (products || []).map(normalizeProduct);
            appState.profileMenuStats = {
                onsale: normalized.filter((product) => product.status === "onsale").length,
                sold: normalized.filter((product) => product.status === "sold").length,
                total: normalized.length,
                messages: Array.isArray(threads) ? threads.length : 0
            };
            appState.profileMenuStatsKey = currentKey;
            appState.profileMenuStatsLoading = false;
            renderAuthChip();
        } catch (error) {
            appState.profileMenuStatsLoading = false;
        }
    }

    function setSearchValue(value) {
        const input = document.querySelector("#globalSearch");
        if (input && document.activeElement !== input) {
            input.value = value || "";
        }
    }

    function startSearchHintRotator() {
        const input = document.querySelector("#globalSearch");
        if (!input || input.dataset.hintRotator === "on") return;
        input.dataset.hintRotator = "on";
        input.placeholder = searchHints[searchHintIndex];
        window.setInterval(() => {
            if (document.activeElement === input || input.value.trim()) return;
            searchHintIndex = (searchHintIndex + 1) % searchHints.length;
            input.placeholder = searchHints[searchHintIndex];
        }, 3200);
    }

    function setTopbarState() {
        const topbar = document.querySelector("[data-topbar]");
        const sideRail = document.querySelector(".side-rail");
        if (topbar) {
            topbar.classList.toggle("is-scrolled", window.scrollY > 12);
        }
        if (sideRail) {
            sideRail.classList.toggle("show-back-top", window.scrollY > 520);
        }
    }

    function updateHomeGrid() {
        const rail = document.querySelector(".home-filter-rail");
        if (rail) {
            rail.outerHTML = renderFilterRail(appState.homeFilter, { campus: appState.homeCampus, variant: "home" });
            const nextRail = document.querySelector(".home-filter-rail");
            if (nextRail) nextRail.style.overflow = "visible";
        }
        document.querySelectorAll("[data-filter]").forEach((chip) => {
            chip.classList.toggle("is-active", chip.getAttribute("data-filter") === appState.homeFilter);
        });
        const grid = document.querySelector("[data-home-grid]");
        if (grid) {
            const filtered = filterProducts(appState.homeProducts, appState.homeFilter, appState.homeCampus);
            grid.innerHTML = filtered.length ? renderProductGrid(filtered) : renderEmpty("这个分类还空着", "可以抢先发布一件相关闲置。", "发布闲置", "#/publish");
        }
    }

    function switchGalleryImage(thumb) {
        const main = document.querySelector("[data-gallery-main]");
        if (!main) return;
        const src = thumb.getAttribute("data-thumb");
        main.innerHTML = `<img src="${escapeAttr(src)}" decoding="async" alt="">`;
        document.querySelectorAll("[data-thumb]").forEach((item) => item.classList.toggle("is-active", item === thumb));
    }

    function handleImageLoad(event) {
        const image = event.target;
        if (!(image instanceof HTMLImageElement)) return;
        image.classList.add("is-loaded");
        const media = image.closest(".product-media, .gallery-main, .thumb, .preview-item");
        if (media) {
            media.classList.add("is-loaded");
        }
    }

    function markLoadedImages() {
        document.querySelectorAll("img").forEach((image) => {
            if (image.complete) {
                handleImageLoad({ target: image });
            }
        });
    }

    async function addImages(fileList) {
        const files = Array.from(fileList || []).filter((file) => file.type.startsWith("image/"));
        if (!files.length) return;
        const slots = Math.max(0, 6 - appState.publishImages.length);
        if (!slots) {
            showToast("最多上传 6 张图片", "error");
            return;
        }
        try {
            const selected = files.slice(0, slots);
            const compressed = await Promise.all(selected.map((file) => compressImage(file, { maxSize: 1280, quality: 0.82 })));
            appState.publishImages.push(...compressed);
            refreshImagePreviews();
            showToast(`已添加 ${compressed.length} 张图片`);
        } catch (error) {
            showToast(error.message, "error");
        }
    }

    function refreshImagePreviews() {
        const grid = document.querySelector("[data-preview-grid]");
        if (grid) {
            grid.innerHTML = renderImagePreviews();
        }
    }

    function updateDescriptionCount(input = document.querySelector("#publishDesc")) {
        const counter = document.querySelector("[data-desc-count]");
        if (!input || !counter) return;
        const max = Number(input.getAttribute("maxlength") || 1500);
        counter.textContent = `${input.value.length}/${max}`;
    }

    function compressImage(file, { maxSize = 1280, quality = 0.82 } = {}) {
        return new Promise((resolve, reject) => {
            if (!file.type.startsWith("image/")) {
                reject(new Error("请选择图片文件"));
                return;
            }
            const reader = new FileReader();
            reader.onerror = () => reject(new Error("读取图片失败"));
            reader.onload = () => {
                const image = new Image();
                image.onerror = () => reject(new Error("图片格式无法识别"));
                image.onload = () => {
                    const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
                    const width = Math.max(1, Math.round(image.width * scale));
                    const height = Math.max(1, Math.round(image.height * scale));
                    const canvas = document.createElement("canvas");
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext("2d", { alpha: false });
                    ctx.drawImage(image, 0, 0, width, height);
                    resolve(canvas.toDataURL("image/jpeg", quality));
                };
                image.src = reader.result;
            };
            reader.readAsDataURL(file);
        });
    }

    function localAdvice(product, provider) {
        let score = 72;
        const text = `${product.title} ${product.desc}`.toLowerCase();
        const highlights = [];
        const risks = [];

        if (product.images.length) {
            score += 8;
            highlights.push("有实拍图片，比纯文字商品更容易初步判断成色。");
        } else {
            score -= 12;
            risks.push("没有实拍图片，建议让卖家补充正面、细节、瑕疵和配件图。");
        }

        if (/九成|95|几乎全新|很新|自用/.test(text)) {
            score += 6;
            highlights.push("描述里提到成色较新，可以重点核对图片与实际磨损是否一致。");
        }

        if (/瑕疵|维修|进水|坏|裂|缺/.test(text)) {
            score -= 16;
            risks.push("描述中出现瑕疵或维修相关信息，建议当面验货并压低预算。");
        }

        if (Number(product.price) > 1000) {
            score -= 8;
            risks.push("价格较高，建议要求购买凭证、序列号或现场功能测试。");
        }

        if ((product.desc || "").length < 26) {
            score -= 6;
            risks.push("商品描述偏短，关键交易信息还不够完整。");
        }

        score = Math.max(38, Math.min(92, score));
        const factor = score >= 82 ? 0.92 : score >= 68 ? 0.82 : 0.7;
        return {
            score,
            verdict: score >= 82 ? "比较值得看" : score >= 68 ? "可以聊聊再决定" : "建议谨慎",
            suggestedPrice: Math.round(Number(product.price || 0) * factor * 100) / 100,
            summary: "根据价格、图片、描述完整度和常见风险词做了初步判断。真实上服务器后，可在后端接入多模态 AI，让模型读取图片细节后给出更准确建议。",
            highlights: highlights.length ? highlights : ["商品信息具备基础判断条件，可以先和卖家沟通细节。"],
            risks: risks.length ? risks : ["暂未发现明显风险，但二手交易仍建议当面验货。"],
            questions: [
                "购买时间、原价、是否有发票或保修？",
                "是否支持当面验货，确认功能正常后再付款？",
                "最低可接受价格是多少，是否包含配件？"
            ],
            provider
        };
    }

    function normalizeAdvice(advice) {
        return {
            score: Number(advice.score || 70),
            verdict: advice.verdict || "可以聊聊再决定",
            suggestedPrice: advice.suggestedPrice || 0,
            summary: advice.summary || "AI 已完成基础判断。",
            highlights: Array.isArray(advice.highlights) && advice.highlights.length ? advice.highlights : ["信息完整度尚可。"],
            risks: Array.isArray(advice.risks) && advice.risks.length ? advice.risks : ["二手交易建议当面验货。"],
            questions: Array.isArray(advice.questions) && advice.questions.length ? advice.questions : ["是否支持当面验货？"],
            provider: advice.provider || "backend"
        };
    }

    function normalizeDescription(response = {}, payload = {}) {
        const raw = typeof response.description === "object" && response.description
            ? response.description.text
            : response.description;
        const description = String(raw || "").trim();
        return description
            ? { description: description.slice(0, 1500), provider: response.provider || "backend" }
            : localDescription(payload, response.provider || "frontend-fallback");
    }

    function localDescription(payload, provider = "frontend-fallback") {
        const category = getCategoryLabel(payload.category || "other");
        const title = payload.title || "这件闲置";
        const lines = [];
        if (payload.desc) {
            lines.push(payload.desc);
        } else {
            lines.push(`${title}，适合同校同学日常使用。`);
        }

        if (payload.images && payload.images.length) {
            lines.push(`已上传 ${payload.images.length} 张实拍图，建议以图片里的成色为准。`);
        } else {
            lines.push("后续可以补充整体、细节和瑕疵图，方便买家判断。");
        }

        lines.push(`类别：${category}。`);
        if (payload.price) lines.push(`价格暂定 ¥${formatPrice(payload.price)}，可礼貌沟通。`);
        if (payload.campus) lines.push(`所在校区：${payload.campus}，优先校内当面确认。`);
        lines.push("有意可以直接站内消息联系，确认成色、配件和取货时间。");

        return {
            description: lines.join("\n"),
            provider
        };
    }

    function normalizeProduct(product) {
        return {
            id: String(product.id),
            title: product.title || "未命名闲置",
            price: Number(product.price || 0),
            category: product.category || "other",
            desc: product.desc || "",
            images: Array.isArray(product.images) ? product.images.filter(Boolean) : [],
            contact: product.contact || "",
            sellerUsername: product.sellerUsername || "",
            sellerDisplayName: product.sellerDisplayName || product.sellerUsername || "校园同学",
            sellerAvatar: product.sellerAvatar || "",
            campus: product.campus || "校内面交",
            createdAt: Number(product.publishedAt || product.createdAt || Date.now()),
            status: product.status || "onsale"
        };
    }

    function readDemoComments(productId) {
        const key = `campus_demo_comments_${productId}`;
        try {
            const stored = JSON.parse(localStorage.getItem(key) || "[]");
            if (Array.isArray(stored) && stored.length) return stored;
        } catch (error) {
            // Ignore broken local preview comments.
        }
        return [
            {
                id: `seed-${productId}-1`,
                productId,
                authorUsername: "summer",
                authorDisplayName: "夏天",
                authorAvatar: "",
                content: "这个还在吗？可以校内当面看一下吗？",
                createdAt: Date.now() - 1000 * 60 * 36
            },
            {
                id: `seed-${productId}-2`,
                productId,
                authorUsername: "momo",
                authorDisplayName: "默默",
                authorAvatar: "",
                content: "支持小刀吗，配件都还在的话我挺感兴趣。",
                createdAt: Date.now() - 1000 * 60 * 95
            }
        ];
    }

    function writeDemoComments(productId, comments) {
        localStorage.setItem(`campus_demo_comments_${productId}`, JSON.stringify(comments.slice(0, 30)));
    }

    function filterProducts(products, category, campus = "all") {
        return products.filter((item) => {
            const categoryMatch = !category || category === "all" || item.category === category;
            const campusMatch = !campus || campus === "all" || item.campus === campus;
            return categoryMatch && campusMatch;
        });
    }

    function getCategoryLabel(id) {
        return (categories.find((item) => item.id === id) || categories[categories.length - 1]).label;
    }

    function avatarHtml(src, name) {
        if (src) {
            return `<img class="avatar" src="${escapeAttr(src)}" alt="">`;
        }
        return `
            <span class="avatar-fallback" aria-hidden="true">
                <svg viewBox="0 0 24 24" focusable="false">
                    <circle cx="12" cy="8.5" r="4"></circle>
                    <path d="M4.8 20c1.2-4.2 4-6.3 7.2-6.3s6 2.1 7.2 6.3"></path>
                </svg>
            </span>
        `;
    }

    function isDemoId(id) {
        return String(id).startsWith("demo-");
    }

    function shortTitle(value, size) {
        return Array.from(String(value || "闲置")).slice(0, size).join("");
    }

    function formatPrice(value) {
        const number = Number(value);
        if (!Number.isFinite(number)) return String(value || 0);
        return new Intl.NumberFormat("zh-CN", { maximumFractionDigits: 2 }).format(number);
    }

    function formatTime(ms) {
        if (!ms) return "";
        return new Date(Number(ms)).toLocaleString("zh-CN", {
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
        });
    }

    function formatTimeAgo(ms) {
        const time = Number(ms || Date.now());
        const diff = Math.max(0, Date.now() - time);
        const minute = 60 * 1000;
        const hour = 60 * minute;
        const day = 24 * hour;
        if (diff < minute) return "刚刚";
        if (diff < hour) return `${Math.floor(diff / minute)} 分钟前`;
        if (diff < day) return `${Math.floor(diff / hour)} 小时前`;
        if (diff < day * 7) return `${Math.floor(diff / day)} 天前`;
        return new Date(time).toLocaleDateString("zh-CN");
    }

    function setBusy(button, busy) {
        if (!button) return;
        if (busy) {
            button.dataset.label = button.textContent;
            button.textContent = "处理中...";
            button.disabled = true;
        } else {
            button.textContent = button.dataset.label || button.textContent;
            button.disabled = false;
        }
    }

    function showToast(message, type = "info") {
        const stack = document.querySelector("[data-toasts]");
        if (!stack) return;
        const toast = document.createElement("div");
        toast.className = `toast ${type === "error" ? "is-error" : ""}`;
        toast.textContent = message;
        stack.appendChild(toast);
        window.setTimeout(() => {
            toast.style.opacity = "0";
            toast.style.transform = "translateY(10px)";
            window.setTimeout(() => toast.remove(), 220);
        }, 3200);
    }

    function escapeHtml(value) {
        const div = document.createElement("div");
        div.textContent = value == null ? "" : String(value);
        return div.innerHTML;
    }

    function escapeAttr(value) {
        return escapeHtml(value).replace(/"/g, "&quot;");
    }

    function registerServiceWorker() {
        if (!("serviceWorker" in navigator)) return;
        if (window.location.protocol === "file:") return;
        navigator.serviceWorker.register("./sw.js").catch(() => {
            // The app still works without offline caching.
        });
    }
})();
