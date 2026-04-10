// Chart data for ECDIS simulator - simplified vector representations of real maritime areas

export interface Coordinate {
  lat: number;
  lon: number;
}

export interface Sounding {
  lat: number;
  lon: number;
  depth: number;
}

export interface DepthContour {
  depth: number;
  points: Coordinate[];
}

export interface NavAid {
  lat: number;
  lon: number;
  type: 'buoy-green' | 'buoy-red' | 'buoy-yellow' | 'lighthouse' | 'beacon';
  name: string;
  characteristics?: string;
}

export interface TrafficSeparationScheme {
  lanes: {
    direction: number; // degrees
    points: Coordinate[];
  }[];
  separationZone: Coordinate[];
}

export interface ChartData {
  id: string;
  name: string;
  description: string;
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  center: Coordinate;
  coastlines: Coordinate[][];
  depthContours: DepthContour[];
  soundings: Sounding[];
  navAids: NavAid[];
  tss?: TrafficSeparationScheme;
  dangerAreas?: Coordinate[][];
  anchorageAreas?: Coordinate[][];
}

// Singapore Strait Chart
export const singaporeStrait: ChartData = {
  id: 'singapore',
  name: 'Singapore Strait',
  description: 'Singapore Strait - Major shipping lane',
  bounds: {
    north: 1.35,
    south: 1.15,
    east: 104.05,
    west: 103.65
  },
  center: { lat: 1.25, lon: 103.85 },
  coastlines: [
    // Singapore main island (south coast)
    [
      { lat: 1.29, lon: 103.65 },
      { lat: 1.28, lon: 103.70 },
      { lat: 1.265, lon: 103.75 },
      { lat: 1.26, lon: 103.80 },
      { lat: 1.255, lon: 103.85 },
      { lat: 1.26, lon: 103.90 },
      { lat: 1.27, lon: 103.95 },
      { lat: 1.28, lon: 104.00 },
      { lat: 1.30, lon: 104.05 },
      { lat: 1.35, lon: 104.05 },
      { lat: 1.35, lon: 103.65 },
      { lat: 1.29, lon: 103.65 }
    ],
    // Sentosa Island
    [
      { lat: 1.245, lon: 103.82 },
      { lat: 1.24, lon: 103.84 },
      { lat: 1.245, lon: 103.86 },
      { lat: 1.25, lon: 103.84 },
      { lat: 1.245, lon: 103.82 }
    ],
    // Batam Island (Indonesia - partial)
    [
      { lat: 1.15, lon: 103.65 },
      { lat: 1.17, lon: 103.75 },
      { lat: 1.18, lon: 103.85 },
      { lat: 1.17, lon: 103.95 },
      { lat: 1.15, lon: 104.05 },
      { lat: 1.15, lon: 103.65 }
    ]
  ],
  depthContours: [
    {
      depth: 10,
      points: [
        { lat: 1.27, lon: 103.65 },
        { lat: 1.265, lon: 103.75 },
        { lat: 1.255, lon: 103.85 },
        { lat: 1.26, lon: 103.95 },
        { lat: 1.27, lon: 104.05 }
      ]
    },
    {
      depth: 20,
      points: [
        { lat: 1.25, lon: 103.65 },
        { lat: 1.24, lon: 103.75 },
        { lat: 1.235, lon: 103.85 },
        { lat: 1.24, lon: 103.95 },
        { lat: 1.25, lon: 104.05 }
      ]
    },
    {
      depth: 30,
      points: [
        { lat: 1.23, lon: 103.65 },
        { lat: 1.22, lon: 103.75 },
        { lat: 1.215, lon: 103.85 },
        { lat: 1.22, lon: 103.95 },
        { lat: 1.23, lon: 104.05 }
      ]
    }
  ],
  soundings: [
    { lat: 1.24, lon: 103.70, depth: 15 },
    { lat: 1.23, lon: 103.72, depth: 22 },
    { lat: 1.22, lon: 103.75, depth: 28 },
    { lat: 1.235, lon: 103.78, depth: 18 },
    { lat: 1.225, lon: 103.80, depth: 25 },
    { lat: 1.22, lon: 103.83, depth: 31 },
    { lat: 1.23, lon: 103.85, depth: 27 },
    { lat: 1.24, lon: 103.87, depth: 19 },
    { lat: 1.225, lon: 103.90, depth: 24 },
    { lat: 1.22, lon: 103.93, depth: 29 },
    { lat: 1.235, lon: 103.95, depth: 21 },
    { lat: 1.23, lon: 103.98, depth: 26 },
    { lat: 1.24, lon: 104.00, depth: 17 },
    { lat: 1.21, lon: 103.75, depth: 35 },
    { lat: 1.205, lon: 103.85, depth: 38 },
    { lat: 1.21, lon: 103.95, depth: 34 }
  ],
  navAids: [
    { lat: 1.255, lon: 103.70, type: 'buoy-green', name: 'SG1', characteristics: 'Fl.G.3s' },
    { lat: 1.22, lon: 103.70, type: 'buoy-red', name: 'SG2', characteristics: 'Fl.R.3s' },
    { lat: 1.25, lon: 103.80, type: 'buoy-green', name: 'SG3', characteristics: 'Fl.G.5s' },
    { lat: 1.215, lon: 103.80, type: 'buoy-red', name: 'SG4', characteristics: 'Fl.R.5s' },
    { lat: 1.245, lon: 103.90, type: 'buoy-green', name: 'SG5', characteristics: 'Fl.G.3s' },
    { lat: 1.21, lon: 103.90, type: 'buoy-red', name: 'SG6', characteristics: 'Fl.R.3s' },
    { lat: 1.26, lon: 103.82, type: 'lighthouse', name: 'Raffles Lt', characteristics: 'Fl.W.10s' },
    { lat: 1.175, lon: 103.75, type: 'lighthouse', name: 'Horsburgh Lt', characteristics: 'Fl.W.5s' }
  ],
  tss: {
    lanes: [
      {
        direction: 90,
        points: [
          { lat: 1.24, lon: 103.65 },
          { lat: 1.235, lon: 103.85 },
          { lat: 1.24, lon: 104.05 }
        ]
      },
      {
        direction: 270,
        points: [
          { lat: 1.22, lon: 104.05 },
          { lat: 1.215, lon: 103.85 },
          { lat: 1.22, lon: 103.65 }
        ]
      }
    ],
    separationZone: [
      { lat: 1.235, lon: 103.65 },
      { lat: 1.23, lon: 103.85 },
      { lat: 1.235, lon: 104.05 },
      { lat: 1.225, lon: 104.05 },
      { lat: 1.22, lon: 103.85 },
      { lat: 1.225, lon: 103.65 }
    ]
  }
};

