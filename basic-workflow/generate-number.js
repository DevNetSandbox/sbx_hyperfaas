module.exports = async function (context) {

    let rand = Math.floor(Math.random() * 101); // generate random number between 0 and 100

    return {
        status: 200,
        body: { number: rand },
        headers: { 'Content-Type': 'application/json' }
    };
}
