import { router, protectedProcedure, publicProcedure } from '../index'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { PriceTable } from '../../entity/PriceTable'
import { PriceTableDraft } from '../../entity/PriceTableDraft'
import { AppDataSource } from '../../data-source'
import { Product } from '../../entity/Product'
import { Price } from '../../entity/Price'
import { FeatureGroup } from '../../entity/FeatureGroup'
import { PriceTableTemplate } from '../../entity/PriceTableTemplate'

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
      const priceTableDraftRepo = AppDataSource.getRepository(PriceTableDraft)
      const templateRepo = AppDataSource.getRepository(PriceTableTemplate)

      return await AppDataSource.transaction(async (transactionalEntityManager) => {
        // Get the latest default template
        const latestTemplate = await templateRepo.findOne({
          where: { isPublic: true, user: null },
          order: { version: 'DESC' }
        })

        if (!latestTemplate) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'No default template found' })
        }

        // Create a copy of the latest template for the draft
        const draftTemplate = templateRepo.create({
          ...latestTemplate,
          id: undefined,
          isPublic: false,
          user: { id: ctx.user.id }
        })
        await transactionalEntityManager.save(draftTemplate)

        // Create the draft PriceTable
        const draftPriceTable = priceTableDraftRepo.create({
          name: input.name,
          stripePublicKey: input.stripePublicKey,
          paddlePublicKey: input.paddlePublicKey,
          currencySettings: input.currencySettings,
          paymentTypes: input.paymentTypes,
          template: draftTemplate
        })
        await transactionalEntityManager.save(draftPriceTable)

        return { id: draftPriceTable.id }
      })
    }),

  publish: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const priceTableRepo = AppDataSource.getRepository(PriceTable)
      const priceTableDraftRepo = AppDataSource.getRepository(PriceTableDraft)

      const draft = await priceTableDraftRepo.findOne({
        where: { priceTable: { id: input.id, user: { id: ctx.user.id } } },
        relations: ['priceTable'],
      })

      if (!draft) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Draft price table not found',
        })
      }

      // Start a transaction
      await AppDataSource.transaction(async (transactionalEntityManager) => {
        // Update the live version with the draft data
        Object.assign(draft.priceTable, draft)
        draft.priceTable.isPublished = true
        draft.priceTable.publishedAt = new Date()
        await transactionalEntityManager.save(draft.priceTable)

        // Optionally, you can clear some draft-specific data here if needed
        // draft.someFieldThatShouldBeClearedAfterPublishing = null;
        await transactionalEntityManager.save(draft)
      })

      return draft.priceTable
    }),

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
        relations: ['products', 'products.prices', 'featureGroups', 'featureGroups.features', 'template', 'priceTable'],
      })
      if (!priceTableDraft) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Price table draft not found' })
      }
      return priceTableDraft
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
      const productRepository = AppDataSource.getRepository(Product)
      const priceRepository = AppDataSource.getRepository(Price)
      const featureGroupRepository = AppDataSource.getRepository(FeatureGroup)
      const priceTableDraftRepository = AppDataSource.getRepository(PriceTableDraft)

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