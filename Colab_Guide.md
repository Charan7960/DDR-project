# 🚀 How to Run the Hotstar Project in Google Colab

## What You Need to Upload

You need **3 files total** — here's where they are on your computer:

| File | Location | Size |
|---|---|---|
| **Notebook** | `Desktop\DDR_HOTSTAR\Hotstar_Recommendation_System.ipynb` | 55 KB |
| **Movies CSV** | `Desktop\DDR_HOTSTAR\data\tmdb_5000_movies.csv` | 5.7 MB |
| **Credits CSV** | `Desktop\DDR_HOTSTAR\data\tmdb_5000_credits.csv` | 40 MB |

---

## Step-by-Step Instructions

### Step 1: Open Google Colab
Go to **[colab.research.google.com](https://colab.research.google.com)**

### Step 2: Upload the Notebook
1. Click **File → Upload notebook**
2. Select `Hotstar_Recommendation_System.ipynb` from `Desktop\DDR_HOTSTAR\`
3. The notebook will open with all 37 cells ready

### Step 3: Run Cell by Cell
Click the **▶ Play button** on each cell, or use **Shift + Enter** to run cells one by one:

| Cell | What It Does |
|---|---|
| **Cell 1** | Installs pandas, scikit-learn, matplotlib, seaborn, wordcloud |
| **Cell 2** | **Asks you to upload the 2 CSV files** — upload `tmdb_5000_movies.csv` and `tmdb_5000_credits.csv` |
| **Cell 3-4** | Loads and explores the dataset (4800 movies) |
| **Cell 5** | Data preprocessing — merges movies + credits |
| **Cell 6** | Feature engineering — extracts genres, cast, director, creates "soup" |
| **Cell 7-8** | Visualizations — rating distribution, genre chart, word cloud |
| **Cell 9-10** | **TF-IDF Vectorization** — converts text to 15,000-dim vectors |
| **Cell 11-12** | **Cosine Similarity** — builds 4800×4800 similarity matrix + heatmap |
| **Cell 13** | Creates the `recommend()` function |
| **Cell 14-17** | Tests recommendations for Avatar, Dark Knight, Inception, Titanic |
| **Cell 18** | Visualizes recommendations as bar charts |
| **Cell 19** | **Interactive dropdown widget** — select any movie, get recommendations |
| **Cell 20-21** | **Embedded 3D Hotstar frontend** — renders the full UI inside Colab! |

### Step 4: When the CSV Upload Popup Appears
When you run Cell 2, a **file upload dialog** will appear:
1. Click **Choose Files**
2. Navigate to `Desktop\DDR_HOTSTAR\data\`
3. Select **both** CSV files
4. Wait for upload to complete (~30 seconds for the 40MB credits file)

> [!TIP]
> **Faster alternative**: Upload the CSVs to Google Drive first, then mount Drive in Colab. Change the path in Cell 2 from `'data/tmdb_5000_movies.csv'` to `'/content/drive/MyDrive/tmdb_5000_movies.csv'`

---

## What You'll See in Colab

### 📊 Visualizations (auto-generated)
- Rating distribution histogram
- Top 10 genres bar chart
- Movies per year timeline
- Popularity vs Rating scatter plot
- Word cloud of movie features
- TF-IDF feature importance bar chart
- **Cosine similarity heatmap** (top 20 movies)
- Recommendation bar charts

### 🤖 Interactive Widgets
- Dropdown to select any movie from 4800 titles
- Slider to choose how many recommendations (5-20)
- Click button → instant recommendations + chart

### 🎬 Embedded 3D Frontend
- Full Hotstar-themed UI rendered inside the notebook
- Three.js starfield background
- Trending & Top Rated carousels
- Working recommendation search box
- ML pipeline visualization

---

## Quick Shortcut: Run All at Once

After uploading the CSV files, you can run everything at once:
- Click **Runtime → Run all** (or `Ctrl + F9`)

> [!IMPORTANT]
> Make sure you upload the CSV files when prompted in Cell 2, otherwise subsequent cells will fail.

---

## Troubleshooting

| Issue | Fix |
|---|---|
| `FileNotFoundError` | You haven't uploaded the CSVs yet — run Cell 2 and upload them |
| `ModuleNotFoundError: wordcloud` | Run Cell 1 first to install dependencies |
| Three.js not rendering | This is normal in some Colab versions — the ML results still work |
| Kernel crashes | Go to **Runtime → Change runtime type → Select GPU** for more RAM |
