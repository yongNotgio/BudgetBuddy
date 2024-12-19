import { useState } from "react";
import supabase from "./supabase-clientconfig";

function AuthForm({ setUser }) {
  const [signupForm, setSignupForm] = useState({ username: "", email: "", password: "" });
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleFormChange = (e, formType) => {
    const { name, value } = e.target;
    formType === "signup"
      ? setSignupForm((prev) => ({ ...prev, [name]: value }))
      : setLoginForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    const { username, email, password } = signupForm;

    try {
      if (!username || !email || !password) {
        throw new Error("All fields are required.");
      }

      const { error } = await supabase.from("user").insert([{ username, email, password }]);
      if (error) throw error;

      alert("Signup successful! Please log in.");
      setSignupForm({ username: "", email: "", password: "" });
    } catch (error) {
      setErrorMessage(error.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    const { email, password } = loginForm;

    try {
      if (!email || !password) {
        throw new Error("Both email and password are required.");
      }

      const { data, error } = await supabase
        .from("user")
        .select("*")
        .eq("email", email)
        .eq("password", password)
        .single();

      if (error) throw new Error("Invalid email or password.");
      setUser(data);
      alert(`Welcome back, ${data.username}!`);
      setLoginForm({ email: "", password: "" });
    } catch (error) {
      setErrorMessage(error.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="form-container">
        <h1>Signup</h1>
        <form onSubmit={handleSignup}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={signupForm.username}
            onChange={(e) => handleFormChange(e, "signup")}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={signupForm.email}
            onChange={(e) => handleFormChange(e, "signup")}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={signupForm.password}
            onChange={(e) => handleFormChange(e, "signup")}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>
      </div>
      <div className="form-container">
        <h1>Login</h1>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={loginForm.email}
            onChange={(e) => handleFormChange(e, "login")}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={loginForm.password}
            onChange={(e) => handleFormChange(e, "login")}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>
      </div>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </div>
  );
}

export default AuthForm;