// Malacca Strait Chart
export const malaccaStrait: ChartData = {
  id: 'malacca',
  name: 'Malacca Strait',
  description: 'Malacca Strait - One of the busiest shipping lanes',
  bounds: {
    north: 3.0,
    south: 2.4,
    east: 101.8,
    west: 101.2
  },
  center: { lat: 2.7, lon: 101.5 },
  coastlines: [
    // Malaysian coast (east side)
    [
      { lat: 3.0, lon: 101.4 },
      { lat: 2.9, lon: 101.45 },
      { lat: 2.8, lon: 101.5 },
      { lat: 2.7, lon: 101.55 },
      { lat: 2.6, lon: 101.5 },
      { lat: 2.5, lon: 101.45 },
      { lat: 2.4, lon: 101.4 },
      { lat: 2.4, lon: 101.8 },
      { lat: 3.0, lon: 101.8 },
      { lat: 3.0, lon: 101.4 }
    ],
    // Sumatran coast (west side)
    [
      { lat: 3.0, lon: 101.2 },
      { lat: 3.0, lon: 101.25 },
      { lat: 2.9, lon: 101.28 },
      { lat: 2.8, lon: 101.3 },
      { lat: 2.7, lon: 101.28 },
      { lat: 2.6, lon: 101.3 },
      { lat: 2.5, lon: 101.28 },
      { lat: 2.4, lon: 101.25 },
      { lat: 2.4, lon: 101.2 },
      { lat: 3.0, lon: 101.2 }
    ]
  ],
  depthContours: [
    {
      depth: 10,
      points: [
        { lat: 3.0, lon: 101.38 },
        { lat: 2.7, lon: 101.45 },
        { lat: 2.4, lon: 101.38 }
      ]
    },
    {
      depth: 20,
      points: [
        { lat: 3.0, lon: 101.36 },
        { lat: 2.7, lon: 101.40 },
        { lat: 2.4, lon: 101.36 }
      ]
    },
    {
      depth: 30,
      points: [
        { lat: 3.0, lon: 101.34 },
        { lat: 2.7, lon: 101.36 },
        { lat: 2.4, lon: 101.34 }
      ]
    }
  ],
  soundings: [
    { lat: 2.9, lon: 101.35, depth: 18 },
    { lat: 2.85, lon: 101.38, depth: 24 },
    { lat: 2.8, lon: 101.40, depth: 28 },
    { lat: 2.75, lon: 101.38, depth: 25 },
    { lat: 2.7, lon: 101.36, depth: 32 },
    { lat: 2.65, lon: 101.38, depth: 27 },
    { lat: 2.6, lon: 101.40, depth: 23 },
    { lat: 2.55, lon: 101.37, depth: 29 },
    { lat: 2.5, lon: 101.35, depth: 21 }
  ],
  navAids: [
    { lat: 2.9, lon: 101.40, type: 'buoy-green', name: 'ML1', characteristics: 'Fl.G.4s' },
    { lat: 2.9, lon: 101.32, type: 'buoy-red', name: 'ML2', characteristics: 'Fl.R.4s' },
    { lat: 2.7, lon: 101.42, type: 'buoy-green', name: 'ML3', characteristics: 'Fl.G.4s' },
    { lat: 2.7, lon: 101.32, type: 'buoy-red', name: 'ML4', characteristics: 'Fl.R.4s' },
    { lat: 2.5, lon: 101.40, type: 'buoy-green', name: 'ML5', characteristics: 'Fl.G.4s' },
    { lat: 2.5, lon: 101.32, type: 'buoy-red', name: 'ML6', characteristics: 'Fl.R.4s' }
  ],
  tss: {
    lanes: [
      {
        direction: 315,
        points: [
          { lat: 2.4, lon: 101.40 },
          { lat: 2.7, lon: 101.42 },
          { lat: 3.0, lon: 101.40 }
        ]
      },
      {
        direction: 135,
        points: [
          { lat: 3.0, lon: 101.34 },
          { lat: 2.7, lon: 101.34 },
          { lat: 2.4, lon: 101.34 }
        ]
      }
    ],
    separationZone: [
      { lat: 3.0, lon: 101.36 },
      { lat: 2.7, lon: 101.38 },
      { lat: 2.4, lon: 101.36 },
      { lat: 2.4, lon: 101.38 },
      { lat: 2.7, lon: 101.40 },
      { lat: 3.0, lon: 101.38 }
    ]
  }
};

