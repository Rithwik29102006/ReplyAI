// Business Type Templates
const BUSINESS_TEMPLATES = {
  Bakery: (data) => `You are AI assistant for ${data.businessName}. We sell custom cakes, cupcakes and baked goods. ${data.products}. Delivery in ${data.deliveryArea} for ₹${data.deliveryCharge}. ${data.advanceNotice} advance notice needed. Working hours: ${data.workingHours}.`,
  'Tiffin Service': (data) => `You are AI assistant for ${data.businessName}. We provide home-cooked tiffin meals. ${data.products}. Delivery in ${data.deliveryArea}. Order by 9 AM for same-day delivery. Working hours: ${data.workingHours}.`,
  Boutique: (data) => `You are AI assistant for ${data.businessName}. We sell ${data.products}. COD available. Delivery pan India. Custom stitching available. Working hours: ${data.workingHours}.`,
  Salon: (data) => `You are AI assistant for ${data.businessName}. We offer ${data.products}. Prior appointment needed. Working hours: ${data.workingHours}. Located in ${data.deliveryArea}.`,
  'Tuition Center': (data) => `You are AI assistant for ${data.businessName}. We offer coaching for ${data.products}. Demo class free. Working hours: ${data.workingHours}. Located in ${data.deliveryArea}.`,
  'Event Decorator': (data) => `You are AI assistant for ${data.businessName}. We provide event decoration. ${data.products}. Delivery in ${data.deliveryArea}. Working hours: ${data.workingHours}.`,
  Freelancer: (data) => `You are AI assistant for ${data.businessName}, run by ${data.ownerName}. ${data.products}. Working hours: ${data.workingHours}.`,
  Other: (data) => `You are AI assistant for ${data.businessName}. ${data.products}. Working hours: ${data.workingHours}.`
};

// Default products by business type
const DEFAULT_PRODUCTS = {
  Bakery: [
    { name: 'Chocolate Cake', price: '₹450', description: 'Rich chocolate layered cake' },
    { name: 'Vanilla Cupcake', price: '₹50', description: 'Fluffy vanilla cupcake' },
    { name: 'Red Velvet Cake', price: '₹550', description: 'Classic red velvet with cream cheese' }
  ],
  'Tiffin Service': [
    { name: 'Veg Thali', price: '₹120', description: 'Rice, dal, sabzi, roti' },
    { name: 'Non-Veg Thali', price: '₹150', description: 'Rice, dal, chicken, roti' },
    { name: 'Tiffin Box', price: '₹100', description: 'Compact meal for office' }
  ],
  Boutique: [
    { name: 'Kurti', price: '₹800', description: 'Hand embroidered kurti' },
    { name: 'Saree', price: '₹2,500', description: 'Pure silk saree' },
    { name: 'Lehenga', price: '₹5,000', description: 'Bridal lehenga' }
  ],
  Salon: [
    { name: 'Haircut', price: '₹300', description: 'Standard haircut & styling' },
    { name: 'Hair Spa', price: '₹500', description: 'Rejuvenating hair spa' },
    { name: 'Facial', price: '₹800', description: 'Gold facial treatment' }
  ],
  'Tuition Center': [
    { name: 'Maths Class', price: '₹500/month', description: 'Weekly classes' },
    { name: 'Science Class', price: '₹500/month', description: 'Weekly classes' },
    { name: 'English Class', price: '₹400/month', description: 'Weekly classes' }
  ],
  'Event Decorator': [
    { name: 'Birthday Decoration', price: '₹2,000', description: 'Full theme decoration' },
    { name: 'Wedding Decoration', price: '₹15,000', description: 'Complete wedding setup' },
    { name: 'Corporate Event', price: '₹5,000', description: 'Office party decoration' }
  ],
  Freelancer: [
    { name: 'Consultation', price: '₹500/hour', description: 'Professional consultation' },
    { name: 'Service Booking', price: '₹1,000', description: 'Standard service' }
  ],
  Other: [
    { name: 'Service 1', price: '₹500', description: 'Main service offering' }
  ]
};

// Sample Groq API key
let groqApiKey = 'gsk_T1cjz5M3sXvUU0wzMrMBWGdyb3FYXkh';

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  renderIngredients();
  checkOnboarding();
});

