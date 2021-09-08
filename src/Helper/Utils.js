
export const endcodeUserName = (username) => {
    let buff = new Buffer(username);
    return buff.toString('base64');
}

export const decodeUserName = (username) => {
    return Buffer.from(username, 'base64').toString('ascii')
}

export const parseDateTostring = (date) => {
    if (!date) return ''
    try {
        const dateStr = new Date(date);
        return dateStr.toDateString();
    } catch (err) {
        console.log(err)
        return ''
    }

}