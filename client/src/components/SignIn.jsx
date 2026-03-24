/*
  components/SignIn.jsx — Dark futuristic sign-in form
*/
import React, { useState } from "react";
import { loginUser } from "../api";
import { Eye, EyeOff, Loader2 } from "lucide-react";

const SignIn = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await loginUser(formData);
      localStorage.setItem("fittrack-app-token", response.token);
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-display font-bold text-text">Welcome Back</h2>
        <p className="text-sm text-muted mt-2">Sign in to your ActiveVista account</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="signin-email" className="text-xs font-bold tracking-wider text-muted uppercase">Email</label>
          <input
            id="signin-email"
            name="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
            className="input-dark w-full"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="signin-password" className="text-xs font-bold tracking-wider text-muted uppercase">Password</label>
          <div className="relative">
            <input
              id="signin-password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
              className="input-dark w-full pr-12"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-futuristic w-full py-3.5 rounded-xl text-white text-sm flex items-center justify-center gap-2 glow-blue disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </button>
      </form>
    </div>
  );
};

export default SignIn;
