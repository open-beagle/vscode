# git

Run VS Code on any machine anywhere and access it in the browser.
[https://github.com/cdr/code-server]

```bash
git remote add upstream git@github.com:cdr/code-server.git
git fetch upstream
git merge v3.12.0
```

## debug

```bash
# wsl prepare env
apt install -y jq g++
export TARGETARCH=amd64
curl https://dl.wodcloud.com/vscode/nfpm/v2.5.1/nfpm_$TARGETARCH.deb >/tmp/nfpm_$TARGETARCH.deb \
  && dpkg -i /tmp/nfpm_$TARGETARCH.deb \
  && rm -rf /tmp/nfpm_$TARGETARCH.deb

# relase
yarn
yarn build
yarn build:vscode
yarn release
yarn release:standalone
yarn test:standalone-release
yarn package

# store-cache
docker run \
  --rm \
  -v $PWD/:/go/src/gitlab.wodcloud.com/cloud/vscode \
  -v /tmp/cache/cloud/vscode/:/cache \
  -w /go/src/gitlab.wodcloud.com/cloud/vscode \
  -e PLUGIN_REBUILD=true \
  -e PLUGIN_CHECK=yarn.lock \
  -e PLUGIN_SUFFIX=amd64 \
  -e PLUGIN_MOUNT=./node_modules/,./release-standalone/node_modules/,./release-standalone/vendor/modules/code-oss-dev/node_modules/,./test/node_modules/,./vendor/modules/ \
  -e DRONE_COMMIT_BRANCH=dev \
  -e CI_WORKSPACE=/go/src/gitlab.wodcloud.com/cloud/vscode \
  registry.cn-qingdao.aliyuncs.com/wod/devops-cache:1.0

# read-cache
docker run \
  --rm \
  -v $PWD/:/go/src/gitlab.wodcloud.com/cloud/vscode \
  -v /tmp/cache/cloud/vscode/:/cache \
  -w /go/src/gitlab.wodcloud.com/cloud/vscode \
  -e PLUGIN_RESTORE=true \
  -e PLUGIN_CHECK=yarn.lock \
  -e PLUGIN_SUFFIX=amd64 \
  -e PLUGIN_MOUNT=./node_modules/,./release-standalone/node_modules/,./release-standalone/vendor/modules/code-oss-dev/node_modules/,./test/node_modules/,./vendor/modules/ \
  -e DRONE_COMMIT_BRANCH=dev \
  -e CI_WORKSPACE=/go/src/gitlab.wodcloud.com/cloud/vscode \
  registry.cn-qingdao.aliyuncs.com/wod/devops-cache:1.0
```

## image amd64

```bash
# release-container
docker run \
  -it \
  --rm \
  -v $PWD/:/go/src/gitlab.wodcloud.com/cloud/vscode \
  -v /usr/local/share/.cache/yarn/:/usr/local/share/.cache/yarn/ \
  -w /go/src/gitlab.wodcloud.com/cloud/vscode \
  -e CXX=g++-10 \
  registry.cn-qingdao.aliyuncs.com/wod/devops-node:14.18.1-bullseye-amd64 \
  bash -c '
    yarn \
      && yarn build \
      && yarn build:vscode \
      && yarn release \
      && yarn release:standalone \
      && yarn test:standalone-release \
      && yarn package \
      && exit'

# image
docker build \
  --build-arg BASE=registry.cn-qingdao.aliyuncs.com/wod/debian:bullseye-vscode \
  --build-arg AUTHOR=shucheng@bd-apaas.com \
  --build-arg VERSION=v3.10.2 \
  --tag registry.cn-qingdao.aliyuncs.com/wod/awecloud-vscode:v3.10.2-alpha \
  --file .beagle/dockerfile .

docker push registry.cn-qingdao.aliyuncs.com/wod/awecloud-vscode:v3.10.2-alpha
```

## image arm64

```bash
# clean
rm -rf release-gcp release-packages release-standalone test/node_modules

# release-container arm64
docker run \
  -it \
  --rm \
  -v $PWD/:/go/src/gitlab.wodcloud.com/cloud/vscode \
  -v /usr/local/share/.cache/yarn/:/usr/local/share/.cache/yarn/ \
  -w /go/src/gitlab.wodcloud.com/cloud/vscode \
  registry.cn-qingdao.aliyuncs.com/wod/devops-node:14.18.1-bullseye-arm64 \
  bash -c '
    yarn release:standalone \
      && yarn test:standalone-release \
      && yarn package \
      && exit'

# store-cache
docker run \
  --rm \
  -v $PWD/:/go/src/gitlab.wodcloud.com/cloud/vscode \
  -v /tmp/cache/cloud/vscode/:/cache \
  -w /go/src/gitlab.wodcloud.com/cloud/vscode \
  -e PLUGIN_REBUILD=true \
  -e PLUGIN_CHECK=yarn.lock \
  -e PLUGIN_SUFFIX=arm64 \
  -e PLUGIN_MOUNT=./release-standalone/node_modules/,./release-standalone/vendor/modules/code-oss-dev/node_modules/ \
  -e DRONE_COMMIT_BRANCH=dev \
  -e CI_WORKSPACE=/go/src/gitlab.wodcloud.com/cloud/vscode \
  registry.cn-qingdao.aliyuncs.com/wod/devops-cache:1.0

# read-cache
docker run \
  --rm \
  -v $PWD/:/go/src/gitlab.wodcloud.com/cloud/vscode \
  -v /tmp/cache/cloud/vscode/:/cache \
  -w /go/src/gitlab.wodcloud.com/cloud/vscode \
  -e PLUGIN_RESTORE=true \
  -e PLUGIN_CHECK=yarn.lock \
  -e PLUGIN_SUFFIX=arm64 \
  -e PLUGIN_MOUNT=./release-standalone/node_modules/,./release-standalone/vendor/modules/code-oss-dev/node_modules/ \
  -e DRONE_COMMIT_BRANCH=dev \
  -e CI_WORKSPACE=/go/src/gitlab.wodcloud.com/cloud/vscode \
  registry.cn-qingdao.aliyuncs.com/wod/devops-cache:1.0

# image arm64
docker build \
  --build-arg BASE=registry.cn-qingdao.aliyuncs.com/wod/debian:bullseye-vscode-arm64 \
  --build-arg AUTHOR=shucheng@bd-apaas.com \
  --build-arg VERSION=v3.10.2 \
  --tag registry.cn-qingdao.aliyuncs.com/wod/awecloud-vscode:v3.10.2-alpha-arm64 \
  --file .beagle/dockerfile .

docker push registry.cn-qingdao.aliyuncs.com/wod/awecloud-vscode:v3.10.2-alpha-arm64
```
