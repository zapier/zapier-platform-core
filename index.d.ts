// Type definitions for zapier-platform-core
// Project: Zapier's Platform Core
// Definitions by: David Brownman <https://davidbrownman.com>

/// <reference types="node" />

import { Agent } from 'http';

// The EXPORTED OBJECT
export const version: string;
export const Promise: PromiseLike<any>;
export const tools: { env: { inject: (filename?: string) => void } };
export const createAppTester: (
  appRaw: object
) => (
  func: (z: zObject, bundle: Bundle) => any,
  bundle?: Partial<Bundle> // partial so we don't have to make a full bundle in tests
) => Promise<any>;

// internal only
// export const integrationTestHandler: () => any;
// export const createAppHandler: (appRaw: object) => any

type HttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'OPTIONS'
  | 'HEAD';

export interface Bundle<InputData = { [x: string]: any }> {
  authData: { [x: string]: string };
  inputData: InputData;
  inputDataRaw: { [x: string]: string };
  meta: {
    frontend: boolean;
    prefill: boolean;
    hydrate: boolean;
    test_poll: boolean;
    standard_poll: boolean;
    first_poll: boolean;
    limit: number;
    page: number;
    zap?: { id: string };
  };
  rawRequest?: Partial<{
    method: HttpMethod;
    querystring: string;
    headers: { [x: string]: string };
    content: string;
  }>;
  cleanedRequest?: Partial<{
    method: HttpMethod;
    querystring: { [x: string]: string };
    headers: { [x: string]: string };
    content: { [x: string]: string };
  }>;
}

declare class HaltedError extends Error {}
declare class ExpiredAuthError extends Error {}
declare class RefreshAuthError extends Error {}

// copied http stuff from external typings
export interface HttpRequestOptions {
  url?: string;
  method?: HttpMethod;
  body?: string | Buffer | ReadableStream | object;
  headers?: { [name: string]: string };
  json?: object | any[];
  params?: object;
  form?: object;
  raw?: boolean;
  redirect?: 'manual' | 'error' | 'follow';
  follow?: number;
  compress?: boolean;
  agent?: Agent;
  timeout?: number;
  size?: number;
}

interface BaseHttpResponse {
  status: number;
  headers: { [key: string]: string };
  getHeader(key: string): string | undefined;
  throwForStatus(): void;
  request: HttpRequestOptions;
}

export interface HttpResponse extends BaseHttpResponse {
  content: string;
  json?: object;
}

export interface RawHttpResponse extends BaseHttpResponse {
  content: Buffer;
  json: Promise<object | undefined>;
  body: ReadableStream;
}

export interface zObject {
  request: {
    // most specific overloads go first
    (url: string, options: HttpRequestOptions & { raw: true }): Promise<
      RawHttpResponse
    >;
    (options: HttpRequestOptions & { raw: true; url: string }): Promise<
      RawHttpResponse
    >;

    (url: string, options?: HttpRequestOptions): Promise<HttpResponse>;
    (options: HttpRequestOptions & { url: string }): Promise<HttpResponse>;
  };

  console: Console;

  dehydrate: <T>(
    func: (z: this, bundle: Bundle<T>) => any,
    inputData: object
  ) => string;

  // coming soon
  // cursor: {
  //   get: () => Promise<string>
  //   set: (cursor: string) => Promise<void>
  // }

  /**
   * turns a file or request into a file into a publicly accessible url
   */
  stashFile: {
    (
      input: string | Buffer | ReadableStream,
      knownLength?: number,
      filename?: string,
      contentType?: string
    ): string;
    (input: Promise<string>): string;
  };

  JSON: {
    /**
     * Acts a lot like regular `JSON.parse`, but throws a nice error for improper json input
     */
    parse: (text: string) => any;
    stringify: typeof JSON.stringify;
  };

  /**
   * Easily hash data using node's crypto package
   * @param algorithm probably 'sha256', see [this](https://nodejs.org/api/crypto.html#crypto_crypto_createhash_algorithm_options) for more options
   * @param data the data you want to hash
   * @param encoding defaults to 'hex'
   * @param input_encoding defaults to 'binary'
   */
  hash: (
    algorithm: string,
    data: string,
    encoding?: string,
    input_encoding?: string
  ) => string;

  errors: {
    HaltedError: typeof HaltedError;
    ExpiredAuthError: typeof ExpiredAuthError;
    RefreshAuthError: typeof RefreshAuthError;
  };
}

export interface AuthorizeUrlBundle<InputData = {}> {
  inputData: InputData;
}

export interface GetAccessTokenBundle<InputData = {}> {
  inputData: InputData & {
    code: string;
  };
}

export interface RefreshAccessTokenBundle<InputData> {
  inputData: InputData;
  authData: { [x: string]: string };
}

