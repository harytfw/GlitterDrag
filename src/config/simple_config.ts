export const simpleConfig = {
  "actions": [
    {
      "id": "3009c98e-cc46-4451-a30b-1680bb61aacc",
      "name": "Copy Link  Text",
      "command": "copy",
      "condition": {
        "contextTypes": [
          "link"
        ],
        "modes": [
          "normal"
        ],
        "directions": [
          "right"
        ]
      },
      "prompt": "",
      "config": {
        "preferDataTypes": [
          "linkText"
        ],
        "activeTab": false,
        "tabPosition": "next",
        "container": ""
      }
    },
    {
      "id": "7d324606-bb1b-4566-b887-f068567d8597",
      "name": "Copy Link ",
      "command": "copy",
      "condition": {
        "contextTypes": [
          "link"
        ],
        "modes": [
          "normal"
        ],
        "directions": [
          "left"
        ]
      },
      "prompt": "",
      "config": {
        "preferDataTypes": [
          "link"
        ],
        "activeTab": false,
        "tabPosition": "next",
        "container": ""
      }
    },
    {
      "id": "7ee77a6c-f1f6-49f4-8ad0-ca619eeab9c9",
      "name": "Open Link Background",
      "command": "open",
      "condition": {
        "contextTypes": [
          "link"
        ],
        "modes": [
          "normal"
        ],
        "directions": [
          "down"
        ]
      },
      "prompt": "",
      "config": {
        "preferDataTypes": [],
        "activeTab": false,
        "tabPosition": "next",
        "container": ""
      }
    },
    {
      "id": "bd0603ed-7adc-42ab-b97b-80811c1478f1",
      "name": "Open Link Foreground",
      "command": "open",
      "condition": {
        "contextTypes": [
          "link"
        ],
        "modes": [
          "normal"
        ],
        "directions": [
          "up"
        ]
      },
      "prompt": "",
      "config": {
        "preferDataTypes": [],
        "activeTab": true,
        "tabPosition": "next",
        "container": ""
      }
    },
    {
      "id": "b8df32df-ac46-4bec-b83b-8de262c790e9",
      "name": "Download Image",
      "command": "download",
      "condition": {
        "contextTypes": [
          "image"
        ],
        "modes": [
          "normal"
        ],
        "directions": [
          "right"
        ]
      },
      "prompt": "",
      "config": {
        "preferDataTypes": [
          "imageSource"
        ],
        "activeTab": false,
        "tabPosition": "next",
        "container": "",
        "directory": "",
        "showSaveAsDialog": false
      }
    },
    {
      "id": "3364a61b-4646-487d-ba5d-9006a16ccfb2",
      "name": "Copy Image",
      "command": "copy",
      "condition": {
        "contextTypes": [
          "image"
        ],
        "modes": [
          "normal"
        ],
        "directions": [
          "left"
        ]
      },
      "prompt": "",
      "config": {
        "preferDataTypes": [
          "image"
        ],
        "activeTab": false,
        "tabPosition": "next",
        "container": ""
      }
    },
    {
      "id": "a0157052-c4df-416c-8f28-e59d57ca0fa5",
      "name": "Open Image Background",
      "command": "open",
      "condition": {
        "contextTypes": [
          "image"
        ],
        "modes": [
          "normal"
        ],
        "directions": [
          "down"
        ]
      },
      "prompt": "",
      "config": {
        "preferDataTypes": [
          "imageSource"
        ],
        "activeTab": false,
        "tabPosition": "next",
        "container": ""
      }
    },
    {
      "id": "aa0bd4df-5008-4ddb-877c-64f934544403",
      "name": "Open Image Foreground",
      "command": "open",
      "condition": {
        "contextTypes": [
          "image"
        ],
        "modes": [
          "normal"
        ],
        "directions": [
          "up"
        ]
      },
      "prompt": "",
      "config": {
        "preferDataTypes": [
          "imageSource"
        ],
        "activeTab": true,
        "tabPosition": "next",
        "container": ""
      }
    },
    {
      "id": "9980c414-9d94-45af-bf51-43ac0ff9a4e8",
      "name": "Google Search Background",
      "command": "request",
      "condition": {
        "contextTypes": [
          "selection"
        ],
        "modes": [
          "normal"
        ],
        "directions": [
          "down"
        ]
      },
      "prompt": "",
      "config": {
        "activeTab": false,
        "tabPosition": "next",
        "requestId": "ee083ad8-cbc2-420c-8621-41231a0869bf",
        "container": ""
      }
    },
    {
      "id": "fb35c602-7ba7-4572-9077-3feb3fb9fbf1",
      "name": "DuckDuckGo Search",
      "command": "request",
      "condition": {
        "contextTypes": [
          "selection"
        ],
        "modes": [
          "normal"
        ],
        "directions": [
          "right"
        ]
      },
      "prompt": "",
      "config": {
        "activeTab": true,
        "tabPosition": "next",
        "requestId": "ee083ad8-cbc2-420c-8621-41231a0869bf",
        "container": ""
      }
    },
    {
      "id": "c30787f1-8ea8-4fef-8839-b16f6cdf681e",
      "name": "Bing Search ",
      "command": "request",
      "condition": {
        "contextTypes": [
          "selection"
        ],
        "modes": [
          "normal"
        ],
        "directions": [
          "left"
        ]
      },
      "prompt": "",
      "config": {
        "activeTab": true,
        "tabPosition": "next",
        "requestId": "e32628a9-ccd6-477e-8509-2c4a56d05e7b",
        "container": ""
      }
    },
    {
      "id": "d9088b74-1880-4161-8bc4-39f1b0399a90",
      "name": "Google Search",
      "command": "request",
      "condition": {
        "contextTypes": [
          "selection"
        ],
        "modes": [
          "normal"
        ],
        "directions": [
          "up"
        ]
      },
      "prompt": "",
      "config": {
        "activeTab": true,
        "tabPosition": "next",
        "requestId": "ee083ad8-cbc2-420c-8621-41231a0869bf",
        "container": ""
      }
    }
  ],
  "common": {
    "minDistance": 50,
    "mode": {
      "link": "normal",
      "selection": "normal"
    }
  },
  "requests": [
    {
      "id": "ee083ad8-cbc2-420c-8621-41231a0869bf",
      "name": "Google Search",
      "url": " https://www.google.com/search?q=%s"
    },
    {
      "id": "e32628a9-ccd6-477e-8509-2c4a56d05e7b",
      "name": "Bing Search",
      "url": "https://www.bing.com/search?q=%s"
    },
    {
      "id": "209e61f3-4128-4138-af50-88d5890e1ae4",
      "name": "DuckDuckGo Search",
      "url": "https://duckduckgo.com/?q=%s&ia=web"
    },
    {
      "id": "c4a296c0-90b3-4cff-adbf-9fc5cd72900f",
      "name": "StartPage Search",
      "url": "https://www.startpage.com/do/search?&cat=web&query=%s"
    }
  ]
}