import { useState, useRef } from "react";
import { Video, Play, Square, Upload, Link, CheckCircle } from "lucide-react";
import toast, { Toaster } from 'react-hot-toast';
import { db } from "../firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useEffect } from "react";


const ScreenRecorder = ({ user }) => {

  const [recording, setRecording] = useState(false);
  const [videoURL, setVideoURL] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const recordedChunks = useRef([]);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);


  const startRecording = async () => {
    if (isMobile) {
    toast.error("📵 Screen recording is not supported on mobile devices.", {
      duration: 5000,
      style: {
        background: "#EF4444",
        color: "#fff",
      },
    });
    return;
  }
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
      streamRef.current = stream;
      recordedChunks.current = [];
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: "video/webm" });
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunks.current.push(e.data);
      };
      
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(recordedChunks.current, { type: "video/webm" });
        setIsUploading(true);
        toast.loading('Processing your recording...', {
          id: 'upload-toast',
          duration: Infinity,
        });
        uploadToCloudinary(blob);
      };
      
      mediaRecorderRef.current.start();
      setRecording(true);
      setRecordingTime(0);
      
      // Show recording started toast
      toast.success('🎥 Recording started!', {
        duration: 3000,
        style: {
          background: '#10B981',
          color: '#fff',
        },
      });
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error('Failed to start recording. Please try again.', {
        duration: 4000,
        style: {
          background: '#EF4444',
          color: '#fff',
        },
      });
    }
  };

  const stopRecording = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setRecording(false);
    
    // Show recording stopped toast
    toast.success('⏹️ Recording stopped!', {
      duration: 3000,
      style: {
        background: '#F59E0B',
        color: '#fff',
      },
    });
  };

 const uploadToCloudinary = async (videoBlob) => {
  const data = new FormData();
  data.append("file", videoBlob);
  data.append("upload_preset", "unsigned_video");
  data.append("cloud_name", "dzjjfucwz");

  try {
    const res = await fetch("https://api.cloudinary.com/v1_1/dzjjfucwz/video/upload", {
      method: "POST",
      body: data,
    });

    const result = await res.json();
    const url = result.secure_url;
    setVideoURL(url);

    // ✅ Save to Firestore
    await addDoc(collection(db, "videos"), {
      videoURL: url,
      userId: user.uid,
      createdAt: serverTimestamp(),
    });

    toast.success('✅ Recording uploaded & saved!', {
      id: 'upload-toast',
      duration: 4000,
      style: {
        background: '#10B981',
        color: '#fff',
      },
    });
  } catch (err) {
    console.error("Upload failed", err);
    toast.error('❌ Upload failed. Please try again.', {
      id: 'upload-toast',
      duration: 4000,
      style: {
        background: '#EF4444',
        color: '#fff',
      },
    });
  } finally {
    setIsUploading(false);
  }
};


  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const copyToClipboard = async () => {
    if (videoURL) {
      try {
        await navigator.clipboard.writeText(videoURL);
        toast.success('🔗 Link copied to clipboard!', {
          duration: 3000,
          style: {
            background: '#8B5CF6',
            color: '#fff',
          },
        });
      } catch (err) {
        console.error("Failed to copy:", err);
        toast.error('Failed to copy link. Please try again.', {
          duration: 3000,
          style: {
            background: '#EF4444',
            color: '#fff',
          },
        });
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Toast Container */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1F2937',
            color: '#F9FAFB',
            border: '1px solid #374151',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '500',
          },
        }}
      />
      
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
      </div>
      
      <div className="absolute inset-0 opacity-5" style={{backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '20px 20px'}}></div>
      
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-4xl space-y-12">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl mb-6 shadow-2xl">
              <Video className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-6xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Screen Recorder
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Capture your screen with professional quality and share instantly
            </p>
          </div>

          {recording && (
            <div className="flex items-center justify-center space-x-4 bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-2xl p-6">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-red-400 font-semibold">RECORDING</span>
              </div>
              <div className="text-white font-mono text-2xl">
                {formatTime(recordingTime)}
              </div>
            </div>
          )}

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-12 shadow-2xl">
            <div className="flex flex-col items-center space-y-8">
              <div className="relative">
                {!recording ? (
                  <button
                    onClick={startRecording}
                    className="group relative w-32 h-32 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full shadow-2xl hover:shadow-green-500/25 transform hover:scale-105 transition-all duration-300 flex items-center justify-center"
                  >
                    <Play className="w-12 h-12 text-white ml-1 group-hover:scale-110 transition-transform duration-200" />
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 opacity-0 group-hover:opacity-20 animate-ping"></div>
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="group relative w-32 h-32 bg-gradient-to-r from-red-400 to-rose-500 rounded-full shadow-2xl hover:shadow-red-500/25 transform hover:scale-105 transition-all duration-300 flex items-center justify-center"
                  >
                    <Square className="w-10 h-10 text-white group-hover:scale-110 transition-transform duration-200" />
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-400 to-rose-500 opacity-0 group-hover:opacity-20 animate-ping"></div>
                  </button>
                )}
              </div>

            <p className="text-gray-300 text-lg text-center sm:text-left">
  {!recording ? "Click to start recording your screen" : "Click to stop recording"}
</p>

            </div>
          </div>

          {isUploading && (
            <div className="bg-blue-500/10 backdrop-blur-sm border border-blue-500/20 rounded-2xl p-8">
              <div className="flex items-center justify-center space-x-4">
                <Upload className="w-8 h-8 text-blue-400 animate-bounce" />
                <div className="space-y-2">
                  <p className="text-blue-400 font-semibold text-xl">Processing your recording...</p>
                  <div className="w-64 h-2 bg-blue-900/30 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {videoURL && (
            <div className="bg-green-500/10 backdrop-blur-sm border border-green-500/20 rounded-2xl p-8 space-y-6">
              <div className="flex items-center justify-center space-x-3 mb-6">
                <CheckCircle className="w-8 h-8 text-green-400" />
                <h2 className="text-2xl font-bold text-green-400">Recording Complete!</h2>
              </div>
              
              <div className="space-y-6">
                <video
                  src={videoURL}
                  controls
                  className="w-full rounded-2xl border border-white/10 shadow-2xl bg-black"
                  style={{ maxHeight: '400px' }}
                />
                
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Link className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-300 font-medium">Shareable Link:</span>
                    </div>
                    <button
                      onClick={copyToClipboard}
                      className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors duration-200 text-sm font-medium"
                    >
                      Copy Link
                    </button>
                  </div>
                  <p className="text-gray-400 text-sm mt-2 break-all font-mono">
                    {videoURL}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScreenRecorder;