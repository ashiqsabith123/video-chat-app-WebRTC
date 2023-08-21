
const localVideo = document.getElementById('localvideo');

const iceServers = [
    { urls: 'stun:stun.l.google.com:19302' },
];

let localStream;

console.log();

(async function startCall() {
    console.log("hello");
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        console.log("media devices fetched");
        localVideo.srcObject = localStream;

    } catch (error) {
        console.error('Error starting call:', error);
    }
})()

async function connectPeer(){
    try{ 
    peerConnection = new RTCPeerConnection({ iceServers });
    console.log(peerConnection);
    // peerConnection.addEventListener('icecandidate', handleICECandidate);
    // peerConnection.addEventListener('addstream', handleRemoteStream);

    // localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

    // const offer = await peerConnection.createOffer();
    // await peerConnection.setLocalDescription(offer);

    // socket = new WebSocket('ws://localhost:8080/ws');

    // socket.onopen = async () => {
    //     // Send the offer to the Go server over WebSocket
    //     const offerData = {
    //         type: offer.type,
    //         sdp: offer.sdp,
    //     };
    //     socket.send(JSON.stringify(offerData));
    // };

    // socket.onmessage = async (event) => {
    //     const answerData = JSON.parse(event.data);
    //     const answer = new RTCSessionDescription(answerData);

    //     await peerConnection.setRemoteDescription(answer);
    // };

} catch (error) {
    console.error('Error starting call:', error);
}
}

