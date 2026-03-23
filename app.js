document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const searchButton = document.getElementById("searchButton");
  const clearSearchButton = document.getElementById("clearSearchButton");
  const searchFeedback = document.getElementById("searchFeedback");
  const searchHeading = document.getElementById("searchHeading");
  const searchMeta = document.getElementById("searchMeta");
  const productCards = Array.from(document.querySelectorAll(".searchable-product"));
  const sections = Array.from(document.querySelectorAll(".searchable-section"));

  if (!searchInput || !searchButton || productCards.length === 0) {
    return;
  }

  function normalize(value) {
    return value.toLowerCase().trim();
  }

  function runSearch() {
    const query = normalize(searchInput.value);
    let totalMatches = 0;

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
});
