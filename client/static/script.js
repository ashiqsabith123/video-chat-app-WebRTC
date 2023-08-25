
const localVideo = document.getElementById('localvideo');
const partnerVideo = document.getElementById('partnerVideo')





const iceServers = [
    { urls: 'stun:stun.l.google.com:19302' },
];

var localStream;
let peerConnection;



let ws;

(async function startCall() {
    

    try {
        

        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        console.log("media devices fetched");
        localVideo.srcObject = localStream;
        connectHostPeer();

    } catch (error) {
        console.error('Error starting call:', error);
    }

})();



function connectHostPeer() {
    let roomID = document.getElementById('roomIDH').innerHTML;
    ws = new WebSocket(`wss://shiftsync.online/join?roomID=${roomID}`);
    
    ws.addEventListener('open', (event) => {
        console.log('WebSocket connection opened:', event);
        ws.send(JSON.stringify({
            join: true,
        }));
    });

    connectpeer();
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

    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

}



async function handleOffer(offer) {
    console.log("Received Offer, Creating Answer");
   

    try {
        createPeer()

      

        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

        localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        

        ws.send(JSON.stringify({ answer: peerConnection.localDescription }));
    } catch (err) {
        console.error('Error handling offer:', err);
    }
}



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
    console.log(e.streams.length);
    if (e.streams.length > 0) {
        // Assuming you want to display both audio and video streams
        const combinedStream = new MediaStream();

        e.streams.forEach(stream => {
            stream.getTracks().forEach(track => {
                combinedStream.addTrack(track);
            });
        });

        partnerVideo.srcObject = combinedStream;
    }

  

    // You can handle other streams or track types here if needed
};






