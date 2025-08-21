function byteArrayLength(str: string) {
    let length: Array<1 | 2> = [];
    Array.from(str).map(function (char) {
        if (char.charCodeAt(0) > 255) { //字符编码大于255，说明是双字节字符
            length.push(2);
        } else {
            length.push(1);
        }
    });
    return length
}

/**
 * 计算字符串在终端显示时的长度
 * @param str 
 * @returns 
 */
function byteLength(str: string) {
    let length = 0;
    Array.from(str).map(function (char) {
        if (char.charCodeAt(0) > 255) { //字符编码大于255，说明是双字节字符
            length += 2;
        } else {
            length++;
        }
    });
    return length;
}


/**
 * 用于计算携带\t的字符串在终端显示时的长度
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
            const length = byteLength(tmp)
            let tmp2 = (length < 8 ? 8 - length : length - 8) % 8;
            count += length + (tmp2 === 0 ? 8 : tmp2)
        } else {
            count += parts[id].length
        }
    }
    return count
}

/**
 * 裁剪字符串，使其在终端显示的长度不超过maxLength
 * @param msg 
 * @param maxLength 
 * @returns 
 */
export function substring(msg: string, maxLength: number) {
    const data = byteArrayLength(msg)
    let sum = 0;
    let n = 0
    for (let i = 0; i < data.length; i++) {
        sum += data[i];
        if (sum > maxLength) {
            break;
        }
        n++
    }
    return msg.substring(0, n)
}