const API_BASE_URL = "http://34.232.218.47";

document.addEventListener("DOMContentLoaded", function () {
    if (document.getElementById("loginForm")) {
        document.getElementById("loginForm").addEventListener("submit", authenticateUser);
    }
    if (document.getElementById("registerForm")) {
        document.getElementById("registerForm").addEventListener("submit", registerUser);
    }
    if (document.getElementById("recommended-items")) {
        loadRecommendedItems();
    }
    if (document.getElementById("admin-menu-list")) {
        loadMenuForAdmin();
        document.getElementById("addItemForm").addEventListener("submit", addMenuItem);
    }
    if (document.getElementById("user-menu-list")) {
        loadMenuForUser();
    }
});

// 🟢 REGISTER NEW USER
function registerUser(event) {
    event.preventDefault();
    const username = document.getElementById("regUsername").value;
    const password = document.getElementById("regPassword").value;
    const role = document.getElementById("regRole").value;

    fetch(`${API_BASE_URL}/auth/register`, { // ✅ Updated URL
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            alert("User registered successfully! You can now log in.");
            window.location.href = "login.html";
        } else {
            document.getElementById("registerError").textContent = data.error;
        }
    })
    .catch(error => console.error("Error:", error));
}

// 🟢 LOGIN USER
function authenticateUser(event) {
    event.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    fetch(`${API_BASE_URL}/auth/login`, { // ✅ Updated URL
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.token) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("role", data.role);
            if (data.role === "admin") {
                window.location.href = "admin_dashboard.html";
            } else {
                window.location.href = "user_dashboard.html";
            }
        } else {
            document.getElementById("loginError").textContent = "Invalid credentials!";
        }
    })
    .catch(error => console.error("Error:", error));
}

// 🟢 LOGOUT USER
function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "index.html";
}

// 🟢 FETCH RECOMMENDED MENU ITEMS (Homepage)
function loadRecommendedItems() {
    fetch(`${API_BASE_URL}/menu/recommendations`) // ✅ Updated URL
    .then(response => response.json())
    .then(data => {
        const recommendationList = document.getElementById("recommended-items");
        recommendationList.innerHTML = "";

        if (data.popular_dishes.length === 0) {
            recommendationList.innerHTML = "<p>No recommendations available.</p>";
            return;
        }

        data.popular_dishes.forEach(dish => {
            let li = document.createElement("li");
            li.innerHTML = `<strong>${dish[0]}</strong> - Ordered ${dish[1]} times 🍽️`;
            recommendationList.appendChild(li);
        });
    })
    .catch(error => {
        console.error("Error fetching recommendations:", error);
        document.getElementById("recommended-items").innerHTML = "<p>Unable to load recommendations.</p>";
    });
}

// 🟢 LOAD MENU FOR ADMIN
function loadMenuForAdmin() {
    fetch(`${API_BASE_URL}/menu/items`) // ✅ Updated URL
    .then(response => response.json())
    .then(data => {
        const menuList = document.getElementById("admin-menu-list");
        menuList.innerHTML = "";
        data.forEach(item => {
            let li = document.createElement("li");
            li.innerHTML = `${item.name} - $${item.price} 
            <button onclick="deleteMenuItem(${item.id})">Delete</button>`;
            menuList.appendChild(li);
        });
    });
}

// 🟢 ADD MENU ITEM (ADMIN ONLY)
function addMenuItem(event) {
    event.preventDefault();
    const name = document.getElementById("itemName").value;
    const price = document.getElementById("itemPrice").value;
    const category = document.getElementById("itemCategory").value;
    const token = localStorage.getItem("token");

    fetch(`${API_BASE_URL}/menu/add`, { // ✅ Updated URL
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name, price, category })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            alert("Item added successfully!");
            loadMenuForAdmin();
        } else {
            alert("Failed to add item.");
        }
    })
    .catch(error => console.error("Error:", error));
}

// 🟢 DELETE MENU ITEM (ADMIN ONLY)
function deleteMenuItem(itemId) {
    const token = localStorage.getItem("token");

    fetch(`${API_BASE_URL}/menu/delete/${itemId}`, { // ✅ Updated URL
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
    })
    .then(response => response.json())
    .then(() => {
        alert("Item deleted!");
        loadMenuForAdmin();
    })
    .catch(error => console.error("Error:", error));
}

// 🟢 LOAD MENU FOR USERS (TO PLACE ORDERS)
function loadMenuForUser() {
    fetch(`${API_BASE_URL}/menu/items`)
    .then(response => response.json())
    .then(data => {
        const menuList = document.getElementById("user-menu-list");
        menuList.innerHTML = "";
        data.forEach(item => {
            let li = document.createElement("li");
            li.innerHTML = `
                ${item.name} - $${item.price} 
                <input type="number" id="quantity-${item.id}" value="1" min="1" style="width: 50px;"> 
                <button onclick="placeOrder(${item.id})">Order</button>
            `;
            menuList.appendChild(li);
        });
    });
}

// 🟢 PLACE ORDER (USER ONLY)
function placeOrder(itemId) {
    const token = localStorage.getItem("token");
    const quantity = document.getElementById(`quantity-${itemId}`).value || 1;  // Get quantity input

    fetch(`${API_BASE_URL}/menu/order/${itemId}`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ quantity: parseInt(quantity) })  // Ensure integer value
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
    })
    .catch(error => console.error("Error:", error));
}
