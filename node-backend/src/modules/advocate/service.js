import Grievance from "../grievance/model.js";
import User from "../user/model.js";
import mongoose from "mongoose";

class AdvocateService {
  static _calculateMedian(values) {
    if (!values.length) {
      return 0;
    }

    const sorted = [...values].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 0) {
      return (sorted[middle - 1] + sorted[middle]) / 2;
    }

    return sorted[middle];
  }

  static async getOpenGrievances(filters = {}) {
    const matchStage = {
      status: "open",
    };

    if (filters.platform) {
      matchStage.platform = filters.platform;
    }

    if (filters.category) {
      matchStage.category = filters.category;
    }

    const grievances = await Grievance.aggregate([
      {
        $match: matchStage,
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "worker_id",
          foreignField: "_id",
          as: "worker",
        },
      },
      {
        $unwind: {
          path: "$worker",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          worker_id: 1,
          category: 1,
          platform: 1,
          description: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          worker: {
            _id: "$worker._id",
            name: "$worker.name",
            email: "$worker.email",
            phone: "$worker.phone",
            city: "$worker.city",
            platforms: "$worker.platforms",
          },
        },
      },
    ]);

    return grievances.map((grievance) => ({
      id: grievance._id,
      worker_id: grievance.worker_id,
      category: grievance.category,
      platform: grievance.platform,
      description: grievance.description,
      status: grievance.status,
      createdAt: grievance.createdAt,
      updatedAt: grievance.updatedAt,
      worker: grievance.worker?._id
        ? {
            id: grievance.worker._id,
            name: grievance.worker.name,
            email: grievance.worker.email,
            phone: grievance.worker.phone,
            city: grievance.worker.city,
            platforms: grievance.worker.platforms,
          }
        : null,
    }));
  }

  static async getComplaintById(complaintId) {
    const grievances = await Grievance.aggregate([
      {
        $match: {
          _id: complaintId,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "worker_id",
          foreignField: "_id",
          as: "worker",
        },
      },
      {
        $unwind: {
          path: "$worker",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          worker_id: 1,
          category: 1,
          platform: 1,
          description: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          worker: {
            _id: "$worker._id",
            name: "$worker.name",
            email: "$worker.email",
            phone: "$worker.phone",
            city: "$worker.city",
            platforms: "$worker.platforms",
          },
        },
      },
    ]);

    if (!grievances.length) {
      return null;
    }

    const grievance = grievances[0];

    return {
      id: grievance._id,
      worker_id: grievance.worker_id,
      category: grievance.category,
      platform: grievance.platform,
      description: grievance.description,
      status: grievance.status,
      createdAt: grievance.createdAt,
      updatedAt: grievance.updatedAt,
      worker: grievance.worker?._id
        ? {
            id: grievance.worker._id,
            name: grievance.worker.name,
            email: grievance.worker.email,
            phone: grievance.worker.phone,
            city: grievance.worker.city,
            platforms: grievance.worker.platforms,
          }
        : null,
    };
  }

  static async escalateOpenGrievance({ advocateId, grievanceId }) {
    const advocate = await User.findOne({
      _id: advocateId,
      role: "advocate",
    }).select("_id name email role");

    if (!advocate) {
      return {
        error: "ADVOCATE_NOT_FOUND",
      };
    }

    const grievance = await Grievance.findById(grievanceId);

    if (!grievance) {
      return {
        error: "GRIEVANCE_NOT_FOUND",
      };
    }

    if (grievance.status !== "open") {
      return {
        error: "GRIEVANCE_NOT_OPEN",
      };
    }

    grievance.status = "escalated";
    await grievance.save();

    return {
      complaint: {
        id: grievance._id,
        worker_id: grievance.worker_id,
        category: grievance.category,
        platform: grievance.platform,
        description: grievance.description,
        status: grievance.status,
        createdAt: grievance.createdAt,
        updatedAt: grievance.updatedAt,
      },
      escalated_by: {
        id: advocate._id,
        name: advocate.name,
        email: advocate.email,
      },
    };
  }

  static async getLast30DaysCommissionTrendByPlatform(platform) {
    const db = mongoose.connection.db;
    const earningsCollection = db.collection("earnings");

    const endDate = new Date();
    endDate.setUTCHours(23, 59, 59, 999);

    const startDate = new Date(endDate);
    startDate.setUTCDate(startDate.getUTCDate() - 29);
    startDate.setUTCHours(0, 0, 0, 0);

    const trendRows = await earningsCollection
      .aggregate([
        {
          $match: {
            platform,
          },
        },
        {
          $addFields: {
            parsedDate: {
              $switch: {
                branches: [
                  {
                    case: { $eq: [{ $type: "$date" }, "date"] },
                    then: "$date",
                  },
                  {
                    case: { $eq: [{ $type: "$date" }, "string"] },
                    then: {
                      $dateFromString: {
                        dateString: "$date",
                        onError: null,
                        onNull: null,
                      },
                    },
                  },
                ],
                default: null,
              },
            },
            grossValue: {
              $convert: {
                input: "$gross_earned",
                to: "double",
                onError: 0,
                onNull: 0,
              },
            },
            deductionValue: {
              $convert: {
                input: "$deduction",
                to: "double",
                onError: 0,
                onNull: 0,
              },
            },
          },
        },
        {
          $match: {
            parsedDate: {
              $gte: startDate,
              $lte: endDate,
            },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$parsedDate",
              },
            },
            total_deduction: {
              $sum: "$deductionValue",
            },
            total_gross_earned: {
              $sum: "$grossValue",
            },
          },
        },
        {
          $project: {
            _id: 0,
            date: "$_id",
            total_deduction: {
              $round: ["$total_deduction", 2],
            },
            total_gross_earned: {
              $round: ["$total_gross_earned", 2],
            },
            commission_percentage: {
              $cond: [
                { $gt: ["$total_gross_earned", 0] },
                {
                  $round: [
                    {
                      $multiply: [
                        {
                          $divide: ["$total_deduction", "$total_gross_earned"],
                        },
                        100,
                      ],
                    },
                    2,
                  ],
                },
                0,
              ],
            },
          },
        },
        {
          $sort: {
            date: 1,
          },
        },
      ])
      .toArray();

    const rowsByDate = new Map(trendRows.map((row) => [row.date, row]));
    const trend = [];

    const cursor = new Date(startDate);
    while (cursor <= endDate) {
      const dateKey = cursor.toISOString().split("T")[0];
      const existing = rowsByDate.get(dateKey);

      trend.push(
        existing || {
          date: dateKey,
          total_deduction: 0,
          total_gross_earned: 0,
          commission_percentage: 0,
        },
      );

      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    return {
      platform,
      window_days: 30,
      start_date: startDate.toISOString().split("T")[0],
      end_date: endDate.toISOString().split("T")[0],
      trend,
    };
  }

  static async getCityZoneVolatility(city) {
    const db = mongoose.connection.db;
    const earningsCollection = db.collection("earnings");

    const escapedCity = city.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const cityRegex = new RegExp(`^${escapedCity}$`, "i");

    const zoneRows = await earningsCollection
      .aggregate([
        {
          $match: {
            city: cityRegex,
          },
        },
        {
          $addFields: {
            zone: {
              $cond: [
                {
                  $and: [
                    { $ne: ["$city_zone", null] },
                    { $ne: ["$city_zone", ""] },
                  ],
                },
                "$city_zone",
                "unknown",
              ],
            },
            netValue: {
              $convert: {
                input: "$net_received",
                to: "double",
                onError: 0,
                onNull: 0,
              },
            },
          },
        },
        {
          $group: {
            _id: "$zone",
            values: {
              $push: "$netValue",
            },
            records_count: {
              $sum: 1,
            },
            mean_net_received: {
              $avg: "$netValue",
            },
            std_dev_net_received: {
              $stdDevPop: "$netValue",
            },
          },
        },
        {
          $project: {
            _id: 0,
            zone: "$_id",
            values: 1,
            std_dev_net_received: {
              $round: ["$std_dev_net_received", 2],
            },
          },
        },
        {
          $sort: {
            zone: 1,
          },
        },
      ])
      .toArray();

    const volatility = zoneRows.map((row) => ({
      zone: row.zone,
      median_net_received: Number(
        AdvocateService._calculateMedian(row.values).toFixed(2),
      ),
      std_dev_net_received: row.std_dev_net_received,
    }));

    return {
      city,
      zone_count: volatility.length,
      volatility,
    };
  }
}

export default AdvocateService;
