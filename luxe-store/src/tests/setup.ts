import "@testing-library/jest-dom";

/**
 * Mock window.matchMedia for responsive design tests
 */
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

/**
 * Mock Firebase Auth module
 */
jest.mock("firebase/auth", () => ({
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(),
}));

/**
 * Mock Firebase Config
 */
jest.mock("../firebaseConfig", () => ({
  auth: {
    currentUser: null,
  },
}));
