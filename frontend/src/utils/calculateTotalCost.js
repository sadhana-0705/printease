export function calculateTotalCost(cp, pages, copies, color, binding, colorCost, bindingCost) {
  if (!cp || !pages || !copies) return 0;
  
  // Base cost: cost per page * pages * copies
  let total = cp * pages * copies;
  
  // Additional cost for color
  if (color === "color") {
    total += colorCost * pages * copies;
  }
  
  // Additional cost for binding
  if (binding === "yes") {
    total += bindingCost;
  }
  
  return total;
}
