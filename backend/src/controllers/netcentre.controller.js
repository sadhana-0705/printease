const NetCentre = require("../models/NetCentre");

exports.createNetCentre = async (req, res, next) => {
  try {
    const { name, address, city, lat, lng } = req.body;
    const addressParts = [address, city].filter(
      (part) => typeof part === "string" && part.trim()
    );

    // Create a new net centre
    const netCentre = new NetCentre({
      name,
      address: addressParts.join(", "),
      location: {
        lat: lat || 0,
        lng: lng || 0
      }
    });

    await netCentre.save();

    // Return transformed data to match frontend expectations
    res.status(201).json({
      _id: netCentre._id,
      id: netCentre._id,
      name: netCentre.name,
      address: netCentre.address,
      lat: netCentre.location.lat,
      lng: netCentre.location.lng,
      createdAt: netCentre.createdAt,
      updatedAt: netCentre.updatedAt
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllNetCentres = async (req, res, next) => {
  try {
    const netCentres = await NetCentre.find();
    // Transform the data to match frontend expectations
    const transformedNetCentres = netCentres.map(nc => ({
      _id: nc._id,
      id: nc._id, // Provide id for frontend
      name: nc.name,
      address: nc.address,
      lat: nc.location.lat, // Extract lat from location object
      lng: nc.location.lng, // Extract lng from location object
      createdAt: nc.createdAt,
      updatedAt: nc.updatedAt
    }));
    res.json(transformedNetCentres);
  } catch (error) {
    next(error);
  }
};
