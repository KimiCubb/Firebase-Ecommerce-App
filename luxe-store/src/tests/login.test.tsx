/// <reference types="jest" />
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Login from "../login";
import { AuthProvider } from "../contexts/AuthContext";
import { ToastProvider } from "../contexts/ToastContext";
import * as authModule from "firebase/auth";

jest.mock("firebase/auth", () => ({
  signInWithEmailAndPassword: jest.fn(),
  onAuthStateChanged: jest.fn(() => () => {}),
  signOut: jest.fn(),
}));

jest.mock("../firebaseConfig", () => ({
  auth: {
    currentUser: null,
  },
}));

describe("Login Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderLoginComponent = () => {
    return render(
      <AuthProvider>
        <ToastProvider>
          <Login />
        </ToastProvider>
      </AuthProvider>
    );
  };

  test("renders login form with email and password inputs", () => {
    renderLoginComponent();

    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const submitButton = screen.getByRole("button", { name: /login/i });

    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();
  });

  test("updates input values when user types", async () => {
    const user = userEvent.setup();
    renderLoginComponent();

    const emailInput = screen.getByPlaceholderText(
      /email/i
    ) as HTMLInputElement;
    const passwordInput = screen.getByPlaceholderText(
      /password/i
    ) as HTMLInputElement;

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");

    expect(emailInput.value).toBe("test@example.com");
    expect(passwordInput.value).toBe("password123");
  });

  test("handles form submission", async () => {
    const user = userEvent.setup();
    renderLoginComponent();

    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const submitButton = screen.getByRole("button", { name: /login/i });

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");
    await user.click(submitButton);

    expect(submitButton).toBeInTheDocument();
  });

  test("displays error message on failed authentication", async () => {
    const mockSignIn = jest.mocked(authModule.signInWithEmailAndPassword);
    mockSignIn.mockRejectedValueOnce(new Error("Invalid credentials"));

    const user = userEvent.setup();
    renderLoginComponent();

    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const submitButton = screen.getByRole("button", { name: /login/i });

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "wrongpassword");
    await user.click(submitButton);

    await waitFor(() => {
      const errorMessage = screen.queryByText(/Login failed/i);
      expect(errorMessage).toBeInTheDocument();
    });
  });
});
