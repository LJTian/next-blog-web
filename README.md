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
