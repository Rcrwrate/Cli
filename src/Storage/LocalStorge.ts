import { join } from 'path'
import { StorageProvider } from "./default";
import { existsSync, mkdirSync } from 'fs'
import { writeFile } from 'fs/promises'

class LocalProvider extends StorageProvider {
    path: string
    /**
     * 
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

    async write(r: Response, filename: string): Promise<any> {
        return writeFile(join(this.path, filename), new DataView(await r.arrayBuffer()))
    }
}

export { LocalProvider }