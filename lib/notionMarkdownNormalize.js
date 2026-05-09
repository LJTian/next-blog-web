/**
 * Notion "enhanced markdown" often wraps fenced code in <column> with tab-indented
 * ``` fences. CommonMark only allows up to 3 spaces before ``` — tabs exceed that, so
 * fences are not recognized. We strip leading whitespace on fence-only lines and unwrap
 * layout / embed tags so remark can parse the body.
 * @param {string} markdown
 * @returns {string}
 */
export function normalizeNotionMarkdown(markdown) {
  let s = markdown;

  s = s.replace(/<page url="([^"]+)">([^<]*)<\/page>/g, "[$2]($1)");
  s = s.replace(
    /<database([^>]*)>([^<]*)<\/database>/g,
    (full, attrs, title) => {
      const urlMatch = attrs.match(/url="([^"]+)"/);
      const iconMatch = attrs.match(/icon="([^"]*)"/);
      const icon = iconMatch ? `${iconMatch[1]} ` : "";
      const t = String(title).trim();
      if (urlMatch) {
        return `\n\n${icon}[${t}](${urlMatch[1]})\n\n`;
      }
      return `\n\n**${icon}${t}**\n\n`;
    },
  );

  s = s.replace(/<\/?columns>/gi, "\n");
  s = s.replace(/<\/?column>/gi, "\n");

  s = stripIndentedFenceDelimiters(s);
  s = dedentLeadingMarkdownLinksOutsideFences(s);

  return s.replace(/\n{3,}/g, "\n\n").trim();
}

/**
 * Notion <column> 去掉后，链接行前常有 Tab；≥4 空格缩进在 CommonMark 里会变成「缩进代码块」，
 * 页面就会显示原始 `[text](url)`。仅在围栏外去掉这类行的前导空白。
 */
function dedentLeadingMarkdownLinksOutsideFences(md) {
  const lines = md.split("\n");
  let inFence = false;
  const out = [];
  for (const line of lines) {
    if (/^[\t ]*```/.test(line)) {
      inFence = !inFence;
      out.push(line);
      continue;
    }
    if (inFence) {
      out.push(line);
      continue;
    }
    const trimmed = line.replace(/^[\t ]+/, "");
    if (/^\[[^\]]+\]\([^)]+\)/.test(trimmed)) {
      out.push(trimmed);
    } else {
      out.push(line);
    }
  }
  return out.join("\n");
}

/** Lines that are only whitespace + ```[lang] — move ``` to column 0 */
function stripIndentedFenceDelimiters(md) {
  return md
    .split("\n")
    .map((line) => {
      const m = line.match(/^[\t ]+(```[\w-]*)[\t ]*$/);
      if (m) return m[1];
      return line;
    })
    .join("\n");
}
