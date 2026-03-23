document.addEventListener("DOMContentLoaded", async function() {
  if (!window.LibraryHubApi) {
    return;
  }

  var params = new URLSearchParams(window.location.search);
  var productId = params.get("id") || "book-atomic-habits";
  var titleNode = document.getElementById("detailTitle");
  var copyNode = document.getElementById("detailCopy");
  var imageNode = document.getElementById("detailImage");
  var priceNode = document.getElementById("detailPrice");
  var addButton = document.getElementById("detailAddToCart");
  var buyButton = document.getElementById("detailBuyNow");
  var badgeNode = document.getElementById("detailBadge");

  try {
    var response = await window.LibraryHubApi.request("/products/" + encodeURIComponent(productId));
    var product = response.product;

    titleNode.textContent = product.name;
    copyNode.textContent = product.description;
    imageNode.src = product.image;
    imageNode.alt = product.name;
    priceNode.textContent = "Price: ₹" + product.price;
    badgeNode.textContent = product.badge || "Reader Favorite";

    addButton.onclick = function() {
      addToCart(product.name, product.price, product.id);
    };

    buyButton.onclick = function() {
      buyNow(product.name, product.price, product.id);
    };
  } catch (error) {
    titleNode.textContent = "Unable to load product";
    copyNode.textContent = error.message;
    priceNode.textContent = "Price unavailable";
    addButton.disabled = true;
    buyButton.disabled = true;
  }
});
