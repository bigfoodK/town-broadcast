import React, { Component } from 'react';
import './AlarmItem.css'

interface Prop {
  option: {
    text: string,
    type: 'info' | 'success' | 'warning' | 'error',
    waiting: boolean,
  }
}

interface State {
  class: '' | 'show';
}

export default class AlarmItem extends Component<Prop, State> {
  color: string;
  background: JSX.Element | null;

  constructor(prop: Prop) {
    super(prop);

    this.color = getColor(this.props.option.type);
    this.background = this.props.option.waiting ? <div className = 'alarm-wait' /> : null;

    this.state = {
      class: '',
    }
  }

  componentDidMount() {
    setTimeout(() => {
      this.setState({
        class: 'show'
      });
    }, 100);
  }

  destroy() {
    this.setState({
      class: ''
    });
  }

  render() {
    return (
      <div 
        className = {`alarm-item ${this.state.class}`}
        style = {{ backgroundColor: this.color }}
        title = { this.props.option.text }>
        { this.props.option.text }
        { this.background }
      </div>
    )
  }
}

function getColor(type: 'info' | 'success' | 'warning' | 'error') {
  switch (type) {
    case 'info': return '#22a7f0';
    case 'success': return '#2ecc71';
    case 'warning': return '#f4d03f';
    case 'error': return '#d91e18';
  }
}
