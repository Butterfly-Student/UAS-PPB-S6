import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Linking,
  Alert
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { fetchAnimeDetails, fetchAnimeCharacters } from "@/api/animeApi";
import { useAnime } from "@/context/AnimeContext";
import { Heart, ExternalLink, Star, Calendar, Clock, Play } from "lucide-react-native";
import { Anime, AnimeDetailsResponse, AnimeCharactersResponse, AnimeGenre, AnimeCharacterData, AnimeExternalLink } from "@/types/anime";

const { width } = Dimensions.get("window");

export default function AnimeDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { favorites, toggleFavorite } = useAnime();
  const [isFavorite, setIsFavorite] = useState(false);

  const { data: animeData, isLoading: animeLoading } = useQuery<AnimeDetailsResponse>({
    queryKey: ["anime", id],
    queryFn: () => fetchAnimeDetails(id as string),
  });

  const { data: charactersData, isLoading: charactersLoading } = useQuery<AnimeCharactersResponse>({
    queryKey: ["anime-characters", id],
    queryFn: () => fetchAnimeCharacters(id as string),
  });

  const anime = animeData?.data;

  useEffect(() => {
    if (anime) {
      const found = favorites.some(fav => fav.mal_id === anime.mal_id);
      setIsFavorite(found);
    }
  }, [favorites, anime]);

  const handleFavoritePress = () => {
    if (anime) {
      const wasAlreadyFavorite = isFavorite;
      toggleFavorite(anime);

      // Show toast notification
      if (wasAlreadyFavorite) {
        Alert.alert(
          "Removed from Favorites",
          `${anime.title} has been removed from your favorites.`,
          [{ text: "OK", style: "default" }]
        );
      } else {
        Alert.alert(
          "Added to Favorites",
          `${anime.title} has been added to your favorites!`,
          [{ text: "OK", style: "default" }]
        );
      }
    }
  };

  const handleTrailerPress = () => {
    if (anime?.trailer?.url) {
      Linking.openURL(anime.trailer.url);
    }
  };

  if (animeLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C4DFF" />
      </View>
    );
  }

  if (!anime) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load anime details</Text>
      </View>
    );
  }

  // Filter out characters without proper mal_id and ensure unique keys
  const validCharacters = charactersData?.data?.filter((item: AnimeCharacterData) => item?.character?.mal_id) || [];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.headerContainer}>
        <Image
          source={{ uri: anime.images.jpg.large_image_url || anime.images.jpg.image_url }}
          style={styles.headerImage}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)', '#121212']}
          style={styles.headerGradient}
        />
        <View style={styles.favoriteButton}>
          <TouchableOpacity
            style={[
              styles.iconButton,
              isFavorite && styles.favoriteActive
            ]}
            onPress={handleFavoritePress}
          >
            <Heart
              size={22}
              color={isFavorite ? "#fff" : "#7C4DFF"}
              fill={isFavorite ? "#7C4DFF" : "transparent"}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.title}>{anime.title || "Unknown Title"}</Text>
        {anime.title_english && anime.title_english !== anime.title && (
          <Text style={styles.englishTitle}>{anime.title_english}</Text>
        )}

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Star size={16} color="#FFD700" />
            <Text style={styles.statText}>{anime.score || "N/A"}</Text>
          </View>
          <View style={styles.statItem}>
            <Calendar size={16} color="#7C4DFF" />
            <Text style={styles.statText}>{anime.year || "N/A"}</Text>
          </View>
          <View style={styles.statItem}>
            <Clock size={16} color="#7C4DFF" />
            <Text style={styles.statText}>{anime.episodes ? `${anime.episodes} ep` : "? ep"}</Text>
          </View>
          <View style={styles.statBadge}>
            <Text style={styles.statBadgeText}>{anime.rating || "N/A"}</Text>
          </View>
        </View>

        {anime.genres && anime.genres.length > 0 && (
          <View style={styles.genresContainer}>
            {anime.genres.map((genre: AnimeGenre, index: number) => (
              <View key={`genre-${genre.mal_id}-${index}`} style={styles.genreChip}>
                <Text style={styles.genreText}>{genre.name}</Text>
              </View>
            ))}
          </View>
        )}

        {anime.trailer?.url && (
          <TouchableOpacity
            style={styles.trailerButton}
            onPress={handleTrailerPress}
          >
            <Play size={16} color="#fff" />
            <Text style={styles.trailerButtonText}>Watch Trailer</Text>
          </TouchableOpacity>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Synopsis</Text>
          <Text style={styles.synopsis}>{anime.synopsis || "No synopsis available."}</Text>
        </View>

        {anime.background && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Background</Text>
            <Text style={styles.synopsis}>{anime.background}</Text>
          </View>
        )}

        {!charactersLoading && validCharacters.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Characters</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.charactersContainer}
            >
              {validCharacters.slice(0, 10).map((character: AnimeCharacterData, index: number) => (
                <View key={`character-${character.character.mal_id}-${index}`} style={styles.characterCard}>
                  <Image
                    source={{ uri: character.character.images.jpg.image_url }}
                    style={styles.characterImage}
                  />
                  <Text style={styles.characterName} numberOfLines={2}>
                    {character.character.name}
                  </Text>
                  {character.role && (
                    <Text style={styles.characterRole}>{character.role}</Text>
                  )}
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {anime.external && anime.external.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>External Links</Text>
            <View style={styles.linksContainer}>
              {anime.external.map((link: AnimeExternalLink, index: number) => (
                <TouchableOpacity
                  key={`link-${index}`}
                  style={styles.externalLink}
                  onPress={() => Linking.openURL(link.url)}
                >
                  <ExternalLink size={14} color="#7C4DFF" />
                  <Text style={styles.externalLinkText}>{link.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status</Text>
            <Text style={styles.infoValue}>{anime.status || "Unknown"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Aired</Text>
            <Text style={styles.infoValue}>{anime.aired?.string || "N/A"}</Text>
          </View>
          {anime.broadcast?.string && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Broadcast</Text>
              <Text style={styles.infoValue}>{anime.broadcast.string}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Source</Text>
            <Text style={styles.infoValue}>{anime.source || "N/A"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Duration</Text>
            <Text style={styles.infoValue}>{anime.duration || "N/A"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Season</Text>
            <Text style={styles.infoValue}>
              {anime.season ? `${anime.season.charAt(0).toUpperCase() + anime.season.slice(1)} ${anime.year}` : "N/A"}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
    padding: 20,
  },
  errorText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
  headerContainer: {
    height: 450,
    width: "100%",
    position: "relative",
  },
  headerImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  headerGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "50%",
  },
  favoriteButton: {
    position: "absolute",
    top: 60,
    right: 20,
    zIndex: 10,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(18, 18, 18, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  favoriteActive: {
    backgroundColor: "#7C4DFF",
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  englishTitle: {
    color: "#B0B0B0",
    fontSize: 16,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    flexWrap: "wrap",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    marginBottom: 8,
  },
  statText: {
    color: "#fff",
    marginLeft: 6,
    fontSize: 14,
  },
  statBadge: {
    backgroundColor: "#2A2A2A",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8,
  },
  statBadgeText: {
    color: "#fff",
    fontSize: 12,
  },
  genresContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  genreChip: {
    backgroundColor: "rgba(124, 77, 255, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  genreText: {
    color: "#7C4DFF",
    fontSize: 12,
    fontWeight: "500",
  },
  trailerButton: {
    backgroundColor: "#7C4DFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  trailerButtonText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  synopsis: {
    color: "#B0B0B0",
    fontSize: 15,
    lineHeight: 22,
  },
  charactersContainer: {
    paddingRight: 20,
  },
  characterCard: {
    width: 100,
    marginRight: 12,
  },
  characterImage: {
    width: 100,
    height: 140,
    borderRadius: 8,
    marginBottom: 8,
  },
  characterName: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 2,
  },
  characterRole: {
    color: "#7C4DFF",
    fontSize: 12,
  },
  linksContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  externalLink: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(124, 77, 255, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  externalLinkText: {
    color: "#7C4DFF",
    marginLeft: 6,
    fontSize: 13,
  },
  infoSection: {
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#2A2A2A",
  },
  infoLabel: {
    color: "#8E8E93",
    width: 100,
    fontSize: 14,
  },
  infoValue: {
    color: "#fff",
    flex: 1,
    fontSize: 14,
  },
});