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
  static async getTopComplaints() {
    const topComplaints = await Grievance.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 5,
      },
      {
        $project: {
          category: "$_id",
          count: 1,
          _id: 0,
        },
      },
    ]);
    return topComplaints;
  }

  static async getIncomeByCity() {
    const db = mongoose.connection.db;
    const earningsCollection = db.collection("earnings");

    const incomeByCity = await earningsCollection
      .aggregate([
        {
          $match: {
            status: "approved", // Assuming "approved" or confirmed
          },
        },
        {
          $group: {
            _id: "$city",
            value: { $sum: "$net_received" },
          },
        },
        {
          $project: {
            name: { $ifNull: ["$_id", "Unknown"] },
            value: 1,
            _id: 0,
          },
        },
        {
          $match: {
            name: { $ne: "Unknown" }
          }
        },
        {
          $sort: { value: -1 }
        }
      ])
      .toArray();
      
    // Default fallback to show something matching the charts if data is completely empty
    if (incomeByCity.length === 0) {
      return [
        { name: "Lahore", value: 0 },
        { name: "Karachi", value: 0 },
        { name: "Islamabad", value: 0 },
        { name: "Rawalpindi", value: 0 },
      ];
    }
    
    return incomeByCity;
  }

  static async getCommissionTrend() {
    const db = mongoose.connection.db;
    const earningsCollection = db.collection("earnings");

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const trendQuery = await earningsCollection
      .aggregate([
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
              }
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
          }
        },
        {
          $match: {
            parsedDate: { $gte: sixMonthsAgo },
          },
        },
        {
          $group: {
            _id: {
              platform: "$platform",
              month: { $month: "$parsedDate" },
              year: { $year: "$parsedDate" }
            },
            total_gross: { $sum: "$grossValue" },
            total_deduction: { $sum: "$deductionValue" },
          },
        },
        {
          $project: {
            platform: "$_id.platform",
            monthNum: "$_id.month",
            year: "$_id.year",
            commissionRate: {
              $cond: [
                { $gt: ["$total_gross", 0] },
                { $round: [{ $multiply: [{ $divide: ["$total_deduction", "$total_gross"] }, 100] }, 1] },
                0
              ]
            }
          }
        },
        { $sort: { year: 1, monthNum: 1 } }
      ])
      .toArray();

    // Map month numbers to short names
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    // Process data to fit Recharts line chart formatting
    const formattedDataMap = new Map();
    
    trendQuery.forEach(row => {
      if (!row.monthNum) return; // Skip if null date
      const monthStr = monthNames[row.monthNum - 1];
      if (!formattedDataMap.has(monthStr)) {
        formattedDataMap.set(monthStr, { month: monthStr });
      }
      
      const record = formattedDataMap.get(monthStr);
      record[row.platform || 'Unknown'] = row.commissionRate;
    });

    return Array.from(formattedDataMap.values());
  }

  static async getVulnerableWorkers() {
    const db = mongoose.connection.db;
    const earningsCollection = db.collection("earnings");

    const currentMonthDate = new Date();
    const currentMonth = currentMonthDate.getMonth() + 1;
    const currentYear = currentMonthDate.getFullYear();

    const previousMonthDate = new Date();
    previousMonthDate.setMonth(previousMonthDate.getMonth() - 1);
    const previousMonth = previousMonthDate.getMonth() + 1;
    const previousYear = previousMonthDate.getFullYear();

    const earningsQuery = await earningsCollection
      .aggregate([
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
              }
            },
            netValue: {
              $convert: {
                input: "$net_received",
                to: "double",
                onError: 0,
                onNull: 0,
              },
            },
          }
        },
        {
          $match: {
            parsedDate: { 
              $gte: new Date(previousYear, previousMonth - 1, 1),
              $lte: new Date(currentYear, currentMonth, 0)
            }
          },
        },
        {
          $group: {
            _id: {
              worker_id: "$worker_id",
              platform: "$platform",
              isCurrentMonth: { 
                $and: [
                  { $eq: [{ $month: "$parsedDate" }, currentMonth] },
                  { $eq: [{ $year: "$parsedDate" }, currentYear] }
                ]
              }
            },
            totalNet: { $sum: "$netValue" }
          }
        },
        {
          $group: {
            _id: { worker_id: "$_id.worker_id", platform: "$_id.platform" },
            previousMonthIncome: {
              $sum: { $cond: [{ $eq: ["$_id.isCurrentMonth", false] }, "$totalNet", 0] }
            },
            currentMonthIncome: {
              $sum: { $cond: [{ $eq: ["$_id.isCurrentMonth", true] }, "$totalNet", 0] }
            }
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "_id.worker_id",
            foreignField: "_id",
            as: "workerData"
          }
        },
        {
          $unwind: { path: "$workerData", preserveNullAndEmptyArrays: true }
        }
      ])
      .toArray();

    // Filter for >20% drop using JS calculation
    const vulnerable = [];
    
    earningsQuery.forEach((row) => {
      const prev = row.previousMonthIncome;
      const curr = row.currentMonthIncome;
      
      if (prev > 0) {
        const dropPercent = Math.round(((prev - curr) / prev) * 100);
        if (dropPercent >= 20) {
          vulnerable.push({
            id: row.workerData ? row.workerData._id.toString().substring(18) : row._id.worker_id.toString().substring(18),
            worker_id: row._id.worker_id,
            name: row.workerData ? row.workerData.name : "Unknown Worker",
            platform: row._id.platform || "Unknown",
            previousMonth: prev,
            currentMonth: curr,
            dropPercent: dropPercent
          });
        }
      }
    });

    // Sort by largest drop first
    vulnerable.sort((a, b) => b.dropPercent - a.dropPercent);
    return vulnerable;
  }
}

export default AdvocateService;
