import React, {Component, useState} from 'react'

class AmenitiesList extends Component {
    state = {
        amenities: [],
        availability: "",
        searchString: "",
    };

    async componentDidMount() {
        await this.fetchAmenities()
    }

    fetchAmenities = async () => {
        const response = await fetch(`/api/amenities`);
        const responseJson = await response.json();
        const amenities = responseJson.amenities;
        this.setState({amenities: amenities});
    };

    render() {
        const searchString = this.state.searchString;
        const availability = this.state.availability;

        const filteredByName = this.state.amenities.filter((amenity) => {
            return !searchString || amenity.name.toLowerCase().includes(searchString.toLowerCase());
        });
        const filteredByAvailability = filteredByName.filter((amenity) => {
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
                        <option value={""}>- Availability -</option>
                        <option value={"available"}>Find available</option>
                        <option value={"unavailable"}>Find unavailable</option>
                    </select>
                    <input
                        className="form-control"
                        type="search"
                        value={searchString}
                        placeholder={"Search for something to do!"}
                        onChange={(evt) => this.setState({searchString: evt.target.value})}
                    />
                </div>
                <div className="overflow-scroll" style={{height: "25em"}}>
                    {
                        finalAmenitiesList.map((amenity) => (
                            <Amenity key={amenity.id} amenity={amenity} here={false}/>
                        ))
                    }
                </div>
            </div>
        );
    }
}

/**
 * Props: amenity, here
 */
class Amenity extends Component {
    render() {
        const amenity = this.props.amenity;
        const here = this.props.here;
        return (
            <div className="card shadow-sm my-2 w-100">
                <div className="row g-0">
                    <div className="col-md-4">
                        <img
                            src={amenity.image}
                            className="img-fluid rounded-start"
                            alt={`Photo of ${amenity.name}`} />
                    </div>
                    <div className="col-md-8">
                        <div className="card-body">
                            {
                                here &&
                                <div className="card-text text-muted">
                                    <small>You are here!</small>
                                </div>
                            }
                            <div className="d-flex flex-row justify-content-between">
                                <h5 className="card-title fw-bolder">{amenity.name}</h5>
                                {
                                    here ?
                                        <button className="btn btn-sm btn-danger">Tap out
                                            <i className="bi bi-box-arrow-right ms-1"></i>
                                        </button> :
                                        <button className="btn btn-sm btn-primary">Tap in
                                            <i className="bi bi-box-arrow-in-right ms-1"></i>
                                        </button>
                                }
                            </div>
                            <h6 className="card-subtitle mb-2 fw-normal">Located in: {amenity.room}</h6>
                            <CurrentUsage people={amenity.people} />
                        </div>
                    </div>
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
                    <small className="ms-1">{this.getListOfNamesUsing()}</small>
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
