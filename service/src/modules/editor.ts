import { rpc } from '../rpc';

export const module = {

};

export default {
  name: 'sys',
  module,
  fileChanged(filePath: string, timestamp: number) {
    rpc.notify('file:changed', { filePath, timestamp });
  },
};
