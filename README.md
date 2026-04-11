# ReplyAI Bakery Admin Dashboard

A modern, responsive dashboard for Priya's Bakery built with vanilla JavaScript, HTML, and CSS. This dashboard integrates with Airtable to manage conversations, orders, inventory, and delivery tracking.

## Project Structure

```
replyai/
├── index.html          # Main entry point
├── css/
│   └── styles.css     # All styles
├── js/
│   ├── config.js      # Configuration and constants
│   ├── api.js         # Airtable API functions
│   ├── dashboard.js   # Dashboard rendering
│   ├── analytics.js   # Analytics charts
│   ├── stock.js       # Stock management
│   ├── orders.js      # Order management
│   ├── delivery.js    # Delivery tracking
│   ├── customers.js   # Customer view
│   ├── marketing.js   # Marketing functions
│   ├── ingredients.js # Ingredient tracking
│   └── main.js        # Initialization
└── README.md          # This file
```

## Features

- **Live Dashboard**: Auto-refreshing metrics and message tables
- **Analytics**: Charts for intent, sentiment, lead score, and volume
- **Menu & Stock**: Track product inventory with inline editing
- **Order Management**: Update order status with WhatsApp notifications
- **Delivery Tracking**: Monitor deliveries and driver locations
- **Customer Intelligence**: Search and filter customer conversations
- **Marketing Tools**: Hot leads, follow-up queue, and templates
- **Ingredient Tracking**: Monitor baking supplies and restock alerts

## Setup

1. Open `index.html` in a browser
2. The dashboard automatically fetches data from Airtable
3. Data refreshes every 30 seconds

## Configuration

Edit `js/config.js` to update:
- `TOKEN` - Airtable API token
- `BASE` - Airtable base ID
- `CONV`, `STOCK`, `ORDERS`, `DELIVERY` - Table IDs

## Tech Stack

- Vanilla JavaScript (no framework)
- Chart.js for analytics
- DM Sans font
- Remix Icons
- Airtable API