import Constants from "expo-constants";

interface Config {
  API_BASE_URL: string;
  NODE_ENV: string;
  APP_NAME: string;
  APP_VERSION: string;
}

const getConfig = (): Config => {
  // Lấy giá trị từ biến môi trường trước
  const apiUrl =
    process.env.EXPO_PUBLIC_API_BASE_URL ||
    Constants.expoConfig?.extra?.EXPO_PUBLIC_API_BASE_URL


  return {
    API_BASE_URL: apiUrl.trim(), // ⚠️ trim() để loại bỏ khoảng trắng vô tình
    NODE_ENV:
      process.env.NODE_ENV ||
      Constants.expoConfig?.extra?.NODE_ENV ||
      "development",
    APP_NAME:
      process.env.EXPO_PUBLIC_APP_NAME ||
      Constants.expoConfig?.extra?.EXPO_PUBLIC_APP_NAME ||
      "EV Battery Swap Station",
    APP_VERSION:
      process.env.EXPO_PUBLIC_APP_VERSION ||
      Constants.expoConfig?.extra?.EXPO_PUBLIC_APP_VERSION ||
      "1.0.0",
  };
};

export const config = getConfig();

export const isDevelopment = () => config.NODE_ENV === "development";
export const isProduction = () => config.NODE_ENV === "production";
export const isStaging = () => config.NODE_ENV === "staging";

export default config;
