const TEXT_ELEMENT = "TEXT_ELEMENT"

enum EffectTag {
  UPDATE = "UPDATE",
  DELETION = "DELETION",
  PLACEMENT = "PLACEMENT",
}

interface Fiber {
  type: String | Function
  props: {
    children: []
  }
  dom: HTMLElement
  parent: Fiber
  child: Fiber
  sibling: Fiber
  alternate: Fiber
  effectTag: EffectTag
}

export function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children
        .flat()
        .map(child =>
          typeof child === "object" ? child : createTextElement(child)
        ),
    },
  }
}

function createTextElement(text: String) {
  return {
    type: TEXT_ELEMENT,
    props: {
      nodeValue: text,
      children: [],
    },
  }
}

function createDom(fiber: Fiber) {
  const dom =
    fiber.type == TEXT_ELEMENT
      ? document.createTextNode("")
      : // @ts-ignore
        document.createElement(fiber.type)

  // @ts-ignore
  updateDom(dom, {}, fiber.props)

  return dom
}

const isStyle = key => key === "style"
const isEvent = key => key.startsWith("on")
const isProperty = key => key !== "children" && !isEvent(key) && !isStyle(key)
const isNew = (prev, next) => key => prev[key] !== next[key]
const isGone = (prev, next) => key => !(key in next)

function updateDom(dom: HTMLElement, prevProps, nextProps) {
  // 删除旧的事件监听器
  Object.keys(prevProps)
    .filter(isEvent)
    .filter(key => !(key in nextProps) || isNew(prevProps, nextProps)(key))
    .forEach(name => {
      const eventType = name.toLowerCase().substring(2)
      dom.removeEventListener(eventType, prevProps[name])
    })

  // 移出旧的的属性
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach(name => {
      if (dom.removeAttribute) {
        dom.removeAttribute(name)
      } else {
        dom[name] = ""
      }
    })

  const prevStyle = prevProps.style || {}
  const nextStyle = nextProps.style || {}

  // 移出旧的的样式
  Object.keys(prevStyle)
    .filter(isGone(prevStyle, nextStyle))
    .forEach(name => {
      dom.style[name] = ""
    })

  // 设置新的的样式
  Object.keys(nextStyle)
    .filter(isNew(prevStyle, nextStyle))
    .forEach(name => {
      dom.style[name] = nextStyle[name]
    })

  // 设置新的属性
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach(name => {
      if (dom.setAttribute) {
        dom.setAttribute(name, nextProps[name])
      } else {
        dom[name] = nextProps[name]
      }
    })

  // 添加事件监听器
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach(name => {
      const eventType = name.toLowerCase().substring(2)
      dom.addEventListener(eventType, nextProps[name])
    })
}

function commitRoot() {
  deletedFibers.forEach(commitWork)
  // @ts-ignore
  commitWork(wipRoot.child)
  currentRoot = wipRoot
  wipRoot = null
}

function cancelEffects(fiber) {
  if (fiber.hooks) {
    fiber.hooks
      .filter(hook => hook.tag === "effect" && hook.cancel)
      .forEach(effectHook => {
        effectHook.cancel()
      })
  }
}

function runEffects(fiber) {
  if (fiber.hooks) {
    fiber.hooks
      .filter(hook => hook.tag === "effect" && hook.effect)
      .forEach(effectHook => {
        effectHook.cancel = effectHook.effect()
      })
  }
}

function commitWork(fiber: Fiber) {
  if (!fiber) {
    return
  }

  // console.log("Fiber: ", fiber)

  let domParentFiber = fiber.parent
  while (!domParentFiber.dom) {
    domParentFiber = domParentFiber.parent
  }
  const domParent = domParentFiber.dom

  if (fiber.effectTag === EffectTag.PLACEMENT && fiber.dom != null) {
    if (fiber.dom != null) {
      domParent.appendChild(fiber.dom)
    }
    runEffects(fiber)
  } else if (fiber.effectTag === EffectTag.UPDATE) {
    cancelEffects(fiber)
    if (fiber.dom != null) {
      updateDom(fiber.dom, fiber.alternate.props, fiber.props)
    }
    runEffects(fiber)
  } else if (fiber.effectTag === EffectTag.DELETION) {
    cancelEffects(fiber)
    commitDeletion(fiber, domParent)
    return
  }

  commitWork(fiber.child)
  commitWork(fiber.sibling)
}