// Bosphorus Strait Chart
export const bosphorusStrait: ChartData = {
  id: 'bosphorus',
  name: 'Bosphorus Strait',
  description: 'Bosphorus Strait - Istanbul, connecting Black Sea and Sea of Marmara',
  bounds: {
    north: 41.25,
    south: 40.98,
    east: 29.12,
    west: 28.95
  },
  center: { lat: 41.1, lon: 29.05 },
  coastlines: [
    // European side (west)
    [
      { lat: 41.25, lon: 28.95 },
      { lat: 41.22, lon: 28.98 },
      { lat: 41.18, lon: 29.00 },
      { lat: 41.14, lon: 29.02 },
      { lat: 41.10, lon: 29.00 },
      { lat: 41.06, lon: 29.02 },
      { lat: 41.02, lon: 29.00 },
      { lat: 40.98, lon: 29.01 },
      { lat: 40.98, lon: 28.95 },
      { lat: 41.25, lon: 28.95 }
    ],
    // Asian side (east)
    [
      { lat: 41.25, lon: 29.12 },
      { lat: 41.25, lon: 29.06 },
      { lat: 41.22, lon: 29.04 },
      { lat: 41.18, lon: 29.06 },
      { lat: 41.14, lon: 29.08 },
      { lat: 41.10, lon: 29.06 },
      { lat: 41.06, lon: 29.08 },
      { lat: 41.02, lon: 29.06 },
      { lat: 40.98, lon: 29.05 },
      { lat: 40.98, lon: 29.12 },
      { lat: 41.25, lon: 29.12 }
    ]
  ],
  depthContours: [
    {
      depth: 20,
      points: [
        { lat: 41.22, lon: 29.01 },
        { lat: 41.14, lon: 29.04 },
        { lat: 41.06, lon: 29.04 },
        { lat: 40.98, lon: 29.03 }
      ]
    },
    {
      depth: 50,
      points: [
        { lat: 41.22, lon: 29.02 },
        { lat: 41.14, lon: 29.05 },
        { lat: 41.06, lon: 29.05 },
        { lat: 40.98, lon: 29.035 }
      ]
    },
    {
      depth: 80,
      points: [
        { lat: 41.22, lon: 29.03 },
        { lat: 41.14, lon: 29.06 },
        { lat: 41.06, lon: 29.06 },
        { lat: 40.98, lon: 29.04 }
      ]
    }
  ],
  soundings: [
    { lat: 41.20, lon: 29.02, depth: 45 },
    { lat: 41.18, lon: 29.03, depth: 62 },
    { lat: 41.16, lon: 29.04, depth: 78 },
    { lat: 41.14, lon: 29.05, depth: 85 },
    { lat: 41.12, lon: 29.04, depth: 72 },
    { lat: 41.10, lon: 29.03, depth: 58 },
    { lat: 41.08, lon: 29.04, depth: 65 },
    { lat: 41.06, lon: 29.05, depth: 82 },
    { lat: 41.04, lon: 29.04, depth: 70 },
    { lat: 41.02, lon: 29.03, depth: 55 },
    { lat: 41.00, lon: 29.035, depth: 48 }
  ],
  navAids: [
    { lat: 41.22, lon: 29.015, type: 'lighthouse', name: 'Rumeli Lt', characteristics: 'Fl.W.5s' },
    { lat: 41.22, lon: 29.05, type: 'lighthouse', name: 'Anadolu Lt', characteristics: 'Fl.W.5s' },
    { lat: 41.14, lon: 29.03, type: 'buoy-red', name: 'BS1', characteristics: 'Fl.R.3s' },
    { lat: 41.14, lon: 29.07, type: 'buoy-green', name: 'BS2', characteristics: 'Fl.G.3s' },
    { lat: 41.06, lon: 29.03, type: 'buoy-red', name: 'BS3', characteristics: 'Fl.R.3s' },
    { lat: 41.06, lon: 29.07, type: 'buoy-green', name: 'BS4', characteristics: 'Fl.G.3s' },
    { lat: 40.99, lon: 29.02, type: 'lighthouse', name: 'Ahirkapi Lt', characteristics: 'Fl.W.10s' }
  ]
};

