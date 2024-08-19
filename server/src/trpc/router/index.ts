import { router, publicProcedure } from "../index"
import { authRouter } from "./auth"
import { AppDataSource } from "../../data-source"
import { priceTableRouter } from "./priceTable"
import { productRouter } from "./product"
import { templateRouter } from "./template"
import { adminRouter } from "./admin"
import type { PriceTable, Product, Price, Feature, FeatureGroup, PriceTableTemplate, PriceTableDraft } from '../../types/entities'

export const appRouter = router({
  auth: authRouter,
  priceTable: priceTableRouter,
  product: productRouter,
  template: templateRouter,
  admin: adminRouter,
  healthCheck: publicProcedure.query(async () => {
    try {
      await AppDataSource.query('SELECT 1')
      return { status: 'ok', message: 'Server is running and connected to the database' }
    } catch (error) {
      console.error('Health check failed:', error)
      return { status: 'error', message: 'Server is running but database connection failed' }
    }
  }),

})

export type AppRouter = typeof appRouter

// Export entity types
export type { PriceTable, Product, Price, Feature, FeatureGroup, PriceTableTemplate, PriceTableDraft }

export default appRouter