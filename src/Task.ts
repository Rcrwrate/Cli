import { randomUUID } from 'crypto';
import type { Message } from './Terminal';

export class Task {
    /** 执行状态,显示在终端 */
    status: string = "";
    /** 无视队列限制，强制执行，优先级仍有效 @default false*/
    noLimit = false;
    /** 优先级 @default 10*/
    priority: number = 10;
    name?: string;
    uuid;

    constructor() {
        this.uuid = randomUUID();
    }

    async Run(m: Message): Promise<any> {
    }

    async onSuccess(m: Message) {
        m.pushStatus({ success: 1 });
    }

    async onFailed(m: Message, e: Error) {
        m.pushStatus({ error: 1 });
        m.pushLog(JSON.stringify({ ...this }), "ERROR");
        m.pushLog(e.stack ?? e.message, "ERROR");
    }

    /**
     * 当Cli即将关闭时运行
     * @example 也许可以用于保存未完成的队列到cache
     */
    async onClose(m: Message) {

    }
}
