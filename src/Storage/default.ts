import type { Stats } from "fs";

type encode = "utf-8" | "ascii" | "utf8" | "utf16le" | "utf-16le" | "ucs2" | "ucs-2" | "base64" | "base64url" | "latin1" | "binary" | "hex"

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

    /** 读取文件夹内容 */
    async readdir<T extends {} = {}>(path: string): Promise<{ exist: false } | {
        exist: true, data: Array<{ name: string } & T>
    }> {
        return { exist: false }
    }

    /** 读取文件 */
    async readString(filename: string, option: { encoding: encode; flag?: string | number | undefined; signal?: AbortSignal | undefined } | encode): Promise<string | undefined> {
        return
    }

    /** 读取文件 */
    async readBuffer(filename: string, option?: { flag?: string | number | undefined; signal?: AbortSignal | undefined }): Promise<Buffer | undefined> {
        return
    }

    /** 信息访问 */
    async stat(path: string): Promise<Stats> {
        return {} as Stats
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

    /**
     * 创建文件夹，递归创建
     * @param path 
     */
    async mkdir(path: string, option: { recursive: true }): Promise<any> {

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

export { StorageProvider, type encode }