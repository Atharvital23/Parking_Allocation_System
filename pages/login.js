import { useState } from "react";
import { useRouter } from "next/router";

// ...existing code removed. We'll use MongoDB via API
export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Prepare request body
    const body = { role, password };
    if (role === "user") body.email = email;
    else body.username = username;
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.status === 200) {
        const data = await res.json();
        localStorage.setItem(
          "parking_user",
          JSON.stringify({ username: data.username, role: data.role })
        );
        router.push("/dashboard");
      } else if (res.status === 404 && role === "user") {
        // Redirect to signup page for new users
        router.push("/signup");
      } else {
        const err = await res.json();
        setError(err.message || "Login failed");
      }
    } catch (err) {
      setError("An error occurred");
    }
  };

  return (
    <div className="login-bg">
      <div className="login-container">
        <h2>Parking Allocation Login</h2>
        <div className="role-group">
          <label>
            <input
              type="radio"
              value="user"
              checked={role === "user"}
              onChange={() => setRole("user")}
            />{" "}
            User
          </label>
          <label>
            <input
              type="radio"
              value="worker"
              checked={role !== "user"}
              onChange={() => setRole("worker")}
            />{" "}
            Admin/Worker
          </label>
        </div>
        <form onSubmit={handleSubmit}>
          {role === "user" ? (
            <>
              <div className="input-group">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                />
              </div>
            </>
          ) : (
            <div className="input-group">
              <label>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Enter your username"
              />
            </div>
          )}
          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>
          {error && <div className="error">{error}</div>}
          <button type="submit" className="login-btn">
            Login
          </button>
        </form>
      </div>
      <style jsx>{`
        .role-group {
          margin-bottom: 1rem;
        }
        .role-group label {
          margin-right: 1rem;
          font-weight: 500;
        }
        .login-bg {
          min-height: 100vh;
          background: linear-gradient(135deg, #2980b9 0%, #6dd5fa 100%);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .login-container {
          background: #fff;
          padding: 2.5rem 2rem;
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(44, 62, 80, 0.2);
          width: 100%;
          max-width: 350px;
          text-align: center;
        }
        h2 {
          margin-bottom: 1.5rem;
          color: #2980b9;
        }
        .input-group {
          margin-bottom: 1.2rem;
          text-align: left;
        }
        label {
          display: block;
          margin-bottom: 0.4rem;
          color: #34495e;
          font-weight: 500;
        }
        input {
          width: 100%;
          padding: 0.7rem;
          border: 1px solid #b2bec3;
          border-radius: 8px;
          font-size: 1rem;
          outline: none;
          transition: border 0.2s;
        }
        input:focus {
          border-color: #2980b9;
        }
        .login-btn {
          width: 100%;
          padding: 0.8rem;
          background: linear-gradient(90deg, #2980b9 0%, #6dd5fa 100%);
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 1.1rem;
          font-weight: bold;
          cursor: pointer;
          transition: background 0.2s;
        }
        .login-btn:hover {
          background: linear-gradient(90deg, #2574a9 0%, #48c6ef 100%);
        }
        .error {
          color: #e74c3c;
          margin-bottom: 1rem;
          font-size: 0.98rem;
        }
      `}</style>
    </div>
  );
}