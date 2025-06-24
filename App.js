import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

const API_KEY = 'b0800b2656599ab649efb9ecd6899b35'; 
const indianCities = [
  'Mumbai',
  'Delhi',
  'Bangalore',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Pune',
  'Ahmedabad',
  'Jaipur',
  'Lucknow',
];

export default function App() {
  const [selectedCity, setSelectedCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isCelsius, setIsCelsius] = useState(true);

  const fetchWeather = async (city) => {
    if (!city) return;
    setLoading(true);
    try {
      const query = `${city},IN`;
      const units = isCelsius ? 'metric' : 'imperial';
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
          query
        )}&appid=${API_KEY}&units=${units}`
      );
      const data = await response.json();
      if (response.ok) {
        setWeatherData(data);
      } else {
        alert(data.message || 'City not found!');
        setWeatherData(null);
      }
    } catch (error) {
      alert('Error fetching weather data');
      setWeatherData(null);
    }
    setLoading(false);
  };

  const toggleTemperatureUnit = () => {
    if (!selectedCity) return;
    setIsCelsius(!isCelsius);
    fetchWeather(selectedCity);
  };

  // Get precipitation volume if available
  const getPrecipitation = (data) => {
    if (!data) return '0 mm';
    if (data.rain) {
      return `${data.rain['1h'] || data.rain['3h'] || 0} mm`;
    }
    if (data.snow) {
      return `${data.snow['1h'] || data.snow['3h'] || 0} mm`;
    }
    return '0 mm';
  };

  // Map weather description to emoji
  const getWeatherEmoji = (condition) => {
    condition = condition.toLowerCase();
    if (condition.includes('clear')) return '☀️';
    if (condition.includes('cloud')) return '☁️';
    if (condition.includes('rain') || condition.includes('drizzle')) return '🌧️';
    if (condition.includes('snow')) return '❄️';
    if (condition.includes('thunderstorm')) return '⛈️';
    if (condition.includes('mist') || condition.includes('fog')) return '🌫️';
    return '🌈';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🌤️ Weather in India</Text>

      <Picker
        selectedValue={selectedCity}
        onValueChange={(value) => {
          setSelectedCity(value);
          setWeatherData(null);
          fetchWeather(value);
        }}
        style={styles.picker}
      >
        <Picker.Item label="Select city" value="" />
        {indianCities.map((city) => (
          <Picker.Item key={city} label={city} value={city} />
        ))}
      </Picker>

      <TouchableOpacity onPress={toggleTemperatureUnit} style={styles.toggleBtn}>
        <Text style={styles.toggleText}>
          Show temperature in {isCelsius ? 'Fahrenheit (°F)' : 'Celsius (°C)'}
        </Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color="#0000ff" />}

      {!loading && weatherData && (
        <View style={styles.weatherBox}>
          <Text style={styles.city}>
            {weatherData.name}, {weatherData.sys.country}
          </Text>

          <Text style={styles.temp}>
            {Math.round(weatherData.main.temp)}°{isCelsius ? 'C' : 'F'}
          </Text>

          <Text style={styles.condition}>
            {getWeatherEmoji(weatherData.weather[0].description)}{' '}
            {weatherData.weather[0].description}
          </Text>

          <View style={styles.detailsBox}>
            <Text style={styles.detail}>Precipitation: {getPrecipitation(weatherData)}</Text>
            <Text style={styles.detail}>Humidity: {weatherData.main.humidity}%</Text>
            <Text style={styles.detail}>Wind Speed: {weatherData.wind.speed} m/s</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 80,
    padding: 20,
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  picker: {
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  toggleBtn: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'center',
    marginBottom: 20,
  },
  toggleText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  weatherBox: {
    alignItems: 'center',
    marginTop: 30,
  },
  city: {
    fontSize: 24,
    fontWeight: '600',
  },
  temp: {
    fontSize: 48,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  condition: {
    fontSize: 20,
    textTransform: 'capitalize',
    marginBottom: 20,
  },
  detailsBox: {
    width: '80%',
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    padding: 15,
  },
  detail: {
    fontSize: 18,
    marginVertical: 5,
  },
});
