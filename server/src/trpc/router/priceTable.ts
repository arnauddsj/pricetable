import { router, protectedProcedure, publicProcedure } from '../index'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { PriceTable } from '../../entity/PriceTable'
import { PriceTableDraft } from '../../entity/PriceTableDraft'
import { AppDataSource } from '../../data-source'
import { Product } from '../../entity/Product'
import { Price } from '../../entity/Price'
import { User } from '../../entity/User'
import { PriceTableTemplate } from '../../entity/PriceTableTemplate'
import { Not, In } from 'typeorm'

const priceSchema = z.object({
  id: z.string().uuid().optional(),
  unitAmount: z.number(),
  currency: z.string(),
  paymentTypeName: z.string(),
  checkoutUrl: z.string().optional().nullable(),
})

const productSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string(),
  description: z.string(),
  isHighlighted: z.boolean(),
  highlightText: z.string().optional().nullable(),
  buttonText: z.string().optional().nullable(),
  buttonLink: z.string().optional().nullable(),
  prices: z.array(priceSchema),
})

const priceTableDraftSchema = z.object({
  name: z.string().optional(),
  stripePublicKey: z.string().optional(),
  paddlePublicKey: z.string().optional(),
  htmlTemplate: z.string().optional(),
  customCSS: z.record(z.any()).optional(),
  currencySettings: z.object({
    baseCurrency: z.string(),
    availableCurrencies: z.array(z.string()),
  }).optional(),
  paymentTypes: z.array(z.object({
    name: z.string(),
    type: z.enum(['cycle', 'one-time', 'usage-based']),
    unitName: z.string(),
    usageBasedConfig: z.object({
      min: z.number().optional(),
      max: z.number().optional(),
      step: z.number().optional(),
    }).optional().nullable(),
  })).optional(),
  products: z.array(productSchema).optional(),
})

const PriceTableSchema = z.object({
  name: z.string(),
  stripePublicKey: z.string().optional(),
  paddlePublicKey: z.string().optional(),
  currencySettings: z.object({
    baseCurrency: z.string(),
    availableCurrencies: z.array(z.string()),
  }).optional(),
  paymentTypes: z.array(z.object({
    name: z.string(),
    type: z.enum(['cycle', 'one-time', 'usage-based']),
    unitName: z.string(),
    usageBasedConfig: z.object({
      min: z.number().optional(),
      max: z.number().optional(),
      step: z.number().optional(),
    }).optional().nullable(),
  })).optional(),
})

