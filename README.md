# First Time VIP Customers Express Shipping Discount

This is a demonstration proof of concept for a Shopify shipping discount function.

### Requirements

Create a Shipping Discount using [Shopify Discount APIs](https://shopify.dev/docs/api/functions/reference/shipping-discounts). The discount function should:

- Offer 50% off the shipping method named `Express` when that customer is tagged as `VIP` as long as it’s the customer’s first order with this store.
- Include the appropriate [test cases](https://shopify.dev/docs/apps/functions/testing-and-debugging).

### Bonus configuration

The function accepts a JSON metafield: `$app:vip-express-discount` in the following format:

```
type Configuration = {
  discount: string;
  methodName: string;
  customerTag: string;
};
```

The specified customer tag, applicable shipping method, and qualifying tag all get passed and used in the business logic of the function.

## Local Development

1. Pull the project
2. Connect to an app in partner, run locally: `npm run dev`
3. Install the app on a dev store
4. Configure the function:
   1. Visit Discounts
   2. Create Discount: `vip-express-discount`
   3. Configure specifying applicable customer tag, shipping discount percentage, and the shipping rate name to apply.
5. Be sure a customer exists with that tag, and you have created a shipping method named what you configured
6. Checkout with that customer and you should see the discount applied to the correct shipping rate

NOTE: The configuration UI/UX is very much at a proof of concept stage.

## Testing

To run the automated test suite of the function:

1. `cd extensions/vip-express-discount`
2. run: `npm run test`
3. should see all test cases passing

## Questions?

1. Can this discount apply to only one-time purchases and not subscription products?

From what I can tell, it seems like the subscription products will also allow the discount function to run and for the customer to checkout with that shipping option/discount selected.

There seems to be some limitations though in that, it looks like Shopify is defaulting to only showing the cheapest option, so if that happens to not be the method with this discount, it doesn't get shown.

I'm sure there are some workarounds, perhaps, like if it was really important for the discounted method to be the one shown, perhaps we'd write business logic to determine if it was a subscription product, then hide all other methods and only show the one you want, with the discount. I could see that working.

## Developer resources

- [Introduction to Shopify apps](https://shopify.dev/docs/apps/getting-started)
- [App authentication](https://shopify.dev/docs/apps/auth)
- [Shopify CLI](https://shopify.dev/docs/apps/tools/cli)
- [Shopify API Library documentation](https://github.com/Shopify/shopify-api-js#readme)
