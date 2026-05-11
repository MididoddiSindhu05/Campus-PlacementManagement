import { ok } from "../utils/apiResponse.js";
import { refreshStudentRankings } from "../services/rankingService.js";

export async function refreshRankings(req, res, next) {
  try {
    await refreshStudentRankings();
    return ok(res, null, "Rankings refreshed");
  } catch (e) {
    next(e);
  }
}