export interface OAuth2Authentication<InputData = {}> {
  type: 'oauth2';
  connectionLabel: string;
  oauth2Config: {
    authorizeUrl:
    | string
    | ((
      z: zObject,
      bundle: AuthorizeUrlBundle<InputData>
    ) => string | Promise<string>)
    | HttpRequestOptions;
    getAccessToken:
    | ((
      z: zObject,
      bundle: GetAccessTokenBundle<InputData>
    ) => AuthData | Promise<AuthData>)
    | HttpRequestOptions;
    refreshAccessToken?:
    | ((
      z: zObject,
      bundle: RefreshAccessTokenBundle<InputData>
    ) => AuthData | Promise<AuthData>)
    | HttpRequestOptions;
    autoRefresh: boolean;
    scope?: string;
  };
  test: HttpRequest | Function;
}

export interface BasicDisplay {
  label: string;
  description: string;
  directions?: string;
  important?: boolean;
  hidden?: boolean;
}

export type Headers = {
  [key: string]: string
};

export type Params = {
  [key: string]: string
};

export interface HttpRequest<Body = {}> {
  method?: HttpMethod;
  url?: string;
  body?: Body;
  params?: Params;
  headers?: Headers;
  auth: Array<string>;
}

export interface FunctionRequire {
  require: string;
}

export interface FunctionSource {
  source: string;
}

export type Perform<T = any> = (z: zObject, bundle: Bundle) => Promise<T> | T;

export type Function<T = any> = FunctionRequire | FunctionSource | Perform<T>;

export interface FieldChoiceWithLabel {
  value: string;
  sample: string;
  label: string;
}

export interface Field {
  key: string;
  label?: string;
  helpText?: string;
  type?: 'string' | 'text' | 'integer' | 'number' | 'boolean' | 'datetime' | 'file' | 'password';
  required?: boolean;
  placeholder?: string;
  default?: string;
  dynamic?: string;
  search?: string;
  choices?: object | string[] | FieldChoiceWithLabel[];
  list?: boolean;
  children?: Fields;
  dict?: boolean;
  computed?: boolean;
  altersDynamicFields?: boolean;
  inputFormat?: string;
}

export type Fields = Array<Field>;
export type DynamicField = () => Field;
export type DynamicFields = Array<DynamicField | Field>;

export interface BasicOperation {
  resource?: string;
  perform: HttpRequest | Function;
  inputFields?: DynamicFields;
  outputFields?: DynamicFields;
  sample: object;
}

export interface BasicPollingOperation extends BasicOperation {
  type: 'polling';
  perform: HttpRequest | Function<any[]>;
  canPaginate?: boolean;
}

export interface BasicHookOperation extends BasicOperation {
  type: 'hook';
  perform: HttpRequest | Function<any[]>;
  performList?: HttpRequest | Function;
  performSubscribe?: HttpRequest | Function;
  performUnsubscribe?: HttpRequest | Function;
}

export interface BasicActionOperation extends BasicOperation {
  performGet?: HttpRequest | Function;
}

export interface BasicCreateActionOperation extends BasicOperation {
  performGet?: HttpRequest | Function;
  shouldLock?: boolean;
}

export interface Trigger {
  key: string;
  noun: string;
  display: BasicDisplay;
  operation: BasicPollingOperation | BasicHookOperation;
}

export type Triggers = {
  [key: string]: Trigger
};

export interface Search {
  key: string;
  noun: string;
  display: BasicDisplay;
  operation: BasicActionOperation;
}

export type Searches = {
  [key: string]: Search
};

export interface Create {
  key: string;
  noun: string;
  display: BasicDisplay;
  operation: BasicCreateActionOperation;
}

export type Creates = {
  [key: string]: Create
};

export interface ResourceMethodGet {
  display: BasicDisplay;
  operation: BasicOperation;
}

export interface ResourceMethodHook {
  display: BasicDisplay;
  operation: BasicHookOperation;
}

export interface ResourceMethodList {
  display: BasicDisplay;
  operation: BasicPollingOperation;
}

export interface ResourceMethodSearch {
  display: BasicDisplay;
  operation: BasicActionOperation;
}

export interface ResourceMethodCreate {
  display: BasicDisplay;
  operation: BasicActionOperation;
}

export interface Resource {
  key: string;
  noun: string;
  get?: ResourceMethodGet;
  hook?: ResourceMethodHook;
  list?: ResourceMethodList;
  search?: ResourceMethodSearch;
  create?: ResourceMethodCreate;
  outputFields?: DynamicFields;
  sample?: object;
}

export type Resources = {
  [type: string]: Resource
};

export type BeforeRequestHandler = (request: HttpRequest, z: zObject, bundle: Bundle) => HttpRequest;
export type AfterResponseHandler = (response: HttpResponse, z: zObject) => HttpResponse;

export interface App {
  version: string;
  platformVersion: string;
  authentication: OAuth2Authentication;
  beforeRequest: Array<BeforeRequestHandler>;
  afterResponse: Array<AfterResponseHandler>;
  resources: Resources;
  triggers: Triggers;
  searches: Searches;
  creates: Creates;
}
