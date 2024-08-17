import { router, protectedProcedure, publicProcedure } from '../index'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { PriceTable, PriceTableTemplate } from '../../entity/PriceTable'
import { AppDataSource } from '../../data-source'

const paymentTypeSchema = z.object({
  name: z.string(),
  type: z.enum(['cycle', 'one-time', 'usage-based']),
  unitName: z.string(),
  usageBasedConfig: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    step: z.number().optional(),
  }).optional().nullable(),
})

const priceTableSchema = z.object({
  name: z.string(),
  currencySettings: z.object({
    baseCurrency: z.string(),
    availableCurrencies: z.array(z.string()),
  }).partial(),
  stripePublicKey: z.string(),
  paddlePublicKey: z.string(),
  paymentTypes: z.array(paymentTypeSchema),
}).partial()

export const priceTableRouter = router({
  create: protectedProcedure
    .input(priceTableSchema)
    .mutation(async ({ input, ctx }) => {
      const defaultTemplate = await AppDataSource.getRepository(PriceTableTemplate).findOne({ where: { version: '0.2' } })
      if (!defaultTemplate) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Default template not found' })
      }

      const newPriceTable = AppDataSource.getRepository(PriceTable).create({
        ...input,
        user: ctx.user,
        template: defaultTemplate,
        currencySettings: {
          baseCurrency: input.currencySettings?.baseCurrency || "USD",
          availableCurrencies: input.currencySettings?.availableCurrencies || ["USD"]
        }
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
      data: priceTableSchema
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
      if (input.data.currencySettings) {
        priceTable.currencySettings = {
          ...priceTable.currencySettings,
          ...input.data.currencySettings,
        }
      }
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