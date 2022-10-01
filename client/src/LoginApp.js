import React, {Component} from 'react'
import './App.css'

class LoginApp extends Component {
  state = {
    uname: '',
    text: ''
  };

  logIn = async evt => {
    evt.preventDefault();
    const text = this.state.text;
    const response = await fetch(`/api/login/${text}`);
    const custom = await response.json();
    const uname = custom.uname;
    this.setState({uname, text: ''})
  };

  logOut = async evt => {
    evt.preventDefault();
    const response = await fetch(`/api/logout/${this.state.uname}`);
    const custom = await response.json();
    console.log(custom.success);
    if (custom.success) {
      this.setState({uname: '', text: ''})
    }
  };

  handleChange = evt => {
    this.setState({[evt.target.name]: evt.target.value})
  };

  render() {
    if (this.state.uname === '') {
      return (
        <div className="LoginApp">
          <h3>Login</h3>
          <form onSubmit={this.logIn}>
            <label>Username:</label>
            <input
              type="text"
              name="text"
              value={this.state.text}
              onChange={this.handleChange}
            />
            <button type="submit">Login</button>
          </form>
        </div>
      );
    } else {
      return (
        <div className="LoginApp">
          <h3>Welcome: {this.state.uname}</h3>
          <form onSubmit={this.logOut}>
            <button type="submit">Logout</button>
          </form>
        </div>
      )
    }
  }
}

export default LoginApp
