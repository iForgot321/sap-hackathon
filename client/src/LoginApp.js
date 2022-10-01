import React, {Component} from 'react'
import './LoginApp.css'

class LoginApp extends Component {
  state = {
    uname: '',
    loggedIn: false,
    office: '',
    possibleOffices: [],
    text: ''
  };

  componentDidMount() {
    this.fetchOffices()
  }

  fetchOffices = async () => {
    const response = await fetch(`/api/offices`);
    const responseJson = await response.json();
    const offices = responseJson.offices;
    this.setState({ possibleOffices: offices, office: offices[0] });
  };

  logIn = async evt => {
    evt.preventDefault();
    const text = this.state.text;
    const requestOptions = {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
          uname: text,
          office: this.state.office
      }
      )};
    const response = await fetch('/api/login/', requestOptions);
    const responseJson = await response.json();
    if (responseJson.success && responseJson.login) {
      this.setState({ text: '', loggedIn: true});
    } else {
      alert("O NO");
    }
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
    if (custom.success) {
      this.setState({uname: '', text: '', loggedIn: false});
    } else {
      alert("O NO");
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
            <select name="office" onChange={this.handleChange}>
              {
                this.state.possibleOffices.map((name) => <option value={name} key={name}>{name}</option>)
              }
            </select>
            <button type="submit">Login</button>
          </form>
        </div>
      );
    } else {
      return (
        <div className="LoginApp">
          <h3>Welcome: {this.state.uname} to office {this.state.office}</h3>
          <form onSubmit={this.logOut}>
            <button type="submit">Logout</button>
          </form>
        </div>
      )
    }
  }
}

export default LoginApp
