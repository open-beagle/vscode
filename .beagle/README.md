# git

Run VS Code on any machine anywhere and access it in the browser.[https://github.com/cdr/code-server]

```bash
git remote add upstream git@github.com:cdr/code-server.git
git fetch upstream
git merge v3.9.3
```

## debug

```bash
# 应用Patch
git apply .beagle/0001-meta_icon.patch

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
```
