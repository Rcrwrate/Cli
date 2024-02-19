# 一个神秘的交互式 Cli 框架

内含如下内容：

1. 秉持能用就行的理念

2. 想到哪做到哪

### example

引入就能运行

```ts name="test.ts"
import { Task, m, type Message } from "@rcrwrate/cli";

const sleep = (t: number | undefined) => new Promise((r) => setTimeout(r, t));

/** 示例任务 */
class exampleTask extends Task {
  uid: string;

  constructor(uid: string) {
    super();
    this.uid = uid;
  }

  async Run(m: Message): Promise<any> {
    await sleep(10000);
    m.pushLog(this.uuid, "INFO");
  }

  async onClose(m: Message): Promise<void> {
    //保存未完成的队列
    m.cache.push("exampleTask", this.uid);
  }
}

//注册控制台命令
m.registerCommand([
  {
    func(input, m) {
      //推送任务日志
      m.pushLog(input, "INFO");
      //注册任务队列
      m.registerTask([
        new exampleTask("1"),
        new exampleTask("1"),
        new exampleTask("1"),
        new exampleTask("1"),
      ]);
    },
    keyword: ["test"],
    priority: 10,
    help: "说明文字",
  },
  {
    func(input, m) {
      //写入测试
      m.Storage.write(input, "test.txt");
      m.Storage.write(new Response(input), "test2.txt");
    },
    keyword: ["test.w"],
    priority: 9,
    help: "写入测试",
  },
]);

//立即执行
m.run((m) => {
  const all = m.cache.get<string[]>("exampleTask");
  //如果cache中存在预定义的未完成任务信息，读取并移除
  if (all) {
    m.registerTask(all.map((i) => new exampleTask(i)));
    m.cache.delete("exampleTask");
  }
});
```

更多请自行查看相关 Typescript 信息
