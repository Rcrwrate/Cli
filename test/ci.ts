import { Task, m, type Message } from '../dist'

const sleep = (t: number | undefined) => new Promise((r) => setTimeout(r, t))

class EndTask extends Task {
    async Run(m: Message): Promise<any> {
        await sleep(1000)
        return m.Close()
    }
}

m.run(async (m) => {
    m.changeLogLevel("DEBUG")
    m.pushStatus({ all: 2, success: 1, error: 1 })
    m.pushLog(`m.cache.get:${m.cache.get<any>("test")}`, "DEBUG")
    m.pushLog(`m.cache.set:${m.cache.set<any>("test", "test")}`, "DEBUG")
    m.pushLog(`m.cache.get:${m.cache.get<any>("test")}`, "DEBUG")
    m.pushLog(`m.Storage.exist:${await m.Storage.exist("test.txt")}`, "DEBUG")
    await m.Storage.write("写入测试", "test.txt")
    await m.Storage.write(new Response("写入测试"), "test.txt")
    m.pushLog(`m.Storage.exist:${await m.Storage.exist("test.txt")}`, "DEBUG")
    m.registerTask(new EndTask())
})