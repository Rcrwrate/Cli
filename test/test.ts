import { Task, m, type Message } from '../dist'

class exampleTask extends Task {
    constructor(){
        super()
    }

    async Run(m: Message): Promise<any> {
        m.pushLog(this.uuid, "DEBUG");
    }
}

//注册控制台命令
m.registerCommand([
    {
        func(input, m) {
            //推送任务日志
            m.pushLog(input, "INFO");
            //注册任务队列
            m.registerTask(new exampleTask());
        },
        keyword: ["test"],
        priority: 10,
        help: "TEST"
    },
]);

