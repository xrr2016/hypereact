// @ts-nocheck
// import Hypereact from 'hypereact';
import viteLogo from "/vite.svg"
import javascriptLogo from "./javascript.svg"
import Hypereact, { useState, useEffect } from "./hypereact"

let value = "Hypereact"

const updateValue = e => {
  value = e.target.value
  renderApp()
}

const HelloFunctional = () => {
  const [count, setCounter] = useState(1)

  const handleClick = () => {
    setCounter(() => count + 1)
  }

  useEffect(() => {
    console.log(count)
  }, [count])

  return (
    <div>
      <h2>Hello, Functional Component</h2>
      <p>Counter: {count}</p>
      <button onClick={handleClick}>Plus</button>
    </div>
  )
}

const posts = [1, 2, 3, 4, 5]

/** @jsx Hypereact.createElement */
const App = () => {
  return (
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

      <h1 style={{ color: "white", backgroundColor: "black", padding: "12px" }}>
        Hello {value}!
      </h1>
      <input onInput={updateValue} value={value} />

      <div>
        {posts.map(post => (
          <p>{post}</p>
        ))}
      </div>

      <HelloFunctional />
    </div>
  )
}

export const renderApp = () => {
  const container = document.getElementById("app")
  Hypereact.render(<App />, container)
}
