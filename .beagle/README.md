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
-e PLUGIN_MOUNT=./node_modules,./lib/vscode/node_modules,./lib/vscode/build/node_modules \
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

docker run \
-it \
--rm \
-v $PWD/:/go/src/gitlab.wodcloud.com/cloud/vscode \
-v /usr/local/share/.cache/yarn/:/usr/local/share/.cache/yarn/ \
-w /go/src/gitlab.wodcloud.com/cloud/vscode \
registry.cn-qingdao.aliyuncs.com/wod/devops-node:12.22.1-buster-arm64 \
bash -c '
yarn && \
yarn build && \
yarn build:vscode && \
yarn release && \
yarn release:standalone && \
yarn test:standalone-release && \
yarn package
'
```
