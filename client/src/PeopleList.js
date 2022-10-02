import React, {Component} from "react";

class PeopleList extends Component {
  state = {
    searchtext: '',
    amenitySearchText: '',
    people: [],
    updateTimer: 0,
  };

  async componentDidMount() {
    // Queue up calls
    const timer = setInterval(async () => {
      await this.fetchOnline();
    }, 5 * 1000);
    this.setState({updateTimer: timer});

    // First call
    await this.fetchOnline();
  }

  componentWillUnmount() {
    clearInterval(this.state.updateTimer);
  }

  fetchOnline = async () => {
    const response = await fetch(`/api/online/${this.props.office}`);
    const responseJson = await response.json();
    const people = responseJson.people;
    this.setState({
      people: people,
    });
  };

  getFilteredPeople = () => {
    return this.state.people.filter((person) => {
      return person.name.toLowerCase().includes(this.state.searchtext)
          && (
            !this.state.amenitySearchText
            || person.usedAmenities.some((amenityName) => {
              return amenityName.toLowerCase().includes(this.state.amenitySearchText);
            })
          );
    });
  }

  handleNameSearchChange = evt => {
    this.setState({
      searchtext: evt.target.value.toLowerCase(),
    });
  };

  handleAmenitySearchChange = evt => {
    this.setState({
      amenitySearchText: evt.target.value.toLowerCase(),
    });
  }

  render() {
    const displayedPeople = this.getFilteredPeople();

    return (
      <div className="border-start ps-4">
        <h3>People</h3>
        <label className="text-muted">Find everyone in the office...</label>
        <div className="input-group">
          <input type="text" name="searchtext" className="form-control" placeholder="Filter by name"
                 aria-label="Search"
                 value={this.state.searchtext}
                 onChange={this.handleNameSearchChange}
          />
        </div>
        <label className="text-muted mt-2">Who might be interested in...</label>
        <input type="text"
               name="searchtext"
               className="form-control"
               placeholder="e.g. pool"
               aria-label="Search"
               value={this.state.amenitySearchText}
               onChange={this.handleAmenitySearchChange}
        />
        <hr/>
        <div className="overflow-scroll" style={{height: "24em"}}>
          {
            displayedPeople.filter((person) => person.id !== this.props.uname).map((person) => (
              <Person key={person.id} person={person} amenitySearchText={this.state.amenitySearchText}/>
            ))
          }
        </div>
      </div>
    );
  }
}

class Person extends Component {
  render() {
    const defaultProfilePicture = "https://t4.ftcdn.net/jpg/00/64/67/63/360_F_64676383_LdbmhiNM6Ypzb3FM4PPuFP9rHe7ri8Ju.jpg";
    const person = this.props.person;
    let locationText = null;
    if (person.room) {
      locationText = <small>Find them in <strong>{person.room}</strong></small>
    }

    // Display a person's recently used amenities if it matches search text
    const amenitySearchText = this.props.amenitySearchText;
    const amenityName = amenitySearchText ? person.usedAmenities.find((amenityName) => {
      return amenityName.toLowerCase().includes(amenitySearchText);
    }) : null;
    let usedAmenitiesText = null;
    if (amenityName) {
      usedAmenitiesText = <small className="text-muted">Recently enjoyed {amenityName}</small>;
    }

    return (
      <div className="card shadow-sm mb-2 w-100">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-3">
              <img
                style={{width: "3em", height: "3em", padding: 0}}
                className="img-thumbnail rounded-circle"
                key={person.email}
                src={person.image ? person.image : defaultProfilePicture}
                alt={`Profile picture of ${person.name}`}>
              </img>
            </div>
            <div className="col-9">
              <h5 className="card-title mb-1">{person.name}</h5>
              <div>{person.id}</div>
              <div>{locationText}</div>
              <div>{usedAmenitiesText}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default PeopleList;
