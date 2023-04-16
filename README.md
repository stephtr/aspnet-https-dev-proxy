# aspnet-https-dev-proxy

A HTTPS dev proxy that reuses the ASP.NET SSL development certificate.

## Installation

You can install `aspnet-https-dev-proxy` from the NPM registry using the following command: `npm install -D aspnet-https-dev-proxy`

## Usage

You can start the aspnet-https-dev-proxy with the following command:

`aspnet-https-dev-proxy --port 3000 --httpsPort 3001 --apiPort 5000`

This will start the proxy server, which will be serving at localhost:${httpsPort}, and map incoming requests to the server running at localhost:${port}. Optionally, you can specify an apiPort to map incoming requests of the form /api/\* to a dedicated server running at localhost:${apiPort}.

You can also supply additional arguments separated by --, which will be executed as a script as soon as the proxy server is started. For example:

`node runProxy.mjs --apiPort 5156 --port 3100 --httpsPort 3000 -- npm run next dev -p 3100`

This will start proxy server and in addition also the NextJS dev server.

## Further information

The ASP.NET SSL dev certificate gets exported to `~/.aspnet/https/proxy.pem/key` (Linux) or `%APPDATA%\ASP.NET\https\proxy.pem/key` (Windows), the same technique used by [dotnet's SPA templates](https://github.com/dotnet/spa-templates/blob/3c41fe26f7c51fc85fbc97b92871765467dd533c/src/content/React-CSharp/ClientApp/aspnetcore-https.js).

## Changelog

### 1.0.0

- initial release
