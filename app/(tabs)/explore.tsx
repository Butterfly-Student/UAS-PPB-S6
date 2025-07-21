import React, { useState } from "react";
import { StyleSheet, Text, View, FlatList, TextInput, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { fetchAnimeGenres, searchAnime } from "@/api/animeApi";
import { AnimeCard } from "@/components/AnimeCard";
import { useAnime } from "@/context/AnimeContext";
import { Search as SearchIcon, X } from "lucide-react-native";
import { Anime, AnimeGenre, AnimeApiResponse, GenreApiResponse } from "@/types/anime";

export default function ExploreScreen() {
  const router = useRouter();
  const { addToRecents } = useAnime();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<AnimeGenre | null>(null);

  const { data: genresData, isLoading: genresLoading } = useQuery<GenreApiResponse>({
    queryKey: ["genres"],
    queryFn: fetchAnimeGenres,
  });

  const { data: searchData, isLoading: searchLoading, refetch: refetchSearch } = useQuery<AnimeApiResponse>({
    queryKey: ["search", searchQuery, selectedGenre],
    queryFn: () => searchAnime(searchQuery, selectedGenre?.mal_id),
    enabled: searchQuery.length > 2 || !!selectedGenre,
  });

  const handleSearch = () => {
    if (searchQuery.length > 2 || selectedGenre) {
      refetchSearch();
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSelectedGenre(null);
  };

  const handleGenreSelect = (genre: AnimeGenre) => {
    if (selectedGenre?.mal_id === genre.mal_id) {
      setSelectedGenre(null);
    } else {
      setSelectedGenre(genre);
    }
  };

  const handleAnimePress = (anime: Anime) => {
    addToRecents(anime);
    router.push(`/anime/${anime.mal_id}`);
  };

  // Filter out items without proper mal_id and ensure unique keys
  const validGenres = genresData?.data?.filter((item: AnimeGenre) => item?.mal_id) || [];
  const validSearchResults = searchData?.data?.filter((item: Anime) => item?.mal_id) || [];

  const renderGenreItem = ({ item }: { item: AnimeGenre }) => (
    <TouchableOpacity
      style={[
        styles.genreChip,
        selectedGenre?.mal_id === item.mal_id && styles.selectedGenreChip
      ]}
      onPress={() => handleGenreSelect(item)}
      activeOpacity={0.8}
    >
      <Text
        style={[
          styles.genreText,
          selectedGenre?.mal_id === item.mal_id && styles.selectedGenreText
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderAnimeItem = ({ item }: { item: Anime }) => (
    <View style={styles.cardContainer}>
      <AnimeCard
        anime={item}
        onPress={() => handleAnimePress(item)}
        style={styles.card}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore Anime</Text>
        <Text style={styles.headerSubtitle}>Discover new series and movies</Text>
      </View>

      {/* Search Section */}
      <View style={styles.searchSection}>
        <View style={styles.searchInputContainer}>
          <SearchIcon size={20} color="#8E8E93" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search anime titles..."
            placeholderTextColor="#8E8E93"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {(searchQuery.length > 0 || selectedGenre) && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <X size={18} color="#8E8E93" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[styles.searchButton, (!searchQuery && !selectedGenre) && styles.searchButtonDisabled]}
          onPress={handleSearch}
          disabled={!searchQuery && !selectedGenre}
        >
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* Genres Section */}
      <View style={styles.genresSection}>
        <Text style={styles.sectionTitle}>Browse by Genre</Text>

        {genresLoading ? (
          <View style={styles.genresLoader}>
            <ActivityIndicator size="small" color="#7C4DFF" />
            <Text style={styles.loadingText}>Loading genres...</Text>
          </View>
        ) : (
          <FlatList
            data={validGenres}
            keyExtractor={(item: AnimeGenre, index: number) => `genre-${item.mal_id}-${index}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={renderGenreItem}
            contentContainerStyle={styles.genreList}
            ItemSeparatorComponent={() => <View style={styles.genreSeparator} />}
          />
        )}
      </View>

      {/* Results Section */}
      <View style={styles.resultsSection}>
        {searchLoading ? (
          <View style={styles.resultsLoader}>
            <ActivityIndicator size="large" color="#7C4DFF" />
            <Text style={styles.loadingText}>Searching anime...</Text>
          </View>
        ) : validSearchResults.length > 0 ? (
          <>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsTitle}>
                {searchQuery ? `Results for "${searchQuery}"` : `${selectedGenre?.name} Anime`}
              </Text>
              <Text style={styles.resultsCount}>
                {validSearchResults.length} results found
              </Text>
            </View>
            <FlatList
              data={validSearchResults}
              keyExtractor={(item: Anime, index: number) => `search-${item.mal_id}-${index}`}
              numColumns={2}
              renderItem={renderAnimeItem}
              contentContainerStyle={styles.resultsContainer}
              columnWrapperStyle={styles.row}
              showsVerticalScrollIndicator={false}
            />
          </>
        ) : searchQuery.length > 2 || selectedGenre ? (
          <View style={styles.noResultsContainer}>
            <Text style={styles.noResultsText}>No results found</Text>
            <Text style={styles.noResultsSubtext}>
              Try a different search term or select another genre
            </Text>
            <TouchableOpacity style={styles.clearFiltersButton} onPress={clearSearch}>
              <Text style={styles.clearFiltersText}>Clear Filters</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.initialStateContainer}>
            <Text style={styles.initialStateText}>Search for anime or select a genre to explore</Text>
            <Text style={styles.initialStateSubtext}>
              Discover thousands of anime series and movies
            </Text>
          </View>
        )}
      </View>
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
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2A2A2A",
    borderRadius: 12,
    paddingHorizontal: 16,
    marginRight: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
  },
  clearButton: {
    padding: 8,
  },
  searchButton: {
    backgroundColor: "#7C4DFF",
    borderRadius: 12,
    justifyContent: "center",
    paddingHorizontal: 20,
    height: 48,
  },
  searchButtonDisabled: {
    backgroundColor: "#3A3A3A",
  },
  searchButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  genresSection: {
    paddingVertical: 16,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  genresLoader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  loadingText: {
    color: "#8E8E93",
    marginLeft: 8,
    fontSize: 14,
  },
  genreList: {
    paddingHorizontal: 16,
  },
  genreSeparator: {
    width: 8,
  },
  genreChip: {
    backgroundColor: "#2A2A2A",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#3A3A3A",
  },
  selectedGenreChip: {
    backgroundColor: "#7C4DFF",
    borderColor: "#7C4DFF",
  },
  genreText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  selectedGenreText: {
    fontWeight: "600",
  },
  resultsSection: {
    flex: 1,
    paddingHorizontal: 16,
  },
  resultsHeader: {
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#2A2A2A",
  },
  resultsTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  resultsCount: {
    color: "#8E8E93",
    fontSize: 14,
  },
  resultsLoader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  resultsContainer: {
    paddingBottom: 20,
  },
  row: {
    justifyContent: "space-between",
  },
  cardContainer: {
    width: "48%",
    marginBottom: 16,
  },
  card: {
    width: "100%",
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  noResultsText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  noResultsSubtext: {
    color: "#8E8E93",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
  },
  clearFiltersButton: {
    backgroundColor: "#7C4DFF",
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  clearFiltersText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  initialStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  initialStateText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 8,
  },
  initialStateSubtext: {
    color: "#8E8E93",
    fontSize: 16,
    textAlign: "center",
  },
});