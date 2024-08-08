import { router, protectedProcedure } from '../index'
import { z } from 'zod'
import { AppDataSource } from '../../data-source'
import { Product, PriceTable, Price } from '../../entity/PriceTable'
import { TRPCError } from '@trpc/server'

export const productRouter = router({
  create: protectedProcedure
    .input(z.object({
      priceTableId: z.string().uuid(),
      name: z.string(),
      description: z.string(),
      isHighlighted: z.boolean(),
      highlightText: z.string().optional(),
      buttonSettings: z.object({
        text: z.string(),
        link: z.string(),
      }),
      prices: z.array(z.object({
        unitAmount: z.number(),
        currency: z.string(),
        billingCycle: z.enum(['one-time', 'monthly', 'yearly']),
        trialPeriod: z.object({
          enabled: z.boolean(),
          days: z.number(),
        }).optional().default({ enabled: false, days: 0 }),
      })),
      stripeProductId: z.string().optional().default('default_stripe_id'),
      paddleProductId: z.string().optional().default('default_paddle_id'),
    }))
    .mutation(async ({ input }) => {
      const productRepository = AppDataSource.getRepository(Product)
      const priceTableRepository = AppDataSource.getRepository(PriceTable)
      const priceRepository = AppDataSource.getRepository(Price)

      const priceTable = await priceTableRepository.findOne({ where: { id: input.priceTableId } })
      if (!priceTable) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Price table not found' })
      }

      const product = productRepository.create({
        ...input,
        priceTable,
      })

      await productRepository.save(product)

      // Create prices for the product
      const prices = input.prices.map(price => priceRepository.create({
        ...price,
        product,
        trialPeriod: price.trialPeriod || { enabled: false, days: 0 },
        countryOverrides: {}, // Add this line to provide a default empty object
      }))
      await priceRepository.save(prices)

      return { ...product, prices }
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      name: z.string(),
      description: z.string(),
      isHighlighted: z.boolean(),
      highlightText: z.string().optional(),
      buttonSettings: z.object({
        text: z.string(),
        link: z.string(),
      }),
      prices: z.array(z.object({
        id: z.string().uuid().optional(),
        unitAmount: z.number(),
        currency: z.string(),
        billingCycle: z.enum(['one-time', 'monthly', 'yearly']),
        trialPeriod: z.object({
          enabled: z.boolean(),
          days: z.number(),
        }).optional(),
      })),
    }))
    .mutation(async ({ input }) => {
      const productRepository = AppDataSource.getRepository(Product)
      const priceRepository = AppDataSource.getRepository(Price)

      const product = await productRepository.findOne({ where: { id: input.id }, relations: ['prices'] })
      if (!product) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Product not found' })
      }

      // Update product details
      Object.assign(product, input)
      await productRepository.save(product)

      // Update prices
      const updatedPrices = await Promise.all(input.prices.map(async (priceInput) => {
        if (priceInput.id) {
          // Update existing price
          const existingPrice = await priceRepository.findOne({ where: { id: priceInput.id } })
          if (existingPrice) {
            Object.assign(existingPrice, priceInput)
            return priceRepository.save(existingPrice)
          }
        }
        // Create new price
        const newPrice = priceRepository.create({ ...priceInput, product })
        return priceRepository.save(newPrice)
      }))

      // Remove prices that are not in the input
      const inputPriceIds = input.prices.map(p => p.id).filter(id => id !== undefined) as string[]
      await priceRepository
        .createQueryBuilder()
        .delete()
        .from(Price)
        .where("productId = :productId", { productId: product.id })
        .andWhere("id NOT IN (:...ids)", { ids: inputPriceIds })
        .execute()

      return { ...product, prices: updatedPrices }
    }),

  delete: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
    }))
    .mutation(async ({ input }) => {
      const productRepository = AppDataSource.getRepository(Product)
      const priceRepository = AppDataSource.getRepository(Price)

      const product = await productRepository.findOne({ where: { id: input.id } })
      if (!product) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Product not found' })
      }

      // Delete associated prices
      await priceRepository.delete({ product: { id: product.id } })

      // Delete the product
      await productRepository.remove(product)

      return { success: true }
    }),

  getOne: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
    }))
    .query(async ({ input }) => {
      const productRepository = AppDataSource.getRepository(Product)

      const product = await productRepository.findOne({
        where: { id: input.id },
        relations: ['prices'],
      })

      if (!product) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Product not found' })
      }

      return product
    }),

  getAll: protectedProcedure
    .input(z.object({
      priceTableId: z.string().uuid(),
    }))
    .query(async ({ input }) => {
      const productRepository = AppDataSource.getRepository(Product)

      const products = await productRepository.find({
        where: { priceTable: { id: input.priceTableId } },
        relations: ['prices'],
      })

      return products
    }),
})