// Check if onboarding is needed
function checkOnboarding() {
  const configured = localStorage.getItem('businessConfigured');
  if (!configured) {
    showOnboardingModal();
  } else {
    loadBusinessConfig();
    loadData();
    setInterval(loadData, 30000);
  }
}

// Show the onboarding modal
function showOnboardingModal() {
  const modal = document.getElementById('onboarding-modal');
  if (modal) {
    modal.style.display = 'flex';
    modal.classList.add('show');
  }
}

// Load business config and update dashboard branding
function loadBusinessConfig() {
  const name = localStorage.getItem('businessName') || "Priya's Atelier";
  const type = localStorage.getItem('businessType') || 'Bakery';
  const owner = localStorage.getItem('ownerName') || 'P';
  
  const brand = document.querySelector('.brand');
  if (brand) brand.textContent = name;
  
  const sideH2 = document.querySelector('.side-header h2');
  if (sideH2) sideH2.textContent = name;
  
  const sideP = document.querySelector('.side-header p');
  if (sideP) sideP.textContent = type.toUpperCase() + ' DASHBOARD';
  
  const avatar = document.querySelector('.avatar');
  if (avatar) avatar.textContent = owner.charAt(0).toUpperCase();
  
  // Animate counters after data loads
  setTimeout(animateCounters, 500);
}

// Complete onboarding - called by Launch Dashboard button
function completeOnboarding() {
  const businessName = document.getElementById('input-business-name')?.value?.trim();
  const businessType = document.getElementById('input-business-type')?.value;
  const ownerName = document.getElementById('input-owner-name')?.value?.trim();
  const whatsapp = document.getElementById('input-whatsapp-number')?.value?.trim();
  const workingHours = document.getElementById('input-working-hours')?.value?.trim();
  const deliveryArea = document.getElementById('input-delivery-area')?.value?.trim();
  const deliveryCharge = document.getElementById('input-delivery-charge')?.value?.trim();
  
  if (!businessName) {
    toast('Please enter your business name', 'error');
    return;
  }
  
  localStorage.setItem('businessConfigured', 'true');
  localStorage.setItem('businessName', businessName);
  localStorage.setItem('businessType', businessType);
  localStorage.setItem('ownerName', ownerName);
  localStorage.setItem('whatsappNumber', whatsapp);
  localStorage.setItem('workingHours', workingHours);
  localStorage.setItem('deliveryArea', deliveryArea);
  localStorage.setItem('deliveryCharge', deliveryCharge);
  
  const modal = document.getElementById('onboarding-modal');
  if (modal) {
    modal.style.display = 'none';
    modal.classList.remove('show');
  }
  
  loadBusinessConfig();
  loadData();
  setInterval(loadData, 30000);
  toast('Welcome to your dashboard! 🚀');
}

// Reset onboarding - clears localStorage and reloads
function resetOnboarding() {
  if (confirm('Reset business configuration? Dashboard will reload.')) {
    localStorage.clear();
    location.reload();
  }
}

// Onboarding step navigation
function nextOnboardingStep(step) {
  if (step === 2) {
    const businessName = document.getElementById('input-business-name').value;
    const businessType = document.getElementById('input-business-type').value;
    if (!businessName || !businessType) {
      toast('Please fill in all required fields', 'error');
      return;
    }
  }
  
  // Hide all steps
  for (let i = 1; i <= 4; i++) {
    document.getElementById(`onboarding-step-${i}`).style.display = 'none';
    document.getElementById(`step-indicator-${i}`).classList.remove('active');
  }
  
  // Show current step
  document.getElementById(`onboarding-step-${step}`).style.display = 'block';
  document.getElementById(`step-indicator-${step}`).classList.add('active');
  
  // If going to step 2, populate products
  if (step === 2) {
    const businessType = document.getElementById('input-business-type').value;
    populateProductsList(businessType);
  }
  
  // If going to step 3, show/hide eggless option
  if (step === 3) {
    const businessType = document.getElementById('input-business-type').value;
    const egglessField = document.getElementById('eggless-field');
    if (businessType === 'Bakery' || businessType === 'Tiffin Service') {
      egglessField.style.display = 'flex';
    } else {
      egglessField.style.display = 'none';
    }
  }
  
  // If going to step 4, show summary
  if (step === 4) {
    showOnboardingSummary();
  }
}

