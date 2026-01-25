
// selecting the html elements 
const searchInput = document.querySelector('.search-input')
const searchButton = document.querySelector('.search-button')
const mainImageContainer = document.querySelector('.img-section')
const cityCountryDateInfoContainer = document.querySelector('.cityCountryDateInfoContainer')
const countryCityDateDiv = document.querySelector('.countryCityDateDiv')
const temperatureDiv = document.querySelector('.temperatureDiv')
const unitsDropdown = document.getElementById('unitsDropdown')
const currentConditions = document.querySelector('.current-conditions')
const feelLikeTemperature = document.getElementById('feel-like-temp')
const humidityTemperature = document.getElementById('humidity-temp')
const windTemperature = document.getElementById('wind-temp')
const precipitationTemperature = document.getElementById('precipitation-temp')
const dailyForecastGridItems = document.querySelectorAll('.daily-forecast-grid-item')
const dailyForecastGridContainer = document.querySelector('.daily-forecast-grid-container')
const hourlyForecastContainer = document.querySelector('.hourly-forecast-container')
const hourlyForecastItems = document.querySelectorAll('.forecast')
const daysDropdown = document.getElementById('days')
const sectionOne = document.querySelector('.section-one')
const sectionTwo = document.querySelector('.section-two')
const weatherDetails = document.querySelector('.weather-details')
const searchSection = document.querySelector('.search-section')
const loadingImage = document.querySelector('.loading-image')
const loadingHeading = document.querySelector('.loading-heading')
let weatherData = null
let tempUnit = "celsius";   // celsius | fahrenheit
let windUnit = "kph";       // kph | mph
let precipUnit = "mm";      // mm | in
searchButton.addEventListener('click', () => {
    resetUI();
    clearEmptySearchError();
    const searchInputValue = encodeURIComponent(searchInput.value.trim());
    if (!searchInputValue) {
        showEmptySearchError()
        return;
    }
    // displaying searchInProgressMessage
    searchInProgress()
    // fetching the weather data for the specific city entered by user
    fetchingWeatherData(searchInputValue);
})
function showEmptySearchError() {
    clearEmptySearchError()
    const msg = document.createElement("p");
    msg.textContent = "Please enter a city name.";
    msg.setAttribute("data-testid", "empty-search-error");
    searchSection.appendChild(msg);
}
function clearEmptySearchError()
{
    const emptySearchError = document.querySelector('[data-testid="empty-search-error"]');
   if(emptySearchError) emptySearchError.remove();
}  
function hideMainImageContainer() {
    mainImageContainer.style.display = "none"
}
function createNewImageSection() {
    let section = document.querySelector('.new-img-section');

    if (!section) {
        section = document.createElement('div');
        section.classList.add('new-img-section');
        currentConditions.insertAdjacentElement('beforebegin', section);
    }

    return section;
}

function resetUI() {

    // Remove previous no-result message
    const noResult = document.querySelector('.no-results-container');
    if (noResult) noResult.remove();

    // Remove previous server error message
    const serverErr = document.querySelector('.server-error-container');
    if (serverErr) serverErr.remove();

}

