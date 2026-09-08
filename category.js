const API_URL = "https://script.google.com/macros/s/AKfycbyZbtczY40JhKl4Q3FIUcqFAzX_fbVJPJe6IA_eAueRy3BJx2ciRCN8YxB88kiZqAUEmA/exec"; // Replace with your Google Apps Script URL
const PHONE_NUMBER = "919668757792"; // Replace with your WhatsApp number (e.g., 1234567890)

// Main initializer for Category Page
async function loadCategoryPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const selectedCategory = urlParams.get('cat');

  if (!selectedCategory) {
    window.location.href = "index.html";
    return;
  }

  document.getElementById("category-title").innerText = selectedCategory;

  try {
    const res = await fetch(API_URL);
    const products = await res.json();
    
    // Filter items matching the category from URL query parameter
    const categoryProducts = products.filter(p => p.category === selectedCategory);
    const container = document.getElementById("category-products-container");

    if (categoryProducts.length === 0) {
      container.innerHTML = "<p>No products found in this category.</p>";
      return;
    }

    container.innerHTML = renderProductGrid(categoryProducts);

  } catch (err) {
    console.error("Error loading category page:", err);
  }
}

// Generate Product Card HTML (Clicking opens Modal)
function renderProductGrid(items) {
  if (!items || items.length === 0) return "<p>No items found.</p>";

  return items.map(p => {
    const imageArray = (p.images && p.images.length > 0) ? p.images : ["https://via.placeholder.com/200"];
    const mainImg = imageArray[0];

    const productData = JSON.stringify(p).replace(/'/g, "&apos;");

    return `
      <div class="card" onclick='openModal(${productData})'>
        <img src="${mainImg}" alt="${p.name}" class="main-card-img" loading="lazy">
        <h3>${p.name}</h3>
        <p class="card-desc">${p.description}</p>
        <div class="price">$${p.rate}</div>
      </div>
    `;
  }).join('');
}

// Modal (Popup) Functions
function openModal(product) {
  const modal = document.getElementById("product-modal");
  
  // Fill text details
  document.getElementById("modal-name").innerText = product.name;
  document.getElementById("modal-price").innerText = `$${product.rate}`;
  document.getElementById("modal-desc").innerText = product.description;
  
  // Set up Buy Button inside Modal
  document.getElementById("modal-buy-container").innerHTML = `
    <button class="buy-btn" onclick="buyOnWhatsApp('${escapeQuotes(product.name)}', '${product.rate}')">
      Buy via WhatsApp
    </button>
  `;

  // Gallery Logic: Set main image
  const imageArray = (product.images && product.images.length > 0) ? product.images : ["https://via.placeholder.com/200"];
  const mainImg = document.getElementById("modal-main-img");
  mainImg.src = imageArray[0];

  // Gallery Logic: Build interactive thumbnails
  const thumbContainer = document.getElementById("modal-thumbnails");
  thumbContainer.innerHTML = ""; // Clear existing thumbnails

  if (imageArray.length > 1) {
    imageArray.forEach((imgUrl, index) => {
      const thumb = document.createElement("img");
      thumb.src = imgUrl;
      thumb.className = `thumb ${index === 0 ? 'active' : ''}`;
      thumb.onclick = function(e) {
        e.stopPropagation();
        mainImg.src = imgUrl; // Switch large image on click
        thumbContainer.querySelectorAll('.thumb').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
      };
      thumbContainer.appendChild(thumb);
    });
  }

  // Display the modal
  modal.classList.add("open");
}

function closeModal() {
  const modal = document.getElementById("product-modal");
  if (modal) modal.classList.remove("open");
}

// Close Modal when clicking outside content area
window.onclick = function(event) {
  const modal = document.getElementById("product-modal");
  if (event.target === modal) {
    closeModal();
  }
};

// WhatsApp Redirect Function
function buyOnWhatsApp(name, rate) {
  const message = `Hello! I would like to order:\n- Item: ${name}\n- Price: $${rate}`;
  window.open(`https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
}

// Helper to escape single quotes in product names
function escapeQuotes(text) {
  return text.replace(/'/g, "\\'");
}

// Run on page load
document.addEventListener("DOMContentLoaded", loadCategoryPage);