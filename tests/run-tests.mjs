/**
 * morphui — Comprehensive End-to-End Test Suite
 * Tests every API route and UI feature programmatically
 * Run with: node tests/run-tests.mjs
 */

import { readFileSync } from "fs";

const BASE = "http://localhost:3000";
const PASS = "\x1b[32m✓\x1b[0m";
const FAIL = "\x1b[31m✗\x1b[0m";
const INFO = "\x1b[36mℹ\x1b[0m";
const WARN = "\x1b[33m⚠\x1b[0m";

let passed = 0, failed = 0, skipped = 0;
const results = [];

async function test(name, fn) {
  try {
    const start = Date.now();
    await fn();
    const ms = Date.now() - start;
    console.log(`  ${PASS} ${name} \x1b[90m(${ms}ms)\x1b[0m`);
    passed++;
    results.push({ name, status: "pass", ms });
  } catch (e) {
    console.log(`  ${FAIL} ${name}`);
    console.log(`     \x1b[31m${e.message}\x1b[0m`);
    failed++;
    results.push({ name, status: "fail", error: e.message });
  }
}

function skip(name, reason) {
  console.log(`  ${WARN} SKIP ${name} — ${reason}`);
  skipped++;
  results.push({ name, status: "skip", reason });
}

function assert(condition, msg) {
  if (!condition) throw new Error(msg || "Assertion failed");
}

function section(title) {
  console.log(`\n\x1b[1m\x1b[35m▸ ${title}\x1b[0m`);
}

// Generate a minimal 1x1 white PNG as base64
function minimalPNG() {
  // Minimal valid PNG (1x1 white pixel)
  const b64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI6QAAAABJRU5ErkJggg==";
  return b64;
}

// ──────────────────────────────────────────
// TEST GROUPS
// ──────────────────────────────────────────

section("1. Server Availability");

await test("GET / returns 200", async () => {
  const res = await fetch(`${BASE}/`);
  assert(res.status === 200, `Expected 200, got ${res.status}`);
});

await test("GET /admin/login returns 200", async () => {
  const res = await fetch(`${BASE}/admin/login`);
  assert(res.status === 200, `Expected 200, got ${res.status}`);
});

await test("GET /admin redirects to /admin/login (no session)", async () => {
  const res = await fetch(`${BASE}/admin`, { redirect: "manual" });
  // Should redirect (302) to login
  assert(
    res.status === 307 || res.status === 302 || res.status === 308,
    `Expected redirect, got ${res.status}`
  );
});

await test("GET /api/health returns JSON with status ok", async () => {
  const res = await fetch(`${BASE}/api/health`);
  assert(res.status === 200, `Expected 200, got ${res.status}`);
  const data = await res.json();
  assert(data.status === "ok", `Expected status=ok, got ${data.status}`);
  assert(typeof data.uptime === "number", "uptime should be a number");
  assert(data.project === "morphui", `Expected project=morphui, got ${data.project}`);
});

await test("GET /api/history returns JSON", async () => {
  const res = await fetch(`${BASE}/api/history`);
  assert(res.status === 200, `Expected 200, got ${res.status}`);
  const data = await res.json();
  assert(Array.isArray(data.data), "data.data should be an array");
});

await test("GET /api/history?limit=5 respects limit param", async () => {
  const res = await fetch(`${BASE}/api/history?limit=5`);
  const data = await res.json();
  assert(Array.isArray(data.data), "data.data should be an array");
  assert(data.data.length <= 5, `Got ${data.data.length} items, expected ≤5`);
});

section("2. Admin Authentication");

let adminCookie = "";

await test("POST /api/admin/auth with wrong password returns 401", async () => {
  const res = await fetch(`${BASE}/api/admin/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "admin", password: "wrongpassword" }),
  });
  assert(res.status === 401, `Expected 401, got ${res.status}`);
  const data = await res.json();
  assert(data.success === false, "success should be false");
});

await test("POST /api/admin/auth with empty credentials returns 401", async () => {
  const res = await fetch(`${BASE}/api/admin/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "", password: "" }),
  });
  assert(res.status === 401, `Expected 401, got ${res.status}`);
});

