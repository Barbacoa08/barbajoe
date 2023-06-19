import { toHaveNoViolations } from "jest-axe";

import "@testing-library/jest-dom";
import "@testing-library/jest-dom/extend-expect"; // HACK: https://github.com/testing-library/jest-dom/issues/442#issuecomment-1163011282

expect.extend(toHaveNoViolations);
