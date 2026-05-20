const { spawn } = require("child_process");
const http = require("http");

const HOST = "127.0.0.1";
const PORT = Number(process.env.PORT) || 3000;
const PAGES = [
  "/index.html",
  "/robots.txt",
  "/sitemap.xml",
  "/name-explorer.html",
  "/name.html?name=Ankit&gender=boy",
  "/name-report.html",
  "/popular-names.html",
  "/unique-names.html",
  "/services.html",
  "/contact.html",
  "/about.html",
  "/parents-mix.html",
  "/product.html",
  "/wishlist.html",
  "/login.html",
  "/signup.html"
];

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function fetchStatus(pathname) {
  return new Promise((resolve, reject) => {
    const req = http.get(
      {
        hostname: HOST,
        port: PORT,
        path: pathname,
        timeout: 8000
      },
      (res) => {
        res.resume();
        resolve(res.statusCode || 0);
      }
    );
    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy(new Error(`Timeout while requesting ${pathname}`));
    });
  });
}

async function main() {
  const server = spawn(process.execPath, ["server.js"], {
    stdio: "ignore",
    windowsHide: true
  });

  try {
    await wait(1800);
    let allGood = true;

    for (const page of PAGES) {
      try {
        const status = await fetchStatus(page);
        const ok = status === 200;
        if (!ok) allGood = false;
        console.log(`${page} -> ${status}`);
      } catch (error) {
        allGood = false;
        console.log(`${page} -> ERROR (${error.message})`);
      }
    }

    if (!allGood) {
      process.exitCode = 1;
    } else {
      console.log("Health check passed.");
    }
  } finally {
    if (!server.killed) {
      server.kill();
    }
  }
}

main().catch((error) => {
  console.error("Health check failed:", error.message);
  process.exitCode = 1;
});
