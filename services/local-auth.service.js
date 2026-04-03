const fs = require("fs/promises");
const path = require("path");
const { createId } = require("../utils/id.util");

const usersFilePath = path.join(__dirname, "..", "data", "users.json");
const useMemoryStore = process.env.VERCEL === "1";
let memoryUsers = null;

async function readUsers() {
  if (useMemoryStore) {
    if (memoryUsers) {
      return memoryUsers;
    }

    try {
      const file = await fs.readFile(usersFilePath, "utf8");
      const data = JSON.parse(file);
      memoryUsers = Array.isArray(data) ? data : [];
    } catch (error) {
      memoryUsers = [];
    }

    return memoryUsers;
  }

  try {
    const file = await fs.readFile(usersFilePath, "utf8");
    const data = JSON.parse(file);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

async function writeUsers(users) {
  if (useMemoryStore) {
    memoryUsers = users;
    return;
  }

  await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2) + "\n", "utf8");
}

function matchesIdentity(user, identity) {
  const normalizedIdentity = String(identity || "").trim().toLowerCase();
  return user.email === normalizedIdentity || String(user.username || "").toLowerCase() === normalizedIdentity;
}

async function findUserByIdentity(identity) {
  const users = await readUsers();
  return users.find((user) => matchesIdentity(user, identity)) || null;
}

async function createOrUpdatePendingUser(payload) {
  const users = await readUsers();
  const existingIndex = users.findIndex((user) => user.email === payload.email || String(user.username || "").toLowerCase() === String(payload.username || "").toLowerCase());
  const now = new Date().toISOString();
  const generatedId = createId("user");

  const baseUser = existingIndex >= 0 ? users[existingIndex] : null;

  const user = {
    id: baseUser ? baseUser.id : generatedId,
    _id: baseUser ? baseUser._id || baseUser.id : generatedId,
    username: payload.username,
    email: payload.email,
    phone: payload.phone || "",
    passwordHash: payload.passwordHash,
    isVerified: false,
    registerOtpHash: payload.registerOtpHash,
    registerOtpExpiresAt: payload.registerOtpExpiresAt,
    defaultAddress: baseUser ? baseUser.defaultAddress || null : null,
    createdAt: baseUser ? baseUser.createdAt || now : now,
    updatedAt: now
  };

  if (existingIndex >= 0) {
    users[existingIndex] = user;
  } else {
    users.push(user);
  }

  await writeUsers(users);
  return user;
}

async function verifyPendingUser(identity) {
  const users = await readUsers();
  const index = users.findIndex((user) => matchesIdentity(user, identity));

  if (index < 0) {
    return null;
  }

  users[index] = {
    ...users[index],
    isVerified: true,
    registerOtpHash: "",
    registerOtpExpiresAt: null,
    updatedAt: new Date().toISOString()
  };

  await writeUsers(users);
  return users[index];
}

async function findUserById(id) {
  const users = await readUsers();
  return users.find((user) => String(user._id || user.id) === String(id)) || null;
}

module.exports = {
  findUserByIdentity,
  createOrUpdatePendingUser,
  verifyPendingUser,
  findUserById
};
