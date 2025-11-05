const apiURL = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";
const apiKey = "91d9ae9d5542c347f4388153d4be91e6";

const inputData = document.querySelector(".input");
const srchbtn = document.querySelector(".btn");
async function checkWeather(city) {
    const response = await fetch(apiURL + city + `&appid=${apiKey}`);
    if (response.status == 404) {
        document.querySelector(".error").style.display = "block";
        document.querySelector(".weather").style.display = "none";
        // Clear weather info fields
        document.querySelector(".city").innerHTML = "";
        document.querySelector(".temp").innerHTML = "";
        document.querySelector(".humidity").innerHTML = "";
        document.querySelector(".wind").innerHTML = "";
        document.querySelector(".weather-img img").src = "";
    } else {
        document.querySelector(".error").style.display = "none";
        var data = await response.json();
        document.querySelector(".city").innerHTML = data.name;
        document.querySelector(".temp").innerHTML = data.main.temp + "°C";
        document.querySelector(".humidity").innerHTML = data.main.humidity + "%";
        document.querySelector(".wind").innerHTML = data.wind.speed + " km/h";
        let iconSrc = "";
        if (data.weather[0].main == "Clouds") {
            iconSrc = "images/clouds.png";
        } else if (data.weather[0].main == "Clear") {
            iconSrc = "images/clear.png";
        } else if (data.weather[0].main == "Rain") {
            iconSrc = "images/rain.png";
        } else if (data.weather[0].main == "Drizzle") {
            iconSrc = "images/drizzle.png";
        } else if (data.weather[0].main == "Mist") {
            iconSrc = "images/mist.png";
        }
        document.querySelector(".weather-img img").src = iconSrc;
        document.querySelector(".weather").style.display = "block";
    }
    }
srchbtn.addEventListener("click", () => {
    checkWeather(inputData.value);
});
