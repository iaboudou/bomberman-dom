export class Dom {
  constructor(container, event) {
    this.container = container;
    this.event = event;
    this.oldVnode = null;
    this._dirty = false;
    this._pendingVnode = null;
  }

  // Create a virtual DOM element
  el(tag, props, ...children) {
    const { key = null, ...attrs } = props ?? {};

    const mappedChildren = children
      .flat()
      .map((child) => {
        if (child === null || child === undefined || child === false)
          return null;
        if (typeof child !== "object")
          return { type: "text", value: String(child), _el: null };
        return child;
      })
      .filter(Boolean);

    if (tag === "fragment") {
      return { type: "fragment", key, children: mappedChildren };
    }

    return { tag, key, attrs, children: mappedChildren };
  }

  // Converts a virtual DOM node (vnode) into a real DOM element
  render(vnode) {
    if (vnode.type === "text") {
      const textNode = document.createTextNode(vnode.value);
      vnode._el = textNode;
      return textNode;
    }

    if (vnode.type === "fragment") {
      const fragment = document.createDocumentFragment();
      vnode._el = fragment;
      vnode.children?.forEach((child) =>
        fragment.appendChild(this.render(child)),
      );
      return fragment;
    }

    const vnodeEL = document.createElement(vnode.tag);
    vnode._el = vnodeEL;

    for (const key in vnode.attrs) {
      this._setAttr(vnodeEL, key, vnode.attrs[key]);
    }

    vnode.children?.forEach((child) => vnodeEL.appendChild(this.render(child)));

    return vnodeEL;
  }

  // mounts the vDOM to the real DOM
  mount(vnode) {
    if (!vnode) {
      this.container.innerHTML = "";
      this.oldVnode = null;
    } else if (!this.oldVnode) {
      this.container.appendChild(this.render(vnode));
    } else {
      this.patch(this.oldVnode, vnode, this.container);
    }

    this.oldVnode = vnode ?? null;
    return this.container;
  }

  // multiple calls within the same frame are collapsed into one diff
  scheduleMount(vnode) {
    this._pendingVnode = vnode;
    if (!this._dirty) {
      this._dirty = true;
      requestAnimationFrame(() => {
        this.mount(this._pendingVnode);
        this._dirty = false;
      });
    }
  }

  // updates the real DOM by comparing the old virtual DOM node (oldVnode) with the new virtual DOM node (newVnode)
  patch(oldVnode, newVnode, parent) {
    // element was removed
    if (!newVnode) {
      this._removeEventsRecursively(oldVnode);
      parent.removeChild(oldVnode._el);
      return;
    }

    // new element created
    if (!oldVnode) {
      parent.appendChild(this.render(newVnode));
      return;
    }

    // update text node value
    if (oldVnode.type === "text" && newVnode.type === "text") {
      if (oldVnode.value !== newVnode.value) {
        oldVnode._el.nodeValue = newVnode.value;
      }
      newVnode._el = oldVnode._el;
      return;
    }

    // diff fragment children directly in parent
    if (oldVnode.type === "fragment" && newVnode.type === "fragment") {
      newVnode._el = oldVnode._el;
      this._patchChildren(oldVnode, newVnode, parent);
      return;
    }

    // remove the old fragment and replace with new element (or vice versa)
    if (oldVnode.type === "fragment" || newVnode.type === "fragment") {
      this._removeEventsRecursively(oldVnode);

      if (oldVnode.type === "fragment") {
        oldVnode.children?.forEach((child) => {
          if (child._el) parent.removeChild(child._el);
        });
      } else {
        parent.removeChild(oldVnode._el);
      }

      parent.appendChild(this.render(newVnode));
      return;
    }
    // replace old element with the new one
    if (oldVnode.tag !== newVnode.tag) {
      this._removeEventsRecursively(oldVnode);
      oldVnode._el.parentNode.replaceChild(this.render(newVnode), oldVnode._el);
      return;
    }

    // same element — diff attrs then children
    newVnode._el = oldVnode._el;

    for (const key in newVnode.attrs) {
      //update element attribute
      if (newVnode.attrs[key] !== oldVnode.attrs[key]) {
        this._setAttr(newVnode._el, key, newVnode.attrs[key]);
      }
    }

    for (const key in oldVnode.attrs) {
      // remove old attribute
      if (!(key in newVnode.attrs)) {
        this._removeAttr(newVnode._el, key, oldVnode.attrs[key]);
      }
    }

    this._patchChildren(oldVnode, newVnode, newVnode._el);
  }

  // Diffs children using keys when available, index-based otherwise
  _patchChildren(oldVnode, newVnode, parentEl) {
    const oldChildren = oldVnode.children || [];
    const newChildren = newVnode.children || [];

    const hasKeys =
      newChildren.length > 0 && newChildren.every((c) => c.key != null);

    if (hasKeys) {
      const oldByKey = {};
      const newByKey = {};

      oldChildren.forEach((c) => {
        if (c.key != null) oldByKey[c.key] = c;
      });

      newChildren.forEach((c) => {
        if (c.key != null) newByKey[c.key] = c;
      });

      // Remove old nodes that don't exist in new nodes
      oldChildren.forEach((old) => {
        if (!newByKey[old.key]) {
          this.patch(old, null, parentEl);
          delete oldByKey[old.key];
        }
      });

      // Patch remaining and insert new nodes in the correct order
      newChildren.forEach((newChild, i) => {
        const oldChild = oldByKey[newChild.key];

        if (oldChild) {
          // Patch in place, then move to the correct DOM position if needed
          this.patch(oldChild, newChild, parentEl);
          if (parentEl.childNodes[i] !== newChild._el) {
            parentEl.insertBefore(newChild._el, parentEl.childNodes[i] ?? null);
          }
        } else {
          // New child: render and insert at the correct position
          const newEl = this.render(newChild);
          if (parentEl.childNodes[i]) {
            parentEl.insertBefore(newEl, parentEl.childNodes[i]);
          } else {
            parentEl.appendChild(newEl);
          }
        }
      });
    } else {
      // compare children with index
      const maxLen = Math.max(oldChildren.length, newChildren.length);
      for (let i = 0; i < maxLen; i++) {
        this.patch(oldChildren[i] ?? null, newChildren[i] ?? null, parentEl);
      }
    }
  }

  // recursively remove events from oldVnode and its children
  _removeEventsRecursively = (vnode) => {
    if (!vnode || vnode.type === "text") return;

    const el = vnode._el;

    if (el?._listeners) {
      for (const eventName in el._listeners) {
        this.event.off(el, eventName, el._listeners[eventName]);
      }
      el._listeners = {};
    }

    vnode.children?.forEach((child) => this._removeEventsRecursively(child));
  };

  // sets the attributes of a DOM element
  _setAttr(el, key, value) {
    if (value == null) {
      this._removeAttr(el, key, value);
      return;
    }

    // onClick, onInput, onChange
    if (key.startsWith("on")) {
      const eventName = key.slice(2).toLowerCase();

      // If a listener already exists for this event, remove it
      if (el._listeners?.[eventName]) {
        this.event.off(el, eventName, el._listeners[eventName]);
      }

      // Ensure the internal listener store exists
      el._listeners ??= {};

      // Save the new listener reference and attach
      el._listeners[eventName] = value;
      this.event.on(el, eventName, value);
      return;
    }

    // Handle autofocus — must be deferred because the element must be in the DOM first
    if (key === "autofocus" && value) {
      setTimeout(() => el.focus(), 0);
      return;
    }

    // If the key exists directly on the element (e.g. value, checked, disabled)
    if (key in el) {
      el[key] = value;
      return;
    }

    // For standard attributes like id, class, data-*
    el.setAttribute(key, value);
  }

  // removes attributes from a DOM element
  _removeAttr(el, key, _oldValue) {
    // onClick, onInput, onChange
    if (key.startsWith("on")) {
      const eventName = key.slice(2).toLowerCase();

      // If a listener exists, remove it and clean up internal reference
      if (el._listeners?.[eventName]) {
        this.event.off(el, eventName, el._listeners[eventName]);
        delete el._listeners[eventName];
      }
      return;
    }

    // If the key exists directly on the element (e.g. value, checked, disabled)
    if (key in el) {
      try {
        el[key] = typeof el[key] === "boolean" ? false : "";
      } catch {
        // fallback if property is read-only
      }
    }

    // For standard attributes like id, class, data-*
    el.removeAttribute(key);
  }
}
