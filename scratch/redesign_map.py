import os

filepath = "/Users/nikhilsridhara/Desktop/geetha awwwards/investors.html"

if not os.path.exists(filepath):
    print(f"Error: {filepath} does not exist.")
    exit(1)

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

start_marker = '<main class="slot">'
end_marker = '</main>'

start_idx = content.find(start_marker)
if start_idx == -1:
    print('Error: start marker \'<main class="slot">\' not found.')
    exit(1)

end_idx = content.find(end_marker, start_idx)
if end_idx == -1:
    print("Error: end marker '</main>' not found.")
    exit(1)

new_slot_content = """
<section max-width="11clm" padding-top="None" padding-bottom="None" class="lyt" style="max-width:100%; padding:0; margin:0;">
  <div class="code w-embed">
    <style>
      /* Custom Immersive Map Styling */
      .geetha-map-dashboard {
        display: flex;
        width: 100vw;
        height: calc(100vh - 70px); /* Fill space below header */
        background-color: #05070d;
        color: #ffffff;
        overflow: hidden;
        position: relative;
        margin-left: calc(-50vw + 50%); /* Break out of default container paddings */
      }

      /* Sidebar panel */
      .geetha-map-sidebar {
        width: 300px;
        height: 100%;
        background-color: #0b0d19;
        border-right: 1px solid rgba(255, 255, 255, 0.08);
        padding: 30px;
        display: flex;
        flex-direction: column;
        z-index: 10;
        box-shadow: 10px 0 30px rgba(0, 0, 0, 0.4);
        flex-shrink: 0;
      }

      .sidebar-eyebrow {
        font-family: monospace;
        font-size: 8px;
        letter-spacing: 0.2em;
        color: rgba(255, 255, 255, 0.4);
      }

      .sidebar-title {
        font-size: 1.4rem;
        letter-spacing: 0.05em;
        margin: 5px 0 15px;
        color: #ffffff;
        font-family: 'Styrene A LC', sans-serif;
        text-transform: uppercase;
      }

      .sidebar-line {
        width: 40px;
        height: 2px;
        background-color: #2d4cff;
      }

      .sidebar-subtitle {
        font-family: monospace;
        font-size: 10px;
        letter-spacing: 0.1em;
        color: rgba(255, 255, 255, 0.4);
        margin-top: 25px;
        text-transform: uppercase;
      }

      /* Sidebar filter items */
      .geetha-filter-btn {
        display: flex;
        align-items: center;
        width: 100%;
        background: none;
        border: 1px solid rgba(255, 255, 255, 0.05);
        padding: 12px 14px;
        margin-top: 8px;
        color: rgba(255, 255, 255, 0.7);
        font-family: monospace;
        font-size: 11px;
        text-transform: uppercase;
        cursor: pointer;
        border-radius: 3px;
        transition: all 0.25s ease;
        justify-content: space-between;
        text-align: left;
      }

      .geetha-filter-btn:hover,
      .geetha-filter-btn.active {
        background-color: rgba(255, 255, 255, 0.06);
        border-color: rgba(255, 255, 255, 0.15);
        color: #ffffff;
      }

      .geetha-filter-btn.active {
        border-left: 3px solid #2d4cff;
        background-color: rgba(45, 76, 255, 0.05);
      }

      .filter-left {
        display: flex;
        align-items: center;
      }

      .filter-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        margin-right: 10px;
        display: inline-block;
      }

      .filter-dot.bg-blue { background-color: #2d4cff; }
      .filter-dot.bg-green { background-color: #2dfd8b; }
      .filter-dot.bg-orange { background-color: #ff9f2c; }

      .filter-count {
        font-size: 9px;
        opacity: 0.5;
        background-color: rgba(255, 255, 255, 0.1);
        padding: 2px 6px;
        border-radius: 10px;
      }

      /* Sidebar Metrics list */
      .sidebar-metric-item {
        display: flex;
        justify-content: space-between;
        padding: 10px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        font-size: 11px;
      }

      .metric-lbl {
        color: rgba(255, 255, 255, 0.4);
        font-family: monospace;
      }

      .metric-val {
        color: #ffffff;
        font-weight: bold;
      }

      /* Topology Toggle button */
      .geetha-trail-toggle-btn {
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;
        background: rgba(45, 76, 255, 0.08);
        border: 1px solid rgba(45, 76, 255, 0.2);
        color: #2d4cff;
        font-family: monospace;
        font-size: 10px;
        padding: 12px;
        cursor: pointer;
        border-radius: 3px;
        transition: all 0.2s;
        justify-content: center;
        margin-top: auto;
        text-transform: uppercase;
      }

      .geetha-trail-toggle-btn:hover,
      .geetha-trail-toggle-btn.active {
        background-color: #2d4cff;
        color: #ffffff;
        border-color: #2d4cff;
      }

      /* Map viewport area */
      .geetha-map-viewport-wrapper {
        flex: 1;
        height: 100%;
        position: relative;
        overflow: hidden;
      }

      .geetha-map-viewport {
        width: 100%;
        height: 100%;
        cursor: grab;
        position: relative;
        overflow: hidden;
      }

      .geetha-map-viewport:active {
        cursor: grabbing;
      }

      .geetha-map-canvas {
        width: 1600px;
        height: 1100px;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0.85);
        transform-origin: center center;
        user-select: none;
      }

      .geetha-map-bg-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        pointer-events: none;
        opacity: 0.9;
      }

      /* SVG paths on top of map */
      .geetha-topology-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.4s ease;
        z-index: 2;
      }

      .geetha-topology-overlay.is--visible {
        opacity: 1;
      }

      /* Coordinates overlay */
      .geetha-coords-hud {
        position: absolute;
        top: 20px;
        left: 20px;
        background-color: rgba(11, 13, 25, 0.85);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 3px;
        padding: 8px 12px;
        font-family: monospace;
        font-size: 10px;
        color: #ffffff;
        z-index: 10;
        backdrop-filter: blur(8px);
        pointer-events: none;
        letter-spacing: 0.05em;
      }

      /* Zoom controls */
      .geetha-hud-controls {
        position: absolute;
        top: 20px;
        right: 20px;
        display: flex;
        flex-direction: column;
        gap: 6px;
        z-index: 10;
      }

      .geetha-hud-btn {
        width: 32px;
        height: 32px;
        background-color: rgba(11, 13, 25, 0.85);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 3px;
        color: #ffffff;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(8px);
        transition: all 0.2s;
        user-select: none;
      }

      .geetha-hud-btn:hover {
        background-color: #ffffff;
        color: #0b0d19;
        border-color: #ffffff;
      }

      /* Pins styling */
      .geetha-map-pin {
        position: absolute;
        width: 20px;
        height: 20px;
        transform: translate(-50%, -50%);
        cursor: pointer;
        z-index: 5;
        border: none;
        background: none;
        padding: 0;
        outline: none;
        transition: opacity 0.3s ease, transform 0.3s ease;
      }

      .geetha-map-pin.is--dimmed {
        opacity: 0.15;
        pointer-events: none;
      }

      .geetha-map-pin-pulse {
        position: absolute;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: #2d4cff;
        opacity: 0.4;
        animation: pinPulse 2s infinite ease-out;
      }

      .geetha-map-pin.completed .geetha-map-pin-pulse {
        background-color: #2dfd8b;
      }

      .geetha-map-pin.planning .geetha-map-pin-pulse {
        background-color: #ff9f2c;
      }

      .geetha-map-pin-dot {
        position: absolute;
        top: 4px;
        left: 4px;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background-color: #2d4cff;
        border: 2px solid #ffffff;
        box-shadow: 0 0 10px rgba(45, 76, 255, 0.6);
        transition: transform 0.2s ease;
      }

      .geetha-map-pin.completed .geetha-map-pin-dot {
        background-color: #2dfd8b;
        box-shadow: 0 0 10px rgba(45, 253, 139, 0.6);
      }

      .geetha-map-pin.planning .geetha-map-pin-dot {
        background-color: #ff9f2c;
        box-shadow: 0 0 10px rgba(255, 159, 44, 0.6);
      }

      .geetha-map-pin:hover .geetha-map-pin-dot,
      .geetha-map-pin.is--selected .geetha-map-pin-dot {
        transform: scale(1.4);
      }

      .geetha-map-pin-label {
        position: absolute;
        top: 24px;
        left: 50%;
        transform: translateX(-50%);
        background-color: rgba(11, 13, 25, 0.95);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 2px;
        padding: 4px 8px;
        font-family: monospace;
        font-size: 9px;
        color: #ffffff;
        white-space: nowrap;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.2s ease;
        box-shadow: 0 4px 10px rgba(0,0,0,0.5);
      }

      .geetha-map-pin:hover .geetha-map-pin-label,
      .geetha-map-pin.is--selected .geetha-map-pin-label {
        opacity: 1;
      }

      @keyframes pinPulse {
        0% { transform: scale(1); opacity: 0.5; }
        100% { transform: scale(3.5); opacity: 0; }
      }

      /* Glassmorphic details card override */
      .geetha-map-card {
        position: absolute;
        bottom: 20px;
        right: 20px;
        width: 330px;
        background-color: rgba(11, 13, 25, 0.85);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 6px;
        z-index: 10;
        backdrop-filter: blur(20px);
        box-shadow: 0 15px 40px rgba(0, 0, 0, 0.6);
        transform: translateY(30px);
        opacity: 0;
        pointer-events: none;
        transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .geetha-map-card.is--visible {
        transform: translateY(0);
        opacity: 1;
        pointer-events: auto;
      }

      .geetha-map-card-close {
        position: absolute;
        top: 15px;
        right: 15px;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.4);
        cursor: pointer;
        transition: color 0.2s;
        z-index: 2;
      }

      .geetha-map-card-close:hover {
        color: #ffffff;
      }

      .geetha-map-card-content {
        padding: 24px;
      }

      .geetha-map-card-badge {
        display: inline-block;
        font-family: monospace;
        font-size: 8px;
        font-weight: bold;
        letter-spacing: 0.15em;
        padding: 3px 6px;
        background-color: rgba(45, 76, 255, 0.15);
        border: 1px solid rgba(45, 76, 255, 0.3);
        color: #2d4cff;
        border-radius: 2px;
        margin-bottom: 12px;
        text-transform: uppercase;
      }

      .geetha-map-card-title {
        color: #ffffff;
        font-family: 'Styrene A LC', sans-serif;
        letter-spacing: 0.05em;
        margin: 0;
        font-size: 1.5rem;
        text-transform: uppercase;
      }

      .geetha-map-card-subtitle {
        color: rgba(255, 255, 255, 0.5);
        font-family: monospace;
        font-size: 11px;
        text-transform: uppercase;
        margin-top: 4px;
      }

      .geetha-map-card-image-container {
        width: 100%;
        height: 140px;
        background-color: #0b0d19;
        border: 1px solid rgba(255, 255, 255, 0.05);
        overflow: hidden;
        border-radius: 2px;
        margin-top: 12px;
      }

      .geetha-map-card-image-container img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: scale 0.5s ease;
      }

      .geetha-map-card:hover .geetha-map-card-image-container img {
        scale: 1.05;
      }

      .geetha-map-card-specs {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: 16px;
      }

      .geetha-map-card-spec-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 11px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        padding-bottom: 6px;
      }

      .spec-lbl {
        color: rgba(255, 255, 255, 0.4);
        font-family: monospace;
      }

      .spec-val {
        color: #ffffff;
        font-weight: 500;
      }

      .geetha-map-card-cta {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        background-color: #ffffff;
        color: #0b0d19;
        padding: 12px 16px;
        border-radius: 2px;
        text-decoration: none;
        font-family: monospace;
        font-size: 11px;
        font-weight: bold;
        text-transform: uppercase;
        transition: background-color 0.2s;
        border: none;
        cursor: pointer;
        margin-top: 16px;
      }

      .geetha-map-card-cta:hover {
        background-color: #2d4cff;
        color: #ffffff;
      }

      /* Responsive styles */
      @media (max-width: 991px) {
        .geetha-map-dashboard {
          flex-direction: column;
          height: auto;
        }
        .geetha-map-sidebar {
          width: 100%;
          height: auto;
          border-right: none;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .geetha-map-viewport-wrapper {
          height: 500px;
          width: 100%;
        }
      }
    </style>
  </div>

  <div class="geetha-map-dashboard">
    <!-- Left Sidebar Panel -->
    <div class="geetha-map-sidebar">
      <div class="geetha-map-sidebar-brand">
        <div class="sidebar-eyebrow">PORTFOLIO DASHBOARD</div>
        <h2 class="sidebar-title">ACTIVE REGIONS</h2>
        <div class="sidebar-line"></div>
      </div>

      <!-- Filters & Legend -->
      <div class="geetha-map-filters">
        <h4 class="sidebar-subtitle mb3">PROJECT FILTERS</h4>
        <button class="geetha-filter-btn active" id="filter-all">
          <span class="filter-left">
            <span class="filter-dot bg-blue"></span>
            <span>ALL PROJECTS</span>
          </span>
          <span class="filter-count">4</span>
        </button>
        <button class="geetha-filter-btn" id="filter-active">
          <span class="filter-left">
            <span class="filter-dot bg-blue"></span>
            <span>ACTIVE SITES</span>
          </span>
          <span class="filter-count">2</span>
        </button>
        <button class="geetha-filter-btn" id="filter-completed">
          <span class="filter-left">
            <span class="filter-dot bg-green"></span>
            <span>COMPLETED</span>
          </span>
          <span class="filter-count">1</span>
        </button>
        <button class="geetha-filter-btn" id="filter-planning">
          <span class="filter-left">
            <span class="filter-dot bg-orange"></span>
            <span>IN PLANNING</span>
          </span>
          <span class="filter-count">1</span>
        </button>
      </div>

      <!-- Quality HUD -->
      <div class="geetha-map-metrics">
        <h4 class="sidebar-subtitle mb3">REGIONAL METRICS</h4>
        <div class="sidebar-metric-item">
          <span class="metric-lbl">Safety Audit Rating</span>
          <span class="metric-val">100%</span>
        </div>
        <div class="sidebar-metric-item">
          <span class="metric-lbl">Total Covered Area</span>
          <span class="metric-val">45,000+ sf</span>
        </div>
        <div class="sidebar-metric-item">
          <span class="metric-lbl">On-Time Handover</span>
          <span class="metric-val">99.2%</span>
        </div>
      </div>

      <!-- Trails Toggler -->
      <button class="geetha-trail-toggle-btn" id="geetha-trails-btn">
        <span style="display:flex; align-items:center; gap:8px;">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" style="transform:translateY(-1px);"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
          <span>SHOW TOPOLOGY</span>
        </span>
      </button>
    </div>

    <!-- Map Viewport -->
    <div class="geetha-map-viewport-wrapper">
      <!-- Cursor Coordinates Overlay -->
      <div class="geetha-coords-hud" id="geetha-coords-hud">
        COORD: 12.9716° N, 77.5946° E
      </div>

      <!-- Zoom HUD Controls -->
      <div class="geetha-hud-controls">
        <button class="geetha-hud-btn" id="geetha-zoom-in" title="Zoom In">+</button>
        <button class="geetha-hud-btn" id="geetha-zoom-out" title="Zoom Out">-</button>
        <button class="geetha-hud-btn" id="geetha-map-reset" title="Recenter">⟲</button>
      </div>

      <div class="geetha-map-viewport" id="geetha-map-viewport">
        <div class="geetha-map-canvas" id="geetha-map-canvas">
          <img src="public/karnataka_project_map.png" class="geetha-map-bg-img" alt="Karnataka Project Sites" />

          <!-- Dynamic SVG Topology Overlay (Toggled via JS) -->
          <svg class="geetha-topology-overlay" id="geetha-topology-overlay" viewBox="0 0 1600 1100" style="position:absolute; inset:0; width:100%; height:100%;">
            <!-- Stylized topological flow paths mapping back to visual blueprint segments -->
            <path d="M 200 450 C 400 300, 600 600, 800 400 C 1000 200, 1200 500, 1400 350" fill="none" stroke="rgba(45, 76, 255, 0.35)" stroke-width="1.5" stroke-dasharray="6, 6"></path>
            <path d="M 100 800 C 350 650, 500 950, 750 800 C 1000 650, 1250 850, 1500 700" fill="none" stroke="rgba(45, 253, 139, 0.35)" stroke-width="1.5" stroke-dasharray="6, 6"></path>
            <path d="M 300 250 C 500 150, 700 350, 900 200 C 1100 50, 1300 250, 1450 150" fill="none" stroke="rgba(255, 159, 44, 0.35)" stroke-width="1.5" stroke-dasharray="6, 6"></path>
          </svg>

          <!-- Hotspot Pin 1: Geetha Meadows -->
          <button class="geetha-map-pin" style="left: 45%; top: 40%;" data-project="meadows" data-filter-type="active" title="Geetha Meadows">
            <span class="geetha-map-pin-pulse"></span>
            <span class="geetha-map-pin-dot"></span>
            <span class="geetha-map-pin-label">Geetha Meadows</span>
          </button>

          <!-- Hotspot Pin 2: Greenwood Estates -->
          <button class="geetha-map-pin completed" style="left: 65%; top: 32%;" data-project="greenwood" data-filter-type="completed" title="Greenwood Estates">
            <span class="geetha-map-pin-pulse"></span>
            <span class="geetha-map-pin-dot"></span>
            <span class="geetha-map-pin-label">Greenwood Estates</span>
          </button>

          <!-- Hotspot Pin 3: Lakeview Manor -->
          <button class="geetha-map-pin" style="left: 58%; top: 52%;" data-project="lakeview" data-filter-type="active" title="Lakeview Manor">
            <span class="geetha-map-pin-pulse"></span>
            <span class="geetha-map-pin-dot"></span>
            <span class="geetha-map-pin-label">Lakeview Manor</span>
          </button>

          <!-- Hotspot Pin 4: Valley Vista -->
          <button class="geetha-map-pin planning" style="left: 32%; top: 58%;" data-project="valley" data-filter-type="planning" title="Valley Vista">
            <span class="geetha-map-pin-pulse"></span>
            <span class="geetha-map-pin-dot"></span>
            <span class="geetha-map-pin-label">Valley Vista</span>
          </button>
        </div>
      </div>

      <!-- Floating Details Overlay Card -->
      <div class="geetha-map-card" id="geetha-map-card">
        <button class="geetha-map-card-close" id="geetha-map-card-close" title="Close Details">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
        <div class="geetha-map-card-content">
          <span class="geetha-map-card-badge" id="project-card-status">ACTIVE SITE</span>
          <h4 class="geetha-map-card-title" id="project-card-title">Geetha Meadows</h4>
          <p class="geetha-map-card-subtitle" id="project-card-type">Premium Bespoke Villas</p>
          
          <div class="geetha-map-card-image-container">
            <img src="public/meadows_preview.png" id="project-card-image" alt="Project Preview" />
          </div>

          <div class="geetha-map-card-specs">
            <div class="geetha-map-card-spec-item">
              <span class="spec-lbl">Location</span>
              <span class="spec-val" id="project-card-location">Devenahalli, Bangalore</span>
            </div>
            <div class="geetha-map-card-spec-item">
              <span class="spec-lbl">Covered Area</span>
              <span class="spec-val" id="project-card-area">15,000 sq ft</span>
            </div>
            <div class="geetha-map-card-spec-item">
              <span class="spec-lbl">Handover</span>
              <span class="spec-val" id="project-card-handover">Q3 2026</span>
            </div>
          </div>

          <a href="#" class="geetha-map-card-cta" id="project-card-link">
            <span>Explore Blueprints</span>
            <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" clip-rule="evenodd" d="M9.9746 2.47468C10.2187 2.23061 10.6144 2.23061 10.8585 2.47468L17.9418 9.55802C18.1859 9.8021 18.1859 10.1978 17.9418 10.4419L10.8585 17.5252C10.6144 17.7693 10.2187 17.7693 9.9746 17.5252C9.73053 17.2812 9.73053 16.8854 9.9746 16.6414L15.991 10.625H2.49988C2.1547 10.625 1.87488 10.3451 1.87488 9.99996C1.87488 9.65478 2.1547 9.37496 2.49988 9.37496H15.991L9.9746 3.35857C9.73053 3.11449 9.73053 2.71876 9.9746 2.47468Z"></path></svg>
          </a>
        </div>
      </div>
    </div>
  </div>

  <script>
  (function() {
    const mapData = {
      meadows: {
        title: "Geetha Meadows",
        type: "Premium Bespoke Villas",
        location: "Devenahalli, Bangalore",
        area: "15,000 sq ft",
        handover: "Q3 2026",
        status: "Active Site",
        image: "public/meadows_preview.png",
        link: "#"
      },
      greenwood: {
        title: "Greenwood Estates",
        type: "Modernist Forest Homes",
        location: "Sarjapur, Bangalore",
        area: "18,000 sq ft",
        handover: "Completed",
        status: "Completed",
        image: "public/greenwood_preview.png",
        link: "#"
      },
      lakeview: {
        title: "Lakeview Manor",
        type: "Waterfront Condominiums",
        location: "Hebbal, Bangalore",
        area: "22,000 sq ft",
        handover: "Q4 2027",
        status: "Under Construction",
        image: "public/lakeview_preview.png",
        link: "#"
      },
      valley: {
        title: "Valley Vista",
        type: "Hillside Luxury Mansions",
        location: "Nandi Hills, Bangalore",
        area: "35,000 sq ft",
        handover: "Planning Stage",
        status: "In Planning",
        image: "public/valley_preview.png",
        link: "#"
      }
    };

    function initMap() {
      const viewport = document.getElementById('geetha-map-viewport');
      const canvas = document.getElementById('geetha-map-canvas');
      const card = document.getElementById('geetha-map-card');
      const cardClose = document.getElementById('geetha-map-card-close');
      const coordsHud = document.getElementById('geetha-coords-hud');
      const topologyOverlay = document.getElementById('geetha-topology-overlay');
      const trailsBtn = document.getElementById('geetha-trails-btn');
      
      if (!viewport || !canvas || !card) return;
      
      const pins = canvas.querySelectorAll('.geetha-map-pin');

      // Zoom state
      let zoomScale = 0.85; // slightly zoomed out initially to fit nicely
      const ZOOM_STEP = 0.15;
      const MIN_ZOOM = 0.5;
      const MAX_ZOOM = 2.0;

      // Pan state & Inertia Physics variables
      let isDragging = false;
      let startX, startY;
      let pxTranslateX = 0;
      let pxTranslateY = 0;
      
      let vx = 0; // x velocity
      let vy = 0; // y velocity
      let lastX = 0;
      let lastY = 0;
      let lastTime = 0;
      let animationId = null;
      const friction = 0.94; // friction coefficient

      const updateTransform = () => {
        canvas.style.transform = `translate(calc(-50% + ${pxTranslateX}px), calc(-50% + ${pxTranslateY}px)) scale(${zoomScale})`;
      };

      // Physics glide loop
      const glideLoop = () => {
        if (isDragging) return;
        
        pxTranslateX += vx;
        pxTranslateY += vy;
        
        // Keep viewport within boundaries
        const maxBoundX = (1600 * zoomScale) / 1.5;
        const maxBoundY = (1100 * zoomScale) / 1.5;
        pxTranslateX = Math.min(Math.max(pxTranslateX, -maxBoundX), maxBoundX);
        pxTranslateY = Math.min(Math.max(pxTranslateY, -maxBoundY), maxBoundY);
        
        updateTransform();
        
        vx *= friction;
        vy *= friction;
        
        if (Math.abs(vx) > 0.05 || Math.abs(vy) > 0.05) {
          animationId = requestAnimationFrame(glideLoop);
        } else {
          vx = 0;
          vy = 0;
        }
      };

      // Mouse drag events
      viewport.addEventListener('mousedown', (e) => {
        if (e.target.closest('.geetha-hud-btn') || e.target.closest('.geetha-map-pin') || e.target.closest('.geetha-map-card')) return;
        isDragging = true;
        viewport.style.cursor = 'grabbing';
        startX = e.clientX - pxTranslateX;
        startY = e.clientY - pxTranslateY;
        
        vx = 0;
        vy = 0;
        lastX = e.clientX;
        lastY = e.clientY;
        lastTime = performance.now();
        cancelAnimationFrame(animationId);
      });

      window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        pxTranslateX = e.clientX - startX;
        pxTranslateY = e.clientY - startY;
        updateTransform();
        
        const now = performance.now();
        const dt = now - lastTime;
        if (dt > 0) {
          vx = (e.clientX - lastX) / (dt / 16);
          vy = (e.clientY - lastY) / (dt / 16);
        }
        lastX = e.clientX;
        lastY = e.clientY;
        lastTime = now;
      });

      window.addEventListener('mouseup', () => {
        if (!isDragging) return;
        isDragging = false;
        viewport.style.cursor = 'grab';
        
        // Clamp velocities to safe limits
        const maxVel = 35;
        vx = Math.min(Math.max(vx, -maxVel), maxVel);
        vy = Math.min(Math.max(vy, -maxVel), maxVel);
        
        animationId = requestAnimationFrame(glideLoop);
      });

      // Touch events for mobile/tablet drag support
      viewport.addEventListener('touchstart', (e) => {
        if (e.target.closest('.geetha-hud-btn') || e.target.closest('.geetha-map-pin') || e.target.closest('.geetha-map-card')) return;
        isDragging = true;
        startX = e.touches[0].clientX - pxTranslateX;
        startY = e.touches[0].clientY - pxTranslateY;
        
        vx = 0;
        vy = 0;
        lastX = e.touches[0].clientX;
        lastY = e.touches[0].clientY;
        lastTime = performance.now();
        cancelAnimationFrame(animationId);
      });

      viewport.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        pxTranslateX = e.touches[0].clientX - startX;
        pxTranslateY = e.touches[0].clientY - startY;
        updateTransform();
        
        const now = performance.now();
        const dt = now - lastTime;
        if (dt > 0) {
          vx = (e.touches[0].clientX - lastX) / (dt / 16);
          vy = (e.touches[0].clientY - lastY) / (dt / 16);
        }
        lastX = e.touches[0].clientX;
        lastY = e.touches[0].clientY;
        lastTime = now;
      });

      viewport.addEventListener('touchend', () => {
        if (!isDragging) return;
        isDragging = false;
        animationId = requestAnimationFrame(glideLoop);
      });

      // Bounding Box Coordinates Tracker
      viewport.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const pctX = mouseX / rect.width;
        const pctY = mouseY / rect.height;
        
        if (pctX >= 0 && pctX <= 1 && pctY >= 0 && pctY <= 1) {
          const lat = (13.1900 - (pctY * 0.3500)).toFixed(4);
          const lng = (77.4100 + (pctX * 0.3900)).toFixed(4);
          if (coordsHud) {
            coordsHud.textContent = `COORD: ${lat}° N, ${lng}° E`;
          }
        }
      });

      // Legend Category Filters
      const filterBtns = document.querySelectorAll('.geetha-filter-btn');
      filterBtns.forEach(btn => {
        btn.onclick = () => {
          filterBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          
          const filterType = btn.id.replace('filter-', '');
          pins.forEach(pin => {
            const pinType = pin.getAttribute('data-filter-type');
            if (filterType === 'all' || pinType === filterType) {
              pin.classList.remove('is--dimmed');
            } else {
              pin.classList.add('is--dimmed');
            }
          });
          
          // Auto close card details if the active pin is hidden
          const activeCardVisible = card.classList.contains('is--visible');
          if (activeCardVisible) {
            const activePin = canvas.querySelector('.geetha-map-pin.is--selected');
            if (activePin && activePin.classList.contains('is--dimmed')) {
              card.classList.remove('is--visible');
              pins.forEach(p => p.classList.remove('is--selected'));
            }
          }
        };
      });

      // Show Trails Overlay
      if (trailsBtn && topologyOverlay) {
        trailsBtn.onclick = () => {
          trailsBtn.classList.toggle('active');
          topologyOverlay.classList.toggle('is--visible');
        };
      }

      // Zoom Buttons HUD Controls
      const zoomIn = document.getElementById('geetha-zoom-in');
      const zoomOut = document.getElementById('geetha-zoom-out');
      const reset = document.getElementById('geetha-map-reset');

      if (zoomIn) {
        zoomIn.onclick = () => {
          zoomScale = Math.min(zoomScale + ZOOM_STEP, MAX_ZOOM);
          updateTransform();
        };
      }
      if (zoomOut) {
        zoomOut.onclick = () => {
          zoomScale = Math.max(zoomScale - ZOOM_STEP, MIN_ZOOM);
          updateTransform();
        };
      }
      if (reset) {
        reset.onclick = () => {
          zoomScale = 0.85;
          pxTranslateX = 0;
          pxTranslateY = 0;
          updateTransform();
        };
      }

      // Wheel zoom support
      viewport.addEventListener('wheel', (e) => {
        e.preventDefault();
        const direction = e.deltaY < 0 ? 1 : -1;
        zoomScale = Math.min(Math.max(zoomScale + direction * ZOOM_STEP * 0.4, MIN_ZOOM), MAX_ZOOM);
        updateTransform();
      }, { passive: false });

      // Show details helper
      const showDetails = (key) => {
        const data = mapData[key];
        if (!data) return;

        document.getElementById('project-card-title').textContent = data.title;
        document.getElementById('project-card-type').textContent = data.type;
        document.getElementById('project-card-location').textContent = data.location;
        document.getElementById('project-card-area').textContent = data.area;
        document.getElementById('project-card-handover').textContent = data.handover;
        
        const badge = document.getElementById('project-card-status');
        badge.textContent = data.status;
        badge.className = 'geetha-map-card-badge';
        
        if (key === 'greenwood') {
          badge.style.backgroundColor = 'rgba(45, 253, 139, 0.15)';
          badge.style.borderColor = 'rgba(45, 253, 139, 0.3)';
          badge.style.color = '#2dfd8b';
        } else if (key === 'valley') {
          badge.style.backgroundColor = 'rgba(255, 159, 44, 0.15)';
          badge.style.borderColor = 'rgba(255, 159, 44, 0.3)';
          badge.style.color = '#ff9f2c';
        } else {
          badge.style.backgroundColor = 'rgba(45, 76, 255, 0.15)';
          badge.style.borderColor = 'rgba(45, 76, 255, 0.3)';
          badge.style.color = '#2d4cff';
        }

        document.getElementById('project-card-image').src = data.image;
        document.getElementById('project-card-image').alt = data.title;
        document.getElementById('project-card-link').href = data.link;

        card.classList.add('is--visible');
      };

      pins.forEach(pin => {
        pin.onclick = (e) => {
          e.stopPropagation();
          pins.forEach(p => p.classList.remove('is--selected'));
          pin.classList.add('is--selected');
          const key = pin.getAttribute('data-project');
          showDetails(key);
        };
      });

      if (cardClose) {
        cardClose.onclick = (e) => {
          e.stopPropagation();
          card.classList.remove('is--visible');
          pins.forEach(p => p.classList.remove('is--selected'));
        };
      }

      // Centering layout initially
      updateTransform();

      // Auto trigger first pin Meadows on load
      setTimeout(() => {
        const firstPin = canvas.querySelector('.geetha-map-pin[data-project="meadows"]');
        if (firstPin) firstPin.click();
      }, 600);
    }

    // Setup taxi/pjax hook and normal load hook
    initMap();
    window.addEventListener('load', initMap);
    document.addEventListener('taxi:success', initMap);
  })();
  </script>
</section>
"""

updated_content = content[:start_idx + len(start_marker)] + new_slot_content + content[end_idx:]

with open(filepath, "w", encoding="utf-8") as f:
    f.write(updated_content)

print("Replacement successful!")
