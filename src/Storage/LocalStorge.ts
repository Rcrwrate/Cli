import { join } from 'path'
import { StorageProvider, type encode } from "./default";
import { existsSync, mkdirSync } from 'fs'
import { writeFile, readFile, readdir } from 'fs/promises'

class LocalProvider extends StorageProvider {
    protected path: string

    /**
     * @param path 根目录 例如 [".tmp","2024.1.1"] 
     */
    constructor(path: string[] = [".data"]) {
        super();
        this.path = join(...path)
    }

    async init(): Promise<void> {
        if (!existsSync(this.path)) {
            mkdirSync(this.path, { recursive: true })
        }
    }

    async exist(name: string): Promise<boolean> {
        return existsSync(join(this.path, name))
    }

    async readdir<T extends {} = {}>(path: string): Promise<{ exist: false; } | { exist: true; data: ({ name: string; } & T)[]; }> {
        try {
            const d = await readdir(join(this.path, path))
            return { exist: true, data: d.map(i => { return { name: i } as { name: string; } & T }) }
        } catch {
            return { exist: false }
        }
    }

    async readString(filename: string, option: { encoding: encode; flag?: string | number | undefined; signal?: AbortSignal | undefined; } | encode): Promise<string | undefined> {
        try {
            return await readFile(join(this.path, filename), option)
        } catch {
            return
        }
    }

    async readBuffer(filename: string, option?: { flag?: string | number | undefined; signal?: AbortSignal | undefined; } | undefined): Promise<Buffer | undefined> {
        try {
            return await readFile(join(this.path, filename), option)
        } catch {
            return
        }
    }

    protected async writeResponse(r: Response, filename: string): Promise<any> {
        return writeFile(join(this.path, filename), new DataView(await r.arrayBuffer()))
    }

    protected async writeString(r: string, filename: string): Promise<any> {
        return writeFile(join(this.path, filename), r)
    }
}

export { LocalProvider }