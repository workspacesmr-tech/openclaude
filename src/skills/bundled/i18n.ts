import { registerBundledSkill } from '../bundledSkills.js'

const I18N_PROMPT = `# Internationalize a Next.js Project

Add complete internationalization (i18n) to a Next.js (App Router) project using **next-intl v4**. This handles routing, translation files, hreflang sitemaps, and bulk translation across 14+ locales.

## Step 1: Assess the Project

1. Check \`package.json\` for Next.js version — must be 13+ with App Router
2. Check if i18n is already partially set up (\`next-intl\`, \`next-i18next\`, \`[locale]\` routes)
3. Identify all pages/routes that need translation
4. Identify all user-facing strings (hardcoded text in components)

## Step 2: Install Dependencies

\`\`\`bash
npm install next-intl
\`\`\`

## Step 3: Create i18n Configuration Files

Create 4 files under \`src/i18n/\`:

### \`src/i18n/config.ts\`
\`\`\`typescript
export const locales = ['en', 'es', 'fr', 'de', 'pt', 'ja', 'ar', 'zh', 'zh-tw', 'id', 'vi', 'ms', 'ru', 'hi'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'en'
export const rtlLocales: Locale[] = ['ar']
\`\`\`

### \`src/i18n/routing.ts\`
\`\`\`typescript
import { defineRouting } from 'next-intl/routing'
import { defaultLocale, locales } from './config'
export const routing = defineRouting({ locales, defaultLocale, localePrefix: 'as-needed' })
\`\`\`

### \`src/i18n/navigation.ts\`
\`\`\`typescript
import { createNavigation } from 'next-intl/navigation'
import { routing } from './routing'
export const { Link, redirect, usePathname, useRouter } = createNavigation(routing)
\`\`\`

### \`src/i18n/request.ts\`
\`\`\`typescript
import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'
export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale
  if (!locale || !routing.locales.includes(locale as any)) locale = routing.defaultLocale
  return { locale, messages: (await import(\`../messages/$\{locale}.json\`)).default }
})
\`\`\`

## Step 4: Create Middleware

\`src/middleware.ts\`:
\`\`\`typescript
import createMiddleware from 'next-intl/middleware'
import { routing } from '@/i18n/routing'
export default createMiddleware({ ...routing, localeDetection: false })
export const config = { matcher: ['/((?!_next|api|images|fonts|favicon|sitemap|robots).*)'] }
\`\`\`

## Step 5: Update \`next.config\`

Wrap with \`createNextIntlPlugin\`:
\`\`\`typescript
import createNextIntlPlugin from 'next-intl/plugin'
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')
export default withNextIntl(nextConfig)
\`\`\`

## Step 6: Add \`[locale]\` Dynamic Route

Move all page content under \`src/app/[locale]/\`:

1. Create \`src/app/[locale]/layout.tsx\` with \`generateStaticParams()\` returning all locales, \`setRequestLocale(locale)\`, \`<html lang={locale} dir={rtlLocales.includes(locale) ? 'rtl' : 'ltr'}>\`, \`<NextIntlClientProvider>\`
2. Move existing pages into \`src/app/[locale]/\`
3. Each page should call \`setRequestLocale(locale)\` for static generation

## Step 7: Extract Strings into Translation Files

1. Create \`src/messages/en.json\` with all user-facing strings organized by section
2. Replace all hardcoded strings using \`useTranslations('section')\` (client) or \`getTranslations('section')\` (server)

## Step 8: Translate to All Locales

For each non-English locale, create \`src/messages/{locale}.json\` with the same structure as \`en.json\`.

After translation, verify:
- No missing sections vs \`en.json\`
- No residual English content (3+ common English words in a string = likely untranslated)

## Step 9: Update Sitemap with Hreflang

Update \`src/app/sitemap.ts\` to include hreflang alternates using \`alternates.languages\`.

## Step 10: Verify

1. \`npm run build\` — all static pages generate correctly
2. Default locale URLs have no prefix, others get \`/{locale}/\`
3. Sitemap has hreflang alternates
4. RTL rendering works for Arabic locale
`

export function registerI18nSkill(): void {
  registerBundledSkill({
    name: 'i18n',
    description:
      'Add full internationalization (i18n) to a Next.js (App Router) project using next-intl. Handles routing, translation files, hreflang sitemaps, and bulk translation across 14+ locales.',
    descriptionKey: 'skills.i18n.description',
    userInvocable: true,
    async getPromptForCommand(args) {
      let prompt = I18N_PROMPT
      if (args) {
        prompt += `\n\n## User Requirements\n\n${args}`
      }
      return [{ type: 'text', text: prompt }]
    },
  })
}
