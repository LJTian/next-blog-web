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

The app uses the public Notion URL by default. If Notion blocks direct iframe loading, open the published Notion page, choose `Share` -> `Publish` -> `Embed this page`, copy the iframe code, and set `NEXT_PUBLIC_NOTION_EMBED_URL` in Vercel to the iframe `src` value.
