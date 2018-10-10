module.exports = async function (context) {
    let name = context.request.body.name;
    if (name === undefined || name === "") {
        name = "World"
    }
    return {
        status: 200,
        body: "Hello, " + name + "!\n"
    };
}
