module.exports = async function () {
    var random_number = Math.floor(Math.random());//* 100);

    return {
        status: 200,
        body: "Hello, " + random_number + "!\n"
    };
}
