import { cache } from './cache'
import * as Storage from './Storage'
import { type commands, Message } from './Terminal'
import { Task } from './Task'

const c = new cache()
const m = new Message(c)

process.on('unhandledRejection', reason => { m.pushLog(reason as string, "ERROR") });

export default { m, Storage, Task, Message }
export { m, Storage, Task, type commands, Message }