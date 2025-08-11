import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

// TailwindCSS required in the project. This is a single-file React component (TypeScript)
// Usage: place into a React app (Vite/Next.js/Create React App) with Tailwind & Framer Motion installed.

export default function SkinAIApp(): JSX.Element {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [step, setStep] = useState<number>(0);
  const [cameraOn, setCameraOn] = useState(false);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Questionnaire state
  const [age, setAge] = useState<number | "">("");
  const [skinTone, setSkinTone] = useState<string>("medium");
  const [concerns, setConcerns] = useState<string[]>([]);
  const [consent, setConsent] = useState(false);

  const availableConcerns = [
    "Acne / Breakouts",
    "Redness / Rosacea",
    "Dryness / Dehydration",
    "Pigmentation / Dark spots",
    "Aging / Fine lines",
    "Other",
  ];

  useEffect(() => {
    return () => stopCamera();
  }, []);

  async function startCamera() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraOn(true);
      }
    } catch (e: any) {
      setError("Unable to access camera. Please allow camera permissions or upload an image.");
    }
  }

  function stopCamera() {
    const stream = videoRef.current?.srcObject as MediaStream | undefined;
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
    }
    setCameraOn(false);
  }

  function captureFromVideo() {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // draw the centered cropped rectangle to encourage good composition
    const w = canvas.width;
    const h = canvas.height;
    // Optionally crop to a square area in center (user-friendly)
    const size = Math.min(w, h) * 0.8;
    const sx = (w - size) / 2;
    const sy = (h - size) / 2;
    ctx.drawImage(video, sx, sy, size, size, 0, 0, 1024, 1024); // normalize to 1024 square
    const data = canvas.toDataURL("image/jpeg", 0.92);
    setImageDataUrl(data);
    stopCamera();
    setStep(3);
  }

  function handleUploadFile(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImageDataUrl(reader.result as string);
      setStep(3);
    };
    reader.readAsDataURL(file);
  }

  function toggleConcern(item: string) {
    setConcerns((prev) => (prev.includes(item) ? prev.filter((p) => p !== item) : [...prev, item]));
  }

  async function submitForAnalysis() {
    setError(null);
    setResult(null);

    if (!consent) {
      setError("You must consent to submit your image for automated analysis.");
      return;
    }
    if (!imageDataUrl) {
      setError("No image to analyze. Please capture or upload an image.");
      return;
    }

    setUploading(true);

    try {
      // Prepare form data to send to your server endpoint
      // IMPORTANT: do NOT call proprietary model APIs directly from client-side. Instead send to your backend API
      // that will forward to the chosen AI provider securely (store keys server-side) and ensure privacy.
      const blob = await (await fetch(imageDataUrl)).blob();
      const fd = new FormData();
      fd.append("image", blob, "skin.jpg");
      fd.append("age", String(age));
      fd.append("skinTone", skinTone);
      fd.append("concerns", JSON.stringify(concerns));

      // Example: replace '/api/analyze' with your server-side route.
      const resp = await fetch("/api/analyze", { method: "POST", body: fd });
      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(txt || "Server error");
      }
      const json = await resp.json();
      setResult(json);
      setStep(4);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  function resetAll() {
    setStep(0);
    setImageDataUrl(null);
    setResult(null);
    setAge("");
    setSkinTone("medium");
    setConcerns([]);
    setConsent(false);
    setError(null);
  }

  // small accessible stepper UI
  const steps = ["Intro", "Questions", "Camera / Upload", "Review & Send", "Results"];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-indigo-50 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl p-6 md:p-10">
        <header className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">SkinSight — Smart Skin Intake</h1>
            <p className="text-sm text-slate-500 mt-1">Guided capture, questionnaire, and AI-assisted analysis (demo).</p>
          </div>
          <div className="text-right text-xs text-slate-400">
            <div>Privacy: images are processed securely on your server.</div>
            <div className="mt-1">Not medical advice — informational only.</div>
          </div>
        </header>

        {/* Stepper */}
        <nav className="mt-6">
          <ol className="flex gap-2 items-center text-xs text-slate-500">
            {steps.map((s, i) => (
              <li key={s} className={`flex items-center gap-2 ${i === step ? "text-indigo-600 font-medium" : ""}`}>
                <div
                  aria-current={i === step ? "step" : undefined}
                  className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                    i <= step ? "border-indigo-300 bg-indigo-50" : "border-slate-200 bg-white"
                  }`}
                >
                  {i + 1}
                </div>
                <span className="hidden md:inline-block">{s}</span>
                {i < steps.length - 1 && <div className="w-6 h-[1px] bg-slate-200 mx-2" />}
              </li>
            ))}
          </ol>
        </nav>

        <main className="mt-6">
          {/* Errors */}
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 text-sm text-red-600">
              {error}
            </motion.div>
          )}

          {step === 0 && (
            <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="text-lg font-semibold text-slate-800">Quick overview</h2>
              <p className="mt-2 text-slate-600">This guided tool helps you capture a clear skin photo, collect context, and submit it for AI analysis. The response is informational and not a diagnosis.</p>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white shadow hover:shadow-lg transition"
                >
                  Start questionnaire
                </button>
                <button onClick={() => setStep(2)} className="px-4 py-2 rounded-lg border">
                  Skip to capture
                </button>
              </div>
            </motion.section>
          )}

          {step === 1 && (
            <motion.section initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="text-lg font-semibold text-slate-800">A few questions</h2>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex flex-col">
                  <span className="text-sm text-slate-600">Age</span>
                  <input
                    type="number"
                    min={1}
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value) || "")}
                    className="mt-1 p-2 rounded border bg-white"
                    placeholder="e.g. 29"
                    aria-label="Age"
                  />
                </label>

                <label className="flex flex-col">
                  <span className="text-sm text-slate-600">Skin tone</span>
                  <select value={skinTone} onChange={(e) => setSkinTone(e.target.value)} className="mt-1 p-2 rounded border bg-white">
                    <option value="light">Light</option>
                    <option value="fair">Fair</option>
                    <option value="medium">Medium</option>
                    <option value="olive">Olive</option>
                    <option value="brown">Brown</option>
                    <option value="dark">Dark</option>
                  </select>
                </label>

                <div className="md:col-span-2">
                  <span className="text-sm text-slate-600">Main concerns (choose any)</span>
                  <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                    {availableConcerns.map((c) => (
                      <button
                        key={c}
                        onClick={() => toggleConcern(c)}
                        className={`p-2 rounded border text-sm text-slate-700 text-left ${concerns.includes(c) ? "bg-indigo-50 border-indigo-200" : "bg-white border-slate-200"}`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="flex items-center gap-2 md:col-span-2 mt-2">
                  <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
                  <span className="text-sm text-slate-600">I consent to upload this image for automated analysis (not a medical diagnosis).</span>
                </label>
              </div>

              <div className="mt-6 flex gap-3">
                <button onClick={() => setStep(2)} className="px-4 py-2 rounded-lg bg-indigo-600 text-white">
                  Continue to capture
                </button>
                <button onClick={() => setStep(0)} className="px-4 py-2 rounded-lg border">
                  Back
                </button>
              </div>
            </motion.section>
          )}

          {step === 2 && (
            <motion.section initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="text-lg font-semibold text-slate-800">Capture or upload</h2>
              <p className="mt-2 text-sm text-slate-600">We recommend good lighting, neutral background, and framing the area. Use the on-screen guide to center the skin region.</p>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative rounded-lg border overflow-hidden bg-black/5 aspect-video">
                  {/* Video preview */}
                  <video ref={videoRef} className={`w-full h-full object-cover`} playsInline muted />

                  {/* On-top guide box */}
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="w-3/5 aspect-square border-2 border-dashed border-white/60 rounded-lg backdrop-blur-sm" />
                  </div>
                </div>

                <div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => (cameraOn ? stopCamera() : startCamera())}
                      className="px-4 py-2 rounded-lg border"
                    >
                      {cameraOn ? "Stop camera" : "Start camera"}
                    </button>
                    <button onClick={captureFromVideo} disabled={!cameraOn} className="px-4 py-2 rounded-lg bg-emerald-500 text-white">
                      Capture
                    </button>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm text-slate-600">Or upload an image</label>
                    <input type="file" accept="image/*" onChange={handleUploadFile} className="mt-2" />
                  </div>

                  <div className="mt-4 text-xs text-slate-500">
                    Tips: Remove makeup if possible, use daylight, keep the camera steady, frame the affected area in the center box.
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button onClick={() => setStep(1)} className="px-4 py-2 rounded-lg border">
                  Back
                </button>
                <button onClick={() => setStep(3)} className="px-4 py-2 rounded-lg bg-indigo-600 text-white">
                  Review capture
                </button>
              </div>

              <canvas ref={canvasRef} className="hidden" />
            </motion.section>
          )}

          {step === 3 && (
            <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-lg font-semibold text-slate-800">Review & submit</h2>

              <div className="mt-4 grid md:grid-cols-2 gap-4">
                <div className="rounded-lg border p-3 bg-white flex flex-col items-center">
                  {imageDataUrl ? (
                    <img src={imageDataUrl} alt="Captured skin" className="w-full max-w-xs rounded shadow" />
                  ) : (
                    <div className="text-sm text-slate-500">No image captured</div>
                  )}
                </div>

                <div>
                  <div className="text-sm text-slate-600">Summary</div>
                  <ul className="mt-2 text-sm text-slate-700 list-disc pl-5">
                    <li>Age: {age || "—"}</li>
                    <li>Skin tone: {skinTone}</li>
                    <li>Concerns: {concerns.length ? concerns.join(", ") : "—"}</li>
                    <li>Consent: {consent ? "Yes" : "No"}</li>
                  </ul>

                  <div className="mt-6 flex gap-3">
                    <button onClick={() => setStep(2)} className="px-4 py-2 rounded-lg border">
                      Retake / Upload
                    </button>
                    <button disabled={uploading} onClick={submitForAnalysis} className="px-4 py-2 rounded-lg bg-indigo-600 text-white">
                      {uploading ? "Sending..." : "Send for analysis"}
                    </button>
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {step === 4 && (
            <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-lg font-semibold text-slate-800">Results</h2>
              <div className="mt-4 space-y-4">
                <div className="rounded-lg border p-4 bg-white">
                  <div className="text-sm text-slate-600">AI Summary</div>
                  <pre className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">{JSON.stringify(result ?? { message: "No result" }, null, 2)}</pre>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(3)} className="px-4 py-2 rounded-lg border">
                    Back
                  </button>
                  <button onClick={resetAll} className="px-4 py-2 rounded-lg bg-slate-100">
                    New session
                  </button>
                </div>
              </div>
            </motion.section>
          )}
        </main>

        <footer className="mt-6 text-xs text-slate-400">
          <div>Important: This application is for informational purposes only. It is not a substitute for professional medical advice.</div>
        </footer>
      </div>
    </div>
  );
}
