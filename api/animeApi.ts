import { AnimeApiResponse, AnimeDetailsResponse, AnimeCharactersResponse, GenreApiResponse } from "@/types/anime";

const BASE_URL = "https://api.jikan.moe/v4";

// Add delay to avoid rate limiting - increased delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to handle API requests with rate limiting and retries
const fetchWithDelay = async (endpoint: string, retries = 3): Promise<any> => {
  for (let i = 0; i < retries; i++) {
    try {
      // Add longer delay between requests
      if (i > 0) {
        await delay(3000 * i); // Exponential backoff
      }
      
      const response = await fetch(`${BASE_URL}${endpoint}`);
      
      if (response.status === 429) {
        // Rate limited, wait longer and retry
        console.log(`Rate limited, retrying in ${5000 * (i + 1)}ms...`);
        await delay(5000 * (i + 1));
        continue;
      }
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      await delay(2000); // Add delay after successful request
      return data;
    } catch (error) {
      console.error(`API request error (attempt ${i + 1}):`, error);
      
      if (i === retries - 1) {
        // Last retry failed, return empty data structure
        return { data: [] };
      }
      
      // Wait before retrying
      await delay(3000 * (i + 1));
    }
  }
  
  // Fallback return
  return { data: [] };
};

// Fetch seasonal anime
export const fetchSeasonalAnime = (): Promise<AnimeApiResponse> => {
  return fetchWithDelay("/seasons/now");
};

// Fetch top anime by type
export const fetchTopAnime = (type = "all"): Promise<AnimeApiResponse> => {
  // Map filter types to correct API parameters
  const typeMap: { [key: string]: string } = {
    "all": "",
    "airing": "?filter=airing",
    "upcoming": "?filter=upcoming", 
    "bypopularity": "?filter=bypopularity",
    "favorite": "?filter=favorite"
  };
  
  const filterParam = typeMap[type] || "";
  return fetchWithDelay(`/top/anime${filterParam}`);
};

// Fetch recently updated anime
export const fetchRecentAnime = (): Promise<AnimeApiResponse> => {
  return fetchWithDelay("/anime?order_by=start_date&sort=desc&limit=10&status=airing");
};

// Fetch anime by ID
export const fetchAnimeDetails = (id: string): Promise<AnimeDetailsResponse> => {
  return fetchWithDelay(`/anime/${id}/full`);
};

// Fetch anime characters
export const fetchAnimeCharacters = (id: string): Promise<AnimeCharactersResponse> => {
  return fetchWithDelay(`/anime/${id}/characters`);
};

// Search anime
export const searchAnime = (query: string, genreId?: number): Promise<AnimeApiResponse> => {
  let endpoint = `/anime?q=${encodeURIComponent(query)}&sfw=true&limit=20`;
  
  if (genreId) {
    endpoint += `&genres=${genreId}`;
  }
  
  return fetchWithDelay(endpoint);
};

// Fetch anime genres
export const fetchAnimeGenres = (): Promise<GenreApiResponse> => {
  return fetchWithDelay("/genres/anime");
};