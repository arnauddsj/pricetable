import { router, protectedProcedure } from "../index"
import { z } from "zod"
import { AppDataSource } from "../../data-source"
import { Product, Price, PriceTable } from "../../entity/PriceTable"
import { TRPCError } from "@trpc/server"
import { Not, In } from 'typeorm'  // Add this import

const priceSchema = z.object({
  id: z.string().uuid().optional(),
  unitAmount: z.number(),
  currency: z.string(),
  paymentTypeName: z.string(),
})

const productSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string(),
  description: z.string(),
  isHighlighted: z.boolean(),
  highlightText: z.string().optional(),
  buttonText: z.string(),
  prices: z.array(priceSchema),
})

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
        stripeProductId: z.string().optional(),
        paddleProductId: z.string().optional(),
        prices: z.array(priceSchema),
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
        stripeProductId: input.stripeProductId,
        paddleProductId: input.paddleProductId,
        priceTable: { id: input.priceTableId },
      })

      await productRepository.save(product)

      const prices = await Promise.all(
        input.prices.map(async (priceInput) => {
          const price = priceRepository.create({
            unitAmount: priceInput.unitAmount,
            currency: priceInput.currency,
            paymentTypeName: priceInput.paymentTypeName,
            product: product
          })
          return await priceRepository.save(price)
        })
      )

      return { ...product, prices }
    }),

  update: protectedProcedure
    .input(z.object({
      priceTableId: z.string().uuid(),
      product: productSchema,
    }))
    .mutation(async ({ input, ctx }) => {
      const { priceTableId, product } = input

      const priceTableRepository = AppDataSource.getRepository(PriceTable)
      const priceTable = await priceTableRepository.findOne({
        where: { id: priceTableId, user: { id: ctx.user.id } },
        relations: ['products', 'products.prices'],
      })

      if (!priceTable) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Price table not found' })
      }

      const productRepository = AppDataSource.getRepository(Product)
      const priceRepository = AppDataSource.getRepository(Price)

      let existingProduct: Product | null = null
      if (product.id) {
        existingProduct = await productRepository.findOne({
          where: { id: product.id, priceTable: { id: priceTableId } },
          relations: ['prices'],
        })
        if (!existingProduct) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Product not found' })
        }
      }

      await AppDataSource.transaction(async (transactionalEntityManager) => {
        if (existingProduct) {
          // Update existing product
          transactionalEntityManager.merge(Product, existingProduct, {
            name: product.name,
            description: product.description,
            isHighlighted: product.isHighlighted,
            highlightText: product.highlightText,
            buttonText: product.buttonText,
          })
          await transactionalEntityManager.save(existingProduct)

          // Update prices
          for (const priceData of product.prices) {
            if (priceData.id) {
              // Update existing price
              await transactionalEntityManager.update(Price, priceData.id, priceData)
            } else {
              // Create new price
              const newPrice = priceRepository.create({
                ...priceData,
                product: existingProduct,
              })
              await transactionalEntityManager.save(newPrice)
            }
          }

          // Remove prices that are no longer present
          const currentPriceIds = product.prices.map(p => p.id).filter(id => id !== undefined) as string[]
          await transactionalEntityManager.delete(Price, {
            product: { id: existingProduct.id },
            id: Not(In(currentPriceIds)),
          })
        } else {
          // Create new product
          const newProduct = productRepository.create({
            ...product,
            priceTable,
          })
          await transactionalEntityManager.save(newProduct)

          // Create prices
          for (const priceData of product.prices) {
            const newPrice = priceRepository.create({
              ...priceData,
              product: newProduct,
            })
            await transactionalEntityManager.save(newPrice)
          }
        }
      })

      return await productRepository.findOne({
        where: { id: existingProduct?.id || product.id },
        relations: ['prices'],
      })
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