declare module 'oauth-1.0a' {
  export interface OAuthConsumer {
    key: string;
    secret: string;
  }

  export interface OAuthOptions {
    consumer: OAuthConsumer;
    signature_method?: string;
    hash_function: (baseString: string, signingKey: string) => string;
  }

  export interface OAuthRequest {
    url: string;
    method: string;
    data?: Record<string, string | number | boolean | undefined>;
  }

  export default class OAuth {
    constructor(opts: OAuthOptions);
    authorize(request: OAuthRequest, token?: Record<string, unknown>): Record<string, string>;
    toHeader(oauthData: Record<string, string>): { Authorization: string };
  }
}
