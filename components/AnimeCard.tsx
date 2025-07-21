import React from "react";
import { StyleSheet, Text, View, Image, TouchableOpacity, ViewStyle } from "react-native";
import { Star } from "lucide-react-native";
import { Anime } from "@/types/anime";

interface AnimeCardProps {
  anime: Anime;
  onPress: () => void;
  style?: ViewStyle;
}

export const AnimeCard: React.FC<AnimeCardProps> = ({ anime, onPress, style }) => {
  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: anime.images.jpg.image_url }}
        style={styles.image}
      />
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {anime.title || "Unknown Title"}
        </Text>
        <View style={styles.detailsContainer}>
          {anime.score ? (
            <View style={styles.scoreContainer}>
              <Star size={12} color="#FFD700" />
              <Text style={styles.score}>{anime.score}</Text>
            </View>
          ) : (
            <View style={styles.scoreContainer}>
              <Text style={styles.noScore}>N/A</Text>
            </View>
          )}
          <View style={styles.typeContainer}>
            <Text style={styles.type}>{anime.type || "Unknown"}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 150,
    marginRight: 12,
  },
  image: {
    width: "100%",
    height: 210,
    borderRadius: 8,
    backgroundColor: "#2A2A2A",
  },
  infoContainer: {
    marginTop: 8,
  },
  title: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  detailsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  score: {
    color: "#FFD700",
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 4,
  },
  noScore: {
    color: "#8E8E93",
    fontSize: 12,
  },
  typeContainer: {
    backgroundColor: "rgba(124, 77, 255, 0.2)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  type: {
    color: "#7C4DFF",
    fontSize: 10,
    fontWeight: "500",
  },
});