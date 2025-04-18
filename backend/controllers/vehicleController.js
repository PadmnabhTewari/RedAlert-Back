const Vehicle = require('../models/Vehicle');
const VehicleModel = require('../models/VehicleModel');

exports.createVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.create(req.body);
    res.status(201).json({ id: vehicle.Vehicle_ID });
  } catch (error) {
    res.status(500).json({ message: 'Error creating vehicle', error });
  }
};

exports.getVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.findAll({
      include: {
        model: VehicleModel,
        attributes: ['Type'],
      },
    });
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching vehicles', error });
  }
};