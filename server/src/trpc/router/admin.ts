import { router, adminProcedure } from '../index'
import { z } from 'zod'
import { updateDefaultTemplate } from '../../services/template'

export const adminRouter = router({
  updateDefaultTemplate: adminProcedure
    .input(z.object({
      name: z.string().optional(),
      htmlTemplate: z.string(),
      customCSS: z.record(z.any())
    }))
    .mutation(async ({ input }) => {
      return await updateDefaultTemplate({
        name: input.name,
        htmlTemplate: input.htmlTemplate,
        customCSS: input.customCSS
      })
    })
})