

document.addEventListener("DOMContentLoaded", () => {

    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) {
        alert("Chưa đăng nhập");
        window.location.href = "index.html";
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const productId = params.get("id");

    if (!productId) {
        alert("Thiếu ProductId");
        return;
    }

    const connStr = localStorage.getItem("connectionString");
    if (!connStr) {
        alert("Mất Connection-String");
        window.location.href = "index.html";
        return;
    }

        fetch(`${API_BASE}/products/${productId}`, {
        headers: {
            "Connection-String": connStr,
            "ngrok-skip-browser-warning": "true"
        }
    })
    .then(res => {
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            throw new Error("Server trả về HTML (Ngrok warning)");
        }
        if (!res.ok) throw new Error("Không load được chi tiết");
        return res.json();
    })
    .then(renderDetail)
    .catch(err => {
        console.error(err);
        alert(err.message);
    });

});


/* ===== RENDER ===== */
function renderDetail(p) {
    document.getElementById("productName").innerText = p.productName;
    document.getElementById("price").innerText =
        Number(p.price).toLocaleString() + " đ";
    document.getElementById("category").innerText = p.categoryName ?? "";
    document.getElementById("stock").innerText = "Tồn kho: " + p.stock;

    const mainImage = document.getElementById("mainImage");
    const thumbList = document.getElementById("thumbnailList");
    thumbList.innerHTML = "";

    if (!p.images || p.images.length === 0) {
        mainImage.src = IMAGE_BASE + "/images/no-image.jpg";
        return;
    }

    // MAIN IMAGE
    let mainSrc = p.images[0];
    if (!mainSrc.startsWith("http")) {
        mainSrc = IMAGE_BASE + mainSrc;
    }
    mainImage.src = mainSrc;

    // THUMBNAILS
    p.images.forEach(img => {
        let src = img;
        if (!src.startsWith("http")) {
            src = IMAGE_BASE + src;
        }

        const thumb = document.createElement("img");
        thumb.src = src;
        thumb.onclick = () => {
            mainImage.src = src;
        };
        thumbList.appendChild(thumb);
    });
}



