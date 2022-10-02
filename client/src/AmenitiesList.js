import React, {Component, useState} from 'react'
import './AmenitiesList.css';

class AmenitiesList extends Component {
    state = {
        amenities: [],
        availability: "available",
        searchString: "",
    };

    async componentDidMount() {
        await this.fetchAmenities();
    }


    async updateFromResponse(res) {
        let newState = this.state.amenities;

        if (res.isTapIn) {
            newState[res.index].here = true;
            for (let i = 0; i < newState.length; i++) {
                let b = false;
                for (let j = 0; j < newState[i].people.length; j++) {
                    if (newState[i].people[j].name === this.props.name) {
                        newState[i].people.splice(j, 1);
                        newState[i].here = false;
                        b = true;
                        break;
                    }
                }
                if (b) {
                    break;
                }
            }
            newState[res.index].people.push({
                name: this.props.name,
                email: this.props.uname,
                image: this.props.image
            });
        } else {
            newState[res.index].here = false;
            for (let i = 0; i < newState[res.index].people.length; i++) {
                if (newState[res.index].people[i].name === this.props.name) {
                    newState[res.index].people.splice(i, 1);
                    break;
                }
            }
        }
        this.setState({amenities: newState});
    }

    fetchAmenities = async () => {
        const requestOptions = {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                    uname: this.props.uname
                }
            )};
        const response = await fetch('/api/amenities/' + this.props.office, requestOptions);

        const responseJson = await response.json();
        const amenities = responseJson.amenities;
        this.setState({amenities: amenities});
    };

    render() {
        const searchString = this.state.searchString;
        const availability = this.state.availability;

        // Always include the tapped-in amenity in the list
        const filteredByName = this.state.amenities.map((amenity, index) => {return {...amenity, index: index}}).filter((amenity) => {
            return amenity.here || !searchString || amenity.name.toLowerCase().includes(searchString.toLowerCase());
        });
        const filteredByAvailability = filteredByName.filter((amenity) => {
            if (amenity.here) {
                return true;
            }

            if (availability === "available") {
                // capacity = 0 means unlimited
                return !amenity.capacity || amenity.people.length < amenity.capacity;
            } else if (availability === "unavailable") {
                return amenity.capacity && amenity.people.length >= amenity.capacity;
            } else {
                return true;
            }
        });
        const finalAmenitiesList = filteredByAvailability;
        return (
            <div>
                <h3>Amenities</h3>
                <div className="d-flex flex-row gap-2 my-2">
                    <select
                        className="form-select w-auto"
                        aria-label="Select availability"
                        value={availability}
                        onChange={(evt) => this.setState({availability: evt.target.value})}
                    >
                        <option value={"available"}>Available</option>
                        <option value={"unavailable"}>Full</option>
                        <option value={""}>All</option>
                    </select>
                    <input
                        className="form-control"
                        type="search"
                        value={searchString}
                        placeholder={"Search for something to do!"}
                        onChange={(evt) => this.setState({searchString: evt.target.value})}
                    />
                </div>
                <div className="py-2 overflow-scroll" style={{height: "30em"}}>
                    <div>
                        {
                            finalAmenitiesList.map((amenity) => (
                                <Amenity key={amenity.id} amenity={amenity} here={amenity.here} uname={this.props.uname} callback={(res) => this.updateFromResponse(res)}/>
                            ))
                        }
                    </div>
                </div>
            </div>
        );
    }
}

/**
 * Props: amenity, here
 */
