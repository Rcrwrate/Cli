import { Task } from '../dist/Task'
import { Message } from '../dist/Terminal'
import { cache } from '../dist/cache'


const m = new Message(new cache(), {
    NoInteraction: true,
    RenderInterval: 100,
    TaskInterval: 1000,
    RenderLog(msg, level) {
        return level + "\t" + msg
    },
})
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
    timeout: number | undefined = 500
    single: number = 2
    async Run(m: Message, signal?: AbortSignal): Promise<any> {
        await sleep(3000)
        signal?.throwIfAborted()
        return
    }
}

class TimeoutTest2 extends Task {
    name?: string | undefined = "TimeoutTest2"
    timeout: number | undefined = 1
    async Run(m: Message, signal?: AbortSignal): Promise<any> {
        await fetch("https://google.com", { signal: signal })
        return fetch("https://google.com", { signal: signal })
    }
}

m.onClose(async (m) => {
    m.pushLog("Closed", "INFO")
    await sleep(1000)
})

m.run(async (m) => {
    m.changeLogLevel("DEBUG")
    m.pushStatus({ all: 2, success: 1, error: 1 })
    m.pushLog(`m.cache.get:${m.cache.get<string>("test")}`, "DEBUG")
    m.pushLog(`m.cache.set:${m.cache.set<string>("test", "test")}`, "DEBUG")
    m.pushLog(`m.cache.get:${m.cache.get<string>("test")}`, "DEBUG")

    m.pushLog(`m.cache.get:${m.cache.get<number>("n")}`, "DEBUG")
    m.pushLog(`m.cache.Increment:${m.cache.Increment("n")}`, "DEBUG")
    m.pushLog(`m.cache.get:${m.cache.get<number>("n")}`, "DEBUG")
    m.pushLog(`m.cache.get:${m.cache.get<number>("n2")}`, "DEBUG")
    m.pushLog(`m.cache.Decrement:${m.cache.Decrement("n2")}`, "DEBUG")
    m.pushLog(`m.cache.get:${m.cache.get<number>("n2")}`, "DEBUG")

    m.pushLog(`m.cache.get:${JSON.stringify(m.cache.get<string[]>("list"))}`, "DEBUG")
    m.pushLog(`m.cache.push:${m.cache.push("list", "0")}`, "DEBUG")
    m.pushLog(`m.cache.get:${JSON.stringify(m.cache.get<string[]>("list"))}`, "DEBUG")
    m.pushLog(`m.cache.push:${m.cache.push("list", "1")}`, "DEBUG")
    m.pushLog(`m.cache.get:${JSON.stringify(m.cache.get<string[]>("list"))}`, "DEBUG")
    m.pushLog(`m.cache.pop:${m.cache.pop<string[]>("list")}`, "DEBUG")
    m.pushLog(`m.cache.get:${JSON.stringify(m.cache.get<string[]>("list"))}`, "DEBUG")
    m.pushLog(`m.cache.unshift:${m.cache.unshift<string>("list", "-1")}`, "DEBUG")
    m.pushLog(`m.cache.get:${JSON.stringify(m.cache.get<string[]>("list"))}`, "DEBUG")
    m.pushLog(`m.cache.shift:${m.cache.shift<string>("list")}`, "DEBUG")
    m.pushLog(`m.cache.get:${JSON.stringify(m.cache.get<string[]>("list"))}`, "DEBUG")

    m.pushLog(`m.cache.keys:${JSON.stringify(m.cache.keys())}`, "DEBUG")
    m.pushLog(`m.cache.entries:${JSON.stringify(m.cache.entries())}`, "DEBUG")

    m.pushLog(`m.Storage.exist:${await m.Storage.exist("test.txt")}`, "DEBUG")
    await m.Storage.write("写入测试", "test.txt")
    await m.Storage.write(new Response("写入测试"), "test.txt")
    m.pushLog(`m.Storage.exist:${await m.Storage.exist("test.txt")}`, "DEBUG")
    m.pushLog(`m.Storage.read:${await m.Storage.readString("test.txt", "utf-8")}`, "DEBUG")
    m.pushLog(`m.Storage.read:${await m.Storage.readString("test3.txt", "utf-8")}`, "DEBUG")
    m.pushLog(`m.Storage.readdir:${JSON.stringify(await m.Storage.readdir("./"))}`, "DEBUG")
    m.registerTask([new TimeoutTest(), new TimeoutTest(), new TimeoutTest(), new TimeoutTest2()])
})


// process.on('unhandledRejection', reason => { });