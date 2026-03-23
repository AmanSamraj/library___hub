const fallbackItem = {
  name: "Focus and Flow",
  price: 299,
  quantity: 1
};

const fallbackAddress = {
  fullName: "Aman Kumar",
  line1: "Varma asthan, Chandhari Kharijjama, Islampur, Nalanda 801303",
  phone: "6205366735",
  label: "HOME"
};

const fallbackPayment = {
  method: "upi",
  upiId: "aman@okaxis"
};

function isLoggedIn() {
  return Boolean(window.LibraryHubApi && window.LibraryHubApi.isLoggedIn());
}

function readStorage(key, fallbackValue) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value || fallbackValue;
  } catch (error) {
    return fallbackValue;
  }
}

function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function formatCurrency(value) {
  return "₹" + Number(value).toLocaleString("en-IN");
}

function getCheckoutItem() {
  return readStorage("checkoutItem", fallbackItem);
}

function getCheckoutItems() {
  const items = readStorage("checkoutItems", []);
  if (Array.isArray(items) && items.length) {
    return items.map(function(item) {
      return {
        name: item.name || fallbackItem.name,
        price: Number(item.price || fallbackItem.price),
        quantity: Math.max(1, Number(item.quantity || 1)),
        productId: item.productId || "",
        image: item.image || "",
        category: item.category || ""
      };
    });
  }

  return [getCheckoutItem()];
}

function getCheckoutAddress() {
  return readStorage("checkoutAddress", fallbackAddress);
}

function getCheckoutPayment() {
  return readStorage("checkoutPayment", fallbackPayment);
}

async function getSavedAddress() {
  if (!isLoggedIn()) {
    return getCheckoutAddress();
  }

  try {
    const response = await window.LibraryHubApi.request("/checkout/address");
    const address = response.address || getCheckoutAddress();
    writeStorage("checkoutAddress", address);
    return address;
  } catch (error) {
    return getCheckoutAddress();
  }
}

async function saveAddressToBackend(address) {
  writeStorage("checkoutAddress", address);

  if (!isLoggedIn()) {
    return address;
  }

  const response = await window.LibraryHubApi.request("/checkout/address", {
    method: "POST",
    body: JSON.stringify(address)
  });

  writeStorage("checkoutAddress", response.address);
  return response.address;
}

function calculateOrder(items) {
  const normalizedItems = items.map(function(item, index) {
    const quantityNode = index === 0 ? document.getElementById("checkoutQuantity") : null;
    const quantity = Number(quantityNode ? quantityNode.value : item.quantity || 1);
    return Object.assign({}, item, {
      quantity: Math.max(1, quantity)
    });
  });

  const feePerItem = 9;
  const pricing = normalizedItems.reduce(function(summary, item) {
    const basePrice = Number(item.price || 0);
    const mrpPerItem = Math.round(basePrice * 1.76);

    summary.mrp += mrpPerItem * item.quantity;
    summary.sellingPrice += basePrice * item.quantity;
    summary.fee += feePerItem * item.quantity;
    return summary;
  }, {
    mrp: 0,
    sellingPrice: 0,
    fee: 0
  });

  return {
    items: normalizedItems,
    quantity: normalizedItems.reduce(function(total, item) {
      return total + item.quantity;
    }, 0),
    mrp: pricing.mrp,
    sellingPrice: pricing.sellingPrice,
    fee: pricing.fee,
    total: pricing.sellingPrice + pricing.fee,
    discount: pricing.mrp - pricing.sellingPrice,
    emi: Math.max(99, Math.round((pricing.sellingPrice + pricing.fee) / 3))
  };
}

function updateSummary(order) {
  const summaryMrpNode = document.getElementById("summaryMrp");
  const summaryFeeNode = document.getElementById("summaryFee");
  const summaryDiscountNode = document.getElementById("summaryDiscount");
  const summaryTotalNode = document.getElementById("summaryTotal");
  const summarySavingsNode = document.getElementById("summarySavings");
  const footerMrpNode = document.getElementById("footerMrp");
  const footerTotalNode = document.getElementById("footerTotal");
  const payAmountNode = document.getElementById("payAmount");

  if (summaryMrpNode) summaryMrpNode.textContent = formatCurrency(order.mrp);
  if (summaryFeeNode) summaryFeeNode.textContent = formatCurrency(order.fee);
  if (summaryDiscountNode) summaryDiscountNode.textContent = "-" + formatCurrency(order.discount);
  if (summaryTotalNode) summaryTotalNode.textContent = formatCurrency(order.total);
  if (summarySavingsNode) summarySavingsNode.textContent = "You'll save " + formatCurrency(order.discount) + " on this order";
  if (footerMrpNode) footerMrpNode.textContent = formatCurrency(order.mrp);
  if (footerTotalNode) footerTotalNode.textContent = formatCurrency(order.total);
  if (payAmountNode) payAmountNode.textContent = formatCurrency(order.total);
}