class Amenity extends Component {
    state = {
        lastUsedTime: "",
        lastUsedUser: '',
        popularDay: '',
        topUsers: [],
        error: '',
    }
    async onLogout() {
        const requestOptions = {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                  uname: this.props.uname
              }
            )};
        const response = await fetch('/api/amenities/logout/' + this.props.amenity['id'], requestOptions);
        const custom = await response.json();
        this.props.callback({
            index: this.props.amenity.index,
            isTapIn: false
        });
    }

    async onLogin() {
        const requestOptions = {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                uname: this.props.uname
            }
            )};
        const response = await fetch('/api/amenities/login/' + this.props.amenity['id'], requestOptions);
        const custom = await response.json();
        this.props.callback({
            index: this.props.amenity.index,
            isTapIn: true
        });
    }

    async onStatsLoad() {
        const response = await fetch('/api/amenities/stats/' + this.props.amenity['id']);
        const json = await response.json();
        if (json.success && json.statsFound) {
            this.setState({
                lastUsedTime: json.lastUsedTime,
                lastUsedUser: json.lastUsedUser,
                popularDay: json.popularDay,
                topUsers: json.topUsers,
                error: ''
            });
        } else {
            this.setState({
                lastUsedTime: '',
                lastUsedUser: '',
                popularDay: '',
                topUsers: [],
                error: json.success ? "No statistics found" : "Database error"
            })
        }
    }

    render() {
        const amenity = this.props.amenity;
        const here = this.props.here;
        const canTapIn = !amenity.capacity || amenity.people.length < amenity.capacity;
        const imageSrc = amenity.image ? amenity.image : 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Placeholder_view_vector.svg/681px-Placeholder_view_vector.svg.png';

        return (
            <div className="ItemCard card my-3 w-100">
                <div className="row g-0">
                    <div className="col-md-4">
                        {
                            here &&
                            <div className="position-absolute fs-4" style={{top: "5px"}}>
                                <span className="badge text-bg-light ms-2">
                                    You are here!
                                </span>
                            </div>
                        }
                        <img
                            src={imageSrc}
                            className="img-fluid h-100 rounded-start"
                            alt={`Photo of ${amenity.name}`}
                        />
                    </div>
                    <div className="col-md-8">
                        <div className="card-body">
                            <div className="d-flex flex-row justify-content-between">
                                <h5 className="card-title fw-bolder">
                                    {amenity.name}
                                    {
                                        !canTapIn &&
                                        <span className="badge text-bg-success ms-2">Full</span>
                                    }
                                </h5>
                                {
                                    here ?
                                        <button className="btn btn-danger" onClick={() => this.onLogout(amenity)}>Tap out
                                            <i className="bi bi-box-arrow-right ms-1"></i>
                                        </button> :
                                        canTapIn ?
                                            <button className="btn btn-primary" onClick={() => this.onLogin(amenity)}>Tap in
                                                <i className="bi bi-box-arrow-in-right ms-1"></i>
                                            </button> :
                                            null
                                }
                            </div>
                            <h6 className="card-subtitle mb-2 fw-normal">Located in: {amenity.room}</h6>
                            <CurrentUsage people={amenity.people} />
                            <br/>
                            <button className="btn btn-secondary" type="button" data-bs-toggle="offcanvas"
                                    data-bs-target={"#amenitystats" + amenity.id} aria-controls="amenitystats" onClick={() => this.onStatsLoad()}>
                                More info
                                <i className="bi bi-chevron-right ms-2"></i>
                            </button>
                        </div>
                    </div>
                </div>
                <StatsOffcanvas
                    error={this.state.error}
                    amenity={amenity}
                    lastUsedTime={this.state.lastUsedTime}
                    lastUsedUser={this.state.lastUsedUser}
                    topUsers={this.state.topUsers}
                    popularDay={this.state.popularDay}
                />
            </div>
        );
    }
}

