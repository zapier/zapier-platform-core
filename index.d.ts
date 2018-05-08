// Type definitions for zapier-platform-core
// Project: Zapier's Platform Core
// Definitions by: David Brownman <https://davidbrownman.com>

/// <reference types="node" />

import { Stream } from 'stream';
import { Utf8AsciiLatin1Encoding, HexBase64Latin1Encoding } from 'crypto';
import { Agent } from 'http';

// The EXPORTED OBJECT
export const version: string;
export const tools: { env: { inject: (filename?: string) => void } };
// export const createAppHandler: (appRaw: object) => any // internal
export const createAppTester: (
  appRaw: object
) => (
  func: (z: zObject, bundle: Bundle) => any,
  bundle?: Bundle
) => Promise<any>;
// internal only
// export const integrationTestHandler: () => void;

interface Bundle {}

declare class HaltedError extends Error {}
declare class ExpiredAuthError extends Error {}
declare class RefreshAuthError extends Error {}

// copied http stuff from external typings
export interface HttpRequestOptions {
  url?: string;
  method?: 'POST' | 'GET' | 'OPTIONS' | 'HEAD' | 'DELETE' | 'PATCH' | 'PUT';
  body?: string | Buffer | NodeJS.ReadableStream | object;
  headers?: { [name: string]: string };
  json?: object | any[] | null;
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

export interface HttpResponse {
  status: number;
  content: string | Buffer;
  json: object | undefined | Promise<object | undefined>;
  body?: NodeJS.ReadableStream;
  headers: { [key: string]: string };
  getHeader(key: string): string | undefined;
  throwForStatus(): void;
  request: HttpRequestOptions;
}

export interface zObject {
  request: {
    (url: string, options?: HttpRequestOptions): Promise<HttpResponse>;
    (options: HttpRequestOptions): Promise<HttpResponse>;
  };

  console: Console;

  dehyrate: (func: (z: this, bundle: Bundle) => any, inputData: object) => void;

  stashFile: {
    (
      input: string | Buffer | Stream,
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
    parse: (text: string) => string;
    stringify: typeof JSON.stringify;
  };

  /**
   * Easily hash data using node's crypto package
   * @param algorithm probably 'sha256', see [this](https://nodejs.org/api/crypto.html#crypto_crypto_createhash_algorithm_options) for more options
   * @param data the data you want to hash
   * @param encoding defaults to 'hex'
   * @param input_encoding defaults to 'binary'
   */
  hash(
    algorithm: string,
    data: string,
    encoding?: string,
    input_encoding?: string
  ): string;

  errors: {
    HaltedError: typeof HaltedError;
    ExpiredAuthError: typeof ExpiredAuthError;
    RefreshAuthError: typeof RefreshAuthError;
  };
}
