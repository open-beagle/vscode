# debian:buster-vscode

```bash
# amd64
docker build \
  --build-arg BASE=registry.cn-qingdao.aliyuncs.com/wod/debian:buster \
  --build-arg AUTHOR=mengkzhaoyun@gmail.com \
  --build-arg VERSION=buster-vscode \
  --tag registry.cn-qingdao.aliyuncs.com/wod/debian:buster-vscode \
  --file .beagle/base/dockerfile .beagle/base/

docker push registry.cn-qingdao.aliyuncs.com/wod/debian:buster-vscode

# arm64
docker build \
  --build-arg BASE=registry.cn-qingdao.aliyuncs.com/wod/debian:buster-arm64 \
  --build-arg AUTHOR=mengkzhaoyun@gmail.com \
  --build-arg VERSION=buster-vscode \
  --tag registry.cn-qingdao.aliyuncs.com/wod/debian:buster-vscode-arm64 \
  --file .beagle/base/dockerfile .beagle/base/

docker push registry.cn-qingdao.aliyuncs.com/wod/debian:buster-vscode-arm64
```
