const fs = require("fs");
const path = require("path");

const projectRoot = process.cwd();
const worksPath = path.resolve(projectRoot, "src/works.js");
let content = fs.readFileSync(worksPath, "utf8");

content = content.replace(
  /(cover:\s*"([^"]+\.mp4)",\n)(?!\s*poster:)/g,
  (match, coverLine, coverPath) => {
    const posterPath = coverPath.replace(/\.mp4$/i, "-poster.jpg");
    const posterFile = path.resolve(projectRoot, "public", posterPath.replace(/^\//, ""));
    if (!fs.existsSync(posterFile)) return match;
    return `${coverLine}    poster: "${posterPath}",\n`;
  }
);

fs.writeFileSync(worksPath, content);
console.log("Done. works.js poster fields are synced.");
