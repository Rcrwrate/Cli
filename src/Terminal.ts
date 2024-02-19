import ansi from 'sisteransi';
import readline from 'readline/promises';
import pc from 'picocolors'
import { LocalProvider, type StorageProvider } from './Storage';
import type { cache } from './cache';
import type { Task } from './Task';

const p = (s: string) => process.stdout.write(s)

export type commands = {
    /** 优先级，越小越优先 */
    priority: number,
    func: (inputs: string, m: Message) => any | Promise<any>,
    keyword: string[]
    /** 说明文字 */
    help?: string
}
type loglevel = "DEBUG" | "INFO" | "WARNING" | "ERROR"
const logTr = {
    DEBUG: 0,
    INFO: 10,
    WARNING: 20,
    ERROR: 30
}

const logTi = {
    DEBUG: pc.gray("DEBUG"),
    INFO: "INFO",
    WARNING: pc.yellow("WARNING"),
    ERROR: pc.red("ERROR"),
}

class Message {
    private logs: string[] = []
    private loglevel: loglevel = 'INFO'
    private startTime = new Date().getTime()
    private lastScreen = "\n".repeat(7)
    private tip = ""
    private Tid?: NodeJS.Timeout
    private TaskStatus = {
        all: 0,
        success: 0,
        error: 0
    }
    private commands: commands[] = []
    private Tasks: Task[] = []
    private TasksInRun: Task[] = []
    private TaskSession: NodeJS.Timeout[] = []
    private MaxRun = 4
    private rl?: readline.Interface

    /** 缓存服务 */
    cache: cache

    /** 
     * 文件服务
     * 
     * 如果需要替换，请使用changeStorgeProvider
     * @example m.changeStorgeProvider(new LocalProvider([".tmp"]))
     */
    Storage: StorageProvider = new LocalProvider()

    constructor(c: cache) {
        this.cache = c
        p("\n".repeat(70) + "command >\r")

        setTimeout(() => p(ansi.cursor.to(9)), 1000)
        setInterval(() => this.toTerminal(), 500)
        setInterval(async () => this.runTasks(), 500)
        this.start()
        this.registerCommand({
            keyword: ["s"], priority: 10, help: "控制最大线程数量", func: (input, m) => {
                const c = parseInt(input)
                if (isNaN(c)) {
                    this.Tip("\n使用>s +1/-1控制最大线程数量\n", 1000)
                } else {
                    this.MaxRun += c
                    this.Tip(`\n当前最大线程数:${this.MaxRun}\n`, 1000)
                }
            }
        })
        this.Storage.init()
    }

