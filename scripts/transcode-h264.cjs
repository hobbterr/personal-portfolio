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

const videos = walk(mediaRoot)
  .filter((file) => file.toLowerCase().endsWith(".mp4"))
  .filter((file) => !file.toLowerCase().endsWith("-h264.mp4"));

for (const source of videos) {
  const target = source.replace(/\.mp4$/i, "-h264.mp4");
  if (fs.existsSync(target)) {
    console.log(`Skip existing: ${path.relative(mediaRoot, target)}`);
    continue;
  }

  console.log(`Transcoding: ${path.relative(mediaRoot, source)}`);
  const result = spawnSync(
    ffmpegPath,
    [
      "-y",
      "-i",
      source,
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      "-preset",
      "medium",
      "-crf",
      "23",
      "-c:a",
      "aac",
      "-b:a",
      "160k",
      "-movflags",
      "+faststart",
      target
    ],
    { stdio: "inherit" }
  );

  if (result.status !== 0) {
    console.error(`Failed: ${path.relative(mediaRoot, source)}`);
    process.exit(result.status ?? 1);
  }
}

console.log("Done. H.264 files are ready.");
