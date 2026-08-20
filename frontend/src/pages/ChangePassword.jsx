import { useState } from "react";
import axios from "axios";

export default function ChangePassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  const validatePassword = (password) => {
    if (password.length < 8) {
      return "Lösenordet måste vara minst 8 tecken långt";
    }

    if (!/[A-Z]/.test(password)) {
      return "Lösenordet måste innehålla minst en stor bokstav (A-Z)";
    }

    if (!/[0-9]/.test(password)) {
      return "Lösenordet måste innehålla minst en siffra (0-9)";
    }

    if (!/[!@#$%^&*(),.?\":{}|<>]/.test(password)) {
      return "Lösenordet måste innehålla minst ett specialtecken (!@#$%^&*)";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validatePassword(newPassword);
    if (validationError) {
      setMessage(validationError);
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "http://localhost:3000/users/change-password",
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage(res.data.message);
      setOldPassword("");
      setNewPassword("");

    } catch (err) {
      const msg = err.response?.data?.error || "Fel uppstod";
      setMessage(msg);
    }
  };

  return (
    <div className="change-password-page">
  <h2 className="page-title">Byt lösenord</h2>

  <form className="form" onSubmit={handleSubmit}>
    <label className="form-label">
      Nuvarande lösenord:
      <input
        className="form-input"
        type="password"
        value={oldPassword}
        onChange={(e) => setOldPassword(e.target.value)}
        required
      />
    </label>

    <label className="form-label">
      Nytt lösenord:
      <input
        className="form-input"
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        required
      />
    </label>

    <button className="btn btn-primary" type="submit">
      Uppdatera lösenord
    </button>
  </form>

  {message && <p className="form-message">{message}</p>}
</div>

  );
}
