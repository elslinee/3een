import React from "react";
import { Text, StyleProp, TextStyle } from "react-native";

interface HighlightedTextProps {
  text: string;
  ranges: [number, number][];
  style?: StyleProp<TextStyle>;
  highlightStyle: StyleProp<TextStyle>;
  numberOfLines?: number;
}

export default function HighlightedText({
  text,
  ranges,
  style,
  highlightStyle,
  numberOfLines,
}: HighlightedTextProps) {
  const parts: React.ReactNode[] = [];
  let cursor = 0;
  ranges.forEach(([start, end], i) => {
    if (start > cursor) parts.push(text.slice(cursor, start));
    parts.push(
      <Text key={i} style={highlightStyle}>
        {text.slice(start, end)}
      </Text>,
    );
    cursor = end;
  });
  if (cursor < text.length) parts.push(text.slice(cursor));

  return (
    <Text style={style} numberOfLines={numberOfLines}>
      {parts}
    </Text>
  );
}
