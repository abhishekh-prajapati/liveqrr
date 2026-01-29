
//index.html javascript
let currentLang = "en";
let activeCategory = "veg";
let menuData = {};
let cart = {};


/* LOAD MENU JSON */
async function loadMenuJSON(lang) {
  const res = await fetch(`./menu/menu-${lang}.json`);
  menuData = await res.json();
  renderCategories();
  renderMenu(activeCategory);
}

/* RENDER CATEGORIES */
function renderCategories() {
  const box = document.querySelector(".categories");
  box.innerHTML = "";

  Object.keys(menuData).forEach(cat => {
    const span = document.createElement("span");
    span.textContent = formatCategory(cat);
    if (cat === activeCategory) span.classList.add("active");

    span.onclick = () => {
      activeCategory = cat;

      document.querySelectorAll(".categories span")
        .forEach(s => s.classList.remove("active"));
      span.classList.add("active");

      renderMenu(cat);

      // smooth scroll to menu
      document.getElementById("menu")
        .scrollIntoView({ behavior: "smooth", block: "start" });
    };


    box.appendChild(span);
  });
}

/* RENDER MENU (ZOMATO STYLE) */
function renderMenu(cat) {
  const box = document.getElementById("menu");
  box.innerHTML = `<div class="menu-section" data-cat="${cat}"></div>`;

  menuData[cat].forEach((item, i) => {
    const qty = cart[item.name]?.qty || 0;

    // Toggle veg/non-veg styling (simple logic)
    let isVeg = item.veg;
    if (item.veg === undefined) {
      // Infer from category/name if missing
      isVeg = ["veg", "south", "snacks", "chinese"].includes(cat) && !item.name.toLowerCase().includes("chicken") && !item.name.toLowerCase().includes("egg") && !item.name.toLowerCase().includes("mutton") && !item.name.toLowerCase().includes("fish") && !item.name.toLowerCase().includes("prawn");
    }

    const dietIcon = isVeg
      ? `<div class="diet-icon veg"></div>`
      : `<div class="diet-icon nonveg"></div>`;

    const rating = item.rating || (Math.random() * (4.8 - 3.9) + 3.9).toFixed(1);
    const votes = Math.floor(Math.random() * 900) + 50;

    box.innerHTML += `
      <div class="menu-item-z">
        <div class="menu-left">
          <div class="menu-meta">
            ${dietIcon}
            ${item.bestseller ? `<span class="tag-bestseller">Bestseller</span>` : ""}
          </div>
          <h3 class="menu-title">${item.name}</h3>
          <div class="menu-rating">
            <div class="stars">${rating} <span class="star-symbol">★</span></div>
            <span class="votes">(${votes})</span>
          </div>
          <div class="menu-price">₹${item.price}</div>
          <div class="menu-desc">${item.desc || "Deliciously prepared with fresh ingredients."}</div>
        </div>

        <div class="menu-right">
          <div class="img-wrapper">
             <img src="./images/${item.img}" onerror="this.src='./images/food-placeholder.jpg'">
             
             <div class="add-action-area">
                ${qty === 0
        ? `<button class="add-btn-z" onclick="updateCart('${cat}',${i},1)">ADD</button>`
        : `<div class="qty-control-z">
                        <button onclick="updateCart('${cat}',${i},-1)">−</button>
                        <span>${qty}</span>
                        <button onclick="updateCart('${cat}',${i},1)">+</button>
                     </div>`
      }
             </div>
          </div>
        </div>
      </div>
      <div class="divider-dashed"></div>
    `;
  });
}

/* CART LOGIC */
function updateCart(cat, i, change) {
  const item = menuData[cat][i];
  if (!cart[item.name]) cart[item.name] = { qty: 0, price: item.price };

  cart[item.name].qty += change;
  if (cart[item.name].qty <= 0) delete cart[item.name];

  renderMenu(cat);
  renderCart();
}

