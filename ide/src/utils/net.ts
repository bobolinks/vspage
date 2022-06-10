import { Method } from "axios";

export interface Request {
  url: string;
  method?: Method;
  headers?: Record<string, string>;
  data?: any;
  withCredentials?: boolean;
}

export default {
  request(request: Request) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(request.method || 'GET', request.url, true);
      if (request.headers) {
        for (const [k, v] of Object.entries(request.headers)) {
          xhr.setRequestHeader(k, v);
        }
      }
      if (request.withCredentials) {
        xhr.withCredentials = request.withCredentials;
      }
      xhr.onerror = (ev) => {
        reject(ev);
      };
      xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
          resolve(xhr.responseText);
        }
      }
      xhr.send(request.data);
    });
  },
  requestSync(request: Request) {
    const xhr = new XMLHttpRequest();
    xhr.open(request.method || 'GET', request.url, false);
    if (request.headers) {
      for (const [k, v] of Object.entries(request.headers)) {
        xhr.setRequestHeader(k, v);
      }
    }
    if (request.withCredentials) {
      xhr.withCredentials = request.withCredentials;
    }
    xhr.onerror = (ev) => {
      throw (ev);
    };
    let result = null;
    xhr.onreadystatechange = () => {
      if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
        result = xhr.responseText;
      }
    }
    xhr.send(request.data);
    if (xhr.status !== 200) {
      throw new Error(xhr.responseText);
    }
    return result;
  }
}
