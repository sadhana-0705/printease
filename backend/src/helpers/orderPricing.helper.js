function normalizeNumber(value, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function normalizeDocumentForPricing(doc = {}) {
  return {
    fileUrl: doc.fileUrl || "",
    fileType: doc.fileType || "pdf",
    copies: Math.max(1, normalizeNumber(doc.copies, 1)),
    color: Boolean(doc.color),
    sides: doc.sides || "single",
    pages: Math.max(1, normalizeNumber(doc.pages, 1)),
    costPerPage: Math.max(0, normalizeNumber(doc.costPerPage, 0)),
    colorCost: Math.max(0, normalizeNumber(doc.colorCost, 0)),
    bindingCost: Math.max(0, normalizeNumber(doc.bindingCost, 0)),
    binding: Boolean(doc.binding)
  };
}

function calculateDocumentTotal(doc = {}) {
  const normalizedDoc = normalizeDocumentForPricing(doc);

  let total =
    normalizedDoc.pages *
    normalizedDoc.copies *
    normalizedDoc.costPerPage;

  if (normalizedDoc.color) {
    total +=
      normalizedDoc.pages *
      normalizedDoc.copies *
      normalizedDoc.colorCost;
  }

  if (normalizedDoc.binding) {
    total += normalizedDoc.bindingCost;
  }

  return total;
}

function calculateOrderTotal(documents = []) {
  return documents.reduce(
    (sum, doc) => sum + calculateDocumentTotal(doc),
    0
  );
}

module.exports = {
  normalizeDocumentForPricing,
  calculateDocumentTotal,
  calculateOrderTotal
};
