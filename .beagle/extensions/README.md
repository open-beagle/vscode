# debug

```bash
# image
docker build \
  --build-arg BASE=registry.cn-qingdao.aliyuncs.com/wod/alpine-data:3.12 \
  --build-arg AUTHOR=shucheng@bd-apaas.com \
  --build-arg VERSION=go-1.16.3 \
  --tag registry.cn-qingdao.aliyuncs.com/wod/code-server-extensions:go-1.16.3 \
  --file /data/volumes/vscode-code-server-pvc-ead56078-3be2-4b8d-aee7-9ec3a9518190/.beagle/extensions/dockerfile /data/volumes/vscode-code-server-pvc-ead56078-3be2-4b8d-aee7-9ec3a9518190

docker push registry.cn-qingdao.aliyuncs.com/wod/code-server-extensions:go-1.16.3
```
