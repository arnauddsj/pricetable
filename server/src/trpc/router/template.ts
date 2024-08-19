import { router, publicProcedure } from '../index'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { PriceTable } from '../../entity/PriceTable'
import { AppDataSource } from '../../data-source'
import { renderTemplate, generateCSS, formatCurrency } from '../../services/template'

export const templateRouter = router({
  renderTable: publicProcedure
    .input(z.object({ tableId: z.string().uuid() }))
    .query(async ({ input }) => {
      const priceTableRepo = AppDataSource.getRepository(PriceTable)
      const priceTable = await priceTableRepo.findOne({
        where: { id: input.tableId },
        relations: ['draft', 'products', 'products.prices']
      })

      if (!priceTable || !priceTable.draft) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Price table not found' })
      }

      const templateData = {
        priceTable: priceTable,
        products: priceTable.products.map(product => ({
          ...product,
          formattedPrice: product.prices && product.prices.length > 0
            ? formatCurrency(product.prices[0].unitAmount, product.prices[0].currency)
            : 'Price not available'
        }))
      }

      const renderedHtml = renderTemplate(priceTable.draft.htmlTemplate, templateData)
      const customCSS = generateCSS(priceTable.draft.customCSS)

      return `
      <style>
        ${customCSS}
      </style>
      ${renderedHtml}
    `
    }),
})