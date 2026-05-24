export class Router {
  // initializes the Router class with an empty routes object to store route handlers (ex: { '/home': () => virtual_homepage })
  // and a reference to the dom class for rendering views associated with each route.
  constructor(dom, store = null) {
    this.routes = {};
    this.dom = dom;
    this.store = store;
    window.addEventListener("hashchange", () => this.render());
  }

  // this is called when the router is initialized
  init() {
    Promise.resolve().then(() => {
      this.render();
    });
  }

  // responsible for navigating to a specified path by updating the URL hash ( ex: #/home ) and rendering the corresponding route handler
  navigate(path) {
    location.hash = path;
  }

  getpath() {
    return location.hash;
  }

  // responsible for rendering the view associated with the current route.
  render() {
    let currentpath = location.hash || "#";

    let page = this.routes[currentpath] ?? this.routes["#/notfound"];
    
    this.dom.scheduleMount(page());
  }

  // allows you to register a new route by associating a path with a handler function.
  // route : the URL path that should trigger the handler when navigated to ( ex: '/home' )
  // vdomHandler : a function that returns the view to be rendered when the route is accessed ( ex: () => homepage )
  register(route, vdomHandler) {
    this.routes[route] = vdomHandler;
  }
}
