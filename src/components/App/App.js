import React, { PropTypes, Component } from 'react';
import {findDOMNode} from 'react-dom';

import withContext from '../../decorators/withContext';
import withStyles from '../../decorators/withStyles';

import Header from '../Header';
import Terminal from '../Terminal';
import Menu from '../Menu';

import config from '../../config';
import Themes from '../../core/ThemeManager';
import Preferences from '../../core/PreferenceManager';
import ProcessStore from '../../stores/ProcessStore';

import styles from './App.css';

// Testing;
global.prc = ProcessStore;

/**
 * Entry Component.
 */
@withContext
@withStyles(styles)
class App extends Component {
  static propTypes = {
    children: PropTypes.element.isRequired,
    error: PropTypes.object
  };

  /**
   * @see Component#componentDidMount
   */
  componentDidMount() {
    ProcessStore.start();
  }

  /**
   * @see Component#render
   */
  render() {
    return !this.props.error ? (
      <div>
        <Header logo={config.logo} maxHeight={config.headerHeight} />
        <Terminal buffer={ProcessStore.screenBuffer} />
        <Menu />
      </div>
    ) : this.props.children;
  }

}

export default App;
