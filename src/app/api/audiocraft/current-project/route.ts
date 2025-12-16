// Next.js API route for NoiseCraft current-project endpoint
// This replaces the NoiseCraft server's /current-project endpoint

let cachedProjectData: string | null = null;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let data = body?.data ?? body?.project ?? body;
    
    if (typeof data === "object") {
      data = JSON.stringify(data);
    }
    
    if (typeof data !== "string") {
      return new Response(JSON.stringify({ error: "Invalid data format" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    // Validate JSON
    JSON.parse(data);
    
    cachedProjectData = data;
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.warn("Failed to cache project for embed", err);
    return new Response(JSON.stringify({ error: "Invalid request" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function GET() {
  if (!cachedProjectData) {
    return new Response(JSON.stringify({ error: "No cached project" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }
  
  return new Response(cachedProjectData, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

