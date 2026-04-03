document.addEventListener("DOMContentLoaded", function() {
  var form = document.getElementById("addProductForm");
  var messageNode = document.getElementById("addProductMessage");
  var saveButton = document.getElementById("saveProductButton");

  if (!form || !messageNode || !saveButton || !window.LibraryHubApi) {
    return;
  }

  function showMessage(type, text) {
    messageNode.hidden = false;
    messageNode.className = "form-message " + type;
    messageNode.textContent = text;
  }

  form.addEventListener("reset", function() {
    messageNode.hidden = true;
    messageNode.textContent = "";
    messageNode.className = "form-message";
  });

  form.addEventListener("submit", async function(event) {
    event.preventDefault();

    var formData = new FormData(form);
    var payload = {
      productId: String(formData.get("productId") || "").trim(),
      name: String(formData.get("name") || "").trim(),
      category: String(formData.get("category") || "").trim(),
      price: Number(formData.get("price")),
      badge: String(formData.get("badge") || "").trim(),
      description: String(formData.get("description") || "").trim(),
      image: String(formData.get("image") || "").trim(),
      inventory: Number(formData.get("inventory") || 0),
      rating: String(formData.get("rating") || "").trim() === "" ? 0 : Number(formData.get("rating"))
    };

    saveButton.disabled = true;
    showMessage("pending", "Product MongoDB me save ho raha hai...");

    try {
      var response = await window.LibraryHubApi.request("/products", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      form.reset();
      showMessage("success", 'Product "' + response.product.name + '" successfully add ho gaya. ID: ' + response.product.id);
    } catch (error) {
      showMessage("error", error.message);
    } finally {
      saveButton.disabled = false;
    }
  });
});
