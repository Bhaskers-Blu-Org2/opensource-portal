//
// Copyright (c) Microsoft.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.
//

'use strict';

import express = require('express');

import { jsonError } from '../../../middleware/jsonError';
import { apiContextMiddleware } from '../../../middleware/business/setContext';
import { setIdentity } from '../../../middleware/business/authentication';
import { addLinkToRequest } from '../../../middleware/links';
import { ReposAppRequest } from '../../../transitional';

const router = express.Router();

router.use((req: ReposAppRequest, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return next(jsonError('The current session is not authenticated', 401));
});

router.use(apiContextMiddleware);
router.use(setIdentity);
router.use(addLinkToRequest);

router.use('/newRepo', require('./newRepo'));
router.use('/releaseApprovals', require('./releaseApprovals'));

router.use((req, res, next) => {
  return next(jsonError('The resource or endpoint you are looking for is not there', 404));
});

module.exports = router;
