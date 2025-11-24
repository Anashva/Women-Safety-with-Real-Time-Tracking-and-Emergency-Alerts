const Alert = require("../models/Alert");

module.exports = async function getRiskLevel(lat, lng) {
  const radius = 500; // 500 meters
  const days = 30; // check last 30 days

  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  // Count alerts in radius
  const alertCount = await Alert.countDocuments({
    createdAt: { $gte: since },
    location: {
      $geoWithin: {
        $centerSphere: [[lng, lat], radius / 6378137], // earth radius meters
      },
    },
  });

  // Decide level
  if (alertCount >= 10) return { level: "high", color: "red" };
  if (alertCount >= 5) return { level: "medium", color: "yellow" };

  return { level: "low", color: "green" };
};
