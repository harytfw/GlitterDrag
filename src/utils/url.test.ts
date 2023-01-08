import { URLFixer } from './url'
import { rootLog } from './log';
import { assert } from 'chai'

describe('test url fixer', () => {

  it('good url', () => {
    const fixer = new URLFixer()
    const urls = [
      "http://example.com/",
      "http://example.org/",
      "http://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/main/win-64"
    ]
    for (const c of urls) {
      assert.deepEqual(fixer.fix(c).toString(), c)
    }
  })

  it('bad url', () => {
    const fixer = new URLFixer()

    const urls = [
      "12345",
      "a::b"
    ]

    for (const c of urls) {
      assert.notOk(fixer.fix(c), c)
    }

  });

  it('valid ipv4', () => {
    const fixer = new URLFixer()
    const urls = [
      "8.8.8.8",
      "192.168.1.1",
      "127.0.0.1"
    ]
    for (const c of urls) {
      assert.ok(fixer.fix(c), c)
    }
  });

  it('valid ipv6', () => {
    const fixer = new URLFixer()
    const urls = [
      "2001:db8:0:0:1:0:0:1",
      "2001:db8::1:0:0:1",
      "::1"
    ]
    for (const c of urls) {
      assert.notOk(fixer.fix(c), "not support plain ipv6: " + c)
      assert.ok(fixer.fix("[" + c + "]"), "ipv6 url: " + c)
    }
  });

  it('fix url', () => {
    const fixer = new URLFixer()
    const urls = [
      [
        "www.example.com/a",
        "https://www.example.com/a"
      ],
      [
        "www.example.com/?a=1",
        "https://www.example.com/?a=1"
      ],
      [
        // add slash
        "http://example.com",
        "http://example.com/",
      ],
      [
        "tp://example.com",
        "https://example.com/",
      ],
      [
        "ps://example.com",
        "https://example.com/",
      ]
    ]
    for (const c of urls) {
      const fixed = fixer.fix(c[0]).toString()
      rootLog.VVV("origin: ", c[0], "fixed:", fixed, " expected: ", c[1], " same: ", fixed == c[1])
      assert.deepEqual(fixed, c[1])
    }
  });
  it('special protocol url', function () {
    const fixer = new URLFixer(["magnet:", "mailto:"])
    const urls = [
      "magnet:?xt=urn:btih:000000000000000000000000000&dn",
      "mailto:someone@example.com"
    ]
    for (const url of urls) {
      assert.ok(fixer.fix(url))
    }
  })
});