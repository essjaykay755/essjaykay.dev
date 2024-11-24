import { defineDocumentType, makeSource } from "contentlayer/source-files";
import type { ComputedFields } from "contentlayer/source-files";
import remarkGfm from "remark-gfm";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

type Project = {
  _raw: {
    flattenedPath: string;
  };
  type: 'Project';
  title: string;
  date: string;
  description: string;
};

interface RehypeNode {
  children: Array<{ type: string; value: string }>;
  properties: {
    className: string[];
  };
}

const computedFields: ComputedFields<"Project"> = {
  slug: {
    type: "string",
    resolve: (doc) => doc._raw.flattenedPath.split("/").slice(1).join("/"),
  },
  structuredData: {
    type: "json",
    resolve: (doc) => ({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: doc.title,
      datePublished: doc.date,
      dateModified: doc.date,
      description: doc.description,
      image: `https://essjaykay.dev/og.png`,
      url: `https://essjaykay.dev/projects/${doc._raw.flattenedPath}`,
      author: {
        "@type": "Person",
        name: "Subhojit Karmakar",
      },
    }),
  },
};

export const Project = defineDocumentType(() => ({
  name: "Project",
  filePathPattern: "projects/**/*.mdx",
  contentType: "mdx",
  fields: {
    title: { type: "string", required: true },
    description: { type: "string", required: true },
    date: { type: "date", required: true },
    repository: { type: "string", required: false },
    url: { type: "string", required: false },
    published: { type: "boolean", required: true },
  },
  computedFields,
}));

export default makeSource({
  contentDirPath: "content",
  documentTypes: [Project],
  mdx: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypePrettyCode as any,
        {
          theme: "github-dark",
          onVisitLine(node: RehypeNode) {
            if (node.children.length === 0) {
              node.children = [{ type: "text", value: " " }];
            }
          },
          onVisitHighlightedLine(node: RehypeNode) {
            node.properties.className.push("line--highlighted");
          },
          onVisitHighlightedWord(node: RehypeNode) {
            node.properties.className = ["word--highlighted"];
          },
        },
      ],
      [
        rehypeAutolinkHeadings,
        {
          properties: {
            className: ["subheading-anchor"],
            ariaLabel: "Link to section",
          },
        },
      ],
    ],
  },
}); 