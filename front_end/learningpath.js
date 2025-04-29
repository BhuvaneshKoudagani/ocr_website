// Global variables
const chatContainer = document.getElementById('chatContainer');
const userInput = document.getElementById('userInput');
const fileNameDisplay = document.getElementById('fileName');
const loadingIndicator = document.getElementById('loadingIndicator');
let pdfUploaded = false;

// Function to add message to chat
function addMessage(message, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${isUser ? 'user-message' : 'bot-message'}`;
    messageDiv.textContent = message;
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    return messageDiv;
}

// Function to show loading dots
function showLoadingDots() {
    const loadingMessage = document.createElement('div');
    loadingMessage.className = 'chat-message bot-message';
    loadingMessage.textContent = 'Processing';
    chatContainer.appendChild(loadingMessage);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    
    let dots = 0;
    const interval = setInterval(() => {
        dots = (dots + 1) % 4;
        loadingMessage.textContent = 'Processing' + '.'.repeat(dots);
    }, 500);
    
    return { loadingMessage, interval };
}

// Function to hide loading dots
function hideLoadingDots(loadingObj) {
    clearInterval(loadingObj.interval);
    loadingObj.loadingMessage.remove();
}

// Function to handle file upload
async function handleFileUpload(file) {
    if (!file) return;
    
    fileNameDisplay.textContent = file.name;
    setLoading(true);
    addMessage('Processing your PDF document...');

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('http://localhost:3000/upload', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Upload failed');
        }

        const data = await response.json();
        pdfUploaded = true;
        addMessage('PDF processed successfully! You can now ask questions about its content.');
    } catch (error) {
        addMessage('Error processing PDF: ' + error.message);
        fileNameDisplay.textContent = '';
    } finally {
        setLoading(false);
    }
}

// Function to send message to backend
async function sendMessage() {
    const message = userInput.value.trim();
    if (message === '') return;
    
    addMessage(message, true);
    userInput.value = '';
    userInput.focus();

    if (!pdfUploaded) {
        addMessage('Please upload a PDF document first before asking questions.');
        return;
    }

    setLoading(true);
    const loadingObj = showLoadingDots();

    try {
        const response = await fetch('http://localhost:3000/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ question: message })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to get response');
        }

        const data = await response.json();
        hideLoadingDots(loadingObj);
        addMessage(data.response);
    } catch (error) {
        hideLoadingDots(loadingObj);
        addMessage('Error: ' + error.message);
    } finally {
        setLoading(false);
    }
}

// Function to show/hide loading state
function setLoading(isLoading) {
    loadingIndicator.style.display = isLoading ? 'inline-block' : 'none';
    userInput.disabled = isLoading;
    document.querySelector('.chat-input button').disabled = isLoading;
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('pdfUpload').addEventListener('change', (e) => {
        if (e.target.files[0]) {
            handleFileUpload(e.target.files[0]);
        }
    });

    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
});