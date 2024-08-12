import { router, protectedProcedure, publicProcedure } from '../index'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { PriceTable, Price, PriceTableTemplate } from '../../entity/PriceTable'
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
      // Get the latest template

      const defaultTemplate = await AppDataSource.getRepository(PriceTableTemplate).findOne({ where: { version: '0.2' } })
      if (!defaultTemplate) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Default template not found' })
      }

      const newPriceTable = AppDataSource.getRepository(PriceTable).create({
        ...input,
        user: ctx.user,
        template: defaultTemplate
      })
      await AppDataSource.getRepository(PriceTable).save(newPriceTable)
      return newPriceTable
    }),

  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      const priceTableRepository = AppDataSource.getRepository(PriceTable)
      return await priceTableRepository.find({ where: { user: { id: ctx.user.id } } })
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const priceTableRepository = AppDataSource.getRepository(PriceTable)
      const priceTable = await priceTableRepository.findOne({
        where: { id: input.id, user: { id: ctx.user.id } },
        relations: ['products', 'products.prices', 'featureGroups', 'featureGroups.features', 'template'],
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
})