    /**
     * 控制台输入控制服务
     */
    private async start() {
        const rl = this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            completer: (line: string) => this.completer(line)
        })
        rl.on('SIGINT', () => this.Tip("\n请使用q退出\n", 5000))
        let r: string
        r = await rl.question("command >")
        while (true) {
            this.runCommands(r)
            r = await rl.question("command >")
        }
    }

    private completer(line: string) {
        const completions: { key: string, help?: string }[] = [{ key: "q", help: "退出Cli" }, { key: "debug", help: "更改日志等级为DEBUG" }]
        this.commands.forEach(i => { i.keyword.forEach(j => completions.push({ key: j, help: i.help })) })
        const hits = completions.filter((c) => c.key.startsWith(line));
        const hit = hits.find(i => i.key === line)
        if (hit) {
            this.Tip(`\n${hit.key} : ${hit.help ?? "无说明"}`, 1500)
        } else if (hits.length === 1) {
            this.Tip(`\n${hits[0].key} : ${hits[0].help ?? "无说明"}`, 1500)
        } else {
            // Show all completions if none found
            this.Tip(`\n${(hits.length ? hits.map(i => i.key) : completions.map(i => i.key)).join("\t")}`, 1500)
        }

        return [[], line];
    }

    private runCommands(r: string) {
        this.pushLog(r, "DEBUG")
        switch (r) {
            case "q":
                this.Close()
            case "debug":
                this.changeLogLevel("DEBUG")
                break
            default:
                for (const i of this.commands) {
                    for (const j of i.keyword) {
                        if (r.startsWith(j)) {
                            const input = r.replace(j, "").trimStart()
                            return i.func(input, this)
                        }
                    }
                }
                this.Tip("\n未找到相应命令\n", 1000)
        }
    }

    private async Close() {
        this.rl?.pause()
        this.Tip("正在等待任务队列终止", 100000)
        const all = this.TasksInRun.concat(this.Tasks)
        await Promise.all(all.map(i => i.onClose(this)))
        this.rl?.close()
        this.cache.save()
        process.exit(0)
    }

    private async runTasks() {
        if (this.Tasks.length !== 0 && this.TasksInRun.length < this.MaxRun) {
            let t: Task | undefined
            do {
                t = this.Tasks.shift()
                if (t) this.runTask(t)
            } while (t?.noLimit)
        }
    }

    private runTask(task: Task) {
        const id = setTimeout(async () => {
            try {
                await task.Run(this)
                await task.onSuccess(this)
            }
            catch (e) {
                await task.onFailed(this, e as Error)
            }
            this.TaskSession = this.TaskSession.filter(i => i !== id)
            this.TasksInRun = this.TasksInRun.filter(i => i.uuid !== task.uuid)
        })
        this.TasksInRun.push(task)
        this.TaskSession.push(id)
    }

    /**
     * 控制台提示
     * @param msg 
     * @param timeout 
     * @returns 
     */
    Tip(msg: string, timeout: number = 5000) {
        this.tip = msg
        if (this.Tid) clearTimeout(this.Tid)
        return this.Tid = setTimeout(() => this.tip = "", timeout);
    }

    /**
     * 更改默认日志等级
     * @param level 
     */
    changeLogLevel(level: loglevel) {
        this.loglevel = level
    }

    /**
     * 替换文件服务
     */
    async changeStorgeProvider(S: StorageProvider) {
        await S.init()
        this.Storage = S
    }

    /**
     * 推送任务日志
     * @param msg 
     * @param level 
     */
    pushLog(msg: string, level: loglevel) {
        if (logTr[level] >= logTr[this.loglevel]) {
            this.logs.push(`${new Date().toLocaleString()} ${logTi[level]}: ${msg}`)
        }
    }

    /**
     * 推送任务状态
     * 
     * all  任务总数+N
     * success 成功总数+N
     * error 失败总数+N
     */
    pushStatus({ all, success, error }: { all?: number, success?: number, error?: number }) {
        if (all) this.TaskStatus.all += all
        if (success) this.TaskStatus.success += success
        if (error) this.TaskStatus.error += error
    }

    /**
     * 注册控制台命令
     */
    registerCommand(command: commands | commands[]) {
        if (command instanceof Array) {
            this.commands = this.commands.concat(command).sort((i, j) => i.priority - j.priority)
        } else {
            this.commands.push(command)
            this.commands = this.commands.sort((i, j) => i.priority - j.priority)
        }
    }

    /**
     * 移除指定控制台命令
     * 
     * 请注意，q和debug无法被移除
     */
    unregisterCommand(word: string | string[]) {
        if (word instanceof Array) {
            word.map(i => this.unregisterCommand(i))
        } else {
            this.commands = this.commands.filter(i => !i.keyword.includes(word))
        }
    }

    /**
     * 注册任务队列
     * @param tasks 
     */
    registerTask(tasks: Task | Task[]) {
        if (tasks instanceof Array) {
            this.pushStatus({ all: tasks.length })
            this.Tasks = this.Tasks.concat(tasks).sort((i, j) => i.priority - j.priority)
        } else {
            this.pushStatus({ all: 1 })
            this.Tasks.push(tasks)
            this.Tasks = this.Tasks.sort((i, j) => i.priority - j.priority)
        }
    }

    /**
     * 即刻执行, 可以用于初始化某些东西
     * @example 可以用于在cli就绪的时候试图恢复上次未完成的任务
     */
    run(funcs: (m: Message) => void | Promise<void>): Promise<void>
    run(funcs: Array<(m: Message) => void | Promise<void>>): Promise<void[]>
    async run(funcs: ((m: Message) => void | Promise<void>) | Array<(m: Message) => void | Promise<void>>) {
        if (funcs instanceof Array) {
            return Promise.all(funcs.map(i => i(this)))
        } else {
            return funcs(this)
        }
    }

    private toTerminal() {
        if (this.logs.length === 0) {
            const counts = this.lastScreen.split("\n").length
            p(ansi.cursor.save + ansi.cursor.hide)
            // p(ansi.cursor.left + ansi.cursor.to(9))
            p(ansi.cursor.left)
            p(ansi.erase.lines(counts))
            let main = `\n\nTasks:\t\t\t${this.TaskStatus.success + this.TaskStatus.error} / ${this.TaskStatus.all}, ${(this.TaskStatus.success + this.TaskStatus.error) / this.TaskStatus.all * 100}%`
                + `${this.TaskStatus.error ? `\nErrors:\t\t\t${this.TaskStatus.error} (retrying may help)` : ""}`
                + `\nElapsed time:\t\t${this.renderTime()}\t\n`
                + (this.TasksInRun.length === 0 ? "" : "\n")
                + this.TasksInRun.map(i => "\t*\t" + (i.name ?? i.uuid) + "\t" + i.status).join("\n")
                + (this.TasksInRun.length === 0 ? "" : "\n")
                + this.tip
                + `\ncommand >${this.rl?.line}\r`
            this.lastScreen = main
            p(main)
            p(ansi.cursor.restore + ansi.cursor.show)
            p(ansi.cursor.down(counts))
        }
        while (this.logs.length !== 0) {
            const msg = this.logs.shift()
            const counts = this.lastScreen.split("\n").length
            p(ansi.cursor.save + ansi.cursor.hide)
            // p(ansi.cursor.left + ansi.cursor.to(9))
            p(ansi.cursor.left)
            p(ansi.erase.lines(counts))
            let main = `\n\nTasks:\t\t\t${this.TaskStatus.success + this.TaskStatus.error} / ${this.TaskStatus.all}, ${(this.TaskStatus.success + this.TaskStatus.error) / this.TaskStatus.all * 100}%`
                + `${this.TaskStatus.error ? `\nErrors:\t\t\t${this.TaskStatus.error} (retrying may help)` : ""}`
                + `\nElapsed time:\t\t${this.renderTime()}\t\n`
                + (this.TasksInRun.length === 0 ? "" : "\n")
                + this.TasksInRun.map(i => "\t*\t" + (i.name ?? i.uuid) + "\t" + i.status).join("\n")
                + (this.TasksInRun.length === 0 ? "" : "\n")
                + this.tip
                + `\ncommand >${this.rl?.line}\r`
            this.lastScreen = main
            p(msg + "\n" + main)
            p(ansi.cursor.restore + ansi.cursor.show)
            p(ansi.cursor.down(counts))
        }
    }

    private renderTime() {
        const time = (new Date().getTime() - this.startTime) / 1000
        const h = Math.floor(time / 3600)
        const m = Math.floor((time - h * 3600) / 60)
        return h ? `${h}h${m}m${(time - m * 60 - h * 3600).toFixed(3)}s`
            : m ? `${m}m${(time - m * 60).toFixed(3)}s` : `${time}s`
    }
}


export { Message, Task }
