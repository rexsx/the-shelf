const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const root = path.resolve(__dirname, "..");
const assets = ["assets/css/main.css", "assets/js/site.js", "assets/js/shelf.js", "assets/js/data.js"];
const pages = ["index.html", "404.html", "resources.html"];

function escapeForRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const stamps = {};

assets.forEach(function (asset) {
  const file = path.join(root, asset);
  if (!fs.existsSync(file)) {
    console.error("missing asset: " + asset);
    process.exit(1);
  }
  stamps[asset] = crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex").slice(0, 10);
});

let changed = 0;

pages.forEach(function (page) {
  const file = path.join(root, page);
  if (!fs.existsSync(file)) return;

  const before = fs.readFileSync(file, "utf8");
  let after = before;

  assets.forEach(function (asset) {
    const pattern = new RegExp(escapeForRegExp(asset) + "(\\?v=[a-f0-9]+)?", "g");
    after = after.replace(pattern, asset + "?v=" + stamps[asset]);
  });

  if (after !== before) {
    fs.writeFileSync(file, after);
    changed += 1;
  }
  console.log(page + (after !== before ? "  stamped" : "  already current"));
});

Object.keys(stamps).forEach(function (asset) {
  console.log("  " + asset + "  ->  " + stamps[asset]);
});

console.log(changed + " file(s) rewritten");
