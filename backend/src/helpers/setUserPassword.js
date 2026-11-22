/**
 * Assign a plain-text password; user model pre-save hook hashes it once.
 */
export async function setUserPassword(user, plainPassword) {
  user.password = plainPassword;
  return user.save();
}
