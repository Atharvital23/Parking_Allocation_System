import { useState } from "react";
import { useRouter } from "next/router";

export default function SignUp() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      setError("All fields are required");
      return;
    }
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });
      if (res.status === 201) {
        router.push('/login');
      } else {
        const data = await res.json();
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('An error occurred');
    }
  };

  return (
    <div className="signup-bg">
      <form className="signup-form" onSubmit={handleSubmit}>
        <h2>ANIBank Company</h2>
        <p>Create your account</p>

        <div className="input-group">
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <label>Name</label>
        </div>

        <div className="input-group">
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <label>Email</label>
        </div>

        <div className="input-group">
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <label>Password</label>
        </div>

        {error && <div className="error">{error}</div>}

        <button type="submit">Sign Up</button>
      </form>

      <style jsx>{`
        .signup-bg {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #2980b9 0%, #6dd5fa 100%);
        }
        .signup-form {
          background: #fff;
          padding: 2rem 2.5rem;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          width: 100%;
          max-width: 380px;
          text-align: center;
          animation: fadeIn 0.6s ease-out;
        }
        h2 {
          margin-bottom: 0.2rem;
          color: #2980b9;
        }
        p {
          margin-bottom: 1.5rem;
          color: #555;
        }
        .input-group {
          position: relative;
          margin: 1.2rem 0;
        }
        .input-group input {
          width: 100%;
          padding: 0.8rem;
          border: none;
          border-bottom: 2px solid #ccc;
          outline: none;
          transition: border-color 0.3s;
        }
        .input-group input:focus {
          border-bottom-color: #2980b9;
        }
        .input-group label {
          position: absolute;
          left: 0.8rem;
          top: 0.8rem;
          color: #aaa;
          pointer-events: none;
          transition: transform 0.2s, font-size 0.2s;
        }
        .input-group input:focus + label,
        .input-group input:not(:placeholder-shown) + label {
          transform: translateY(-1.4rem);
          font-size: 0.85rem;
          color: #2980b9;
        }
        button {
          width: 100%;
          padding: 0.9rem;
          margin-top: 1rem;
          border: none;
          border-radius: 6px;
          background: #2980b9;
          color: #fff;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.3s, transform 0.2s;
        }
        button:hover {
          background: #2574a9;
          transform: translateY(-2px);
        }
        .error {
          color: #e74c3c;
          margin-top: 0.5rem;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}