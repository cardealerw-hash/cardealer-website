// app/api/keepalive/route.ts

export async function GET() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`,
    {
      headers: {
        apikey: process.env.SUPABASE_ANON_KEY!,
      },
    }
  );

  return Response.json({
    status: res.status,
    time: new Date().toISOString(),
  });
}