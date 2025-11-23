import React, { useState, useRef, useEffect } from "react";
import { AlertTriangle, Loader2, Video, Mic, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";

const EmergencyButton = () => {
  const [loading, setLoading] = useState(false);
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [videoBlob, setVideoBlob] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startTimer = () => {
    setRecordingTime(0);
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startVideoRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        }, 
        audio: true 
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      let options = { mimeType: 'video/webm;codecs=vp8,opus' };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = { mimeType: 'video/webm' };
      }
      
      const mediaRecorder = new MediaRecorder(stream, options);
      recordedChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
          console.log('Video chunk:', event.data.size, 'bytes');
        }
      };

      mediaRecorder.onstop = () => {
        console.log('Total chunks:', recordedChunksRef.current.length);
        
        if (recordedChunksRef.current.length > 0) {
          const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
          console.log('Video size:', blob.size, 'bytes');
          
          if (blob.size > 0) {
            setVideoBlob(blob);
          } else {
            alert('Video recording failed');
          }
        }
        
        stopTimer();
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.start(1000);
      mediaRecorderRef.current = mediaRecorder;
      setIsRecordingVideo(true);
      startTimer();
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to access camera');
    }
  };

  const stopVideoRecording = () => {
    if (mediaRecorderRef.current && isRecordingVideo) {
      mediaRecorderRef.current.stop();
      setIsRecordingVideo(false);
    }
  };

  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true
        }
      });
      
      let options = { mimeType: 'audio/webm;codecs=opus' };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = { mimeType: 'audio/webm' };
      }
      
      const audioRecorder = new MediaRecorder(stream, options);
      recordedChunksRef.current = [];

      audioRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
          console.log('Audio chunk:', event.data.size, 'bytes');
        }
      };

      audioRecorder.onstop = () => {
        console.log('Total audio chunks:', recordedChunksRef.current.length);
        
        if (recordedChunksRef.current.length > 0) {
          const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
          console.log('Audio size:', blob.size, 'bytes');
          
          if (blob.size > 0) {
            setAudioBlob(blob);
          } else {
            alert('Audio recording failed');
          }
        }
        
        stopTimer();
        stream.getTracks().forEach(track => track.stop());
      };

      audioRecorder.start(1000);
      audioRecorderRef.current = audioRecorder;
      setIsRecordingAudio(true);
      startTimer();
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to access microphone');
    }
  };

  const stopAudioRecording = () => {
    if (audioRecorderRef.current && isRecordingAudio) {
      audioRecorderRef.current.stop();
      setIsRecordingAudio(false);
    }
  };

  const sendMessageSOS = () => {
    setLoading(true);
    const token = localStorage.getItem("token");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const latitude = pos.coords.latitude;
        const longitude = pos.coords.longitude;

        try {
          const res = await fetch("http://localhost:8080/api/alerts", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              latitude,
              longitude,
              message: "Need urgent help!",
              alertType: "message"
            }),
          });

          await res.json();
          alert("🚨 Message SOS Sent!");
          navigate("/live-tracking");
        } catch (err) {
          console.error(err);
          alert("Failed to send SOS");
        } finally {
          setLoading(false);
        }
      },
      () => {
        alert("Enable GPS");
        setLoading(false);
      }
    );
  };

  const sendVideoSOS = async () => {
    if (!videoBlob) {
      alert('Please record video first');
      return;
    }

    if (videoBlob.size === 0) {
      alert('Video is empty. Please try again.');
      return;
    }

    console.log('Sending video:', videoBlob.size, 'bytes');
    setLoading(true);
    const token = localStorage.getItem("token");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const latitude = pos.coords.latitude;
        const longitude = pos.coords.longitude;

        try {
          const formData = new FormData();
          formData.append('latitude', latitude);
          formData.append('longitude', longitude);
          formData.append('message', 'Video Evidence - Emergency!');
          formData.append('alertType', 'video');
          formData.append('video', videoBlob, 'emergency-video.webm');

          const res = await fetch("http://localhost:8080/api/alerts", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          });

          await res.json();
          alert("🎥 Video SOS Sent!");
          setVideoBlob(null);
          navigate("/live-tracking");
        } catch (err) {
          console.error(err);
          alert("Failed to send video");
        } finally {
          setLoading(false);
        }
      },
      () => {
        alert("Enable GPS");
        setLoading(false);
      }
    );
  };

  const sendAudioSOS = async () => {
    if (!audioBlob) {
      alert('Please record audio first');
      return;
    }

    if (audioBlob.size === 0) {
      alert('Audio is empty. Please try again.');
      return;
    }

    console.log('Sending audio:', audioBlob.size, 'bytes');
    setLoading(true);
    const token = localStorage.getItem("token");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const latitude = pos.coords.latitude;
        const longitude = pos.coords.longitude;

        try {
          const formData = new FormData();
          formData.append('latitude', latitude);
          formData.append('longitude', longitude);
          formData.append('message', 'Audio Evidence - Emergency!');
          formData.append('alertType', 'audio');
          formData.append('audio', audioBlob, 'emergency-audio.webm');

          const res = await fetch("http://localhost:8080/api/alerts", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          });

          await res.json();
          alert("🎤 Audio SOS Sent!");
          setAudioBlob(null);
          navigate("/live-tracking");
        } catch (err) {
          console.error(err);
          alert("Failed to send audio");
        } finally {
          setLoading(false);
        }
      },
      () => {
        alert("Enable GPS");
        setLoading(false);
      }
    );
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{
        background: "linear-gradient(135deg, #ff4e50, #f9d423)",
      }}
    >
      <div
        className="card shadow-lg p-5 text-center border-0"
        style={{
          maxWidth: "600px",
          borderRadius: "20px",
          background: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div className="text-danger mb-4">
          <AlertTriangle size={80} />
        </div>
        <h2 className="fw-bold mb-3 text-danger">Emergency SOS</h2>
        <p className="text-muted mb-4">
          Choose your emergency alert type
        </p>

        {isRecordingVideo && (
          <div className="mb-3">
            <video 
              ref={videoRef} 
              autoPlay 
              muted 
              playsInline
              style={{ 
                width: '100%', 
                maxHeight: '200px', 
                borderRadius: '10px',
                backgroundColor: '#000'
              }}
            />
            <div className="text-danger fw-bold mt-2">
              🔴 Recording: {formatTime(recordingTime)}
            </div>
          </div>
        )}

        {isRecordingAudio && (
          <div className="mb-3 p-3" style={{ background: '#fee2e2', borderRadius: '10px' }}>
            <Mic size={40} className="text-danger" />
            <div className="text-danger fw-bold mt-2">
              🔴 Recording Audio: {formatTime(recordingTime)}
            </div>
          </div>
        )}

        <div className="d-flex justify-content-center gap-3 mb-4 flex-wrap">
          
          <button
            onClick={sendMessageSOS}
            disabled={loading}
            className="btn btn-danger rounded-circle shadow-lg"
            style={{ width: '120px', height: '120px', fontSize: '14px' }}
          >
            <MessageSquare size={30} className="mb-2" />
            <br />
            <b>SOS<br/>MESSAGE</b>
          </button>

          {!isRecordingVideo && !videoBlob && (
            <button
              onClick={startVideoRecording}
              className="btn btn-primary rounded-circle shadow-lg"
              style={{ width: '120px', height: '120px', fontSize: '14px' }}
            >
              <Video size={30} className="mb-2" />
              <br />
              <b>RECORD<br/>VIDEO</b>
            </button>
          )}
          
          {isRecordingVideo && (
            <button
              onClick={stopVideoRecording}
              className="btn btn-dark rounded-circle shadow-lg pulse"
              style={{ width: '120px', height: '120px', fontSize: '14px' }}
            >
              ⏹️
              <br />
              <b>STOP<br/>VIDEO</b>
            </button>
          )}

          {videoBlob && !isRecordingVideo && (
            <button
              onClick={sendVideoSOS}
              disabled={loading}
              className="btn btn-success rounded-circle shadow-lg"
              style={{ width: '120px', height: '120px', fontSize: '14px' }}
            >
              📤
              <br />
              <b>SEND<br/>VIDEO</b>
              <br />
              <small>{(videoBlob.size / 1024).toFixed(0)}KB</small>
            </button>
          )}

          {!isRecordingAudio && !audioBlob && (
            <button
              onClick={startAudioRecording}
              className="btn rounded-circle shadow-lg"
              style={{ width: '120px', height: '120px', fontSize: '14px', background: '#8b5cf6', color: 'white' }}
            >
              <Mic size={30} className="mb-2" />
              <br />
              <b>RECORD<br/>AUDIO</b>
            </button>
          )}
          
          {isRecordingAudio && (
            <button
              onClick={stopAudioRecording}
              className="btn btn-dark rounded-circle shadow-lg pulse"
              style={{ width: '120px', height: '120px', fontSize: '14px' }}
            >
              ⏹️
              <br />
              <b>STOP<br/>AUDIO</b>
            </button>
          )}

          {audioBlob && !isRecordingAudio && (
            <button
              onClick={sendAudioSOS}
              disabled={loading}
              className="btn btn-success rounded-circle shadow-lg"
              style={{ width: '120px', height: '120px', fontSize: '14px' }}
            >
              📤
              <br />
              <b>SEND<br/>AUDIO</b>
              <br />
              <small>{(audioBlob.size / 1024).toFixed(0)}KB</small>
            </button>
          )}
        </div>

        {loading && (
          <div className="text-danger">
            <Loader2 className="spin" size={30} /> Sending...
          </div>
        )}
      </div>

      <style>
        {`
          .spin {
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .pulse {
            animation: pulse 1.5s infinite;
          }
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
        `}
      </style>
    </div>
  );
};

export default EmergencyButton;