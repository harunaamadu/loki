/** Clean canonical product URL: no query string or hash. */
export function productShareUrl(origin: string, productId: string) {
  return `${origin.replace(/\/+$/, "")}/product/${encodeURIComponent(productId)}`;
}

export function shareLinks(url: string, text: string) {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(text);
  const both = encodeURIComponent(`${text}\n${url}`);
  return {
    whatsapp: `https://wa.me/?text=${both}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
    x: `https://twitter.com/intent/tweet?text=${t}&url=${u}`,
    email: `mailto:?subject=${t}&body=${both}`,
  };
}
