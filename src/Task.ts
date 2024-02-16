import { randomUUID } from 'crypto';
import type { Message } from './Terminal';

export class Task {
    /** 执行状态,显示在终端 */
    status: string = "";
    /** 无视队列限制，强制执行，优先级仍有效 */
    noLimit = false;
    priority: number = 10;
    name?: string;
    uuid;

    constructor() {
        this.uuid = randomUUID();
    }

    async Run(m: Message): Promise<any> {
    }

    onSuccess(m: Message) {
        m.pushStatus({ success: 1 });
    }

    onFailed(m: Message, e: Error) {
        m.pushStatus({ error: 1 });
        m.pushLog(JSON.stringify({ ...this }), "ERROR");
        m.pushLog(e.stack ?? e.message, "ERROR");
    }
}
