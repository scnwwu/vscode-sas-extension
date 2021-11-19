export const ResLoader = {
  get: function (url: string, cb: (arg0: any) => void, async?: boolean) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    cb(require(url));
  },
};
