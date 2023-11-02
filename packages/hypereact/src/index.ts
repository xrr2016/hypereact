const TEXT_ELEMENT = "TEXT_ELEMENT"

export function createElement(type: string, props: any, ...children: any[]) {
  console.log(type)

  return {
    type,
    ...props,
    children: children.map(child =>
      typeof child === "object" ? child : createTextElement(child)
    ),
  }
}

function createTextElement(text: string | number) {
  return {
    type: TEXT_ELEMENT,
    props: {
      nodeValue: text,
      children: [],
    },
  }
}

export function render(
  element: { type: string; props: { [x: string]: any; children?: any } },
  container: { appendChild: (arg0: any) => void }
) {
  const dom =
    element.type == TEXT_ELEMENT
      ? document.createTextNode("")
      : document.createElement(element.type)
  const isProperty = (key: string) => key !== "children"
  Object.keys(element.props)
    .filter(isProperty)
    .forEach(name => {
      // @ts-ignore
      dom[name] = element.props[name]
    })
  element.props.children.forEach((child: any) => render(child, dom))
  container.appendChild(dom)
}

const Hypereact = {
  createElement,
  render,
}

export default Hypereact
