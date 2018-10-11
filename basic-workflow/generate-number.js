module.exports = async function (context) {
    let random_number = Math.floor(Math.random() * 101);

    return {
        status: 200,
        body: "Hello, " + random_number + "!\n"
    };
}
