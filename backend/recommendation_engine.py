"""
=============================================================================
  HOTSTAR Movie Recommendation Engine
  Content-Based Filtering using TF-IDF + Cosine Similarity
  Dataset: TMDB 5000 Movies (Kaggle)
=============================================================================
"""

import pandas as pd
import numpy as np
import json
import ast
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


class HotstarRecommendationEngine:
    """
    Content-based movie recommendation engine for Hotstar.
    
    Uses TF-IDF vectorization on combined features (genres, keywords, cast, 
    director, overview) and cosine similarity to find similar movies.
    """

    def __init__(self, movies_path, credits_path):
        self.movies_path = movies_path
        self.credits_path = credits_path
        self.movies_df = None
        self.tfidf_matrix = None
        self.cosine_sim = None
        self.title_to_index = {}
        self._load_and_preprocess()

    # ------------------------------------------------------------------
    #  Data Loading & Preprocessing
    # ------------------------------------------------------------------

    def _safe_parse_json(self, text):
        """Safely parse JSON-like strings from the CSV."""
        try:
            return json.loads(text.replace("'", '"')) if isinstance(text, str) else []
        except (json.JSONDecodeError, ValueError):
            try:
                return ast.literal_eval(text) if isinstance(text, str) else []
            except (ValueError, SyntaxError):
                return []

    def _extract_names(self, json_str, key="name", limit=None):
        """Extract name values from a JSON-like column."""
        parsed = self._safe_parse_json(json_str)
        names = [item.get(key, "") for item in parsed if isinstance(item, dict)]
        if limit:
            names = names[:limit]
        return " ".join(names)

    def _extract_director(self, crew_str):
        """Extract director name from crew JSON."""
        parsed = self._safe_parse_json(crew_str)
        for member in parsed:
            if isinstance(member, dict) and member.get("job") == "Director":
                return member.get("name", "")
        return ""

    def _load_and_preprocess(self):
        """Load CSV files, merge, clean, and build feature matrix."""
        # Load datasets
        movies = pd.read_csv(self.movies_path)
        credits = pd.read_csv(self.credits_path)

        # Merge on movie_id / id
        if "movie_id" in credits.columns:
            credits = credits.rename(columns={"movie_id": "id"})
        self.movies_df = movies.merge(credits, on="id", how="left")

        # Use the correct title column
        if "title_x" in self.movies_df.columns:
            self.movies_df["title"] = self.movies_df["title_x"]

        # Fill NaN
        for col in ["overview", "genres", "keywords", "cast", "crew"]:
            if col in self.movies_df.columns:
                self.movies_df[col] = self.movies_df[col].fillna("")

        # Extract features
        self.movies_df["genre_str"] = self.movies_df["genres"].apply(
            lambda x: self._extract_names(x)
        )
        self.movies_df["keyword_str"] = self.movies_df["keywords"].apply(
            lambda x: self._extract_names(x)
        )
        self.movies_df["cast_str"] = self.movies_df["cast"].apply(
            lambda x: self._extract_names(x, limit=5)
        )
        self.movies_df["director"] = self.movies_df["crew"].apply(
            self._extract_director
        )

        # Parse release year
        self.movies_df["year"] = pd.to_datetime(
            self.movies_df["release_date"], errors="coerce"
        ).dt.year.fillna(0).astype(int)

        # Build combined feature soup
        self.movies_df["soup"] = (
            self.movies_df["genre_str"] + " " +
            self.movies_df["keyword_str"] + " " +
            self.movies_df["cast_str"] + " " +
            self.movies_df["director"] + " " +
            self.movies_df["overview"].fillna("")
        ).str.lower()

        # Drop duplicates on title
        self.movies_df = self.movies_df.drop_duplicates(subset="title").reset_index(drop=True)

        # Build title-to-index mapping
        self.title_to_index = {
            title.lower(): idx
            for idx, title in enumerate(self.movies_df["title"])
        }

        # ── TF-IDF Vectorization ──
        tfidf = TfidfVectorizer(stop_words="english", max_features=15000)
        self.tfidf_matrix = tfidf.fit_transform(self.movies_df["soup"])

        # ── Cosine Similarity Matrix ──
        self.cosine_sim = cosine_similarity(self.tfidf_matrix, self.tfidf_matrix)

        print(f"[Engine] Loaded {len(self.movies_df)} movies. "
              f"TF-IDF matrix shape: {self.tfidf_matrix.shape}")

    # ------------------------------------------------------------------
    #  Recommendation Methods
    # ------------------------------------------------------------------

    def recommend(self, title, n=12):
        """
        Get top-N similar movies for a given title.
        Returns list of movie dicts.
        """
        idx = self.title_to_index.get(title.lower())
        if idx is None:
            return []

        sim_scores = list(enumerate(self.cosine_sim[idx]))
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
        # Skip first (itself)
        sim_scores = sim_scores[1: n + 1]

        movie_indices = [i[0] for i in sim_scores]
        similarity_pcts = [round(float(i[1]) * 100, 1) for i in sim_scores]

        results = []
        for rank, (m_idx, sim_pct) in enumerate(zip(movie_indices, similarity_pcts)):
            row = self.movies_df.iloc[m_idx]
            results.append(self._movie_to_dict(row, sim_pct, rank + 1))
        return results

    def get_trending(self, n=20):
        """Return top-N movies by popularity score."""
        top = self.movies_df.nlargest(n, "popularity")
        return [self._movie_to_dict(row) for _, row in top.iterrows()]

    def get_top_rated(self, n=20):
        """Return top-N movies by vote average (min 100 votes)."""
        filtered = self.movies_df[self.movies_df["vote_count"] >= 100]
        top = filtered.nlargest(n, "vote_average")
        return [self._movie_to_dict(row) for _, row in top.iterrows()]

    def get_by_genre(self, genre, n=20):
        """Return top-N movies for a specific genre."""
        mask = self.movies_df["genre_str"].str.contains(genre, case=False, na=False)
        filtered = self.movies_df[mask].nlargest(n, "popularity")
        return [self._movie_to_dict(row) for _, row in filtered.iterrows()]

    def search(self, query, n=20):
        """Search movies by title substring."""
        mask = self.movies_df["title"].str.contains(query, case=False, na=False)
        results = self.movies_df[mask].head(n)
        return [self._movie_to_dict(row) for _, row in results.iterrows()]

    def get_all_genres(self):
        """Return sorted list of all unique genres."""
        all_genres = set()
        for gs in self.movies_df["genre_str"]:
            for g in gs.split():
                if g:
                    all_genres.add(g)
        return sorted(all_genres)

    def get_movie_details(self, movie_id):
        """Get full details for a specific movie by ID."""
        row = self.movies_df[self.movies_df["id"] == movie_id]
        if row.empty:
            return None
        return self._movie_to_dict(row.iloc[0])

    def get_genres_list(self):
        """Return list of unique genre names extracted properly."""
        genres_set = set()
        for g_str in self.movies_df["genres"]:
            parsed = self._safe_parse_json(g_str)
            for g in parsed:
                if isinstance(g, dict) and "name" in g:
                    genres_set.add(g["name"])
        return sorted(genres_set)

    # ------------------------------------------------------------------
    #  Helper
    # ------------------------------------------------------------------

    def _movie_to_dict(self, row, similarity=None, rank=None):
        """Convert a DataFrame row to a clean dictionary."""
        genres = self._safe_parse_json(row.get("genres", "[]"))
        genre_names = [g["name"] for g in genres if isinstance(g, dict) and "name" in g]

        movie = {
            "id": int(row["id"]),
            "title": str(row["title"]),
            "overview": str(row.get("overview", "")),
            "genres": genre_names,
            "genre_str": ", ".join(genre_names),
            "vote_average": float(row.get("vote_average", 0)),
            "vote_count": int(row.get("vote_count", 0)),
            "popularity": float(row.get("popularity", 0)),
            "release_date": str(row.get("release_date", "")),
            "year": int(row.get("year", 0)),
            "runtime": int(row.get("runtime", 0)) if pd.notna(row.get("runtime")) else 0,
            "director": str(row.get("director", "")),
            "cast": str(row.get("cast_str", "")),
            "tagline": str(row.get("tagline", "")) if pd.notna(row.get("tagline")) else "",
            "poster": f"https://image.tmdb.org/t/p/w500/{row['id']}.jpg",  # placeholder
        }
        if similarity is not None:
            movie["similarity"] = similarity
        if rank is not None:
            movie["rank"] = rank
        return movie
