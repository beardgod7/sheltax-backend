const test = require("node:test");
const assert = require("node:assert/strict");

const baseUrl = process.env.TEST_API_URL;
const ownerToken = process.env.TEST_OWNER_TOKEN;
const adminToken = process.env.TEST_ADMIN_TOKEN;

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      "content-type": "application/json",
      ...(options.headers || {}),
    },
  });
  const body = await response.json();
  return { response, body };
}

test("public discovery exposes only approved canonical Listings", {
  skip: !baseUrl && "Set TEST_API_URL to run HTTP integration tests.",
}, async () => {
  const { response, body } = await request("/api/v1/properties");
  assert.equal(response.status, 200);
  assert.equal(body.success, true);
  assert.ok(body.data.properties.every((listing) => listing.approvalStatus === "APPROVED"));
  assert.equal(typeof body.data.meta.totalRows, "number");
});

test("the authenticated owner inventory includes every review state", {
  skip: (!baseUrl || !ownerToken) && "Set TEST_API_URL and TEST_OWNER_TOKEN.",
}, async () => {
  const { response, body } = await request("/api/v1/owner/properties", {
    headers: { authorization: `Bearer ${ownerToken}` },
  });
  assert.equal(response.status, 200);
  assert.equal(body.success, true);
  assert.ok(Array.isArray(body.data.properties));
  assert.equal(typeof body.data.meta.totalPages, "number");
});

test("listing creation reports the owner's authoritative KYC state", {
  skip: (!baseUrl || !ownerToken) && "Set TEST_API_URL and TEST_OWNER_TOKEN.",
}, async () => {
  const { response, body } = await request("/api/v1/properties", {
    method: "POST",
    headers: { authorization: `Bearer ${ownerToken}` },
    body: JSON.stringify({}),
  });
  assert.ok([400, 403].includes(response.status));
  if (response.status === 403) {
    assert.equal(body.code, "KYC_REQUIRED");
    assert.ok(["UNSUBMITTED", "PENDING", "REJECTED"].includes(body.kycStatus));
  }
});

test("admin listing review rejects an empty rejection reason", {
  skip: (!baseUrl || !adminToken) && "Set TEST_API_URL and TEST_ADMIN_TOKEN.",
}, async () => {
  const { response } = await request("/api/v1/admin/properties/00000000-0000-0000-0000-000000000000/status", {
    method: "PATCH",
    headers: { authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ approvalStatus: "REJECTED", rejectionReason: "" }),
  });
  assert.equal(response.status, 400);
});
