import React, { useState, useRef } from 'react';
import axios from 'axios';

function AudioRecorder() {
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState('');
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  
  const startRecording = () => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];
      
      mediaRecorder.current.ondataavailable = event => {
        audioChunks.current.push(event.data);
      };
      
      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioURL(audioUrl);
        callAPI(audioBlob);
      };
      
      mediaRecorder.current.start();
      setRecording(true);
    });
  };
  
  const stopRecording = () => {
    mediaRecorder.current.stop();
    setRecording(false);
  };
  
  const callAPI = async (audioBlob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);
      formData.append('paragraph', inputText);
      setIsLoading(true);
      const res = await axios.post('http://localhost:5000/compare_audio', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setIsLoading(false);
      setResponse(res.data.feedback);
    } catch (error) {
      setIsLoading(false);
      setError('An error occurred while processing your request.');
    }
  };

  const handleChange = (e) => {
    setInputText(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent the default behavior (submitting the form)
      setInputText(inputText + '\n'); // Add a newline character
    }
  };

  
  return (
    <div>
      <h1 className='heading'>Welcome to Akshara School Learning Portal</h1>
      <textarea
        rows="1" 
        placeholder="Type something..."
        value={inputText}
        onChange={handleChange}
        className='text-input'
        onKeyDown={handleKeyDown}
      ></textarea>

      <p></p>
      <button className='button' onClick={recording ? stopRecording : startRecording}>
        {recording ? 'Stop Recording' : 'Start Recording'}
      </button>
      {audioURL && <audio controls src={audioURL}></audio>}
      
      {isLoading ? (
        <div className="loading-spinner">
          
          Loading Results...
        </div>
      ) : (
        <div >
          {response && <p>{response}</p>}
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
      )}

    
    </div>
  );
}

export default AudioRecorder;
