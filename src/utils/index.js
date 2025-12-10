export function createPageUrl(pageName) {
  const routes = {
    Home: "/",
    Store: "/store",
    ProductDetails: "/product",
  };
  return routes[pageName] || "/";
}

