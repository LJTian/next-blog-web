# LJTian Blog

A minimal Next.js blog shell that embeds the public Notion blog page.

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Production build

```bash
npm run build
npm run start
```

## Vercel deployment

Import this repository into Vercel. Vercel detects Next.js automatically and can use the default settings:

- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

## Notion embed URL

Notion public pages can reject direct iframe loading with `x-frame-options: SAMEORIGIN`. This app uses Notion's embed URL by default:

`https://tianlj.notion.site/ebd//ce8a73f53641460cb4ba5f92596ae14b`

To override it later, set `NEXT_PUBLIC_NOTION_EMBED_URL` in Vercel to a different iframe `src` value.
