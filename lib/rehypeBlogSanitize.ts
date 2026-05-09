import type { Schema } from "hast-util-sanitize";
import { defaultSchema } from "hast-util-sanitize";

const baseTags = defaultSchema.tagNames;
const baseAttr = defaultSchema.attributes ?? {};

/**
 * 在 GitHub 风格白名单基础上，允许 Shiki / rehype-pretty-code、标题锚点、外链 rel 等。
 */
export const blogSanitizeSchema: Schema = {
  ...defaultSchema,
  tagNames: Array.from(
    new Set([...(baseTags ?? []), "figure", "figcaption"]),
  ),
  attributes: {
    ...baseAttr,
    a: [
      ...(baseAttr.a ?? []),
      "target",
      "rel",
      "className",
      "ariaHidden",
      "ariaLabel",
      "tabIndex",
    ],
    code: ["className", "style"],
    pre: ["className", "style", "tabIndex"],
    span: ["className", "style"],
    figure: ["className"],
    figcaption: ["className"],
    h1: [...(baseAttr.h1 ?? []), "id"],
    h2: [...(baseAttr.h2 ?? []), "id"],
    h3: ["id"],
    h4: ["id"],
    h5: ["id"],
    h6: ["id"],
  },
};
