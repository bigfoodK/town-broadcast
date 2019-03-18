import React, { Component } from 'react';
import './Alarm.css'

interface State {
  alarms: JSX.Element[],
}

export default class Alarm extends Component<any, State> {
  constructor(prop: any) {
    super(prop);

    this.state = {
      alarms: [],
    }
    
    this.makeAlarm = this.makeAlarm.bind(this);
  }

  makeAlarm(option: {
    text: string,
    type: 'info' | 'success' | 'warning' | 'error',
    waiting: boolean,
    duration: number,
  }) {
    const color = getColor(option.type);
    const alarmItem = (
      <div 
        className = 'alarm-item'
        style = {{ backgroundColor: color }}
        title = { option.text }
        key = {`${Date.now()}${option.text}`}>
        { option.waiting ? <div className = 'alarm-wait' /> : ''}
        { option.text }
      </div>
    );

    const newAlarms = [...this.state.alarms, alarmItem];
    
    if(!option.waiting) setTimeout(() => {
      this.removeAlarm(alarmItem);
    }, option.duration)

    this.setState({
      alarms: newAlarms,
    });

    const destroyFunction = () => {
      this.removeAlarm(alarmItem);
    }

    return destroyFunction;
  }

  removeAlarm(alarmItem: JSX.Element) {
    const newAlarms = this.state.alarms.filter(item => item !== alarmItem);

    if(newAlarms === this.state.alarms) return;

    this.setState({
      alarms: newAlarms,
    });
  }

  render() {
    return (
      <div className = 'alarm'>
        { this.state.alarms }
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
