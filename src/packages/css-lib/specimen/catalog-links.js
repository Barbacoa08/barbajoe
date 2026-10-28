// Compatibility for saved catalog bookmarks. Destinations live in ordinary
// fallback links, so they also work without JavaScript and through Parcel.
function followCatalogBookmark() {
	let id;
	try {
		id = decodeURIComponent(window.location.hash.slice(1));
	} catch {
		return;
	}
	const link = document.getElementById(id);
	if (
		!(link instanceof HTMLAnchorElement) ||
		!link.hasAttribute("data-catalog-target")
	)
		return;
	const destination = new URL(link.href);
	destination.search = window.location.search;
	window.location.replace(destination.href);
}

window.addEventListener("hashchange", followCatalogBookmark);
followCatalogBookmark();
