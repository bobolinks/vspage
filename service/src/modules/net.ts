import Url from 'url';
import axios, { AxiosRequestConfig } from 'axios';

export const net = axios.create({
  withCredentials: true,
});

export const module = {
  async request(options: AxiosRequestConfig, rspRaw?: boolean) {
    const headers = options.headers || (options.headers = {});
    if (!options.url) {
      throw 'invald url';
    }
    headers.host = (new Url.URL(options.url)).host;
    const method = options.method;
    if (method && !['post', 'get'].includes(method)) {
      options.method = 'POST';
    }
    const rs = await net.request(options);
    return rspRaw ? {
      data: rs.data,
      headers: rs.headers,
      status: rs.status,
      statusText: rs.statusText,
    } : rs.data;
  },
  async get(url: string, options?: AxiosRequestConfig) {
    options = options || {};
    const headers = options.headers || (options.headers = {});
    headers.host = (new Url.URL(url)).host;
    return (await net.get(url, options)).data;
  },
  async post(url: string, data: any, options?: AxiosRequestConfig) {
    options = options || {};
    const headers = options.headers || (options.headers = {});
    headers.host = (new Url.URL(url)).host;
    return (await net.post(url, data, options)).data;
  },
};

export default {
  name: 'net',
  module,
};
