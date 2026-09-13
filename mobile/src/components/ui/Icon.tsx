import React from "react";
import { Platform } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const iconMap: Record<string, { ios: string; android: string }> = {
  heart: { ios: "heart", android: "favorite" },
  hand: { ios: "hand", android: "swipe" },
  medkit: { ios: "medkit", android: "medical-services" },
  alertcircle: { ios: "alertcircle", android: "warning" },
  pencil: { ios: "pencil", android: "edit" },
  trash: { ios: "trash", android: "delete" },
  clock: { ios: "clock", android: "access-time" },
  add: { ios: "add", android: "add" },
  flashlight: { ios: "flashlight", android: "flash-on" },
  people: { ios: "people", android: "people" },
  alarm: { ios: "alarm", android: "alarm" },
  moon: { ios: "moon", android: "nightlight" },
  notifications: { ios: "notifications", android: "notifications" },
  server: { ios: "server", android: "dns" },
  trophy: { ios: "trophy", android: "emoji-objects" },
  flag: { ios: "flag", android: "flag" },
  documentText: { ios: "document.text", android: "description" },
  checkmark: { ios: "checkmark", android: "check" },
  sun: { ios: "sunny", android: "wb-sunny" },
  flame: { ios: "flame", android: "local-fire-department" },
  save: { ios: "save", android: "save" },
  chevronForward: { ios: "chevron-forward", android: "chevron-right" },
  chevronDown: { ios: "chevron-down", android: "expand-more" },
  chevronUp: { ios: "chevron-up", android: "expand-less" },
  personAdd: { ios: "person-add", android: "person-add" },
  arrowForward: { ios: "arrow-forward", android: "arrow-forward" },
  lockClosed: { ios: "lock-closed", android: "lock" },
  person: { ios: "person", android: "person" },
  medical: { ios: "medical", android: "local-hospital" },
  bar: { ios: "bar", android: "bar-chart" },
  calendar: { ios: "calendar", android: "calendar-today" },
  ellipsis: { ios: "ellipsis", android: "more-vert" },
  share: { ios: "share", android: "share" },
  floppy: { ios: "save", android: "save" },
  checkmarkCircle: { ios: "checkmark-circle", android: "check-circle" },
  options: { ios: "ellipsis", android: "more-horiz" },
  "heart-outline": { ios: "heart-outline", android: "favorite-border" },
  "hand-outline": { ios: "hand-outline", android: "swipe" },
  "medkit-outline": { ios: "medkit-outline", android: "medical-services" },
  "alert-circle-outline": { ios: "alert-circle-outline", android: "warning" },
  "create-outline": { ios: "create-outline", android: "edit" },
  "trash-outline": { ios: "trash-outline", android: "delete" },
  "time-outline": { ios: "time-outline", android: "access-time" },
  "add-outline": { ios: "add-outline", android: "add" },
  "flash-outline": { ios: "flash-outline", android: "flash-on" },
  "people-outline": { ios: "people-outline", android: "people" },
  "alarm-outline": { ios: "alarm-outline", android: "alarm" },
  "moon-outline": { ios: "moon-outline", android: "nightlight" },
  "notifications-outline": { ios: "notifications-outline", android: "notifications" },
  "server-outline": { ios: "server-outline", android: "dns" },
  "trophy-outline": { ios: "trophy-outline", android: "emoji-events" },
  "flag-outline": { ios: "flag-outline", android: "flag" },
  "document-text-outline": { ios: "document-text-outline", android: "description" },
  "checkmark-done-circle": { ios: "checkmark-done-circle", android: "task-alt" },
  "bar-chart-outline": { ios: "bar-chart-outline", android: "bar-chart" },
  "chevron-forward-outline": { ios: "chevron-forward-outline", android: "chevron-right" },
  "chevron-down-circle": { ios: "chevron-down-circle", android: "expand-more" },
  "chevron-up-circle": { ios: "chevron-up-circle", android: "expand-less" },
  "person-add-outline": { ios: "person-add-outline", android: "person-add" },
  "arrow-forward-outline": { ios: "arrow-forward-outline", android: "arrow-forward" },
  "lock-closed-outline": { ios: "lock-closed-outline", android: "lock" },
  "person-outline": { ios: "person-outline", android: "person-outline" },
  "medical-outline": { ios: "medical-outline", android: "local-hospital" },
  "flame-outline": { ios: "flame-outline", android: "local-fire-department" },
  "sunny-outline": { ios: "sunny-outline", android: "wb-sunny" },
  "save-outline": { ios: "save-outline", android: "save" },
  "checkmark-circle-outline": { ios: "checkmark-circle-outline", android: "check-circle-outline" },
  "checkmark-circle": { ios: "checkmark-circle", android: "check-circle" },
  "document-text": { ios: "document-text", android: "description" },
  "bar-chart": { ios: "bar", android: "bar-chart" },
  "document": { ios: "document", android: "description" },
};

interface IconProps {
  name: string;
  size?: number;
  color?: any;
}

const iconNamesToNormalize = [
  "heart-outline", "heart",
  "hand-outline", "hand",
  "medkit-outline", "medkit",
  "alert-circle-outline", "alertcircle",
  "create-outline", "pencil",
  "trash-outline", "trash",
  "time-outline", "time",
  "add-outline", "add",
  "flash-outline", "flash",
  "people-outline", "people",
  "alarm-outline", "alarm",
  "moon-outline", "moon",
  "notifications-outline", "notifications",
  "server-outline", "server",
  "trophy-outline", "trophy",
  "flag-outline", "flag",
  "document-text-outline", "document-text",
  "checkmark-done-circle", "checkmark-done-circle",
  "bar-chart-outline", "bar-chart-outline",
  "chevron-forward-outline", "chevron-forward",
  "chevron-down-circle", "chevron-down-circle",
  "chevron-up-circle", "chevron-up-circle",
  "person-add-outline", "person-add",
  "arrow-forward-outline", "arrow-forward",
  "lock-closed-outline", "lock-closed",
  "person-outline", "person",
  "medical-outline", "medical",
  "flame-outline", "flame",
  "sunny-outline", "sunny",
  "save-outline", "save",
  "checkmark-circle-outline", "checkmark-circle",
  "checkmark-circle", "checkmark-circle",
  "document-text", "document-text",
  "bar-chart", "bar-chart",
  "options", "options",
  "document", "document",
];

export function Icon({ name, size = 24, color }: IconProps) {
  const isIOS = Platform.OS === "ios";

  let normalizedName = name
    .toLowerCase()
    .replace(/-([a-z])/g, (_, char) => char.toUpperCase());

  let normalizedIconName = "";
  for (const fullName of iconNamesToNormalize) {
    const normalized = fullName
      .toLowerCase()
      .replace(/-([a-z])/g, (_, char) => char.toUpperCase());
    if (normalized === normalizedName || name.toLowerCase() === fullName.toLowerCase()) {
      normalizedIconName = fullName;
      break;
    }
  }

  if (!normalizedIconName) {
    normalizedIconName = normalizedName;
  }

  const mapping = iconMap[normalizedIconName];

  if (mapping) {
    const iconName = isIOS ? mapping.ios : mapping.android;
    if (isIOS) {
      return (
        <Ionicons
          name={iconName as any}
          size={size}
          color={color || "#000000"}
        />
      );
    }
    return (
      <MaterialIcons
        name={iconName as any}
        size={size}
        color={color || "#000000"}
      />
    );
  }

  const fallbackName = isIOS ? "help-circle" : "help-outline";
  return (
    <MaterialIcons
      name={fallbackName as any}
      size={size}
      color={color || "#000000"}
    />
  );
}
