const API_BASE = "/api";

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: { "Content-Type": "application/json" },
    ...options,
  };

  if (config.body && typeof config.body === "object") {
    config.body = JSON.stringify(config.body);
  }

  const res = await fetch(url, config);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// Data layer
export const api = {
  // Full data
  getAllData: () => request("/data"),
  saveAllData: (data) => request("/data", { method: "POST", body: data }),

  // Families
  getFamilies: () => request("/families"),
  createFamily: (family) =>
    request("/families", { method: "POST", body: family }),
  updateFamily: (id, family) =>
    request(`/families/${id}`, { method: "PUT", body: family }),
  deleteFamily: (id) => request(`/families/${id}`, { method: "DELETE" }),

  // Dinners
  getDinners: () => request("/dinners"),
  createDinner: (dinner) =>
    request("/dinners", { method: "POST", body: dinner }),
  updateDinner: (id, dinner) =>
    request(`/dinners/${id}`, { method: "PUT", body: dinner }),
  deleteDinner: (id) => request(`/dinners/${id}`, { method: "DELETE" }),

  // Dishes
  getDishes: () => request("/dishes"),
  createDish: (dish) => request("/dishes", { method: "POST", body: dish }),
  updateDish: (id, dish) =>
    request(`/dishes/${id}`, { method: "PUT", body: dish }),
  deleteDish: (id) => request(`/dishes/${id}`, { method: "DELETE" }),

  // Shopping
  getShopping: () => request("/shoppingItems"),
  createShoppingItem: (item) =>
    request("/shoppingItems", { method: "POST", body: item }),
  updateShoppingItem: (id, item) =>
    request(`/shoppingItems/${id}`, { method: "PUT", body: item }),
  deleteShoppingItem: (id) =>
    request(`/shoppingItems/${id}`, { method: "DELETE" }),

  // DinnerDishes (links dishes to dinners + family)
  getDinnerDishes: () => request("/dinnerDishes"),
  createDinnerDish: (item) =>
    request("/dinnerDishes", { method: "POST", body: item }),
  updateDinnerDish: (id, item) =>
    request(`/dinnerDishes/${id}`, { method: "PUT", body: item }),
  deleteDinnerDish: (id) =>
    request(`/dinnerDishes/${id}`, { method: "DELETE" }),

  // Posts
  getPosts: () => request("/posts"),
  createPost: (post) => request("/posts", { method: "POST", body: post }),
  updatePost: (id, post) =>
    request(`/posts/${id}`, { method: "PUT", body: post }),
  deletePost: (id) => request(`/posts/${id}`, { method: "DELETE" }),
};
