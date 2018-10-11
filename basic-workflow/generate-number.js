module.exports = async function (context) {

    let random_number = Math.floor(Math.random() * 101); // generate random number between 0 and 100

    return {
        status: 200,
        body: { random_number: random_number },
        headers: { 'Content-Type': 'application/json' }
    };
}
