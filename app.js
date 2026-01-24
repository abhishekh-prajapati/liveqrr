
//index.html javascript
let currentLang = "en";
let activeCategory = "veg";
let menuData = {};
let cart = {};


/* LOAD MENU JSON */
async function loadMenuJSON(lang){
  const res = await fetch(`./menu/menu-${lang}.json`);
  menuData = await res.json();
  renderCategories();
  renderMenu(activeCategory);
}

/* RENDER CATEGORIES */
function renderCategories(){
  const box = document.querySelector(".categories");
  box.innerHTML = "";

  Object.keys(menuData).forEach(cat=>{
    const span = document.createElement("span");
    span.textContent = formatCategory(cat);
    if(cat === activeCategory) span.classList.add("active");

    span.onclick = ()=>{
  activeCategory = cat;

  document.querySelectorAll(".categories span")
    .forEach(s=>s.classList.remove("active"));
  span.classList.add("active");

  renderMenu(cat);

  // smooth scroll to menu
  document.getElementById("menu")
    .scrollIntoView({ behavior: "smooth", block: "start" });
};


    box.appendChild(span);
  });
}

/* RENDER MENU */
function renderMenu(cat){
  const box = document.getElementById("menu");
box.innerHTML = `<div class="menu-section" data-cat="${cat}"></div>`;


  menuData[cat].forEach((item,i)=>{
    const qty = cart[item.name]?.qty || 0;

    box.innerHTML += `
      <div class="card">
        ${item.offer ? `<div class="badge">${item.offer}</div>` : ""}
        ${item.bestseller ? `<div class="badge bestseller">★ Bestseller</div>` : ""}

        <img src="./images/${item.img}"
             onerror="this.src='./images/food-placeholder.jpg'">

        <div class="details">
          <h4>${item.name}</h4>
          <div class="price">₹${item.price}</div>
        </div>

        <div class="qty">
          <button onclick="updateCart('${cat}',${i},-1)">−</button>
          <span>${qty}</span>
          <button onclick="updateCart('${cat}',${i},1)">+</button>
        </div>
      </div>
    `;
  });
}

/* CART LOGIC */
function updateCart(cat,i,change){
  const item = menuData[cat][i];
  if(!cart[item.name]) cart[item.name] = {qty:0,price:item.price};

  cart[item.name].qty += change;
  if(cart[item.name].qty <= 0) delete cart[item.name];

  renderMenu(cat);
  renderCart();
}

function renderCart(){
  const bar = document.getElementById("cartBar");
  const list = document.getElementById("cartItems");
  let total = 0;
  list.innerHTML = "";

  Object.keys(cart).forEach(name=>{
    total += cart[name].qty * cart[name].price;
    list.innerHTML += `${name} × ${cart[name].qty}<br>`;
  });

  document.getElementById("cartTotal").innerText = "₹" + total;
  bar.style.display = total > 0 ? "block" : "none";
}

function placeOrder(){
  alert("Order placed successfully!");
}

/* LANGUAGE SWITCH */
document.querySelectorAll(".lang-switch button").forEach(btn=>{
  btn.onclick = ()=>{
    currentLang = btn.dataset.lang;
    document.querySelectorAll(".lang-switch button")
      .forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    loadMenuJSON(currentLang);
  };
});

function formatCategory(cat){
  if(cat === "nonveg") return "Non Veg";
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
        const cards = document.querySelectorAll(".card h4");
        cards.forEach(h4 => {
          if (h4.textContent === result.name) {
            const card = h4.closest(".card");
            card.scrollIntoView({ behavior: "smooth", block: "center" });
            card.style.boxShadow = "0 0 0 3px rgba(245,158,11,0.6)";
            setTimeout(() => card.style.boxShadow = "", 1200);
          }
        });
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
function placeOrder(){
  if(Object.keys(cart).length === 0){
    alert("Cart is empty");
    return;
  }
  sessionStorage.setItem("qrify_cart", JSON.stringify(cart));
  window.location.href = "payment.html";
}

