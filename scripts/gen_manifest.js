
function mustEnv(key) {
    const value = process.env[key]
    if (!value || value.length === 0) {
        console.error("require environment: " + key)
        process.exit(1)
    }
    return value
}


const version = mustEnv("BUILD_VERSION")
const targetBrowser = mustEnv("TARGET_BROWSER")
const isFirefox = targetBrowser.startsWith("firefox")
const isChromium = targetBrowser.startsWith("chromium")
const isTest = targetBrowser.endsWith("test")

function contentSecurityPolicy() {
    if (isFirefox && isTest) {
        // override CSP to allow mocha test connect to a insecure websocket 
        // https://bugzilla.mozilla.org/show_bug.cgi?id=1797086
        return {
            "extension_pages": "script-src 'self'"
        }
    }
    return undefined
}

function manifestPermissions() {
    const permissions = [
        "activeTab",
        "storage",
        "tabs",
        "clipboardWrite",
        "downloads",
        "search",
        "scripting",
        "contextMenus",
        "alarms"
    ]

    if (isFirefox) {
        permissions.push(...[
            "contextualIdentities",
            "cookies"
        ])
    }

    return permissions
}

function manifestBackground() {
    if (isChromium) {
        return {
            "service_worker": "background/main.js"
        }
    }
    return {
        "scripts": [
            "background/main.js"
        ]
    }
}

function manifestVersion() {
    return version
}

function browserSpecificSetting() {
    if (isFirefox) {
        return {
            "gecko": {
                "id": "glitterdragpro@harytfw",
                "strict_min_version": "106.0"
            }
        }
    }
    return undefined
}

const manifest = {
    "manifest_version": 3,
    "name": "__MSG_extensionName__",
    "description": "__MSG_extensionDescription__",
    "version": manifestVersion(),
    "homepage_url": "https://github.com/harytfw/GlitterDrag",
    "icons": {
        "128": "/icon/drag.png"
    },
    "author": "harytfw",
    "permissions": manifestPermissions(),
    "host_permissions": [
        "*://*/*"
    ],
    "background": manifestBackground(),
    "content_scripts": [
        {
            "run_at": "document_end",
            "all_frames": true,
            "matches": [
                "*://*/*"
            ],
            "js": [
                "content_scripts/main.js"
            ]
        }
    ],
    "options_ui": {
        "page": "options/options.html",
        "browser_style": true,
        "open_in_tab": true
    },
    "web_accessible_resources": [
        {
            "resources": [
                "components/main.js"
            ],
            "matches": [
                "*://*/*"
            ]
        }
    ],
    "default_locale": "en",
    "browser_specific_settings": browserSpecificSetting(),
    "content_security_policy": contentSecurityPolicy()
}

console.log(JSON.stringify(manifest, null, "    "))