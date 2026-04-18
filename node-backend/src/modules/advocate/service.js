import Grievance from "../grievance/model.js";
import User from "../user/model.js";

class AdvocateService {
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
}

export default AdvocateService;
