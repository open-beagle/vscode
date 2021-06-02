# debian:bullseye-vscode

```bash
# amd64
docker build \
  --build-arg BASE=registry.cn-qingdao.aliyuncs.com/wod/debian:bullseye \
  --build-arg AUTHOR=mengkzhaoyun@gmail.com \
  --build-arg VERSION=bullseye-vscode \
  --tag registry.cn-qingdao.aliyuncs.com/wod/debian:bullseye-vscode \
  --file .beagle/base/dockerfile .beagle/base/

docker push registry.cn-qingdao.aliyuncs.com/wod/debian:bullseye-vscode

# arm64
docker build \
  --build-arg BASE=registry.cn-qingdao.aliyuncs.com/wod/debian:bullseye-arm64 \
  --build-arg AUTHOR=mengkzhaoyun@gmail.com \
  --build-arg VERSION=bullseye-vscode \
  --tag registry.cn-qingdao.aliyuncs.com/wod/debian:bullseye-vscode-arm64 \
  --file .beagle/base/dockerfile .beagle/base/

docker push registry.cn-qingdao.aliyuncs.com/wod/debian:bullseye-vscode-arm64
```
