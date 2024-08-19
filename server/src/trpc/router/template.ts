import { router, publicProcedure } from '../index'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { PriceTableDraft } from '../../entity/PriceTableDraft'
import { AppDataSource } from '../../data-source'
import { renderTemplate, generateCSS, formatCurrency } from '../../services/template'

export const templateRouter = router({
  renderTable: publicProcedure
    .input(z.object({ tableId: z.string().uuid() }))
    .query(async ({ input }) => {
      const priceTableDraftRepo = AppDataSource.getRepository(PriceTableDraft)
      const priceTableDraft = await priceTableDraftRepo.findOne({
        where: { id: input.tableId },
        relations: ['draft', 'products', 'products.prices']
      })

      if (!priceTableDraft) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Price table not found' })
      }

      const templateData = {
        priceTableDraft: priceTableDraft,
        products: priceTableDraft.products.map(product => ({
          ...product,
          formattedPrice: product.prices && product.prices.length > 0
            ? formatCurrency(product.prices[0].unitAmount, product.prices[0].currency)
            : 'Price not available'
        }))
      }

      const renderedHtml = renderTemplate(priceTableDraft.htmlTemplate, templateData)
      const customCSS = generateCSS(priceTableDraft.customCSS)

      return `
      <style>
        ${customCSS}
      </style>
      ${renderedHtml}
    `
    }),
})