import https from "https";
import httpProxy from "http-proxy";
import HttpProxyRules from "http-proxy-rules";
import fs from "fs";
import { spawn } from "child_process";
import path from "path";
import { program } from "commander";

program
  .requiredOption("--httpsPort <port>", "Port to host the HTTPS proxy server")
  .requiredOption("--targetPort <port>", "Port of the target server")
  .option("--apiPort <port>", "Port of the API server (optional)")
  .parse();

const { apiPort, targetPort, httpsPort } = program.opts();
const excessArgs = program.args;

const baseFolder =
  process.env.APPDATA !== undefined && process.env.APPDATA !== ""
    ? `${process.env.APPDATA}/ASP.NET/https`
    : `${process.env.HOME}/.aspnet/https`;

const certFilePath = path.join(baseFolder, `proxy.pem`);
const keyFilePath = path.join(baseFolder, `proxy.key`);

if (!fs.existsSync(certFilePath) || !fs.existsSync(keyFilePath)) {
  await new Promise((resolve, reject) => {
    console.log("Exporting certificate...");
    spawn(
      "dotnet",
      [
        "dev-certs",
        "https",
        "--export-path",
        certFilePath,
        "--format",
        "Pem",
        "--no-password",
      ],
      { stdio: "inherit" }
    ).on("exit", (code) => {
      if (code === 0) {
        resolve(undefined);
      } else {
        reject(code);
      }
    });
  });
}

var proxyRules = new HttpProxyRules({
  rules: apiPort
    ? {
        "/api/(.*)": `http://localhost:${apiPort}/api/$1`,
      }
    : {},
  default: `http://127.0.0.1:${targetPort}`,
});

var proxy = httpProxy.createProxy({
  xfwd: true,
  ws: true,
});

const server = https.createServer(
  {
    cert: fs.readFileSync(certFilePath, "utf8"),
    key: fs.readFileSync(keyFilePath, "utf8"),
  },
  function (req, res) {
    var target = proxyRules.match(req);
    if (target) {
      return proxy.web(
        req,
        res,
        {
          target: target,
        },
        (err) => {
          console.error(err);
          res.writeHead(500, { "Content-Type": "text/plain" });
          res.end(err.message);
        }
      );
    }
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("The request url and path did not match any of the listed rules!");
  }
);
server.on("upgrade", (req, socket, head) => {
  var target = proxyRules.match(req);
  if (target) {
    return proxy.ws(
      req,
      socket,
      head,
      {
        target: target,
      },
      (err) => {
        console.error(err);
        socket.destroy(err);
      }
    );
  }
  socket.destroy(
    new Error("The request url and path did not match any of the listed rules!")
  );
});
server.listen(httpsPort);
console.log(`Listening on https://localhost:${httpsPort}`);

if (excessArgs.length) {
  const nextProcess = spawn(excessArgs[0], excessArgs.slice(1), {
    stdio: "inherit",
    shell: true,
  });

  nextProcess.on("close", (code) => {
    console.log(`Command exited with code ${code}`);
  });

  process.on("SIGINT", () => nextProcess.kill("SIGINT")); // catch ctrl-c
  process.on("SIGTERM", () => nextProcess.kill("SIGTERM")); // catch kill
}
