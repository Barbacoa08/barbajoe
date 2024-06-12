export interface HeaderLink {
	text: string;
	href: string;
	active?: boolean;
}

export interface LogoData {
	src: string;
	ariaLabel: string;

	href?: string; // defaults to '/'
	alt?: string; // defaults to 'Logo'
	text?: string;
}
