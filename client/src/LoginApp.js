import React, {Component} from 'react'
import './LoginApp.css'
import AmenitiesList from "./AmenitiesList";
import PeopleList from "./PeopleList";

class LoginApp extends Component {
  STORED_USERNAME_KEY = 'uname';
  STORED_OFFICE_KEY = 'office';

  state = {
    uname: '',
    name: '',
    loggedIn: false,
    office: '',
    error: '',
    possibleOffices: [],
    text: ''
  };

  async componentDidMount() {
    await this.fetchExistingSession();
    await this.fetchOffices()
  }

  fetchExistingSession = async () => {
    const existingUsername = localStorage.getItem(this.STORED_USERNAME_KEY);
    const existingOffice = localStorage.getItem(this.STORED_OFFICE_KEY);
    const response = await fetch(`/api/user/` + existingUsername);
    const responseJson = await response.json();
    if (existingUsername && existingOffice) {
      this.setState({uname: existingUsername, name: responseJson.name, image: responseJson.image, text: '', loggedIn: true, office: existingOffice});
    }
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
    if (this.state.text === '') {
      this.setState({error: "Please provide a company email."});
      return;
    }
    const requestOptions = {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
          user_id: text,
          office: this.state.office
      }
      )};
    const response = await fetch('/api/login/', requestOptions);
    const responseJson = await response.json();
    if (responseJson.success) {
      this.setState({uname: text, name: responseJson.name, text: '', loggedIn: true});
      localStorage.setItem(this.STORED_USERNAME_KEY, text);
      localStorage.setItem(this.STORED_OFFICE_KEY, this.state.office);
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
          user_id: this.state.uname
        }
      )};
    const response = await fetch('/api/logout/', requestOptions);
    const custom = await response.json();
    if (custom.success) {
      this.setState({uname: '', text: '', loggedIn: false});
      localStorage.removeItem(this.STORED_USERNAME_KEY);
      localStorage.removeItem(this.STORED_OFFICE_KEY);
    } else {
      alert("O NO");
    }
  };

  handleChange = evt => {
    this.setState({[evt.target.name]: evt.target.value});
    if (evt.target.name === "text") {
      this.setState({error: ""});
    }
  };

  render() {
    if (!this.state.loggedIn) {
      return (
        <div className="LoginApp">
          <h3>[name of app]</h3>
          <form onSubmit={this.logIn}>
            <input
              type="text"
              name="text"
              className="form-control my-3"
              placeholder="Company Email"
              value={this.state.text}
              onChange={this.handleChange}
            />
            <select className="form-select mb-3" name="office" onChange={this.handleChange}>
              {
                this.state.possibleOffices.map((name) => <option value={name} key={name}>{name}</option>)
              }
            </select>
            <button className="btn btn-primary mb-3" type="submit">
              <i className="bi bi-door-open me-2"></i>
              Check in
            </button>
          </form>
          <p className="text-danger">{this.state.error}</p>
        </div>
      );
    } else {
      return (
        <div className="MainPage">
          <div className="container-fluid">
            <div className="d-flex flex-row justify-content-between">
              <h2 className="pb-4">Hey {this.state.name}, welcome to the SAP {this.state.office} office!</h2>
              <form onSubmit={this.logOut}>
                <button className="btn btn-primary" type="submit">
                  <i className="bi bi-door-open-fill me-2"></i>
                  Check out
                </button>
              </form>
            </div>
            <div className="row">
              <div className="col-8">
                <AmenitiesList uname={this.state.uname} name={this.state.name} image={this.state.image} office={this.state.office}/>
              </div>
              <div className="col-4">
                <PeopleList office={this.state.office}/>
              </div>
            </div>
          </div>
        </div>
      )
    }
  }
}

export default LoginApp
