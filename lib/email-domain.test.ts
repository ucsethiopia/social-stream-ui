import { describe, expect, it } from "vitest";
import { isAllowedEmail } from "@/lib/email-domain";

const UCS = ["ucsethiopia.com"];

describe("isAllowedEmail", () => {
  it.each([
    ["staff@ucsethiopia.com", UCS, true],
    ["Staff@UCSEthiopia.com", UCS, true],
    ["someone@gmail.com", UCS, false],
    ["someone@evil-ucsethiopia.com", UCS, false],
    ["someone@ucsethiopia.com.evil.io", UCS, false],
    ["not-an-email", UCS, false],
    ["", UCS, false],
    [undefined, UCS, false],
    [null, UCS, false],
    ["someone@gmail.com", [], true],
    [undefined, [], true],
    ["a@partner.org", ["ucsethiopia.com", "partner.org"], true],
  ] as const)("%s with %j is %s", (email, domains, expected) => {
    expect(isAllowedEmail(email, domains)).toBe(expected);
  });
});
