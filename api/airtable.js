// Vercel Function: server-side proxy for Airtable (/api/airtable).
// The token lives only in Vercel's environment variables (AIRTABLE_TOKEN),
// and only the dashboard's own tables can be reached.
//
// Browser calls:
//   GET   /api/airtable?table=tblXXX[&offset=...]   list records
//   POST  /api/airtable?table=tblXXX                create  (body: { records: [...] })
//   PATCH /api/airtable?table=tblXXX&id=recXXX      update  (body: { fields: {...} })

const BASE_ID = process.env.AIRTABLE_BASE_ID || "appq0ev1rvBz2jLAy";

const ALLOWED_TABLES = new Set([
  "tblHBMLHsz6XBKmyZ", // Conversations
  "tblYKh6qPeuuhbxVB", // Stock
  "tblNBHONiupSnyX2g", // Orders / Delivery
]);

async function handler(req) {
  const token = process.env.AIRTABLE_TOKEN;
  if (!token) {
    return Response.json({ error: "AIRTABLE_TOKEN is not set in Vercel" }, { status: 500 });
  }

  const params = new URL(req.url).searchParams;
  const table = params.get("table");
  const id = params.get("id");
  const offset = params.get("offset");

  if (!ALLOWED_TABLES.has(table)) {
    return Response.json({ error: "Table not allowed" }, { status: 403 });
  }
  if (id && !/^rec[A-Za-z0-9]{14}$/.test(id)) {
    return Response.json({ error: "Bad record id" }, { status: 400 });
  }

  let url = `https://api.airtable.com/v0/${BASE_ID}/${table}`;
  const init = {
    method: req.method,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  };

  if (req.method === "GET") {
    url += `?pageSize=100${offset ? "&offset=" + encodeURIComponent(offset) : ""}`;
  } else if (req.method === "POST") {
    init.body = await req.text();
  } else if (req.method === "PATCH") {
    if (!id) return Response.json({ error: "Missing record id" }, { status: 400 });
    url += `/${id}`;
    init.body = await req.text();
  } else {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const res = await fetch(url, init);
  return new Response(await res.text(), {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}

export { handler as GET, handler as POST, handler as PATCH };