// Populate products list with defaults
function populateProductsList(businessType) {
  const products = DEFAULT_PRODUCTS[businessType] || DEFAULT_PRODUCTS.Other;
  const container = document.getElementById('products-list');
  container.innerHTML = products.map(p => `
    <div class="product-row">
      <input type="text" placeholder="Product/Service Name" class="product-name" value="${p.name}">
      <input type="text" placeholder="Price" class="product-price" value="${p.price}">
      <input type="text" placeholder="Description" class="product-desc" value="${p.description}">
    </div>
  `).join('');
}

// Add product row
function addProductRow() {
  const container = document.getElementById('products-list');
  const row = document.createElement('div');
  row.className = 'product-row';
  row.innerHTML = `
    <input type="text" placeholder="Product/Service Name" class="product-name">
    <input type="text" placeholder="Price" class="product-price">
    <input type="text" placeholder="Description" class="product-desc">
  `;
  container.appendChild(row);
}

// Business type change handler
function onBusinessTypeChange(type) {
  // Could trigger auto-fill here if needed
}

// Show onboarding summary
function showOnboardingSummary() {
  const businessName = document.getElementById('input-business-name').value;
  const businessType = document.getElementById('input-business-type').value;
  const ownerName = document.getElementById('input-owner-name').value;
  const whatsapp = document.getElementById('input-whatsapp-number').value;
  const hours = document.getElementById('input-working-hours').value;
  
  // Get products
  const productRows = document.querySelectorAll('.product-row');
  const products = [];
  productRows.forEach(row => {
    const name = row.querySelector('.product-name').value;
    const price = row.querySelector('.product-price').value;
    if (name) products.push(`${name} (${price})`);
  });
  
  const deliveryArea = document.getElementById('input-delivery-area').value;
  const deliveryCharge = document.getElementById('input-delivery-charge').value;
  const advanceNotice = document.getElementById('input-advance-notice').value;
  
  const html = `
    <div class="onboarding-summary-item">
      <div class="onboarding-summary-label">Business</div>
      <div class="onboarding-summary-value">${businessName} (${businessType})</div>
    </div>
    <div class="onboarding-summary-item">
      <div class="onboarding-summary-label">Owner</div>
      <div class="onboarding-summary-value">${ownerName}</div>
    </div>
    <div class="onboarding-summary-item">
      <div class="onboarding-summary-label">Contact</div>
      <div class="onboarding-summary-value">${whatsapp} | ${hours}</div>
    </div>
    <div class="onboarding-summary-item">
      <div class="onboarding-summary-label">Products (${products.length})</div>
      <div class="onboarding-summary-value">${products.slice(0, 3).join(', ')}${products.length > 3 ? '...' : ''}</div>
    </div>
    <div class="onboarding-summary-item">
      <div class="onboarding-summary-label">Delivery</div>
      <div class="onboarding-summary-value">${deliveryArea || 'Not set'} | ₹${deliveryCharge || '0'}</div>
    </div>
  `;
  
  document.getElementById('onboarding-summary').innerHTML = html;
}

// Launch dashboard
function launchDashboard() {
  const data = {
    businessName: document.getElementById('input-business-name').value,
    businessType: document.getElementById('input-business-type').value,
    ownerName: document.getElementById('input-owner-name').value,
    whatsappNumber: document.getElementById('input-whatsapp-number').value,
    workingHours: document.getElementById('input-working-hours').value,
    deliveryArea: document.getElementById('input-delivery-area').value,
    deliveryCharge: document.getElementById('input-delivery-charge').value,
    advanceNotice: document.getElementById('input-advance-notice').value,
    specialInstructions: document.getElementById('input-special-instructions').value,
    egglessAvailable: document.getElementById('input-eggless')?.checked || false
  };
  
  // Get products
  const productRows = document.querySelectorAll('.product-row');
  const products = [];
  productRows.forEach(row => {
    const name = row.querySelector('.product-name').value;
    const price = row.querySelector('.product-price').value;
    const desc = row.querySelector('.product-desc').value;
    if (name) products.push({ name, price, description: desc });
  });
  data.products = JSON.stringify(products);
  
  // Save to localStorage
  Object.keys(data).forEach(key => {
    localStorage.setItem(key, data[key]);
  });
  localStorage.setItem('businessConfigured', 'true');
  
  // Generate system prompt
  const systemPrompt = BUSINESS_TEMPLATES[data.businessType] ? BUSINESS_TEMPLATES[data.businessType](data) : BUSINESS_TEMPLATES.Other(data);
  localStorage.setItem('systemPrompt', systemPrompt);
  
  // Close onboarding
  document.getElementById('onboarding-modal').style.display = 'none';
  
  // Load business config and data
  loadBusinessConfig();
  loadData();
  
  toast('Welcome to ReplyAI! 🚀');
}