function updateProductDetails(item, order) {
  const productName = document.getElementById("checkoutProductName");
  const mrpNode = document.getElementById("checkoutMrp");
  const sellingPriceNode = document.getElementById("checkoutSellingPrice");
  const feeNode = document.getElementById("checkoutFee");
  const emiNode = document.getElementById("checkoutEmi");
  const quantityNode = document.getElementById("checkoutQuantity");

  if (productName) {
    productName.textContent = order.items.length > 1
      ? item.name + " +" + (order.items.length - 1) + " more"
      : item.name;
  }
  if (mrpNode) mrpNode.textContent = formatCurrency(order.mrp);
  if (sellingPriceNode) sellingPriceNode.textContent = formatCurrency(order.sellingPrice);
  if (feeNode) feeNode.textContent = formatCurrency(order.fee);
  if (emiNode) emiNode.textContent = formatCurrency(order.emi);
  if (quantityNode) quantityNode.value = String(order.quantity);
}

function updateAddressDetails(address) {
  document.querySelectorAll('[data-address-field="name"]').forEach(function(node) {
    node.textContent = address.fullName;
  });
  document.querySelectorAll('[data-address-field="line"]').forEach(function(node) {
    node.textContent = address.line1;
  });
  document.querySelectorAll('[data-address-field="phone"]').forEach(function(node) {
    node.textContent = address.phone;
  });
  document.querySelectorAll('[data-address-field="label"]').forEach(function(node) {
    node.textContent = address.label;
  });
}

function updatePaymentReview(payment) {
  const reviewMethodNode = document.getElementById("reviewMethod");
  const reviewDetailNode = document.getElementById("reviewDetail");

  if (!reviewMethodNode || !reviewDetailNode) {
    return;
  }

  const labels = {
    upi: "UPI",
    card: "Card",
    cod: "Cash on Delivery"
  };

  reviewMethodNode.textContent = labels[payment.method] || "UPI";
  if (payment.method === "upi") {
    reviewDetailNode.textContent = payment.upiId || fallbackPayment.upiId;
  } else if (payment.method === "card") {
    reviewDetailNode.textContent = "Ending in " + (payment.cardLast4 || "4242");
  } else {
    reviewDetailNode.textContent = "Pay when your order arrives";
  }
}

function syncItemQuantity(item, order) {
  const updatedItems = order.items.map(function(entry, index) {
    if (index > 0) {
      return entry;
    }

    return Object.assign({}, entry, {
      productId: item.productId || entry.productId || "",
      image: item.image || entry.image || "",
      category: item.category || entry.category || ""
    });
  });

  writeStorage("checkoutItems", updatedItems);
  writeStorage("checkoutItem", updatedItems[0]);
}

async function setupAddressPage() {
  const form = document.getElementById("addressForm");
  const continueButtons = document.querySelectorAll("[data-checkout-next-order]");
  const address = await getSavedAddress();
  const items = getCheckoutItems();
  const item = items[0];
  const order = calculateOrder(items);

  updateAddressDetails(address);
  updateSummary(order);
  updateProductDetails(item, order);

  if (!form) {
    return;
  }

  form.fullName.value = address.fullName;
  form.addressLine.value = address.line1;
  form.phone.value = address.phone;

  async function saveAddress() {
    const updatedAddress = {
      fullName: form.fullName.value.trim() || fallbackAddress.fullName,
      line1: form.addressLine.value.trim() || fallbackAddress.line1,
      phone: form.phone.value.trim() || fallbackAddress.phone,
      label: "HOME"
    };

    const savedAddress = await saveAddressToBackend(updatedAddress);
    updateAddressDetails(savedAddress);
  }

  form.addEventListener("submit", async function(event) {
    event.preventDefault();
    await saveAddress();
    window.location.href = "order.html";
  });

  continueButtons.forEach(function(button) {
    button.addEventListener("click", async function() {
      await saveAddress();
      window.location.href = "order.html";
    });
  });
}

