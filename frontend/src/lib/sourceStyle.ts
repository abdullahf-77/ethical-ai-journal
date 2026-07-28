export const SOURCE_LABEL: Record<string, string> = {
  arxiv: "arXiv",
  openalex: "OpenAlex",
  semantic_scholar: "Semantic Scholar",
  crossref: "Crossref",
};

export const SOURCE_STYLE: Record<string, string> = {
  arxiv: "bg-red-500/10 text-red-600 dark:text-red-300",
  openalex: "bg-sky-500/10 text-sky-600 dark:text-sky-300",
  semantic_scholar: "bg-teal-500/10 text-teal-600 dark:text-teal-300",
  crossref: "bg-orange-500/10 text-orange-600 dark:text-orange-300",
};

export function sourceLabel(source: string): string {
  return SOURCE_LABEL[source] ?? source;
}

export function sourceStyle(source: string): string {
  return SOURCE_STYLE[source] ?? "bg-zinc-500/10 text-zinc-600 dark:text-zinc-300";
}