// Impact Screen functions
function openImpactScreen() {
  document.getElementById('impact-overlay').classList.add('show');
  updateROI();
}

function closeImpactScreen() {
  document.getElementById('impact-overlay').classList.remove('show');
}

function updateROI() {
  const messages = parseInt(document.getElementById('roi-messages').value);
  const orderValue = parseInt(document.getElementById('roi-order-value').value);
  const dropoff = parseInt(document.getElementById('roi-dropoff').value);
  
  document.getElementById('roi-messages-val').textContent = messages;
  document.getElementById('roi-order-val').textContent = '₹' + orderValue.toLocaleString();
  document.getElementById('roi-dropoff-val').textContent = dropoff + '%';
  
  // Calculate ROI
  const monthly = (messages * 30 * orderValue * dropoff / 100);
  const annual = monthly * 12;
  const hours = messages * 4 / 60 * 365; // Assuming 4 min per message
  
  document.getElementById('roi-monthly').textContent = '₹' + Math.round(monthly).toLocaleString();
  document.getElementById('roi-annual').textContent = '₹' + Math.round(annual).toLocaleString();
  document.getElementById('roi-hours').textContent = Math.round(hours).toLocaleString() + ' hours';
}

// WhatsApp Simulator functions
function saveGroqKey() {
  groqApiKey = document.getElementById('groq-api-key').value;
  localStorage.setItem('groqApiKey', groqApiKey);
  toast('API Key saved!');
}

function handleChatKeypress(e) {
  if (e.key === 'Enter') {
    sendChatMessage();
  }
}

function sendQuickMessage(msg) {
  document.getElementById('chat-input').value = msg;
  sendChatMessage();
}

function sendChatMessage() {
  const input = document.getElementById('chat-input');
  const message = input.value.trim();
  if (!message) return;
  
  // Add user message
  addChatBubble(message, 'customer');
  input.value = '';
  
  // Show typing indicator
  showTypingIndicator();
  
  // Call Groq API
  setTimeout(() => {
    callGroqAPI(message);
  }, 1000);
}

function addChatBubble(text, type) {
  const container = document.getElementById('chat-messages');
  
  // Remove empty message
  const empty = container.querySelector('.chat-empty');
  if (empty) empty.remove();
  
  const bubble = document.createElement('div');
  bubble.className = `chat-bubble ${type}`;
  
  if (type === 'customer') {
    bubble.textContent = text;
  } else {
    // AI message with avatar
    bubble.innerHTML = `
      <div class="chat-bubble-avatar">🤖</div>
      <div>${text}</div>
    `;
  }
  
  container.appendChild(bubble);
  container.scrollTop = container.scrollHeight;
}

function showTypingIndicator() {
  const container = document.getElementById('chat-messages');
  const typing = document.createElement('div');
  typing.className = 'chat-typing';
  typing.id = 'typing-indicator';
  typing.textContent = 'typing...';
  container.appendChild(typing);
  container.scrollTop = container.scrollHeight;
}

function hideTypingIndicator() {
  const typing = document.getElementById('typing-indicator');
  if (typing) typing.remove();
}

