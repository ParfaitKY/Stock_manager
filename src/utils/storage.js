/**
 * localStorage utility functions for managing products and stock movements
 */

// Initialize localStorage with default data if empty
const initializeStorage = () => {
  if (!localStorage.getItem('products')) {
    localStorage.setItem('products', JSON.stringify([]));
  }
  
  if (!localStorage.getItem('stockMovements')) {
    localStorage.setItem('stockMovements', JSON.stringify([]));
  }
};

// Get all products from localStorage
export const getProducts = () => {
  initializeStorage();
  return JSON.parse(localStorage.getItem('products')) || [];
};

// Save products to localStorage
export const saveProducts = (products) => {
  localStorage.setItem('products', JSON.stringify(products));
};

// Get all stock movements from localStorage
export const getStockMovements = () => {
  initializeStorage();
  return JSON.parse(localStorage.getItem('stockMovements')) || [];
};

// Save stock movements to localStorage
export const saveStockMovements = (movements) => {
  localStorage.setItem('stockMovements', JSON.stringify(movements));
};

// Update product quantity when a stock movement occurs
export const updateProductQuantity = (productId, quantityChange) => {
  const products = getProducts();
  const productIndex = products.findIndex(p => p.id === productId);
  
  if (productIndex === -1) {
    console.error(`Product with ID ${productId} not found.`);
    return false;
  }
  
  const product = products[productIndex];
  const newQuantity = product.quantity + quantityChange;
  
  // Prevent negative stock (except when we're explicitly tracking it)
  if (newQuantity < 0 && quantityChange < 0) {
    console.error('Cannot reduce stock below zero.');
    return false;
  }
  
  // Update product quantity
  products[productIndex] = {
    ...product,
    quantity: newQuantity
  };
  
  // Save updated products
  saveProducts(products);
  return true;
};

// Get count of products below threshold
export const getLowStockProductsCount = () => {
  const products = getProducts();
  return products.filter(product => product.quantity < product.minThreshold).length;
};

// Calculate total product value (inventory worth)
export const calculateInventoryValue = () => {
  const products = getProducts();
  return products.reduce((total, product) => {
    return total + (product.quantity * product.buyPrice);
  }, 0);
};

// Calculate potential sales value
export const calculatePotentialSalesValue = () => {
  const products = getProducts();
  return products.reduce((total, product) => {
    return total + (product.quantity * product.sellPrice);
  }, 0);
};

// Calculate potential profit
export const calculatePotentialProfit = () => {
  return calculatePotentialSalesValue() - calculateInventoryValue();
};