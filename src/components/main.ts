import './indicator/indicator'
import './prompt/prompt'
import './menu/menu'
import { rootLog } from '../utils/log'
import { LogLevel } from '../config/config'

rootLog.setLevel(__BUILD_PROFILE === 'debug' ? LogLevel.VVV : LogLevel.S)