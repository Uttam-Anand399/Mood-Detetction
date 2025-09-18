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
    axios.get("http://localhost:3000/songs").then((res) => setSongs(res.data));
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

  return (
    <div style={{ display: "flex", gap: 40, padding: 40 }}>
      <div style={{ textAlign: "center" }}>
        <video ref={videoRef} autoPlay muted width="320" height="380" />
        <button onClick={handleClick}>Detect Mood</button>
        <h3>Expression: {expression || "—"}</h3>
      </div>

      <div>
        <h2>Recommended Tracks ({filterSongs.length})</h2>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {filterSongs.map((track) => (
            <li key={track._id} style={{ marginBottom: 12 }}>
              <span>{track.title}</span>
              <audio controls src={track.audioFile} style={{ marginLeft: 8 }} />
            </li>
          ))}
          {filterSongs.length === 0 && <p>No tracks for this mood.</p>}
        </ul>
      </div>
    </div>
  );
}
