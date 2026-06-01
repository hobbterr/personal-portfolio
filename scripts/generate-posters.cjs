const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

let ffmpegPath;
try {
  ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
} catch {
  console.error("Missing @ffmpeg-installer/ffmpeg. Run: npm.cmd install @ffmpeg-installer/ffmpeg --save-dev");
  process.exit(1);
}

const mediaRoot = path.resolve(process.cwd(), "public/media");

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const allVideos = walk(mediaRoot).filter((file) => file.toLowerCase().endsWith(".mp4"));
const videoMap = new Map();

for (const file of allVideos) {
  const canonical = file.replace(/-h264\.mp4$/i, ".mp4");
  const current = videoMap.get(canonical);
  if (!current || file.toLowerCase().endsWith("-h264.mp4")) {
    videoMap.set(canonical, file);
  }
}

const videos = Array.from(videoMap.entries()).map(([canonical, input]) => ({ canonical, input }));

let created = 0;
let skipped = 0;
let failed = 0;

console.log(`Found ${videos.length} source video(s).`);

for (const { canonical, input } of videos) {
  const poster = canonical.replace(/\.mp4$/i, "-poster.jpg");

  if (fs.existsSync(poster)) {
    console.log(`Skip existing: ${path.relative(mediaRoot, poster)}`);
    skipped += 1;
    continue;
  }

  console.log(`Generating poster: ${path.relative(mediaRoot, poster)}`);
  const result = spawnSync(
    ffmpegPath,
    [
      "-y",
      "-i",
      input,
      "-vf",
      "select=eq(n\\,20),scale=900:-2",
      "-frames:v",
      "1",
      "-q:v",
      "3",
      poster
    ],
    { stdio: "inherit" }
  );

  if (result.status !== 0) {
    console.error(`Failed: ${path.relative(mediaRoot, poster)}`);
    failed += 1;
    continue;
  }

  created += 1;
}

console.log(`Done. Created: ${created}, skipped: ${skipped}, failed: ${failed}.`);
if (failed > 0) {
  console.log("Some videos failed. Check the messages above, then run this script again after fixing them.");
}
