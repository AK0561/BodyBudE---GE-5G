document.addEventListener('DOMContentLoaded', (event) => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/html/login.html'; 
    }
    const themeToggle = document.getElementById('theme-toggle');
    const themeToggleLabel = document.querySelector('.theme-toggle-label svg');

    // Check and apply the system theme preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.body.classList.add('dark-mode');
        themeToggle.checked = true;
        themeToggleLabel.style.fill = '#fff';
    }

    // Toggle theme on button click
    themeToggle.addEventListener('change', () => {
        document.body.classList.toggle('dark-mode');
        // Update the icon color based on the theme
        if (document.body.classList.contains('dark-mode')) {
            themeToggleLabel.style.fill = '#fff';
            localStorage.setItem('theme', 'dark');
        } else {
            themeToggleLabel.style.fill = 'currentColor';
            localStorage.setItem('theme', 'light');
        }
    });

    // Load the saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.body.classList.add(savedTheme + '-mode');
        if (savedTheme === 'dark') {
            themeToggle.checked = true;
            themeToggleLabel.style.fill = '#fff';
        }
    }
        const backButton = document.getElementById('logout-btn');
        backButton.addEventListener('click', () => {
            console.log('Logout button clicked');
            localStorage.removeItem('token');
            window.location.href = '/html/login.html';       
    });    
});

var latestData = {
    heartRate: '',
    bloodOxygen: '',
    bodyTemperature: '',
    heartRateChartData: {
        labels: [],
        data: []
    },
    bloodOxygenChartData: {
        labels: [],
        data: []
    },
    bodyTemperatureChartData: {
        labels: [],
        data: []
    }
};

$(document).ready(function(){
    // Retrieve data from local storage
    retrieveDataFromStorage();

    // Function to fetch data from ThingSpeak
    fetchThingSpeakData();

    // Set interval for auto-refresh (every 10 seconds)
    setInterval(fetchThingSpeakData, 10000);
});

var prevHeartRate = '';
var prevBloodOxygen = '';
var prevBodyTemperature = '';

function fetchThingSpeakData() {
    // ThingSpeak Channel ID and Read API Key
    var channelID = '2035633';
    var apiKey = 'THSEGM9R4XVAY231';

    // ThingSpeak API URL
    var url = 'https://api.thingspeak.com/channels/' + channelID + '/feeds.json?api_key=' + apiKey + '&results=1';

    // Fetch data from ThingSpeak
    $.getJSON(url, function(data){
        console.log("Data fetched from ThingSpeak:", data); // Debug: Log fetched data

        // Check if there's data available
        if(data && data.feeds && data.feeds.length > 0) {
            var latestFeed = data.feeds[0];

            console.log("Latest Feed:", latestFeed); // Log the latest feed for debugging

            // Generate timestamp only when a field is updated
            var timestamp = new Date().toLocaleString();

            var dataChanged = false;

            // Update chart data if the value of the field is updated
            if (latestFeed.field1 && latestFeed.field1 !== prevHeartRate) {
                latestData.heartRate = latestFeed.field1 + ' bpm';
                latestData.heartRateChartData.labels.push(timestamp);
                latestData.heartRateChartData.data.push(latestFeed.field1);
                prevHeartRate = latestFeed.field1;
                dataChanged = true;
            }

            if (latestFeed.field2 && latestFeed.field2 !== prevBloodOxygen) {
                latestData.bloodOxygen = latestFeed.field2 + '%';
                latestData.bloodOxygenChartData.labels.push(timestamp);
                latestData.bloodOxygenChartData.data.push(latestFeed.field2);
                prevBloodOxygen = latestFeed.field2;
                dataChanged = true;
            }

            if (latestFeed.field3 && latestFeed.field3 !== prevBodyTemperature) {
                latestData.bodyTemperature = latestFeed.field3 + '°C';
                latestData.bodyTemperatureChartData.labels.push(timestamp);
                latestData.bodyTemperatureChartData.data.push(latestFeed.field3);
                prevBodyTemperature = latestFeed.field3;
                dataChanged = true;
            }

            // Store data in local storage
            storeDataInStorage();

            // Update UI with latest data only if data has changed
            if (dataChanged) {
                updateUI();
            }
        } else {
            console.warn('No data available from ThingSpeak');
        }
    }).fail(function(jqxhr, textStatus, error) {
        var err = textStatus + ", " + error;
        console.error("Request Failed: " + err); // Debug: Log any request failures
    });
}

