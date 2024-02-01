import type { FunctionRunResult, RunInput } from "../generated/api";

const EMPTY_DISCOUNT: FunctionRunResult = {
  discounts: [],
};

type Configuration = {
  discount: string;
  method_name: string;
  customerTag: string;
};

interface DiscountTarget {
  deliveryOption: {
    handle: string;
  };
}

export function run(input: RunInput): FunctionRunResult {
  const configuration: Configuration = JSON.parse(
    input?.discountNode?.metafield?.value ?? "{}"
  );

  const customer = input?.cart?.buyerIdentity?.customer;
  const deliveryGroups = input.cart.deliveryGroups;

  if (
    customer?.numberOfOrders === 0 &&
    customer.hasTags.some((tag) => tag.hasTag)
  ) {
    let expressOptions: DiscountTarget[] = [];

    // Iterate over each delivery group and find Express options
    deliveryGroups.forEach((group) => {
      group.deliveryOptions.forEach((option) => {
        if (
          option.title?.toLowerCase() ===
          configuration.method_name.toLowerCase()
        ) {
          expressOptions.push({
            deliveryOption: {
              handle: option.handle,
            },
          });
        }
      });
    });

    // If any Express options were found, return discount for them
    if (expressOptions.length > 0) {
      return {
        discounts: [
          {
            value: {
              percentage: {
                value: configuration.discount,
              },
            },
            targets: expressOptions,
            message: "50% off express shipping for our VIPs!",
          },
        ],
      };
    }
  }

  return EMPTY_DISCOUNT;
}
