import { PriceTableTemplate } from '../entity/PriceTableTemplate'

const htmlTemplate = `
<div class="price-table">
  <div class="product-columns">
    {{#each products}}
      <div class="product-column">
        <h3>{{name}}</h3>
        <p>{{description}}</p>
        <div class="price">
          <span class="amount">{{formattedPrice}}</span>
          {{#if prices.length}}
            <span class="billing-cycle">/{{prices.[0].billingCycle}}</span>
          {{/if}}
        </div>
        <button>{{buttonText}}</button>
      </div>
    {{/each}}
  </div>
</div>
`

export const template = {
  databaseFields: {
    name: 'Default Template',
    version: '0.1',
    isPublic: true,
    customCSS: {
      '.price-table': {
        'font-family': 'Arial, sans-serif',
        'max-width': '1200px',
        'margin': '0 auto',
        'padding': '20px',
        'background-color': '#f8f8f8',
      },
      '.product-columns': {
        'display': 'flex',
        'flex-wrap': 'wrap',
        'justify-content': 'space-between',
        'gap': '20px',
      },
      '.product-column': {
        'flex': '1 1 300px',
        'display': 'flex',
        'flex-direction': 'column',
        'padding': '20px',
        'border': '1px solid #ddd',
        'border-radius': '5px',
        'background-color': '#ffffff',
      },
      'h3': {
        'color': '#333333',
        'font-size': '24px',
      },
      '.price': {
        'font-size': '20px',
        'color': '#007bff',
      },
      'button': {
        'background-color': '#007bff',
        'color': '#ffffff',
        'border': 'none',
        'padding': '10px 20px',
        'border-radius': '5px',
        'cursor': 'pointer',
      },
      '@media (max-width: 768px)': {
        '.product-column': {
          'flex-basis': '100%',
        },
      },
    },
  } as Partial<PriceTableTemplate>,
  htmlTemplate,
}