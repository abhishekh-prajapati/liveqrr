

    // Save user data
    function saveUser(name, mobile) {
    localStorage.setItem(
        "qrifyUser",
        JSON.stringify({ name: name.trim(), mobile: mobile.trim() })
    );
    }

    // Form submit
    const form = document.getElementById("userForm");

    if (form) {
    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const name = document.getElementById("username").value;
        const mobile = document.getElementById("mobile").value;

        if (!name || !mobile) return;

        saveUser(name, mobile);

        // ✅ CORRECT redirect (same folder)
        window.location.href = "home.html";
    });
    }

    // adding username to the home
    function getUser() {
    const data = localStorage.getItem("qrifyUser");
    return data ? JSON.parse(data) : null;
    }

    const user = getUser();

    if (user && user.name) {
    const el = document.getElementById("welcomeUser");
    if (el) {
        el.textContent = `Hi, ${user.name}`;
    }
    }
