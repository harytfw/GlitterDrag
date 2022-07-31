import { URLFixer } from './url'
import { assertEqual, assertFail, assertOk } from './test_helper';
import { rootLog } from './log';

describe('test url fixer', () => {
  const fixer = new URLFixer()

  it('good url', () => {
    const urls = [
      "http://example.com/",
      "http://example.org/",
      "http://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/main/win-64"
    ]
    for (const c of urls) {
      assertEqual(fixer.fix(c).toString(), c)
    }
  })

  it('bad url', () => {

    const urls = [
      "12345",
      "a::b"
    ]

    for (const c of urls) {
      assertFail(fixer.fix(c), c)
    }

  });

  it('valid ipv4', () => {
    const urls = [
      "8.8.8.8",
      "192.168.1.1",
      "127.0.0.1"
    ]
    for (const c of urls) {
      assertOk(fixer.fix(c), c)
    }
  });

  it('valid ipv6', () => {
    const urls = [
      "2001:db8:0:0:1:0:0:1",
      "2001:db8::1:0:0:1",
      "::1"
    ]
    for (const c of urls) {
      assertFail(fixer.fix(c), "not support plain ipv6: ", c)
      assertOk(fixer.fix("[" + c + "]"), "ipv6 url: ", c)
    }
  });

  it('fix url', () => {
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
      assertEqual(fixed, c[1], "expected: ", c[1], "but got:", fixed)
    }
  });
});