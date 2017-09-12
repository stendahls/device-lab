var browsersConfig = [
  {
    "name": "Chrome",
    "gaName": "Chrome",
    "uaName": "Chrome",
    "type": "evergreen",
    "age": [
      {
        "name": "Latest",
        "last": 4,
      },
      {
        "name": "Medium",
        "last": 15,
      }
    ]
  },
  {
    "name": "Chrome in-app",
    "gaName": "Android Webview",
    "type": "evergreen",
    "age": [
      {
        "name": "Latest",
        "last": 4,
      },
      {
        "name": "Medium",
        "last": 15,
      }
    ]
  },
  {
    "name": "Safari",
    "gaName": "Safari",
    "uaName": ["Safari","Mobile Safari"],
    "type": "majorVersion",
    "age": 4,
    "translate": [
      {
        "type": "MoreEqualTo",
        "src": 9000,
        "version": 7
      },
      {
        "type": "MoreEqualTo",
        "src": 8000,
        "version": 8
      },
      {
        "type": "MoreEqualTo",
        "src": 600,
        "version": 8
      },
      {
        "type": "MoreEqualTo",
        "src": 538,
        "version": 8
      },
      {
        "type": "MoreEqualTo",
        "src": 537,
        "version": 7
      },
      {
        "type": "MoreEqualTo",
        "src": 536,
        "version": 6
      },
      {
        "type": "MoreEqualTo",
        "src": 100,
        "version": 5
      }
    ]
  },
  {
    "name": "Safari in-app",
    "gaName": "Safari (in-app)",
    "type": "majorVersion"
  },
  {
    "name": "IE",
    "gaName": "Internet Explorer",
    "uaName": ["Internet Explorer","IE","IEMobile"],
    "type": "majorVersion",
    "age": 5
  },
  {
    "name": "Samsung",
    "gaName": "Samsung Internet",
    "uaName": "SamsungBrowser",
    "type": "evergreen",
    "age": [
      {
        "name": "Latest",
        "last": 1,
      },
      {
        "name": "Medium",
        "last": 2,
      }
    ]
  },
  {
    "name": "Firefox",
    "gaName": "Firefox",
    "uaName": "Firefox",
    "type": "evergreen",
    "age": [
      {
        "name": "Latest",
        "last": 4,
      },
      {
        "name": "Medium",
        "last": 10,
      }
    ]
  },
  {
    "name": "Edge",
    "gaName": "Edge",
    "uaName": "Edge",
    "type": "evergreen",
    "age": [
      {
        "name": "Latest",
        "last": 1,
      },
      {
        "name": "Medium",
        "last": 3,
      }
    ]
  },
  {
    "name": "Opera",
    "gaName": "Opera",
    "uaName": "Opera",
    "type": "evergreen",
    "age": [
      {
        "name": "Latest",
        "last": 4,
      },
      {
        "name": "Medium",
        "last": 10,
      }
    ]
  },
  {
    "name": "Opera Mini",
    "gaName": "Opera Mini",
    "uaName": "Opera Mini",
    "type": "evergreen",
    "age": [
      {
        "name": "Latest",
        "last": 4,
      },
      {
        "name": "Medium",
        "last": 10,
      }
    ]
  },
  {
    "name": "Android Browser",
    "gaName": "Android Browser",
    "uaName": "Android Browser",
    "type": "majorVersion",
    "age": 1
  },
  {
    "name": "BlackBerry",
    "gaName": "BlackBerry",
    "uaName": "BlackBerry",
    "type": "majorVersion",
    "age": 1
  }
];