# debug

```bash
# image
docker build \
  --build-arg BASE=registry.cn-qingdao.aliyuncs.com/wod/alpine-data:3.12 \
  --build-arg AUTHOR=shucheng@bd-apaas.com \
  --build-arg VERSION=0.24.2 \
  --tag registry.cn-qingdao.aliyuncs.com/wod/code-server-go-extensions:0.24.2 \
  --file .beagle/extensions/dockerfile .local

docker push registry.cn-qingdao.aliyuncs.com/wod/code-server-go-extensions:0.24.2
```