export const priceTableRouter = router({
  create: protectedProcedure
    .input(PriceTableSchema)
    .mutation(async ({ input, ctx }) => {
      const priceTableDraftRepo = AppDataSource.getRepository(PriceTableDraft)
      const templateRepo = AppDataSource.getRepository(PriceTableTemplate)
      const userRepo = AppDataSource.getRepository(User)

      return await AppDataSource.transaction(async (transactionalEntityManager) => {
        // Get the default template
        const defaultTemplate = await templateRepo.findOne({
          where: { isDefault: true, isPublic: true }
        })

        if (!defaultTemplate || defaultTemplate.PriceTableData.length === 0) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'No default template found or template has no data' })
        }

        const latestTemplateData = defaultTemplate.PriceTableData[defaultTemplate.PriceTableData.length - 1]

        const user = await userRepo.findOne({ where: { id: ctx.user.id } })

        if (!user) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not found' })
        }

        // Create the draft PriceTable
        const draftPriceTable = priceTableDraftRepo.create({
          name: input.name,
          stripePublicKey: input.stripePublicKey,
          paddlePublicKey: input.paddlePublicKey,
          htmlTemplate: latestTemplateData.data.htmlTemplate,
          customCSS: latestTemplateData.data.customCSS,
          currencySettings: input.currencySettings || latestTemplateData.data.currencySettings,
          paymentTypes: input.paymentTypes || latestTemplateData.data.paymentTypes,
          PriceTableTemplate: defaultTemplate,
          user: user,
          products: [],
          featureGroups: []
        })

        await transactionalEntityManager.save(draftPriceTable)

        return { id: draftPriceTable.id }
      })
    }),


  // TO DO publish: 

  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      const priceTableRepository = AppDataSource.getRepository(PriceTable)

      return priceTableRepository
        .createQueryBuilder('priceTable')
        .leftJoinAndSelect('priceTable.draft', 'draft')
        .select([
          'priceTable.id',
          'priceTable.isPublished',
          'draft.id',
          'draft.name',
          'draft.updatedAt'
        ])
        .where('priceTable.user = :userId', { userId: ctx.user.id })
        .orderBy('draft.updatedAt', 'DESC', 'NULLS LAST')
        .getMany()
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

  getDraftById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const priceTableDraftRepository = AppDataSource.getRepository(PriceTableDraft)
      const priceTableDraft = await priceTableDraftRepository.findOne({
        where: { id: input.id },
        relations: ['products', 'products.prices', 'featureGroups', 'featureGroups.features', 'priceTable', 'priceTable.PriceTableTemplate'],
      })
      if (!priceTableDraft) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Price table draft not found' })
      }
      return priceTableDraft
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      data: priceTableDraftSchema,
    }))
    .mutation(async ({ input, ctx }) => {
      const priceTableDraftRepo = AppDataSource.getRepository(PriceTableDraft)
      const productRepo = AppDataSource.getRepository(Product)
      const priceRepo = AppDataSource.getRepository(Price)

      const priceTableDraft = await priceTableDraftRepo.findOne({
        where: { id: input.id, user: { id: ctx.user.id } },
        relations: ['products', 'products.prices', 'featureGroups'],
      })

      if (!priceTableDraft) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Price table draft not found' })
      }

      // Update price table draft properties
      priceTableDraftRepo.merge(priceTableDraft, input.data)

      // Update products and prices
      if (input.data.products) {
        priceTableDraft.products = await Promise.all(input.data.products.map(async (productData) => {
          let product: Product
          if (productData.id) {
            product = await productRepo.findOne({ where: { id: productData.id } })
            if (!product) {
              throw new TRPCError({ code: 'NOT_FOUND', message: `Product with id ${productData.id} not found` })
            }
            productRepo.merge(product, productData)
          } else {
            product = productRepo.create(productData)
            product.priceTableDraft = priceTableDraft
          }

          product.prices = await Promise.all(productData.prices.map(async (priceData) => {
            let price: Price
            if (priceData.id) {
              price = await priceRepo.findOne({ where: { id: priceData.id } })
              if (!price) {
                throw new TRPCError({ code: 'NOT_FOUND', message: `Price with id ${priceData.id} not found` })
              }
              priceRepo.merge(price, priceData)
            } else {
              price = priceRepo.create(priceData)
            }
            price.product = product
            return price
          }))

          await productRepo.save(product)
          return product
        }))
      }

      // Remove products that are no longer present
      if (input.data.products) {
        const updatedProductIds = input.data.products.map(p => p.id).filter(id => id !== undefined)
        await productRepo.delete({
          priceTableDraft: { id: priceTableDraft.id },
          id: Not(In(updatedProductIds))
        })
      }

      // Here you would handle updating featureGroups if needed

      await priceTableDraftRepo.save(priceTableDraft)
      return priceTableDraft
    }),

  // TODO UDPATE DELETE
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const priceTableRepository = AppDataSource.getRepository(PriceTable)

      const priceTable = await priceTableRepository.findOne({
        where: { id: input.id, user: { id: ctx.user.id } },
        relations: ['products', 'products.prices', 'featureGroups', 'featureGroups.features', 'draft']
      })

      if (!priceTable) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Price table not found' })
      }

      await AppDataSource.transaction(async (transactionalEntityManager) => {
        // Remove prices
        if (priceTable.products) {
          for (const product of priceTable.products) {
            if (product.prices) {
              await transactionalEntityManager.remove(product.prices)
            }
          }
        }

        // Remove products
        if (priceTable.products) {
          await transactionalEntityManager.remove(priceTable.products)
        }

        // Remove features and feature groups
        if (priceTable.featureGroups) {
          for (const featureGroup of priceTable.featureGroups) {
            if (featureGroup.features) {
              await transactionalEntityManager.remove(featureGroup.features)
            }
          }
          await transactionalEntityManager.remove(priceTable.featureGroups)
        }

        // Remove draft
        if (priceTable.draft) {
          await transactionalEntityManager.remove(priceTable.draft)
        }

        // Remove the price table itself
        await transactionalEntityManager.remove(priceTable)
      })

      return { success: true }
    }),
})