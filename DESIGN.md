# Design
* The build environment is powered by Nix/devenv.sh and is responsible for setting up the development shell containing Node.js, as well as the Caddy web server (for reverse proxying) and Postgres database servers.

* The backend uses the Express.js web server and is responsible for routing as well as database interactions.

* The frontend uses React and is responsible for rendering the web app.