// Dover Strait East Chart
export const doverStraitEast: ChartData = {
  id: 'dover-east',
  name: 'Dover Strait East',
  description: 'Dover Strait - Eastern approach, English Channel',
  bounds: {
    north: 51.2,
    south: 50.9,
    east: 1.6,
    west: 1.2
  },
  center: { lat: 51.05, lon: 1.4 },
  coastlines: [
    // English coast (north)
    [
      { lat: 51.2, lon: 1.2 },
      { lat: 51.15, lon: 1.25 },
      { lat: 51.12, lon: 1.35 },
      { lat: 51.10, lon: 1.45 },
      { lat: 51.12, lon: 1.55 },
      { lat: 51.2, lon: 1.6 },
      { lat: 51.2, lon: 1.2 }
    ],
    // French coast (south)
    [
      { lat: 50.9, lon: 1.2 },
      { lat: 50.93, lon: 1.35 },
      { lat: 50.95, lon: 1.45 },
      { lat: 50.93, lon: 1.55 },
      { lat: 50.9, lon: 1.6 },
      { lat: 50.9, lon: 1.2 }
    ]
  ],
  depthContours: [
    {
      depth: 20,
      points: [
        { lat: 51.15, lon: 1.2 },
        { lat: 51.08, lon: 1.4 },
        { lat: 51.15, lon: 1.6 }
      ]
    },
    {
      depth: 30,
      points: [
        { lat: 51.10, lon: 1.2 },
        { lat: 51.05, lon: 1.4 },
        { lat: 51.10, lon: 1.6 }
      ]
    },
    {
      depth: 40,
      points: [
        { lat: 51.00, lon: 1.2 },
        { lat: 51.00, lon: 1.4 },
        { lat: 51.00, lon: 1.6 }
      ]
    }
  ],
  soundings: [
    { lat: 51.12, lon: 1.30, depth: 18 },
    { lat: 51.08, lon: 1.35, depth: 28 },
    { lat: 51.05, lon: 1.40, depth: 38 },
    { lat: 51.02, lon: 1.45, depth: 42 },
    { lat: 50.98, lon: 1.40, depth: 35 },
    { lat: 51.10, lon: 1.50, depth: 22 },
    { lat: 51.06, lon: 1.55, depth: 32 }
  ],
  navAids: [
    { lat: 51.11, lon: 1.33, type: 'lighthouse', name: 'South Foreland Lt', characteristics: 'Fl.W.5s' },
    { lat: 51.08, lon: 1.40, type: 'buoy-green', name: 'DE1', characteristics: 'Fl.G.5s' },
    { lat: 51.02, lon: 1.40, type: 'buoy-red', name: 'DE2', characteristics: 'Fl.R.5s' },
    { lat: 50.96, lon: 1.45, type: 'lighthouse', name: 'Cap Gris-Nez Lt', characteristics: 'Fl.W.5s' }
  ],
  tss: {
    lanes: [
      {
        direction: 50,
        points: [
          { lat: 50.95, lon: 1.2 },
          { lat: 51.02, lon: 1.4 },
          { lat: 51.08, lon: 1.6 }
        ]
      },
      {
        direction: 230,
        points: [
          { lat: 51.12, lon: 1.6 },
          { lat: 51.06, lon: 1.4 },
          { lat: 51.00, lon: 1.2 }
        ]
      }
    ],
    separationZone: [
      { lat: 51.00, lon: 1.2 },
      { lat: 51.04, lon: 1.4 },
      { lat: 51.10, lon: 1.6 },
      { lat: 51.06, lon: 1.6 },
      { lat: 51.02, lon: 1.4 },
      { lat: 50.97, lon: 1.2 }
    ]
  }
};

