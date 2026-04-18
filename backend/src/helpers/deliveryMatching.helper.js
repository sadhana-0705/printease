const Order = require("../models/Order");
const NetCentre = require("../models/NetCentre");

const ACTIVE_DELIVERY_STATUSES = ["assigned", "picked_up", "out_for_delivery"];

function toRadians(value) {
  return (value * Math.PI) / 180;
}

function haversineDistanceInKm(from, to) {
  const earthRadiusKm = 6371;
  const dLat = toRadians(to.lat - from.lat);
  const dLng = toRadians(to.lng - from.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(from.lat)) *
      Math.cos(toRadians(to.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

function isValidLocation(location) {
  return (
    location &&
    typeof location.lat === "number" &&
    typeof location.lng === "number"
  );
}

async function getActiveWorkloadByDeliveryBoyId(deliveryBoyId) {
  const activeWorkloads = await Order.aggregate([
    {
      $match: {
        deliveryBoyId,
        status: { $in: ACTIVE_DELIVERY_STATUSES }
      }
    },
    {
      $group: {
        _id: "$deliveryBoyId",
        count: { $sum: 1 }
      }
    }
  ]);

  return activeWorkloads[0]?.count || 0;
}

async function getAvailableOrdersForDeliveryBoy(deliveryBoy) {
  const availableOrders = await Order.find({
    deliveryType: "delivery",
    status: "available",
    deliveryBoyId: null,
    rejectedByDeliveryBoys: { $ne: deliveryBoy._id }
  })
    .populate({ path: "netCentreId", select: "name address location" })
    .sort({ createdAt: -1 });

  const workload = await getActiveWorkloadByDeliveryBoyId(deliveryBoy._id);

  return availableOrders
    .map((order) => {
      const netCentreLocation = order.netCentreId?.location;
      const deliveryBoyLocation = deliveryBoy.location;

      if (!isValidLocation(netCentreLocation) || !isValidLocation(deliveryBoyLocation)) {
        return {
          order,
          distanceKm: null,
          workload,
          score: Number.POSITIVE_INFINITY,
          inPreferredRange: false
        };
      }

      const distanceKm = haversineDistanceInKm(netCentreLocation, deliveryBoyLocation);
      return {
        order,
        distanceKm,
        workload,
        score: distanceKm + workload,
        inPreferredRange: true
      };
    })
    .sort((left, right) => {
      if (left.score !== right.score) {
        return left.score - right.score;
      }

      return left.distanceKm - right.distanceKm;
    });
}

module.exports = {
  getAvailableOrdersForDeliveryBoy,
  haversineDistanceInKm,
  isValidLocation
};
