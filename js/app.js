(function () {
  const searchInput = document.querySelector("#category-search");
  const cards = Array.from(document.querySelectorAll(".category-card"));
  const emptyState = document.querySelector("#empty-state");

  if (!searchInput || cards.length === 0) {
    return;
  }

  console.info("KZ Support Reference app loaded.");

  searchInput.addEventListener("input", function () {
    const query = searchInput.value.trim().toLowerCase();
    let visibleCount = 0;

    cards.forEach(function (card) {
      const text = card.textContent.toLowerCase();
      const isMatch = text.includes(query);

      card.hidden = !isMatch;

      if (isMatch) {
        visibleCount += 1;
      }
    });

    if (emptyState) {
      emptyState.hidden = visibleCount > 0;
    }
  });
})();
