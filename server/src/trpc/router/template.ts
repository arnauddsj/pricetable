import { router, protectedProcedure, publicProcedure } from '../index'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { PriceTable } from '../../entity/PriceTable'
import { PriceTableTemplate } from '../../entity/PriceTableTemplate'
import { AppDataSource } from '../../data-source'
import { loadTemplate, renderTemplate, generateCSS, formatCurrency } from '../../services/template'

export const templateRouter = router({
  getLatestVersion: publicProcedure
    .query(async () => {
      const templateRepo = AppDataSource.getRepository(PriceTableTemplate)
      const result = await templateRepo.createQueryBuilder('template')
        .select('template.version')
        .orderBy('template.version', 'DESC')
        .limit(1)
        .getOne()
      return result ? result.version : null
    }),

  upgradeTemplate: protectedProcedure
    .input(z.object({
      priceTableId: z.string().uuid()
    }))
    .mutation(async ({ input, ctx }) => {
      const priceTableRepo = AppDataSource.getRepository(PriceTable)
      const templateRepo = AppDataSource.getRepository(PriceTableTemplate)

      const priceTable = await priceTableRepo.findOne({
        where: { id: input.priceTableId, user: { id: ctx.user.id } },
        relations: ['template']
      })

      if (!priceTable) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Price table not found' })
      }

      const latestTemplate = await templateRepo.findOne({
        order: { version: 'DESC' }
      })

      if (!latestTemplate) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'No templates available' })
      }

      if (priceTable.template.version === latestTemplate.version) {
        return { message: 'Already using the latest template version' }
      }

      priceTable.template = latestTemplate
      await priceTableRepo.save(priceTable)

      return { message: `Upgraded to template version ${latestTemplate.version}` }
    }),

  renderTable: publicProcedure
    .input(z.object({ tableId: z.string().uuid() }))
    .query(async ({ input }) => {
      const priceTableRepo = AppDataSource.getRepository(PriceTable)
      const priceTable = await priceTableRepo.findOne({
        where: { id: input.tableId },
        relations: ['template', 'products', 'products.prices']
      })

      if (!priceTable) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Price table not found' })
      }

      const template = loadTemplate(priceTable.template.version)

      const templateData = {
        priceTable: priceTable,
        products: priceTable.products.map(product => ({
          ...product,
          formattedPrice: product.prices && product.prices.length > 0
            ? formatCurrency(product.prices[0].unitAmount, product.prices[0].currency)
            : 'Price not available'
        }))
      }

      const renderedHtml = renderTemplate(template.htmlTemplate, templateData)
      console.log('renderedHtml', renderedHtml)
      const customCSS = generateCSS({
        ...template.databaseFields.customCSS,
        ...priceTable.template.customCSS
      })

      return `
        <style>
          ${customCSS}
        </style>
        ${renderedHtml}
      `
    }),
})