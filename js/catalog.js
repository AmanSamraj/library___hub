document.addEventListener("DOMContentLoaded", async function() {
  var productsNode = document.getElementById("catalogProducts");
  if (!productsNode || !window.LibraryHubApi) {
    return;
  }

  try {
    var response = await window.LibraryHubApi.request("/products");
    var products = response.products || [];

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
    productsNode.innerHTML = '<div class="empty-state"><h3>Unable to load products</h3><p>' + error.message + "</p></div>";
  }
});
