import { PlacementDrive } from "../models/PlacementDrive.js";
import { notifyRole } from "../services/notificationService.js";
import { logInfo } from "../utils/logger.js";

const INTERVAL_MS = 6 * 60 * 60 * 1000;

export function startDriveReminderJob() {
  const run = async () => {
    try {
      const now = new Date();
      const horizon = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const drives = await PlacementDrive.find({
        status: "open",
        applicationDeadline: { $gte: now, $lte: horizon },
      }).limit(50);
      for (const d of drives) {
        await notifyRole(
          "student",
          `Deadline reminder: ${d.title}`,
          `Applications close ${new Date(d.applicationDeadline).toLocaleString()}.`,
          "reminder",
          "/drives"
        );
      }
      if (drives.length) logInfo("Drive reminder batch", { count: drives.length });
    } catch (e) {
      console.error(e);
    }
  };
  run();
  return setInterval(run, INTERVAL_MS);
}