function renderCart() {
  const bar = document.getElementById("cartBar");
  const list = document.getElementById("cartItems");
  let total = 0;
  list.innerHTML = "";

  Object.keys(cart).forEach(name => {
    total += cart[name].qty * cart[name].price;
    list.innerHTML += `${name} × ${cart[name].qty}<br>`;
  });

  document.getElementById("cartTotal").innerText = "₹" + total;
  bar.style.display = total > 0 ? "block" : "none";
}

function placeOrder() {
  alert("Order placed successfully!");
}

/* LANGUAGE SWITCH */
document.querySelectorAll(".lang-switch button").forEach(btn => {
  btn.onclick = () => {
    currentLang = btn.dataset.lang;
    document.querySelectorAll(".lang-switch button")
      .forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    loadMenuJSON(currentLang);
  };
});

function formatCategory(cat) {
  if (cat === "nonveg") return "Non Veg";
  return cat.charAt(0).toUpperCase() + cat.slice(1);
}

/* DEFAULT LOAD */
loadMenuJSON("en");

window.addEventListener("scroll", () => {
  const sections = document.querySelectorAll(".menu-section");
  let current = activeCategory;

  sections.forEach(sec => {
    const rect = sec.getBoundingClientRect();
    if (rect.top <= 120 && rect.bottom > 120) {
      current = sec.dataset.cat;
    }
  });

  document.querySelectorAll(".categories span").forEach(span => {
    span.classList.toggle(
      "active",
      span.textContent.replace(" ", "").toLowerCase() === current
    );
  });
});
// search

function setActiveCategory(cat) {
  activeCategory = cat;

  document.querySelectorAll(".categories span").forEach(span => {
    span.classList.toggle(
      "active",
      span.textContent.replace(" ", "").toLowerCase() === cat
    );
  });
}



const searchInput = document.getElementById("searchInput");
const suggestionsBox = document.getElementById("searchSuggestions");

searchInput.addEventListener("input", () => {
  const query = searchInput.value.toLowerCase().trim();
  suggestionsBox.innerHTML = "";

  if (!query) {
    suggestionsBox.style.display = "none";
    return;
  }

  let results = [];

  Object.keys(menuData).forEach(category => {
    menuData[category].forEach(item => {
      if (item.name.toLowerCase().includes(query)) {
        results.push({
          name: item.name,
          category
        });
      }
    });
  });

  if (results.length === 0) {
    suggestionsBox.style.display = "none";
    return;
  }

  results.forEach(result => {
    const div = document.createElement("div");
    div.textContent = result.name;

    div.onclick = () => {
      suggestionsBox.style.display = "none";
      searchInput.value = "";

      // 1️⃣ Switch category
      setActiveCategory(result.category);

      // 2️⃣ Render that category
      renderMenu(result.category);

      // 3️⃣ Scroll after DOM updates
      setTimeout(() => {
        const titleElements = document.querySelectorAll(".menu-title");
        let target = null;
        // Find element by text content
        for (const t of titleElements) {
          if (t.textContent === result.name) {
            target = t.closest(".menu-item-z");
            break;
          }
        }

        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "center" });
          target.style.background = "#fffbeb";
          setTimeout(() => target.style.background = "white", 1200);
        }
      }, 100);
    };

    suggestionsBox.appendChild(div);
  });

  suggestionsBox.style.display = "block";
});

//dropdown of the lang
const langDropdown = document.getElementById("langDropdown");

langDropdown.addEventListener("change", () => {
  currentLang = langDropdown.value;
  loadMenuJSON(currentLang);

  // sync button state (for resize back to desktop)
  document.querySelectorAll(".lang-switch button").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.lang === currentLang);
  });
});


//redirect to payment
function placeOrder() {
  if (Object.keys(cart).length === 0) {
    alert("Cart is empty");
    return;
  }
  sessionStorage.setItem("qrify_cart", JSON.stringify(cart));
  window.location.href = "payment.html";
}
