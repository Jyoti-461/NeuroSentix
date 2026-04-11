import { useEffect, useState } from "react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function AppLoader({ children }) {
  const [isReady, setIsReady] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);

  const messages = [
    "Initializing required protocols...",
    "Connecting to AI services...",
    "Preparing your personalized dashboard...",
    "Almost ready..."
  ];

  useEffect(() => {
    const wakeBackend = async () => {
      let retries = 6;

      while (retries--) {
        try {
          const res = await fetch(`${BACKEND_URL}/health`);
          if (res.ok) {
            setIsReady(true);
            return;
          }
        } catch (err) {}

        await new Promise((r) => setTimeout(r, 3000));
      }
    };

    wakeBackend();
  }, []);

  // rotating loading text
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  if (!isReady) {
    return (
      <div style={styles.container}>
        <h2>{messages[messageIndex]}</h2>
        <p>This may take a few seconds on first load.</p>
        <div style={styles.spinner}></div>
      </div>
    );
  }

  return children;
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "sans-serif",
  },
  spinner: {
    marginTop: "20px",
    width: "40px",
    height: "40px",
    border: "4px solid #ccc",
    borderTop: "4px solid #333",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
};

export default AppLoader;