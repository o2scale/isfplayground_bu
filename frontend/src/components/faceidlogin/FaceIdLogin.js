import React, { useEffect, useRef, useState } from 'react';
import './FaceIdLogin.css';
import { faceIdlogin } from '../../api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';



const FaceIdLogin = ({ onToggle }) => {
    const videoRef = useRef(null);
    const [videoReady, setVideoReady] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate()
    const { login } = useAuth()
    useEffect(() => {
        startWebcam();
        return () => stopWebcam();
    }, []);

    const startWebcam = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: 640,
                    height: 480,
                    facingMode: 'user'
                }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.onloadedmetadata = () => setVideoReady(true);
            }
        } catch (err) {
            setError('Error accessing webcam');
            console.error('Error accessing webcam:', err);
        }
    };

    const stopWebcam = () => {
        if (videoRef.current?.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
    };

    const capturePhoto = async () => {
        if (!videoReady || isProcessing) return;
        setIsProcessing(true);
        setError('');

        try {
            const canvas = document.createElement('canvas');
            const videoEl = videoRef.current;
            canvas.width = videoEl.videoWidth;
            canvas.height = videoEl.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);

            const imageBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg'));
            const formData = new FormData();
            formData.append('facialData', imageBlob, 'capture.jpg');


            const response = await faceIdlogin(formData)
            console.log('respsdsd', response.data)

            console.log('respsdsd', response.data)
            const { token, user } = response.data;

            // Format the user data to match our auth context expectations
            const userData = {
                token,
                user: {
                    id: user.id || user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    status: user.status,
                },
            };

            // Call the login function from auth context
            login(userData);
            navigate('/dashboard');


            console.log('Photo uploaded successfully');
        } catch (err) {
            console.log('errr', err?.response?.data?.message)
            if (err) {
                setError(err?.response?.data?.message)
            } else {
                setError('Error capturing or uploading photo');
            }
            // 
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="face-id-container">
            {error && <div className="error-message">{error}</div>}

            <div className="webcam-container">
                <video ref={videoRef} autoPlay playsInline />
                {!videoReady && <div className="loading-overlay">Initializing camera...</div>}
            </div>

            <div className="controls">
                <button className="capture-button" onClick={capturePhoto} disabled={!videoReady || isProcessing}>
                    {isProcessing ? 'Processing...' : 'Capture Photo'}
                </button>
            </div>

            <a href="#" onClick={onToggle} className="toggle-link">
                Login with Username and PIN
            </a>
        </div>
    );
};

export default FaceIdLogin;
