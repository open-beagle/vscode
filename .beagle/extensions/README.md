# debug

```bash
# image
docker build \
  --build-arg BASE=registry.cn-qingdao.aliyuncs.com/wod/alpine-data:3.12 \
  --build-arg AUTHOR=shucheng@bd-apaas.com \
  --build-arg VERSION=0.24.2 \
  --tag registry.cn-qingdao.aliyuncs.com/wod/code-server-go-extensions:0.24.2 \
  --file /data/volumes/vscode-code-server-pvc-e242f8de-b945-43c2-bd80-0838cf478003/.beagle/extensions/dockerfile /data/volumes/vscode-code-server-pvc-e242f8de-b945-43c2-bd80-0838cf478003/.local

docker push registry.cn-qingdao.aliyuncs.com/wod/code-server-go-extensions:0.24.2
```
