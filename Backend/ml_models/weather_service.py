#!/usr/bin/env python3
"""
🌤️ Weather Integration for Travel Planner
Adds weather data to travel itineraries
"""

import requests
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional

class WeatherService:
    """Weather service for travel planning"""
    
    def __init__(self, api_key: str = None):
        """Initialize weather service"""
        # Free weather API (no key required for basic use)
        self.base_url = "https://api.open-meteo.com/v1/forecast"
        self.geocoding_url = "https://geocoding-api.open-meteo.com/v1/search"
        print("✅ Weather service initialized (Open-Meteo API)")
    
    def get_coordinates(self, city: str) -> Optional[Dict]:
        """Get coordinates for a city"""
        try:
            response = requests.get(
                self.geocoding_url,
                params={"name": city, "count": 1, "language": "en", "format": "json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("results"):
                    result = data["results"][0]
                    return {
                        "latitude": result["latitude"],
                        "longitude": result["longitude"],
                        "city": result["name"],
                        "country": result["country"]
                    }
            return None
            
        except Exception as e:
            print(f"❌ Error getting coordinates: {e}")
            return None
    
    def get_weather_forecast(self, destination: str, travel_dates: str, duration: int) -> Dict:
        """
        Get weather forecast for destination and dates
        
        Args:
            destination: City name (e.g., "Rome, Italy")
            travel_dates: Start date (e.g., "May 15-20, 2025" or "2025-05-15")
            duration: Trip duration in days
        
        Returns:
            Weather forecast data
        """
        try:
            # Extract city name
            city = destination.split(",")[0].strip()
            
            # Get coordinates
            coords = self.get_coordinates(city)
            if not coords:
                return self._fallback_weather(destination, travel_dates, duration)
            
            # Parse start date
            try:
                if "-" in travel_dates and len(travel_dates) > 10:
                    # Format: "May 15-20, 2025"
                    start_date_str = travel_dates.split("-")[0].strip() + ", " + travel_dates.split(",")[1].strip()
                    start_date = datetime.strptime(start_date_str, "%B %d, %Y")
                else:
                    # Format: "2025-05-15"
                    start_date = datetime.strptime(travel_dates, "%Y-%m-%d")
            except:
                # Fallback to current date
                start_date = datetime.now()
            
            end_date = start_date + timedelta(days=duration-1)
            
            # Get weather data
            response = requests.get(
                self.base_url,
                params={
                    "latitude": coords["latitude"],
                    "longitude": coords["longitude"],
                    "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode,windspeed_10m_max",
                    "start_date": start_date.strftime("%Y-%m-%d"),
                    "end_date": end_date.strftime("%Y-%m-%d"),
                    "timezone": "auto"
                }
            )
            
            if response.status_code == 200:
                weather_data = response.json()
                return self._format_weather_data(weather_data, coords, travel_dates, duration)
            else:
                return self._fallback_weather(destination, travel_dates, duration)
                
        except Exception as e:
            print(f"❌ Error getting weather: {e}")
            return self._fallback_weather(destination, travel_dates, duration)
    
    def _format_weather_data(self, weather_data: Dict, coords: Dict, travel_dates: str, duration: int) -> Dict:
        """Format weather data for travel planner"""
        
        daily_data = weather_data.get("daily", {})
        dates = daily_data.get("time", [])
        max_temps = daily_data.get("temperature_2m_max", [])
        min_temps = daily_data.get("temperature_2m_min", [])
        precipitation = daily_data.get("precipitation_sum", [])
        weather_codes = daily_data.get("weathercode", [])
        wind_speeds = daily_data.get("windspeed_10m_max", [])
        
        # Weather code descriptions
        weather_descriptions = {
            0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
            45: "Foggy", 48: "Depositing rime fog", 51: "Light drizzle", 53: "Moderate drizzle",
            55: "Dense drizzle", 56: "Light freezing drizzle", 57: "Dense freezing drizzle",
            61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain", 66: "Light freezing rain",
            67: "Heavy freezing rain", 71: "Slight snow fall", 73: "Moderate snow fall",
            75: "Heavy snow fall", 77: "Snow grains", 80: "Slight rain showers",
            81: "Moderate rain showers", 82: "Violent rain showers", 85: "Slight snow showers",
            86: "Heavy snow showers", 95: "Thunderstorm", 96: "Thunderstorm with slight hail",
            99: "Thunderstorm with heavy hail"
        }
        
        daily_weather = []
        for i in range(min(len(dates), duration)):
            day_weather = {
                "date": dates[i],
                "day_number": i + 1,
                "max_temp": f"{max_temps[i]:.0f}°C" if i < len(max_temps) else "N/A",
                "min_temp": f"{min_temps[i]:.0f}°C" if i < len(min_temps) else "N/A",
                "precipitation": f"{precipitation[i]:.1f}mm" if i < len(precipitation) else "0mm",
                "description": weather_descriptions.get(weather_codes[i] if i < len(weather_codes) else 0, "Clear"),
                "wind_speed": f"{wind_speeds[i]:.0f} km/h" if i < len(wind_speeds) else "N/A",
                "clothing_advice": self._get_clothing_advice(
                    max_temps[i] if i < len(max_temps) else 20,
                    precipitation[i] if i < len(precipitation) else 0,
                    weather_codes[i] if i < len(weather_codes) else 0
                )
            }
            daily_weather.append(day_weather)
        
        return {
            "success": True,
            "destination": f"{coords['city']}, {coords['country']}",
            "travel_dates": travel_dates,
            "duration": duration,
            "daily_weather": daily_weather,
            "overall_summary": self._get_weather_summary(daily_weather),
            "packing_recommendations": self._get_packing_recommendations(daily_weather)
        }
    
    def _get_clothing_advice(self, max_temp: float, precipitation: float, weather_code: int) -> str:
        """Get clothing advice based on weather"""
        advice = []
        
        if max_temp > 25:
            advice.append("light clothing")
        elif max_temp > 15:
            advice.append("layers")
        else:
            advice.append("warm clothing")
        
        if precipitation > 2:
            advice.append("rain jacket/umbrella")
        
        if weather_code in [71, 73, 75, 77, 85, 86]:
            advice.append("winter gear")
        
        return ", ".join(advice) if advice else "comfortable clothing"
    
    def _get_weather_summary(self, daily_weather: List[Dict]) -> str:
        """Get overall weather summary"""
        if not daily_weather:
            return "Weather data unavailable"
        
        avg_max = sum(float(day["max_temp"].replace("°C", "")) for day in daily_weather if day["max_temp"] != "N/A") / len(daily_weather)
        rainy_days = sum(1 for day in daily_weather if float(day["precipitation"].replace("mm", "")) > 1)
        
        summary = f"Average high: {avg_max:.0f}°C"
        if rainy_days > 0:
            summary += f", {rainy_days} rainy day(s)"
        
        return summary
    
    def _get_packing_recommendations(self, daily_weather: List[Dict]) -> List[str]:
        """Get packing recommendations based on weather"""
        recommendations = set()
        
        for day in daily_weather:
            if day["max_temp"] != "N/A":
                max_temp = float(day["max_temp"].replace("°C", ""))
                if max_temp > 25:
                    recommendations.update(["Light clothing", "Sunscreen", "Hat"])
                elif max_temp < 10:
                    recommendations.update(["Warm jacket", "Layers", "Closed shoes"])
            
            if float(day["precipitation"].replace("mm", "")) > 1:
                recommendations.update(["Rain jacket", "Umbrella", "Waterproof shoes"])
        
        return list(recommendations)[:6]  # Limit to 6 recommendations
    
    def _fallback_weather(self, destination: str, travel_dates: str, duration: int) -> Dict:
        """Fallback weather data when API fails"""
        return {
            "success": False,
            "destination": destination,
            "travel_dates": travel_dates,
            "duration": duration,
            "message": "Weather data temporarily unavailable",
            "general_advice": "Check weather forecast before traveling and pack accordingly"
        }

# Test the weather service
if __name__ == "__main__":
    print("🌤️ WEATHER SERVICE TEST")
    print("=" * 40)
    
    weather_service = WeatherService()
    
    # Test cases
    test_cases = [
        ("Rome, Italy", "2025-05-15", 5),
        ("Tokyo, Japan", "2025-03-20", 7),
        ("Paris, France", "2025-06-10", 4)
    ]
    
    for destination, start_date, duration in test_cases:
        print(f"\n📍 Testing: {destination}")
        print(f"📅 Dates: {start_date} ({duration} days)")
        
        weather = weather_service.get_weather_forecast(destination, start_date, duration)
        
        if weather["success"]:
            print(f"✅ Weather data retrieved!")
            print(f"   Summary: {weather['overall_summary']}")
            print(f"   Day 1: {weather['daily_weather'][0]['max_temp']} - {weather['daily_weather'][0]['description']}")
            print(f"   Packing: {', '.join(weather['packing_recommendations'][:3])}")
        else:
            print(f"⚠️ {weather['message']}")
    
    print(f"\n✅ Weather service ready for integration!")