class StatsOffcanvas extends Component {
    render() {
        const amenity = this.props.amenity;

        if (this.props.error) {
            return (
                <div className="offcanvas offcanvas-end" tabIndex="-1" id={"amenitystats" + amenity.id}>
                    <div className="offcanvas-header">
                        <div>
                            <h4 className="offcanvas-title" id="offcanvasRightLabel">
                                {amenity.name}
                            </h4>
                        </div>
                    </div>
                    {
                        amenity.image ?
                            <img src={amenity.image}
                                 className="img-fluid"
                                 alt={`Photo of ${amenity.name}`}/> : <hr className="m-0"/>
                    }
                    <div className="offcanvas-body">
                        <div className="alert alert-danger">
                            {this.props.error}
                        </div>
                    </div>
                </div>
            );
        }

        let displayString = this.props.lastUsedTime;
        let split = this.props.lastUsedTime.split("T")[0].split("-");
        let last = new Date(parseInt(split[0]),parseInt(split[1])-1,parseInt(split[2]));
        let now = new Date(new Date().toDateString());
        if (now - last === 0) {
            displayString = "today";
        } else if (now - last === 1000*60*60*24) {
            displayString = "yesterday";
        }

        return (
            <div className="offcanvas offcanvas-end" tabIndex="-1" id={"amenitystats" + amenity.id}>
                <div className="offcanvas-header">
                    <div>
                        <h4 className="offcanvas-title" id="offcanvasRightLabel">
                            {amenity.name}
                        </h4>
                        <p className="text-secondary mb-0">
                            Last used <b>{displayString}</b> by <b>{this.props.lastUsedUser}</b>
                        </p>
                    </div>
                    <button
                        type="button"
                        className="btn-close"
                        data-bs-dismiss="offcanvas"
                        aria-label="Close"
                    />
                </div>
                {
                    amenity.image ?
                    <img src={amenity.image}
                         className="img-fluid"
                         alt={`Photo of ${amenity.name}`}/> : <hr className="m-0"/>
                }
                <div className="offcanvas-body">
                    {
                        this.props.popularDay &&
                        <div>
                            <h5>Most popular day</h5>
                            <div className="card shadow-sm">
                                <div className="card-body py-2 px-3 fs-5">
                                    {this.props.popularDay}
                                </div>
                            </div>
                        </div>
                    }
                    <hr/>
                    <h5 className="mb-3">Top users</h5>
                    {
                        this.props.topUsers.map((user, index) => (
                            <div className={"card shadow-sm mb-2" + (index ? " HighlightedRest" : " HighlightedFirst")} key={user}>
                                <div className="card-body d-flex flex-row align-items-center py-2 px-3 fs-5">
                                    <span className={"badge me-3" + (index ? " bg-secondary" : " bg-success")}>
                                        {index + 1}
                                    </span>
                                    {user}
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>
        );
    }
}

/**
 * Props: people
 */
class CurrentUsage extends Component {
    getListOfNamesUsing = () => {
        const firstNames = this.props.people.map((person) => person.name.split(" ")[0]);
        switch (firstNames.length) {
            case 0:
                return "Nobody is here yet!"
            case 1:
                return `${firstNames[0]} is here`
            case 2:
                return `${firstNames[0]} and ${firstNames[1]} are here`
            case 3:
                return `${firstNames[0]}, ${firstNames[1]}, and ${firstNames[2]} are here`
            default:
                const restLength = firstNames.length - 2
                return `${firstNames[0]}, ${firstNames[1]}, and ${restLength} more people are here`
        }
    }

    render() {
        const profilePicturesToShow = this.props.people.slice(0, 2);

        return (
            <div className="d-flex flex-row gap-1 align-items-center">
                {
                    profilePicturesToShow.map((person) => (
                        <ProfilePhoto key={person.email} image={person.image} name={person.name}/>
                    ))
                }
                {
                    this.props.people.length > profilePicturesToShow.length &&
                    <img
                        src="profile-etc.png"
                        alt="Ellipsis"
                        style={{width: "2em", height: "2em", padding: 0}}
                    />
                }
                <div className="card-text text-muted">
                    <small className={this.props.people.length && "ms-1"}>{this.getListOfNamesUsing()}</small>
                </div>
            </div>
        );
    }
}

/**
 * Props: image, name
 */
class ProfilePhoto extends Component {
    render() {
        const defaultProfilePicture = "https://t4.ftcdn.net/jpg/00/64/67/63/360_F_64676383_LdbmhiNM6Ypzb3FM4PPuFP9rHe7ri8Ju.jpg";
        return (
            <img
                style={{width: "2em", height: "2em", padding: 0}}
                className="img-thumbnail rounded-circle"
                src={this.props.image ? this.props.image: defaultProfilePicture}
                alt={`Profile picture of ${this.props.name}`}>
            </img>
        );
    }
}

export default AmenitiesList
