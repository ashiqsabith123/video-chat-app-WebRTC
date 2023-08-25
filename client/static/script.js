
const localVideo = document.getElementById('localvideo');
const partnerVideo = document.getElementById('partnerVideo')



const iceServers = [
    { urls: 'stun:stun.l.google.com:19302' },
];

var localStream;
let peerConnection;



let ws;

(async function startCall(connectHostPeer) {

    try {


        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const cameras = allDevices.filter(device => device.kind === 'videoinput');
    
        if (cameras.length === 0) {
            console.log('No cameras available.');
            return;
        }
    
        console.log(cameras);
    
        const constraints = {
            audio: true,
            video: {
                deviceId: cameras[0].deviceId, // You can change the index as needed
            },
        };
     
        localStream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log("media devices fetched");
        localVideo.srcObject = localStream;
        connectHostPeer()

    } catch (error) {
        console.error('Error starting call:', error);
    }

    //console.log("local",localStream);
})(connectHostPeer)



function connectHostPeer() {
    let roomID = document.getElementById('roomIDH').innerHTML
    ws = new WebSocket(`wss://shiftsync.online/join?roomID=${roomID}`);
    ws.addEventListener('open', (event) => {
        console.log('WebSocket connection opened:', event);
        ws.send(JSON.stringify(
            {
                join: true,
               
            }

        ))
    });

    connectpeer()
}




async function connectpeer() {


    try {
        console.log("in try");
        ws.addEventListener('message', (e) => {
            const message = JSON.parse(e.data);
            console.log("message:", message);

            if (message.join) {
                callUser();
            }

            if (message.offer) {
                handleOffer(message.offer)
            }


            if (message.answer) {
                console.log("Receiving Answer");
                peerConnection.setRemoteDescription(
                    new RTCSessionDescription(message.answer)
                );
            }

            if (message.iceCandidate) {
                console.log("Receiving and Adding ICE Candidate");
                try {
                    peerConnection.addIceCandidate(
                        message.iceCandidate
                    );
                } catch (err) {
                    console.log("Error Receiving ICE Candidate", err);
                }
            }


        });

    } catch (error) {
        console.error('Error starting call:', error);
    }
}

function callUser() {
    console.log("Calling Other User");
    createPeer()

    this.localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

}

const handleOffer = async (offer) => {
    console.log("Received Offer, Creating Answer");
    createPeer();

    await peerConnection.setRemoteDescription(
        new RTCSessionDescription(offer)
    );

    await localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    ws.send(
        JSON.stringify({ answer: peerConnection.localDescription })
    );
};


function createPeer() {
    console.log("Creating Peer Connection");
    peerConnection = new RTCPeerConnection({ iceServers })

    peerConnection.onnegotiationneeded = handleNegotiationNeeded;
    peerConnection.onicecandidate = handleIceCandidateEvent;
    peerConnection.ontrack = handleTrackEvent;
}


const handleNegotiationNeeded = async () => {
    console.log("Creating Offer");

    try {
        const myOffer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(myOffer);

        ws.send(
            JSON.stringify({ offer: peerConnection.localDescription })
        );
    } catch (err) { }
};

const handleIceCandidateEvent = (e) => {
    console.log("Found Ice Candidate");
    if (e.candidate) {
        console.log(e.candidate);
        ws.send(
            JSON.stringify({ iceCandidate: e.candidate })
        );
    }
};

const handleTrackEvent = (e) => {
    console.log("Received Tracks");
    partnerVideo.srcObject = e.streams[0];
};

// function connectUserPeer(roomID){
//     ws = new WebSocket('ws://localhost:3443/join');
//     ws.addEventListener('open', (event) => {
//         console.log('WebSocket connection opened:', event);
//         ws.send(JSON.stringify(
//             {
//                 join: true,
//                 host: false,
//                 roomID: roomID
//             }

//         ))
//     });

//     connectpeer()
// }

//setTimeout(connectHostPeer,5000)
//connectHostPeer()




