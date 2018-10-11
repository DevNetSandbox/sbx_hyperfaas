module.exports = async function (context) {

    let body = context.request.body;
    let number = body.number;

    return {
        status: 200,
        body: "Hello, number " + number + ", you are >50 and you are welcomed from Node.JS function!\n"
    };
}
