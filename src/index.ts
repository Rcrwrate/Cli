import { Message } from './Terminal'
import { cache } from './cache'
export * from './Task'
export * from './Storage'

const c = new cache()
const m = new Message(c)

export { m }