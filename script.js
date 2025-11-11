const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");
const unitToggle = document.getElementById("unitToggle");
const cityName = document.getElementById("cityName");
const weatherInfo = document.getElementById("weatherInfo");
const temperature = document.getElementById("temperature");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");
const feelsLike = document.getElementById("feelsLike");
const visibility = document.getElementById("visibility");
const pressure = document.getElementById("pressure");
const cloudiness = document.getElementById("cloudiness");
const errorMessage = document.getElementById("errorMessage");

// Ensure weather info and error message are hidden on load
weatherInfo.classList.add("hidden");
errorMessage.classList.add("hidden");

let isCelsius = true;

async function getCityCoordinates(city) {
    try {
        const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
        console.log("Geocoding URL:", url);
        const response = await fetch(url);
        const data = await response.json();
        
        console.log("Geocoding response:", data);
        
        if (!data.results || data.results.length === 0) {
            console.log("No results found for city:", city);
            showError();
            return null;
        }
        
        console.log("City found:", data.results[0]);
        return data.results[0];
    } catch (error) {
        console.error('Geocoding error:', error);
        showError();
        return null;
    }
}

async function checkWeather(city) {
    if (!city.trim()) {
        console.log("Empty city input");
        return;
    }

    console.log("Searching for city:", city);
    try {
        // First, get coordinates for the city
        const cityData = await getCityCoordinates(city);
        if (!cityData) {
            console.log("No city data returned");
            return;
        }

        const { latitude, longitude, name, country } = cityData;
        console.log(`Got coordinates: ${latitude}, ${longitude}`);
        
        // Fetch weather data using coordinates
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,visibility,pressure_msl,cloud_cover&temperature_unit=celsius&wind_speed_unit=kmh`;
        
        console.log("Weather URL:", weatherUrl);
        const response = await fetch(weatherUrl);
        
        console.log("Response status:", response.status, response.statusText);
        
        if (!response.ok) {
            console.error("Weather API error:", response.status, response.statusText);
            showError();
            return;
        }
        
        const data = await response.json();
        console.log("Weather response:", data);

        displayWeather(data, name, country);
    } catch (error) {
        console.error('Weather API error:', error);
        showError();
    }
}

function displayWeather(data, cityNameText, country) {
    console.log("Displaying weather for:", cityNameText, country);
    console.log("Weather data:", data);
    
    // Get the first hourly entry (current/latest)
    const temp = data.hourly.temperature_2m[0];
    const humidity_val = data.hourly.relative_humidity_2m[0];
    const windSpeed_val = data.hourly.wind_speed_10m[0];
    const visibility_val = data.hourly.visibility[0];
    const pressure_val = data.hourly.pressure_msl[0];
    const cloudiness_val = data.hourly.cloud_cover[0];
    const weather_code = data.hourly.weather_code[0];
    
    cityName.textContent = `${cityNameText}, ${country || ''}`;
    
    const tempDisplay = isCelsius ? temp : (temp * 9/5) + 32;
    const unit = isCelsius ? "°C" : "°F";

    temperature.textContent = Math.round(tempDisplay) + unit;
    
    // Get weather description from WMO code
    const weatherDescription = getWeatherDescription(weather_code);
    document.getElementById("weatherDescription").textContent = weatherDescription;
    
    humidity.textContent = humidity_val + "%";
    windSpeed.textContent = Math.round(windSpeed_val) + " km/h";
    feelsLike.textContent = Math.round(tempDisplay) + unit; // Use actual temp as feels_like isn't available
    visibility.textContent = (visibility_val / 1000).toFixed(1) + " km";
    pressure.textContent = Math.round(pressure_val) + " hPa";
    cloudiness.textContent = cloudiness_val + "%";

    console.log("About to show weather info");
    weatherInfo.classList.remove("hidden");
    errorMessage.classList.add("hidden");
    console.log("Weather info shown");
}

function getWeatherDescription(code) {
    // WMO Weather interpretation codes
    const weatherCodes = {
        0: "Clear sky",
        1: "Mainly clear",
        2: "Partly cloudy",
        3: "Overcast",
        45: "Foggy",
        48: "Foggy",
        51: "Light drizzle",
        53: "Moderate drizzle",
        55: "Dense drizzle",
        61: "Slight rain",
        63: "Moderate rain",
        65: "Heavy rain",
        71: "Slight snow",
        73: "Moderate snow",
        75: "Heavy snow",
        80: "Slight rain showers",
        81: "Moderate rain showers",
        82: "Violent rain showers",
        85: "Slight snow showers",
        86: "Heavy snow showers",
        95: "Thunderstorm",
        96: "Thunderstorm with slight hail",
        99: "Thunderstorm with heavy hail"
    };
    return weatherCodes[code] || "Unknown";
}

function showError() {
    weatherInfo.classList.add("hidden");
    errorMessage.classList.remove("hidden");
}

async function getCurrentLocationWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            try {
                const { latitude, longitude } = position.coords;
                const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,visibility,pressure_msl,cloud_cover&temperature_unit=celsius&wind_speed_unit=kmh`;
                
                const response = await fetch(weatherUrl);
                
                if (!response.ok) {
                    console.error("Weather API error:", response.status);
                    showError();
                    return;
                }
                
                const data = await response.json();

                // Get city name from reverse geocoding
                const reverseGeoUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
                const geoResponse = await fetch(reverseGeoUrl);
                const geoData = await geoResponse.json();
                const cityNameText = geoData.address?.city || geoData.address?.town || "Unknown Location";
                const countryName = geoData.address?.country || "";
                
                displayWeather(data, cityNameText, countryName);
            } catch (error) {
                console.error('Location weather API error:', error);
                showError();
            }
        }, () => {
            showError();
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

function toggleUnits() {
    isCelsius = !isCelsius;
    unitToggle.innerHTML = `<i class="fas fa-thermometer-half mr-2"></i>${isCelsius ? '°C' : '°F'}`;
    
    // If weather is currently displayed, update it
    if (!weatherInfo.classList.contains("hidden")) {
        const currentCity = cityName.textContent;
        if (currentCity) {
            checkWeather(currentCity);
        }
    }
}

locationBtn.addEventListener("click", getCurrentLocationWeather);
unitToggle.addEventListener("click", toggleUnits);

searchBtn.addEventListener("click", () => {
    checkWeather(cityInput.value);
});

cityInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        checkWeather(cityInput.value);
    }
});
