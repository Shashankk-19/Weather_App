const apiKey = "5b11248d79895d4a3db3f053abe47713";

function updateDateTime() {
  const now = new Date();
  const dateTime = now.toLocaleString();
  document.getElementById("dateTime").innerText = `📅 ${dateTime}`;
}
setInterval(updateDateTime, 1000);

async function getWeather() {
  const city = document.getElementById("cityInput").value.trim();
  if (!city) {
    alert("Please enter a city name");
    return;
  }
  fetchWeatherData(city);
}

function getWeatherByLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async position => {
      const { latitude, longitude } = position.coords;
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}`
      );
      const data = await response.json();
      fetchWeatherData(data.name);
    }, () => {
      alert("Location access denied.");
    });
  } else {
    alert("Geolocation not supported.");
  }
}

async function fetchWeatherData(city) {
  const currentWeather = document.getElementById("currentWeather");
  const forecastContainer = document.getElementById("forecast");
  currentWeather.innerHTML = "Loading...";
  forecastContainer.innerHTML = "";

  try {
    // Current weather
    const weatherRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
    );
    const weatherData = await weatherRes.json();
    const { name, main, weather, wind } = weatherData;

    const icon = `https://openweathermap.org/img/wn/${weather[0].icon}@2x.png`;

    currentWeather.innerHTML = `
      <h2>📍 ${name}</h2>
      <img src="${icon}" alt="${weather[0].description}" />
      <p>${weather[0].main} - ${weather[0].description}</p>
      <p>🌡️ ${main.temp}°C | 💧 ${main.humidity}% | 💨 ${wind.speed} m/s</p>
    `;

    // Forecast
    const forecastRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`
    );
    const forecastData = await forecastRes.json();

    const dailyForecasts = forecastData.list.filter(item => item.dt_txt.includes("12:00:00"));

    dailyForecasts.forEach(day => {
      const date = new Date(day.dt_txt).toLocaleDateString("en-IN", {
        weekday: "short",
        month: "short",
        day: "numeric"
      });

      const iconUrl = `https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`;

      const dayEl = document.createElement("div");
      dayEl.classList.add("forecast-day");
      dayEl.innerHTML = `
        <p><strong>${date}</strong></p>
        <img src="${iconUrl}" alt="${day.weather[0].description}" />
        <p>${day.main.temp.toFixed(1)}°C</p>
      `;
      forecastContainer.appendChild(dayEl);
    });

  } catch (error) {
    currentWeather.innerHTML = `<p>Error: ${error.message}</p>`;
  }
}
