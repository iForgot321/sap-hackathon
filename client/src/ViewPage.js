import React, {Component} from 'react'

class ViewPage extends Component {
    state = {
        amenities: [],
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
        return (
            <div className="ViewPage">
                {
                    this.state.amenities.map((amenity) => (
                        <Amenity key={amenity.id} amenity={amenity}/>
                    ))
                }
            </div>
        );
    }
}

/**
 * Props: amenity
 */
class Amenity extends Component {
    render() {
        const amenity = this.props.amenity;
        return (
            <div className="card shadow-sm mb-2 w-100">
                <div className="card-body">
                    <h5 className="card-title">{amenity.name}</h5>
                    <h6 className="card-subtitle mb-2 text-muted">Location: {amenity.room}</h6>
                    <CurrentUsage people={amenity.people} />
                </div>
            </div>
        );
    }
}

/**
 * Props: people
 */
class CurrentUsage extends Component {
    render() {
        const defaultProfilePicture = "https://t4.ftcdn.net/jpg/00/64/67/63/360_F_64676383_LdbmhiNM6Ypzb3FM4PPuFP9rHe7ri8Ju.jpg";
        if (this.props.people.length > 0) {
            return (
                <div className="d-flex flex-row gap-1 align-items-center">
                    {
                        this.props.people.map((person) => (
                            <img
                                style={{width: "2em", height: "2em", padding: 0}}
                                className="img-thumbnail rounded-circle"
                                key={person.email}
                                src={person.image ? person.image : defaultProfilePicture}
                                alt={`Profile picture of ${person.name}`}>
                            </img>
                        ))
                    }
                    <div className="text-muted">
                        are here
                    </div>
                </div>
            );
        } else {
            return (
                <div>
                    No one here yet!
                </div>
            );
        }
    }
}

export default ViewPage
