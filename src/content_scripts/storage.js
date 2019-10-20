class BlobStorage {
    static get SUPPORTED_PROTOCOL() {
        return ['blob:', 'data:', 'http:', 'https:', 'ftp:']
    }

    constructor() {
        this.map = new Map()
        this.doRecycleTask()
    }

    doRecycleTask(expired = 30 * 1000) {
        const now = Date.now()
        const entries = this.map.entries()
        let cnt = 0
        for (const [key, data] of entries) {
            const [url, time, revoke] = data
            if (now - time > expired) {
                if (revoke === true && url.protocol === 'blob:') {
                    URL.revokeObjectURL(url.toString())
                }
                cnt += 1
                this.map.delete(key)
            }
        }
        window.setTimeout(this.doRecycleTask.bind(this), 60 * 1000)
    }

    /**
     * 
     * @param {URL} url 
     */
    storeURL(url, revoke = false) {
        if (!BlobStorage.SUPPORTED_PROTOCOL.includes(url.protocol)) {
            throw new Error('unsupported protocol')
        }
        // switch (url.protocol) {
        //     case 'blob:':
        //         break
        //     case 'data:':
        //         break
        //     case 'http:':
        //     case 'https:':
        //     case 'ftp:':
        //         break
        //     default:
        //         break
        // }
        const key = url.toString()
        this.map.set(key, [url, Date.now(), revoke])
        return key
    }

    /**
     * 
     * @param {File} file 
     */
    storgeFile(file) {
        // 不使用的话，浏览器是否会一直保持这个文件的引用?
        const url = URL.createObjectURL(file)
        return this.storeURL(url, true)
    }

    async consume(key) {
        const [url, time, _] = this.map.get(key)
        console.log(`consume: ${key}, url: ${url}`)
        // TODO: CORS
        const res = await fetch(url, {
            cache: "force-cache"
        })
        const arrayBuffer = await res.arrayBuffer()

        this.map.delete(key)

        return arrayBuffer
    }

}
