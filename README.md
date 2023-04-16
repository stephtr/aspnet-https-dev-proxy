# aspnet-https-dev-proxy

A https proxy which reuses the ASP.NET SSL dev certificate.

## Usage

`aspnet-https-dev-proxy --port 3000 --httpsPort 3001 --apiPort 5000`

This proxy server (serving at `localhost:${httpsPort}`) maps incoming requests to the server running at `localhost:${port}`.
In order to provide an https endpoint, the proxy server reuses the ASP.NET dev SSL certificate by exporting it to a local file.

Optionally, the proxy server will map incoming requests of the form `/api/*` to a dedicated server running at `localhost:${apiPort}`.

By supplying more arguments separated by `--`, a script will be executed as soon as the proxy server is started, for example by setting:

`node runProxy.mjs --apiPort 5156 --port 3100 --httpsPort 3000 -- npm run next dev -p 3100`

## Further information

The SSL certificate gets exported to `~/.aspnet/https/proxy.pem/key` (Linux) or `%APPDATA%\ASP.NET\https\proxy.pem/key` (Windows), the same technique used by [dotnet's SPA templates](https://github.com/dotnet/spa-templates/blob/3c41fe26f7c51fc85fbc97b92871765467dd533c/src/content/React-CSharp/ClientApp/aspnetcore-https.js).

## Changelog

### 1.0.0

- initial release