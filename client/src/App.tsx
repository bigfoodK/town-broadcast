import React, { Component } from 'react';
import './App.css';

interface State {
  isOnAir: boolean;
  isConnected: boolean;
  shouldConnect: boolean;
  isGettingUserMicData: boolean;
}

class App extends Component<any, State> {
  socket: WebSocket | null;
  processor: ScriptProcessorNode | null;

  constructor(prop: any) {
    super(prop);

    this.socket = null;
    this.processor = null;

    this.state = {
      isOnAir: false,
      isConnected: false,
      shouldConnect: false,
      isGettingUserMicData: false,
    }

    this.makeConnection = this.makeConnection.bind(this);
    this.closeConnection = this.closeConnection.bind(this);
    this.getUserMicData = this.getUserMicData.bind(this);
    this.startBroadcast = this.startBroadcast.bind(this);
    this.stopBroadcast = this.stopBroadcast.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }
  
  makeConnection() {
    this.setState({
      shouldConnect: true,
    });

    if(this.socket && this.socket.readyState !== 3) return;

    this.socket = new WebSocket(`wss://${window.location.hostname}:${window.location.port}`);
    this.socket.onerror = error => {
      console.error(error);
    }
    this.socket.onopen = () => {
      this.setState({
        isConnected: true,
      });
    }
    this.socket.onclose = () => {
      this.setState({
        isConnected: false,
      });

      if(!this.state.shouldConnect) return;

      console.log('Disconnected, Try reconnect in 5sec');
      setTimeout(() => {
        this.makeConnection();
      }, 5000);
    }
  }

  closeConnection() {
    this.setState({
      shouldConnect: false,
    });

    if(!this.socket) return;

    this.socket.close();
  }

  async getUserMicData() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false
      });

      const context = new AudioContext();
      const input = context.createMediaStreamSource(stream)
      this.processor = context.createScriptProcessor(1024,1,1);
  
      input.connect(this.processor);
      this.processor.connect(context.destination);

      this.setState({
        isGettingUserMicData: true,
      })
    } catch (error) {
      console.error(error);
      alert(error);
    }
  }
  
  startBroadcast() {
    if(!this.processor) return;
    
    this.setState({
      isOnAir: true,
      shouldConnect: true,
    });

    this.makeConnection();
    
    this.processor.onaudioprocess = e => {
      if(!this.socket) return;
      if(this.socket.readyState !== 1) return;
      const arrayBuffer = convertFloat32ArrayToInt16Array(e.inputBuffer.getChannelData(0));
      this.socket.send(arrayBuffer);
    };
  }
  
  stopBroadcast() {
    if(!this.processor) return;

    this.setState({
      isOnAir: false,
      shouldConnect: false,
    });

    this.closeConnection();

    this.processor.onaudioprocess = () => {};
  }
  
  async handleClick() {
    if(!this.state.isGettingUserMicData) await this.getUserMicData();
    this.state.isOnAir
      ? this.stopBroadcast()
      : this.startBroadcast()
  }
  
  render() {
    return (
      <div className="App">
      <h1>{this.state.isConnected ? 'Connected' : 'Disconnected'} to server</h1>
      <h1>{this.state.isGettingUserMicData ? 'using' : 'not using'} mic</h1>
      <h1>{this.state.isOnAir ? 'onAir': 'ready'}</h1>
        <button 
          className = 'mic-button'
          onClick = {this.handleClick}>
          {this.state.isOnAir ? 'stop broadcast' : 'start broadcast'}
        </button>
      </div>
    );
  }
}

export default App;

function convertFloat32ArrayToInt16Array(float32Array: Float32Array) {
  const result = Int16Array.from(float32Array, num => {
    return num * 0x7FFE;
  })
  return result;
}