await test("POST /api/admin/auth with correct credentials returns 200 + cookie", async () => {
  const res = await fetch(`${BASE}/api/admin/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "admin", password: "morphui@2026" }),
  });
  assert(res.status === 200, `Expected 200, got ${res.status}`);
  const data = await res.json();
  assert(data.success === true, "success should be true");
  const setCookie = res.headers.get("set-cookie");
  assert(setCookie && setCookie.includes("morphui_admin_session"), "Should set session cookie");
  adminCookie = setCookie?.split(";")[0] ?? "";
});

await test("GET /admin with valid session returns 200 (not redirect)", async () => {
  if (!adminCookie) throw new Error("No admin cookie from previous test");
  const res = await fetch(`${BASE}/admin`, {
    headers: { cookie: adminCookie },
    redirect: "manual",
  });
  assert(res.status === 200, `Expected 200 with valid session, got ${res.status}`);
});

await test("DELETE /api/admin/auth clears cookie", async () => {
  if (!adminCookie) throw new Error("No admin cookie from previous test");
  const res = await fetch(`${BASE}/api/admin/auth`, {
    method: "DELETE",
    headers: { cookie: adminCookie },
  });
  assert(res.status === 200, `Expected 200, got ${res.status}`);
  const setCookie = res.headers.get("set-cookie");
  assert(setCookie?.includes("Max-Age=0") || setCookie?.includes("morphui_admin_session=;"), "Should clear cookie");
});

section("3. Admin AI Assistant");

// Re-login for these tests
const loginRes = await fetch(`${BASE}/api/admin/auth`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ username: "admin", password: "morphui@2026" }),
});
adminCookie = loginRes.headers.get("set-cookie")?.split(";")[0] ?? "";

await test("POST /api/admin/assistant without session returns 401", async () => {
  const res = await fetch(`${BASE}/api/admin/assistant`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: "hello" }),
  });
  assert(res.status === 401, `Expected 401, got ${res.status}`);
});

await test("POST /api/admin/assistant with no prompt returns 400", async () => {
  const res = await fetch(`${BASE}/api/admin/assistant`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: adminCookie },
    body: JSON.stringify({ prompt: "" }),
  });
  assert(res.status === 400, `Expected 400, got ${res.status}`);
});

skip(
  "POST /api/admin/assistant with valid prompt returns AI response",
  "Requires valid ANTHROPIC_API_KEY (not set in this environment)"
);

section("4. Code Generation API");

await test("POST /api/generate with no body returns error", async () => {
  const res = await fetch(`${BASE}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  assert(!res.ok || res.status >= 400, `Expected error response, got ${res.status}`);
});

await test("POST /api/generate with invalid base64 returns error", async () => {
  const res = await fetch(`${BASE}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      imageBase64: "not-valid-base64!!",
      mediaType: "image/png",
      framework: "html",
    }),
  });
  // Should either fail with 400/500 or return error JSON (if no API key)
  const data = await res.json();
  assert(data.error || !res.ok, "Should return an error for invalid input");
});

await test("POST /api/generate with missing ANTHROPIC_API_KEY returns meaningful error", async () => {
  const res = await fetch(`${BASE}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      imageBase64: minimalPNG(),
      mediaType: "image/png",
      framework: "html",
    }),
  });
  // Without API key this should return an error message
  const data = await res.json();
  // Should have an error property, not crash with 500 unhandled
  assert(
    typeof data.error === "string",
    `Expected data.error to be string, got: ${JSON.stringify(data)}`
  );
  console.log(`     ${INFO} Error message: "${data.error.substring(0, 80)}..."`);
});

skip(
  "POST /api/generate with valid image + API key returns HTML code",
  "Requires valid ANTHROPIC_API_KEY"
);

section("5. Framework Validation");

for (const framework of ["html", "tailwind", "react"]) {
  await test(`POST /api/generate accepts framework="${framework}"`, async () => {
    const res = await fetch(`${BASE}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imageBase64: minimalPNG(),
        mediaType: "image/png",
        framework,
      }),
    });
    const data = await res.json();
    // Should either return error (no API key) or success - just not crash with 500 + HTML
    const isJson = typeof data === "object";
    assert(isJson, `Expected JSON response for framework=${framework}`);
  });
}

section("6. Security Checks");

await test("Admin routes are protected — no cookie = redirect", async () => {
  const res = await fetch(`${BASE}/admin`, { redirect: "manual" });
  assert(
    [302, 307, 308].includes(res.status),
    `Expected redirect for unauthed /admin, got ${res.status}`
  );
});

await test("Admin AI endpoint rejects requests without auth cookie", async () => {
  const res = await fetch(`${BASE}/api/admin/assistant`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: "test" }),
  });
  assert(res.status === 401, `Expected 401, got ${res.status}`);
});

await test("SQL injection attempt in framework param is handled", async () => {
  const res = await fetch(`${BASE}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      imageBase64: minimalPNG(),
      mediaType: "image/png",
      framework: "'; DROP TABLE generations; --",
    }),
  });
  const data = await res.json();
  assert(typeof data === "object", "Should return JSON, not crash");
});

