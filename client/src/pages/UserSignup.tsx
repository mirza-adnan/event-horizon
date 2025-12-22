import type { CSSProperties } from "react";

const UserSignup = () => {
  const theme = {
    accent: "#B4DB6D",
    textStrong: "#F3F4F2",
    textWeak: "#DADCD6",
    grayLight: "#A7AAA1",
    grayDark: "#41433D",
    fill: "#272824",
    bgr: "#141414",
    danger: "rgb(255, 156, 156)",
    info: "rgb(224, 191, 112)",
    success: "rgb(119, 119, 175)",
  };

  const container = {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "sans-serif",
    position: "relative",
  };

  const leftPanel = {
    width: "50%",
    backgroundColor: theme.bgr,
    color: theme.accent,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    letterSpacing: "4px",
    fontSize: "48px",
    fontWeight: "bold",
  };

  const rightPanel = {
    width: "50%",
    backgroundColor: theme.bgr,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };

  const verticalLine: CSSProperties = {
    position: "absolute",
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)",
    height: "80%",
    width: "1px",
    backgroundColor: theme.accent,
  };

  const form: CSSProperties = {
    color: theme.accent,
    width: "70%",
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  };

  const title: CSSProperties = {
    color: theme.accent,
    fontSize: "30px",
    textAlign: "center",
    marginBottom: "10px",
  };

  const input = {
    padding: "14px 16px",
    borderRadius: "8px",
    border: `1px solid ${theme.grayDark}`,
    fontSize: "16px",
    backgroundColor: theme.fill,
    color: theme.textStrong,
  };

  const button = {
    padding: "15px",
    borderRadius: "8px",
    backgroundColor: theme.accent,
    border: "none",
    color: theme.bgr,
    fontWeight: "600",
    fontSize: "18px",
    cursor: "pointer",
  };

  return (
    <div style={container}>
      <div style={verticalLine}></div>
      {/* LEFT */}
      <div style={leftPanel}>EVENT HORIZON</div>

      {/* RIGHT */}
      <div style={rightPanel}>
        <form style={form}>
          <h2 style={title}>Create Account</h2>

          <div style={{ display: "flex", gap: "12px" }}>
            <input style={{ ...input, flex: 1 }} placeholder="First Name" />
            <input style={{ ...input, flex: 1 }} placeholder="Last Name" />
          </div>

          <input style={input} placeholder="Username" />
          <input style={input} type="password" placeholder="Password" />
          <input style={input} type="email" placeholder="Email" />
          <input style={input} type="tel" placeholder="Phone" />
          <input style={input} type="date" />

          <button style={button} type="button">
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserSignup;
