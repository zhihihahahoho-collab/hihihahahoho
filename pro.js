// ===== CONNECTION STRING CACHE =====
let cachedConnectionString = null;

function getConnectionString() {
    if (cachedConnectionString) return cachedConnectionString;

    const cs = localStorage.getItem("connectionString");
    if (!cs || cs.trim() === "") return null;

    cachedConnectionString = cs;
    return cs;
}

function requireLogin() {
    const cs = getConnectionString();
    if (!cs) {
        alert("Chưa đăng nhập hoặc mất phiên đăng nhập!");
        window.location.href = "index.html";
        return false;
    }
    return true;
}


// ===== LOAD ALL PRODUCTS =====
function loadAllProducts() {
    if (!requireLogin()) return;

    fetch(`${API_BASE}/products`, {
        headers: {
            "Connection-String": getConnectionString(),
            // THÊM DÒNG NÀY ĐỂ SỬA LỖI NGROK
            "ngrok-skip-browser-warning": "true" 
        }
    })
    .then(res => {
        // Nếu res trả về HTML thay vì JSON, dòng này sẽ giúp debug dễ hơn
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") === -1) {
            throw new Error("Server trả về HTML thay vì JSON (Lỗi Ngrok)");
        }
        if (!res.ok) throw new Error("Không load được sản phẩm");
        return res.json();
    })
    .then(renderProducts)
    .catch(err => alert(err.message));
}


// ===== LOAD / SEARCH PRODUCTS =====
function loadProducts() {
    if (!requireLogin()) return;

    const keyword  = document.getElementById("searchInput")?.value.trim();

    // LẤY GIÁ TRỊ TEXT → PARSE SANG NUMBER
    const minPriceRaw = document.getElementById("minPrice")?.value.trim();
    const maxPriceRaw = document.getElementById("maxPrice")?.value.trim();

    const minPrice = minPriceRaw ? Number(minPriceRaw) : null;
    const maxPrice = maxPriceRaw ? Number(maxPriceRaw) : null;

    const sort = document.getElementById("sortSelect")?.value;

    // ===== VALIDATE GIÁ =====
    if (minPrice !== null) {
        if (isNaN(minPrice) || minPrice <= 0) {
            alert("Giá tối thiểu phải là số > 0");
            return;
        }
    }

    if (maxPrice !== null) {
        if (isNaN(maxPrice) || maxPrice <= 0) {
            alert("Giá tối đa phải là số > 0");
            return;
        }
    }

    if (minPrice !== null && maxPrice !== null) {
        if (maxPrice <= minPrice) {
            alert("Giá tối đa phải lớn hơn giá tối thiểu");
            return;
        }
    }
    // ===== BUILD QUERY =====
    const params = new URLSearchParams();
    if (keyword)  params.append("keyword", keyword);
    if (minPrice !== null) params.append("minPrice", minPrice);
    if (maxPrice !== null) params.append("maxPrice", maxPrice);
    if (sort)     params.append("sort", sort);

    fetch(`${API_BASE}/products/search?${params}`, {
        headers: {
            "Connection-String": getConnectionString(),
            "ngrok-skip-browser-warning": "true"
        }
    })
    .then(res => {
        if (!res.ok) throw new Error("Không load được sản phẩm");
        return res.json();
    })
    .then(renderProducts)
    .catch(err => alert(err.message));
}



// ===== RENDER PRODUCTS =====
function renderProducts(data) {
    const list = document.getElementById("productList");
    list.innerHTML = "";

    if (!Array.isArray(data) || data.length === 0) {
        list.innerHTML = `<p style="color:#9ca3af">Không có sản phẩm phù hợp</p>`;
        return;
    }

    data.forEach(p => {
        let imageUrl = p.imageUrl;

        // nếu DB trả về path tương đối
        if (!imageUrl.startsWith("http")) {
            imageUrl = IMAGE_BASE + imageUrl;
        }

        const card = document.createElement("div");
        card.className = "product-card";
        card.innerHTML = `
            <a href="product-detail.html?id=${p.productId}">
                <img 
                    src="${imageUrl}"
                    alt="${p.productName}"
                    onerror="this.src='${IMAGE_BASE}/images/no-image.jpg'"
                >
                <h3>${p.productName}</h3>
                <p>${Number(p.price).toLocaleString()} đ</p>
            </a>
        `;
        list.appendChild(card);
    });
}





// ===== DATABASE SPACE (FOOTER) =====
function loadDbSpace() {
    if (!requireLogin()) return;

    fetch(`${API_BASE}/admin/database-space`, {
        headers: {
            "Connection-String": getConnectionString(),
            // THÊM DÒNG NÀY ĐỂ SỬA LỖI NGROK
            "ngrok-skip-browser-warning": "true"
        }
    })
    .then(res => {
        if (!res.ok) throw new Error("Không lấy được dung lượng DB");
        return res.json();
    })
    .then(data => {
        document.getElementById("dbSpace").innerHTML =
            `<p>${data.database_name} – ${data.database_size}</p>`;
    })
    .catch(err => console.error(err.message));
}


// ===== LOAD LẦN ĐẦU =====
loadAllProducts();