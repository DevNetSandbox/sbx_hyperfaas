'use strict';

const rp = require('request-promise-native');
const webexTeamsBotToken = 'NjEyM2IzMTctYTUyNC00MzA2LWEyMDctYzU5OGFmZWU0ZTQ0MTA1ZWNlOWEtN2Fj';

module.exports = async function (context) {
    var body = context.request.body;
    var message = body.message;
    var token = body.token;
    var room = body.room;
    var email = body.user;

    if (!token) {
        token = webexTeamsBotToken;
    }

    if (!room && !email) {
        return errorResponse(400, 'You must provide either a Webex Teams room name or an email of a Webex Teams user.');
    }

    // if a room name was submitted, get its id and send a message
    if (room) {
        var roomIds;
        try {
            roomIds = await getRoomIds(token, room);
            if (roomIds.length < 1) {
                return errorResponse(404, "roomIds of " + room + " not found.");
            }
        }
        catch (e) {
            return errorResponse(500, "Failed to retrieve a roomId: " + e);
        }

        var len = roomIds.length;
        var sent = 0;
        for (var i = 0; i < len; i++) {
            try {
                await postMessage(token, { text: message, roomId: roomIds[i] });
                sent++;
            }
            catch (e) {
                continue;
            }
        }
        return successResponse("'" + message + "' posted to " + sent + " out of " + len + " rooms " + room);
    }

    // if a user email was submitted, send a message
    try {
        await postMessage(token, { text: message, toPersonEmail: email });
        return successResponse("'" + message + "' sent to the user " + email);
    }
    catch (e) {
        return errorResponse(500, "Failed to send a message to the user" + email + ": " + e);
    }
}

function successResponse(message) {
    return response(200, { message: message })
};

function errorResponse(status, text) {
    return response(status, { error: { message: text } })
};

function response(status, body) {
    return {
        status: status,
        body: body,
        headers: { 'Content-Type': 'application/json' }
    };
}

async function getRoomIds(token, room) {
    let options = {
        uri: `https://api.ciscospark.com/v1/rooms`,
        json: true,
        headers: { "Authorization": "Bearer " + token },
        method: "GET"
    };
    var resp = await rp(options);
    var rooms = resp.items;
    var roomIds = [];
    if (rooms) {
        for (var i = 0, len = rooms.length; i < len; i++) {
            if (rooms[i].title == room) {
                roomIds.push(rooms[i].id)
            }
        }
    }
    return roomIds;
}

async function postMessage(token, body) {
    let options = {
        uri: `https://api.ciscospark.com/v1/messages`,
        json: true,
        headers: { "Authorization": "Bearer " + token },
        method: "POST",
        body: body
    };
    var resp = await rp(options);
    return;
}
