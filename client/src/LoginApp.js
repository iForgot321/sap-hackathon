import React, {Component} from 'react'
import './LoginApp.css'

class LoginApp extends Component {
  state = {
    uname: '',
    office: '',
    possibleOffices: '',
    text: ''
  };

  componentDidMount() {
    this.fetchOffices()
  }

  fetchOffices = async () => {
    const response = await fetch(`/api/offices`);
    const responseJson = await response.json();
    const offices = responseJson.offices;
    this.setState({ ...this.state, possibleOffices: offices });
    console.log(this.state.possibleOffices);
  };

  logIn = async evt => {
    evt.preventDefault();
    const text = this.state.text;
    const requestOptions = {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
          uname: text
      }
      )};
    const response = await fetch('/api/login/', requestOptions);
    const custom = await response.json();
    const uname = custom.uname;
    this.setState({uname, text: ''})
  };

  logOut = async evt => {
    evt.preventDefault();

    const requestOptions = {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
          uname: this.state.uname
        }
      )};
    const response = await fetch('/api/logout/', requestOptions);
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
