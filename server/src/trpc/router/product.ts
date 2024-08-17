import { router, protectedProcedure } from "../index"
import { z } from "zod"
import { AppDataSource } from "../../data-source"
import { Product, Price, PaymentType } from "../../entity/PriceTable"
import { TRPCError } from "@trpc/server"

export const productRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        priceTableId: z.string().uuid(),
        name: z.string(),
        description: z.string(),
        isHighlighted: z.boolean(),
        highlightText: z.string().optional(),
        buttonText: z.string(),
        buttonLink: z.string(),
        stripeProductId: z.string().optional(),
        paddleProductId: z.string().optional(),
        prices: z.array(
          z.object({
            unitAmount: z.number(),
            currency: z.string(),
            billingCycle: z.string(),
            checkoutUrl: z.string().optional(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      const productRepository = AppDataSource.getRepository(Product)
      const priceRepository = AppDataSource.getRepository(Price)
      const paymentTypeRepository = AppDataSource.getRepository(PaymentType)

      const product = productRepository.create({
        name: input.name,
        description: input.description,
        isHighlighted: input.isHighlighted,
        highlightText: input.highlightText,
        buttonText: input.buttonText,
        buttonLink: input.buttonLink,
        stripeProductId: input.stripeProductId,
        paddleProductId: input.paddleProductId,
        priceTable: { id: input.priceTableId },
      })

      await productRepository.save(product)

      const prices = await Promise.all(
        input.prices.map(async (priceInput) => {
          const paymentType = await paymentTypeRepository.findOne({
            where: { name: priceInput.billingCycle, priceTable: { id: input.priceTableId } },
          })
          if (!paymentType) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: `Payment type not found for billing cycle: ${priceInput.billingCycle}`,
            })
          }
          const price = priceRepository.create({
            unitAmount: priceInput.unitAmount,
            currency: priceInput.currency,
            paymentType: paymentType,
            checkoutUrl: priceInput.checkoutUrl,
            product: product
          })
          return await priceRepository.save(price)
        })
      )

      return { ...product, prices }
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string(),
        description: z.string(),
        isHighlighted: z.boolean(),
        highlightText: z.string().optional(),
        buttonText: z.string(),
        buttonLink: z.string(),
        stripeProductId: z.string().optional(),
        paddleProductId: z.string().optional(),
        prices: z.array(
          z.object({
            id: z.string().uuid().optional(),
            unitAmount: z.number(),
            currency: z.string(),
            billingCycle: z.string(),
            checkoutUrl: z.string().optional(),
          })
        ).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, prices, ...productData } = input

      // Start a transaction
      await AppDataSource.transaction(async (transactionalEntityManager) => {
        // Update the product
        await transactionalEntityManager.update(Product, id, productData)

        // Only handle prices if they are provided
        if (prices && prices.length > 0) {
          // Get existing price IDs
          const existingPrices = await transactionalEntityManager.find(Price, {
            where: { product: { id } },
            select: ['id'],
          })
          const existingPriceIds = existingPrices.map(price => price.id)

          // Determine which prices to keep, update, or add
          const pricesToKeepIds = prices.filter(price => price.id).map(price => price.id as string)
          const pricesToDelete = existingPriceIds.filter(id => !pricesToKeepIds.includes(id))

          // Delete prices that are no longer present
          if (pricesToDelete.length > 0) {
            await transactionalEntityManager.delete(Price, pricesToDelete)
          }

          // Update or create prices
          for (const price of prices) {
            if (price.id) {
              await transactionalEntityManager.update(Price, price.id, price)
            } else {
              const newPrice = transactionalEntityManager.create(Price, {
                ...price,
                product: { id },
              })
              await transactionalEntityManager.save(newPrice)
            }
          }
        } else {
          // If no prices are provided, remove all existing prices
          await transactionalEntityManager.delete(Price, { product: { id } })
        }
      })

      // Fetch and return the updated product with its prices
      const updatedProduct = await AppDataSource.getRepository(Product).findOne({
        where: { id },
        relations: ['prices'],
      })

      return updatedProduct
    }),

  delete: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .mutation(async ({ input }) => {
      const productRepository = AppDataSource.getRepository(Product)
      const priceRepository = AppDataSource.getRepository(Price)

      const product = await productRepository.findOne({ where: { id: input.id } })
      if (!product) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" })
      }

      await priceRepository.delete({ product: { id: product.id } })
      await productRepository.remove(product)

      return { success: true }
    }),

  getById: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .query(async ({ input }) => {
      const productRepository = AppDataSource.getRepository(Product)

      const product = await productRepository.findOne({
        where: { id: input.id },
        relations: ["prices", "priceTable"],
      })

      if (!product) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" })
      }

      return product
    }),

  getAll: protectedProcedure
    .input(
      z.object({
        priceTableId: z.string().uuid(),
      })
    )
    .query(async ({ input }) => {
      const productRepository = AppDataSource.getRepository(Product)
      const products = await productRepository.find({
        where: { priceTable: { id: input.priceTableId } },
      })
      return products
    }),
})