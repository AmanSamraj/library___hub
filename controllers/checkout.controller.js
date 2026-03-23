async function getAddress(req, res) {
  res.json({
    address: req.user.defaultAddress || null
  });
}

async function saveAddress(req, res) {
  const fullName = String(req.body.fullName || "").trim();
  const line1 = String(req.body.line1 || "").trim();
  const phone = String(req.body.phone || "").trim();
  const label = String(req.body.label || "HOME").trim() || "HOME";

  if (!fullName || !line1 || !phone) {
    return res.status(400).json({ message: "Full name, address, and phone are required" });
  }

  req.user.defaultAddress = { fullName, line1, phone, label };
  await req.user.save();

  return res.json({
    message: "Address saved",
    address: req.user.defaultAddress
  });
}

module.exports = {
  getAddress,
  saveAddress
};
