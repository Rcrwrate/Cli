class StorageProvider {
    constructor() { }

    async init() { }

    async exist(name: string): Promise<boolean> {
        return true
    }

    async write(r: Response, filename: string): Promise<any> { }
}

export { StorageProvider }