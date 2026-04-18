import Grievance from "./model.js";

class GrievanceService {
  static async create(payload, workerId) {
    const grievance = await Grievance.create({
      worker_id: workerId,
      category: payload.category,
      platform: payload.platform,
      description: payload.description,
    });

    return {
      id: grievance._id,
      worker_id: grievance.worker_id,
      category: grievance.category,
      platform: grievance.platform,
      description: grievance.description,
      status: grievance.status,
      createdAt: grievance.createdAt,
      updatedAt: grievance.updatedAt,
    };
  }
}

export default GrievanceService;
