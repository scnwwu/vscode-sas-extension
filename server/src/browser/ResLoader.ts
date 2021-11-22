// Copyright © 2021, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export const ResLoader = {
  get: function (url: string, cb: (arg0: any) => void, async?: boolean) {
    // have to explicitly write path for webpack to bundle
    const index = url.indexOf("/data/");
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    if (index > 0) cb(require(`../../data/${url.slice(index + 6)}`));
    else {
      const index = url.indexOf("/pubsdata/");
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      if (index > 0) cb(require(`../../pubsdata/${url.slice(index + 10)}`));
    }
  },
};
