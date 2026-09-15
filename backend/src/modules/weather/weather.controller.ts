import axios from "axios";
import { Request, Response } from "express";

export const weatherController = {
  async getCurrentWeather(req: Request, res: Response) {
    try {
      const city = String(req.query.city || "").trim();

      if (!city) {
        return res.status(400).json({
          message: "City is required",
        });
      }

      const apiKey = process.env.WEATHER_API_KEY;

      if (!apiKey) {
        return res.status(500).json({
          message: "Weather API key is not configured",
        });
      }

      const { data } = await axios.get(
        "https://api.weatherapi.com/v1/current.json",
        {
          params: {
            key: apiKey,
            q: city,
            aqi: "no",
          },
          timeout: 10000,
        }
      );

      if (data.error) {
        return res.status(400).json({
          message: data.error.message || "Weather API error",
        });
      }

      return res.json({
        temp_c: data.current.temp_c,
        condition: data.current.condition.text,
        icon: data.current.condition.icon,
        wind_kph: data.current.wind_kph,
        humidity: data.current.humidity,
        visibility_km: data.current.vis_km,
        feels_like_c: data.current.feelslike_c,
      });
    } catch (error: any) {
      console.error(
        "Weather API error:",
        error.response?.data || error.message
      );

      return res.status(500).json({
        message: "Unable to fetch weather",
      });
    }
  },
};