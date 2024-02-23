import { Task, m, type Message } from '../dist'

const sleep = (t: number | undefined) => new Promise((r) => setTimeout(r, t))

class EndTask extends Task {
    name?: string | undefined = "End"
    async Run(m: Message): Promise<any> {
        await sleep(5000)
        return m.Close()
    }

    async onClose(m: Message): Promise<void> {
        await sleep(1000)
    }
}

class TimeoutTest extends Task {
    name?: string | undefined = "TimeoutTest"
    timeout: number | undefined = 1000
    async Run(m: Message, signal?: AbortSignal): Promise<any> {
        await sleep(3000)
        signal?.throwIfAborted()
        return
    }

    async onTimeout(m: Message): Promise<void> {
        await sleep(1000)
        m.pushLog(`${this.name ?? this.uuid} 超时${this.timeout as number / 1000}s`, "ERROR")
    }
}

m.run(async (m) => {
    m.changeLogLevel("DEBUG")
    m.pushStatus({ all: 2, success: 1, error: 1 })
    m.pushLog(`m.cache.get:${m.cache.get<string>("test")}`, "DEBUG")
    m.pushLog(`m.cache.set:${m.cache.set<string>("test", "test")}`, "DEBUG")
    m.pushLog(`m.cache.get:${m.cache.get<string>("test")}`, "DEBUG")
    m.pushLog(`m.Storage.exist:${await m.Storage.exist("test.txt")}`, "DEBUG")
    await m.Storage.write("写入测试", "test.txt")
    await m.Storage.write(new Response("写入测试"), "test.txt")
    m.pushLog(`m.Storage.exist:${await m.Storage.exist("test.txt")}`, "DEBUG")
    m.registerTask([new TimeoutTest(), new EndTask()])
})


// process.on('unhandledRejection', reason => { });