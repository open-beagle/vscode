# git

Run VS Code on any machine anywhere and access it in the browser.
[https://github.com/cdr/code-server]

```bash
git remote add upstream git@gitlab.wodcloud.com:cdr/code-server.git
git fetch upstream
git merge v3.9.3
```

## debug

```bash
# prepare env
apt install -y jq
curl https://dl.wodcloud.com/vscode/nfpm/v2.5.1/nfpm_$TARGETARCH.deb > /tmp/nfpm_$TARGETARCH.deb && \
dpkg -i /tmp/nfpm_$TARGETARCH.deb && \
rm -rf /tmp/nfpm_$TARGETARCH.deb

# relase
yarn
yarn build
yarn build:vscode
yarn release
yarn release:standalone
yarn test:standalone-release
yarn package

# image
docker build \
  --build-arg BASE=registry.cn-qingdao.aliyuncs.com/wod/debian:buster \
  --build-arg AUTHOR=shucheng@bd-apaas.com \
  --build-arg VERSION=v3.9.3 \
  --tag registry.cn-qingdao.aliyuncs.com/wod/code-server:v3.9.3-alpha \
  --file .beagle/dockerfile .

docker push registry.cn-qingdao.aliyuncs.com/wod/code-server:v3.9.3-alpha

# cache
docker run \
--rm \
-v $PWD/:/go/src/gitlab.wodcloud.com/cloud/vscode \
-v $PWD/dist/cache/:/cache \
-w /go/src/gitlab.wodcloud.com/cloud/vscode \
-e PLUGIN_REBUILD=true \
-e PLUGIN_CHECK=yarn.lock \
-e PLUGIN_MOUNT=./lib/coder-cloud-agent,./lib/vscode/build/lib/watch/node_modules/,./lib/vscode/build/node_modules/,./lib/vscode/extensions/configuration-editing/node_modules/,./lib/vscode/extensions/css-language-features/node_modules/,./lib/vscode/extensions/css-language-features/server/node_modules/,./lib/vscode/extensions/debug-auto-launch/node_modules/,./lib/vscode/extensions/debug-server-ready/node_modules/,./lib/vscode/extensions/emmet/node_modules/,./lib/vscode/extensions/extension-editing/node_modules/,./lib/vscode/extensions/git-ui/node_modules/,./lib/vscode/extensions/git/node_modules/,./lib/vscode/extensions/github-authentication/node_modules/,./lib/vscode/extensions/github/node_modules/,./lib/vscode/extensions/grunt/node_modules/,./lib/vscode/extensions/gulp/node_modules/,./lib/vscode/extensions/html-language-features/node_modules/,./lib/vscode/extensions/html-language-features/server/node_modules/,./lib/vscode/extensions/image-preview/node_modules/,./lib/vscode/extensions/jake/node_modules/,./lib/vscode/extensions/json-language-features/node_modules/,./lib/vscode/extensions/json-language-features/server/node_modules/,./lib/vscode/extensions/markdown-language-features/node_modules/,./lib/vscode/extensions/merge-conflict/node_modules/,./lib/vscode/extensions/microsoft-authentication/node_modules/,./lib/vscode/extensions/node_modules/,./lib/vscode/extensions/notebook-markdown-extensions/node_modules/,./lib/vscode/extensions/npm/node_modules/,./lib/vscode/extensions/php-language-features/node_modules/,./lib/vscode/extensions/search-result/node_modules/,./lib/vscode/extensions/simple-browser/node_modules/,./lib/vscode/extensions/testing-editor-contributions/node_modules/,./lib/vscode/extensions/typescript-language-features/node_modules/,./lib/vscode/extensions/vscode-api-tests/node_modules/,./lib/vscode/extensions/vscode-colorize-tests/node_modules/,./lib/vscode/extensions/vscode-custom-editor-tests/node_modules/,./lib/vscode/extensions/vscode-notebook-tests/node_modules/,./lib/vscode/extensions/vscode-test-resolver/node_modules/,./lib/vscode/node_modules/,./lib/vscode/remote/node_modules/,./lib/vscode/remote/web/node_modules/,./lib/vscode/test/automation/node_modules/,./lib/vscode/test/integration/browser/node_modules/,./lib/vscode/test/monaco/node_modules/,./lib/vscode/test/smoke/node_modules/,./node_modules/,./test/node_modules/ \
-e DRONE_COMMIT_BRANCH=dev \
-e CI_WORKSPACE=/go/src/gitlab.wodcloud.com/cloud/vscode \
registry.cn-qingdao.aliyuncs.com/wod/devops-cache:1.0

# release-container
docker run \
-it \
--rm \
-v $PWD/:/go/src/gitlab.wodcloud.com/cloud/vscode \
-v /usr/local/share/.cache/yarn/:/usr/local/share/.cache/yarn/ \
-w /go/src/gitlab.wodcloud.com/cloud/vscode \
registry.cn-qingdao.aliyuncs.com/wod/devops-node:12.22.1-buster \
bash -c '
yarn && \
yarn build && \
yarn build:vscode && \
yarn release && \
yarn release:standalone && \
yarn test:standalone-release && \
yarn package
'

yarn clean

# release-container arm64
docker run \
-it \
--rm \
-v $PWD/:/go/src/gitlab.wodcloud.com/cloud/vscode \
-v /usr/local/share/.cache/yarn/:/usr/local/share/.cache/yarn/ \
-w /go/src/gitlab.wodcloud.com/cloud/vscode \
registry.cn-qingdao.aliyuncs.com/wod/devops-node:12.22.1-buster-arm64 \
bash -c '
yarn release:standalone && \
yarn test:standalone-release && \
yarn package
'
```