// Dover Strait West Chart
export const doverStraitWest: ChartData = {
  id: 'dover-west',
  name: 'Dover Strait West',
  description: 'Dover Strait - Western approach, English Channel',
  bounds: {
    north: 51.2,
    south: 50.9,
    east: 1.2,
    west: 0.8
  },
  center: { lat: 51.05, lon: 1.0 },
  coastlines: [
    // English coast (north)
    [
      { lat: 51.2, lon: 0.8 },
      { lat: 51.18, lon: 0.9 },
      { lat: 51.15, lon: 1.0 },
      { lat: 51.13, lon: 1.1 },
      { lat: 51.2, lon: 1.2 },
      { lat: 51.2, lon: 0.8 }
    ],
    // French coast (south)
    [
      { lat: 50.9, lon: 0.8 },
      { lat: 50.92, lon: 0.95 },
      { lat: 50.94, lon: 1.05 },
      { lat: 50.93, lon: 1.15 },
      { lat: 50.9, lon: 1.2 },
      { lat: 50.9, lon: 0.8 }
    ]
  ],
  depthContours: [
    {
      depth: 20,
      points: [
        { lat: 51.15, lon: 0.8 },
        { lat: 51.10, lon: 1.0 },
        { lat: 51.15, lon: 1.2 }
      ]
    },
    {
      depth: 30,
      points: [
        { lat: 51.08, lon: 0.8 },
        { lat: 51.05, lon: 1.0 },
        { lat: 51.08, lon: 1.2 }
      ]
    },
    {
      depth: 40,
      points: [
        { lat: 50.98, lon: 0.8 },
        { lat: 50.98, lon: 1.0 },
        { lat: 50.98, lon: 1.2 }
      ]
    }
  ],
  soundings: [
    { lat: 51.12, lon: 0.85, depth: 15 },
    { lat: 51.08, lon: 0.90, depth: 25 },
    { lat: 51.05, lon: 0.95, depth: 35 },
    { lat: 51.02, lon: 1.00, depth: 40 },
    { lat: 50.98, lon: 1.05, depth: 38 },
    { lat: 51.10, lon: 1.10, depth: 20 },
    { lat: 51.06, lon: 1.15, depth: 30 }
  ],
  navAids: [
    { lat: 51.14, lon: 1.05, type: 'lighthouse', name: 'Dover Lt', characteristics: 'Fl.W.5s' },
    { lat: 51.06, lon: 0.95, type: 'buoy-green', name: 'DW1', characteristics: 'Fl.G.5s' },
    { lat: 51.00, lon: 0.95, type: 'buoy-red', name: 'DW2', characteristics: 'Fl.R.5s' },
    { lat: 50.95, lon: 1.10, type: 'lighthouse', name: 'Calais Lt', characteristics: 'Fl.W.4s' }
  ],
  tss: {
    lanes: [
      {
        direction: 50,
        points: [
          { lat: 50.95, lon: 0.8 },
          { lat: 51.02, lon: 1.0 },
          { lat: 51.08, lon: 1.2 }
        ]
      },
      {
        direction: 230,
        points: [
          { lat: 51.12, lon: 1.2 },
          { lat: 51.06, lon: 1.0 },
          { lat: 51.00, lon: 0.8 }
        ]
      }
    ],
    separationZone: [
      { lat: 51.00, lon: 0.8 },
      { lat: 51.04, lon: 1.0 },
      { lat: 51.10, lon: 1.2 },
      { lat: 51.06, lon: 1.2 },
      { lat: 51.02, lon: 1.0 },
      { lat: 50.97, lon: 0.8 }
    ]
  }
};

