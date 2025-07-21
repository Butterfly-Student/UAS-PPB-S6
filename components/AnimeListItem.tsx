import React from "react";
import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import { Star } from "lucide-react-native";
import { Anime } from "@/types/anime";

interface AnimeListItemProps {
  anime: Anime;
  onPress: () => void;
  rank?: number;
}

export const AnimeListItem: React.FC<AnimeListItemProps> = ({ anime, onPress, rank }) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {rank && (
        <View style={styles.rankContainer}>
          <Text style={styles.rankText}>{rank}</Text>
        </View>
      )}
      <Image
        source={{ uri: anime.images.jpg.image_url }}
        style={styles.image}
      />
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={2}>
          {anime.title || "Unknown Title"}
        </Text>
        <View style={styles.detailsRow}>
          <Text style={styles.type}>{anime.type || "Unknown"}</Text>
          <Text style={styles.episodes}>
            {anime.episodes ? `${anime.episodes} ep` : "? ep"}
          </Text>
        </View>
        <View style={styles.statsRow}>
          {anime.score ? (
            <View style={styles.scoreContainer}>
              <Star size={14} color="#FFD700" />
              <Text style={styles.score}>{anime.score}</Text>
            </View>
          ) : (
            <Text style={styles.noScore}>No rating</Text>
          )}
          {anime.year && (
            <Text style={styles.year}>{anime.year}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#2A2A2A",
  },
  rankContainer: {
    width: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  rankText: {
    color: "#7C4DFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  image: {
    width: 70,
    height: 100,
    borderRadius: 6,
    backgroundColor: "#2A2A2A",
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between",
  },
  title: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  type: {
    color: "#8E8E93",
    fontSize: 14,
    marginRight: 12,
  },
  episodes: {
    color: "#8E8E93",
    fontSize: 14,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  score: {
    color: "#FFD700",
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 4,
  },
  noScore: {
    color: "#8E8E93",
    fontSize: 14,
    marginRight: 12,
  },
  year: {
    color: "#8E8E93",
    fontSize: 14,
  },
});