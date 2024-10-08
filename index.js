const WebSocket = require('ws');
console.log(process.argv)
if (process.argv.length !== 5) {
    console.error('Usage node index.js <username> <password> <customerId>');
    process.exit(1);
}
const username = process.argv[2]
const password = process.argv[3]
const customerId = process.argv[4]
const start = async () => {
    const endpoint = 'https://bedriftsnett-api.phonero.net/authenticate';


    const session = await fetch(
        endpoint,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                password:password,
            }),
        })
        .then((res) => res.json())
console.log(session)
    const ws = new WebSocket('wss://bedriftsnett-api.phonero.net/events', {
        headers: {
            Cookie: `BNINTEGRATORAPI=${session.sessionId};`,
            'Content-Type': 'application/json',
        },
    });

    ws.on('error', console.error);

    ws.on('open', function open() {
        ws.send(
            JSON.stringify({
                action: 'subscribe',
                topic: `callStatus.${customerId}`,
                param: 'initial',
            })
        );
        setInterval(() => {
            ws.send(
                JSON.stringify({
                    action: 'ping',
                })
            );
        }, 60000);
    });

    ws.on('message', function message(data) {
        console.log('received: %s', data);
    });

}
start();