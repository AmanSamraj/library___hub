async function renderCategoryProducts() {
  const params = new URLSearchParams(window.location.search);
  const selectedCategory = params.get("name") || "";
  const titleNode = document.getElementById("categoryTitle");
  const descriptionNode = document.getElementById("categoryDescription");
  const badgeNode = document.getElementById("categoryBadge");
  const headingNode = document.getElementById("categoryHeading");
  const productsNode = document.getElementById("categoryProducts");
  const emptyNode = document.getElementById("categoryEmpty");
  const chipsNode = document.getElementById("dynamicCategoryChips");

  if (!productsNode || !window.LibraryHubApi) {
    return;
  }

  try {
    const categoriesResponse = await window.LibraryHubApi.request("/categories");
    chipsNode.innerHTML = categoriesResponse.categories.map(function(category) {
      return '<a class="chip" href="category.html?name=' + encodeURIComponent(category) + '">' + category + "</a>";
    }).join("");

    const categoryToLoad = selectedCategory || (categoriesResponse.categories[0] || "");

    if (!categoryToLoad) {
      titleNode.textContent = "No Categories Yet";
      descriptionNode.textContent = "Products will appear here after catalog data is added.";
      badgeNode.textContent = "Catalog Empty";
      headingNode.textContent = "No Related Products";
      productsNode.innerHTML = "";
      emptyNode.hidden = false;
      return;
    }

    const response = await window.LibraryHubApi.request("/products?category=" + encodeURIComponent(categoryToLoad));
    const products = response.products || [];

    titleNode.textContent = categoryToLoad;
    descriptionNode.textContent = "Explore books and guides pulled directly from the backend catalog for this category.";
    badgeNode.textContent = "Live Catalog";
    headingNode.textContent = categoryToLoad + " Related Products";
    emptyNode.hidden = products.length > 0;

    if (!products.length) {
      productsNode.innerHTML = "";
      return;
    }

    productsNode.innerHTML = products.map(function(product) {
      return [
        '<div class="product-card interactive-card">',
        '<img src="' + product.image + '" alt="' + product.name + '">',
        "<h3>" + product.name + "</h3>",
        '<p class="price">₹' + product.price + "</p>",
        '<p class="product-copy">' + product.description + "</p>",
        '<div class="card-actions">',
        '<a class="btn ghost" href="product-detail.html?id=' + encodeURIComponent(product.id) + '">View Details</a>',
        '<button onclick="addToCart(\'' + product.name.replace(/'/g, "\\'") + "'," + product.price + ",'" + product.id + "')\">Add to Cart</button>",
        '<button class="buy" onclick="buyNow(\'' + product.name.replace(/'/g, "\\'") + "'," + product.price + ",'" + product.id + "')\">Buy Now</button>",
        "</div>",
        "</div>"
      ].join("");
    }).join("");
  } catch (error) {
    titleNode.textContent = "Unable to Load Category";
    descriptionNode.textContent = error.message;
    badgeNode.textContent = "Connection Error";
    headingNode.textContent = "No Related Products";
    productsNode.innerHTML = "";
    emptyNode.hidden = false;
  }
}

document.addEventListener("DOMContentLoaded", renderCategoryProducts);
