const buckets = new Map();

const createRateLimit = ({ windowMs, max, keyGenerator }) => (req, res, next) => {
  const now = Date.now();
  const key = keyGenerator(req);
  const entry = buckets.get(key);

  if (!entry || entry.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return next();
  }

  if (entry.count >= max) {
    return res.status(429).json({ message: "Too many requests. Please try again later." });
  }

  entry.count += 1;
  next();
};

const emailOrIp = (req) => `${req.ip}:${String(req.body?.email || "").trim().toLowerCase()}`;

exports.authRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  keyGenerator: emailOrIp,
});

exports.otpRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  keyGenerator: emailOrIp,
});
