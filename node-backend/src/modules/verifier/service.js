

import mongoose from "mongoose";

class VerifierService {
  static async getPendingShifts() {
    const db = mongoose.connection.db;
    const earningsCollection = db.collection("earnings");
    
    // Fetch only the pending earning records without looking up the worker
    const pendingEarnings = await earningsCollection.find({ status: "pending" }).toArray();

    return pendingEarnings.map(doc => {
      let docDate = doc.date;
      if (doc.date instanceof Date) {
        docDate = doc.date.toISOString().split('T')[0];
      } else if (typeof doc.date === 'string') {
        docDate = doc.date.split('T')[0];
      }

      return {
        id: doc._id.toString(),
        platform: doc.platform,
        city: doc.city || 'unspecified',
        date: docDate,
        hours: doc.hours_worked,
        gross: doc.gross_earned,
        deduction: doc.deduction,
        net: doc.net_received,
        status: doc.status ? (doc.status.charAt(0).toUpperCase() + doc.status.slice(1)) : "Pending", 
        screenshot: doc.screenshot_url
      };
    });
  }

  static async getHistoryShifts() {
    const db = mongoose.connection.db;
    const earningsCollection = db.collection("earnings");
    
    // Fetch only the non-pending earning records without looking up the worker
    const historyEarnings = await earningsCollection.find({ status: { $ne: "pending" } }).toArray();

    return historyEarnings.map(doc => {
      let docDate = doc.date;
      if (doc.date instanceof Date) {
        docDate = doc.date.toISOString().split('T')[0];
      } else if (typeof doc.date === 'string') {
        docDate = doc.date.split('T')[0];
      }

      let mappedStatus = "Flagged";
      if (doc.status === "verified") {
        mappedStatus = "Confirmed";
      } else if (doc.status === "unverifiable") {
        mappedStatus = "Unverifiable";
      }

      return {
        _id: doc._id.toString(),
        worker_id: doc.worker_id ? doc.worker_id.toString() : "",
        platform: doc.platform,
        city: doc.city || 'unspecified',
        date: docDate,
        hours_worked: doc.hours_worked,
        gross_earned: doc.gross_earned,
        deduction: doc.deduction,
        net_received: doc.net_received,
        status: mappedStatus,
        screenshot_url: doc.screenshot_url
      };
    });
  }

  static async updateShiftStatus(shiftId, status) {
    const db = mongoose.connection.db;
    const earningsCollection = db.collection("earnings");

    let objectId;
    try {
      objectId = new mongoose.Types.ObjectId(shiftId);
    } catch(err) {
      throw new Error("Shift not found");
    }

    let newStatus = status.toLowerCase();
    if (status === "Confirmed") newStatus = "verified";
    else if (status === "Flagged") newStatus = "flagged";
    else if (status === "Unverifiable") newStatus = "unverifiable";

    const result = await earningsCollection.findOneAndUpdate(
      { _id: objectId },
      { $set: { status: newStatus } },
      { returnDocument: "after" }
    );
    
    if (!result) {
      throw new Error("Shift not found");
    }
    
    return result;
  }
}

export default VerifierService;