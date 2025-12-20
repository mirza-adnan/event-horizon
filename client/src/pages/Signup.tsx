const Signup = () => {
  return (
    <div>
      {/* LEFT */}
      <div>EVENT HORIZON</div>

      {/* RIGHT */}
      <div>
        <form>
          <h2>Create Account</h2>

          <div style={{ display: "flex", gap: "12px" }}>
            <input  placeholder="First Name" />
            <input  placeholder="Last Name" />
          </div>

          <input placeholder="Username" />
          <input type="password" placeholder="Password" />
          <input type="email" placeholder="Email" />
          <input type="tel" placeholder="Phone" />
          <input type="date" />

          <button type="button">
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup;
