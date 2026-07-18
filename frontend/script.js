document.addEventListener('DOMContentLoaded', () => {
  console.log('🎬 INTER-VU Script loaded');
  const yearElement = document.getElementById('year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  const startBtn = document.getElementById('startInterviewBtn');
  console.log('Start button:', startBtn);
  if (!startBtn) {
    console.error('❌ Start button not found!');
  }
  const nextBtn = document.getElementById('nextQuestionBtn');
  const endBtn = document.getElementById('endInterviewBtn');
  const video = document.getElementById('video');
  const cameraHint = document.getElementById('cameraHint');
  const cameraStatus = document.getElementById('cameraStatus');
  const questionTitle = document.getElementById('questionTitle');
  const questionText = document.getElementById('questionText');
  const questionCounter = document.getElementById('questionCounter');
  const timerValue = document.getElementById('timer');
  const eyeMetric = document.getElementById('eyeMetric');
  const handMetric = document.getElementById('handMetric');
  const postureMetric = document.getElementById('postureMetric');
  const positionScore = document.getElementById('positionScore');
  const eyeValue = document.getElementById('eyeValue');
  const gestureValue = document.getElementById('gestureValue');
  const positionValue = document.getElementById('positionValue');
  const feedbackTitle = document.getElementById('feedbackTitle');
  const feedbackText = document.getElementById('feedbackText');
  const confidenceLabel = document.getElementById('confidenceLabel');
  const clarityLabel = document.getElementById('clarityLabel');
  const genderSelect = document.getElementById('genderSelect');
  const reviewPanel = document.getElementById('reviewPanel');
  const overallPercentage = document.getElementById('overallPercentage');
  const analysisText = document.getElementById('analysisText');
  const restartBtn = document.getElementById('restartBtn');

  const questions = [
    'Tell me about yourself and your education.',
    'Describe a technical project you built and explain the architecture decisions you made.',
    'What is the difference between a stack and a queue, and where would you use each?',
    'What is a database, and why is it used?',
    'Explain the four pillars of Object-Oriented Programming.',
    'What is the difference between SQL and NoSQL databases?',
    'What are APIs, and how do they work?',
    'What is Git, and why is version control important?',
    'Explain the SDLC (Software Development Life Cycle).',
    'What is the difference between HTTP and HTTPS?',
    'What are REST APIs?',
    'Explain the difference between a process and a thread.',
    'How would you optimize a slow database query in a production application?',
    'Explain the difference between REST and GraphQL in a real-world API design scenario.',
    'How do you handle errors and exceptions in a backend service?',
    'What is the difference between multithreading and multiprocessing?',
    'How would you design a scalable login system for a large application?',
    'Tell me about a time you improved performance or reliability in a project.',
    'Why should we hire you for this role?'
  ];

  let currentQuestionIndex = 0;
  let interviewStarted = false;
  let timerSeconds = 0;
  let answerCount = 0;
  let selectedGender = 'female';
  let timerInterval = null;
  let stream = null;
  let faceMesh = null;
  let hands = null;
  let camera = null;
  let recognition = null;
  let waitingForReadyResponse = false;
  let eyeContactScore = 0;
  let handVisibilityScore = 0;
  let positionScoreValue = 0;

  function selectVoice() {
    const voices = window.speechSynthesis.getVoices();
    let voice = voices.find((v) => {
      const name = v.name.toLowerCase();
      if (selectedGender === 'male') {
        return name.includes('male') || name.includes('daniel') || name.includes('david') || name.includes('mark') || name.includes('james');
      } else {
        return name.includes('female') || name.includes('samantha') || name.includes('ava') || name.includes('zira') || name.includes('anika') || name.includes('hazel') || name.includes('karen') || name.includes('moira');
      }
    });

    if (!voice) {
      voice = voices.find((v) => {
        const name = v.name.toLowerCase();
        if (selectedGender === 'male') {
          return name.includes('male') || name.includes('daniel') || name.includes('david');
        } else {
          return name.includes('female') || name.includes('samantha') || name.includes('ava') || !name.includes('male');
        }
      });
    }

    if (!voice) {
      voice = voices[0];
    }

    return voice;
  }

  function speak(text) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = selectedGender === 'male' ? 0.85 : 1.2;
    utterance.lang = 'en-US';

    const voice = selectVoice();
    if (voice) {
      utterance.voice = voice;
    }

    window.speechSynthesis.speak(utterance);
  }

  function startVoiceAssistant() {
    const greeting = 'Welcome to your AI mock interview. Please look at the camera and answer each question clearly and confidently.';
    speak(greeting);
  }

  function setupSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      return;
    }

    recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join(' ')
        .toLowerCase();

      if (waitingForReadyResponse && /(yes|yeah|yep|ready|start|go)/i.test(transcript)) {
        waitingForReadyResponse = false;
        if (recognition) {
          recognition.stop();
        }
        showQuestion(0);
      }
    };

    recognition.onerror = () => {
      waitingForReadyResponse = false;
    };
  }

  function startReadinessPrompt() {
    waitingForReadyResponse = true;
    questionTitle.textContent = 'Ready Check';
    questionText.textContent = 'HI, Are you ready for the Interview?';
    questionCounter.textContent = 'Ready check';
    speak('HI, Are you ready for the Interview?');

    if (recognition) {
      try {
        recognition.start();
      } catch (error) {
        console.warn('Speech recognition could not start.', error);
      }
    }
  }

  function updateTimer() {
    timerSeconds += 1;
    const minutes = String(Math.floor(timerSeconds / 60)).padStart(2, '0');
    const seconds = String(timerSeconds % 60).padStart(2, '0');
    timerValue.textContent = `${minutes}:${seconds}`;
  }

  function showQuestion(index) {
    const safeIndex = Math.min(index, questions.length - 1);
    currentQuestionIndex = safeIndex;
    questionTitle.textContent = `Question ${safeIndex + 1}`;
    questionText.textContent = questions[safeIndex];
    questionCounter.textContent = `Question ${safeIndex + 1} / ${questions.length}`;
    speak(questions[safeIndex]);
  }

  function updateMonitoringSummary() {
    const eyeText = eyeContactScore >= 70 ? 'Strong eye contact' : eyeContactScore >= 40 ? 'Moderate eye contact' : 'Look toward the camera';
    const handText = handVisibilityScore >= 70 ? 'Hands visible' : handVisibilityScore >= 40 ? 'Hands partly visible' : 'Keep hands visible';
    const positionText = positionScoreValue >= 70 ? 'Good posture' : positionScoreValue >= 40 ? 'Adjust posture' : 'Lean in and center yourself';

    eyeMetric.textContent = `${eyeContactScore}%`;
    handMetric.textContent = `${handVisibilityScore}%`;
    postureMetric.textContent = `${positionScoreValue}%`;
    
    const overallScore = Math.round((eyeContactScore + handVisibilityScore + positionScoreValue) / 3);
    positionScore.textContent = `${overallScore}%`;

    // Update progress ring offset
    const ring = document.querySelector('.progress-ring__bar');
    if (ring) {
      const radius = parseFloat(ring.getAttribute('r')) || 70;
      const circumference = 2 * Math.PI * radius;
      const offset = circumference - (overallScore / 100) * circumference;
      ring.style.strokeDashoffset = offset;
    }

    eyeValue.textContent = eyeText;
    gestureValue.textContent = handText;
    positionValue.textContent = positionText;
  }

  function resetMonitoring() {
    eyeContactScore = 0;
    handVisibilityScore = 0;
    positionScoreValue = 0;
    updateMonitoringSummary();
  }

  function showCameraMessage(message, isError = false) {
    cameraHint.style.display = 'grid';
    cameraHint.textContent = message;
    cameraHint.style.color = isError ? '#fecaca' : '#e2e8f0';
  }

  async function onFrame() {
    if (!interviewStarted) return;
    try {
      if (faceMesh && video.readyState >= 2) {
        await faceMesh.send({ image: video });
      }
      if (hands && video.readyState >= 2) {
        await hands.send({ image: video });
      }
    } catch (e) {
      console.warn('MediaPipe error:', e);
    }
    if (interviewStarted) {
      requestAnimationFrame(onFrame);
    }
  }

  async function initializeVision() {
    if (window.FaceMesh && window.Hands) {
      faceMesh = new window.FaceMesh({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
      });
      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });
      faceMesh.onResults((results) => {
        if (!results.multiFaceLandmarks?.length) {
          eyeContactScore = 25;
          handVisibilityScore = 40;
          positionScoreValue = 35;
          updateMonitoringSummary();
          return;
        }

        const landmarks = results.multiFaceLandmarks[0];
        const leftEye = landmarks[145];
        const rightEye = landmarks[374];
        const nose = landmarks[1];
        const frameCenterX = 0.5;
        const eyeCenterX = (leftEye.x + rightEye.x) / 2;
        const eyeOffset = Math.abs(eyeCenterX - frameCenterX);

        eyeContactScore = Math.max(20, Math.min(100, 100 - eyeOffset * 180));
        positionScoreValue = Math.max(30, Math.min(100, 65 + (1 - Math.abs(nose.z)) * 20));
        handVisibilityScore = Math.max(40, Math.min(100, handVisibilityScore));
        updateMonitoringSummary();
      });

      hands = new window.Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
      });
      hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });
      hands.onResults((results) => {
        if (!results.multiHandLandmarks?.length) {
          handVisibilityScore = 35;
        } else {
          handVisibilityScore = 85;
        }
        updateMonitoringSummary();
      });

      return true;
    }

    return false;
  }

  async function startInterview() {
    console.log('🎬 Starting interview...');
    
    if (interviewStarted) {
      console.log('Already running');
      return;
    }

    try {
      console.log('📹 Requesting camera...');
      showCameraMessage('Requesting camera access...');
      
      // Get camera
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });
      
      console.log('✅ Got camera stream');
      
      // Attach stream
      video.srcObject = mediaStream;
      stream = mediaStream;
      
      // Wait for video to be ready
      while (video.readyState < 2) {
        await new Promise(r => setTimeout(r, 100));
      }
      
      console.log('▶️ Playing video');
      video.play();
      
      // Success
      interviewStarted = true;
      cameraHint.style.display = 'none';
      cameraStatus.textContent = 'Camera live';
      cameraStatus.style.background = 'rgba(34, 197, 94, 0.2)';
      cameraStatus.style.color = '#bbf7d0';

      // Initialize vision if not done
      if (!faceMesh || !hands) {
        console.log('🔮 Initializing MediaPipe Vision...');
        showCameraMessage('Loading AI models...');
        await initializeVision();
      }

      // Start frame loop
      requestAnimationFrame(onFrame);
      
      // Start interview
      console.log('🎤 Starting questions');
      resetMonitoring();
      startVoiceAssistant();
      showQuestion(0);
      
      timerSeconds = 0;
      clearInterval(timerInterval);
      timerInterval = setInterval(updateTimer, 1000);
      
      console.log('✅ Interview running');
      
    } catch (error) {
      console.error('❌ Start failed:', error.name, error.message);
      interviewStarted = false;
      showCameraMessage(error.message, true);
    }
  }


  function updateVoiceFeedback() {
    const clarityScore = Math.min(100, 55 + answerCount * 6 + Math.floor(timerSeconds / 20));
    const confidenceScore = Math.min(100, 50 + answerCount * 4 + Math.floor(timerSeconds / 25));

    const clarityLevel = clarityScore >= 80 ? 'Excellent' : clarityScore >= 60 ? 'Good' : 'Needs work';
    const confidenceLevel = confidenceScore >= 80 ? 'Excellent' : confidenceScore >= 60 ? 'Good' : 'Needs work';

    feedbackTitle.textContent = 'Speaking Review';
    feedbackText.textContent = `You answered ${answerCount} questions. Your pace and clarity were ${clarityLevel.toLowerCase()}, and your confidence level was ${confidenceLevel.toLowerCase()}.`;
    confidenceLabel.textContent = `Confidence: ${confidenceLevel}`;
    clarityLabel.textContent = `Clarity: ${clarityLevel}`;
    speak(`Your voice feedback is ready. Clarity is ${clarityLevel}, and confidence is ${confidenceLevel}.`);
  }

  function calculateReviewScores() {
    const scores = {};

    // 1. Technical Knowledge - based on number of questions answered
    scores.techKnowledge = Math.min(10, Math.round((answerCount / questions.length) * 10));

    // 2. Communication Skills - based on clarity score
    const clarityScore = Math.min(100, 55 + answerCount * 6 + Math.floor(timerSeconds / 20));
    scores.communication = Math.round((clarityScore / 100) * 10);

    // 3. Confidence Level - based on session duration and consistency
    const confidenceScore = Math.min(100, 50 + answerCount * 4 + Math.floor(timerSeconds / 25));
    scores.confidence = Math.round((confidenceScore / 100) * 10);

    // 4. Problem-Solving Ability - based on time taken per question and completion
    const avgTimePerQuestion = answerCount > 0 ? timerSeconds / answerCount : 0;
    const goodPaceScore = avgTimePerQuestion >= 15 && avgTimePerQuestion <= 45 ? 10 : 8;
    scores.problemSolving = Math.min(10, Math.round(goodPaceScore * (answerCount / Math.max(1, questions.length)) + 2));

    // 5. Eye Contact - direct from monitoring
    scores.eyeContact = Math.round((eyeContactScore / 100) * 10);

    // 6. Body Language & Posture - from position and hand visibility
    const bodyLanguageAvg = (positionScoreValue + handVisibilityScore) / 2;
    scores.bodyLanguage = Math.round((bodyLanguageAvg / 100) * 10);

    // 7. Speaking Pace - based on average time and consistency
    const paceScore = avgTimePerQuestion >= 15 && avgTimePerQuestion <= 50 ? 10 : avgTimePerQuestion > 50 ? 6 : 8;
    scores.speakingPace = Math.max(1, Math.min(10, paceScore));

    // 8. Grammar & Vocabulary - estimated from session length and completion
    scores.grammar = Math.min(10, Math.round(5 + (answerCount / questions.length) * 5));

    // 9. Professionalism - based on session completion and consistency
    const completionRate = (answerCount / questions.length) * 100;
    scores.professionalism = Math.min(10, Math.round(5 + (completionRate / 100) * 5));

    // 10. Overall Impression - average of all scores
    const allScores = Object.values(scores);
    scores.overallImpression = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);

    return scores;
  }

  function generateAnalysisText(scores) {
    const overallAvg = Math.round((scores.techKnowledge + scores.communication + scores.confidence + scores.problemSolving + scores.eyeContact + scores.bodyLanguage + scores.speakingPace + scores.grammar + scores.professionalism + scores.overallImpression) / 10);

    let analysis = '';

    if (overallAvg >= 8) {
      analysis = `Excellent performance! You demonstrated strong technical knowledge, excellent communication skills, and maintained great eye contact. Your professional demeanor and confident delivery were impressive. Keep up this excellent work!`;
    } else if (overallAvg >= 7) {
      analysis = `Very good interview performance. You showed solid technical understanding and good communication skills. Your eye contact and body language were generally positive. To further improve, focus on maintaining even more consistent eye contact and speaking at a steady pace throughout.`;
    } else if (overallAvg >= 6) {
      analysis = `Good attempt with room for improvement. You answered several questions and showed understanding of the topics. Consider improving your eye contact, maintaining better posture, and being more concise in your answers. Practice will help boost your confidence.`;
    } else if (overallAvg >= 5) {
      analysis = `You made a decent effort. To improve significantly: maintain stronger eye contact with the camera, focus on clear and confident speech, practice answering questions more thoroughly, and work on your body language and posture. Regular practice will help you build interview confidence.`;
    } else {
      analysis = `There's definitely room for improvement. Focus on: maintaining consistent eye contact, sitting with proper posture, speaking clearly and confidently, and preparing more detailed answers. Practice these sessions regularly to build your interview skills.`;
    }

    return analysis;
  }

  function displayReview(scores) {
    // Update all score displays
    document.getElementById('techKnowledgeScore').textContent = `${scores.techKnowledge}/10`;
    document.getElementById('techKnowledgeFill').style.width = `${(scores.techKnowledge / 10) * 100}%`;

    document.getElementById('communicationScore').textContent = `${scores.communication}/10`;
    document.getElementById('communicationFill').style.width = `${(scores.communication / 10) * 100}%`;

    document.getElementById('confidenceScore').textContent = `${scores.confidence}/10`;
    document.getElementById('confidenceFill').style.width = `${(scores.confidence / 10) * 100}%`;

    document.getElementById('problemSolvingScore').textContent = `${scores.problemSolving}/10`;
    document.getElementById('problemSolvingFill').style.width = `${(scores.problemSolving / 10) * 100}%`;

    document.getElementById('eyeContactScore').textContent = `${scores.eyeContact}/10`;
    document.getElementById('eyeContactFill').style.width = `${(scores.eyeContact / 10) * 100}%`;

    document.getElementById('bodyLanguageScore').textContent = `${scores.bodyLanguage}/10`;
    document.getElementById('bodyLanguageFill').style.width = `${(scores.bodyLanguage / 10) * 100}%`;

    document.getElementById('speakingPaceScore').textContent = `${scores.speakingPace}/10`;
    document.getElementById('speakingPaceFill').style.width = `${(scores.speakingPace / 10) * 100}%`;

    document.getElementById('grammarScore').textContent = `${scores.grammar}/10`;
    document.getElementById('grammarFill').style.width = `${(scores.grammar / 10) * 100}%`;

    document.getElementById('professionalismScore').textContent = `${scores.professionalism}/10`;
    document.getElementById('professionalismFill').style.width = `${(scores.professionalism / 10) * 100}%`;

    document.getElementById('impressionScore').textContent = `${scores.overallImpression}/10`;
    document.getElementById('impressionFill').style.width = `${(scores.overallImpression / 10) * 100}%`;

    // Calculate and display overall percentage
    const overallPercent = Math.round((scores.overallImpression / 10) * 100);
    overallPercentage.textContent = `${overallPercent}%`;

    // Display analysis
    analysisText.textContent = generateAnalysisText(scores);

    // Show review panel
    reviewPanel.style.display = 'block';
  }

  function nextQuestion() {
    if (!interviewStarted) return;
    answerCount += 1;
    const nextIndex = (currentQuestionIndex + 1) % questions.length;
    showQuestion(nextIndex);
  }

  function endInterview() {
    interviewStarted = false;
    clearInterval(timerInterval);
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      stream = null;
    }
    if (camera) {
      camera.stop();
    }
    video.srcObject = null;
    cameraHint.style.display = 'grid';
    cameraHint.textContent = 'Interview ended. Start again when you are ready.';
    cameraStatus.textContent = 'Camera is off';
    cameraStatus.style.background = 'rgba(37, 99, 235, 0.15)';
    cameraStatus.style.color = '#bfdbfe';
    questionTitle.textContent = 'Interview complete';
    questionText.textContent = 'Your session has ended. Press start to begin again.';
    questionCounter.textContent = 'Question 0 / 0';
    timerValue.textContent = '00:00';
    resetMonitoring();
    updateVoiceFeedback();

    // Calculate and display comprehensive review
    const reviewScores = calculateReviewScores();
    displayReview(reviewScores);

    const sessionSummary = {
      role: 'Technical Interview',
      score: Math.min(100, Math.round((positionScoreValue + eyeContactScore + handVisibilityScore + 50) / 4)),
      feedback: feedbackText.textContent,
      questions_answered: answerCount,
      status: 'completed'
    };

    fetch('https://inter-vu-backend.onrender.com/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sessionSummary)
    }).catch(() => console.warn('Could not save interview history to backend.'));

    answerCount = 0;
    window.speechSynthesis.cancel();
  }

  restartBtn.addEventListener('click', () => {
    reviewPanel.style.display = 'none';
    document.getElementById('interview').scrollIntoView({ behavior: 'smooth' });
    startInterview();
  });

  genderSelect.addEventListener('change', (event) => {
    selectedGender = event.target.value;
    if (interviewStarted) {
      speak('Voice assistant updated.');
    }
  });

  startBtn.addEventListener('click', startInterview);
  
  // Test camera button
  const testCameraBtn = document.getElementById('testCameraBtn');
  if (testCameraBtn) {
    testCameraBtn.addEventListener('click', async () => {
      console.log('🧪 Testing camera...');
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        console.log('✅ Camera test successful!');
        alert('✅ Camera works! Click Start Camera & Interview to begin.');
        stream.getTracks().forEach(track => track.stop());
      } catch (error) {
        console.error('❌ Camera test failed:', error);
        alert('❌ Camera error: ' + error.message);
      }
    });
  }
  
  nextBtn.addEventListener('click', nextQuestion);
  endBtn.addEventListener('click', endInterview);

  setInterval(() => {
  if (interviewStarted && !waitingForReadyResponse) {
    nextQuestion();
  }
}, 22000);

// Resume Upload
const uploadBtn = document.getElementById("uploadResumeBtn");

if (uploadBtn) {
  uploadBtn.addEventListener("click", uploadResume);
}

async function uploadResume() {
  const fileInput = document.getElementById("resumeFile");
  const status = document.getElementById("resumeStatus");

  if (!fileInput.files.length) {
    status.textContent = "Please choose a resume.";
    return;
  }

  const formData = new FormData();
  formData.append("resume", fileInput.files[0]);

  try {
    const response = await fetch("http://127.0.0.1:5000/upload_resume", {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    status.textContent = "✅ Resume uploaded: " + data.filename;
    console.log(data);

  } catch (err) {
    console.error(err);
    status.textContent = "❌ Upload failed";
  }
}

});
