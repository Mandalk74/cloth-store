const API_URL = "https://script.google.com/macros/s/AKfycbyZbtczY40JhKl4Q3FIUcqFAzX_fbVJPJe6IA_eAueRy3BJx2ciRCN8YxB88kiZqAUEmA/exec"; // Replace with your Google Apps Script URL
const PHONE_NUMBER = "919668757792"; // Replace with your WhatsApp number (e.g., 1234567890)

// Main initializer for Home Page
async function loadHomePage() {
  try {
    const res = await fetch(API_URL);
    const products = await res.json();

    // 1. Render Special Offers Banner
    const offers = products.filter(p => p.isOffer);
    document.getElementById("offers-container").innerHTML = renderProductGrid(offers);

    // 2. Group Products by Category
    const categories = [...new Set(products.map(p => p.category))];
    const wrapper = document.getElementById("categories-wrapper");
    wrapper.innerHTML = "";

    categories.forEach(cat => {
      // Limit to 4 items per category on the Home Page
      const catProducts = products.filter(p => p.category === cat).slice(0, 4);

      const section = document.createElement("section");
      section.className = "section-container";
      section.innerHTML = `
        <div class="category-header">
          <h2>${cat}</h2>
          <a href="category.html?cat=${encodeURIComponent(cat)}" class="show-more-link">Show More &rarr;</a>
        </div>
        <div class="grid">${renderProductGrid(catProducts)}</div>
      `;
      wrapper.appendChild(section);
    });

  } catch (err) {
    console.error("Error loading home page:", err);
  }
}

// Generate Product Card HTML (Clicking opens Modal)
function renderProductGrid(items) {
  if (!items || items.length === 0) return "<p>No items found.</p>";

  return items.map(p => {
    // Select first image for card cover
    const imageArray = (p.images && p.images.length > 0) ? p.images : ["https://via.placeholder.com/200"];
    const mainImg = imageArray[0];

    // Safely encode product JSON data for inline onclick handler
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
document.addEventListener("DOMContentLoaded", loadHomePage);