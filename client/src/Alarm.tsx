import React, { Component } from 'react';
import AlarmItem from './AlarmItem';
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

  makeAlarm(option?: {
    text?: string,
    type?: 'info' | 'success' | 'warning' | 'error',
    waiting?: boolean,
    duration?: number,
  }) {
    option = option || {};
    const _option = {
      text: option.text || '',
      type: option.type || 'info',
      waiting: option.waiting || false,
    }
    const duration = option.duration || (_option.waiting ? -1 : 5000)

    const alarmItemRef = React.createRef<AlarmItem>();
    const alarmItem = (
      <AlarmItem 
        option = { _option }
        ref = { alarmItemRef }
        key = { `${Date.now()}${_option.text}` }/>
    );

    const newAlarms = [...this.state.alarms, alarmItem];
    
    const destroyFunction = () => {
      if(alarmItemRef.current) alarmItemRef.current.destroy();
      setTimeout(() => {
        this.removeAlarm(alarmItem);
      }, 500);
    }
    
    if(duration > 0) setTimeout(() => {
      destroyFunction();
    }, duration);

    this.setState({
      alarms: newAlarms,
    });

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

