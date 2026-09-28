export default function ExpertForm() {
  return (
    <div className="codm-expert-form">
      <h3>Talk to our Experts today!</h3>

      <form>
        <div className="codm-form-field">
          <label htmlFor="expert-name">
            Name
          </label>

          <input
            id="expert-name"
            type="text"
            name="name"
            placeholder="Full name..."
          />
        </div>

        <div className="codm-form-field">
          <label htmlFor="expert-email">
            Email
          </label>

          <input
            id="expert-email"
            type="email"
            name="email"
            placeholder="Enter Email id..."
          />
        </div>

        <div className="codm-form-field">
          <label htmlFor="expert-company">
            Company Name
          </label>

          <input
            id="expert-company"
            type="text"
            name="company"
            placeholder="Enter"
          />
        </div>

        <div className="codm-form-field">
          <label htmlFor="expert-message">
            Message
          </label>

          <textarea
            id="expert-message"
            name="message"
            placeholder="Value"
            rows={4}
          />
        </div>

        <button
          type="submit"
          className="codm-expert-submit"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