async function callGroqAPI(userMessage) {
  const apiKey = document.getElementById('groq-api-key').value || groqApiKey;
  
  const businessName = localStorage.getItem('businessName') || "Priya's Home Bakery";
  const businessType = localStorage.getItem('businessType') || 'Bakery';
  const products = localStorage.getItem('products') || 'Cakes from ₹450, Cupcakes ₹60, Brownies ₹120';
  const deliveryArea = localStorage.getItem('deliveryArea') || 'within 10km';
  const workingHours = localStorage.getItem('workingHours') || '9 AM - 8 PM';

  const systemPrompt = `You are a helpful customer service assistant for ${businessName}, a ${businessType} business. Products/Services: ${products}. Delivery: ${deliveryArea}. Hours: ${workingHours}. Reply in friendly conversational Indian English. Keep replies under 3 sentences. Classify intent as one of: PRICE/ORDER/DELIVERY/CUSTOMIZATION/AVAILABILITY/SUPPORT/MENU`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage }
  ];

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: messages,
        temperature: 0.7,
        max_tokens: 150
      })
    });

    hideTypingIndicator();

    if (!response.ok) {
      const err = await response.text();
      console.error('Groq error:', err);
      addChatBubble('API error: ' + response.status + '. Check your Groq API key.', 'ai');
      return;
    }

    const data = await response.json();

    if (data.choices && data.choices[0]) {
      const reply = data.choices[0].message.content;
      addChatBubble(reply, 'ai');

      // Detect intent
      const intent = detectIntent(userMessage, reply);
      if (intent) {
        showIntentBadge(intent);
      }
    } else {
      addChatBubble('Sorry, I could not process that request.', 'ai');
    }
  } catch (error) {
    hideTypingIndicator();
    addChatBubble('Connection error. Please check your internet.', 'ai');
    console.error('Simulator error:', error);
  }
}

function detectIntent(userMsg, aiMsg) {
  const msg = userMsg.toLowerCase();
  if (msg.includes('price') || msg.includes('cost') || msg.includes('how much')) return 'PRICE';
  if (msg.includes('order') || msg.includes('buy') || msg.includes('purchase')) return 'ORDER';
  if (msg.includes('deliver') || msg.includes('delivery') || msg.includes('ship')) return 'DELIVERY';
  if (msg.includes('flavor') || msg.includes('available') || msg.includes('option')) return 'AVAILABILITY';
  if (msg.includes('eggless') || msg.includes('vegan') || msg.includes('vegetarian')) return 'CUSTOMIZATION';
  if (msg.includes('custom') || msg.includes('personalize')) return 'CUSTOMIZATION';
  return null;
}

function showIntentBadge(intent) {
  const container = document.getElementById('chat-messages');
  const lastBubble = container.lastElementChild;
  if (lastBubble && lastBubble.classList.contains('chat-bubble')) {
    const badge = document.createElement('span');
    badge.className = 'chat-intent';
    badge.textContent = intent;
    lastBubble.appendChild(badge);
  }
}

function clearChat() {
  document.getElementById('chat-messages').innerHTML = '<div class="chat-empty">Start a conversation by typing a message or using quick-send buttons below.</div>';
}

// Social Impact Counter animation
function animateCounters() {
  const counters = document.querySelectorAll('.counter-value');
  counters.forEach(counter => {
    const target = parseInt(counter.dataset.target);
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;
    
    const update = () => {
      current += step;
      if (current < target) {
        counter.textContent = Math.floor(current).toLocaleString();
        requestAnimationFrame(update);
      } else {
        counter.textContent = target.toLocaleString();
      }
    };
    
    update();
  });
}

// Settings functions
function loadSettings() {
  document.getElementById('settings-business-name').value = localStorage.getItem('businessName') || '';
  document.getElementById('settings-business-type').value = localStorage.getItem('businessType') || 'Bakery';
  document.getElementById('settings-owner-name').value = localStorage.getItem('ownerName') || '';
  document.getElementById('settings-whatsapp').value = localStorage.getItem('whatsappNumber') || '';
  document.getElementById('settings-hours').value = localStorage.getItem('workingHours') || '';
  
  // Products
  const products = JSON.parse(localStorage.getItem('products') || '[]');
  renderSettingsProducts(products);
  
  document.getElementById('settings-delivery-area').value = localStorage.getItem('deliveryArea') || '';
  document.getElementById('settings-delivery-charge').value = localStorage.getItem('deliveryCharge') || '';
  document.getElementById('settings-advance-notice').value = localStorage.getItem('advanceNotice') || '';
  document.getElementById('settings-special-instructions').value = localStorage.getItem('specialInstructions') || '';
}

