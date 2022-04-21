<p align='center'>
  <img src='./logo.svg' width='400' />
</p>

<p align='center'>快速创建 release 的命令行工具。</p>

<p align='center'><a href='./README.md'>English</a> | 简体中文</p>

## 使用

### 安装

``` bash
pnpm add @hongbusi/release -D
```

### 添加 script 到 package.json

``` json
{
  "scripts": {
    "release": "release"
  }
}
```

如果需要发布到 `npm`，需要添加参数 `--publish`

``` json
{
  "scripts": {
    "release": "release --publish"
  }
}
```

### 添加 git action 

``` yml
on:
  push:
    tags:
      - 'v*'

name: Create Release

jobs:
  build:
    name: Create Release
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@master
      - name: Create Release for Tag
        id: create_release
        uses: Hongbusi/create-release@main
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.ref }}

```

到这里就配置完成了，开始享受吧。

## License

MIT
