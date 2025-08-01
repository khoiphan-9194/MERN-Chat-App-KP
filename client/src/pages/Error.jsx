import { useRouteError } from "react-router-dom";

export default function ErrorPage() {
  const error = useRouteError();
  console.error(error);

  return (
    <div
      className="error-page"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #1f1c2c 0%, #928dab 100%)",
        color: "#fff",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Animated background shapes */}
      <div
        style={{
          position: "absolute",
          top: "-100px",
          left: "-100px",
          width: "300px",
          height: "300px",
          background: "rgba(255,56,96,0.15)",
          borderRadius: "50%",
          filter: "blur(30px)",
          zIndex: 0,
          animation: "float1 6s ease-in-out infinite alternate",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-120px",
          right: "-120px",
          width: "250px",
          height: "250px",
          background: "rgba(146,141,171,0.18)",
          borderRadius: "50%",
          filter: "blur(30px)",
          zIndex: 0,
          animation: "float2 7s ease-in-out infinite alternate",
        }}
      />

      <style>
        {`
          @keyframes float1 {
            0% { transform: translateY(0);}
            100% { transform: translateY(40px);}
          }
          @keyframes float2 {
            0% { transform: translateY(0);}
            100% { transform: translateY(-30px);}
          }
          .error-glow {
            animation: glow 1.5s ease-in-out infinite alternate;
          }
          @keyframes glow {
            from {
              text-shadow: 0 0 10px #ff3860, 0 0 20px #fff;
            }
            to {
              text-shadow: 0 0 30px #ff3860, 0 0 40px #fff;
            }
          }
          .home-btn:hover {
            background: #ff1744 !important;
            box-shadow: 0 6px 30px rgba(255,56,96,0.4);
            transform: scale(1.05);
          }
        `}
      </style>

      <h1
        className="error-glow"
        style={{
          fontSize: "4rem",
          color: "#ff3860",
          marginBottom: "1rem",
          textAlign: "center",
          zIndex: 1,
        }}
      >
        🚨 Oops! 🚨
      </h1>
      <h2
        style={{
          fontWeight: 400,
          marginBottom: "1.5rem",
          textAlign: "center",
          zIndex: 1,
        }}
      >
        Sorry, an unexpected error has occurred.
      </h2>
      <p
        style={{
          fontStyle: "italic",
          fontSize: "1.2rem",
          marginBottom: "2rem",
          textAlign: "center",
          zIndex: 1,
        }}
      >
        <i>{error.statusText || error.message}</i>
      </p>
      <a
        href="/"
        className="home-btn"
        style={{
          padding: "0.75rem 2rem",
          background: "#ff3860",
          color: "#fff",
          borderRadius: "30px",
          textDecoration: "none",
          fontWeight: "bold",
          fontSize: "1.1rem",
          boxShadow: "0 4px 20px rgba(255,56,96,0.3)",
          transition: "all 0.2s",
          zIndex: 1,
          cursor: "pointer",
        }}
      >
        ⬅️ Go Back Home
      </a>
    </div>
  );
}
