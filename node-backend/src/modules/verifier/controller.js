import VerifierService from './service.js';

class VerifierController {
  
  static async fetchPending(req, res) {
    try {
      // You can also add role checks here (e.g., ensure req.user.role === 'verifier')
      const pendingShifts = await VerifierService.getPendingShifts();
      
      res.status(200).json({ 
        success: true, 
        message: "Pending shifts fetched successfully",
        data: pendingShifts 
      });
    } catch (error) {
      console.error("Fetch Pending Error:", error);
      res.status(500).json({ success: false, message: "Server error fetching shifts" });
    }
  }

  static async fetchHistory(req, res) {
    try {
      const historyShifts = await VerifierService.getHistoryShifts();
      
      res.status(200).json({ 
        success: true, 
        message: "History shifts fetched successfully",
        data: historyShifts 
      });
    } catch (error) {
      console.error("Fetch History Error:", error);
      res.status(500).json({ success: false, message: "Server error fetching shifts" });
    }
  }

  static async updateStatus(req, res) {
    try {
      const shiftId = req.params.id; // Changed from parseInt to string for MongoDB ObjectId
      const { status } = req.body; 

      if (!status) {
        return res.status(400).json({ success: false, message: "Status is required" });
      }

      const updatedShift = await VerifierService.updateShiftStatus(shiftId, status);

      res.status(200).json({ 
        success: true, 
        message: `Shift officially marked as ${status}`,
        data: updatedShift 
      });
    } catch (error) {
      console.error("Update Status Error:", error);
      if (error.message === "Shift not found") {
        return res.status(404).json({ success: false, message: error.message });
      }
      res.status(500).json({ success: false, message: "Server error updating shift" });
    }
  }
}

export default VerifierController;