"""
=============================================================================
  HOTSTAR Recommendation System — Flask API Server
  Serves movie data and recommendations to the frontend
=============================================================================
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
from recommendation_engine import HotstarRecommendationEngine
import os

app = Flask(__name__)
CORS(app)

# ── Initialize the recommendation engine ──
DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
engine = HotstarRecommendationEngine(
    movies_path=os.path.join(DATA_DIR, "tmdb_5000_movies.csv"),
    credits_path=os.path.join(DATA_DIR, "tmdb_5000_credits.csv"),
)


# ═══════════════════════════════════════════════════════════════════
#  API Endpoints
# ═══════════════════════════════════════════════════════════════════


@app.route("/api/trending", methods=["GET"])
def trending():
    """Get trending movies."""
    n = request.args.get("n", 20, type=int)
    return jsonify(engine.get_trending(n))


@app.route("/api/top-rated", methods=["GET"])
def top_rated():
    """Get top-rated movies."""
    n = request.args.get("n", 20, type=int)
    return jsonify(engine.get_top_rated(n))


@app.route("/api/genre/<genre>", methods=["GET"])
def by_genre(genre):
    """Get movies by genre."""
    n = request.args.get("n", 20, type=int)
    return jsonify(engine.get_by_genre(genre, n))


@app.route("/api/genres", methods=["GET"])
def genres():
    """Get all available genres."""
    return jsonify(engine.get_genres_list())


@app.route("/api/recommend", methods=["GET"])
def recommend():
    """Get movie recommendations given a title."""
    title = request.args.get("title", "")
    n = request.args.get("n", 12, type=int)
    if not title:
        return jsonify({"error": "title parameter is required"}), 400
    results = engine.recommend(title, n)
    if not results:
        return jsonify({"error": f"Movie '{title}' not found. Try a different title."}), 404
    return jsonify(results)


@app.route("/api/search", methods=["GET"])
def search():
    """Search movies by title."""
    q = request.args.get("q", "")
    n = request.args.get("n", 20, type=int)
    if not q:
        return jsonify([])
    return jsonify(engine.search(q, n))


@app.route("/api/movie/<int:movie_id>", methods=["GET"])
def movie_details(movie_id):
    """Get details for a specific movie."""
    movie = engine.get_movie_details(movie_id)
    if not movie:
        return jsonify({"error": "Movie not found"}), 404
    return jsonify(movie)


@app.route("/api/health", methods=["GET"])
def health():
    """Health check."""
    return jsonify({
        "status": "ok",
        "total_movies": len(engine.movies_df),
        "engine": "Content-Based (TF-IDF + Cosine Similarity)",
    })


# ═══════════════════════════════════════════════════════════════════
if __name__ == "__main__":
    print("\n[*] HOTSTAR Recommendation API running at http://localhost:5000\n")
    app.run(debug=True, port=5000)
