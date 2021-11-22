// Copyright © 2021, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export const ResLoader = {
  get: function (url: string, cb: (arg0: any) => void, async?: boolean) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    cb(require(url));
  },
};
