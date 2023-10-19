// @ts-nocheck
// import Hypereact from 'hypereact';
import viteLogo from '/vite.svg';
import javascriptLogo from './javascript.svg';
import Hypereact from './hypereact';

let counter = 0;

/** @jsx Hypereact.createElement */
const App = (
  <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src={viteLogo} class="logo" alt="Vite logo" />
    </a>
    <a
      href="https://developer.mozilla.org/en-US/docs/Web/JavaScript"
      target="_blank"
    >
      <img src={javascriptLogo} class="logo vanilla" alt="JavaScript logo" />
    </a>
    <h1>Hello Hypereact!</h1>
    <div class="card">
      <button id="counter" type="button">
        {`count is ${counter}`}
      </button>
    </div>
    <p class="read-the-docs">Click on the Vite logo to learn more</p>
  </div>
);

export default App;
