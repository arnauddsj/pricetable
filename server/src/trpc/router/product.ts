import { router, protectedProcedure } from "../index"
import { z } from "zod"
import { AppDataSource } from "../../data-source"
import { Product, Price } from "../../entity/PriceTable"
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
      const priceRepository = AppDataSource.getRepository(Price)

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
          const price = priceRepository.create({
            ...priceInput,
            product,
            countryPrices: priceInput.countryPrices?.map((cp) => ({
              ...cp,
              price: undefined,
            })),
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
        translations: z.record(z.string(), z.any()).nullable(),
        prices: z.array(
          z.object({
            id: z.string().uuid().optional(),
            unitAmount: z.number(),
            currency: z.string(),
            billingCycle: z.string(),
            checkoutUrl: z.string().optional(),
            overrideLocalization: z.boolean().optional(),
            countryPrices: z
              .array(
                z.object({
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
      const priceRepository = AppDataSource.getRepository(Price)

      const product = await productRepository.findOne({
        where: { id: input.id },
        relations: ["prices"],
      })
      if (!product) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" })
      }

      Object.assign(product, input)
      await productRepository.save(product)

      const updatedPrices = await Promise.all(
        input.prices.map(async (priceInput) => {
          if (priceInput.id) {
            const existingPrice = await priceRepository.findOne({
              where: { id: priceInput.id },
            })
            if (existingPrice) {
              Object.assign(existingPrice, priceInput)
              return priceRepository.save(existingPrice)
            }
          }
          const newPrice = priceRepository.create({
            ...priceInput,
            product,
            countryPrices: priceInput.countryPrices?.map((cp) => ({
              ...cp,
              price: undefined,
            })),
          })
          return priceRepository.save(newPrice)
        })
      )

      const inputPriceIds = input.prices
        .map((p) => p.id)
        .filter((id) => id !== undefined) as string[]
      await priceRepository
        .createQueryBuilder()
        .delete()
        .from(Price)
        .where("product.id = :productId", { productId: product.id })
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
        relations: ["prices", "prices.countryPrices"],
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