function commitDeletion(fiber: Fiber, domParent: HTMLElement) {
  if (fiber.dom) {
    domParent.removeChild(fiber.dom)
  } else {
    commitDeletion(fiber.child, domParent)
  }
}

export function render(element, container: HTMLElement) {
  // @ts-ignore
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    alternate: currentRoot,
  }
  deletedFibers = []
  nextUnitOfWork = wipRoot
}

let nextUnitOfWork = null
let currentRoot = null
let wipRoot = null
let deletedFibers = []

function workLoop(deadline) {
  let shouldYield = false
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
    shouldYield = deadline.timeRemaining() < 1
  }

  if (!nextUnitOfWork && wipRoot) {
    commitRoot()
  }

  requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)

function performUnitOfWork(fiber) {
  const isFunctionComponent = fiber.type instanceof Function

  if (isFunctionComponent) {
    updateFunctionComponent(fiber)
  } else {
    updateHostComponent(fiber)
  }

  if (fiber.child) {
    return fiber.child
  }
  let nextFiber = fiber
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling
    }
    nextFiber = nextFiber.parent
  }
}

let wipFiber = null
let hookIndex = null

function updateFunctionComponent(fiber) {
  wipFiber = fiber
  // @ts-ignore
  hookIndex = 0
  // @ts-ignore
  wipFiber.hooks = []

  const children = [fiber.type(fiber.props)]
  reconcileChildren(fiber, children)
}

export function useState(initial: any) {
  const oldHook =
    // @ts-ignore
    wipFiber.alternate &&
    // @ts-ignore
    wipFiber.alternate.hooks &&
    // @ts-ignore
    wipFiber.alternate.hooks[hookIndex]
  const hook = {
    tag: "state",
    state: oldHook ? oldHook.state : initial,
    queue: [],
  }

  const actions = oldHook ? oldHook.queue : []

  actions.forEach((action: Function) => {
    hook.state = action(hook.state)
  })

  const setState = (action: Function) => {
    // @ts-ignore
    hook.queue.push(action)
    // @ts-ignore
    wipRoot = {
      // @ts-ignore
      dom: currentRoot.dom,
      // @ts-ignore
      props: currentRoot.props,
      alternate: currentRoot,
    }
    nextUnitOfWork = wipRoot
    deletedFibers = []
  }

  // @ts-ignore
  wipFiber.hooks.push(hook)
  // @ts-ignore
  hookIndex++

  return [hook.state, setState]
}

const hasDepsChanged = (prevDeps, nextDeps) =>
  !prevDeps ||
  !nextDeps ||
  prevDeps.length !== nextDeps.length ||
  prevDeps.some((dep, index) => dep !== nextDeps[index])

export function useEffect(effect, deps) {
  const oldHook =
    // @ts-ignore
    wipFiber.alternate &&
    // @ts-ignore
    wipFiber.alternate.hooks &&
    // @ts-ignore
    wipFiber.alternate.hooks[hookIndex]

  const hasChanged = hasDepsChanged(oldHook ? oldHook.deps : undefined, deps)

  const hook = {
    tag: "effect",
    effect: hasChanged ? effect : null,
    cancel: hasChanged && oldHook && oldHook.cancel,
    deps,
  }
  // @ts-ignore
  wipFiber.hooks.push(hook)
  // @ts-ignore
  hookIndex++
}

function updateHostComponent(fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber)
  }
  reconcileChildren(fiber, fiber.props.children)
}

function reconcileChildren(wipFiber: Fiber, elements) {
  let index = 0
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child
  let prevSibling = null

  while (index < elements.length || oldFiber != null) {
    const element = elements[index]
    let newFiber = null

    const sameType = oldFiber && element && element.type == oldFiber.type

    if (sameType) {
      // @ts-ignore
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: EffectTag.UPDATE,
      }
    }
    if (element && !sameType) {
      // @ts-ignore
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: wipFiber,
        alternate: null,
        effectTag: EffectTag.PLACEMENT,
      }
    }
    if (oldFiber && !sameType) {
      oldFiber.effectTag = EffectTag.DELETION
      // @ts-ignore
      deletedFibers.push(oldFiber)
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling
    }

    if (index === 0) {
      // @ts-ignore
      wipFiber.child = newFiber
    } else if (element) {
      // @ts-ignore
      prevSibling.sibling = newFiber
    }

    prevSibling = newFiber
    index++
  }
}

const Hypereact = {
  createElement,
  render,
  useState,
  useEffect,
}

export default Hypereact
