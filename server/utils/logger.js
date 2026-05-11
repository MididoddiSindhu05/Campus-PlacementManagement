/* Simple structured logger — extend with Winston in production */

export function logInfo(message, meta = {}) {
  console.log(JSON.stringify({ level: "info", message, ...meta, t: new Date().toISOString() }));
}

export function logError(message, err = null) {
  console.error(
    JSON.stringify({
      level: "error",
      message,
      err: err?.message || err,
      stack: err?.stack,
      t: new Date().toISOString(),
    })
  );
}
