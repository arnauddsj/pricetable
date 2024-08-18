import Handlebars from 'handlebars'
import path from 'path'

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