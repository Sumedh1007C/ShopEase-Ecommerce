const productsEl = document.querySelector("#products");
const search = document.querySelector("#search");

// 

const modalImg = document.querySelector("#modalImg");
const modalTitle = document.querySelector("#modalTitle");
const modalPrice = document.querySelector("#modalPrice");
const modalDesc = document.querySelector("#modalDesc");

const loader = document.querySelector("#loader");
const toast = document.querySelector("#toast");

const cartPanel = document.querySelector("#cart");
const cartBtn = document.querySelector("#cartBtn");
const closeCart = document.querySelector("#closeCart");

const cartItems = document.querySelector("#cartItems");
const cartCount = document.querySelector("#cartCount");
const total = document.querySelector("#total");

const themeBtn = document.querySelector("#themeBtn");

const productModal = document.querySelector("#productModal");
const closeProduct = document.querySelector("#closeProduct");

const authModal = document.querySelector("#authModal");
const closeAuth = document.querySelector("#closeAuth");

const loginBtn = document.querySelector("#loginBtn");
const logoutBtn = document.querySelector("#logoutBtn");

const guestMenu = document.querySelector("#guestMenu");
const userMenu = document.querySelector("#userMenu");

const userName = document.querySelector("#userName");

const authTitle = document.querySelector("#authTitle");
const switchAuth = document.querySelector("#switchAuth");
const switchText = document.querySelector("#switchText");

const nameField = document.querySelector("#nameField");
const emailField = document.querySelector("#emailField");
const passwordField = document.querySelector("#passwordField");
const authSubmit = document.querySelector("#authSubmit");

let products = [];
let filteredProducts = [];

let users = JSON.parse(localStorage.getItem("users")) || [];

let currentUser = JSON.parse(localStorage.getItem("currentUser"));

let cart = [];

let registerMode = false;

function saveUsers() {
    localStorage.setItem("users", JSON.stringify(users));
}

function saveCurrentUser() {
    localStorage.setItem(
        "currentUser",
        JSON.stringify(currentUser)
    );
}

function showToast(message) {

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(showToast.timer);

    showToast.timer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2000);

}

function updateNavbar() {

    if (currentUser) {

        guestMenu.classList.add("hidden");
        userMenu.classList.remove("hidden");

        userName.textContent = currentUser.name;

        cart = currentUser.cart || [];

    } else {

        guestMenu.classList.remove("hidden");
        userMenu.classList.add("hidden");

        cart = [];

    }

}

function resetAuthForm() {

    nameField.value = "";
    emailField.value = "";
    passwordField.value = "";

}

function openAuth(register = false) {

    registerMode = register;

    authTitle.textContent = register
        ? "Create Account"
        : "Login";

    authSubmit.textContent = register
        ? "Register"
        : "Login";

    switchText.textContent = register
        ? "Already have an account?"
        : "Don't have an account?";

    switchAuth.textContent = register
        ? "Login"
        : "Register";

    nameField.style.display = register
        ? "block"
        : "none";

    resetAuthForm();

    authModal.classList.add("show");

}

loginBtn.addEventListener("click", () => {

    openAuth();

});

closeAuth.addEventListener("click", () => {

    authModal.classList.remove("show");

});

switchAuth.addEventListener("click", e => {

    e.preventDefault();

    openAuth(!registerMode);

});

authSubmit.addEventListener("click", () => {

    const name = nameField.value.trim();
    const email = emailField.value.trim().toLowerCase();
    const password = passwordField.value;

    if (!email || !password) {
        return showToast("Fill all required fields");
    }

    if (registerMode) {

        if (!name) {
            return showToast("Enter your name");
        }

        const exists = users.find(user => user.email === email);

        if (exists) {
            return showToast("Account already exists");
        }

        currentUser = {
            name,
            email,
            password,
            cart: []
        };

        users.push(currentUser);

        saveUsers();
        saveCurrentUser();

        updateNavbar();

        authModal.classList.remove("show");

        showToast("Welcome to ShopEase!");

        return;
    }

    const user = users.find(user => {

        return (
            user.email === email &&
            user.password === password
        );

    });

    if (!user) {
        return showToast("Invalid email or password");
    }

    currentUser = user;

    saveCurrentUser();

    updateNavbar();

    authModal.classList.remove("show");

    showToast(`Welcome back, ${user.name}`);

});

logoutBtn.addEventListener("click", () => {

    if (currentUser) {

        currentUser.cart = cart;

        const index = users.findIndex(user => {

            return user.email === currentUser.email;

        });

        users[index] = currentUser;

        saveUsers();

    }

    currentUser = null;

    localStorage.removeItem("currentUser");

    updateNavbar();

    cartItems.innerHTML = "";

    cartCount.textContent = "0";
    total.textContent = "0.00";

    showToast("Logged out");

});

themeBtn.addEventListener("click", () => {

    document.body.classList.toggle("dark");

    const dark = document.body.classList.contains("dark");

    localStorage.setItem(
        "theme",
        dark ? "dark" : "light"
    );

    themeBtn.innerHTML = dark
        ? '<i class="fa-solid fa-sun"></i>'
        : '<i class="fa-solid fa-moon"></i>';

});

if (localStorage.getItem("theme") === "dark") {

    document.body.classList.add("dark");

    themeBtn.innerHTML =
        '<i class="fa-solid fa-sun"></i>';

}

updateNavbar();



async function loadProducts() {

    loader.style.display = "grid";

    try {

        const res = await fetch("https://fakestoreapi.com/products");

        products = await res.json();
        filteredProducts = [...products];

        renderProducts(filteredProducts);

    } catch (err) {

        productsEl.innerHTML = `
            <p class="error">
                Couldn't load products. Please try again.
            </p>
        `;

        console.error(err);

    } finally {

        loader.style.display = "none";

    }

}