// Bab al-Mandab to Suez Canal Chart
export const babAlMandabSuez: ChartData = {
  id: 'bab-al-mandab-suez',
  name: 'Bab al-Mandab to Suez',
  description: 'Red Sea - Bab al-Mandab Strait to Suez Canal entrance',
  bounds: {
    north: 30.0,
    south: 12.4,
    east: 44.0,
    west: 32.5
  },
  center: { lat: 21.0, lon: 38.5 },
  coastlines: [
    // Arabian Peninsula (east coast of Red Sea)
    [
      { lat: 30.0, lon: 32.5 },
      { lat: 29.5, lon: 32.8 },
      { lat: 28.0, lon: 34.5 },
      { lat: 26.0, lon: 36.0 },
      { lat: 24.0, lon: 37.5 },
      { lat: 22.0, lon: 38.5 },
      { lat: 20.0, lon: 39.5 },
      { lat: 18.0, lon: 40.5 },
      { lat: 16.0, lon: 41.5 },
      { lat: 14.0, lon: 42.5 },
      { lat: 12.6, lon: 43.2 },
      { lat: 12.4, lon: 44.0 },
      { lat: 30.0, lon: 44.0 },
      { lat: 30.0, lon: 32.5 }
    ],
    // African coast (west coast of Red Sea)
    [
      { lat: 30.0, lon: 32.5 },
      { lat: 29.8, lon: 32.55 },
      { lat: 28.5, lon: 33.5 },
      { lat: 26.5, lon: 34.2 },
      { lat: 24.5, lon: 35.5 },
      { lat: 22.5, lon: 36.5 },
      { lat: 20.5, lon: 37.5 },
      { lat: 18.5, lon: 38.5 },
      { lat: 16.5, lon: 39.5 },
      { lat: 14.5, lon: 40.5 },
      { lat: 12.8, lon: 42.8 },
      { lat: 12.4, lon: 43.0 },
      { lat: 12.4, lon: 32.5 },
      { lat: 30.0, lon: 32.5 }
    ]
  ],
  depthContours: [
    {
      depth: 100,
      points: [
        { lat: 28.0, lon: 34.0 },
        { lat: 24.0, lon: 36.5 },
        { lat: 20.0, lon: 38.5 },
        { lat: 16.0, lon: 40.5 },
        { lat: 12.8, lon: 43.0 }
      ]
    },
    {
      depth: 500,
      points: [
        { lat: 28.0, lon: 34.2 },
        { lat: 24.0, lon: 37.0 },
        { lat: 20.0, lon: 39.0 },
        { lat: 16.0, lon: 41.0 }
      ]
    },
    {
      depth: 1000,
      points: [
        { lat: 26.0, lon: 35.0 },
        { lat: 22.0, lon: 37.5 },
        { lat: 18.0, lon: 39.5 }
      ]
    }
  ],
  soundings: [
    { lat: 29.0, lon: 33.5, depth: 85 },
    { lat: 27.0, lon: 35.0, depth: 450 },
    { lat: 25.0, lon: 36.5, depth: 1200 },
    { lat: 23.0, lon: 37.5, depth: 1500 },
    { lat: 21.0, lon: 38.5, depth: 1800 },
    { lat: 19.0, lon: 39.5, depth: 1600 },
    { lat: 17.0, lon: 40.5, depth: 1100 },
    { lat: 15.0, lon: 41.5, depth: 750 },
    { lat: 13.5, lon: 42.5, depth: 320 },
    { lat: 12.7, lon: 43.0, depth: 180 }
  ],
  navAids: [
    { lat: 29.95, lon: 32.57, type: 'lighthouse', name: 'Suez Lt', characteristics: 'Fl.W.10s' },
    { lat: 27.85, lon: 34.3, type: 'lighthouse', name: 'Shadwan Lt', characteristics: 'Fl.W.15s' },
    { lat: 22.0, lon: 38.0, type: 'buoy-yellow', name: 'RS-1', characteristics: 'Fl.Y.5s' },
    { lat: 18.0, lon: 40.0, type: 'buoy-yellow', name: 'RS-2', characteristics: 'Fl.Y.5s' },
    { lat: 14.0, lon: 42.0, type: 'buoy-yellow', name: 'RS-3', characteristics: 'Fl.Y.5s' },
    { lat: 12.65, lon: 43.15, type: 'lighthouse', name: 'Perim Lt', characteristics: 'Fl.W.5s' }
  ]
};

