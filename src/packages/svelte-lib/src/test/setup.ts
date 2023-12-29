import { toHaveNoViolations } from "jest-axe";
import "@testing-library/jest-dom";
expect.extend(toHaveNoViolations);

import "vitest-dom/extend-expect";
