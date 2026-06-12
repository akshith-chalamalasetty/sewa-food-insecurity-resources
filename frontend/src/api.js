// Local dev talks to the local backend; in production Netlify injects
// VITE_API_URL pointing at the Render backend.
const BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function authHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, opts = {}) {
  const res = await fetch(BASE + path, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...authHeader(),
      ...(opts.headers || {}),
    },
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(detail.detail || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  register: (d) => request("/auth/register", { method: "POST", body: JSON.stringify(d) }),
  login: (d) => request("/auth/login", { method: "POST", body: JSON.stringify(d) }),
  googleLogin: (credential) =>
    request("/auth/google", { method: "POST", body: JSON.stringify({ credential }) }),
  me: () => request("/auth/me"),
  saveIntake: (d) => request("/auth/intake", { method: "POST", body: JSON.stringify(d) }),

  pantries: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request("/pantries" + (q ? `?${q}` : ""));
  },

  resources: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request("/resources" + (q ? `?${q}` : ""));
  },

  recommend: (d) => request("/intake/recommend", { method: "POST", body: JSON.stringify(d) }),

  foodListings: (zip) => request("/food-listings" + (zip ? `?zip=${zip}` : "")),
  createFoodListing: (d) => request("/food-listings", { method: "POST", body: JSON.stringify(d) }),
  claimFoodListing: (id) => request(`/food-listings/${id}/claim`, { method: "POST" }),

  volunteers: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request("/volunteers" + (q ? `?${q}` : ""));
  },
  registerVolunteer: (d) => request("/volunteers", { method: "POST", body: JSON.stringify(d) }),

  donors: () => request("/donors"),
  registerDonor: (d) => request("/donors", { method: "POST", body: JSON.stringify(d) }),
  claimDonor: (id) => request(`/donors/${id}/claim`, { method: "POST" }),

  donate: (d) => request("/donations", { method: "POST", body: JSON.stringify(d) }),

  mealPlans: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request("/meal-plans" + (q ? `?${q}` : ""));
  },

  chat: (message, language, history = []) =>
    request("/chat", { method: "POST", body: JSON.stringify({ message, language, history }) }),
  chatStatus: () => request("/chat/status"),
};
