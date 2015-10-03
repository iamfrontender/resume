import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import { canUseDOM } from 'fbjs/lib/ExecutionEnvironment';

import styles from './Header.css';

import withStyles from '../../decorators/withStyles';
import withElements from '../../decorators/withElements';

import Link from '../Link';
import Navigation from '../Navigation';

import HttpClient from '../../core/HttpClient';
import ResizeManager from '../../core/ResizeManager';

import HeaderStore from '../../stores/HeaderStore';
import HeaderEvents from '../../constants/HeaderEvents';

/**
 * Header Component.
 */
@withStyles(styles)
@withElements({
  logo: '.Header__logo'
})
class Header extends Component {

  /**
   * @constructor
   */
  constructor(props) {
    super(props);

    this.state = {
      logo: <div>{props.logo}</div>
    };
  }

  /**
   * Attaches required listeners and fetches the actual logo.
   * @see Component#componentDidMount
   */
  componentDidMount() {
    this.listeners();

    this.loadLogo();
  }

  /**
   * Fetches the actual ascii logo text from an api.
   * Defines the available height for it.
   */
  loadLogo() {
    HttpClient.get('/api/logo?text=' + this.props.logo)
    .then(res => this.setLogo(res.text))
    .catch((e) => {});
  }

  /**
   * Attaches required listeners.
   */
  listeners() {
    HeaderStore.on(HeaderEvents.LOGO_RELOAD, this.loadLogo.bind(this));
    ResizeManager.on('resize', this._resize.bind(this));
  }

  /**
   * Sets the logo actual text, resizing it to the viewport.
   *
   * @param {String} text ascii figlet logo
   */
  setLogo(text) {
    // For each row in original text will return a div
    // with row content with escaped spaces.
    var rows = text.split(/\n/).map(function(row, i) {
      return <pre dangerouslySetInnerHTML={{__html: row.replace(/\s/g, '&nbsp')}} key={"logo-row-" + i}></pre>
    });

    this.setState({
      logo: rows
    }, this._resize.bind(this));
  }

  /**
   * Returns the supposed logo size.
   *
   * @returns {{height: number, width: number}}
   */
  _getLogoRect() {
    let symbolRect = this._getSymbolSize();

    return {
      // Simply count of rows multiplied by row's height
      height: symbolRect.height * this.logo.children.length,
      // The longest row width + additional 50px padding
      width: symbolRect.width * Math.max.apply(null,
        Array.from(this.logo.children).map(child =>
          child.innerText.length
        )
      ) + 50
    };
  }

  /**
   * Calculates the single ('W') symbol size, taking into account actual logo font
   *
   * @returns {ClientRect}
   */
  _getSymbolSize() {
    var sample = document.createElement('span');
    sample.innerHTML = 'W';

    this.logo.appendChild(sample);
    var symbolRect = sample.getBoundingClientRect();
    this.logo.removeChild(sample);

    return symbolRect;
  }

  /**
   * Resizes the logo to fit the current screen dimensions.
   */
  _resize() {
    // Reset
    this.logo.style.transform = `scale(1)`;

    var scaleX, scaleY;
    var width = window.innerWidth;
    // Since the 'pre' makes children unshrinkable over its own
    // width even with content wider then themselves, we're need
    // to calculate the bounding rect using different approach
    var logoRect = this._getLogoRect();

    var heightOffset = logoRect.height - this.props.maxHeight;
    var widthOffset = logoRect.width - width;

    if (heightOffset > 0 || widthOffset > 0) {
      scaleY = this.props.maxHeight / logoRect.height;
      scaleX = width / logoRect.width;

      var factor = scaleX > scaleY ? scaleY : scaleX;

      this.logo.style.transform = `scale(${factor})`;
      this.el.style.maxHeight = logoRect.height * factor + 'px';
    }
  }

  /**
   * @see Component#render
   */
  render() {
    return (
      <div className="Header">
        <section className="Header__logo">{this.state.logo}</section>
      </div>
    );
  }

}

export default Header;
