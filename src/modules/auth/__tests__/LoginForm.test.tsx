import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { api, ApiError } from "@/lib/api";
import { AuthProvider, LoginForm } from "../index";

// Capture navigation and mock the API client (the single network seam).
const push = vi.fn();
const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace }),
  usePathname: () => "/login",
}));

vi.mock("@/lib/api", async (importActual) => {
  const actual = await importActual<typeof import("@/lib/api")>();
  return {
    ...actual,
    api: { get: vi.fn(), post: vi.fn() },
  };
});

const post = vi.mocked(api.post);
const get = vi.mocked(api.get);

const user = {
  id: "1",
  email: "ada@example.com",
  role: "admin",
  firstName: "Ada",
  lastName: "Lovelace",
};

function renderForm() {
  return render(
    <AuthProvider>
      <LoginForm />
    </AuthProvider>,
  );
}

describe("LoginForm", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders the email and password fields and submit button", () => {
    renderForm();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in/i }),
    ).toBeInTheDocument();
  });

  it("validates required fields without calling the service", async () => {
    const u = userEvent.setup();
    renderForm();

    await u.click(screen.getByRole("button", { name: /sign in/i }));

    expect(screen.getByText("Email is required.")).toBeInTheDocument();
    expect(screen.getByText("Password is required.")).toBeInTheDocument();
    expect(post).not.toHaveBeenCalled();
  });

  it("flags a malformed email", async () => {
    const u = userEvent.setup();
    renderForm();

    await u.type(screen.getByLabelText("Email"), "not-an-email");
    await u.type(screen.getByLabelText("Password"), "secret");
    await u.click(screen.getByRole("button", { name: /sign in/i }));

    expect(
      screen.getByText("Enter a valid email address."),
    ).toBeInTheDocument();
    expect(post).not.toHaveBeenCalled();
  });

  it("logs in and redirects to / on success", async () => {
    const u = userEvent.setup();
    post.mockResolvedValue({
      success: true,
      data: { accessToken: "acc-1", refreshToken: "ref-1" },
    });
    get.mockResolvedValue({ success: true, data: user });

    renderForm();
    await u.type(screen.getByLabelText("Email"), "ada@example.com");
    await u.type(screen.getByLabelText("Password"), "secret");
    await u.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(post).toHaveBeenCalledWith("/auth/login", {
        email: "ada@example.com",
        password: "secret",
      });
      expect(push).toHaveBeenCalledWith("/");
    });
  });

  it("shows a friendly error when the credentials are rejected (401)", async () => {
    const u = userEvent.setup();
    post.mockRejectedValue(new ApiError("Unauthorized", 401));

    renderForm();
    await u.type(screen.getByLabelText("Email"), "ada@example.com");
    await u.type(screen.getByLabelText("Password"), "wrong");
    await u.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Incorrect email or password.",
    );
    expect(push).not.toHaveBeenCalled();
  });
});
