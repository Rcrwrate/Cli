import { join } from "path"
import fs from 'fs'

fs.mkdir(".cache", () => { })
const cache_path = join(".cache", "cache.json")

class cache {
    protected data: { [key: string]: any | undefined } = {}

    constructor() {
        this.load()
    }

    get<T>(key: string) {
        return this.data[key] as T | undefined
    }

    set<T>(key: string, value: T) {
        this.data[key] = value
        return value
    }

    delete(key: string) {
        delete this.data[key]
    }

    /**
     * 列表push
     * @param key 
     * @param value 
     */
    push<T>(key: string, value: T) {
        if (this.data[key] instanceof Array) {
            (this.data[key] as Array<T>).push(value)
        } else {
            this.data[key] = [value]
        }
    }

    load() {
        try {
            this.data = JSON.parse(fs.readFileSync(cache_path, { encoding: "utf-8" }))
        } catch {

        }
    }

    save() {
        fs.writeFileSync(cache_path, JSON.stringify(this.data), { encoding: "utf-8" })
    }
}

export { cache }