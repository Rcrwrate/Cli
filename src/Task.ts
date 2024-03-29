import { randomUUID } from 'crypto';
import type { Message } from './Terminal';

export class Task {
    /** 执行状态,显示在终端 */
    status: string = "";
    /** 无视队列限制，强制执行，优先级仍有效 @default false*/
    noLimit = false;
    /** 优先级，越小越优先 @default 10*/
    priority: number = 10;
    /** 该类任务单次(每0.5s)执行上限 @default 1*/
    single: number = 1
    /** 任务名称 */
    name?: string;
    /** 任务唯一标识，自动使用`crypto.randomUUID`生成 */
    uuid;
    /** 超时时间，以毫秒为单位 @default undefined */
    timeout: number | undefined = undefined

    constructor() {
        this.uuid = randomUUID();
    }

    /**
     * 任务内容
     * 
     * 如果设置了超时时间，需要自行调用`signal`，否则不会终止任务
     * 
     * 常用代码
     * ```ts
     * signal?.throwIfAborted()
     * ```
     */
    async Run(m: Message, signal?: AbortSignal): Promise<any> {

    }

    /**
     * 任务成功后执行
     * 
     * @default
     * ```
     * m.pushStatus({ success: 1 });    // 遗失会导致任务统计缺失
     * m.pushLog(`${this.name ?? this.uuid} 完成`, "INFO")
     * ```
     */
    async onSuccess(m: Message) {
        m.pushStatus({ success: 1 });
        m.pushLog(`${this.name ?? this.uuid} 完成`, "INFO")
    }

    /**
     * 任务失败时调用(包括超时)
     * 
     * @default
     * ```
     * m.pushStatus({ error: 1 });// 遗失会导致任务统计缺失
     * if (e.name === "TimeoutError" || e.name === "AbortError" || e.message.includes("aborted")) {
     *     m.pushLog(`${this.name ?? this.uuid} 超时${this.timeout as number / 1000}s`, "ERROR")
     * }    //判断是否属于超时
     * m.pushLog(JSON.stringify({ ...this }, null, 2), "ERROR");
     * m.pushLog(e.stack ?? e.message, "ERROR");
     * ```
     */
    async onFailed(m: Message, e: Error) {
        m.pushStatus({ error: 1 });
        if (e.name === "TimeoutError" || e.name === "AbortError" || e.message.includes("aborted")) {
            m.pushLog(`${this.name ?? this.uuid} 超时${this.timeout as number / 1000}s`, "ERROR")
        }
        m.pushLog(JSON.stringify({ ...this }, null, 2), "ERROR");
        m.pushLog(e.stack ?? e.message, "ERROR");
    }

    /**
     * 当Cli即将关闭时运行
     * @example 也许可以用于保存未完成的队列到cache
     */
    async onClose(m: Message) {

    }
}
