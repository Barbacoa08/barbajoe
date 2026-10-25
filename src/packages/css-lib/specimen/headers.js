// Interactive header examples only. Applications own navigation and updates.
for (const header of document.querySelectorAll("[data-header-example]")) {
	const status = header.parentElement.querySelector("[data-header-status]");
	for (const link of header.querySelectorAll("[data-header-page]")) {
		link.addEventListener("click", (event) => {
			event.preventDefault();
			for (const item of header.querySelectorAll("li.active"))
				item.classList.remove("active");
			for (const current of header.querySelectorAll("[aria-current]"))
				current.removeAttribute("aria-current");
			link.setAttribute("aria-current", "page");
			status.textContent = `${link.textContent} selected in this example.`;
		});
	}
	const update = header.querySelector("[data-header-update]");
	let updates = 0;
	update?.addEventListener("click", () => {
		updates += 1;
		status.textContent = `Demo update completed (${updates}). No application data changed.`;
	});
}
