const TEXT_ELEMENT = 'TEXT_ELEMENT';

export function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) =>
        typeof child === 'object' ? child : createTextElement(child),
      ),
    },
  };
}

function createTextElement(text) {
  return {
    type: TEXT_ELEMENT,
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

export function render(element, container) {
  const dom: HTMLElement =
    element.type == TEXT_ELEMENT
      ? document.createTextNode('')
      : document.createElement(element.type);
  const isProperty = (key) => key !== 'children';

  Object.keys(element.props)
    .filter(isProperty)
    .forEach((name) => {
      if (dom.setAttribute) {
        dom.setAttribute(name, element.props[name]);
      } else {
        dom[name] = element.props[name];
      }
    });

  element.props.children.forEach((child) => render(child, dom));

  container.appendChild(dom);
}

const Hypereact = {
  createElement,
  render,
};

export default Hypereact;