function searchInProgress() {
     // Set weatherDetails to loading
     weatherDetails.setAttribute("data-state", "loading");
    hideMainImageContainer()
    const newImageSection = createNewImageSection()
    //  Create the element
    const searchInProgressDiv = document.createElement('div');
    searchInProgressDiv.setAttribute("data-testid", "search-in-progress");
    searchInProgressDiv.classList.add('searchInProgressContainer');
    const searchInProgressIcon = document.createElement('img')
    searchInProgressIcon.classList.add('searchInProgressIcon')
    searchInProgressIcon.src = "assets/images/icon-loading.svg"
    searchInProgressIcon.alt = "loading-icon"
    searchInProgressDiv.appendChild(searchInProgressIcon)
    const searchInProgressMessage = document.createElement('span')
    searchInProgressMessage.textContent = "Search in progress"
    searchInProgressDiv.appendChild(searchInProgressMessage)

    // Append to the DOM
    newImageSection.appendChild(searchInProgressDiv);
}
// fetching the weather data from API
async function fetchingWeatherData(searchInputValue) {
    const API_KEY= " 1091456eff56477aa2f183259262201"
    try {
        const response = await fetch(
            `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${searchInputValue}&days=7&aqi=yes&alerts=yes`
        );
        if (!response.ok) {
            if (response.status === 400 || response.status === 404) {
                removeSearchInProgress()
                showNoResultsFound(); // no result found msg
            } else {
                removeSearchInProgress()
                showServerError(); // other server errors
            }
            return;
        }
        weatherData = await response.json();
        console.log("weatherdata", weatherData);
        // check if api returned an error
        if (weatherData.error) {
            removeSearchInProgress()
            showNoResultsFound();   //  show message
            return; // stop the function
        }
        showingWeatherDetails();
        // Remove searchInProgressContainer if data is fetched
        const existingMsg = document.querySelector('.searchInProgressContainer');
        if (existingMsg) existingMsg.remove();
        displayingImage();
        displayCityCountryDateInfo();
        displayTemperatureBasedOnSelectedUnit();
        displayingcurrentConditions();
        displayingDailyForecast();
        populateDaysDropdown();
        displayingHourlyForecast();
        // Set weatherDetails to loaded
weatherDetails.setAttribute("data-state", "loaded");
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}
function populateDaysDropdown() {
    // clearing the daysDropdown UI
    daysDropdown.innerHTML = "";

    weatherData.forecast.forecastday.forEach((dayObj, index) => {
        const option = document.createElement("option");

        const dayName = new Date(dayObj.date).toLocaleDateString("en-US", {
            weekday: "long"
        });

        option.value = index; // IMPORTANT
        option.textContent = dayName;
        // console.log("index is:::",index)
        // console.log("dayName is:::",dayName)
        daysDropdown.appendChild(option);
    });
}

function showingWeatherDetails() {
    weatherDetails.style.display = 'flex';
}
function removingWeatherDetails() {
    weatherDetails.style.display = 'none';
}
function removeSearchInProgress() {
    const box = document.querySelector('.searchInProgressContainer');
    if (box) box.remove();
}
function showNoResultsFound() {
     // Set weatherDetails state to error
     weatherDetails.setAttribute("data-state", "error");
    removingWeatherDetails()
    const noResultFoundContainer = document.createElement('div')
    noResultFoundContainer.setAttribute("data-testid", "no-results");
    noResultFoundContainer.classList.add("no-results-container");
    const msg = document.createElement('p');
    msg.textContent = "No search results found!";
    msg.classList.add("no-results-msg");
    noResultFoundContainer.appendChild(msg)
    document.body.appendChild(noResultFoundContainer)
}
function showServerError() {
       // Set weatherDetails state to error
       weatherDetails.setAttribute("data-state", "error");
    // removing the searchSection  & weatherDetails section for showing the server error
    searchSection.style.display = "none"
    removingWeatherDetails();
    const serverErrorContainer = document.createElement('div')
    serverErrorContainer.setAttribute("data-testid", "server-error");
    serverErrorContainer.classList.add("server-error-container");
    const serverErrorImg = document.createElement('img')
    serverErrorImg.src = "assets/images/icon-error.svg"
    serverErrorImg.alt = "error-icon"
    serverErrorContainer.appendChild(serverErrorImg)
    const serverErrorHeading = document.createElement('h1')
    serverErrorHeading.textContent = "Something went wrong"
    serverErrorContainer.appendChild(serverErrorHeading)
    const serverErrorParagraph = document.createElement('p')
    serverErrorParagraph.textContent = "We couldn't connect to the server (API error).Please try again in a few moments."
    serverErrorContainer.appendChild(serverErrorParagraph)
    const retryButtonContainer = document.createElement('div')
    retryButtonContainer.classList.add("retry-button-container");
    const retryImg = document.createElement('img')
    retryImg.src = "assets/images/icon-retry.svg"
    retryImg.alt = "retry-img"
    retryImg.classList.add("retry-image");
    retryButtonContainer.appendChild(retryImg)
    const retryButton = document.createElement('button');
    retryButton.setAttribute("data-testid", "retry-btn");
    retryButton.classList.add("retry-btn");
    retryButton.textContent = "Retry"
    retryButtonContainer.appendChild(retryButton)
    serverErrorContainer.appendChild(retryButtonContainer)
    document.body.appendChild(serverErrorContainer)
}
// appending cityCountryDateInfoContainer to new-img-section
function appendingCityCountryDateInfoContainer(newImageSection) {
    //  currentConditions.insertAdjacentElement('beforebegin',cityCountryDateInfoContainer)
    newImageSection.appendChild(cityCountryDateInfoContainer)
}
// displaying the weather image 
function displayingImage() {
    // hidding loading image & loading heading
    loadingImage.style.display = "none"
    loadingHeading.style.display = "none"
    hideMainImageContainer()
    // remove old image section if it exists
    const oldNewImageSection = document.querySelector('.new-img-section');
    if (oldNewImageSection) {
        oldNewImageSection.remove();
    }
    //creating new img-section
    const newImageSection = createNewImageSection()
    const image = document.createElement('img')
    image.classList.add('weather-image')
    image.src = "assets/images/bg-today-large.svg"
    image.alt = "bg-today-large"
    newImageSection.appendChild(image)
    appendingCityCountryDateInfoContainer(newImageSection)
    currentConditions.insertAdjacentElement('beforebegin', newImageSection)
}
// for displaying the cityCountryDate on main-area
function displayCityCountryDateInfo() {
    const countryCityHeading = document.createElement('h1')
    clearingCountryCityDateDiv()
    countryCityHeading.textContent = `${weatherData.location.name},${weatherData.location.country}`
    countryCityDateDiv.appendChild(countryCityHeading)
    convertingDateIntoHumanReadableForm()
}
// converting API date into human readable form
function convertingDateIntoHumanReadableForm() {
    const dateString = weatherData.location.localtime;
    const date = new Date(dateString);
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true // Use 12-hour format with AM/PM
    };
    const humanReadableDate = date.toLocaleDateString('en-US', options);
    console.log(humanReadableDate);
    displayingHumanReadableDate(humanReadableDate)
}
// displaying date
function displayingHumanReadableDate(humanReadableDate) {
    const dateParagraph = document.createElement('p')
    dateParagraph.textContent = humanReadableDate
    countryCityDateDiv.appendChild(dateParagraph)
}

