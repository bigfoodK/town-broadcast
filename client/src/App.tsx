import React, { Component } from 'react';
import './App.css';

interface State {
  isOnAir: boolean;
  isLoggedIn: boolean;
  isConnected: boolean;
  shouldConnect: boolean;
  isGettingUserMicData: boolean;
  password: string;
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
      isLoggedIn: false,
      isConnected: false,
      shouldConnect: false,
      isGettingUserMicData: false,
      password: '',
    }

    this.makeConnection = this.makeConnection.bind(this);
    this.closeConnection = this.closeConnection.bind(this);
    this.getUserMicData = this.getUserMicData.bind(this);
    this.startBroadcast = this.startBroadcast.bind(this);
    this.stopBroadcast = this.stopBroadcast.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillMount() {
    this.checkLogin();
  }

  checkLogin() {
    const isLoggedIn = parseCookie(document.cookie).has('session');
    if(this.state.isLoggedIn === isLoggedIn) return;
    this.setState({
      isLoggedIn: isLoggedIn,
    });
    return isLoggedIn;
  }
  
  makeConnection() {
    if(this.socket && this.socket.readyState !== 3) return;

    this.socket = new WebSocket(`wss://${window.location.hostname}:${window.location.port}/voice`);
    this.socket.onerror = error => {
      console.error(error);
    }
    this.socket.onopen = () => {
      this.setState({
        isConnected: true,
      });
    }
    this.socket.onclose = event => {
      this.setState({
        isConnected: false,
      });

      switch (event.code) {
        case 4401:
          this.setState({
            isLoggedIn: false,
          });
          this.stopBroadcast();
          alert("로그인이 필요합니다.");
          break;
          
        case 4409:
          this.stopBroadcast();
          alert("다른 기기에서 연결되었습니다.\n방송을 종료합니다.");
          break;
      }

      if(!this.state.shouldConnect) return;

      console.log('Disconnected, Try reconnect in 5sec');
      setTimeout(() => {
        this.makeConnection();
      }, 5000);
    }
  }

  closeConnection() {
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
      this.processor = context.createScriptProcessor(4096,1,1);
  
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

  handlePasswordChange(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({
      password: event.target.value,
    });
  } 

  handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    const data = new FormData(event.target as HTMLFormElement);

    fetch('/login', {
      body: data,
      method: 'POST',
      credentials: 'same-origin',
    }).then(() => {
      this.checkLogin()
        ? alert('로그인 되었습니다.')
        : alert('잘못된 비밀번호입니다.');
    })

    event.preventDefault();
  }
  
  render() {
    return (
      <div className="App">
        <div className = {`login-box ${this.state.isLoggedIn ? 'loggedIn' : ''}`}>
          <form onSubmit = { this.handleSubmit }>
            <input 
              className = 'form-item'
              id = 'password'
              name = 'password'
              type = 'password'
              value = { this.state.password }
              onChange = { this.handlePasswordChange } />
            <input
              className = 'form-item'
              type = 'submit'
              value = '로그인' />
          </form>
        </div>
        <div className = 'state-bar'>
          <div className = 'state-item'>서버</div>
          <div className = { `state-item led ${this.state.isConnected ? 'on' : 'off'}` } />
          <div className = 'state-item' />
          <div className = 'state-item'>마이크</div>
          <div className = { `state-item led ${this.state.isGettingUserMicData ? 'on' : 'off'}` } />
        </div>
        <div className = 'container'>
          <button 
            className = {`mic-button ${this.state.isOnAir ? 'on' : 'off'}`}
            onClick = {this.handleClick}>
              <i className = "fas fa-microphone" />
          </button>  
        </div>
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

function parseCookie(cookie: string) {
  const result = new Map<String, String>();
  cookie.split(';').forEach(row => {
    const index = row.indexOf('=');
    const key = row.slice(0, index).trim();
    const value = row.slice(index+1).trim();
    result.set(key, value);
  });
  return result;
}
