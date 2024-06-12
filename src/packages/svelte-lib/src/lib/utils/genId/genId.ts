// stolen from stackoverflow: https://stackoverflow.com/a/70307091/1022765
type Enumerate<
	N extends number,
	Acc extends number[] = [],
> = Acc["length"] extends N
	? Acc[number]
	: Enumerate<N, [...Acc, Acc["length"]]>;

type Range<F extends number, T extends number> = Exclude<
	Enumerate<T>,
	Enumerate<F>
>;

export const genId = (length: Range<2, 36> = 8) => {
	return Math.random()
		.toString(36)
		.substring(2, length + 2);
};