await test("XSS attempt in framework param is handled", async () => {
  const res = await fetch(`${BASE}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      imageBase64: minimalPNG(),
      mediaType: "image/png",
      framework: "<script>alert('xss')</script>",
    }),
  });
  const data = await res.json();
  assert(typeof data === "object", "Should return JSON, not crash");
});

section("7. Response Headers & Content-Type");

await test("GET /api/health returns Content-Type: application/json", async () => {
  const res = await fetch(`${BASE}/api/health`);
  const ct = res.headers.get("content-type") ?? "";
  assert(ct.includes("application/json"), `Expected application/json, got "${ct}"`);
});

await test("GET / returns Content-Type: text/html", async () => {
  const res = await fetch(`${BASE}/`);
  const ct = res.headers.get("content-type") ?? "";
  assert(ct.includes("text/html"), `Expected text/html, got "${ct}"`);
});

await test("GET /admin/login returns Content-Type: text/html", async () => {
  const res = await fetch(`${BASE}/admin/login`);
  const ct = res.headers.get("content-type") ?? "";
  assert(ct.includes("text/html"), `Expected text/html, got "${ct}"`);
});

section("8. 404 Handling");

await test("GET /nonexistent-page returns 404", async () => {
  const res = await fetch(`${BASE}/this-does-not-exist`);
  assert(res.status === 404, `Expected 404, got ${res.status}`);
});

await test("POST to unknown API route returns 404", async () => {
  const res = await fetch(`${BASE}/api/nonexistent`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });
  assert(res.status === 404, `Expected 404, got ${res.status}`);
});

section("9. Performance Checks");

await test("GET / responds within 2000ms", async () => {
  const start = Date.now();
  const res = await fetch(`${BASE}/`);
  const ms = Date.now() - start;
  assert(res.status === 200, "Should return 200");
  assert(ms < 2000, `Took ${ms}ms, expected < 2000ms`);
  console.log(`     ${INFO} Response time: ${ms}ms`);
});

await test("GET /api/health responds within 1000ms", async () => {
  const start = Date.now();
  await fetch(`${BASE}/api/health`);
  const ms = Date.now() - start;
  assert(ms < 1000, `Took ${ms}ms, expected < 1000ms`);
  console.log(`     ${INFO} Response time: ${ms}ms`);
});

await test("GET /admin/login responds within 2000ms", async () => {
  const start = Date.now();
  await fetch(`${BASE}/admin/login`);
  const ms = Date.now() - start;
  assert(ms < 2000, `Took ${ms}ms, expected < 2000ms`);
  console.log(`     ${INFO} Response time: ${ms}ms`);
});

// ──────────────────────────────────────────
// RESULTS SUMMARY
// ──────────────────────────────────────────

const total = passed + failed + skipped;
console.log(`
\x1b[1m═══════════════════════════════════════\x1b[0m
\x1b[1m  morphui Test Results\x1b[0m
\x1b[1m═══════════════════════════════════════\x1b[0m
  Total:   ${total}
  \x1b[32mPassed:  ${passed}\x1b[0m
  \x1b[31mFailed:  ${failed}\x1b[0m
  \x1b[33mSkipped: ${skipped}\x1b[0m (require API key)
═══════════════════════════════════════
`);

if (failed > 0) {
  console.log("\x1b[31m✗ FAILING TESTS:\x1b[0m");
  results.filter(r => r.status === "fail").forEach(r => {
    console.log(`  • ${r.name}: ${r.error}`);
  });
  process.exit(1);
} else {
  console.log("\x1b[32m✓ All tests passed!\x1b[0m");
  process.exit(0);
}
