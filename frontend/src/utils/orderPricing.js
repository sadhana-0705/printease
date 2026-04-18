export function calculateDocumentTotal(doc = {}) {
  const copies = Number.isFinite(doc.copies) ? doc.copies : 1;
  const pages = Number.isFinite(doc.pages) ? doc.pages : 1;
  const costPerPage = Number.isFinite(doc.costPerPage) ? doc.costPerPage : 0;
  const colorCost = Number.isFinite(doc.colorCost) ? doc.colorCost : 0;
  const bindingCost = Number.isFinite(doc.bindingCost) ? doc.bindingCost : 0;

  let total = pages * copies * costPerPage;

  if (doc.color) {
    total += pages * copies * colorCost;
  }

  if (doc.binding) {
    total += bindingCost;
  }

  return total;
}

export function calculateOrderTotalFromOrder(order = {}) {
  const documents = Array.isArray(order.documents) ? order.documents : [];
  const calculatedTotal = documents.reduce(
    (sum, doc) => sum + calculateDocumentTotal(doc),
    0
  );

  return calculatedTotal || order.totalCost || 0;
}
