/* ═══════════════════════════════════════════════════════════════════
   HOTSTAR AI — Movie Recommendation System
   Frontend Application Logic
   Three.js 3D Background + GSAP Scroll Animations + API Integration
   ═══════════════════════════════════════════════════════════════════ */

const API_BASE = "http://localhost:5000/api";

// Genre emoji mapping
const GENRE_EMOJIS = {
    Action: "💥", Adventure: "🗺️", Animation: "🎨", Comedy: "😂",
    Crime: "🔪", Documentary: "📹", Drama: "🎭", Family: "👨‍👩‍👧‍👦",
    Fantasy: "🧙", History: "📜", Horror: "👻", Music: "🎵",
    Mystery: "🔍", Romance: "💕", "Science Fiction": "🚀",
    "TV Movie": "📺", Thriller: "😰", War: "⚔️", Western: "🤠"
};

// Poster gradient colors for movie cards
const POSTER_GRADIENTS = [
    ["#1a0533", "#4a148c"], ["#0d2137", "#1565c0"], ["#2d0a1e", "#880e4f"],
    ["#0a2d1a", "#1b5e20"], ["#2d2a0a", "#f57f17"], ["#1a0a2d", "#6a1b9a"],
    ["#2d0a0a", "#b71c1c"], ["#0a1a2d", "#0d47a1"], ["#0d2d2d", "#00695c"],
    ["#2d1a0a", "#e65100"], ["#1a102d", "#4527a0"], ["#2d0d1a", "#ad1457"],
];

// ═══════════════════════════════════════════════════════════════════
//  THREE.JS — 3D STARFIELD BACKGROUND
// ═══════════════════════════════════════════════════════════════════

let scene, camera, renderer, stars, nebulaClouds;

