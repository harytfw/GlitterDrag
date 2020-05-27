const assert = require("assert");
const urlUtil = require("../src/common/url_util");

var data = [
    // url, seem as url, after fix

    // http
    ["http://example.org", true, "http://example.org"],
    ["ttp://example.org", true, "http://example.org"],
    ["tp://example.org", true, "http://example.org"],
    ["p://example.org", true, "http://example.org"],

    ["://example.org", true, "http://example.org"],
    ["//example.org", true, "http://example.org"],
    ["/example.org", true, "http://example.org"],
    ["example.org", true, "http://example.org"],

    // https
    ["https://example.org", true, "https://example.org"],
    ["ttps://example.org", true, "https://example.org"],
    ["tps://example.org", true, "https://example.org"],
    ["ps://example.org", true, "https://example.org"],
    ["s://example.org", true, "https://example.org"],

    ["http://example.org/s?x=1", true, "http://example.org/s?x=1"],

    // ipv4
    ["192.168.1.1:80", true, "http://192.168.1.1:80"],
    ["192.168.1.1:80/s?x=1", true, "http://192.168.1.1:80/s?x=1"],

    // scheme + ipv4
    ["http://192.168.1.1", true, "http://192.168.1.1"],
    ["http://192.168.1.1/s?x=1", true, "http://192.168.1.1/s?x=1"],
    ["http://192.168.1.1:80/s?x=1", true, "http://192.168.1.1:80/s?x=1"],
    ["tp://192.168.1.1:80/s?x=1", true, "http://192.168.1.1:80/s?x=1"],

    // ipv6
    ["::1", true, "http://[::1]"],
    ["[::1]", true, "http://[::1]"],

    // scheme + ipv6
    ["http://[::1]", true, "http://[::1]"],
    ["http://[::1]/s?x=1", true, "http://[::1]/s?x=1"],
    ["tp://[::1]", true, "http://[::1]"],
    ["tp://[::1]:80/", true, "http://[::1]:80/"],

    // other scheme
    ["about:about", true, "about:about"],

    ["magnet:?xt=urn:ed2k:31D6CFE0D16AE931B73C59D7E0C089C0&xl=0&dn=zero_len.fil", true,
        "magnet:?xt=urn:ed2k:31D6CFE0D16AE931B73C59D7E0C089C0&xl=0&dn=zero_len.fil"],

    ["sms:+10000?body=hello%20there", true, "sms:+10000?body=hello%20there"],

    [`data:image/png;base64,iVBORw0KGgoAAA
    ANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4
    //8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU
    5ErkJggg==`, true, `data:image/png;base64,iVBORw0KGgoAAA
    ANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4
    //8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU
    5ErkJggg==`],

    ["view-source:http://en.wikipedia.org/wiki/URI_scheme",
        true, "view-source:http://en.wikipedia.org/wiki/URI_scheme"],

    ["ftp://x.com", true, "ftp://x.com"],
    // wired
    ["e:n.gl.15i/sh", true, "e:n.gl.15i/sh"],

    ["://", false, "://"],
    ["asd//", false, "asd//"],
    [":asdasd//", false, ":asdasd//"],
    ["asdopkerwetufbvx", false, "asdopkerwetufbvx"],
    ["中文", false, "中文"],
    ["english", false, "english"],
    ["english\nchinese", false, "english\nchinese"],

    ["中国.中国", false, "中国.中国"],


];

function test() {
    for (const row of data) {
        console.info("check: ", row);
        assert.deepEqual(urlUtil.seemAsURL(row[0]), row[1],
            `[${row}], seemAsURL("${row[0]}") should equal to ${row[1]}, but got ${urlUtil.seemAsURL(row[0])}`,
        );
        assert.deepEqual(urlUtil.fixSchemer(row[0]), row[2],
            `${row}, fixSchemer("${row[0]}") should euqal to ${row[2]}, but got ${urlUtil.fixSchemer(row[0])}`,
        );
    }
}
test();
