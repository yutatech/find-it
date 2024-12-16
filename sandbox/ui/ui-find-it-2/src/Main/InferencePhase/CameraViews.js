import React, { useEffect, useRef } from 'react';

const CameraView = () => {
    const videoRef = useRef(null);

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                videoRef.current.srcObject = stream;
            })
            .catch(console.error);
    }, []);

    return <video ref={videoRef} autoPlay />;
};

export default CameraView;
