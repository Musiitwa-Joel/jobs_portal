// src/protect.ts

import DisableDevtool from "disable-devtool";

/**
 * Fully locks down the browser console and DOM immediately when DevTools is detected.
 * @param reason Optional reason to display in overlay
 */
function lockConsoleAndBlock(reason: string = "DevTools Detected") {
  if (document.getElementById("devtools-blocker")) return;

  // Disable all console methods
  const noop = () => {};
  const lockedConsole = {
    log: noop,
    warn: noop,
    error: noop,
    info: noop,
    debug: noop,
    trace: noop,
    table: noop,
    dir: noop,
    clear: noop,
  };
  Object.keys(lockedConsole).forEach((k) => (console[k] = lockedConsole[k]));
  try {
    Object.defineProperty(window, "console", {
      value: Object.freeze(lockedConsole),
      writable: false,
      configurable: false,
    });
  } catch {
    Object.freeze(console);
  }

  // Inject blocking overlay
  const style = document.createElement("style");
  style.textContent = `
    html, body {
      margin: 0; padding: 0; overflow: hidden; height: 100%;
      background: black !important;
      user-select: none !important;
    }
    #devtools-blocker {
      position: fixed;
      top: 0; left: 0;
      width: 100vw; height: 100vh;
      background: black;
      color: red;
      font-size: 26px;
      font-family: monospace;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999999;
      pointer-events: all;
      text-align: center;
      white-space: pre-wrap;
    }
  `;
  document.head.appendChild(style);

  const overlay = document.createElement("div");
  overlay.id = "devtools-blocker";
  overlay.innerText = `🚫 ACCESS BLOCKED\nReason: ${reason}`;
  document.body.innerHTML = "";
  document.body.appendChild(overlay);

  // Wipe full DOM (fakes hidden Elements tab)
  if (document.documentElement) {
    document.documentElement.innerHTML = `
      <body>
        <h1 style="color:red; font-family: monospace; text-align:center; margin-top: 20vh;">
          🚫 ACCESS BLOCKED: ${reason}
        </h1>
      </body>`;
  }
}

/**
 * Initialize real-time DevTools detection and lockout
 */
export function initDevToolsProtection() {
  DisableDevtool({
    detectBySize: true,
    detectByInterval: true,
    detectByKey: true,
    interval: 500,
    onDevtoolOpen: (type) => {
      lockConsoleAndBlock(`DevTools detected via: ${type}`);
    },
    onDevtoolClose: () => {
      // Optional: you can reload or remove overlay here
      // location.reload();
    },
  });
}
