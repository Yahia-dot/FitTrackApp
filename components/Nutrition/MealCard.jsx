import React, { useState } from "react";
import { View, StyleSheet, Image, TouchableOpacity, Animated } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { Colors } from "../../constants/Colors";
import ThemedView from "../ThemedView";
import ThemedText from "../ThemedText";
import { useTheme } from "../../hooks/useTheme";

const MealCard = ({ meal, onToggle }) => {
  const { theme } = useTheme();
  const { title, type, calories, image, isEaten, ingredients, instructions } = meal;
  const [expanded, setExpanded] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  const formatArrayOrString = (data) => {
    if (!data) return "Not available";
    return Array.isArray(data) ? data.join(", ") : data;
  };

  const formatInstructions = (data) => {
    if (!data) return "No instructions provided.";
    return Array.isArray(data) ? data.join("\n") : data;
  };

  const toggleExpanded = () => {
    const toValue = expanded ? 0 : 1;
    setExpanded(!expanded);
    
    Animated.timing(animation, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const animatedHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 200], // Adjust based on content
  });

  const getMealTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'breakfast':
        return 'sun';
      case 'lunch':
        return 'clock';
      case 'dinner':
        return 'moon';
      case 'snack':
        return 'apple-alt';
      default:
        return 'utensils';
    }
  };

  const getMealTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'breakfast':
        return '#FF6B35';
      case 'lunch':
        return '#F7931E';
      case 'dinner':
        return '#6A4C93';
      case 'snack':
        return Colors.primary;
      default:
        return Colors.primary;
    }
  };

  return (
    <View style={[styles.cardContainer, { backgroundColor: theme.uiBackground }]}>
      {/* Main Card Content */}
      <View style={styles.card}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.leftSection}>
            <View style={[styles.mealTypeIcon, { backgroundColor: getMealTypeColor(type) }]}>
              <FontAwesome5 
                name={getMealTypeIcon(type)} 
                size={16} 
                color="#fff" 
              />
            </View>
            <View style={styles.textSection}>
              <ThemedText variant="subtitle" style={styles.title}>
                {title}
              </ThemedText>
              <View style={styles.metaRow}>
                <ThemedText variant="caption" style={styles.mealType}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </ThemedText>
                <View style={styles.dot} />
                <View style={styles.caloriesBadge}>
                  <FontAwesome5 name="fire" size={10} color={Colors.warning} />
                  <ThemedText variant="caption" style={styles.caloriesText}>
                    {calories} kcal
                  </ThemedText>
                </View>
              </View>
            </View>
          </View>

          {/* Image Section */}
          {image && (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: convertGoogleDriveLink(image) }}
                style={styles.image}
              />
              {isEaten && (
                <View style={styles.eatenOverlay}>
                  <FontAwesome5 name="check-circle" size={20} color={Colors.primary} />
                </View>
              )}
            </View>
          )}
        </View>

        {/* Action Buttons Row */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            onPress={toggleExpanded}
            style={[styles.actionButton, { backgroundColor: theme.background }]}
          >
            <FontAwesome5 
              name={expanded ? "chevron-up" : "chevron-down"} 
              size={12} 
              color={theme.iconColor} 
            />
            <ThemedText variant="caption" style={styles.actionText}>
              {expanded ? "Less" : "More"}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onToggle}
            style={[
              styles.primaryButton,
              { 
                backgroundColor: isEaten ? Colors.primary : theme.iconColor,
                opacity: isEaten ? 1 : 0.8 
              }
            ]}
          >
            <FontAwesome5
              name={isEaten ? "check-circle" : "circle"}
              color="#fff"
              size={14}
            />
            <ThemedText style={styles.primaryButtonText}>
              {isEaten ? "Eaten" : "Mark as Eaten"}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      {/* Expandable Details Section */}
      <Animated.View style={[styles.expandableContent, { height: animatedHeight }]}>
        <View style={[styles.detailsContainer, { backgroundColor: theme.background }]}>
          {ingredients && (
            <View style={styles.detailSection}>
              <View style={styles.detailHeader}>
                <FontAwesome5 name="list-ul" size={14} color={Colors.primary} />
                <ThemedText variant="caption" style={styles.detailTitle}>
                  Ingredients
                </ThemedText>
              </View>
              <ThemedText variant="caption" style={styles.detailText}>
                {formatArrayOrString(ingredients)}
              </ThemedText>
            </View>
          )}

          {instructions && (
            <View style={styles.detailSection}>
              <View style={styles.detailHeader}>
                <FontAwesome5 name="clipboard-list" size={14} color={Colors.primary} />
                <ThemedText variant="caption" style={styles.detailTitle}>
                  Instructions
                </ThemedText>
              </View>
              <ThemedText variant="caption" style={styles.instructionText}>
                {formatInstructions(instructions)}
              </ThemedText>
            </View>
          )}
        </View>
      </Animated.View>
    </View>
  );
};

export default MealCard;

const convertGoogleDriveLink = (link) => {
  const match = link.match(/\/d\/([^/]+)\//);
  if (match) {
    return `https://drive.google.com/uc?export=view&id=${match[1]}`;
  }
  return link;
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
    overflow: 'hidden',
  },
  card: {
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  leftSection: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  mealTypeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  textSection: {
    flex: 1,
  },
  title: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 6,
    lineHeight: 22,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  mealType: {
    fontWeight: "600",
    color: Colors.primary,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#ccc",
    marginHorizontal: 8,
  },
  caloriesBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff5f0",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  caloriesText: {
    marginLeft: 4,
    fontWeight: "600",
    color: Colors.warning,
  },
  imageContainer: {
    position: "relative",
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: "#f0f0f0",
  },
  eatenOverlay: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    flex: 1,
    justifyContent: "center",
  },
  actionText: {
    marginLeft: 6,
    fontWeight: "500",
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    flex: 2,
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#fff",
    marginLeft: 8,
    fontWeight: "600",
  },
  expandableContent: {
    overflow: 'hidden',
  },
  detailsContainer: {
    padding: 20,
    paddingTop: 0,
  },
  detailSection: {
    marginBottom: 16,
  },
  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailTitle: {
    fontWeight: "600",
    marginLeft: 8,
    color: Colors.primary,
  },
  detailText: {
    lineHeight: 18,
    paddingLeft: 22,
  },
  instructionText: {
    lineHeight: 20,
    paddingLeft: 22,
  },
});