// The RoboBuddy site: the README, the design reasoning and the face builder, built with the X-Libs site framework.
import { readdirSync, readFileSync } from "node:fs";
import { define_site, type ExtraFile } from "@x-tech-laboratories/x-libs/site/model";

const root = new URL("../", import.meta.url);

// The face builder and the files it and the README load, copied from the repository as they are.
function repository_files(): ExtraFile[] {
  const folder = (name: string) => readdirSync(new URL(`${name}/`, root)).map((file) => `${name}/${file}`);
  return ["demo.html", ...folder("dist"), ...folder("screenshots")].map((path) => ({ path, content: readFileSync(new URL(path, root)) }));
}

export default define_site({
  title: "RoboBuddy",
  description: "Animated robot eyes and a mouth on a canvas, with composable moods.",
  site: "https://x-tech-laboratories.github.io",
  base: "/RoboBuddy/",
  content: ".",
  social: [{ icon: "github", label: "GitHub", href: "https://github.com/x-tech-laboratories/RoboBuddy" }],
  edit_link: "https://github.com/x-tech-laboratories/RoboBuddy/edit/main/docs/",
  last_updated: true,
  theme_key: "robobuddy-docs-theme",
  css: [
    "@x-tech-laboratories/halon/halon-tokens.css",
    "@x-tech-laboratories/halon/halon.css",
    "@x-tech-laboratories/halon/site.css",
    "@fontsource/noto-sans/400.css",
    "@fontsource/noto-sans/500.css",
    "@fontsource/noto-sans/600.css",
    "@fontsource/noto-sans/700.css",
  ],
  sidebar: [
    { slug: "", label: "Guide" },
    { slug: "design-reasoning" },
    { label: "Face builder", link: "/demo.html" },
  ],
  // The address the earlier Jekyll site gave the design reasoning.
  redirects: { "/docs/design-reasoning.html": "/design-reasoning/" },
  files: repository_files,
});
