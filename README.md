# 一个神秘的交互式 Cli 框架

内含如下内容：

1. 秉持能用就行的理念

2. 想到哪做到哪

### example

引入就能运行

```ts
import cli from "@rcrwrate/cli";

//注册控制台命令
cli.m.registerCommand([
  {
    func(input, m) {
      //推送任务日志
      m.pushLog(input, "INFO");
      //注册任务队列
      m.registerTask(new exampleTask());
    },
    keyword: ["test"],
    priority: 10,
  },
]);

class exampleTask extends cli.Task {
  async Run(m: Message): Promise<any> {
    //推送任务状态
    m.pushStatus({ all: 1, success: 1 });
    m.pushLog(this.uuid, "DEBUG");
  }
}
```

更多请自行查看相关 Typescript 信息
