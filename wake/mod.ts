import type { App, FnContext } from "deco/mod.ts";
import { Markdown } from "../decohub/components/Markdown.tsx";
import { fetchSafe } from "../utils/fetch.ts";
import { createGraphqlClient } from "../utils/graphql.ts";
import { createHttpClient } from "../utils/http.ts";
import { PreviewContainer } from "../utils/preview.tsx";
import type { Secret } from "../website/loaders/secret.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import { CheckoutApi } from "./utils/client.ts";
import { OpenAPI } from "./utils/openapi/wake.openapi.gen.ts";

export type AppContext = FnContext<State, Manifest>;

export let state: null | State = null;

/** @title Wake */
export interface Props {
  /**
   * @title Account Name
   * @description erploja2 etc
   */
  account: string;

  /**
   * @title Checkout Url
   * @description https://checkout.erploja2.com.br
   */
  checkoutUrl: string;

  /**
   * @title Wake Storefront Token
   * @description https://wakecommerce.readme.io/docs/storefront-api-criacao-e-autenticacao-do-token
   */
  storefrontToken: Secret;

  /**
   * @title Wake API token
   * @description The token for accessing wake commerce
   */
  token?: Secret;

  /**
   * @description Use Wake as backend platform
   * @hide true
   */
  platform: "wake";
}

export interface State extends Props {
  api: ReturnType<typeof createHttpClient<OpenAPI>>;
  checkoutApi: ReturnType<typeof createHttpClient<CheckoutApi>>;
  storefront: ReturnType<typeof createGraphqlClient>;
}

export const color = 0xB600EE;

/**
 * @title Wake
 * @description Loaders, actions and workflows for adding Wake Commerce Platform to your website.
 * @category Ecommmerce
 * @logo https://raw.githubusercontent.com/deco-cx/apps/main/wake/logo.png
 */
export default function App(props: Props): App<Manifest, State> {
  const { token, storefrontToken, account, checkoutUrl } = props;

  if (!token || !storefrontToken) {
    console.warn(
      "Missing tokens for wake app. Add it into the wake app config in deco.cx admin. Some functionalities may not work",
    );
  }

  // HEAD
  //
  const stringToken = typeof token === "string" ? token : token?.get?.() ?? "";
  const stringStorefrontToken = typeof storefrontToken === "string"
    ? storefrontToken
    : storefrontToken?.get?.() ?? "";

  const api = createHttpClient<OpenAPI>({
    base: "https://api.fbits.net",
    headers: new Headers({ "Authorization": `Basic ${stringToken}` }),
    fetcher: fetchSafe,
  });

  //22e714b360b7ef187fe4bdb93385dd0a85686e2a
  const storefront = createGraphqlClient({
    endpoint: "https://storefront-api.fbits.net/graphql",
    headers: new Headers({ "TCS-Access-Token": `${stringStorefrontToken}` }),
    fetcher: fetchSafe,
  });

  const checkoutApi = createHttpClient<CheckoutApi>({
    base: checkoutUrl ?? `https://${account}.checkout.fbits.store`,
    fetcher: fetchSafe,
  });

  state = { ...props, api, storefront, checkoutApi };

  return {
    state,
    manifest,
  };
}

export const preview = async () => {
  const markdownContent = await Markdown(
    new URL("./README.md", import.meta.url).href,
  );

  return {
    Component: PreviewContainer,
    props: {
      name: "Wake",
      owner: "deco.cx",
      description:
        "Loaders, actions and workflows for adding Wake Commerce Platform to your website.",
      logo: "https://raw.githubusercontent.com/deco-cx/apps/main/wake/logo.png",
      images: [
        "https://deco-sites-assets.s3.sa-east-1.amazonaws.com/starting/6ffea061-09f2-4063-a1f0-8ad2a37a148d/Screenshot-2024-09-05-at-12.57.10.png",
      ],
      tabs: [
        {
          title: "About",
          content: markdownContent(),
        },
      ],
    },
  };
};
