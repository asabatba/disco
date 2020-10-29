
import Option from 'fp-ts/lib/Option';
import ws from 'ws';

// const server = http.createServer((req, res) =>
//     handler(req, res, { public: 'public' }));

// server.listen(process.env.DISCO_PORT ?? 9000);

const wsServer = new ws.Server({
    port: parseInt(process.env.DISCO_PORT ?? '9000'),
});

// const wsServer = new ws.Server({ server: server });

const prop = (obj: { [k: string]: any; }) => (prop: string) => obj[prop];

const parseJson = (str: ws.Data) => {

    if (typeof str != 'string')
        return Option.none;

    try {
        const parsed = JSON.parse(str);
        return Option.some(parsed);
    } catch (err) {
        return Option.none;
    }
};


const letters = {
    /*
    d: {
        lat: 41.4,
        lng: 2.14,
        online: new Date(),
    },
    n: {
        lat: 41.4,
        lng: 2.16,
        online: new Date(),
    }*/
};

wsServer.on('connection', function (ws) {

    ws.on('message', function (msg) {

        const res = JSON.parse(msg as string);

        const { letter, lat, lng } = res;
        if (letter)
            letters[letter] = { lat, lng, online: new Date() };

        ws.send(JSON.stringify(letters));
    });
    ws.on('open', broadCastToClients);
});

setInterval(broadCastToClients, 5_000);

function broadCastToClients() {

    console.log(letters);
    wsServer.clients.forEach(client => {
        if (client.readyState === ws.OPEN) {
            client.send(JSON.stringify(letters));
        }
    });
}

