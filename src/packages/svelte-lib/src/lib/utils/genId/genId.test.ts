import { genId } from "./genId";

describe("genId", () => {
  it("should, by default, generate a random string of length 8", () => {
    const id = genId();
    expect(id).toMatch(/^[a-z0-9]{8}$/);
  });

  it("should generate a random string with a custom length", () => {
    const length = 10;
    const id = genId(length);
    expect(id).toHaveLength(length);
  });
});
