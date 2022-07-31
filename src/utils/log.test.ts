import { LogLevel } from "../config/config"
import { Logger } from "./log"

describe('test logger', () => {
	it("tag", () =>{
		const log = new Logger(LogLevel.V, "tag")
		log.E("E output")
		log.V("V output")
		log.VV("VV output")
		log.VVV("VVV output")
	})
})