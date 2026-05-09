/**
 * react-notion-x Code 仅内置部分语言；按需加载 Prism 语法以启用高亮。
 * 须先于组件加载；首行引入 core，否则 components 在 SSR 中会报 Prism is not defined。
 */
import "prismjs";
import "prismjs/components/prism-clike.min.js";
import "prismjs/components/prism-c.min.js";
import "prismjs/components/prism-cpp.min.js";
import "prismjs/components/prism-go.min.js";
import "prismjs/components/prism-python.min.js";
import "prismjs/components/prism-java.min.js";
import "prismjs/components/prism-rust.min.js";
import "prismjs/components/prism-bash.min.js";
import "prismjs/components/prism-shell-session.min.js";
import "prismjs/components/prism-yaml.min.js";
import "prismjs/components/prism-markdown.min.js";
import "prismjs/components/prism-sql.min.js";
import "prismjs/components/prism-docker.min.js";
