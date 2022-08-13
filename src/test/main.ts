import './mocha_init'

import '../utils/url.test'
import '../utils/log.test'
import '../utils/var_substitute.test'
import '../config/config.test'
import '../content_scripts/utils.test'
import "../background/context.test"
// import "../background/executor.test"
import "../background/utils.test"
import "../background/search.test"
import "../components/indicator/indicator.test"
import "../components/menu/menu.test"
import "../components/menu/menu.test"

mocha.run()
