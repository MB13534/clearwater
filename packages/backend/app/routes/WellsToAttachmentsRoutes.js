const express = require('express');
const {checkAccessToken} = require('../../core/middleware/auth.js');
const {wells_to_attachments: model} = require('../../core/models');

const router = express.Router();

// Attach middleware to ensure that user is authenticated & has permissions
router.use(
  checkAccessToken(process.env.AUTH0_DOMAIN, process.env.AUTH0_AUDIENCE)
);

router.get('/:ndx', (req, res, next) => {
  const where = {};
  where.well_ndx = req.params.ndx;
  model
    .findAll({where})
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      next(err);
    });
});

router.patch('/:ndx', (req, res, next) => {
  const where = {};
  where.att_ndx = req.params.ndx;
  model
    .update({removed: true}, {where})
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      next(err);
    });
});

router.post('/', (req, res, next) => {
  model
    .create(req.body)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      next(err);
    });
});

module.exports = router;
