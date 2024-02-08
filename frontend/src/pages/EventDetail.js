import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";

import { DEMO_EVENTS } from "./data";

function EventDetail() {
	const params = useParams();
	const event = DEMO_EVENTS.find(event => event.id === params.id); // Find event with matching id
	// const event = getEventById(params.id); // Fetch event data from the server using the ID - check it for later

	return (
		<>
			<h1>Event Detail</h1>
			<p>Event ID: {event.id}</p>
			<p>Event Title: {event.title}</p>
			<p>Event description: {event.description}</p>
			<p><Link to="..">Back</Link></p>
		</>
	);
}

export default EventDetail;

/*useParams = from react-router-dom, it returns an object of key/value pairs of URL parameters that we can access.*/