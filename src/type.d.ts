declare class Task {

}

declare class Message {
    /** 注册控制台命令 */
    registerCommand(command: commands | commands[]): void
    /** 注册任务队列 */
    registerTask(tasks: Task | Task[]): void
    /** 推送任务状态 */
    pushStatus({ all, success, error }: {
        all?: number | undefined;
        success?: number | undefined;
        error?: number | undefined;
    }): void
    /** 推送任务日志 */
    pushLog(msg: string, level: loglevel): void
    /** 更改默认日志等级 */
    changeLogLevel(level: loglevel): void
    /** 控制台提示 */
    Tip(msg: string, timeout?: number): NodeJS.Timeout
    /** 缓存控制 */
    cache: cache
    /** 
     * 文件服务
     * 
     * 如果需要替换，请使用changeStorgeProvider
     * @example m.changeStorgeProvider(new LocalProvider([".tmp"]))
     */
    Storage: StorageProvider
    /** 替换文件服务 */
    changeStorgeProvider(S: StorageProvider): Promise<void>;
}

declare class cache {
    get(key: string): any
    set<T>(key: string, value: T): T
    load(): void
    save(): void
}

declare class StorageProvider {
    init(): Promise<void>;
    exist(name: string): Promise<boolean>;
    write(r: Response, filename: string): Promise<any>;
}

declare type commands = { priority: number, func: (input: string, m: Message) => any | Promise<any>, keyword: string[] }
declare type loglevel = "DEBUG" | "INFO" | "WARNING" | "ERROR"

