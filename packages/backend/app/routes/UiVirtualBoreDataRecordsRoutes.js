const express = require('express');
const {ui_virtual_bore_data_records: model} = require('../../core/models');
const {Op} = require('sequelize');
const router = express.Router();

router.get('/:lat/:lon', (req, res, next) => {
  model
    .findAll({
      where: {
        min_y_lon: {[Op.lte]: req.params.lon},
        max_y_lon: {[Op.gte]: req.params.lon},
        min_x_lat: {[Op.lte]: req.params.lat},
        max_x_lat: {[Op.gte]: req.params.lat},
      },
    })
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      next(err);
    });
});

module.exports = router;
