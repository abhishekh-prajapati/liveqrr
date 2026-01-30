
let currentLang = "en";
let activeCategory = "veg";
let menuData = {};
let cart = {};

/* LOAD MENU JSON */
async function loadMenuJSON(lang) {
  try {
    const res = await fetch(`./menu/menu-${lang}.json`);
    if (!res.ok) throw new Error("Failed to load menu");
    menuData = await res.json();

    // Sync UI elements
    currentLang = lang;
    updateLanguageUI(lang);

    renderCategories();
    renderMenu(activeCategory);
  } catch (err) {
    console.error(err);
  }
}

function updateLanguageUI(lang) {
  // Update buttons
  document.querySelectorAll(".lang-switch button").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.lang === lang);
  });
  // Update dropdown
  const dropdown = document.getElementById("langDropdown");
  if (dropdown) dropdown.value = lang;
}

/* RENDER CATEGORIES */
function renderCategories() {
  const box = document.querySelector(".categories");
  if (!box) return;
  box.innerHTML = "";

  Object.keys(menuData).forEach(cat => {
    const span = document.createElement("span");
    span.textContent = formatCategory(cat);
    if (cat === activeCategory) span.classList.add("active");

    span.onclick = () => {
      activeCategory = cat;
      renderMenu(cat);
      setActiveCategoryUI(cat);

      const menuEl = document.getElementById("menu");
      if (menuEl) menuEl.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    box.appendChild(span);
  });
}

function setActiveCategoryUI(cat) {
  document.querySelectorAll(".categories span").forEach(span => {
    const text = span.textContent.replace(" ", "").toLowerCase();
    span.classList.toggle("active", text === cat.toLowerCase());
  });
}

/* RENDER MENU (ZOMATO STYLE) */
function renderMenu(cat) {
  const box = document.getElementById("menu");
  if (!box) return;

  let html = `<div class="menu-section" data-cat="${cat}"></div>`;

  menuData[cat].forEach((item, i) => {
    const qty = cart[item.name]?.qty || 0;

    let isVeg = item.veg;
    if (item.veg === undefined) {
      isVeg = ["veg", "south", "snacks", "chinese"].includes(cat) &&
        !item.name.toLowerCase().match(/chicken|egg|mutton|fish|prawn/);
    }

    const dietIcon = isVeg
      ? `<div class="diet-icon veg"></div>`
      : `<div class="diet-icon nonveg"></div>`;

    const rating = item.rating || (Math.random() * (4.8 - 3.9) + 3.9).toFixed(1);
    const votes = Math.floor(Math.random() * 900) + 50;

    html += `
      <div class="menu-item-z" id="item-${cat}-${i}">
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
  box.innerHTML = html;
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
  if (!bar || !list) return;

  let total = 0;
  list.innerHTML = "";

  Object.keys(cart).forEach(name => {
    total += cart[name].qty * cart[name].price;
    list.innerHTML += `${name} × ${cart[name].qty}<br>`;
  });

  const totalEl = document.getElementById("cartTotal");
  if (totalEl) totalEl.innerText = "₹" + total;
  bar.style.display = total > 0 ? "block" : "none";
}

/* REDIRECT TO PAYMENT */
function placeOrder() {
  if (Object.keys(cart).length === 0) {
    showPopup("Cart is empty", "⚠️");
    return;
  }
  sessionStorage.setItem("qrify_cart", JSON.stringify(cart));
  window.location.href = "payment.html";
}

/* CUSTOM POPUP LOGIC */
function showPopup(msg, icon = "✓") {
  const popup = document.getElementById("customPopup");
  if (!popup) return;

  popup.querySelector(".msg").textContent = msg;
  popup.querySelector(".icon").textContent = icon;

  popup.classList.add("show");
  setTimeout(() => {
    popup.classList.remove("show");
  }, 3000);
}

/* LANGUAGE SWITCH EVENT LISTENERS */
document.querySelectorAll(".lang-switch button").forEach(btn => {
  btn.onclick = () => loadMenuJSON(btn.dataset.lang);
});

const langDropdown = document.getElementById("langDropdown");
if (langDropdown) {
  langDropdown.addEventListener("change", () => loadMenuJSON(langDropdown.value));
}

function formatCategory(cat) {
  if (cat === "nonveg") return "Non Veg";
  return cat.charAt(0).toUpperCase() + cat.slice(1);
}

/* SCROLL SPY */
window.addEventListener("scroll", () => {
  const sections = document.querySelectorAll(".menu-section");
  let current = activeCategory;

  sections.forEach(sec => {
    const rect = sec.getBoundingClientRect();
    if (rect.top <= 120 && rect.bottom > 120) {
      current = sec.dataset.cat;
    }
  });
  setActiveCategoryUI(current);
});

/* SEARCH LOGIC */
const searchInput = document.getElementById("searchInput");
const suggestionsBox = document.getElementById("searchSuggestions");

if (searchInput && suggestionsBox) {
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
          results.push({ name: item.name, category });
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
        activeCategory = result.category;
        renderMenu(result.category);
        setActiveCategoryUI(result.category);

        setTimeout(() => {
          const titleElements = document.querySelectorAll(".menu-title");
          for (const t of titleElements) {
            if (t.textContent === result.name) {
              const target = t.closest(".menu-item-z");
              target.scrollIntoView({ behavior: "smooth", block: "center" });
              target.style.background = "#fffbeb";
              setTimeout(() => target.style.background = "white", 1200);
              break;
            }
          }
        }, 100);
      };
      suggestionsBox.appendChild(div);
    });
    suggestionsBox.style.display = "block";
  });
}

/* INITIAL LOAD */
loadMenuJSON("en");
