import { join } from "path"
import fs from 'fs'

fs.mkdir(".cache", () => { })
const cache_path = join(".cache", "cache.json")

class cache {
    protected data: { [key: string]: any | undefined } = {}

    constructor() {
        this.load()
    }

    get<T>(key: string) {
        return this.data[key] as T | undefined
    }

    set<T>(key: string, value: T) {
        this.data[key] = value
        return value
    }

    delete(key: string) {
        delete this.data[key]
    }

    /**
     * 将指定元素添加到数组的开头，并返回数组的新长度。如果缓存中数组不存在则会自动创建
     * 
     * @link [MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/unshift)
     */
    unshift<T>(key: string, value: T) {
        if (this.data[key] instanceof Array) {
            return (this.data[key] as Array<T>).unshift(value)
        } else {
            this.data[key] = [value]
            return 1
        }
    }

    /**
     * 从数组中**删除**第一个元素，并返回该元素的值。如果数组为空或不存在则返回 `undefined`
     * 
     * 此方法更改数组的长度。如果缓存中数组不存在则会自动创建
     * @link [MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/shift)
     */
    shift<T>(key: string) {
        if (this.data[key] instanceof Array) {
            return (this.data[key] as Array<T>).shift()
        } else {
            this.data[key] = []
            return undefined
        }
    }

    /**
     * 将指定的元素添加到缓存中数组的**末尾**，并返回新的数组长度。如果缓存中数组不存在则会自动创建
     * 
     * @link [MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/push)
     */
    push<T>(key: string, value: T) {
        if (this.data[key] instanceof Array) {
            return (this.data[key] as Array<T>).push(value)
        } else {
            this.data[key] = [value]
            return 1
        }
    }

    /**
     * 从数组中删除最后一个元素，并返回该元素的值。此方法会更改数组的长度。如果缓存中数组不存在则会自动创建
     * 
     * @link [MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/pop)
     */
    pop<T>(key: string) {
        if (this.data[key] instanceof Array) {
            return (this.data[key] as Array<T>).pop()
        } else {
            this.data[key] = []
            return
        }
    }

    /**
     * 自增运算，返回**运算后**的结果。如果缓存不存在，则预设为`0`，返回`1`
     */
    Increment(key: string) {
        if (typeof this.data[key] === "number") {
            return ++this.data[key]
        } else {
            this.data[key] = 1
            return 1
        }
    }

    /**
     * 自减运算，返回**运算后**的结果。如果缓存不存在，则预设为`0`，返回`-1`
     */
    Decrement(key: string) {
        if (typeof this.data[key] === "number") {
            return --this.data[key]
        } else {
            this.data[key] = -1
            return -1
        }
    }

    /** 返回现有的所有缓存键 */
    keys() {
        return Object.keys(this.data)
    }

    /** 返回现有的所有缓存键值对 */
    entries() {
        return Object.entries(this.data)
    }

    load() {
        try {
            this.data = JSON.parse(fs.readFileSync(cache_path, { encoding: "utf-8" }))
        } catch {

        }
    }

    save() {
        fs.writeFileSync(cache_path, JSON.stringify(this.data), { encoding: "utf-8" })
    }
}

export { cache }