function updateUI() {
    console.log("Updating UI with data:", latestData); // Debug: Log data used to update UI

    // Update UI with latest data from latestData object
    if (latestData.heartRate !== '') {
        $('#heart-rate-value').html(latestData.heartRate); // Update Heart Rate
    }
    if (latestData.bloodOxygen !== '') {
        $('#blood-oxygen-value').html(latestData.bloodOxygen); // Update Blood Oxygen
    }
    if (latestData.bodyTemperature !== '') {
        $('#body-temperature-value').html(latestData.bodyTemperature); // Update Body Temperature
    }

    // Update charts for each field
    updateChart('heartRateChart', latestData.heartRateChartData);
    updateChart('bloodOxygenChart', latestData.bloodOxygenChartData);
    updateChart('bodyTemperatureChart', latestData.bodyTemperatureChartData);
}

function updateChart(chartId, newData) {
    var ctx = document.getElementById(chartId).getContext('2d');

    // Destroy existing chart if it exists
    var existingChart = Chart.getChart(ctx);
    if (existingChart) {
        existingChart.destroy();
    }

    // Create new chart
    var myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: newData.labels,
            datasets: [{
                label: chartId, // Use chartId as label for clarity
                data: newData.data,
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
                fill: false
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function storeDataInStorage() {
    // Store latestData in local storage
    localStorage.setItem('latestData', JSON.stringify(latestData));
}

function retrieveDataFromStorage() {
    // Retrieve latestData from local storage
    var storedData = localStorage.getItem('latestData');
    if (storedData) {
        latestData = JSON.parse(storedData);
    }
}

function updateStatus(value) {
    const statusBox = document.getElementById("statusBox");
    console.log("Current value: ", value); // Check if function is firing

    if (value < 60) {
        statusBox.className = "status-box low";
        statusBox.innerText = "Low";
        console.log("Set to LOW");
    } else if (value > 100) {
        statusBox.className = "status-box high";
        statusBox.innerText = "High";
        console.log("Set to HIGH");
    } else {
        statusBox.className = "status-box normal";
        statusBox.innerText = "Normal";
        console.log("Set to NORMAL");
    }
}
document.addEventListener('DOMContentLoaded', () => {
    const chatButton = document.getElementById('chat-button');
    const chatContainer = document.getElementById('chat-container');
    const minimizeBtn = document.getElementById('minimize-chat');
    const closeBtn = document.getElementById('close-chat');
    const messageForm = document.getElementById('message-form');
    const messageInput = document.getElementById('message-input');
    const fileInput = document.getElementById('file-input');
    const fileNameDisplay = document.getElementById('file-name');
    const chatMessages = document.getElementById('chat-messages');
    const doctorsList = document.getElementById('doctors-list');

    // Current active doctor chat (default to first online doctor)
    let activeDoctor = 'doc1';

    // Show chat window when clicking the chat button
    chatButton.addEventListener('click', () => {
        chatContainer.style.display = 'flex'; // Show chat window
        chatButton.style.display = 'none'; // Hide floating button while chat is open
    });

    // Minimize chat window
    minimizeBtn.addEventListener('click', () => {
        chatContainer.style.display = 'none'; // Hide chat window
        chatButton.style.display = 'block'; // Show floating button when minimized
    });

    // Close chat window
    closeBtn.addEventListener('click', () => {
        chatContainer.style.display = 'none'; // Hide chat window
        chatButton.style.display = 'block'; // Show floating button when closed
    });

    // File input change handler
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            fileNameDisplay.textContent = e.target.files[0].name;
        } else {
            fileNameDisplay.textContent = '';
        }
    });

    // Doctor selection handler
    doctorsList.addEventListener('click', (e) => {
        const doctorItem = e.target.closest('.doctor');
        if (doctorItem && doctorItem.classList.contains('online')) {
            // Remove active class from all doctors
            document.querySelectorAll('.doctor').forEach(doctor => {
                doctor.classList.remove('active');
            });

            // Add active class to selected doctor
            doctorItem.classList.add('active');

            // Set active doctor
            activeDoctor = doctorItem.dataset.id;

            // Clear previous messages for new doctor
            chatMessages.innerHTML = '';

            // Get doctor's name and specialization
            const doctorName = doctorItem.querySelector('strong').textContent.trim();
            const specialty = doctorItem.querySelector('div').textContent.split('\n')[1].trim();

            // Add welcome message with specialization
            addMessage({
                sender: `${doctorName} (${specialty})`,
                content: `Hello, I'm ${doctorName}. How can I help you today?`,
                time: new Date(),
                type: 'received'
            });
        }
    });

    // Handle message form submission
    messageForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const message = messageInput.value.trim();
        const file = fileInput.files[0];

        if (!message && !file) return;

        // Add sent message to the chat
        if (message) {
            addMessage({
                sender: 'You',
                content: message,
                time: new Date(),
                type: 'sent'
            });
        }

        // Handle file attachment display
        if (file) {
            addMessage({
                sender: 'You',
                content: `Attached file: ${file.name}`,
                time: new Date(),
                type: 'sent',
                file: { name: file.name }
            });
        }

        // Clear input fields after sending a message
        messageInput.value = '';
        fileInput.value = '';
        fileNameDisplay.textContent = '';

        // Simulate a response after a delay (replace this with real backend communication)
        setTimeout(() => simulateResponse(message), 1000);
    });

