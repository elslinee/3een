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
    for (let i = 0; i < 360; i += 30) {
      const isMajor = i % 90 === 0;
      const length = isMajor ? 15 : 8;
      markers.push(
        <G key={i} transform={`rotate(${i})`}>
          <Line
            x1="0"
            y1={-(SIZE / 2 - 10)}
            x2="0"
            y2={-(SIZE / 2 - 10 - length)}
            stroke={textColor}
            strokeWidth={isMajor ? 3 : 1}
            opacity={isMajor ? 0.8 : 0.4}
          />
          {isMajor && (
            <SvgText
              x="0"
              y={-(SIZE / 2 - 40)}
              fill={textColor}
              fontSize="14"
              fontWeight="bold"
              textAnchor="middle"
              transform={`rotate(${-i})`}
            >
              {i === 0 ? "N" : i === 90 ? "E" : i === 180 ? "S" : "W"}
            </SvgText>
          )}
        </G>,
      );
    }
    return markers;
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
              strokeWidth="2"
              fill="transparent"
              opacity={0.1}
            />
            <G>{renderMarkers()}</G>
            {qiblaBearing !== null && (
              <G transform={`rotate(${qiblaBearing})`}>
                <Path
                  d="M 0 -135 L 12 -110 L -12 -110 Z"
                  fill={isAligned ? successColor : primaryColor}
                />
              </G>
            )}
          </Svg>

          {/* Qibla Icon Indicator */}
          {qiblaBearing !== null && (
            <Animated.View
              style={[
                styles.qiblaIconContainer,
                { transform: [{ rotate: `${qiblaBearing}deg` }] },
                needleAnimatedStyle,
              ]}
            >
              <View style={styles.iconShift}>
                <MaterialCommunityIcons
                  name="arrow-up"
                  size={38}
                  color={isAligned ? successColor : primaryColor}
                />
              </View>
            </Animated.View>
          )}
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
