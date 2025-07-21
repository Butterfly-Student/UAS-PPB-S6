export interface AnimeImage {
  image_url: string;
  small_image_url?: string;
  large_image_url?: string;
}

export interface AnimeImages {
  jpg: AnimeImage;
  webp?: AnimeImage;
}

export interface AnimeGenre {
  mal_id: number;
  name: string;
  type: string;
  url: string;
}

export interface AnimeTrailer {
  youtube_id?: string;
  url?: string;
  embed_url?: string;
}

export interface AnimeAired {
  from?: string;
  to?: string;
  prop?: {
    from: {
      day?: number;
      month?: number;
      year?: number;
    };
    to: {
      day?: number;
      month?: number;
      year?: number;
    };
  };
  string?: string;
}

export interface AnimeBroadcast {
  day?: string;
  time?: string;
  timezone?: string;
  string?: string;
}

export interface AnimeExternalLink {
  name: string;
  url: string;
}

export interface AnimeCharacterImage {
  jpg: {
    image_url: string;
  };
}

export interface AnimeCharacter {
  mal_id: number;
  name: string;
  images: AnimeCharacterImage;
}

export interface AnimeCharacterData {
  character: AnimeCharacter;
  role?: string;
  voice_actors?: any[];
}

export interface Anime {
  mal_id: number;
  title: string;
  title_english?: string;
  title_japanese?: string;
  images: AnimeImages;
  type?: string;
  source?: string;
  episodes?: number;
  status?: string;
  airing?: boolean;
  aired?: AnimeAired;
  duration?: string;
  rating?: string;
  score?: number;
  scored_by?: number;
  rank?: number;
  popularity?: number;
  members?: number;
  favorites?: number;
  synopsis?: string;
  background?: string;
  season?: string;
  year?: number;
  broadcast?: AnimeBroadcast;
  producers?: AnimeGenre[];
  licensors?: AnimeGenre[];
  studios?: AnimeGenre[];
  genres?: AnimeGenre[];
  explicit_genres?: AnimeGenre[];
  themes?: AnimeGenre[];
  demographics?: AnimeGenre[];
  trailer?: AnimeTrailer;
  external?: AnimeExternalLink[];
}

export interface AnimeApiResponse {
  data: Anime[];
  pagination?: {
    last_visible_page: number;
    has_next_page: boolean;
    current_page: number;
    items: {
      count: number;
      total: number;
      per_page: number;
    };
  };
}

export interface AnimeDetailsResponse {
  data: Anime;
}

export interface AnimeCharactersResponse {
  data: AnimeCharacterData[];
}

export interface GenreApiResponse {
  data: AnimeGenre[];
}