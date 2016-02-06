import router from './router';

class Page {
  /**
   * Construct a new Page
   * @param {HTMLElement} root
   */
  constructor(root) {
    this.elements_ = {
      root,
      wrap: root.querySelector('.Page-wrap'),
      header: root.querySelector('.Page-header'),
      icon: root.querySelector('.Page-icon'),
      title: root.querySelector('.Page-title'),
      content: root.querySelector('.Page-content'),
    };

    this.isExpanded_ = false;
    this.path_ = this.elements_.header.getAttribute('route');
    this.parts_ = Object.keys(this.elements_);
    this.elements_.header.addEventListener('click', this.onExpand, true);
  }

  expand() {
    if (this.isExpanded_) {
      return;
    }

    this.startPosition_ = this.elements_.root.getBoundingClientRect();
    this.collapsedProps_ = this.props;

    this.elements_.root.classList.add('is-open');
    this.expandedProps_ = this.props;
    this.transformTo(this.diff);
    this.forceLayout();

    this.elements_.root.classList.add('Page--animate');
    this.transformToZero();

    this.isExpanded_ = true;

    this.elements_.wrap.addEventListener('transitionend', this.onExpandTransitionEnd_);
    this.elements_.wrap.addEventListener('webkittransitionend', this.onExpandTransitionEnd_);
  }

  transformTo(destination) {
    const currentPosition = this.elements_.root.getBoundingClientRect();
    const leftDifference = currentPosition.left - this.startPosition_.left;
    const topDifference = currentPosition.top - this.startPosition_.top;

    for (const part of this.parts_) {
      if (part === 'root' || part === 'wrap' || part === 'header') continue;
      const { left, top } = destination[part];
      Page.transform(this.elements_[part], `translate(${left + leftDifference}px, ${top + topDifference}px)`);
    }

    const { bottom, left, right, top } = this.collapsedProps_.root;

    const clipLeft = left + leftDifference;
    const clipRight = right + leftDifference;
    const clipTop = top + topDifference;
    const clipBottom = bottom + topDifference;

    this.elements_.wrap.style.clip = `rect(${clipTop}px, ${clipRight}px, ${clipBottom}px, ${clipLeft}px)`;
  }

  transformToZero() {
    for (const part of this.parts_) {
      if (part === 'root') continue;
      Page.transform(this.elements_[part], 'translate(0, 0)');
    }

    const { bottom, left, right, top } = this.expandedProps_.wrap;
    this.elements_.wrap.style.clip = `rect(${top}px, ${right}px, ${bottom}px, ${left}px)`;
  }

  forceLayout() {
    return this.elements_.wrap.offsetTop;
  }

  get diff() {
    const diff_ = {};

    for (const part of this.parts_) {
      diff_[part] = {
        height: this.collapsedProps_[part].height - this.expandedProps_[part].height,
        left: this.collapsedProps_[part].left - this.expandedProps_[part].left,
        opacity: 1 - (this.expandedProps_[part].opacity - this.collapsedProps_[part].opacity),
        top: this.collapsedProps_[part].top - this.expandedProps_[part].top,
        width: this.collapsedProps_[part].width - this.expandedProps_[part].width,
        scaleX: this.collapsedProps_[part].width / this.expandedProps_[part].width,
        scaleY: this.collapsedProps_[part].height / this.expandedProps_[part].height,
      };
    }

    return diff_;
  }

  get props() {
    const props_ = {};

    for (const part of this.parts_) {
      const element = this.elements_[part];
      const { bottom, height, left, right, top, width } = element.getBoundingClientRect();

      props_[part] = {
        bottom,
        height: Math.min(height, window.innerHeight),
        left,
        opacity: parseFloat(window.getComputedStyle(element).opacity),
        right,
        top,
        width: Math.min(width, window.innerWidth),
      };
    }

    return props_;
  }

  onExpand = () => {
    router.navigate(this.path_);
    this.expand();
  };

  onExpandTransitionEnd_ = () => {
    this.elements_.root.classList.remove('Page--animate');

    for (const part of this.parts_) {
      Page.transform(this.elements_[part], '');
    }

    this.elements_.wrap.style.clip = '';
  };

  static transform(element, value) {
    /* eslint-disable no-param-reassign */
    element.style.webkitTransform = value;
    element.style.transform = value;
    /* eslint-enable no-param-reassign */
  }
}

export default Page;
