import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("React error:", error, errorInfo);
    this.setState({ errorInfo });
  }
  render() {
    if (this.state.error) {
      return React.createElement(
        "div",
        {
          style: {
            padding: "24px",
            fontFamily: "sans-serif",
            textAlign: "center",
            direction: "rtl",
          },
        },
        React.createElement("h1", null, "🚨 שגיאה"),
        React.createElement(
          "pre",
          {
            style: {
              background: "#f8f8f8",
              padding: "16px",
              borderRadius: "8px",
              textAlign: "left",
              direction: "ltr",
              fontSize: "13px",
            },
          },
          this.state.error?.toString(),
          this.state.errorInfo?.componentStack,
        ),
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
