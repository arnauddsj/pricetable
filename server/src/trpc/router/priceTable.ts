import { router, protectedProcedure, publicProcedure } from '../index'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { PriceTable, Price } from '../../entity/PriceTable'
import { AppDataSource } from '../../data-source'
// import NodeCache from 'node-cache'

// Initialize cache / not implemented yet for html generation
// const tableCache = new NodeCache({ stdTTL: 900 }) // 15 minutes

const priceTableSchema = z.object({
  name: z.string(),
  generalSettings: z.object({
    baseCurrency: z.string(),
    availableCurrencies: z.array(z.string()),
    generalStyle: z.string(),
    templateId: z.string().optional(),
    iconStyle: z.enum(['icon', 'text']),
    paymentType: z.enum(['cycles', 'one-time', 'usage-based']),
    cycleOptions: z.array(z.string()).optional(),
    usageRanges: z.array(z.object({
      min: z.number(),
      max: z.number(),
      price: z.number()
    })).optional()
  }),
  stripePublicKey: z.string(),
  paddlePublicKey: z.string(),
  localizationSettings: z.object({
    enableAutomaticCurrencyConversion: z.boolean(),
    countrySpecificPricing: z.record(z.string())
  })
})

export const priceTableRouter = router({
  create: protectedProcedure
    .input(priceTableSchema)
    .mutation(async ({ input, ctx }) => {
      const priceTableRepository = AppDataSource.getRepository(PriceTable)
      const newPriceTable = priceTableRepository.create({
        ...input,
        user: ctx.user
      })
      await priceTableRepository.save(newPriceTable)
      return newPriceTable
    }),

  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      const priceTableRepository = AppDataSource.getRepository(PriceTable)
      return await priceTableRepository.find({ where: { user: { id: ctx.user.id } } })
    }),

  getOne: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const priceTableRepository = AppDataSource.getRepository(PriceTable)
      const priceTable = await priceTableRepository.findOne({
        where: { id: input.id, user: { id: ctx.user.id } }
      })
      if (!priceTable) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Price table not found' })
      }
      return priceTable
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      data: priceTableSchema.partial()
    }))
    .mutation(async ({ input, ctx }) => {
      const priceTableRepository = AppDataSource.getRepository(PriceTable)
      const priceTable = await priceTableRepository.findOne({
        where: { id: input.id, user: { id: ctx.user.id } }
      })
      if (!priceTable) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Price table not found' })
      }
      priceTableRepository.merge(priceTable, input.data)
      await priceTableRepository.save(priceTable)
      return priceTable
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const priceTableRepository = AppDataSource.getRepository(PriceTable)
      const priceTable = await priceTableRepository.findOne({
        where: { id: input.id, user: { id: ctx.user.id } }
      })
      if (!priceTable) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Price table not found' })
      }
      await priceTableRepository.remove(priceTable)
      return { success: true }
    }),

  renderTable: publicProcedure
    .input(z.object({ tableId: z.string().uuid() }))
    .query(async ({ input }) => {
      const { tableId } = input

      const priceTableRepository = AppDataSource.getRepository(PriceTable)
      const priceTable = await priceTableRepository.findOne({
        where: { id: tableId },
        relations: ['products', 'products.prices']
      })

      if (!priceTable) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Price table not found' })
      }

      console.log('Price table structure:', JSON.stringify(priceTable, null, 2))

      // Generate HTML
      const html = generatePriceTableHTML(priceTable)

      // Generate CSS
      const css = generatePriceTableCSS()

      // Combine HTML and CSS
      const fullHtml = `
        <style>${css}</style>
        ${html}
      `

      // Return only the HTML string
      return fullHtml
    }),
})

function generatePriceTableHTML(priceTable: PriceTable): string {
  const productColumns = priceTable.products.map(product => `
    <div class="product-column">
      <h3>${product.name}</h3>
      <p>${product.description}</p>
      ${product.prices && product.prices.length > 0 ? generatePriceHTML(product.prices[0]) : '<p>No price available</p>'}
      <button>${product.buttonSettings.text}</button>
    </div>
  `).join('')

  return `
    <div class="price-table">
      <div class="product-columns">
        ${productColumns}
      </div>
    </div>
  `
}

function generatePriceHTML(price: Price | undefined): string {
  if (!price) {
    return '<p>Price not available</p>'
  }
  return `
    <div class="price">
      <span class="amount">${formatCurrency(price.unitAmount, price.currency)}</span>
      <span class="billing-cycle">/${price.billingCycle}</span>
    </div>
  `
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(amount / 100)
}

function generatePriceTableCSS(): string {
  return `
    .price-table {
      font-family: Arial, sans-serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .product-columns {
      display: flex;
      justify-content: space-around;
      gap: 20px;
    }

    .product-column {
      flex: 1;
      border: 1px solid #ddd;
      padding: 20px;
      border-radius: 5px;
      text-align: center;
    }

    .price {
      margin: 20px 0;
    }

    .amount {
      font-size: 24px;
      font-weight: bold;
    }

    .billing-cycle {
      font-size: 14px;
    }

    button {
      background-color: #007bff;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 5px;
      cursor: pointer;
    }

    button:hover {
      background-color: #0056b3;
    }
  `
}