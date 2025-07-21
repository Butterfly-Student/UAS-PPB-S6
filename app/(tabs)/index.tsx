import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { fetchSeasonalAnime, fetchTopAnime, fetchRecentAnime } from "@/api/animeApi";
import { AnimeCard } from "@/components/AnimeCard";
import { useAnime } from "@/context/AnimeContext";
import { Play } from "lucide-react-native";
import { Anime, AnimeApiResponse } from "@/types/anime";

export default function HomeScreen() {
  const router = useRouter();
  const { addToRecents } = useAnime();
  const [featuredAnime, setFeaturedAnime] = useState<Anime | null>(null);

  const { data: seasonalData, isLoading: seasonalLoading } = useQuery<AnimeApiResponse>({
    queryKey: ["seasonal"],
    queryFn: fetchSeasonalAnime,
  });

  const { data: topData, isLoading: topLoading } = useQuery<AnimeApiResponse>({
    queryKey: ["top-anime", "bypopularity"],
    queryFn: () => fetchTopAnime("bypopularity"),
  });

  const { data: recentData, isLoading: recentLoading } = useQuery<AnimeApiResponse>({
    queryKey: ["recent-anime"],
    queryFn: fetchRecentAnime,
  });

  // Set featured anime when seasonal data loads
  useEffect(() => {
    if (seasonalData?.data?.length && !featuredAnime) {
      setFeaturedAnime(seasonalData.data[Math.floor(Math.random() * Math.min(5, seasonalData.data.length))]);
    }
  }, [seasonalData, featuredAnime]);

  const handleAnimePress = (anime: Anime) => {
    addToRecents(anime);
    router.push(`/anime/${anime.mal_id}`);
  };

  const renderSection = (title: string, data: AnimeApiResponse | undefined, isLoading: boolean) => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7C4DFF" />
        </View>
      );
    }

    // Filter out items without proper mal_id and ensure unique keys
    const validData = data?.data?.filter((item: Anime) => item?.mal_id)?.slice(0, 10) || [];

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <FlatList
          data={validData}
          keyExtractor={(item: Anime, index: number) => `${item.mal_id}-${index}`}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }: { item: Anime }) => (
            <AnimeCard anime={item} onPress={() => handleAnimePress(item)} />
          )}
          contentContainerStyle={styles.listContent}
        />
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {featuredAnime ? (
        <TouchableOpacity
          style={styles.featuredContainer}
          onPress={() => handleAnimePress(featuredAnime)}
          activeOpacity={0.9}
        >
          <Image
            source={{ uri: featuredAnime.images.jpg.large_image_url || featuredAnime.images.jpg.image_url }}
            style={styles.featuredImage}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)', '#121212']}
            style={styles.gradient}
          >
            <View style={styles.featuredContent}>
              <Text style={styles.featuredTitle}>{featuredAnime.title}</Text>
              <View style={styles.featuredMeta}>
                <Text style={styles.featuredType}>{featuredAnime.type || "Unknown"}</Text>
                <Text style={styles.featuredScore}>★ {featuredAnime.score || "N/A"}</Text>
              </View>
              <TouchableOpacity
                style={styles.watchButton}
                onPress={() => handleAnimePress(featuredAnime)}
              >
                <Play size={16} color="#fff" />
                <Text style={styles.watchButtonText}>Watch Now</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      ) : seasonalLoading ? (
        <View style={styles.featuredLoading}>
          <ActivityIndicator size="large" color="#7C4DFF" />
        </View>
      ) : null}

      {renderSection("Seasonal Anime", seasonalData, seasonalLoading)}
      {renderSection("Popular Anime", topData, topLoading)}
      {renderSection("Recently Updated", recentData, recentLoading)}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  featuredContainer: {
    height: 500,
    width: "100%",
    position: "relative",
  },
  featuredImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "70%",
    justifyContent: "flex-end",
    padding: 20,
  },
  featuredContent: {
    marginBottom: 20,
  },
  featuredTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  featuredMeta: {
    flexDirection: "row",
    marginBottom: 16,
  },
  featuredType: {
    color: "#fff",
    backgroundColor: "rgba(124, 77, 255, 0.8)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 10,
    fontSize: 12,
    overflow: "hidden",
  },
  featuredScore: {
    color: "#FFD700",
    fontSize: 14,
    fontWeight: "bold",
  },
  watchButton: {
    backgroundColor: "#7C4DFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: 150,
  },
  watchButtonText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 8,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  listContent: {
    paddingRight: 16,
  },
  loadingContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  featuredLoading: {
    height: 400,
    justifyContent: "center",
    alignItems: "center",
  },
});