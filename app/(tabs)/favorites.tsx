import React from "react";
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useAnime } from "@/context/AnimeContext";
import { AnimeListItem } from "@/components/AnimeListItem";
import { Heart } from "lucide-react-native";
import { Anime } from "@/types/anime";

export default function FavoritesScreen() {
  const router = useRouter();
  const { favorites, addToRecents } = useAnime();

  const handleAnimePress = (anime: Anime) => {
    addToRecents(anime);
    router.push(`/anime/${anime.mal_id}`);
  };

  // Filter out items without proper mal_id and ensure unique keys
  const validFavorites = favorites.filter((item: Anime) => item?.mal_id) || [];

  if (validFavorites.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <Heart size={40} color="#7C4DFF" />
        </View>
        <Text style={styles.emptyTitle}>No favorites yet</Text>
        <Text style={styles.emptyText}>
          Add anime to your favorites by tapping the heart icon on any anime details page
        </Text>
        <TouchableOpacity
          style={styles.exploreButton}
          onPress={() => router.push("/explore")}
        >
          <Text style={styles.exploreButtonText}>Explore Anime</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
          <Text style={styles.headerTitle}>Favorites</Text>
          <Text style={styles.headerSubtitle}>List of Your Favorites Anime</Text>
      </View>
      <FlatList
        data={validFavorites}
        keyExtractor={(item: Anime, index: number) => `favorite-${item.mal_id}-${index}`}
        renderItem={({ item }: { item: Anime }) => (
          <AnimeListItem
            anime={item}
            onPress={() => handleAnimePress(item)}
          />
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#2A2A2A",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  headerSubtitle: {
    color: "#8E8E93",
    fontSize: 14,
  },
  listContent: {
    paddingBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: "#121212",
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(124, 77, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
  },
  emptyText: {
    color: "#8E8E93",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
  },
  exploreButton: {
    backgroundColor: "#7C4DFF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  exploreButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});