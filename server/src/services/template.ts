import Handlebars from 'handlebars'
import path from 'path'
import { EntityManager } from 'typeorm'
import { AppDataSource } from '../data-source'
import { PriceTableTemplate } from '../entity/PriceTableTemplate'

export async function updateDefaultTemplate(
  input: {
    name?: string
    htmlTemplate: string
    customCSS: Record<string, any>
  },
  transactionalEntityManager?: EntityManager
) {
  const templateRepo = transactionalEntityManager
    ? transactionalEntityManager.getRepository(PriceTableTemplate)
    : AppDataSource.getRepository(PriceTableTemplate)

  const runUpdate = async (manager: EntityManager) => {
    const currentDefault = await manager.findOne(PriceTableTemplate, {
      where: { isDefault: true }
    })

    if (currentDefault) {
      // Update the existing default template
      currentDefault.name = input.name || currentDefault.name
      currentDefault.htmlTemplate = input.htmlTemplate
      currentDefault.customCSS = input.customCSS
      await manager.save(currentDefault)
    } else {
      // Create a new default template if none exists
      const newDefault = manager.create(PriceTableTemplate, {
        name: input.name || "Default Template",
        htmlTemplate: input.htmlTemplate,
        customCSS: input.customCSS,
        isDefault: true,
        isPublic: true
      })
      await manager.save(newDefault)
    }
  }

  if (transactionalEntityManager) {
    await runUpdate(transactionalEntityManager)
  } else {
    await AppDataSource.transaction(async transactionalEntityManager => {
      await runUpdate(transactionalEntityManager)
    })
  }

  return { success: true, message: "Default template updated successfully" }
}

export function loadTemplate(version: string): any {
  const templatePath = path.join(__dirname, '..', 'templates', `${version}.ts`)
  try {
    return require(templatePath).template
  } catch (error) {
    console.error(`Failed to load template version ${version}:`, error)
    throw new Error(`Template version ${version} not found`)
  }
}

export function renderTemplate(template: string, data: any): string {
  console.log('template', template)
  console.log('data', data)
  const compiledTemplate = Handlebars.compile(template)
  return compiledTemplate(data)
}

export function generateCSS(customCSS: Record<string, any>): string {
  let css = ''
  for (const [selector, styles] of Object.entries(customCSS)) {
    css += `${selector} {\n`
    for (const [property, value] of Object.entries(styles as Record<string, string>)) {
      css += `  ${property}: ${value};\n`
    }
    css += '}\n'
  }
  return css
}

export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(amount / 100)
}

