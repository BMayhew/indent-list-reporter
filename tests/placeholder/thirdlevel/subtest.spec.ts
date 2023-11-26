import { expect, test } from "@playwright/test";

test.describe.serial("SUB API", async () => {
  test("sub authentication", async () => {
    const status = 200;
    expect(status).toBe(200);
  });

  test("sub unauthorized", async () => {
    const status = 200;
    expect(status).toBe(203);
  });
});

const status = 200;
const testM3e = "test me";
test.describe("SUB SUB API 22", async () => {
  test("sub 22 authentication", async () => {
    expect(status).toBe(200);
  });

  test("sub 23 unauthorized", async () => {
    expect(status).toBe(200);
  });
});
