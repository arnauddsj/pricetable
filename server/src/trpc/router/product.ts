import { router, protectedProcedure } from "../index"
import { z } from "zod"
import { AppDataSource } from "../../data-source"
import { Product } from "../../entity/Product"
import { Price } from "../../entity/Price"
import { PriceTable } from "../../entity/PriceTable"
import { TRPCError } from "@trpc/server"
import { Not, In } from 'typeorm'

const priceSchema = z.object({
  id: z.string().uuid().optional(),
  unitAmount: z.number(),
  currency: z.string(),
  paymentTypeName: z.string(),
  checkoutUrl: z.string().nullable(),
})

const productSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string(),
  description: z.string(),
  isHighlighted: z.boolean(),
  highlightText: z.string().optional(),
  buttonText: z.string(),
  buttonLink: z.string().nullable(),
  stripeProductId: z.string().nullable(),
  paddleProductId: z.string().nullable(),
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
        buttonLink: z.string().optional(),
        prices: z.array(priceSchema).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { priceTableId, prices, ...productData } = input

      const priceTableRepository = AppDataSource.getRepository(PriceTable)
      const priceTable = await priceTableRepository.findOne({
        where: { id: priceTableId, user: { id: ctx.user.id } },
      })

      if (!priceTable) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Price table not found' })
      }

      const productRepository = AppDataSource.getRepository(Product)
      const priceRepository = AppDataSource.getRepository(Price)

      const product = productRepository.create({
        ...productData,
        priceTable,
      })

      try {
        await AppDataSource.transaction(async (transactionalEntityManager) => {
          await transactionalEntityManager.save(product)

          if (prices && prices.length > 0) {
            const newPrices = prices.map(priceData =>
              priceRepository.create({
                ...priceData,
                product: product,
              })
            )
            await transactionalEntityManager.save(newPrices)
          }
        })

        // Fetch the product with its prices
        const savedProduct = await productRepository.findOne({
          where: { id: product.id },
          relations: ['prices'],
        })

        return savedProduct
      } catch (error) {
        console.error('Error creating product:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create product' })
      }
    }),

  update: protectedProcedure
    .input(z.object({
      priceTableId: z.string().uuid(),
      product: productSchema,
    }))
    .mutation(async ({ input, ctx }) => {
      const { priceTableId, product } = input

      console.log("Received product update:", JSON.stringify(product, null, 2))

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

          console.log("Updating prices for product:", existingProduct.id)

          // Update prices
          for (const priceData of product.prices) {
            console.log("Processing price:", JSON.stringify(priceData, null, 2))
            if (priceData.id) {
              // Update existing price
              await transactionalEntityManager.update(Price, priceData.id, priceData)
              console.log("Updated existing price:", priceData.id)
            } else {
              // Create new price
              const newPrice = priceRepository.create({
                ...priceData,
                product: existingProduct,
              })
              await transactionalEntityManager.save(newPrice)
              console.log("Created new price:", newPrice.id)
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

      // Fetch the updated product with prices
      const updatedProduct = await productRepository.findOne({
        where: { id: existingProduct?.id || product.id },
        relations: ['prices'],
      })

      if (!updatedProduct) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Updated product not found' })
      }

      // Transform the product to match the expected format
      const transformedProduct = {
        ...updatedProduct,
        isHighlighted: updatedProduct.isHighlighted,
        highlightText: updatedProduct.highlightText,
        buttonText: updatedProduct.buttonText,
        buttonLink: updatedProduct.buttonLink,
        stripeProductId: updatedProduct.stripeProductId,
        paddleProductId: updatedProduct.paddleProductId,
        prices: updatedProduct.prices.map(price => ({
          id: price.id,
          unitAmount: price.unitAmount,
          currency: price.currency,
          paymentTypeName: price.paymentTypeName,
          checkoutUrl: price.checkoutUrl,
        })),
      }

      console.log("Returning updated product:", JSON.stringify(transformedProduct, null, 2))

      return transformedProduct
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