// event listener on select input
unitsDropdown.addEventListener('change', (e) => {
    if (!weatherData) return; // no data yet
    const selectedValue = unitsDropdown.value;

    // Decide WHAT kind of unit was changed
    if (selectedValue === "celsius" || selectedValue === "temp-fahrenheit") {
        tempUnit = selectedValue;
    }

    if (selectedValue === "kph" || selectedValue === "wind-mph") {
        windUnit = selectedValue;
    }

    if (selectedValue === "mm" || selectedValue === "precip-in") {
        precipUnit = selectedValue;
    }
    displayTemperatureBasedOnSelectedUnit(); // update display whenever unit changes
    displayingcurrentConditions()
    displayingDailyForecast()
    displayingHourlyForecast()
});
//display temperature on main-area
function displayTemperatureBasedOnSelectedUnit() {
    clearingtemperatureDivUI()
    const selectedUnit = unitsDropdown.value;
    // Temperature
    let tempText = `${weatherData.current.temp_c}°`; // default Celsius
    if (tempUnit === "temp-fahrenheit") tempText = `${weatherData.current.temp_f} °F`;
    // creating h1 for displaying temperature value
    const temperatureHeading = document.createElement('h1')
    // giving class
    temperatureHeading.classList.add('temp-heading')
    temperatureHeading.textContent = tempText;
    temperatureDiv.appendChild(temperatureHeading)
}

