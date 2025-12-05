import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  collection,
  where,
  getDocs,
} from "firebase/firestore";
import { deleteUser, type User } from "firebase/auth";
import { db } from "../firebaseConfig";
import type { User as FirebaseUser } from "firebase/auth";

export interface UserProfile {
  uid: string;
  email: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  city?: string;
  zipCode?: string;
  phone?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export const saveUserToFirestore = async (
  user: User,
  additionalData?: Partial<UserProfile>
) => {
  const userRef = doc(db, "users", user.uid);
  await setDoc(userRef, {
    uid: user.uid,
    email: user.email,
    ...additionalData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const getUserProfile = async (
  userId: string
): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return userSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

export const updateUserProfile = async (
  userId: string,
  data: Partial<UserProfile>
) => {
  try {
    const userRef = doc(db, "users", userId);

    // First check if document exists
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      // If document doesn't exist, create it with setDoc
      console.log("User document doesn't exist, creating it...");
      await setDoc(userRef, {
        uid: userId,
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      // Document exists, update it
      await updateDoc(userRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
    }

    console.log("✅ Profile updated successfully");
  } catch (error) {
    console.error("❌ Error updating profile:", error);
    throw error;
  }
};

export const deleteUserAccount = async (
  userId: string,
  firebaseUser?: FirebaseUser | null
) => {
  try {
    // Delete user profile document from Firestore
    const userRef = doc(db, "users", userId);
    await deleteDoc(userRef);
    console.log("✅ User profile document deleted from Firestore");

    // Delete user orders from Firestore (cascade delete)
    const ordersQuery = query(
      collection(db, "orders"),
      where("userId", "==", userId)
    );
    const ordersSnapshot = await getDocs(ordersQuery);
    const deleteOrdersPromises = ordersSnapshot.docs.map((doc) =>
      deleteDoc(doc.ref)
    );
    await Promise.all(deleteOrdersPromises);
    console.log("✅ User orders deleted from Firestore");

    // Delete user from Firebase Authentication
    if (firebaseUser) {
      try {
        await deleteUser(firebaseUser);
        console.log("✅ User account deleted from Firebase Auth");
      } catch (authError: unknown) {
        // If the user requires re-authentication, throw a specific error
        const error = authError as Record<string, string>;
        if (error.code === "auth/requires-recent-login") {
          throw new Error(
            "Please log out and log in again before deleting your account for security reasons."
          );
        }
        throw authError;
      }
    }

    console.log("✅ User account completely deleted");
  } catch (error) {
    console.error("❌ Error deleting user account:", error);
    throw error;
  }
};
