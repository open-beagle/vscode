#!/usr/bin/env bash
set -euo pipefail

main() {
  cd "$(dirname "${0}")/../.."
  source ./ci/lib.sh

  if [[ -d "$RELEASE_PATH-standalone/node_modules" ]]; then
    mkdir -p /tmp/cloud/vscode/release-standalone
    mv "$RELEASE_PATH-standalone/node_modules" /tmp/cloud/vscode/release-standalone/
  fi

  if [[ -d "$RELEASE_PATH-standalone/lib/vscode/node_modules" ]]; then
    mkdir -p /tmp/cloud/vscode/release-standalone/lib/vscode
    mv "$RELEASE_PATH-standalone/lib/vscode/node_modules" /tmp/cloud/vscode/release-standalone/lib/vscode/
  fi

  rsync "$RELEASE_PATH/" "$RELEASE_PATH-standalone"
  RELEASE_PATH+=-standalone

  # We cannot find the path to node from $PATH because yarn shims a script to ensure
  # we use the same version it's using so we instead run a script with yarn that
  # will print the path to node.
  local node_path
  node_path="$(yarn -s node <<<'console.info(process.execPath)')"

  mkdir -p "$RELEASE_PATH/bin"
  rsync ./ci/build/code-server.sh "$RELEASE_PATH/bin/code-server"
  rsync "$node_path" "$RELEASE_PATH/lib/node"

  ln -s "./bin/code-server" "$RELEASE_PATH/code-server"
  ln -s "./lib/node" "$RELEASE_PATH/node"

  if [[ -d "/tmp/cloud/vscode/release-standalone/node_modules" ]]; then
    mv /tmp/cloud/vscode/release-standalone/node_modules "$RELEASE_PATH/"
  fi

  if [[ -d "/tmp/cloud/vscode/release-standalone/lib/vscode/node_modules" ]]; then
    mv /tmp/cloud/vscode/release-standalone/lib/vscode/node_modules "$RELEASE_PATH/lib/vscode/"
  fi

  cd "$RELEASE_PATH"
  yarn --production --frozen-lockfile
}

main "$@"
