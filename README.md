<p align='center'>
  <img src='./logo.svg' width='400' />
</p>

<p align='center'>A command-line tool to quickly create releases.</p>

<p align='center'>English | <a href='./README.zh-CN.md'>简体中文</a></p>

## Usage

### Install

``` bash
pnpm add @hongbusi/release -D
```

### Add script for package.json

``` json
{
  "scripts": {
    "release": "release"
  }
}
```

If you need to publish to `npm`, you need to add the parameter `--publish`.

``` json
{
  "scripts": {
    "release": "release --publish"
  }
}
```

## License

MIT
