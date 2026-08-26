{
  description = "FHS development environment for dash-network-deploy";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs = { self, nixpkgs }:
    let
      system = "x86_64-linux";
      pkgs = nixpkgs.legacyPackages.${system};

      fhsEnv = pkgs.buildFHSEnv {
        name = "dash-network-deploy-env";
        targetPkgs = pkgs: with pkgs; [
          # Node.js
          nodejs_22
          corepack_22

          # Infrastructure
          terraform
          packer
          ansible
          docker-client

          # Python 3 (Ansible interpreter at /usr/bin/python3)
          python3

          # AWS
          awscli2

          # Network / VPN
          openssh
          openvpn
          curl
          wget

          # Utilities
          git
          jq
          bash
          coreutils
          gnugrep
          gnused
          gawk
          findutils
          gnutar
          gzip
          which

          # Libraries for native node modules
          stdenv.cc.cc.lib
          openssl
          zlib
          cacert
        ];
        profile = ''
          # Ensure Python 3 is at /usr/bin/python3 for Ansible
          if [ ! -e /usr/bin/python3 ]; then
            mkdir -p /usr/bin 2>/dev/null || true
            ln -sf "$(command -v python3)" /usr/bin/python3 2>/dev/null || true
          fi

          # SSL certs
          export SSL_CERT_FILE="${pkgs.cacert}/etc/ssl/certs/ca-bundle.crt"
          export NIX_SSL_CERT_FILE="$SSL_CERT_FILE"

          # Pass through SSH agent
          export SSH_AUTH_SOCK="''${SSH_AUTH_SOCK:-}"

          # Docker socket
          export DOCKER_HOST="unix:///var/run/docker.sock"
        '';
        runScript = pkgs.writeShellScript "dash-network-deploy-run" ''
          cd "$HOME/code/dash-network-deploy" || exit 1
          if [ $# -eq 0 ]; then
            echo "Entered dash-network-deploy FHS environment"
            echo "Working directory: $(pwd)"
            exec bash
          else
            exec "$@"
          fi
        '';
      };
    in
    {
      packages.${system}.default = fhsEnv;

      # `nix develop` drops you into the FHS env
      devShells.${system}.default = pkgs.mkShell {
        buildInputs = [ fhsEnv ];
        shellHook = ''
          echo "Run 'dash-network-deploy-env' to enter the FHS environment"
        '';
      };

      # `nix run` launches the FHS env directly
      apps.${system}.default = {
        type = "app";
        program = "${fhsEnv}/bin/dash-network-deploy-env";
      };
    };
}