async function setupOrderPage() {
  const items = getCheckoutItems();
  const item = items[0];
  const address = await getSavedAddress();
  const quantityNode = document.getElementById("checkoutQuantity");
  const continueButton = document.getElementById("continueToPayment");
  let order = calculateOrder(items);

  updateAddressDetails(address);
  updateProductDetails(item, order);
  updateSummary(order);

  if (quantityNode) {
    quantityNode.value = String(item.quantity || 1);
    quantityNode.addEventListener("change", function() {
      order = calculateOrder(items);
      updateProductDetails(item, order);
      updateSummary(order);
      syncItemQuantity(item, order);
    });
  }

  if (continueButton) {
    continueButton.addEventListener("click", function() {
      order = calculateOrder(items);
      syncItemQuantity(item, order);
      window.location.href = "payment.html";
    });
  }
}

async function setupPaymentPage() {
  const items = getCheckoutItems();
  const item = items[0];
  const address = await getSavedAddress();
  const payment = getCheckoutPayment();
  const order = calculateOrder(items);
  const form = document.getElementById("paymentForm");
  const placeOrderButton = document.getElementById("placeOrderButton");
  const methodNodes = document.querySelectorAll('input[name="paymentMethod"]');

  updateAddressDetails(address);
  updateProductDetails(item, order);
  updateSummary(order);
  updatePaymentReview(payment);

  methodNodes.forEach(function(node) {
    if (node.value === payment.method) {
      node.checked = true;
    }
  });

  function savePayment() {
    const selectedNode = document.querySelector('input[name="paymentMethod"]:checked');
    const selectedMethod = selectedNode ? selectedNode.value : "upi";
    const paymentPayload = {
      method: selectedMethod,
      upiId: document.getElementById("upiId") ? document.getElementById("upiId").value.trim() || fallbackPayment.upiId : fallbackPayment.upiId,
      cardLast4: document.getElementById("cardNumber") ? (document.getElementById("cardNumber").value.trim().slice(-4) || "4242") : "4242"
    };

    writeStorage("checkoutPayment", paymentPayload);
    updatePaymentReview(paymentPayload);
    return paymentPayload;
  }

  if (form) {
    form.addEventListener("submit", function(event) {
      event.preventDefault();
      savePayment();
      alert("Payment details saved.");
    });
  }

  if (placeOrderButton) {
    placeOrderButton.addEventListener("click", async function() {
      const paymentPayload = savePayment();
      if (isLoggedIn()) {
        try {
          const latestOrder = calculateOrder(getCheckoutItems());
          const response = await window.LibraryHubApi.request("/orders", {
            method: "POST",
            body: JSON.stringify({
              items: latestOrder.items,
              shippingAddress: address,
              paymentMethod: paymentPayload.method,
              paymentDetails: paymentPayload
            })
          });

          alert(
            "Order placed successfully\nOrder ID: " +
            response.order.id +
            "\nTotal: " +
            formatCurrency(response.order.pricing.total)
          );
        } catch (error) {
          alert(error.message);
          return;
        }
      } else {
        alert(
          "Guest order summary\nItems: " +
          order.items.map(function(entry) {
            return entry.name + " x " + entry.quantity;
          }).join(", ") +
          "\nShip to: " +
          address.fullName +
          "\nPayment: " +
          paymentPayload.method.toUpperCase() +
          "\nTotal: " +
          formatCurrency(order.total) +
          "\n\nLog in to save orders on the backend."
        );
      }

      localStorage.removeItem("checkoutItem");
      localStorage.removeItem("checkoutItems");
      localStorage.removeItem("checkoutAddress");
      localStorage.removeItem("checkoutPayment");
      localStorage.removeItem("cart");
      window.location.href = "index.html";
    });
  }
}

const checkoutStep = document.body.dataset.checkoutStep;

if (checkoutStep === "address") {
  setupAddressPage();
}

if (checkoutStep === "order") {
  setupOrderPage();
}

if (checkoutStep === "payment") {
  setupPaymentPage();
}
