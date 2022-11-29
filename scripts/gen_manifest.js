
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

    if (targetBrowser === "firefox") {
        permissions.push(...[
            "contextualIdentities",
            "cookies"
        ])
    }

    return permissions
}

function manifestBackground() {
    if (targetBrowser === "chromium") {
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
    if (targetBrowser === "firefox") {
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
}

console.log(JSON.stringify(manifest, null, "    "))