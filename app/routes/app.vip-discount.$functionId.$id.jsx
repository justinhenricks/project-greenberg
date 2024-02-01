import { json } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "@remix-run/react";

import { useAppBridge } from "@shopify/app-bridge-react";
import { Redirect } from "@shopify/app-bridge/actions";
import {
  ActiveDatesCard,
  onBreadcrumbAction,
} from "@shopify/discount-app-components";
import {
  Banner,
  BlockStack,
  Card,
  Layout,
  Page,
  PageActions,
  Text,
  TextField,
} from "@shopify/polaris";
import { useField, useForm } from "@shopify/react-form";
import { useEffect, useMemo } from "react";

import shopify from "../shopify.server";

export async function loader({ request, params }) {
  const { admin } = await shopify.authenticate.admin(request);
  const { functionId, id } = params;
  if (params.id === "new") {
    return json({
      configuration: {
        discount: "50",
        methodName: "Express",
        customerTag: "VIP",
      },
    });
  }

  const automaticDiscountMetafieldData = await admin.graphql(`
  query {
    metafields(first: 2, owner: "gid://shopify/DiscountAutomaticNode/${id}", namespace: "$app:vip-express-discount") {
      edges {
        node {
          namespace
          key
          value
        }
      }
    }
  }
  `);

  const responseJson = await automaticDiscountMetafieldData.json();

  const configuration = JSON.parse(
    responseJson?.data.metafields.edges[0].node.value,
  );

  return json({ configuration });
}

// This is a server-side action that is invoked when the form is submitted.
// It makes an admin GraphQL request to create a discount.
export const action = async ({ params, request }) => {
  const { functionId, id } = params;
  const { admin } = await shopify.authenticate.admin(request);
  const formData = await request.formData();
  const { startsAt, endsAt, configuration } = JSON.parse(
    formData.get("discount"),
  );

  const baseDiscount = {
    functionId,
    title: "First Time VIP Shipping Discount",
    startsAt: new Date(startsAt),
    endsAt: endsAt && new Date(endsAt),
  };

  if (params.id === "new") {
    const response = await admin.graphql(
      `#graphql
      mutation CreateAutomaticDiscount($discount: DiscountAutomaticAppInput!) {
        discountCreate: discountAutomaticAppCreate(automaticAppDiscount: $discount) {
          userErrors {
            code
            message
            field
          }
        }
      }`,
      {
        variables: {
          discount: {
            ...baseDiscount,
            metafields: [
              {
                namespace: "$app:vip-express-discount",
                key: "function-configuration",
                type: "json",
                value: JSON.stringify({
                  discount: configuration.discount,
                  methodName: configuration.methodName,
                  customerTag: configuration.customerTag,
                }),
              },
            ],
          },
        },
      },
    );

    const responseJson = await response.json();
    console.log("response json", responseJson);
    const errors = responseJson.data.discountCreate?.userErrors;
    console.log("errors", errors);
    return json({ errors });
  } else {
    //lets update the metafield

    const response = await admin.graphql(
      `#graphql
         mutation metafieldsSet($metafields: [MetafieldsSetInput!]!) {
      metafieldSet: metafieldsSet(metafields: $metafields) {
        metafields {
          id
          value
          
        }
        userErrors {
          field
          message
        }
      }
    }`,
      {
        variables: {
          metafields: [
            {
              key: "function-configuration",
              namespace: "$app:vip-express-discount",
              ownerId: `gid://shopify/DiscountAutomaticNode/${params.id}`,
              type: "json",
              value: JSON.stringify({
                discount: configuration.discount,
                methodName: configuration.methodName,
                customerTag: configuration.customerTag,
              }),
            },
          ],
        },
      },
    );

    const responseJson = await response.json();
    const errors = responseJson.data.metafieldSet?.userErrors;
    return json({ errors });
  }
};

// This is the React component for the page.
export default function VolumeNew() {
  const loaderData = useLoaderData();
  const submitForm = useSubmit();
  const actionData = useActionData();
  const navigation = useNavigation();
  const app = useAppBridge();
  const todaysDate = useMemo(() => new Date(), []);

  const isLoading = navigation.state === "submitting";
  const submitErrors = actionData?.errors || [];
  const redirect = Redirect.create(app);

  useEffect(() => {
    if (actionData?.errors.length === 0) {
      redirect.dispatch(Redirect.Action.ADMIN_SECTION, {
        name: Redirect.ResourceType.Discount,
      });
    }
  }, [actionData]);

  const {
    fields: { startDate, endDate, configuration },
    submit,
  } = useForm({
    fields: {
      startDate: useField(todaysDate),
      endDate: useField(null),
      configuration: {
        discount: useField(loaderData.configuration.discount),
        methodName: useField(loaderData.configuration.methodName),
        customerTag: useField(loaderData.configuration.customerTag),
      },
    },
    onSubmit: async (form) => {
      console.log("here is form", form);
      const discount = {
        startsAt: form.startDate,
        endsAt: form.endDate,
        configuration: {
          discount: form.configuration.discount,
          methodName: form.configuration.methodName,
          customerTag: form.configuration.customerTag,
        },
      };

      submitForm({ discount: JSON.stringify(discount) }, { method: "post" });

      return { status: "success" };
    },
  });

  const errorBanner =
    submitErrors.length > 0 ? (
      <Layout.Section>
        <Banner status="critical">
          <p>There were some issues with your form submission:</p>
          <ul>
            {submitErrors.map(({ message, field }, index) => {
              return (
                <li key={`${message}${index}`}>
                  {field.join(".")} {message}
                </li>
              );
            })}
          </ul>
        </Banner>
      </Layout.Section>
    ) : null;

  return (
    // Render a discount form using Polaris components and the discount app components
    <Page
      title="Create volume discount"
      backAction={{
        content: "Discounts",
        onAction: () => onBreadcrumbAction(redirect, true),
      }}
      primaryAction={{
        content: "Save",
        onAction: submit,
        loading: isLoading,
      }}
    >
      <Layout>
        {errorBanner}
        <Layout.Section>
          <Form method="post">
            <BlockStack align="space-around" gap="500">
              <Card>
                <BlockStack gap="300">
                  <Text variant="headingMd" as="h2">
                    Discount Settings
                  </Text>
                  <TextField
                    label="Customer tag to apply on"
                    autoComplete="on"
                    {...configuration.customerTag}
                  />
                  <TextField
                    label="Shipping discount percentage"
                    autoComplete="on"
                    {...configuration.discount}
                    suffix="%"
                  />
                  <TextField
                    label="Shipping rate name to apply discount to"
                    autoComplete="on"
                    {...configuration.methodName}
                  />
                </BlockStack>
              </Card>
              <ActiveDatesCard
                startDate={startDate}
                endDate={endDate}
                timezoneAbbreviation="EST"
              />
            </BlockStack>
          </Form>
        </Layout.Section>
        <Layout.Section>
          <PageActions
            primaryAction={{
              content: "Save discount",
              onAction: submit,
              loading: isLoading,
            }}
            secondaryActions={[
              {
                content: "Discard",
                onAction: () => onBreadcrumbAction(redirect, true),
              },
            ]}
          />
        </Layout.Section>
      </Layout>
    </Page>
  );
}
