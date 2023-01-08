
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

## Limitation

The extension has limited support at these situation:

- Can not work on privilege pages or restricted pages, like <about:home>, <https://addons.mozilla.org>, <chrome:newtab>
- Can not work when dragging any selection from page A and dropping at page B, and page A and page B have different origin. (For example, [host page](www.example.com) is A, it embeds [youtube video](https://www.youtube.com/embed/-88qGXDmh3E) as B)
- When host page explicitly uses drag-and-drop features, the extension will stop working temporarily
- Unable show icon of menu on when [CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/Sources#sources) of host page prohibits *data:* URLs
