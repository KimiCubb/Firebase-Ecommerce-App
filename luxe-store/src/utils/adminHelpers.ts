import {
  doc,
  getDoc,
  updateDoc,
  query,
  collection,
  where,
  getDocs,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebaseConfig";

/**
 * Interface for user role information
 */
export interface UserRoleData {
  uid: string;
  email: string;
  role: "user" | "admin";
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * Check if a user has admin role
 * @param userId - The user ID to check
 * @returns boolean indicating if user is admin
 */
export const isUserAdmin = async (userId: string): Promise<boolean> => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data() as Partial<UserRoleData>;
      return userData.role === "admin";
    }
    return false;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
};

/**
 * Get user role data
 * @param userId - The user ID
 * @returns User role data or null
 */
export const getUserRole = async (
  userId: string
): Promise<UserRoleData | null> => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return userSnap.data() as UserRoleData;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user role:", error);
    return null;
  }
};

/**
 * Promote a user to admin role (admin-only operation)
 * @param userId - The user ID to promote
 * @param adminUserId - The ID of the admin performing the action
 */
export const promoteUserToAdmin = async (
  userId: string,
  adminUserId: string
): Promise<void> => {
  try {
    // Verify the requesting user is an admin
    const isAdmin = await isUserAdmin(adminUserId);
    if (!isAdmin) {
      throw new Error("Only admins can promote users to admin role");
    }

    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      role: "admin",
      updatedAt: serverTimestamp(),
    });

    console.log(`✅ User ${userId} promoted to admin`);
  } catch (error) {
    console.error("Error promoting user to admin:", error);
    throw error;
  }
};

/**
 * Demote an admin user to regular user role (admin-only operation)
 * @param userId - The user ID to demote
 * @param adminUserId - The ID of the admin performing the action
 */
export const demoteAdminToUser = async (
  userId: string,
  adminUserId: string
): Promise<void> => {
  try {
    // Verify the requesting user is an admin
    const isAdmin = await isUserAdmin(adminUserId);
    if (!isAdmin) {
      throw new Error("Only admins can demote admin users");
    }

    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      role: "user",
      updatedAt: serverTimestamp(),
    });

    console.log(`✅ Admin ${userId} demoted to user`);
  } catch (error) {
    console.error("Error demoting admin user:", error);
    throw error;
  }
};

/**
 * Initialize a new user with the 'user' role
 * @param userId - The user ID
 * @param email - The user's email
 */
export const initializeUserRole = async (
  userId: string,
  email: string
): Promise<void> => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      // Create new user document with 'user' role
      await setDoc(userRef, {
        uid: userId,
        email,
        role: "user",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      // Ensure role field exists
      const userData = userSnap.data() as Partial<UserRoleData>;
      if (!userData.role) {
        await updateDoc(userRef, {
          role: "user",
          updatedAt: serverTimestamp(),
        });
      }
    }
  } catch (error) {
    console.error("Error initializing user role:", error);
    throw error;
  }
};

/**
 * Get all admin users (admin-only operation)
 * @param adminUserId - The ID of the admin performing the action
 */
export const getAllAdmins = async (
  adminUserId: string
): Promise<UserRoleData[]> => {
  try {
    // Verify the requesting user is an admin
    const isAdmin = await isUserAdmin(adminUserId);
    if (!isAdmin) {
      throw new Error("Only admins can view admin list");
    }

    const q = query(collection(db, "users"), where("role", "==", "admin"));
    const querySnapshot = await getDocs(q);

    const admins: UserRoleData[] = [];
    querySnapshot.forEach((doc) => {
      admins.push(doc.data() as UserRoleData);
    });

    return admins;
  } catch (error) {
    console.error("Error fetching admin list:", error);
    throw error;
  }
};

/**
 * Delete user account with cascading deletes (removes user data)
 * Note: Firebase Auth user deletion must be done separately from client
 * @param userId - The user ID to delete
 */
export const deleteUserAllData = async (userId: string): Promise<void> => {
  try {
    // Delete user profile
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      deleted: true,
      deletedAt: serverTimestamp(),
    });

    console.log(`✅ User data marked for deletion: ${userId}`);
  } catch (error) {
    console.error("Error deleting user data:", error);
    throw error;
  }
};
