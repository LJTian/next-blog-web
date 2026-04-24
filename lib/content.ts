export type HomepageCard = {
  id: string;
  title: string;
  eyebrow: string;
  summary: string;
  tone: "warm" | "cool" | "deep" | "plain";
};

export type BookPage =
  | { kind: "cover"; title: string; subtitle: string }
  | { kind: "featured"; title: string; entries: Array<{ title: string; meta: string }> }
  | { kind: "topics"; title: string; topics: string[] }
  | { kind: "about"; title: string; body: string }
  | { kind: "archive"; title: string; body: string; action: string };

export const homepageCards: HomepageCard[] = [
  {
    id: "featured",
    eyebrow: "Featured",
    title: "Selected Notes",
    summary: "Carefully kept essays on systems, tools, and engineering judgment.",
    tone: "plain"
  },
  {
    id: "cloud",
    eyebrow: "Topic",
    title: "Cloud Native",
    summary: "Kubernetes, observability, and production architecture.",
    tone: "cool"
  },
  {
    id: "ai",
    eyebrow: "Topic",
    title: "AI Engineering",
    summary: "Experiments with agents, evaluation, and developer workflows.",
    tone: "deep"
  },
  {
    id: "about",
    eyebrow: "About",
    title: "LJTian",
    summary: "A personal index of work, learning, and durable notes.",
    tone: "warm"
  },
  {
    id: "archive",
    eyebrow: "Archive",
    title: "All Pages",
    summary: "A quiet path into older writing and reference material.",
    tone: "plain"
  }
];

export const bookPages: BookPage[] = [
  { kind: "cover", title: "LJTian", subtitle: "Next Blog" },
  {
    kind: "featured",
    title: "Featured",
    entries: [
      { title: "Designing Reliable Systems", meta: "Architecture" },
      { title: "Notes on AI Tooling", meta: "AI Engineering" },
      { title: "Cloud Native Field Guide", meta: "Infrastructure" }
    ]
  },
  {
    kind: "topics",
    title: "Topics",
    topics: ["Cloud Native", "AI", "Linux", "Docker", "Go", "English"]
  },
  {
    kind: "about",
    title: "About",
    body: "A personal blog for technical notes, engineering practice, and the parts of learning worth keeping."
  },
  {
    kind: "archive",
    title: "Archive",
    body: "Browse the full collection of writing, experiments, and references.",
    action: "Open archive"
  }
];
