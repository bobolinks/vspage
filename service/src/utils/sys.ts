export default {
  wait(ms: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms, true);
    });
  },
};
