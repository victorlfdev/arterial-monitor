import { useEffect, useState } from "react";
import { PixelRatio, Platform, TextStyle } from "react-native";

export function getFontScale(): number {
  if (Platform.OS === "web") {
    if (typeof document !== "undefined") {
      const val = document.documentElement.style.getPropertyValue("--font-scale");
      if (val) return parseFloat(val) || 1;
    }
    return 1;
  }
  return PixelRatio.getFontScale();
}

export function useFontScale(): number {
  const [scale, setScale] = useState(getFontScale());

  useEffect(() => {
    if (Platform.OS === "web") {
      const observer = new ResizeObserver(() => {
        const val = document.documentElement.style.getPropertyValue("--font-scale");
        if (val) setScale(parseFloat(val) || 1);
      });
      observer.observe(document.documentElement);
      return () => observer.disconnect();
    }
  }, []);

  return scale;
}

export function scaleFont(baseSize: number, fontScale: number = 1): number {
  const scaled = baseSize * fontScale;
  return Platform.OS === "web" ? scaled : Math.max(Math.round(scaled), 1);
}

export function scaleTextStyle(
  style: TextStyle,
  fontScale: number
): TextStyle {
  if (!fontScale || fontScale === 1) return style;
  const result = { ...style };
  if (typeof result.fontSize === "number") {
    result.fontSize = scaleFont(result.fontSize, fontScale);
  }
  if (typeof result.lineHeight === "number") {
    result.lineHeight = Math.round(result.lineHeight * fontScale);
  }
  return result;
}