function renderSettingsProducts(products) {
  const container = document.getElementById('settings-products');
  if (!products.length) {
    container.innerHTML = '<p style="color:var(--text-muted)">No products added yet.</p>';
    return;
  }
  
  container.innerHTML = products.map((p, i) => `
    <div class="settings-field">
      <label>Product ${i + 1}</label>
      <input type="text" value="${p.name}" data-field="name-${i}">
      <input type="text" value="${p.price}" data-field="price-${i}" placeholder="Price">
      <input type="text" value="${p.description}" data-field="desc-${i}" placeholder="Description">
    </div>
  `).join('');
}

function addSettingsProductRow() {
  const container = document.getElementById('settings-products');
  const count = container.querySelectorAll('.settings-field').length + 1;
  const field = document.createElement('div');
  field.className = 'settings-field';
  field.innerHTML = `
    <label>Product ${count}</label>
    <input type="text" placeholder="Product name">
    <input type="text" placeholder="Price">
    <input type="text" placeholder="Description">
  `;
  container.appendChild(field);
}

function saveSettings() {
  localStorage.setItem('businessName', document.getElementById('settings-business-name').value);
  localStorage.setItem('businessType', document.getElementById('settings-business-type').value);
  localStorage.setItem('ownerName', document.getElementById('settings-owner-name').value);
  localStorage.setItem('whatsappNumber', document.getElementById('settings-whatsapp').value);
  localStorage.setItem('workingHours', document.getElementById('settings-hours').value);
  localStorage.setItem('deliveryArea', document.getElementById('settings-delivery-area').value);
  localStorage.setItem('deliveryCharge', document.getElementById('settings-delivery-charge').value);
  localStorage.setItem('advanceNotice', document.getElementById('settings-advance-notice').value);
  localStorage.setItem('specialInstructions', document.getElementById('settings-special-instructions').value);
  
  // Products from UI would need to be collected here - simplified for now
  
  loadBusinessConfig();
  
  // Update config.js values
  if (document.getElementById('settings-airtable-token').value) {
    localStorage.setItem('airtableToken', document.getElementById('settings-airtable-token').value);
    localStorage.setItem('baseId', document.getElementById('settings-base-id').value);
    localStorage.setItem('convTableId', document.getElementById('settings-conv-table').value);
    localStorage.setItem('stockTableId', document.getElementById('settings-stock-table').value);
    localStorage.setItem('ordersTableId', document.getElementById('settings-orders-table').value);
    localStorage.setItem('whatsappWebhook', document.getElementById('settings-webhook').value);
  }
  
  // Update current config values (will take effect on refresh)
  toast('Settings saved! Changes will take effect on next load.');
  
  setTimeout(() => location.reload(), 1500);
}

function resetToDefault() {
  if (confirm('Are you sure you want to reset all settings? This will clear all business data.')) {
    localStorage.clear();
    location.reload();
  }
}

// Make functions globally available
window.checkOnboarding = checkOnboarding;
window.showOnboardingModal = showOnboardingModal;
window.loadBusinessConfig = loadBusinessConfig;
window.completeOnboarding = completeOnboarding;
window.resetOnboarding = resetOnboarding;
window.nextOnboardingStep = nextOnboardingStep;
window.onBusinessTypeChange = onBusinessTypeChange;
window.addProductRow = addProductRow;
window.launchDashboard = launchDashboard;
window.openImpactScreen = openImpactScreen;
window.closeImpactScreen = closeImpactScreen;
window.updateROI = updateROI;
window.saveGroqKey = saveGroqKey;
window.handleChatKeypress = handleChatKeypress;
window.sendQuickMessage = sendQuickMessage;
window.sendChatMessage = sendChatMessage;
window.clearChat = clearChat;
window.loadSettings = loadSettings;
window.addSettingsProductRow = addSettingsProductRow;
window.saveSettings = saveSettings;
window.resetToDefault = resetToDefault;
window.animateCounters = animateCounters;