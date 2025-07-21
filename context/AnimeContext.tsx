import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Anime } from "@/types/anime";

export const [AnimeProvider, useAnime] = createContextHook(() => {
  const [favorites, setFavorites] = useState<Anime[]>([]);
  const [recents, setRecents] = useState<Anime[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from AsyncStorage on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const favoritesData = await AsyncStorage.getItem("anime_favorites");
        const recentsData = await AsyncStorage.getItem("anime_recents");
        
        if (favoritesData) {
          setFavorites(JSON.parse(favoritesData));
        }
        
        if (recentsData) {
          setRecents(JSON.parse(recentsData));
        }
      } catch (error) {
        console.error("Error loading data from AsyncStorage:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Save favorites to AsyncStorage whenever it changes
  useEffect(() => {
    const saveFavorites = async () => {
      try {
        await AsyncStorage.setItem("anime_favorites", JSON.stringify(favorites));
      } catch (error) {
        console.error("Error saving favorites to AsyncStorage:", error);
      }
    };
    
    if (!isLoading) {
      saveFavorites();
    }
  }, [favorites, isLoading]);

  // Save recents to AsyncStorage whenever it changes
  useEffect(() => {
    const saveRecents = async () => {
      try {
        await AsyncStorage.setItem("anime_recents", JSON.stringify(recents));
      } catch (error) {
        console.error("Error saving recents to AsyncStorage:", error);
      }
    };
    
    if (!isLoading) {
      saveRecents();
    }
  }, [recents, isLoading]);

  // Add or remove anime from favorites
  const toggleFavorite = (anime: Anime) => {
    setFavorites(prev => {
      const exists = prev.some(item => item.mal_id === anime.mal_id);
      
      if (exists) {
        return prev.filter(item => item.mal_id !== anime.mal_id);
      } else {
        return [...prev, anime];
      }
    });
  };

  // Add anime to recents
  const addToRecents = (anime: Anime) => {
    setRecents(prev => {
      // Remove if already exists
      const filtered = prev.filter(item => item.mal_id !== anime.mal_id);
      
      // Add to the beginning and limit to 10 items
      return [anime, ...filtered].slice(0, 10);
    });
  };

  return {
    favorites,
    recents,
    isLoading,
    toggleFavorite,
    addToRecents,
  };
});