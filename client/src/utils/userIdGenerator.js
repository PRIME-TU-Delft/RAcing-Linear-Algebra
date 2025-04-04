import { v4 as uuidv4, validate as validateUuid } from 'uuid';

/**
 * Retrieves the user ID from localStorage. If it doesn't exist,
 * a new UUID is generated, stored, and returned.
 *
 * @returns {string} The persistent user ID.
 */
export function getOrCreateUserId() {
  let userId = localStorage.getItem("userId");
  if (!userId || !validateUuid(userId)) {
    userId = uuidv4();
    localStorage.setItem("userId", userId);
  }
  return userId;
}