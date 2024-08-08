## 8. Embed Script and Server-Side Rendering (SSR) System

The PriceTable app utilizes a lightweight embed script coupled with a powerful server-side rendering system to display customized price tables securely and efficiently.

### 8.1 Embed Script

The embed script is a minimal JavaScript snippet that customers can easily add to their websites to display their configured price tables.

Key features:

- Lightweight and fast-loading
- No exposure of sensitive data (API keys, pricing logic) on the client side
- Simple implementation for end-users

Implementation:

```html
html
Copy
<div id="price-table-container" data-table-id="user_table_id"></div>
<script>
(function() {
  const container = document.getElementById('price-table-container');
  const tableId = container.getAttribute('data-table-id');

  fetch(`https://yourapp.com/api/render-table/${tableId}`)
    .then(response => response.text())
    .then(html => {
      container.innerHTML = html;
    })
    .catch(error => {
      console.error('Failed to load price table:', error);
      container.innerHTML = 'Failed to load price table. Please try again later.';
    });
})();
</script>

```

### 8.2 Server-Side Rendering System

The SSR system is responsible for generating the complete HTML and CSS for the price table based on the stored configuration and real-time data from payment processors.

Key features:

- Secure handling of API keys and sensitive pricing information
- Real-time price fetching from Stripe and Paddle
- Dynamic rendering of HTML and CSS based on user configuration
- Caching mechanism for improved performance

Implementation:

1. Endpoint: `/api/render-table/:tableId`
2. Process:
a. Fetch table configuration from the database
b. Retrieve current prices from Stripe/Paddle using stored API keys
c. Apply any active discounts or promotions
d. Generate HTML and CSS based on the table's style configuration
e. Return the fully rendered HTML to the client

### 8.3 Benefits of the SSR Approach

1. Enhanced Security:
    - API keys and pricing logic remain server-side
    - Reduced risk of client-side tampering
2. Improved Performance:
    - Minimal JavaScript execution on the client
    - Opportunity for server-side caching of rendered tables
3. SEO Friendly:
    - Fully rendered HTML is beneficial for search engine indexing
4. Simplified Maintenance:
    - Centralized rendering logic makes updates and bug fixes easier
5. Consistency:
    - Ensures consistent display across different websites and platforms

### 8.4 Caching Strategy

To optimize performance and reduce load on both the app's servers and external APIs (Stripe/Paddle):

1. Implement a short-lived cache (e.g., 5-15 minutes) for rendered tables
2. Use a distributed cache system for scalability
3. Implement cache invalidation on price table updates

### 8.5 Fallback and Error Handling

1. Provide graceful degradation if the table fails to load
2. Implement retry logic with exponential backoff for API calls
3. Offer a static fallback version of the price table for critical failures

### 8.6 Customization Options

Despite being server-rendered, the system still offers extensive customization:

1. Style Injection: Allow users to provide custom CSS that's injected into the rendered HTML
2. Theme Selection: Offer pre-defined themes that can be selected when rendering
3. Dynamic Components: Use placeholder elements that can be enhanced with client-side JavaScript if needed (e.g., for interactive features)

This SSR system, combined with the lightweight embed script, provides a robust, secure, and flexible solution for displaying dynamic price tables while keeping sensitive information and complex calculations server-side.