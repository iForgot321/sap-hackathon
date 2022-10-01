import React, {Component} from "react";

class PeopleList extends Component {
  state = {
    searchtext: '',
    people: [],
    displayedPeople: []
  };

  async componentDidMount() {
    await this.fetchOnline()
  }

  fetchOnline = async () => {
    const response = await fetch(`/api/online/${this.props.office}`);
    const responseJson = await response.json();
    const people = responseJson.people;
    this.setState({
      people: people,
      displayedPeople: people.filter((person) => (person.name.toLowerCase().includes(this.state.searchtext.toLowerCase())))
    });
  };

  handleSearchChange = evt => {
    this.setState({
      searchtext: evt.target.value,
      displayedPeople: this.state.people.filter((person) => (person.name.toLowerCase().includes(evt.target.value.toLowerCase())))
    });
  };

  render() {
    return (
      <div className="border-start ps-4">
        <h3>People</h3>
        <div className="input-group">
          <input type="text" name="searchtext" className="form-control" placeholder="Search"
                 aria-label="Search"
                 value={this.state.searchtext}
                 onChange={this.handleSearchChange}/>
        </div>
        <small className="text-muted">View everyone currently in the office.</small>
        <hr/>
        {
          this.state.displayedPeople.map((person) => (
            <Person key={person.id} person={person}/>
          ))
        }
      </div>
    );
  }
}

class Person extends Component {
  render() {
    const defaultProfilePicture = "https://t4.ftcdn.net/jpg/00/64/67/63/360_F_64676383_LdbmhiNM6Ypzb3FM4PPuFP9rHe7ri8Ju.jpg";
    const person = this.props.person;
    let smallText;
    if (person.room === undefined) {
      smallText = <div/>
    } else {
      smallText = <small>Find them in <strong>{person.room}</strong></small>
    }
    return (
      <div className="card shadow-sm mb-2 w-100">
        <div className="card-body">
          <div className="row">
            <div className="col-2">
              <img
                style={{width: "2em", height: "2em", padding: 0}}
                className="img-thumbnail rounded-circle"
                key={person.email}
                src={person.image ? person.image : defaultProfilePicture}
                alt={`Profile picture of ${person.name}`}>
              </img>
            </div>
            <div className="col-10">
              <h5 className="card-title">{person.name}</h5>
              <div>{person.id}</div>
              {smallText}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default PeopleList;