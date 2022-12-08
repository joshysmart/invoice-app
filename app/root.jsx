import {
  Outlet,
  LiveReload,
  Links,
  Meta,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { useEffect, useRef, useState } from "react";

import globalStylesUrl from "~/styles/global.css";

export const links = () => [{ rel: "stylesheet", href: globalStylesUrl }];

export const meta = () => ({
  charset: "utf-8",
  title: "Invoice App",
  viewport: "width=device-width,initial-scale=1",
  description:
    "This is a solution to the Invoice app challenge on Frontend Mentor",
  keywords: "Remix, React, Javascript, Fronend Mentor, Challenge",
});

export default function App() {
  const containerEl = useRef(null);
  const wrapperEL = useRef(null);
  const [darkTheme, setDarktheme] = useState(false);

  function handleTheme(e) {
    setDarktheme(!darkTheme);
    localStorage.setItem("preferDarkTheme", darkTheme ? "false" : "true");
    console.log(containerEl);
  }

  useEffect(() => {
    const preferDarkTheme = localStorage.getItem("preferDarkTheme");
    preferDarkTheme === "true" && setDarktheme(true);
  }, []);

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <div
          className={`container ${darkTheme && "dark-theme"}`}
          ref={containerEl}
        >
          <div className="wrapper" ref={wrapperEL}>
            <aside className="left-section">
              <div className="logo"></div>
              <div className="avatar-theme">
                <div className="theme" onClick={handleTheme}></div>
                <div className="seperator"></div>
                <div className="avatar"></div>
              </div>
            </aside>
            <Outlet context={wrapperEL} />
          </div>
        </div>

        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
