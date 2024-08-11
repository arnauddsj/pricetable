import fs from 'fs'
import path from 'path'
import * as ejs from 'ejs'

export function loadHTMLTemplate(version: string): string {
  const templatePath = path.join(__dirname, '..', 'templates', `${version}.ejs`)
  try {
    return fs.readFileSync(templatePath, 'utf-8')
  } catch (error) {
    console.error(`Failed to load template version ${version}:`, error)
    throw new Error(`Template version ${version} not found`)
  }
}

export function renderTemplate(template: string, data: any): string {
  return ejs.render(template, data)
}

export function generateCSSFromStyling(styling: Record<string, any>): string {
  let css = ''
  for (const [selector, styles] of Object.entries(styling)) {
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