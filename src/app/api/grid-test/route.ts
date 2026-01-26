import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

// Different GRID API endpoints
const ENDPOINTS = {
  LIVE_DATA_OPEN: 'https://api-op.grid.gg/live-data-feed/series-state/graphql',
  LIVE_DATA_FULL: 'https://api.grid.gg/live-data-feed/series-state/graphql',
  CENTRAL_DATA: 'https://api.grid.gg/central-data/graphql',
};

// Test query for Central Data API (static data)
const CENTRAL_DATA_QUERY = `
  query {
    titles {
      id
      name
    }
  }
`;

// Query to get series (real match data)
const SERIES_QUERY = `
  query GetSeries($first: Int) {
    allSeries(first: $first) {
      edges {
        node {
          id
          startTimeScheduled
          format {
            nameShortened
          }
          teams {
            baseInfo {
              name
              # shortName might not exist on baseInfo, removing to be safe
              code 
            }
          }
          tournament {
            name
          }
        }
      }
    }
  }
`;

// Test query for Series State
const SERIES_STATE_QUERY = `
  query GetSeriesState($id: ID!) {
    seriesState(id: $id) {
      id
      started
      finished
    }
  }
`;

async function testEndpoint(endpoint: string, query: string, variables: any, apiKey: string) {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({ query, variables }),
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    return {
      endpoint,
      status: response.status,
      ok: response.ok,
      data,
    };
  } catch (error: any) {
    return {
      endpoint,
      status: 'error',
      ok: false,
      error: error.message,
    };
  }
}

export async function GET(req: NextRequest) {
  const apiKey = process.env.GRID_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json({ 
      error: "GRID_API_KEY not configured",
    }, { status: 500 });
  }

  const results = await Promise.all([
    // Test Central Data API - Titles
    testEndpoint(ENDPOINTS.CENTRAL_DATA, CENTRAL_DATA_QUERY, {}, apiKey),
    
    // Test Central Data API - Series (real match data)
    testEndpoint(ENDPOINTS.CENTRAL_DATA, SERIES_QUERY, { first: 5 }, apiKey),
    
    // Test Live Data Feed - Open Access endpoint
    testEndpoint(ENDPOINTS.LIVE_DATA_OPEN, SERIES_STATE_QUERY, { id: "3" }, apiKey),
  ]);

  return NextResponse.json({
    apiKeyPrefix: apiKey.substring(0, 8) + "...",
    results,
  });
}