// Persian Gulf with Strait of Hormuz Chart
export const persianGulfHormuz: ChartData = {
  id: 'persian-gulf',
  name: 'Persian Gulf / Hormuz',
  description: 'Persian Gulf with Strait of Hormuz',
  bounds: {
    north: 30.0,
    south: 24.0,
    east: 57.0,
    west: 48.0
  },
  center: { lat: 27.0, lon: 52.5 },
  coastlines: [
    // Iranian coast (north)
    [
      { lat: 30.0, lon: 48.0 },
      { lat: 29.5, lon: 49.5 },
      { lat: 28.5, lon: 51.0 },
      { lat: 27.5, lon: 52.5 },
      { lat: 27.0, lon: 54.0 },
      { lat: 26.5, lon: 55.5 },
      { lat: 26.0, lon: 56.5 },
      { lat: 25.5, lon: 57.0 },
      { lat: 30.0, lon: 57.0 },
      { lat: 30.0, lon: 48.0 }
    ],
    // Arabian coast (south)
    [
      { lat: 30.0, lon: 48.0 },
      { lat: 29.0, lon: 48.5 },
      { lat: 28.0, lon: 49.5 },
      { lat: 27.0, lon: 50.5 },
      { lat: 26.0, lon: 51.5 },
      { lat: 25.5, lon: 52.5 },
      { lat: 25.0, lon: 54.0 },
      { lat: 24.5, lon: 55.5 },
      { lat: 24.0, lon: 56.5 },
      { lat: 24.0, lon: 48.0 },
      { lat: 30.0, lon: 48.0 }
    ],
    // Oman (south of Hormuz)
    [
      { lat: 24.0, lon: 56.5 },
      { lat: 24.5, lon: 56.3 },
      { lat: 25.0, lon: 56.8 },
      { lat: 24.0, lon: 57.0 },
      { lat: 24.0, lon: 56.5 }
    ]
  ],
  depthContours: [
    {
      depth: 20,
      points: [
        { lat: 29.0, lon: 49.0 },
        { lat: 27.5, lon: 51.5 },
        { lat: 26.0, lon: 54.0 },
        { lat: 25.5, lon: 55.5 }
      ]
    },
    {
      depth: 50,
      points: [
        { lat: 28.5, lon: 50.0 },
        { lat: 27.0, lon: 52.5 },
        { lat: 26.0, lon: 55.0 }
      ]
    },
    {
      depth: 80,
      points: [
        { lat: 28.0, lon: 51.0 },
        { lat: 26.5, lon: 53.5 },
        { lat: 26.0, lon: 55.5 }
      ]
    }
  ],
  soundings: [
    { lat: 29.0, lon: 49.5, depth: 28 },
    { lat: 28.0, lon: 50.5, depth: 42 },
    { lat: 27.0, lon: 52.0, depth: 65 },
    { lat: 26.5, lon: 53.5, depth: 78 },
    { lat: 26.0, lon: 55.0, depth: 85 },
    { lat: 25.8, lon: 56.0, depth: 72 },
    { lat: 26.3, lon: 56.3, depth: 95 },
    { lat: 25.5, lon: 56.5, depth: 110 },
    { lat: 28.5, lon: 49.0, depth: 18 },
    { lat: 27.5, lon: 51.0, depth: 55 }
  ],
  navAids: [
    { lat: 29.0, lon: 48.8, type: 'lighthouse', name: 'Kuwait Lt', characteristics: 'Fl.W.10s' },
    { lat: 26.2, lon: 56.1, type: 'lighthouse', name: 'Hormuz Lt', characteristics: 'Fl.W.5s' },
    { lat: 26.5, lon: 56.0, type: 'buoy-green', name: 'HZ1', characteristics: 'Fl.G.4s' },
    { lat: 26.0, lon: 56.2, type: 'buoy-red', name: 'HZ2', characteristics: 'Fl.R.4s' },
    { lat: 25.8, lon: 56.5, type: 'buoy-green', name: 'HZ3', characteristics: 'Fl.G.4s' },
    { lat: 25.5, lon: 56.3, type: 'buoy-red', name: 'HZ4', characteristics: 'Fl.R.4s' },
    { lat: 27.0, lon: 52.0, type: 'buoy-yellow', name: 'PG-1', characteristics: 'Fl.Y.5s' }
  ],
  tss: {
    lanes: [
      {
        direction: 290,
        points: [
          { lat: 25.6, lon: 57.0 },
          { lat: 26.0, lon: 56.3 },
          { lat: 26.5, lon: 55.5 }
        ]
      },
      {
        direction: 110,
        points: [
          { lat: 26.3, lon: 55.5 },
          { lat: 25.8, lon: 56.3 },
          { lat: 25.4, lon: 57.0 }
        ]
      }
    ],
    separationZone: [
      { lat: 26.5, lon: 55.5 },
      { lat: 26.0, lon: 56.3 },
      { lat: 25.55, lon: 57.0 },
      { lat: 25.45, lon: 57.0 },
      { lat: 25.9, lon: 56.3 },
      { lat: 26.35, lon: 55.5 }
    ]
  }
};

// All charts collection
export const allCharts: ChartData[] = [
  singaporeStrait,
  malaccaStrait,
  bosphorusStrait,
  doverStraitEast,
  doverStraitWest,
  babAlMandabSuez,
  persianGulfHormuz
];

export function getChartById(id: string): ChartData | undefined {
  return allCharts.find(chart => chart.id === id);
}
