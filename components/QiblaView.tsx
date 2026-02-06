import React, { useEffect, useMemo } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Svg, {
  Circle,
  G,
  Path,
  Line,
  Text as SvgText,
  Defs,
  RadialGradient,
  Stop,
} from "react-native-svg";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  interpolateColor,
  useDerivedValue,
} from "react-native-reanimated";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const SIZE = width * 0.8;
const ALIGNMENT_TOLERANCE = 5; // degrees

interface QiblaViewProps {
  heading: number;
  qiblaBearing: number | null;
  primaryColor: string;
  textColor: string;
}

const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedPath = Animated.createAnimatedComponent(Path);

export const QiblaView: React.FC<QiblaViewProps> = ({
  heading,
  qiblaBearing,
  primaryColor,
  textColor,
}) => {
  const rotation = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  // Calculate if aligned
  const isAligned = useMemo(() => {
    if (qiblaBearing === null) return false;
    // Normalized difference - heading is device N, qiblaBearing is angle from N
    // Device heading 0 means device N is true N.
    // Qibla needle is at qiblaBearing on the Qibla disc.
    // The disc is rotated by -heading.
    // So the 'top' of the screen is at relative 0.
    // The Qibla needle is aligned if (qiblaBearing - heading) is close to 0 (or 360)
    const diff = Math.abs(((qiblaBearing - heading + 540) % 360) - 180);
    return diff <= ALIGNMENT_TOLERANCE;
  }, [heading, qiblaBearing]);
  // const isAligned = true;

  useEffect(() => {
    rotation.value = withSpring(-heading, {
      damping: 20,
      stiffness: 90,
    });
  }, [heading]);

  useEffect(() => {
    if (isAligned) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 500 }),
          withTiming(1.0, { duration: 500 }),
        ),
        -1,
        true,
      );
    } else {
      pulseScale.value = withTiming(1.0);
    }
  }, [isAligned]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  const successColor = "#4CAF50"; // Green for alignment

  const needleAnimatedStyle = useAnimatedStyle(() => {
    const color = withTiming(isAligned ? successColor : primaryColor);
    return {
      transform: [{ scale: pulseScale.value }],
    };
  });

  const renderMarkers = () => {
    const markers = [];
    // 1. Tick Marks (every 2 degrees)
    for (let i = 0; i < 360; i += 2) {
      const isMain = i % 10 === 0;
      const isQuarter = i % 90 === 0;
      const radius = 135;
      const length = isQuarter ? 10 : isMain ? 7 : 4;

      markers.push(
        <Line
          key={`tick-${i}`}
          x1="0"
          y1={-radius}
          x2="0"
          y2={-(radius - length)}
          stroke={textColor}
          strokeWidth={isMain ? 1.5 : 0.5}
          opacity={isMain ? 0.6 : 0.3}
          transform={`rotate(${i})`}
        />,
      );
    }

    // 2. Degree Numbers (every 15 degrees, skipping 90s)
    for (let i = 0; i < 360; i += 15) {
      if (i % 90 === 0) continue;
      markers.push(
        <SvgText
          key={`deg-${i}`}
          x="0"
          y="-145"
          fill={textColor}
          fontSize="9"
          fontWeight="bold"
          textAnchor="middle"
          opacity={0.6}
          transform={`rotate(${i})`}
        >
          {i}
        </SvgText>,
      );
    }

    // 3. Cardinal & Ordinal Directions
    const directions = [
      { label: "N", angle: 0, size: 22, color: primaryColor, weight: "900" },
      { label: "E", angle: 90, size: 18, color: textColor, weight: "bold" },
      { label: "S", angle: 180, size: 18, color: textColor, weight: "bold" },
      { label: "W", angle: 270, size: 18, color: textColor, weight: "bold" },
      { label: "ne", angle: 45, size: 12, color: textColor, weight: "normal" },
      { label: "se", angle: 135, size: 12, color: textColor, weight: "normal" },
      { label: "sw", angle: 225, size: 12, color: textColor, weight: "normal" },
      { label: "nw", angle: 315, size: 12, color: textColor, weight: "normal" },
    ];

    directions.forEach((d) => {
      markers.push(
        <SvgText
          key={`dir-${d.label}`}
          x="0"
          y={d.angle % 90 === 0 ? "-165" : "-95"}
          fill={d.color}
          fontSize={d.size}
          fontWeight={d.weight}
          textAnchor="middle"
          alignmentBaseline="middle"
          transform={`rotate(${d.angle}) rotate(${-d.angle}, 0, ${d.angle % 90 === 0 ? "-165" : "-95"})`}
        >
          {d.label}
        </SvgText>,
      );
    });

    return markers;
  };

  const renderRose = () => {
    return (
      <G>
        {/* Main Star (N-S-E-W) */}
        {[0, 90, 180, 270].map((angle) => (
          <G key={`main-star-${angle}`} transform={`rotate(${angle})`}>
            {/* Shaded Right Half */}
            <Path d="M 0 -130 L 15 0 L 0 0 Z" fill={isAligned ? successColor : primaryColor} />
            {/* Light Left Half */}
            <Path
              d="M 0 -130 L -15 0 L 0 0 Z"
              fill={isAligned ? successColor : primaryColor}
              opacity={0.6}
            />
          </G>
        ))}

        {/* Secondary Star (NE-SE-SW-NW) */}
        {[45, 135, 225, 315].map((angle) => (
          <G key={`sec-star-${angle}`} transform={`rotate(${angle})`}>
            {/* Shaded Right Half */}
            <Path d="M 0 -85 L 10 0 L 0 0 Z" fill={textColor} opacity={0.5} />
            {/* Light Left Half */}
            <Path d="M 0 -85 L -10 0 L 0 0 Z" fill={textColor} opacity={0.2} />
          </G>
        ))}

        {/* Inner Decorative Circles */}
        <Circle
          cx="0"
          cy="0"
          r="40"
          stroke={textColor}
          strokeWidth="0.5"
          fill="none"
          opacity={0.3}
        />
        <Circle
          cx="0"
          cy="0"
          r="45"
          stroke={textColor}
          strokeWidth="0.5"
          fill="none"
          opacity={0.3}
        />
        <Circle cx="0" cy="0" r="5" fill={primaryColor} />
      </G>
    );
  };

  return (
    <View style={styles.container}>
      {/* Outer Glow / Border */}
      <View
        style={[
          styles.outerCircle,
          {
            borderColor: isAligned ? successColor + "88" : primaryColor + "44",
            borderWidth: isAligned ? 2 : 1,
          },
        ]}
      >
        <Animated.View style={[styles.QiblaWrapper, animatedStyle]}>
          <Svg width={SIZE} height={SIZE} viewBox="-150 -150 300 300">
            <Defs>
              <RadialGradient
                id="grad"
                cx="50%"
                cy="50%"
                r="50%"
                fx="50%"
                fy="50%"
              >
                <Stop
                  offset="0%"
                  stopColor={isAligned ? successColor : primaryColor}
                  stopOpacity="0.2"
                />
                <Stop
                  offset="100%"
                  stopColor={isAligned ? successColor : primaryColor}
                  stopOpacity="0"
                />
              </RadialGradient>
            </Defs>
            {isAligned && <Circle cx="0" cy="0" r="140" fill="url(#grad)" />}
            <Circle
              cx="0"
              cy="0"
              r="140"
              stroke={isAligned ? successColor : primaryColor}
              strokeWidth="1"
              fill="transparent"
              opacity={0.1}
            />
            {/* 1. Base Rose Elements */}
            {renderRose()}

            {/* 2. External Labels & Ticks */}
            <G>{renderMarkers()}</G>

            {/* 3. Qibla Needle (Traditional Style) */}
            {qiblaBearing !== null && (
              <G transform={`rotate(${qiblaBearing})`}>
                <Path
                  d="M 0 -135 L 12 -110 L -12 -110 Z"
                  fill={isAligned ? successColor : primaryColor}
                />
              </G>
            )}
          </Svg>
        </Animated.View>

        {/* Static Center Point */}
        <View
          style={[
            styles.centerIndicator,
            { backgroundColor: isAligned ? successColor : primaryColor },
          ]}
        />

        {/* Dynamic Heading Indicator (Fixed at Top) */}
        <View style={styles.topIndicatorContainer}>
          <View
            style={[
              styles.northTriangle,
              { borderBottomColor: isAligned ? successColor : primaryColor },
            ]}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 30,
  },
  outerCircle: {
    width: SIZE + 30,
    height: SIZE + 30,
    borderRadius: (SIZE + 30) / 2,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  QiblaWrapper: {
    width: SIZE,
    height: SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  centerIndicator: {
    position: "absolute",
    width: 14,
    height: 14,
    borderRadius: 7,
    zIndex: 10,
    elevation: 3,
  },
  topIndicatorContainer: {
    position: "absolute",
    top: -15,
    zIndex: 20,
  },
  northTriangle: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderBottomWidth: 20,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
  },
  qiblaIconContainer: {
    position: "absolute",
    width: SIZE,
    height: SIZE,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  iconShift: {
    marginTop: 20, // Move inside the disc
  },
});
