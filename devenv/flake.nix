{
  inputs = {
    devenv = {
      inputs.nixpkgs.follows = "nixpkgs-unstable";
      url = "github:cachix/devenv";
    };
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-24.11";
    nixpkgs-unstable.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
  };
  nixConfig = {
    extra-trusted-public-keys = "devenv.cachix.org-1:w1cLUi8dv3hnoSPGAuibQv+f9TZLr6cv/Hm9XgU50cw= cache.nixos.org-1:6NCHdD59X431o0gWypbMrAURkbJ16ZPMQFGspcDShjY= nix-community.cachix.org-1:mB9FSh9qf2dCimDSUo8Zy7bkq5CX+/rkCWyvRCYg3Fs=";
    extra-substituters = "https://devenv.cachix.org https://cache.nixos.org https://nix-community.cachix.org";
  };
  outputs = {
    devenv,
    nixpkgs,
    nixpkgs-unstable,
    self,
    systems,
    ...
  } @ inputs: let
    for-each-system = nixpkgs.lib.genAttrs (import systems);
  in {
    packages = for-each-system (system: {
      devenv-up = self.devShells.${system}.default.config.procfileScript;
    });
    devShells = for-each-system (system: let
      pkgs = nixpkgs.legacyPackages.${system};
      pkgs-unstable = nixpkgs-unstable.legacyPackages.${system};
    in {
      default = let
        domain = "localhost";
        debug-flag = true;
        db-name = "recipes";
        db-password = "root";
        db-port = 5432;
        db-user = "root";
        subdomain = "recipes";
        server-port = 3000;
      in
      devenv.lib.mkShell {
        inherit inputs pkgs;
        modules = [
          ({config, ...}: {
            certificates = [
              "*.${domain}"
            ];
            enterShell = ''
              sudo sysctl -w net.ipv4.ip_unprivileged_port_start=0
            '';
            hosts = {
              "*.${domain}" = "localhost";
            };
            languages = {
              javascript = {
                enable = true;
                npm = {
                  enable = true;
                };
              };
            };
            packages = [pkgs.procps];
            services = {
              caddy = {
                config = ''
                  {
                  ${if debug-flag then ''
                    debug
                  '' else ""}
                  }
                '';
                enable = true;
                package = pkgs-unstable.caddy;
                virtualHosts."${subdomain}.${domain}" = {
                  extraConfig = ''
                    encode gzip
                    tls ${config.env.DEVENV_STATE}/mkcert/_wildcard.${domain}.pem ${config.env.DEVENV_STATE}/mkcert/_wildcard.${domain}-key.pem
                    reverse_proxy ${domain}:${builtins.toString server-port}
                  '';
                };
              };
              postgres = {
                enable = true;
                initialDatabases = [
                  {
                    name = db-name;
                    user = db-user;
                    pass = db-password;
                  }
                ];
                listen_addresses = domain;
                port = db-port;
              };
            };
          })
        ];
      };
    });
  };
}