function initThreeJS() {
    const canvas = document.getElementById("three-canvas");
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.z = 500;

    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // ── Stars ──
    const starsGeometry = new THREE.BufferGeometry();
    const starsCount = 6000;
    const positions = new Float32Array(starsCount * 3);
    const colors = new Float32Array(starsCount * 3);
    const sizes = new Float32Array(starsCount);

    const colorPalette = [
        new THREE.Color("#00d4ff"),
        new THREE.Color("#7b2ff7"),
        new THREE.Color("#ff2d55"),
        new THREE.Color("#ffffff"),
        new THREE.Color("#ff9500"),
    ];

    for (let i = 0; i < starsCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 2000;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 2000;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 2000;

        const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;

        sizes[i] = Math.random() * 3 + 0.5;
    }

    starsGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    starsGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    starsGeometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    const starsMaterial = new THREE.PointsMaterial({
        size: 2,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true,
    });

    stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    // ── Nebula clouds (large semi-transparent spheres) ──
    nebulaClouds = new THREE.Group();
    const nebulaColors = [0x7b2ff7, 0x00d4ff, 0xff2d55, 0x4a148c, 0x0d47a1];
    for (let i = 0; i < 8; i++) {
        const geo = new THREE.SphereGeometry(80 + Math.random() * 120, 16, 16);
        const mat = new THREE.MeshBasicMaterial({
            color: nebulaColors[i % nebulaColors.length],
            transparent: true,
            opacity: 0.015 + Math.random() * 0.02,
            wireframe: false,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(
            (Math.random() - 0.5) * 1200,
            (Math.random() - 0.5) * 1200,
            (Math.random() - 0.5) * 800
        );
        nebulaClouds.add(mesh);
    }
    scene.add(nebulaClouds);

    // ── Handle resize ──
    window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    animateThreeJS();
}

function animateThreeJS() {
    requestAnimationFrame(animateThreeJS);

    const time = Date.now() * 0.00005;

    // Rotate star field
    stars.rotation.y = time * 0.5;
    stars.rotation.x = time * 0.2;

    // Rotate nebula
    nebulaClouds.rotation.y = time * 0.3;
    nebulaClouds.rotation.x = time * 0.15;

    // Parallax with scroll
    const scrollY = window.scrollY;
    camera.position.y = -scrollY * 0.15;
    camera.position.z = 500 + scrollY * 0.08;

    renderer.render(scene, camera);
}

// ═══════════════════════════════════════════════════════════════════
//  GSAP — SCROLL ANIMATIONS
// ═══════════════════════════════════════════════════════════════════

function initScrollAnimations() {
    gsap.registerPlugin(ScrollTrigger);

    // ── Hero entrance ──
    const heroTL = gsap.timeline({ defaults: { ease: "power3.out" } });
    heroTL
        .to("#hero-badge", { opacity: 1, y: 0, duration: 0.8 }, 0.2)
        .to("#hero-title", { opacity: 1, y: 0, duration: 1 }, 0.4)
        .to("#hero-subtitle", { opacity: 1, y: 0, duration: 0.8 }, 0.7)
        .to("#hero-actions", { opacity: 1, y: 0, duration: 0.8 }, 0.9)
        .to("#hero-stats", { opacity: 1, y: 0, duration: 0.8 }, 1.1);

    // ── Stat counter animation ──
    document.querySelectorAll(".stat-number").forEach(el => {
        const target = parseInt(el.dataset.target);
        gsap.to(el, {
            innerText: target,
            duration: 2,
            delay: 1.5,
            snap: { innerText: 1 },
            ease: "power2.out",
            onUpdate: function () {
                el.textContent = Math.round(el.innerText || 0);
            }
        });
    });

    // ── Section headers slide in ──
    gsap.utils.toArray(".section-header").forEach(header => {
        gsap.from(header, {
            scrollTrigger: {
                trigger: header,
                start: "top 80%",
                toggleActions: "play none none reverse",
            },
            opacity: 0,
            y: 60,
            duration: 1,
            ease: "power3.out"
        });
    });

    // ── Movie cards stagger ──
    gsap.utils.toArray(".carousel-wrapper").forEach(wrapper => {
        ScrollTrigger.create({
            trigger: wrapper,
            start: "top 85%",
            onEnter: () => {
                gsap.from(wrapper.querySelectorAll(".movie-card"), {
                    opacity: 0,
                    y: 40,
                    rotateX: 15,
                    scale: 0.9,
                    duration: 0.6,
                    stagger: 0.08,
                    ease: "back.out(1.7)",
                    clearProps: "all"
                });
            },
            once: true
        });
    });

    // ── Pipeline steps ──
    gsap.utils.toArray(".pipeline-step").forEach((step, i) => {
        gsap.to(step, {
            scrollTrigger: {
                trigger: step,
                start: "top 85%",
                toggleActions: "play none none reverse",
            },
            opacity: 1,
            y: 0,
            duration: 0.8,
            delay: i * 0.15,
            ease: "power3.out"
        });
    });

    // ── Recommend input container ──
    gsap.from("#recommend-input-container", {
        scrollTrigger: {
            trigger: "#recommend-input-container",
            start: "top 80%",
            toggleActions: "play none none reverse",
        },
        opacity: 0,
        y: 40,
        scale: 0.95,
        duration: 0.8,
        ease: "power3.out"
    });

    // ── Genre cards stagger ──
    ScrollTrigger.create({
        trigger: "#genre-grid",
        start: "top 85%",
        onEnter: () => {
            gsap.from(".genre-card", {
                opacity: 0,
                y: 30,
                scale: 0.9,
                duration: 0.5,
                stagger: 0.05,
                ease: "back.out(1.4)",
                clearProps: "all"
            });
        },
        once: true
    });

    // ── Navbar background on scroll ──
    ScrollTrigger.create({
        start: "top -80",
        onUpdate: (self) => {
            document.getElementById("navbar").classList.toggle("scrolled", self.progress > 0);
        }
    });

    // ── Parallax on hero visual ──
    gsap.to(".hero-visual", {
        scrollTrigger: {
            trigger: ".hero",
            start: "top top",
            end: "bottom top",
            scrub: 1,
        },
        y: -100,
        opacity: 0,
        ease: "none"
    });

    // ── Scroll indicator fade ──
    gsap.to("#scroll-indicator", {
        scrollTrigger: {
            trigger: ".hero",
            start: "top top",
            end: "20% top",
            scrub: true,
        },
        opacity: 0,
        y: -20,
    });
}

// ═══════════════════════════════════════════════════════════════════
//  3D CARD TILT EFFECT (Mouse Interaction)
// ═══════════════════════════════════════════════════════════════════

function init3DCardEffects() {
    document.addEventListener("mousemove", (e) => {
        document.querySelectorAll(".movie-card, .recommend-card").forEach(card => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * -8;
                const rotateY = ((x - centerX) / centerX) * 8;
                card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-12px) scale(1.03)`;
            }
        });
    });

    document.addEventListener("mouseleave", () => {
        document.querySelectorAll(".movie-card, .recommend-card").forEach(card => {
            card.style.transform = "";
        });
    }, true);
}

// ═══════════════════════════════════════════════════════════════════
//  MOVIE CARD RENDERING
// ═══════════════════════════════════════════════════════════════════

function getGradient(index) {
    const g = POSTER_GRADIENTS[index % POSTER_GRADIENTS.length];
    return `linear-gradient(135deg, ${g[0]} 0%, ${g[1]} 100%)`;
}

function getMovieEmoji(genres) {
    if (!genres || genres.length === 0) return "🎬";
    for (const g of genres) {
        if (GENRE_EMOJIS[g]) return GENRE_EMOJIS[g];
    }
    return "🎬";
}

function createMovieCard(movie, index, showSimilarity = false) {
    const card = document.createElement("div");
    card.className = showSimilarity ? "recommend-card" : "movie-card";
    card.onclick = () => openMovieModal(movie);

    const emoji = getMovieEmoji(movie.genres);
    const genre_tags = (movie.genres || []).slice(0, 3).map(g =>
        `<span class="genre-tag">${g}</span>`
    ).join("");

    card.innerHTML = `
        <div class="movie-poster">
            <div class="movie-poster-bg" style="background: ${getGradient(index)}">
                ${emoji}
            </div>
            <div class="movie-rating-badge">⭐ ${movie.vote_average?.toFixed(1) || "N/A"}</div>
            ${showSimilarity && movie.similarity ? `<div class="movie-similarity-badge">${movie.similarity}% Match</div>` : ""}
        </div>
        <div class="movie-info">
            <div class="movie-title" title="${movie.title}">${movie.title}</div>
            <div class="movie-meta">
                <span>${movie.year || "N/A"}</span>
                <span>•</span>
                <span>${movie.runtime ? movie.runtime + " min" : ""}</span>
            </div>
            <div class="movie-genres-list">${genre_tags}</div>
        </div>
    `;
    return card;
}

// ═══════════════════════════════════════════════════════════════════
//  API CALLS & DATA LOADING
// ═══════════════════════════════════════════════════════════════════

async function fetchAPI(endpoint) {
    try {
        const res = await fetch(`${API_BASE}${endpoint}`);
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || `HTTP ${res.status}`);
        }
        return await res.json();
    } catch (e) {
        console.error(`API Error [${endpoint}]:`, e);
        return null;
    }
}

function renderCarousel(containerId, movies) {
    const container = document.getElementById(containerId);
    if (!container || !movies) return;
    container.innerHTML = "";
    movies.forEach((movie, i) => {
        container.appendChild(createMovieCard(movie, i));
    });
}

async function loadTrending() {
    const movies = await fetchAPI("/trending?n=20");
    if (movies) renderCarousel("trending-carousel", movies);
}

async function loadTopRated() {
    const movies = await fetchAPI("/top-rated?n=20");
    if (movies) renderCarousel("toprated-carousel", movies);
}

async function loadGenres() {
    const genres = await fetchAPI("/genres");
    if (!genres) return;
    const grid = document.getElementById("genre-grid");
    grid.innerHTML = "";
    genres.forEach(genre => {
        const card = document.createElement("div");
        card.className = "genre-card";
        card.onclick = () => loadGenreMovies(genre, card);
        card.innerHTML = `
            <span class="genre-emoji">${GENRE_EMOJIS[genre] || "🎬"}</span>
            <span class="genre-name">${genre}</span>
        `;
        grid.appendChild(card);
    });
}

async function loadGenreMovies(genre, clickedCard) {
    // Toggle active state
    document.querySelectorAll(".genre-card").forEach(c => c.classList.remove("active"));
    clickedCard.classList.add("active");

    const container = document.getElementById("genre-movies-container");
    const grid = document.getElementById("genre-movies-grid");
    const title = document.getElementById("genre-movies-title");

    container.style.display = "block";
    title.textContent = `${GENRE_EMOJIS[genre] || "🎬"} ${genre} Movies`;
    grid.innerHTML = '<div class="loading-spinner"></div>';

    const movies = await fetchAPI(`/genre/${genre}?n=16`);
    grid.innerHTML = "";
    if (movies && movies.length > 0) {
        movies.forEach((movie, i) => {
            grid.appendChild(createMovieCard(movie, i));
        });
        // Animate in
        gsap.from(grid.children, {
            opacity: 0, y: 30, scale: 0.9,
            duration: 0.5, stagger: 0.05,
            ease: "back.out(1.4)", clearProps: "all"
        });
    } else {
        grid.innerHTML = '<p style="text-align:center;color:var(--text-muted);grid-column:1/-1;">No movies found for this genre.</p>';
    }

    // Scroll to genre movies
    container.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ═══════════════════════════════════════════════════════════════════
//  RECOMMENDATION SYSTEM UI
// ═══════════════════════════════════════════════════════════════════

let searchDebounce = null;

function initRecommendInput() {
    const input = document.getElementById("recommend-input");
    const suggestions = document.getElementById("recommend-suggestions");

    input.addEventListener("input", () => {
        clearTimeout(searchDebounce);
        const query = input.value.trim();
        if (query.length < 2) {
            suggestions.classList.remove("visible");
            return;
        }
        searchDebounce = setTimeout(async () => {
            const results = await fetchAPI(`/search?q=${encodeURIComponent(query)}&n=8`);
            if (results && results.length > 0) {
                suggestions.innerHTML = results.map(m => `
                    <div class="suggestion-item" onclick="selectSuggestion('${m.title.replace(/'/g, "\\'")}')">
                        <span class="title">${m.title}</span>
                        <span class="year">${m.year || ""}</span>
                    </div>
                `).join("");
                suggestions.classList.add("visible");
            } else {
                suggestions.classList.remove("visible");
            }
        }, 300);
    });

    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            suggestions.classList.remove("visible");
            getRecommendations();
        }
    });

    // Close suggestions on outside click
    document.addEventListener("click", (e) => {
        if (!e.target.closest(".recommend-input-container")) {
            suggestions.classList.remove("visible");
        }
    });
}

function selectSuggestion(title) {
    document.getElementById("recommend-input").value = title;
    document.getElementById("recommend-suggestions").classList.remove("visible");
    getRecommendations();
}

async function getRecommendations() {
    const input = document.getElementById("recommend-input");
    const resultsContainer = document.getElementById("recommend-results");
    const title = input.value.trim();

    if (!title) return;

    resultsContainer.innerHTML = '<div class="loading-spinner"></div>';

    const movies = await fetchAPI(`/recommend?title=${encodeURIComponent(title)}&n=12`);

    resultsContainer.innerHTML = "";

    if (!movies || movies.error) {
        resultsContainer.innerHTML = `
            <div class="recommend-empty">
                <div class="empty-icon">
                    <svg width="60" height="60" fill="none" stroke="var(--accent-3)" stroke-width="1.5" opacity="0.5">
                        <circle cx="30" cy="30" r="25"/>
                        <line x1="20" y1="20" x2="40" y2="40"/>
                        <line x1="40" y1="20" x2="20" y2="40"/>
                    </svg>
                </div>
                <p>${movies?.error || "Movie not found. Try a different title."}</p>
            </div>
        `;
        return;
    }

    movies.forEach((movie, i) => {
        resultsContainer.appendChild(createMovieCard(movie, i, true));
    });

    // Animate cards in with 3D effect
    gsap.from(resultsContainer.children, {
        opacity: 0,
        y: 60,
        rotateX: 20,
        scale: 0.85,
        duration: 0.6,
        stagger: 0.08,
        ease: "back.out(1.7)",
        clearProps: "all"
    });
}

// ═══════════════════════════════════════════════════════════════════
//  MOVIE MODAL
// ═══════════════════════════════════════════════════════════════════

function openMovieModal(movie) {
    const modal = document.getElementById("movie-modal");
    const body = document.getElementById("modal-body");
    const emoji = getMovieEmoji(movie.genres);
    const idx = Math.floor(Math.random() * POSTER_GRADIENTS.length);

    body.innerHTML = `
        <div class="modal-poster" style="background: ${getGradient(idx)}">
            <span style="font-size:80px;z-index:2;position:relative;">${emoji}</span>
        </div>
        <div class="modal-details">
            <h2 class="modal-title">${movie.title}</h2>
            ${movie.tagline ? `<p class="modal-tagline">"${movie.tagline}"</p>` : ""}
            <div class="modal-meta">
                <span class="meta-pill highlight">⭐ ${movie.vote_average?.toFixed(1) || "N/A"}</span>
                <span class="meta-pill">${movie.year || "N/A"}</span>
                ${movie.runtime ? `<span class="meta-pill">${movie.runtime} min</span>` : ""}
                ${movie.similarity ? `<span class="meta-pill highlight">${movie.similarity}% Match</span>` : ""}
                <span class="meta-pill">👥 ${movie.vote_count?.toLocaleString() || 0} votes</span>
            </div>
            <div class="modal-genres">
                ${(movie.genres || []).map(g => `<span class="modal-genre-tag">${GENRE_EMOJIS[g] || "🎬"} ${g}</span>`).join("")}
            </div>
            <p class="modal-overview">${movie.overview || "No overview available."}</p>
            ${movie.director ? `<p class="modal-section-title">Director</p><p class="modal-director">🎬 ${movie.director}</p>` : ""}
            ${movie.cast ? `<p class="modal-section-title">Top Cast</p><p class="modal-cast">🎭 ${movie.cast}</p>` : ""}
            <button class="modal-recommend-btn" onclick="findSimilar('${movie.title.replace(/'/g, "\\'")}')">
                🔍 Find Similar Movies
            </button>
        </div>
    `;

    modal.style.display = "flex";
    document.body.style.overflow = "hidden";

    // Animate modal
    gsap.from(".modal-content", {
        scale: 0.8, opacity: 0, duration: 0.4,
        ease: "back.out(1.7)"
    });
}

function closeModal() {
    document.getElementById("movie-modal").style.display = "none";
    document.body.style.overflow = "";
}

function findSimilar(title) {
    closeModal();
    const input = document.getElementById("recommend-input");
    input.value = title;
    scrollToSection("recommend-section");
    setTimeout(() => getRecommendations(), 400);
}

// ═══════════════════════════════════════════════════════════════════
//  SEARCH (Navbar)
// ═══════════════════════════════════════════════════════════════════

function initSearch() {
    const toggle = document.getElementById("search-toggle");
    const container = document.getElementById("search-container");
    const input = document.getElementById("search-input");
    const results = document.getElementById("search-results");

    toggle.addEventListener("click", () => {
        container.classList.toggle("open");
        if (container.classList.contains("open")) {
            setTimeout(() => input.focus(), 300);
        } else {
            input.value = "";
            results.classList.remove("visible");
        }
    });

    let debounce = null;
    input.addEventListener("input", () => {
        clearTimeout(debounce);
        const q = input.value.trim();
        if (q.length < 2) {
            results.classList.remove("visible");
            return;
        }
        debounce = setTimeout(async () => {
            const movies = await fetchAPI(`/search?q=${encodeURIComponent(q)}&n=6`);
            if (movies && movies.length > 0) {
                results.innerHTML = movies.map(m => {
                    const emoji = getMovieEmoji(m.genres);
                    return `
                        <div class="search-result-item" onclick='openMovieModal(${JSON.stringify(m).replace(/'/g, "&apos;")})'>
                            <div class="search-result-poster">${emoji}</div>
                            <div class="search-result-info">
                                <h4>${m.title}</h4>
                                <p>${m.year || ""} · ⭐ ${m.vote_average?.toFixed(1) || "N/A"} · ${m.genre_str || ""}</p>
                            </div>
                        </div>
                    `;
                }).join("");
                results.classList.add("visible");
            } else {
                results.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-muted);">No movies found</div>';
                results.classList.add("visible");
            }
        }, 300);
    });

    // Close on outside click
    document.addEventListener("click", (e) => {
        if (!e.target.closest(".search-container")) {
            container.classList.remove("open");
            results.classList.remove("visible");
        }
    });
}

// ═══════════════════════════════════════════════════════════════════
//  CAROUSEL NAVIGATION
// ═══════════════════════════════════════════════════════════════════

function initCarousels() {
    document.querySelectorAll(".carousel-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const direction = btn.classList.contains("carousel-btn-left") ? -1 : 1;
            const carousel = btn.parentElement.querySelector(".movie-carousel");
            carousel.scrollBy({ left: direction * 500, behavior: "smooth" });
        });
    });
}

// ═══════════════════════════════════════════════════════════════════
//  NAVIGATION
// ═══════════════════════════════════════════════════════════════════

function scrollToSection(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

function initNavLinks() {
    // Active link highlighting
    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll(".nav-link");

    window.addEventListener("scroll", () => {
        let current = "";
        sections.forEach(section => {
            const top = section.offsetTop - 100;
            if (window.scrollY >= top) {
                current = section.id;
            }
        });
        navLinks.forEach(link => {
            link.classList.remove("active");
            if (link.dataset.section === current) {
                link.classList.add("active");
            }
        });
    });
}

// ═══════════════════════════════════════════════════════════════════
//  MODAL EVENT LISTENERS
// ═══════════════════════════════════════════════════════════════════

function initModal() {
    document.getElementById("modal-close").addEventListener("click", closeModal);
    document.getElementById("movie-modal").addEventListener("click", (e) => {
        if (e.target === e.currentTarget) closeModal();
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeModal();
    });
}

// ═══════════════════════════════════════════════════════════════════
//  INITIALIZE EVERYTHING
// ═══════════════════════════════════════════════════════════════════

document.addEventListener("DOMContentLoaded", async () => {
    // Initialize Three.js 3D Background
    initThreeJS();

    // Initialize GSAP Scroll Animations
    initScrollAnimations();

    // Initialize 3D Card tilt effects
    init3DCardEffects();

    // Initialize UI components
    initSearch();
    initCarousels();
    initNavLinks();
    initModal();
    initRecommendInput();

    // Load data from API
    await Promise.all([
        loadTrending(),
        loadTopRated(),
        loadGenres(),
    ]);

    console.log("🎬 HOTSTAR AI Recommendation System — Ready!");
});
