import { VscGithubAlt } from "react-icons/vsc";
import { AiOutlineLinkedin } from "react-icons/ai";

function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer
      style={{
        textAlign: "center",
        padding: "0.35rem 0",
        fontSize: "0.75rem",
        background: "linear-gradient(90deg, #dedec9ff 0%, #08467573 100%)", // Subtle blue gradient, matches homepage
        color: "#222",
        boxShadow: "0 2px 10px rgba(25,22,84,0.08)",
        borderTop: "1px solid #eaeaea",
        letterSpacing: "0.01em",
        maxWidth: "100vw",
      }}
    >
      <div
        style={{
          marginBottom: "0.15rem",
          fontWeight: 600,
          fontSize: "0.85rem",
        }}
      >
        Made by Khoi Phan &copy; {year}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "0.6rem",
          marginBottom: "0.15rem",
        }}
      >
        <a
          href="https://github.com/khoiphan-9194"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "#333",
            fontSize: "1.2rem",
            transition: "color 0.2s",
            boxShadow: "0 1px 3px rgba(67,198,172,0.10)",
            borderRadius: "50%",
            padding: "0.10rem",
          }}
          aria-label="GitHub"
          onMouseOver={(e) => (e.currentTarget.style.color = "#6e5494")}
          onMouseOut={(e) => (e.currentTarget.style.color = "#333")}
        >
          <VscGithubAlt />
        </a>
        <a
          href="https://www.linkedin.com/in/jason-khoi-phan-72701b1b6/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "#0077b5",
            fontSize: "1.2rem",
            transition: "color 0.2s",
            boxShadow: "0 1px 3px rgba(25,22,84,0.08)",
            borderRadius: "50%",
            padding: "0.10rem",
          }}
          aria-label="LinkedIn"
          onMouseOver={(e) => (e.currentTarget.style.color = "#005582")}
          onMouseOut={(e) => (e.currentTarget.style.color = "#0077b5")}
        >
          <AiOutlineLinkedin />
        </a>
      </div>
      <div style={{ fontSize: "0.75rem", color: "#555" }}>
        <span style={{ marginRight: "0.3rem" }}>
          Contact:{" "}
          <a
            href="mailto:phanminhkhoi91@gmail.com"
            style={{ color: "#0c3152ff", textDecoration: "none" }}
          >
            phanminhkhoi91@gmail.com
          </a>
        </span>
        <span>Powered by MERN Stack</span>
      </div>
    </footer>
  );
}

export default Footer;