function sendCode(phone) {
    return new Promise(function (resolve, reject) {
        try {
            code = createCode();
            // send to phone
            resolve(code);
        } catch (err) {
            reject(err);
        }
    });
}

function createCode() {
    return `${Math.floor(Math.random() * 100000000)}`
        .padStart(8, 0);
}


module.exports = {
    sendCode
}