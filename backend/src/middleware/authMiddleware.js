import jwt from "jsonwebtoken";
import Customer from "../models/Customer.js";
import Provider from "../models/Provider.js";
const JWT_SECRET = process.env.JWT_SECRET;

export const protectCustomer = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer ")) return res.status(401).json({ message: "Not authorized" });
    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await Customer.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ message: "Invalid token" });
    req.user = user;
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Not authorized" });
  }
};

export const protectProvider = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer ")) return res.status(401).json({ message: "Not authorized" });
    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await Provider.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ message: "Invalid token" });
    req.user = user;
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Not authorized" });
  }
};
