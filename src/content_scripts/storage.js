class BlobStorage {

    static get EXPIRE_TIME() {
        // 30s
        return Date.now() + 30 * 1000;
    }

    constructor() {
        this.map = new Map();
        this.doRecycleTask = this.doRecycleTask.bind(this);
        this.doRecycleTask();
    }

    doRecycleTask() {
        const now = Date.now();
        const entries = this.map.entries();
        let cnt = 0;
        for (const [key, data] of entries) {
            const [url, expireTime, revoke] = data;
            if (expireTime >= now) {
                if (revoke === true && url.protocol === "blob:") {
                    URL.revokeObjectURL(url.toString());
                }
                cnt += 1;
                this.map.delete(key);
                consoleUtil.log("recycle url:", url);
            }
        }
        window.setTimeout(this.doRecycleTask, 60 * 1000);
    }

    /**
     *
     * @param {URL} url
     */
    storeURL(url, revoke = false) {
        let key = '';
        switch (url.protocol) {
            case 'data:':
                key = `${Date.now()}`
                break
            case 'blob:':
            case 'http:':
            case 'https:':
            case 'ftp:':
                key = url.toString()
                break
            default:
                throw new Error("unsupported protocol");
        }
        this.map.set(key, [url, BlobStorage.EXPIRE_TIME, revoke]);
        return key;
    }

    /**
     *
     * @param {File} file
     */
    storgeFile(file) {
        // 不使用的话，浏览器是否会一直保持这个文件的引用?
        const url = URL.createObjectURL(file);
        return this.storeURL(url, true);
    }

    async consume(key) {
        const [url, time, revoke] = this.map.get(key);
        // TODO: CORS
        const res = await fetch(url);
        const arrayBuffer = await res.arrayBuffer();

        this.map.delete(key);
        if (true === revoke) {
            URL.revokeObjectURL(url);
        }
        consoleUtil.log(`consume: ${key}, url: ${url}`);
        return arrayBuffer;
    }

}
