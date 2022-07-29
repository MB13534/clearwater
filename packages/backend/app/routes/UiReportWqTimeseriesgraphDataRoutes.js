const express = require('express');
const {checkAccessToken} = require('../../core/middleware/auth.js');
const {ui_report_wq_timeseriesgraph_data: model} = require('../../core/models');
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

router.get('/:parameter/:wells/:startDate/:endDate', (req, res, next) => {
  model
    .findAll({
      where: {
        wq_parameter_ndx: req.params.parameter,
        cuwcd_well_number: {
          [Op.in]: req.params.wells.split(','),
        },
        test_date: {
          [Op.between]: [req.params.startDate, req.params.endDate],
        },
      },
      order: [['test_date', 'desc']],
    })
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      next(err);
    });
});

module.exports = router;
