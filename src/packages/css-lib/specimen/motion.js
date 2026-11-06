// Specimen-only state and FLIP mechanics. The npm package ships CSS, not this file.
const preference = matchMedia("(prefers-reduced-motion: reduce)");

function milliseconds(value) {
	const match = /^(\d+(?:\.\d+)?|\.\d+)(ms|s)$/.exec(value.trim());
	return match ? Number(match[1]) * (match[2] === "s" ? 1000 : 1) : 0;
}

for (const demo of document.querySelectorAll("[data-motion-demo]")) {
	const list = demo.querySelector("ul");
	const instant = demo.querySelector("input");
	const status = demo.querySelector('[role="status"]');
	const cancel = () => {
		for (const animation of list.getAnimations({ subtree: true }))
			animation.cancel();
	};
	const update = () => {
		if (preference.matches || instant.checked) cancel();
		status.textContent = preference.matches
			? "Reduced motion: movement and fading are instant."
			: instant.checked
				? "Instant comparison: movement and fading are instant."
				: "Motion enabled: base duration for movement, fast duration for linear fading.";
	};
	preference.addEventListener("change", update);
	instant.addEventListener("change", update);
	update();

	function animateChange(change, entering) {
		// Measure the current visual positions before cancelling interrupted effects.
		const before = new Map(
			[...list.children].map((item) => [item, item.getBoundingClientRect()]),
		);
		const focused = document.activeElement;
		cancel();
		change();
		if (focused instanceof HTMLElement && list.contains(focused))
			focused.focus({ preventScroll: true });
		if (preference.matches || instant.checked || !list.animate) return;
		// Read at the consuming element for scoped overrides and s/ms serialization.
		const style = getComputedStyle(list);
		const move = milliseconds(
			style.getPropertyValue("--barba-motion-duration-base"),
		);
		const fade = milliseconds(
			style.getPropertyValue("--barba-motion-duration-fast"),
		);
		const easing = style
			.getPropertyValue("--barba-motion-easing-decelerate")
			.trim();
		for (const item of list.children) {
			if (item === entering) {
				if (fade > 0)
					item.animate([{ opacity: 0 }, { opacity: 1 }], {
						duration: fade,
						easing: "linear",
					});
				continue;
			}
			const from = before.get(item);
			const to = item.getBoundingClientRect();
			if (from && move > 0 && (from.x !== to.x || from.y !== to.y)) {
				item.animate(
					[
						{ transform: `translate(${from.x - to.x}px, ${from.y - to.y}px)` },
						{ transform: "translate(0px, 0px)" },
					],
					{ duration: move, easing },
				);
			}
		}
	}
	list.addEventListener("click", (event) => {
		const button = event.target.closest("button");
		if (button && !button.disabled)
			animateChange(() => list.append(button.closest("li")));
	});
	demo.querySelector("[data-motion-move]").addEventListener("click", () => {
		animateChange(() => list.append(list.firstElementChild));
	});
	demo.querySelector("[data-motion-add]").addEventListener("click", () => {
		let entry = list.querySelector("[data-motion-entry]");
		if (!entry) {
			entry = document.createElement("li");
			entry.dataset.motionEntry = "";
			const button = document.createElement("button");
			button.type = "button";
			button.className = "chip";
			button.setAttribute("aria-label", "Move New entry to end");
			const face = document.createElement("span");
			face.className = "chip-face";
			face.textContent = "New entry";
			button.append(face);
			entry.append(button);
		}
		animateChange(() => list.append(entry), entry);
	});
}
