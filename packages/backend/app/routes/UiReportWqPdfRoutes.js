const express = require('express');
const {checkAccessToken} = require('../../core/middleware/auth.js');
const {ui_report_wq_pdf: model} = require('../../core/models');
const {Op} = require('sequelize');

const router = express.Router();

// Attach middleware to ensure that user is authenticated & has permissions
router.use(
  checkAccessToken(process.env.AUTH0_DOMAIN, process.env.AUTH0_AUDIENCE)
);

router.get('/', (req, res, next) => {
  model
    .findAll()
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      next(err);
    });
});

router.get('/:wells/:startDate/:endDate', (req, res, next) => {
  model
    .findAll({
      where: {
        well_ndx: {
          [Op.in]: req.params.wells.split(','),
        },
        test_datetime: {
          [Op.between]: [req.params.startDate, req.params.endDate],
        },
      },
      order: [['test_datetime', 'desc']],
    })
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      next(err);
    });
});

module.exports = router;
