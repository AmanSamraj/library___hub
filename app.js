document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const searchButton = document.getElementById("searchButton");
  const clearSearchButton = document.getElementById("clearSearchButton");
  const searchFeedback = document.getElementById("searchFeedback");
  const searchHeading = document.getElementById("searchHeading");
  const searchMeta = document.getElementById("searchMeta");
  const sections = Array.from(document.querySelectorAll(".searchable-section"));
  const categoryChips = Array.from(document.querySelectorAll(".category-chip"));
  const categoryProductsTitle = document.getElementById("categoryProductsTitle");
  const categoryProductsMeta = document.getElementById("categoryProductsMeta");
  const categoryProductsLink = document.getElementById("categoryProductsLink");
  const categoryProductsGrid = document.getElementById("categoryProductsGrid");

  if (!searchInput || !searchButton) {
    return;
  }

  function normalize(value) {
    return value.toLowerCase().trim();
  }

  function runSearch() {
    const query = normalize(searchInput.value);
    let totalMatches = 0;
    const productCards = Array.from(document.querySelectorAll(".searchable-product"));

    if (productCards.length === 0) {
      return;
    }

    productCards.forEach((card) => {
      const searchableText = normalize(
        [
          card.dataset.name,
          card.dataset.category,
          card.dataset.price,
          card.querySelector("h3")?.textContent || "",
          card.querySelector(".price")?.textContent || ""
        ].join(" ")
      );

      const matches = query === "" || searchableText.includes(query);
      card.hidden = !matches;

      if (matches) {
        totalMatches += 1;
      }
    });

    sections.forEach((section) => {
      const visibleCards = section.querySelectorAll(".searchable-product:not([hidden])");
      section.hidden = visibleCards.length === 0;
    });

    if (query === "") {
      searchFeedback.hidden = true;
      return;
    }

    searchFeedback.hidden = false;
    searchHeading.textContent = `Results for "${searchInput.value.trim()}"`;

    if (totalMatches > 0) {
      searchMeta.textContent = `${totalMatches} matching product${totalMatches > 1 ? "s" : ""} found in the catalog.`;
    } else {
      searchMeta.textContent = "No matching products found. Try a different title, keyword, or category.";
    }
  }

  function clearSearch() {
    searchInput.value = "";
    runSearch();
    searchInput.focus();
  }

  searchButton.addEventListener("click", runSearch);
  searchInput.addEventListener("input", runSearch);
  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      runSearch();
    }
  });

  if (clearSearchButton) {
    clearSearchButton.addEventListener("click", clearSearch);
  }

  function renderCategoryProducts(products) {
    if (!categoryProductsGrid) {
      return;
    }

    if (!products.length) {
      categoryProductsGrid.innerHTML = '<div class="empty-state"><h3>No products found</h3><p>Is category ke liye abhi products available nahi hain.</p></div>';
      runSearch();
      return;
    }

    categoryProductsGrid.innerHTML = products.map((product) => {
      const safeName = product.name.replace(/'/g, "\\'");
      return [
        '<div class="product-card interactive-card searchable-product" data-name="' + product.name + '" data-category="' + product.category + '" data-price="' + product.price + '">',
        '<img src="' + product.image + '" alt="' + product.name + '">',
        "<h3>" + product.name + "</h3>",
        '<p class="price">₹' + product.price + "</p>",
        '<p class="product-copy">' + product.description + "</p>",
        '<div class="card-actions">',
        '<a class="btn ghost" href="product-detail.html?id=' + encodeURIComponent(product.id) + '">View Details</a>',
        '<button onclick="addToCart(\'' + safeName + '\',' + product.price + ',\'' + product.id + '\')">Add to Cart</button>',
        '<button class="buy" onclick="buyNow(\'' + safeName + '\',' + product.price + ',\'' + product.id + '\')">Buy Now</button>',
        "</div>",
        "</div>"
      ].join("");
    }).join("");

    runSearch();
  }

  function setActiveChip(category) {
    categoryChips.forEach((chip) => {
      chip.classList.toggle("active", chip.dataset.category === category);
    });
  }

  async function loadCategoryProducts(category) {
    if (!window.LibraryHubApi || !categoryProductsGrid || !category) {
      return;
    }

    setActiveChip(category);
    categoryProductsTitle.textContent = category + " Products";
    categoryProductsMeta.textContent = category + " naam ke anusar products yahan show ho rahe hain.";
    categoryProductsLink.href = "category.html?name=" + encodeURIComponent(category);
    categoryProductsGrid.innerHTML = '<div class="empty-state"><h3>Loading products...</h3><p>Selected category ke products load ho rahe hain.</p></div>';

    try {
      const response = await window.LibraryHubApi.request("/products?category=" + encodeURIComponent(category));
      renderCategoryProducts(response.products || []);
    } catch (error) {
      categoryProductsGrid.innerHTML = '<div class="empty-state"><h3>Unable to load products</h3><p>' + error.message + "</p></div>";
    }
  }

  categoryChips.forEach((chip) => {
    chip.addEventListener("click", (event) => {
      event.preventDefault();
      loadCategoryProducts(chip.dataset.category);
    });
  });

  if (categoryChips.length > 0) {
    loadCategoryProducts(categoryChips[0].dataset.category);
  }
});
