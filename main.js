document.addEventListener("DOMContentLoaded", () => {

    const card = document.querySelector(".card");

    window.toggleView = function () {
        card.classList.toggle("login");
    };

    /* ================= REGISTER ================= */
    document.getElementById("registerForm").addEventListener("submit", async (e) => {
        e.preventDefault();

        const data = {
            username: document.getElementById("regUsername").value,
            email: document.getElementById("regEmail").value,
            phoneNumber: document.getElementById("regPhone").value,
            password: document.getElementById("regPassword").value
        };

        try {
            const res = await fetch(`${API_BASE}/users/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            if (!res.ok) {
                alert(await res.text());
                return;
            }

            alert("Đăng ký thành công");
            toggleView();
        } catch (err) {
            console.error(err);
            alert("Không kết nối được backend");
        }
    });

    /* ================= LOGIN ================= */
    document.getElementById("loginForm").addEventListener("submit", async (e) => {
        e.preventDefault();

        const account = document.getElementById("loginAccount").value;
        const password = document.getElementById("loginPassword").value;

        try {
            const res = await fetch(`${API_BASE}/users/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ account, password })
            });

            if (!res.ok) {
                alert(await res.text());
                return;
            }

            const user = await res.json();

            // 🔴 LƯU CONNECTION STRING (backend của bạn cần)
            const connStr =
                `Server=localhost,1433;Database=QLBH;User Id=${account};Password=${password};TrustServerCertificate=True;`;

            localStorage.setItem("connectionString", connStr);
            localStorage.setItem("currentUser", user.username ?? account);

            alert("Đăng nhập thành công");
            window.location.href = "products.html";
        } catch (err) {
            console.error(err);
            alert("Không kết nối được backend");
        }
    });
});
