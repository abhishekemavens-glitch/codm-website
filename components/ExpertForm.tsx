"use client";

import { useState } from "react";

type Status = "idle" | "submitting" | "success" | "error";

export default function ExpertForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("submitting");

    try {
      /* TODO: point this at your real endpoint — a WordPress form
         plugin's REST route, an email API, or a CRM webhook.
         This placeholder just needs a 2xx response to succeed. */
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, company, message }),
      });

      if (!response.ok) throw new Error("Request failed");

      setStatus("success");
      setName("");
      setEmail("");
      setCompany("");
      setMessage("");
    } catch (error) {
      console.error("Expert form submission failed:", error);
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="codm-expert-form codm-expert-form-success">
        <h2 className="codm-expert-title">Thanks — we'll be in touch!</h2>
        <p>Your message has been sent. A CODM expert will reach out shortly.</p>
      </div>
    );
  }

  return (
    <div className="codm-expert-form">
      <h2 className="codm-expert-title">Talk to our Experts today!</h2>

      <form onSubmit={handleSubmit}>
        <label className="codm-expert-field">
          <span>Name</span>
          <input
            type="text"
            placeholder="Full name...."
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </label>

        <label className="codm-expert-field">
          <span>Email</span>
          <input
            type="email"
            placeholder="Enter Email id...."
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>

        <label className="codm-expert-field">
          <span>Company Name</span>
          <input
            type="text"
            placeholder="Enter"
            value={company}
            onChange={(event) => setCompany(event.target.value)}
          />
        </label>

        <label className="codm-expert-field">
          <span>Message</span>
          <textarea
            placeholder="Value"
            rows={4}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
        </label>

        {status === "error" && (
          <p className="codm-expert-error">
            Something went wrong. Please try again.
          </p>
        )}

        <button
          type="submit"
          className="codm-expert-submit"
          disabled={status === "submitting"}
        >
          {status === "submitting" ? "Sending..." : "Submit"}
        </button>
      </form>
    </div>
  );
}
