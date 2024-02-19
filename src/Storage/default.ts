class StorageProvider {
    constructor() { }

    async init() { }

    /**
     * 判断文件是否存在
     * @param name 
     * @returns 
     */
    async exist(name: string): Promise<boolean> {
        return true
    }

    /**
     * 将数据写入到指定位置
     * @param r 
     * @param filename 
     */
    async write(r: Response | string, filename: string): Promise<any> {
        if (r instanceof Response) {
            return this.writeResponse(r, filename)
        } else if (typeof r === "string") {
            return this.writeString(r, filename)
        } else {
            throw this.error("写入错误:类型不支持")
        }
    }

    /** 将数据写入到指定位置 */
    protected async writeResponse(r: Response, filename: string): Promise<any> { }

    /** 将数据写入到指定位置 */
    protected async writeString(r: string, filename: string): Promise<any> { }

    /** 错误工具 */
    protected error(msg?: string) {
        return new StorageError(msg)
    }
}

class StorageError extends Error {
    name: string = "StorageError"
}

export { StorageProvider }