document.addEventListener('DOMContentLoaded', (event) => {
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
