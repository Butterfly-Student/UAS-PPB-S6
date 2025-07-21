import React, { useState } from "react";
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { fetchTopAnime } from "@/api/animeApi";
import { AnimeListItem } from "@/components/AnimeListItem";
import { useAnime } from "@/context/AnimeContext";
import { Anime, AnimeApiResponse } from "@/types/anime";

const FILTER_OPTIONS = [
  { id: "all", label: "All Time", value: "all" },
  { id: "airing", label: "Airing", value: "airing" },
  { id: "upcoming", label: "Upcoming", value: "upcoming" },
  { id: "bypopularity", label: "Popular", value: "bypopularity" },
  { id: "favorite", label: "Favorite", value: "favorite" },
];

export default function TopRatedScreen() {
  const router = useRouter();
  const { addToRecents } = useAnime();
  const [activeFilter, setActiveFilter] = useState(FILTER_OPTIONS[0]);

  const { data, isLoading, isFetching } = useQuery<AnimeApiResponse>({
    queryKey: ["top-anime", activeFilter.value],
    queryFn: () => fetchTopAnime(activeFilter.value),
  });

  const handleAnimePress = (anime: Anime) => {
    addToRecents(anime);
    router.push(`/anime/${anime.mal_id}`);
  };

  // Filter out items without proper mal_id and ensure unique keys
  const validData = data?.data?.filter((item: Anime) => item?.mal_id) || [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
          <Text style={styles.headerTitle}>Top Rated</Text>
          <Text style={styles.headerSubtitle}>List of Top Rated Anime</Text>
      </View>
      <View style={styles.filterContainer}>
        <FlatList
          data={FILTER_OPTIONS}
          keyExtractor={(item) => `filter-${item.id}`}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                activeFilter.id === item.id && styles.activeFilterChip
              ]}
              onPress={() => setActiveFilter(item)}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter.id === item.id && styles.activeFilterText
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.filterList}
        />
      </View>

      {isLoading || isFetching ? (
        <ActivityIndicator size="large" color="#7C4DFF" style={styles.loader} />
      ) : (
        <FlatList
          data={validData}
          keyExtractor={(item: Anime, index: number) => `top-${item.mal_id}-${index}`}
          renderItem={({ item, index }: { item: Anime; index: number }) => (
            <AnimeListItem
              anime={item}
              rank={index + 1}
              onPress={() => handleAnimePress(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
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
  filterContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#2A2A2A",
  },
  filterList: {
    paddingHorizontal: 16,
  },
  filterChip: {
    backgroundColor: "#2A2A2A",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  activeFilterChip: {
    backgroundColor: "#7C4DFF",
  },
  filterText: {
    color: "#fff",
    fontSize: 14,
  },
  activeFilterText: {
    fontWeight: "600",
  },
  listContent: {
    paddingBottom: 16,
  },
  loader: {
    marginTop: 40,
  },
});