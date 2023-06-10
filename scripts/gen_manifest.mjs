import assert from 'node:assert/strict'
export default function (opt) {

    const { version, target } = opt

    {
        assert.ok(typeof version === 'string')
        assert.ok(version.length > 0)

        assert.ok(typeof target === 'string')
        assert.ok(target.length > 0)
    }

    const isFirefox = target.startsWith("firefox")
    const isChromium = target.startsWith("chromium")
    const isTest = target.endsWith("test")

    function contentSecurityPolicy(opt) {
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
        "version": version,
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
    return manifest
}
