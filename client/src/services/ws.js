export function startWebsocketService() {
    let ws = new WebSocket(`http://localhost:8080`);

    ws.onopen = () => {
        console.log('connected to the ws');
    };

    ws.onmessage = (event) => {
        let message;
        try {
            message = JSON.parse(event.data);
            console.log(message)
        } catch {
            return;
        }
        const { type, data } = message;
        switch (type) {
            case 'JOIN': {
                console.log("user joined")
                break;
            }
        }
    }

}