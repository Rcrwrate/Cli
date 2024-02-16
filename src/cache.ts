import { join } from "path"
import fs from 'fs'

fs.mkdir(".cache", () => { })
const cache_path = join(".cache", "cache.json")

class cache {
    protected data: { [key: string]: any | undefined } = {}

    constructor() {
        this.load()
    }

    get(key: string) {
        return this.data[key]
    }

    set(key: string, value: any) {
        this.data[key] = value
        return value
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