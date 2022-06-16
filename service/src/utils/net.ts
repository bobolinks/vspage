import net from "net";

export default {
  async portUsed(port: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const server = net.createServer().listen(port, () => {
        server.close();
        resolve(false);
      }
      ).on('error', (err: any) => {
        if (err.code === 'EADDRINUSE') {
          resolve(true);
        } else {
          reject(err);
        }
      }
      );
    });
  },
  async choosePort(port: number) {
    for (let index = port; index < port + 100; index++) {
      if (! await this.portUsed(index)) {
        return index;
      }
    }
    // any
    return 0;
  }
};
