const express = require('express');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const {checkAccessToken} = require('../../core/middleware/auth.js');
const {permits_to_wells_test: model} = require('../../core/models');

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

router.put('/:year/:activePermit', (req, res, next) => {
  model
    .update(
      {removed: true},
      {
        where: {
          permit_year: req.params.year,
          permit_ndx: req.params.activePermit,
        },
      }
    )
    // .then((data) => {
    //   res.sendStatus(200);
    // })
    // .catch((err) => {
    //   next(err);
    // })
    .then(() => {
      model.bulkCreate(req.body.newRecords);
    })
    // .then((data) => {
    //   res.sendStatus(200);
    // })
    // .catch((err) => {
    //   next(err);
    // })
    .then(() => {
      model.update(
        {removed: false},
        {
          where: {
            permit_year: req.params.year,
            permit_ndx: req.params.activePermit,
            well_ndx: {
              [Op.in]: req.body.currentRecords,
            },
          },
        }
      );
    })
    .then((data) => {
      res.sendStatus(200);
    })
    .catch((err) => {
      next(err);
    });
});

module.exports = router;
