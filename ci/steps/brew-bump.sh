#!/usr/bin/env bash
set -euo pipefail

main() {
  cd "$(dirname "$0")/../.."
  # Only sourcing this so we get access to $VERSION
  source ./ci/lib.sh

  # NOTE: we need to make sure cdrci/homebrew-core
  # is up-to-date
  # otherwise, brew bump-formula-pr will use an
  # outdated base
  echo "Cloning cdrci/homebrew-core"
  git clone https://github.com/cdrci/homebrew-core.git

  echo "Changing into homebrew-core directory"
  cd homebrew-core && pwd

  echo "Adding Homebrew/homebrew-core as $(upstream)"
  git remote add upstream https://github.com/Homebrew/homebrew-core.git

  echo "Fetching upstream Homebrew/hombrew-core commits"
  git fetch upstream

  echo "Merging in latest Homebrew/homebrew-core changes"
  git merge upstream/master

  echo "Pushing changes to cdrci/homebrew-core fork on GitHub"
  # Source: https://serverfault.com/a/912788
  # shellcheck disable=SC2016,SC2028
  echo '#!/bin/sh\nexec echo "$HOMEBREW_GITHUB_API_TOKEN"' > "$HOME"/.git-askpass.sh
  # Ensure it's executable since we just created it
  chmod +x "$HOME/.git-askpass.sh"
  # GIT_ASKPASS lets us use the password when pushing without revealing it in the process list
  # See: https://serverfault.com/a/912788
  GIT_ASKPASS="$HOME/.git-askpass.sh" git push https://cdr-oss@github.com/cdr-oss/homebrew-core.git --all

  # Find the docs for bump-formula-pr here
  # https://github.com/Homebrew/brew/blob/master/Library/Homebrew/dev-cmd/bump-formula-pr.rb#L18
  local output
  if ! output=$(brew bump-formula-pr --version="${VERSION}" code-server --no-browse --no-audit 2>&1); then
    if [[ $output == *"Duplicate PRs should not be opened"* ]]; then
      echo "$VERSION is already submitted"
    else
      echo "$output"
      exit 1
    fi
  fi

  # Clean up and remove homebrew-core
  cd ..
  rm -rf homebrew-core
}

main "$@"