// Function to add a message to the chat
function addMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${message.type}`;

    let displayName = message.sender;

    // If it's a received message, include specialization instead of repeating the name
    if (message.type === 'received') {
        const doctorItem = document.querySelector(`.doctor[data-id="${activeDoctor}"]`);
        if (doctorItem) {
            const doctorName = doctorItem.querySelector('strong').textContent.trim();
            const specialty = doctorItem.querySelector('div').textContent.split('\n')[1].trim();
            displayName = `${doctorName}`; // Use specialization instead of redundant name
        }
    }

    let contentHTML = `
        <div class="message-sender">${displayName}</div>
        <div class="message-content">${message.content}</div>
        <div class="message-time">${formatTime(message.time)}</div>
    `;

    if (message.file) {
        contentHTML += `
            <div class="attachment">
                <a href="#" onclick="return false;">${message.file.name}</a>
            </div>
        `;
    }

    messageElement.innerHTML = contentHTML;
    chatMessages.appendChild(messageElement);

    // Scroll to the bottom of the messages container
    chatMessages.scrollTop = chatMessages.scrollHeight;
}


    // Simulate a response from the selected doctor
    function simulateResponse(message) {
        let responseContent;
        message = message.trim(); // Remove extra spaces or newlines

        console.log("Received Message:", message); // Debugging log
        if (/hello|hi/i.test(message)) {
            responseContent = "Hello! How can I assist you today?";
        } else if (/\bpatient\b|patient[^a-zA-Z]/i.test(message)) {  
            responseContent = "Can you provide more details about this patient?";
        } else if (/appointment/i.test(message)) {
            responseContent = "Let's coordinate for scheduling.";
        } else {
            responseContent = "I received your message. Let me know how I can help.";
        }
    
        
        

        const activeDoctorElement = document.querySelector(`.doctor[data-id="${activeDoctor}"]`);
        
        if (activeDoctorElement) {
            const doctorName = activeDoctorElement.querySelector("strong").textContent.trim();
            const specialty = activeDoctorElement.querySelector("div").textContent.split("\n")[1].trim();

            addMessage({
                sender: `${doctorName} (${specialty})`,
                content: responseContent,
                time: new Date(),
                type: "received"
            });
        }
    }

    // Format time for display in messages
    function formatTime(date) {
        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }
});
document.addEventListener('DOMContentLoaded', () => {
    const chatButton = document.getElementById('chat-button'); // The floating chat button
    const chatContainer = document.getElementById('chat-container'); // The chat window container
    const closeChatButton = document.getElementById('close-chat'); // Close button inside the chat window

    // Ensure the chat window is hidden on page load
    chatContainer.style.display = 'none';

    // Add event listener to open the chat window when the button is clicked
    chatButton.addEventListener('click', () => {
        chatContainer.style.display = 'block'; // Show the chat window
        chatButton.style.display = 'none'; // Hide the floating button while the chat is open
    });

    // Add event listener to close the chat window
    closeChatButton.addEventListener('click', () => {
        chatContainer.style.display = 'none'; // Hide the chat window
        chatButton.style.display = 'block'; // Show the floating button again
    });
    
});
document.addEventListener('DOMContentLoaded', () => {
    // Select all FAQ questions
    const faqQuestions = document.querySelectorAll('.faq-question');

    faqQuestions.forEach(button => {
        button.addEventListener('click', () => {
            const faqItem = button.parentElement;

            // Toggle open state
            faqItem.classList.toggle('open');

            // Show or hide answer
            const answer = faqItem.querySelector('.faq-answer');
            if (faqItem.classList.contains('open')) {
                answer.style.display = 'block'; // Show answer
                button.querySelector('.faq-icon').textContent = '-'; // Change icon to '-'
            } else {
                answer.style.display = 'none'; // Hide answer
                button.querySelector('.faq-icon').textContent = '+'; // Change icon to '+'
            }
        });
    });
});
document.addEventListener('DOMContentLoaded', () => {
    // Get all nav links
    const navLinks = document.querySelectorAll('.nav-link');

    // Get current page URL
    const currentPage = window.location.pathname;

    // Loop through links and add 'active' class to the matching one
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });
});
