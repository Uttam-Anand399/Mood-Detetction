import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import axios from "axios";

export default function FacialExpression() {
  const videoRef = useRef();
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [expression, setExpression] = useState("");     // just the mood
  const [songs, setSongs] = useState([]);

  // Load models and start video
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "/model";
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
      setModelsLoaded(true);
      startVideo();
    };
    const startVideo = () => {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => (videoRef.current.srcObject = stream));
    };
    loadModels();
    return () => videoRef.current?.srcObject?.getTracks().forEach(t => t.stop());
  }, []);

  // Fetch songs
  useEffect(() => {
    axios.get("https://mood-detetction.onrender.com/songs").then((res) => setSongs(res.data));
  }, []);

  // Detect mood
  const handleClick = async () => {
    if (!modelsLoaded || !videoRef.current) return;

    const det = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceExpressions();

    if (det) {
      const [top] = Object.entries(det.expressions).sort((a, b) => b[1] - a[1]);
      setExpression(top[0]);   // e.g., "happy"
    } else {
      setExpression("");
    }
  };

  const moodOnly = expression?.toLowerCase();
  const filterSongs = songs.filter(
    (el) => el.mood?.toLowerCase() === moodOnly
  );

  return (<div
  style={{
    display: "flex",
    gap: "2rem",
    padding: "2rem",
    background: "#f5f7fa",
    borderRadius: "16px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
    alignItems: "flex-start",
    fontFamily: "Segoe UI, sans-serif",
  }}
>
  {/* Left side: video + button */}
  <div
    style={{
      textAlign: "center",
      background: "#ffffff",
      padding: "1.5rem",
      borderRadius: "12px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
    }}
  >
    <video
      ref={videoRef}
      autoPlay
      muted
      width="320"
      height="380"
      style={{
        borderRadius: "12px",
        objectFit: "cover",
        border: "1px solid #e2e8f0",
      }}
    />
    <button
      onClick={handleClick}
      style={{
        marginTop: "1.2rem",
        padding: "0.7rem 1.4rem",
        background: "linear-gradient(90deg, #667eea, #764ba2)",
        color: "#fff",
        fontSize: "1rem",
        fontWeight: "600",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        boxShadow: "0 3px 8px rgba(0,0,0,0.15)",
        transition: "background 0.3s ease",
      }}
      onMouseOver={(e) =>
        (e.currentTarget.style.background =
          "linear-gradient(90deg, #5a67d8, #6b46c1)")
      }
      onMouseOut={(e) =>
        (e.currentTarget.style.background =
          "linear-gradient(90deg, #667eea, #764ba2)")
      }
    >
      Detect Mood
    </button>
    <h3 style={{ marginTop: "1rem", color: "#4a5568" }}>
      Expression: {expression || "—"}
    </h3>
  </div>

  {/* Right side: recommended tracks */}
  <div
    style={{
      flex: 1,
      background: "#ffffff",
      padding: "1.5rem",
      borderRadius: "12px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
    }}
  >
    <h2 style={{ marginBottom: "1rem", color: "#2d3748" }}>
      Recommended Tracks ({filterSongs.length})
    </h2>
    <ul style={{ listStyle: "none", padding: 0 }}>
      {filterSongs.map((track) => (
        <li
          key={track._id}
          style={{
            marginBottom: "1rem",
            padding: "0.8rem 1rem",
            background: "#f9fafb",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "inset 0 1px 2px rgba(0,0,0,0.03)",
          }}
        >
          <span style={{ fontWeight: 500, color: "#4a5568" }}>
            {track.title}
          </span>
          <audio controls src={track.audioFile} style={{ marginLeft: "1rem" }} />
        </li>
      ))}

      {filterSongs.length === 0 && (
        <p style={{ color: "#a0aec0", fontStyle: "italic" }}>
          No tracks for this mood.
        </p>
      )}
    </ul>
  </div>
</div>

  );
}