function clearingCountryCityDateDiv() {
    // clearing the countryCityDateDiv
    countryCityDateDiv.textContent = ""
}
function clearingtemperatureDivUI() {
    // clearing the temperatureDiv
    temperatureDiv.textContent = ""
}
function displayingcurrentConditions() {
    // FEELS LIKE
    if (tempUnit === "temp-fahrenheit") {
        feelLikeTemperature.textContent = `${weatherData.current.feelslike_f}°F`;
    } else {
        feelLikeTemperature.textContent = `${weatherData.current.feelslike_c}°C`;
    }

    // WIND
    if (windUnit === "wind-mph") {
        windTemperature.textContent = `${weatherData.current.wind_mph} mph`;
    } else {
        windTemperature.textContent = `${weatherData.current.wind_kph} kph`;
    }

    // PRECIPITATION
    if (precipUnit === "precip-in") {
        precipitationTemperature.textContent = `${weatherData.current.precip_in} in`;
    } else {
        precipitationTemperature.textContent = `${weatherData.current.precip_mm} mm`;
    }

    // HUMIDITY (no unit switch)
    humidityTemperature.textContent = `${weatherData.current.humidity}%`;
}
function displayingDailyForecast() {
    // clearing the dailyForecastGridContainer UI
    dailyForecastGridContainer.textContent = ""
    // removing it only in this function
    dailyForecastGridItems.forEach(item => {
        item.style.display = "none";
    });
    weatherData.forecast.forecastday.forEach((e) => {
        const dailyForecastItem = document.createElement('div')
        dailyForecastItem.classList.add('daily-forecast-item')
        dailyForecastItem.setAttribute("data-testid", "daily-forecast-item");
        const dayParagraph = document.createElement('p')
        const date = e.date;
        // converting the date into day
        const dayName = new Date(date).toLocaleDateString("en-US", {
            weekday: "short"
        });
        dayParagraph.textContent = dayName;
        dailyForecastItem.appendChild(dayParagraph)
        const conditionIcon = document.createElement('img')
        conditionIcon.classList.add("condition-icon")
        conditionIcon.src = e.day.condition.icon
        conditionIcon.alt = "condition-icon"
        dailyForecastItem.appendChild(conditionIcon)
        // creating temp div
        const dailyForecastTemperatureDiv = document.createElement('div')
        // giving a class
        dailyForecastTemperatureDiv.classList.add("dailyForecastTemperatureContainer")
        // creating dailyForecastMaxTemperatureDiv
        const dailyForecastMaxTemperatureDiv = document.createElement('div')
        const maxTempOne = document.createElement('p')
        maxTempOne.textContent = `${e.day.maxtemp_c}°`
        if (tempUnit === "temp-fahrenheit") maxTempOne.textContent = `${e.day.maxtemp_f}°F`
        dailyForecastMaxTemperatureDiv.appendChild(maxTempOne)
        dailyForecastTemperatureDiv.appendChild(dailyForecastMaxTemperatureDiv)
        // creating dailyForecastMinTemperatureDiv
        const dailyForecastMinTemperatureDiv = document.createElement('div')
        const minTempOne = document.createElement('p')
        minTempOne.classList.add('grey')
        minTempOne.textContent = `${e.day.mintemp_c}°`
        if (tempUnit === "temp-fahrenheit") minTempOne.textContent = `${e.day.mintemp_f}°F`
        dailyForecastMinTemperatureDiv.appendChild(minTempOne)
        dailyForecastTemperatureDiv.appendChild(dailyForecastMinTemperatureDiv)
        dailyForecastItem.appendChild(dailyForecastTemperatureDiv)
        dailyForecastGridContainer.appendChild(dailyForecastItem)
    })
}

daysDropdown.addEventListener('change', () => {
    if (!weatherData) return; // no data yet
    displayingHourlyForecast()
})
function displayingHourlyForecast() {
    // clearing the hourlyForecastContainer UI
    hourlyForecastContainer.textContent = ""
    // removing it only in this function
    hourlyForecastItems.forEach(item => {
        item.style.display = "none";
    });
    // Get the selected unit name
    const selectedUnit = unitsDropdown.value;
    const selectedIndex = daysDropdown.value || 0;
    const selectedDay = weatherData.forecast.forecastday[selectedIndex];
    // If day not found stop
    if (!selectedDay) {
        console.log("Selected day not found in forecast");
        return;
    }
    // Take the first 8 hours
    const firstEightHours = selectedDay.hour.slice(0, 8);
    //  Loop and fill the UI
    firstEightHours.forEach((hourData) => {
        // creating the hourlyForecast Item 
        const hourlyForecastItem = document.createElement('div')
        hourlyForecastItem.setAttribute("data-testid", "hourly-forecast-item");
        // giving class 
        hourlyForecastItem.classList.add('hourly-forecast-item')
        // Create elements
        const iconTimeContainer = document.createElement('div')
        iconTimeContainer.classList.add('icon-time-container')
        const icon = document.createElement("img");
        icon.classList.add('hourly-forecast-item-icon')
        icon.src = "https:" + hourData.condition.icon;

        const time = document.createElement("span");
        time.textContent = new Date(hourData.time).toLocaleTimeString("en-US", {
            hour: "numeric"
        });
        iconTimeContainer.appendChild(icon)
        iconTimeContainer.appendChild(time)
        const tempContainer = document.createElement('div') 
        tempContainer.classList.add('temp-container')
        const temp = document.createElement("span");
        temp.classList.add('grey')
        temp.textContent = hourData.temp_c + "°C";
        if (tempUnit === "temp-fahrenheit") temp.textContent = hourData.temp_f + "°F";
        tempContainer.appendChild(temp)
        // Append
        hourlyForecastItem.appendChild(iconTimeContainer);
        hourlyForecastItem.appendChild(tempContainer);
        hourlyForecastContainer.appendChild(hourlyForecastItem)
    });
}

