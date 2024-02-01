import { describe, expect, it } from "vitest";
import { FunctionResult } from "../generated/api";
import { run } from "./run";

const METAFIELD_JSON =
  '{"discount":"50","methodName":"express","customerTag":"vip"}';

describe("VIP express discount", () => {
  it("returns 50% off express if tagged VIP and first order", () => {
    const result = run({
      discountNode: {
        metafield: {
          value: METAFIELD_JSON,
        },
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
              value: JSON.parse(METAFIELD_JSON).discount,
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
          message: "50% off express shipping for our VIPs!",
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
        metafield: {
          value:
            '{"discount":"40","method_name":"express","customerTag":"vip"}',
        },
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

  it("returns 50% off for both express options if tagged VIP and first order, with multiple delivery groups", () => {
    const result = run({
      discountNode: {
        metafield: {
          value: METAFIELD_JSON,
        },
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
          {
            deliveryOptions: [
              {
                title: "Express",
                handle: "another-handle-for-express-option",
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
              value: JSON.parse(METAFIELD_JSON).discount,
            },
          },
          targets: [
            {
              deliveryOption: {
                handle:
                  "538e36d0567ff7ccdda95a73e62478cb-9bc19cc1ae6807304d5d933ef3f1056d",
              },
            },
            {
              deliveryOption: {
                handle: "another-handle-for-express-option",
              },
            },
          ],
          message: "50% off express shipping for our VIPs!",
        },
      ],
    };

    expect(result).toEqual(expected);
  });
});
