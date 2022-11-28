
## GlitterDrag Pro

![](https://img.shields.io/github/license/harytfw/GlitterDrag)

A good drag and drop extension that improve your browsing experience. Currently support Firefox, Chrome, Edge and other chromium-based browser.

## Features

- Built with Manifest V3
- Support multiple operation mode: chain directions, normal direction, menu
- Create your custom action, and perform different action on different selected content: text selection, link, image, and execute pre-defined command on your selection
- Allow commands: Open, Search, Copy, Download, Execute Script. And corresponding configurations: tab position, download directory, search engine.
- Display prompt on performing action

## How To Build

To build extension, you need: node v16, pnpm v7, make, git

```bash
cd <project directory>
pnpm install
make ext-firefox 
make ext-chromium 
```

After the build process completed, `./build/firefox/dist` contains compiled result, `./build/firefox/artifacts` contains package file.
