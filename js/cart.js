function readGuestCart() {
  try {
    return JSON.parse(localStorage.getItem("cart")) || [];
  } catch (error) {
    return [];
  }
}

function writeGuestCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function writeCheckoutItems(items) {
  localStorage.setItem("checkoutItems", JSON.stringify(items));
}

function normalizeCartItem(item) {
  return {
    name: item.name,
    price: Number(item.price),
    quantity: Math.max(1, Number(item.quantity || 1)),
    productId: item.productId || "",
    image: item.image || "",
    category: item.category || ""
  };
}

function mergeItems(items) {
  var merged = [];

  items.forEach(function(rawItem) {
    var item = normalizeCartItem(rawItem);
    var existingItem = merged.find(function(entry) {
      if (item.productId) {
        return entry.productId === item.productId;
      }

      return entry.name.toLowerCase() === item.name.toLowerCase();
    });

    if (existingItem) {
      existingItem.quantity += item.quantity;
      return;
    }

    merged.push(item);
  });

  return merged;
}

async function addToCart(name, price, productId) {
  if (window.LibraryHubApi && window.LibraryHubApi.isLoggedIn()) {
    try {
      await window.LibraryHubApi.request("/cart/items", {
        method: "POST",
        body: JSON.stringify({
          name: name,
          price: price,
          productId: productId || "",
          quantity: 1
        })
      });
      alert("Item added to your account cart");
      return;
    } catch (error) {
      alert(error.message);
      return;
    }
  }

  var cart = mergeItems(readGuestCart().concat({
    name: name,
    price: price,
    quantity: 1,
    productId: productId || ""
  }));
  writeGuestCart(cart);
  alert("Item added to cart");
}

function buyNow(name, price, productId) {
  var item = {
    name: name,
    price: price,
    productId: productId || "",
    quantity: 1
  };
  localStorage.setItem("checkoutItem", JSON.stringify(item));
  writeCheckoutItems([item]);
  window.location.href = "address.html";
}

function renderCartItems(items, total, isLoggedIn) {
  var cartDiv = document.getElementById("cartItems");
  var totalNode = document.getElementById("total");

  if (!cartDiv || !totalNode) {
    return;
  }

  cartDiv.innerHTML = "";

  if (!items.length) {
    cartDiv.innerHTML = '<div class="empty-state"><h3>Your cart is empty</h3><p>Add a few books to see them here.</p></div>';
    totalNode.innerText = "Total: ₹0";
    return;
  }

  items.forEach(function(item) {
    cartDiv.innerHTML += [
      '<div class="cart-item">',
      "<div>",
      "<h3>" + item.name + "</h3>",
      "<p>" + (isLoggedIn ? "Saved to your account cart" : "Ready for fast checkout") + "</p>",
      "</div>",
      "<strong>₹" + item.price + " x " + item.quantity + "</strong>",
      "</div>"
    ].join("");
  });

  totalNode.innerText = "Total: ₹" + total;
}

function chooseCheckoutItem(items) {
  if (!items.length) {
    return;
  }

  var normalizedItems = mergeItems(items);
  writeCheckoutItems(normalizedItems);
  localStorage.setItem("checkoutItem", JSON.stringify(normalizedItems[0]));
}

async function syncGuestCartToAccount() {
  if (!window.LibraryHubApi || !window.LibraryHubApi.isLoggedIn()) {
    return;
  }

  var guestCart = readGuestCart();
  if (!guestCart.length) {
    return;
  }

  for (var index = 0; index < guestCart.length; index += 1) {
    await window.LibraryHubApi.request("/cart/items", {
      method: "POST",
      body: JSON.stringify(normalizeCartItem(guestCart[index]))
    });
  }

  writeGuestCart([]);
}

async function loadCart() {
  var cartDiv = document.getElementById("cartItems");
  var checkoutLink = document.querySelector(".checkout-link");

  if (!cartDiv) {
    return;
  }

  if (window.LibraryHubApi && window.LibraryHubApi.isLoggedIn()) {
    try {
      await syncGuestCartToAccount();
      var response = await window.LibraryHubApi.request("/cart");
      renderCartItems(response.items, response.total, true);
      if (checkoutLink) {
        checkoutLink.addEventListener("click", function() {
          chooseCheckoutItem(response.items);
        });
      }
      return;
    } catch (error) {
      cartDiv.innerHTML = '<div class="empty-state"><h3>Unable to load your cart</h3><p>' + error.message + "</p></div>";
      return;
    }
  }

  var cart = readGuestCart();
  cart = mergeItems(cart);
  var total = cart.reduce(function(sum, item) {
    return sum + Number(item.price) * Number(item.quantity || 1);
  }, 0);

  renderCartItems(cart, total, false);
  if (checkoutLink) {
    checkoutLink.addEventListener("click", function() {
      chooseCheckoutItem(cart);
    });
  }
}

if (document.getElementById("cartItems")) {
  loadCart();
}