function renderProducts(list) {

    productsEl.innerHTML = "";

    if (!list.length) {

        productsEl.innerHTML = `
            <p class="error">
                No products found.
            </p>
        `;

        return;
    }

    list.forEach(product => {

        const card = document.createElement("div");

        card.className = "card";

        card.innerHTML = `

            <img src="${product.image}" alt="${product.title}">

            <div class="card-body">

                <h3>${product.title}</h3>

                <div class="rating">

                    ${getStars(product.rating.rate)}
                    <span>(${product.rating.count})</span>

                </div>

                <div class="price">

                    $${product.price}

                </div>

                <div class="actions">

                    <button class="details-btn">

                        Details

                    </button>

                    <button class="add-btn">

                        Add to Cart

                    </button>

                </div>

            </div>

        `;

        card.querySelector(".details-btn").addEventListener("click", () => {

            openProduct(product);

        });

        card.querySelector(".add-btn").addEventListener("click", () => {

            addToCart(product);

        });

        productsEl.appendChild(card);

    });

}

function getStars(rating) {

    const full = Math.round(rating);

    return "⭐".repeat(full);

}

function openProduct(product) {

    modalImg.src = product.image;
    modalTitle.textContent = product.title;
    modalPrice.textContent = `$${product.price}`;
    modalDesc.textContent = product.description;

    productModal.classList.add("show");

}

closeProduct.addEventListener("click", () => {

    productModal.classList.remove("show");

});

productModal.addEventListener("click", e => {

    if (e.target === productModal) {

        productModal.classList.remove("show");

    }

});

document.addEventListener("keydown", e => {

    if (e.key === "Escape") {

        productModal.classList.remove("show");
        authModal.classList.remove("show");

    }

});

search.addEventListener("input", () => {

    const value = search.value.trim().toLowerCase();

    filteredProducts = products.filter(product => {

        return product.title
            .toLowerCase()
            .includes(value);

    });

    renderProducts(filteredProducts);

});

document.querySelectorAll(".filter").forEach(button => {

    button.addEventListener("click", () => {

        document
            .querySelector(".filter.active")
            ?.classList.remove("active");

        button.classList.add("active");

        const category = button.dataset.category;

        filteredProducts = category === "all"
            ? [...products]
            : products.filter(product => product.category === category);

        renderProducts(filteredProducts);

    });

});

loadProducts();




function saveCart() {

    if (!currentUser) return;

    currentUser.cart = cart;

    const index = users.findIndex(user => user.email === currentUser.email);

    if (index !== -1) {
        users[index] = currentUser;
    }

    saveUsers();
    saveCurrentUser();

}

function updateCartCount() {

    const count = cart.reduce((total, item) => {

        return total + item.qty;

    }, 0);

    cartCount.textContent = count;

}

function addToCart(product) {

    if (!currentUser) {

        openAuth();

        showToast("Login to add items");

        return;

    }

    const item = cart.find(p => p.id === product.id);

    if (item) {

        item.qty++;

    } else {

        cart.push({
            id: product.id,
            title: product.title,
            price: product.price,
            image: product.image,
            qty: 1
        });

    }

    saveCart();
    updateCart();
    showToast("Added to cart");

}

function updateCart() {

    cartItems.innerHTML = "";

    if (!cart.length) {

        cartItems.innerHTML = `
            <p>Your cart is empty.</p>
        `;

        total.textContent = "0.00";

        updateCartCount();

        return;

    }

    let grandTotal = 0;

    cart.forEach(item => {

        grandTotal += item.price * item.qty;

        const row = document.createElement("div");

        row.className = "cart-item";

        row.innerHTML = `

            <img src="${item.image}" alt="${item.title}">

            <div class="item-info">

                <h4>${item.title}</h4>

                <p>$${item.price}</p>

                <div class="qty">

                    <button class="minus">-</button>

                    <span>${item.qty}</span>

                    <button class="plus">+</button>

                    <button class="remove">
                        <i class="fa-solid fa-trash"></i>
                    </button>

                </div>

            </div>

        `;

        row.querySelector(".plus").addEventListener("click", () => {

            item.qty++;

            saveCart();
            updateCart();

        });

        row.querySelector(".minus").addEventListener("click", () => {

            if (item.qty > 1) {

                item.qty--;

            } else {

                cart = cart.filter(p => p.id !== item.id);

            }

            saveCart();
            updateCart();

        });

        row.querySelector(".remove").addEventListener("click", () => {

            cart = cart.filter(p => p.id !== item.id);

            saveCart();
            updateCart();

            showToast("Item removed");

        });

        cartItems.appendChild(row);

    });

    total.textContent = grandTotal.toFixed(2);

    updateCartCount();

}

cartBtn.addEventListener("click", () => {

    if (!currentUser) {

        openAuth();

        return;

    }

    cartPanel.classList.add("show");

});

closeCart.addEventListener("click", () => {

    cartPanel.classList.remove("show");

});

document.addEventListener("click", e => {

    const insideCart = cartPanel.contains(e.target);
    const cartButton = cartBtn.contains(e.target);

    if (!insideCart && !cartButton) {

        cartPanel.classList.remove("show");

    }

});

const checkoutBtn = document.querySelector("#checkout");

checkoutBtn.addEventListener("click", () => {

    if (!cart.length) {

        showToast("Your cart is empty");

        return;

    }

    showToast("Order placed successfully 🎉");

    cart = [];

    saveCart();

    updateCart();

    cartPanel.classList.remove("show");

});

updateCart();




