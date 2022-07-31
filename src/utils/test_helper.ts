import isEqual from "lodash-es/isEqual"

export function assertEqual<T>(actually: T, expected: T, ...message: any[]) {
	return assertOk(isEqual(actually, expected), ...message)
}

export function assertOk(value: any, ...message: any[]) {
	if (!value) {
		throw new Error(message.join(" "))
	}
}

export function assertFail(value: any, ...message: any[]) {
	if (!!value) {
		throw new Error(message.join(" "))
	}
}