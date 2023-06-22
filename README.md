# nice-to-meet-me (in progress)

![](https://media.tenor.com/fR6MrcAyv5sAAAAC/nice-to-meet-me-michael-scott.gif)

## Meeting connection flow

1. User 1 joins a room and they are the first one there, so the server emits `created` event
2. User 1 receives the `created` event, the web client requests the audio and video stream and then when it's done the web application fires `ready` event
3. The server receives the `ready` event and broadcasts to the room `ready` event
4. User 2 joins the room and as they are the second user in the room the server emits `joined` event
5. The web client receives `joined` event, requests the audio and video stream and then when it's done the web application fires `ready` event
6. The server broadcasts `ready` event, which is received by User 1
7. User 1 creates a Peer connection and an Offer, which is emitted with `offer` event and then rebroadcasted to the room by the server
8. User 2 receives the offer and creates an Answer and emits it with `answer` event, which the server rebroadcasts to the room
9. User 1 receives the answer, and saves it in a local connection variable, which then updates the tracks with audio and video