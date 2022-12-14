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
    if (existingUsername) {
      const response = await fetch(`/api/user/` + existingUsername);
      const responseJson = await response.json();
      if (existingUsername && existingOffice) {
        this.setState({uname: existingUsername, name: responseJson.name, image: responseJson.image, text: '', loggedIn: true, office: existingOffice, office_url: responseJson.office_image});
      }
    }
  }

  fetchOffices = async () => {
    const response = await fetch(`/api/offices`);
    const responseJson = await response.json();
    const offices = responseJson.offices;
    this.setState({ possibleOffices: offices, office: offices[0]});
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
          office: this.state.office,
      })
    };
    const response = await fetch('/api/login/', requestOptions);
    const responseJson = await response.json();
    if (responseJson.success) {
      this.setState({uname: text, name: responseJson.name, text: '', loggedIn: true, office_url: responseJson.office_image});
      localStorage.setItem(this.STORED_USERNAME_KEY, text);
      localStorage.setItem(this.STORED_OFFICE_KEY, this.state.office);
    } else {
      alert(responseJson.message);
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
      alert(custom.message);
    }
  };

  refresh = async evt => {
    this.forceUpdate();
  }

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
          <h3>Got Room For One More?</h3>
          <div className="card my-5 w-50">
            <div className="LoginCard card-body p-4">
              <h3 className="fw-bolder mb-3">Check yourself in</h3>
              <form onSubmit={this.logIn}>
                <label htmlFor="company-email" className="form-label">Company Email</label>
                <input
                    type="text"
                    name="text"
                    id="company-email"
                    className="form-control mb-3"
                    placeholder="first.last@sap.com"
                    value={this.state.text}
                    onChange={this.handleChange}
                />
                <label htmlFor="office" className="form-label">Office</label>
                <select className="form-select mb-3" id="office" name="office" value={this.state.office} onChange={this.handleChange}>
                  {
                    this.state.possibleOffices.map((name) => <option value={name} key={name}>{name}</option>)
                  }
                </select>
                <button className="btn btn-primary" type="submit" disabled={!this.state.text}>
                  <i className="bi bi-door-open me-2"></i>
                  Check in
                </button>
              </form>
            </div>
          </div>
          <p className="text-danger">{this.state.error}</p>
        </div>
      );
    } else {
      return (
        <div className="MainPage">
          <div className="parallax position-relative" style={{backgroundImage: "url('" + this.state.office_url + "')"}}>
            <div className="heading">
              <div className="d-flex flex-row vw-100 px-5 justify-content-between align-items-center">
                <h2 className="py-4">Hey {this.state.name}, welcome to the SAP {this.state.office} office!</h2>
                <div className="d-flex flex-row gap-4">
                  <form onSubmit={this.refresh}>
                    <button className="btn btn-light" type="submit">
                      <i className="bi bi-arrow-clockwise me-2"></i>
                      Refresh
                    </button>
                  </form>
                  <form onSubmit={this.logOut}>
                    <button className="btn btn-danger" type="submit">
                      <i className="bi bi-door-open-fill me-2"></i>
                      Check out
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
          <div className="container-fluid py-4 px-5">
            <div className="row">
              <div className="col-8">
                <AmenitiesList uname={this.state.uname} name={this.state.name} image={this.state.image} office={this.state.office}/>
              </div>
              <div className="col-4">
                <PeopleList uname={this.state.uname} office={this.state.office}/>
              </div>
            </div>
          </div>
        </div>
      )
    }
  }
}

export default LoginApp
