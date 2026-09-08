// Replace with your Google Apps Script Web App URL
const API_URL = "https://script.google.com/macros/s/AKfycbyZbtczY40JhKl4Q3FIUcqFAzX_fbVJPJe6IA_eAueRy3BJx2ciRCN8YxB88kiZqAUEmA/exec"; 

// Replace with your WhatsApp number including country code (no '+' or spaces, e.g., 1234567890)
const PHONE_NUMBER = "919668757792"; 

// Fetch product data from Google Sheets API
async function fetchProducts() {
  const container = document.getElementById("product-container");

  try {
    const res = await fetch(API_URL);
    const products = await res.json();
    
    if (!products || products.length === 0) {
      container.innerHTML = "<p>No products available right now.</p>";
      return;
    }

    container.innerHTML = products.map(product => `
      <div class="card">
        <img src="${product.image}" alt="${product.name}" loading="lazy">
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <div class="price">$${product.rate}</div>
        <button onclick="buyOnWhatsApp('${escapeQuotes(product.name)}', '${product.rate}')">
          Buy via WhatsApp
        </button>
      </div>
    `).join('');
  } catch (error) {
    console.error("Error loading products:", error);
    container.innerHTML = "<p>Failed to load products. Check your API URL.</p>";
  }
}

// Redirect user to WhatsApp with a pre-filled message
function buyOnWhatsApp(name, rate) {
  const message = `Hello! I would like to order:\n- Item: ${name}\n- Price: $${rate}`;
  const url = `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
}

// Helper function to handle single quotes in product names safely
function escapeQuotes(text) {
  return text.replace(/'/g, "\\'");
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", fetchProducts);