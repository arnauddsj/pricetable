import { router, protectedProcedure } from "../index"
import { z } from "zod"
import { AppDataSource } from "../../data-source"
import { Product, PriceTable, Price } from "../../entity/PriceTable"
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
            billingCycle: z.enum(["one-time", "monthly", "yearly"]),
            trialPeriod: z
              .object({
                enabled: z.boolean(),
                days: z.number(),
              })
              .optional()
              .default({ enabled: false, days: 0 }),
            checkoutUrl: z.string().optional(),
            overrideLocalization: z.boolean().optional(),
            countryPrices: z
              .array(
                z.object({
                  price: z.number(),
                  countryCode: z.string(),
                  unitAmount: z.number(),
                  currency: z.string(),
                })
              )
              .optional(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      const productRepository = AppDataSource.getRepository(Product)
      const priceTableRepository = AppDataSource.getRepository(PriceTable)
      const priceRepository = AppDataSource.getRepository(Price)

      const priceTable = await priceTableRepository.findOne({
        where: { id: input.priceTableId },
      })
      if (!priceTable) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Price table not found" })
      }

      const product = productRepository.create({
        name: input.name,
        description: input.description,
        isHighlighted: input.isHighlighted,
        highlightText: input.highlightText,
        buttonText: input.buttonText,
        buttonLink: input.buttonLink,
        stripeProductId: input.stripeProductId,
        paddleProductId: input.paddleProductId,
        priceTable,
      })

      await productRepository.save(product)

      // Create prices for the product
      const prices = await Promise.all(
        input.prices.map(async (priceInput) => {
          const price = priceRepository.create({
            unitAmount: priceInput.unitAmount,
            currency: priceInput.currency,
            billingCycle: priceInput.billingCycle,
            checkoutUrl: priceInput.checkoutUrl ?? null,
            overrideLocalization: priceInput.overrideLocalization ?? false,
          })

          if (priceInput.countryPrices && priceInput.countryPrices.length > 0) {
            price.countryPrices = priceInput.countryPrices.map((cp) => ({
              id: undefined, // This will allow the database to auto-generate the id
              price: undefined, // Remove the circular reference
              countryCode: cp.countryCode,
              unitAmount: cp.unitAmount,
              currency: cp.currency,
            }))
          }

          price.product = product
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
            billingCycle: z.enum(["cycles", "one-time", "usage-based"]),
            checkoutUrl: z.string().optional(),
            overrideLocalization: z.boolean().optional(),
            countryPrices: z.array(
              z.object({
                id: z.string().uuid().optional(),
                price: z.number(),
                countryCode: z.string(),
                unitAmount: z.number(),
                currency: z.string(),
              })
            ),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      const productRepository = AppDataSource.getRepository(Product)
      const priceRepository = AppDataSource.getRepository(Price)

      const product = await productRepository.findOne({
        where: { id: input.id },
        relations: ["prices"],
      })
      if (!product) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" })
      }

      // Update product details
      Object.assign(product, input)
      await productRepository.save(product)

      // Update prices
      const updatedPrices = await Promise.all(
        input.prices.map(async (priceInput) => {
          if (priceInput.id) {
            // Update existing price
            const existingPrice = await priceRepository.findOne({
              where: { id: priceInput.id },
            })
            if (existingPrice) {
              Object.assign(existingPrice, priceInput)
              return priceRepository.save(existingPrice)
            }
          }
          // Create new price
          const newPrice = priceRepository.create({
            ...priceInput,
            product,
            countryPrices: priceInput.countryPrices?.map((cp) => ({
              ...cp,
              id: cp.id || undefined,
              price: undefined, // Remove the circular reference
            })),
          })
          return priceRepository.save(newPrice)
        })
      )

      // Remove prices that are not in the input
      const inputPriceIds = input.prices
        .map((p) => p.id)
        .filter((id) => id !== undefined) as string[]
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

      // Delete associated prices
      await priceRepository.delete({ product: { id: product.id } })

      // Delete the product
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
        relations: ["prices"],
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
        relations: ["prices"],
      })

      return products
    }),
})
