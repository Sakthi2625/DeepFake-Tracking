import React, { useState } from "react";
import axios from "axios";

function App() {
    const [file, setFile] = useState(null);
    const [result, setResult] = useState("");

    // Handle file selection
    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    // Handle file upload
    const handleUpload = async () => {
        if (!file) {
            alert("Please select a file to upload!");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await axios.post("http://localhost:5000/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setResult(response.data.message || "No result returned.");
        } catch (error) {
            console.error("Error uploading file:", error);
            setResult("Failed to upload or process file.");
        }
    };

    return (
        <div style={{ textAlign: "center", padding: "20px" }}>
            <h1>Deepfake Propagation Tracker</h1>
            <input type="file" accept="video/*,image/*" onChange={handleFileChange} />
            <button onClick={handleUpload} style={{ marginLeft: "10px" }}>
                Upload & Track
            </button>

            {result && (
                <div style={{ marginTop: "20px", padding: "10px", border: "1px solid #ccc" }}>
                    <h2>Tracking Result:</h2>
                    <p>{result}</p>
                </div>
            )}
        </div>
    );
}

export default App;
