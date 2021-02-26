export default class RowPopupState {

  constructor() {
    this.element = null;
    this.model = null;
  }

  update(target, model) {
    this.element = "TR"  === target.tagName ? target : target.closest("TR");
    this.model = model;
  }

  reset() {
    this.element = null;
    this.model = null;
  }

  getElement() {
    return this.element;
  }

  getModel() {
    return this.model;
  }

}