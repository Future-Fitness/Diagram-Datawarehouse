import { useState } from "react";

interface AuthFormProps {
  isSignUp: boolean;
}

const Auth: React.FC<AuthFormProps> = ({ isSignUp }) => {
  const [formState, setFormState] = useState({ email: "", password: "", confirmPassword: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(isSignUp ? "Signing Up" : "Signing In", formState);
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
    <div style={{  margin: "auto", padding: "20px", border: "1px solid #ccc", borderRadius: "8px",
     boxShadow: "0px 0px 10px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column", justifyContent: "center", gap: "20px", alignItems: "center" }}>

      <h2 style={{ textAlign: "center" }}>{isSignUp ? "Sign Up" : "Sign In"}</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formState.email}
          onChange={handleChange}
          required
          style={{ padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formState.password}
          onChange={handleChange}
          required
          style={{ padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }}
        />
        {isSignUp && (
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formState.confirmPassword}
            onChange={handleChange}
            required
            style={{ padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }}
          />
        )}
        <button type="submit" style={{ padding: "10px", borderRadius: "4px", background: "#007BFF", color: "white", border: "none", cursor: "pointer" }}>
          {isSignUp ? "Sign Up" : "Sign In"}
        </button>
      </form>
        <button style={{ padding: "10px", borderRadius: "4px", background: "#28A745", color: "white", border: "none", cursor: "pointer" }}
            onClick={() => window.location.href = isSignUp ? "/signin" : "/signup"}>
            {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
        </button>
    </div>
    </div>
  );
};

export default Auth;
