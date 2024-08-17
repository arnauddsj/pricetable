import { router, protectedProcedure, publicProcedure } from '../index'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { PriceTable } from '../../entity/PriceTable'
import { PriceTableTemplate } from '../../entity/PriceTableTemplate'
import { Product } from '../../entity/Product'
import { Price } from '../../entity/Price'
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
      const templateRepository = AppDataSource.getRepository(PriceTableTemplate)
      const defaultTemplate = await templateRepository.findOne({
        where: { isPublic: true },
        order: { version: 'DESC' }
      })
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
      data: priceTableSchema.extend({
        products: z.array(z.object({
          id: z.string().uuid().optional(),
          name: z.string(),
          description: z.string(),
          isHighlighted: z.boolean(),
          highlightText: z.string().optional().nullable(),
          buttonText: z.string().optional().nullable(),
          buttonLink: z.string().optional().nullable(),
          prices: z.array(z.object({
            id: z.string().uuid().optional(),
            unitAmount: z.number(),
            currency: z.string(),
            paymentTypeName: z.string(),
            checkoutUrl: z.string().optional().nullable(),
          })),
        })).optional(),
      }),
    }))
    .mutation(async ({ input, ctx }) => {
      const priceTableRepository = AppDataSource.getRepository(PriceTable)
      const productRepository = AppDataSource.getRepository(Product)
      const priceRepository = AppDataSource.getRepository(Price)

      const priceTable = await priceTableRepository.findOne({
        where: { id: input.id, user: { id: ctx.user.id } },
        relations: ['products', 'products.prices'],
      })

      if (!priceTable) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Price table not found' })
      }

      // Update price table properties
      priceTableRepository.merge(priceTable, input.data)
      if (input.data.currencySettings) {
        priceTable.currencySettings = {
          ...priceTable.currencySettings,
          ...input.data.currencySettings,
        }
      }

      // Update products and prices
      if (input.data.products) {
        priceTable.products = await Promise.all(input.data.products.map(async (productData) => {
          let product: Product
          if (productData.id) {
            product = await productRepository.findOne({ where: { id: productData.id } })
            if (!product) {
              throw new TRPCError({ code: 'NOT_FOUND', message: `Product with id ${productData.id} not found` })
            }
            productRepository.merge(product, productData)
          } else {
            product = productRepository.create(productData)
            product.priceTable = priceTable
          }

          product.prices = await Promise.all(productData.prices.map(async (priceData) => {
            let price: Price
            if (priceData.id) {
              price = await priceRepository.findOne({ where: { id: priceData.id } })
              if (!price) {
                throw new TRPCError({ code: 'NOT_FOUND', message: `Price with id ${priceData.id} not found` })
              }
              priceRepository.merge(price, priceData)
            } else {
              price = priceRepository.create(priceData)
            }
            price.product = product
            return price
          }))

          await productRepository.save(product)
          return product
        }))
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