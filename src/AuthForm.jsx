import { useState } from "react";
import supabase from "./supabase-clientconfig";

function AuthForm({ setUser }) {
  const [signupForm, setSignupForm] = useState({ username: "", email: "", password: "" });
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLogin, setIsLogin] = useState(true);

  const handleFormChange = (e, formType) => {
    const { name, value } = e.target;
    formType === "signup"
      ? setSignupForm((prev) => ({ ...prev, [name]: value }))
      : setLoginForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateEmail = (email) => {
    return email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    const { username, email, password } = signupForm;

    try {
      // Input validation
      if (!username || !email || !password) {
        throw new Error("All fields are required.");
      }

      if (!validateEmail(email)) {
        throw new Error("Please enter a valid email address.");
      }

      if (!validatePassword(password)) {
        throw new Error("Password must be at least 6 characters long.");
      }

      // Hash the password (in a real app, use a proper hashing library)
      const hashedPassword = btoa(password); // This is just for demonstration, use proper hashing in production

      const { error } = await supabase
        .from("users")
        .select("email")
        .eq("email", email)
        .single();

      if (!error) {
        throw new Error("Email already exists. Please use a different email.");
      }

      const { error: insertError } = await supabase
        .from("users")
        .insert([{ username, email, password: hashedPassword }]);

      if (insertError) throw insertError;

      setSignupForm({ username: "", email: "", password: "" });
      setIsLogin(true);
      alert("Signup successful! Please log in.");
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

      // Hash the password to match stored hash
      const hashedPassword = btoa(password); // Use proper hashing in production

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .eq("password", hashedPassword)
        .single();

      if (error || !data) {
        throw new Error("Invalid email or password.");
      }

      setUser(data);
      setLoginForm({ email: "", password: "" });
    } catch (error) {
      setErrorMessage(error.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-toggle">
        <button
          className={`toggle-button ${isLogin ? 'active' : ''}`}
          onClick={() => setIsLogin(true)}
        >
          Login
        </button>
        <button
          className={`toggle-button ${!isLogin ? 'active' : ''}`}
          onClick={() => setIsLogin(false)}
        >
          Sign Up
        </button>
      </div>

      {isLogin ? (
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
      ) : (
        <div className="form-container">
          <h1>Sign Up</h1>
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
      )}
      
      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </div>
  );
}

export default AuthForm;
