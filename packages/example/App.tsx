// @ts-nocheck
import Hypereact from './hypereact';
import viteLogo from '/vite.svg';
import javascriptLogo from './javascript.svg';

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
    <p class="read-the-docs">Click on the Vite logo to learn more</p>
    <ul>
      <ol>任务1</ol>
      <ol>任务2</ol>
      <ol>任务3</ol>
      <ol>任务4</ol>
      <ol>任务5</ol>
    </ul>
  </div>
);

export default App;
