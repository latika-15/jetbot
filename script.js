
let prompt = document.querySelector("#prompt");
let submitbtn = document.querySelector("#submit");
let chatContainer = document.querySelector(".chat-container");
let imagebtn = document.querySelector("#image");
let image = document.querySelector("#image img");
let imageinput = document.querySelector("#image input");


const Api_Url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyCSAdxXztU8hilQeXH6OWrzngcJ7mJlN1w";

let user = {
    message: null,
    file: {
        mime_type: null,
        data: null
    }
};


async function generateResponse(aiChatBox) {
    let text = aiChatBox.querySelector(".ai-chat-area");
    let RequestOption = {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            "contents": [
                {
                    "parts": [
                        { text: user.message },
                        ...(user.file.data ? [{ inline_data: user.file }] : [])
                    ]
                }
            ]
        })
    };

    try {
        let response = await fetch(Api_Url, RequestOption);
        let data = await response.json();
        let apiResponse = data.candidates[0].content.parts[0].text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")   
    .replace(/\n{2,}/g, "<br><br>")                         
    .replace(/\n[-*]\s(.*?)(?=\n|$)/g, "<li>$1</li>")       
    .replace(/\n\d+\.\s(.*?)(?=\n|$)/g, "<li>$1</li>")      
    .replace(/\n/g, "<br>")                                 
    .trim();

if (apiResponse.includes("<li>")) {
    apiResponse = `<ul style="padding-left: 1rem;">${apiResponse}</ul>`;
}

text.innerHTML = apiResponse;

    } catch (error) {
        text.innerHTML = "❌ Failed to get response. Try again!";
        console.log(error);
    } finally {
        chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });
        image.src = `img.svg`;
        image.classList.remove("choose");
        user.file = {};
    }
}
function createChatBox(html, classes) {
    let div = document.createElement("div");
    div.innerHTML = html;
    div.classList.add(classes);
    return div;
}


function handlechatResponse(userMessage) {
    user.message = userMessage;

    let html = `<img src="user-profile.png" alt="" id="userImage" width="8%">
    <div class="user-chat-area">
        ${user.message}
        ${user.file.data ? `<img src="data:${user.file.mime_type};base64,${user.file.data}" class="chooseimg" />` : ""}
    </div>`;

    prompt.value = "";
    let userChatBox = createChatBox(html, "user-chat-box");
    chatContainer.appendChild(userChatBox);
    chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });

 
    setTimeout(() => {
        let html = `<img src="robot-chatbot-icon-sign-free-vector.jpg" alt="" id="aiImage" width="8%" style="border-radius: 100%;">
        <div class="ai-chat-area">
            <img src="loading.webp" alt="" class="load" width="50px">
        </div>`;
        let aiChatBox = createChatBox(html, "ai-chat-box");
        chatContainer.appendChild(aiChatBox);
        generateResponse(aiChatBox);
    }, 600);
  user.file = {
  mime_type: null,
  data: null
};

}


submitbtn.addEventListener("click", () => {
    if (prompt.value.trim() !== "") {
        handlechatResponse(prompt.value.trim());
    }
});

prompt.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault(); 
        if (prompt.value.trim() !== "") {
            handlechatResponse(prompt.value.trim());
        }
    }
});


document.addEventListener("click", (e) => {
  if (e.target.classList.contains("chooseimg")) {
    const imgPopup = document.createElement("div");
    imgPopup.style.position = "fixed";
    imgPopup.style.top = "0";
    imgPopup.style.left = "0";
    imgPopup.style.width = "100%";
    imgPopup.style.height = "100%";
    imgPopup.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
    imgPopup.style.display = "flex";
    imgPopup.style.alignItems = "center";
    imgPopup.style.justifyContent = "center";
    imgPopup.style.zIndex = "1000";
    imgPopup.innerHTML = `<img src="${e.target.src}" style="max-width: 90%; max-height: 90%; border-radius: 10px;">`;
    document.body.appendChild(imgPopup);
    imgPopup.addEventListener("click", () => document.body.removeChild(imgPopup));
  }
});



const imageInput = document.getElementById('imageInput');
const imageButton = document.getElementById('imageButton');
const audioButton = document.getElementById('audioButton');

imageButton.addEventListener('click', () => {
    imageInput.click();
});


imageInput.addEventListener('change', () => {
    const file = imageInput.files[0];
    if (!file) return;

    const allowedTypes = ["image/png", "image/jpeg", "audio/mpeg", "audio/wav"];

    if (!allowedTypes.includes(file.type)) {
        alert("Only JPG, PNG, MP3, WAV files are supported!");
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const base64 = e.target.result.split(',')[1];
        user.file = {
            mime_type: file.type,
            data: base64
        };

        if (file.type.startsWith('image/')) {
            image.src = `data:${file.type};base64,${base64}`;
            image.classList.add("choose");
        } else if (file.type.startsWith('audio/')) {
            image.src = `audio-icon.png`; // placeholder icon
            image.classList.add("choose");
        }
    };
    reader.readAsDataURL(file);
});


audioButton.addEventListener('click', () => {
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        alert("Speech Recognition is not supported in this browser. Please use Chrome or Edge.");
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.start();

    recognition.onstart = () => {
        console.log("Voice recognition started. Speak now.");
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        document.getElementById("prompt").value = transcript;
    };

    recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
    };

    recognition.onend = () => {
        console.log("Voice recognition ended.");
    };
});

