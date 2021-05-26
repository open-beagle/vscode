# debug

```bash
# image amd64
docker build \
  --build-arg BASE=registry.cn-qingdao.aliyuncs.com/wod/alpine-data:3.12 \
  --build-arg AUTHOR=shucheng@bd-apaas.com \
  --build-arg VERSION=go-1.16.4 \
  --build-arg GOVERSION=1.16.4 \
  --build-arg NODEVERSION=v14.16.1 \
  --build-arg YARNVERSION=v1.22.10 \
  --tag registry.cn-qingdao.aliyuncs.com/wod/awecloud-vscode-extensions:go-1.16.4 \
  --file /go/src/gitlab.wodcloud.com/cloud/vscode/.beagle/extensions/dockerfile /data/volumes/vscode-code-server-pvc-6c7a124e-210f-446c-bd04-30438cb446b8

docker push registry.cn-qingdao.aliyuncs.com/wod/awecloud-vscode-extensions:go-1.16.4

# image arm64
docker build \
  --build-arg BASE=registry.cn-qingdao.aliyuncs.com/wod/alpine-data:3.12-arm64 \
  --build-arg AUTHOR=shucheng@bd-apaas.com \
  --build-arg VERSION=go-1.16.4 \
  --build-arg GOVERSION=1.16.4 \
  --build-arg NODEVERSION=v14.16.1 \
  --build-arg YARNVERSION=v1.22.10 \
  --tag registry.cn-qingdao.aliyuncs.com/wod/awecloud-vscode-extensions:go-1.16.4-arm64 \
  --file /go/src/gitlab.wodcloud.com/cloud/vscode/.beagle/extensions/dockerfile /data/volumes/vscode-code-server-pvc-5a3059e5-ee67-4602-99cd-ffff2181c5a8

docker push registry.cn-qingdao.aliyuncs.com/wod/awecloud-vscode-extensions:go-1.16.4-arm64
```
