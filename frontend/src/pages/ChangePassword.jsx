import { useState } from "react";
import axios from "axios";

export default function ChangePassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

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
    <div>
      <h2>Byt lösenord</h2>

      <form onSubmit={handleSubmit}>
        <label>
          Nuvarande lösenord:
          <input
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
          />
        </label>

        <br />

        <label>
          Nytt lösenord:
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </label>

        <br />

        <button type="submit">Uppdatera lösenord</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}
