import { describe, expect, it } from "vitest";
import { FunctionResult } from "../generated/api";
import { run } from "./run";

describe("VIP express discount", () => {
  it("returns 50% off express if tagged VIP and first order", () => {
    const result = run({
      discountNode: {
        metafield: null,
      },
      cart: {
        buyerIdentity: {
          customer: {
            numberOfOrders: 0,
            hasTags: [
              {
                hasTag: true,
                tag: "VIP",
              },
            ],
          },
        },
        deliveryGroups: [
          {
            deliveryOptions: [
              {
                title: "Economy",
                handle:
                  "538e36d0567ff7ccdda95a73e62478cb-9e912b3dae9b0e04b6f1facf08aa7cb2",
              },
              {
                title: "Standard",
                handle:
                  "538e36d0567ff7ccdda95a73e62478cb-ee768830e386b87e4f230f4292c237a3",
              },
              {
                title: "Express",
                handle:
                  "538e36d0567ff7ccdda95a73e62478cb-9bc19cc1ae6807304d5d933ef3f1056d",
              },
            ],
          },
        ],
      },
    });

    const expected: FunctionResult = {
      discounts: [
        {
          value: {
            percentage: {
              value: "100",
            },
          },
          targets: [
            {
              deliveryOption: {
                handle:
                  "538e36d0567ff7ccdda95a73e62478cb-9bc19cc1ae6807304d5d933ef3f1056d",
              },
            },
          ],
          message: "50% off express shipping!",
        },
      ],
    };

    expect(result).toEqual(expected);
  });

  it("returns no discount if not tagged VIP", () => {
    const result = run({
      discountNode: {
        metafield: null,
      },
      cart: {
        buyerIdentity: {
          customer: {
            numberOfOrders: 0,
            hasTags: [
              {
                hasTag: false,
                tag: "VIP",
              },
            ],
          },
        },
        deliveryGroups: [
          {
            deliveryOptions: [
              {
                title: "Economy",
                handle:
                  "538e36d0567ff7ccdda95a73e62478cb-9e912b3dae9b0e04b6f1facf08aa7cb2",
              },
              {
                title: "Standard",
                handle:
                  "538e36d0567ff7ccdda95a73e62478cb-ee768830e386b87e4f230f4292c237a3",
              },
              {
                title: "Express",
                handle:
                  "538e36d0567ff7ccdda95a73e62478cb-9bc19cc1ae6807304d5d933ef3f1056d",
              },
            ],
          },
        ],
      },
    });

    const expected: FunctionResult = {
      discounts: [],
    };

    expect(result).toEqual(expected);
  });

  it("returns no discount if tagged VIP and not first order", () => {
    const result = run({
      discountNode: {
        metafield: null,
      },
      cart: {
        buyerIdentity: {
          customer: {
            numberOfOrders: 2,
            hasTags: [
              {
                hasTag: true,
                tag: "VIP",
              },
            ],
          },
        },
        deliveryGroups: [
          {
            deliveryOptions: [
              {
                title: "Economy",
                handle:
                  "538e36d0567ff7ccdda95a73e62478cb-9e912b3dae9b0e04b6f1facf08aa7cb2",
              },
              {
                title: "Standard",
                handle:
                  "538e36d0567ff7ccdda95a73e62478cb-ee768830e386b87e4f230f4292c237a3",
              },
              {
                title: "Express",
                handle:
                  "538e36d0567ff7ccdda95a73e62478cb-9bc19cc1ae6807304d5d933ef3f1056d",
              },
            ],
          },
        ],
      },
    });

    const expected: FunctionResult = {
      discounts: [],
    };

    expect(result).toEqual(expected);
  });
});
