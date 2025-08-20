/**
 * 用于计算携带\t的字符串长度
 */
export function count(msg: string) {
    if (msg.includes("\n")) {
        throw Error("Not Support \n")
    }
    const parts = msg.split("\t")
    let count = 0
    for (let id = 0; id < parts.length; id++) {
        if (id !== parts.length - 1) {
            let tmp = parts[id];
            let tmp2 = (tmp.length < 8 ? 8 - tmp.length : tmp.length - 8) % 8;
            count += tmp.length + (tmp2 === 0 ? 8 : tmp2)
        } else {
            count += parts[id].length
        }
    }
    return count
}