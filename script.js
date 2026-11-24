const API_URL = "https://fakestoreapi.com/products";

const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const sortFilter = document.getElementById("sortFilter");
const clearSavedBtn = document.getElementById("clearSavedBtn");
const statusElement = document.getElementById("status");
const productsContainer = document.getElementById("productsContainer");
const savedList = document.getElementById("savedList");

let allProducts = [];
let savedProductIds = [];

function loadSavedProducts() {
  const storedProducts = localStorage.getItem("savedProducts");

  if (storedProducts) {
    savedProductIds = JSON.parse(storedProducts);
  } else {
    savedProductIds = [];
  }

  renderSavedProducts();
}

function saveToLocalStorage() {
  localStorage.setItem("savedProducts", JSON.stringify(savedProductIds));
  renderSavedProducts();
}

async function getProducts() {
  try {
    statusElement.textContent = "Loading products...";
    statusElement.classList.remove("error");

    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error("Unable to fetch products. Please try again.");
    }

    allProducts = await response.json();

    if (allProducts.length === 0) {
      statusElement.textContent = "No products available.";
      return;
    }

    populateCategoryFilter();
    renderProducts(allProducts);

    statusElement.textContent = `${allProducts.length} products loaded successfully.`;
  } catch (error) {
    statusElement.textContent = error.message;
    statusElement.classList.add("error");
    productsContainer.innerHTML = "";
  }
}

function populateCategoryFilter() {
  const categories = [...new Set(allProducts.map(product => product.category))];

  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
}

function filterProducts() {
  const searchText = searchInput.value.toLowerCase().trim();
  const selectedCategory = categoryFilter.value;
  const selectedSort = sortFilter.value;

  let filteredProducts = allProducts.filter(product => {
    const matchesSearch = product.title
      .toLowerCase()
      .includes(searchText);

    const matchesCategory =
      selectedCategory === "all" ||
      product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  if (selectedSort === "low") {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (selectedSort === "high") {
    filteredProducts.sort((a, b) => b.price - a.price);
  }

  renderProducts(filteredProducts);
}

function renderProducts(products) {
  productsContainer.innerHTML = "";

  if (products.length === 0) {
    statusElement.textContent = "No products found. Try another search.";
    return;
  }

  products.forEach(product => {
    const isSaved = savedProductIds.includes(product.id);

    const card = document.createElement("article");
    card.className = "product-card";

    const image = document.createElement("img");
    image.src = product.image;
    image.alt = product.title;

    const title = document.createElement("h3");
    title.className = "product-title";
    title.textContent = product.title;

    const category = document.createElement("p");
    category.className = "product-category";
    category.textContent = product.category;

    const price = document.createElement("p");
    price.className = "product-price";
    price.textContent = `$${product.price.toFixed(2)}`;

    const actions = document.createElement("div");
    actions.className = "product-actions";

    const saveButton = document.createElement("button");
    saveButton.className = isSaved ? "save-btn saved-btn" : "save-btn";
    saveButton.textContent = isSaved ? "Saved" : "Save";

    const detailsButton = document.createElement("button");
    detailsButton.className = "details-btn";
    detailsButton.textContent = "View Details";

    const detailsPanel = document.createElement("div");
    detailsPanel.className = "details-panel";
    detailsPanel.textContent = product.description;

    saveButton.addEventListener("click", () => {
      if (savedProductIds.includes(product.id)) {
        return;
      }

      savedProductIds.push(product.id);
      saveToLocalStorage();

      saveButton.textContent = "Saved";
      saveButton.classList.add("saved-btn");
    });

    detailsButton.addEventListener("click", () => {
      detailsPanel.classList.toggle("show");
    });

    actions.appendChild(saveButton);
    actions.appendChild(detailsButton);

    card.appendChild(image);
    card.appendChild(title);
    card.appendChild(category);
    card.appendChild(price);
    card.appendChild(actions);
    card.appendChild(detailsPanel);

    productsContainer.appendChild(card);
  });
}

function renderSavedProducts() {
  savedList.innerHTML = "";

  if (savedProductIds.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.textContent = "No saved products yet.";
    savedList.appendChild(emptyItem);
    return;
  }

  savedProductIds.forEach(id => {
    const product = allProducts.find(item => item.id === id);

    if (!product) {
      return;
    }

    const listItem = document.createElement("li");

    const productText = document.createElement("span");
    productText.textContent = `${product.title} - $${product.price.toFixed(2)}`;

    const removeButton = document.createElement("button");
    removeButton.className = "remove-btn";
    removeButton.textContent = "Remove";

    removeButton.addEventListener("click", () => {
      savedProductIds = savedProductIds.filter(
        savedId => savedId !== product.id
      );

      saveToLocalStorage();
      filterProducts();
    });

    listItem.appendChild(productText);
    listItem.appendChild(removeButton);
    savedList.appendChild(listItem);
  });
}

searchInput.addEventListener("input", filterProducts);
categoryFilter.addEventListener("change", filterProducts);
sortFilter.addEventListener("change", filterProducts);

clearSavedBtn.addEventListener("click", () => {
  savedProductIds = [];
  saveToLocalStorage();
  filterProducts();
});

loadSavedProducts();
getProducts();