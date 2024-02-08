import { Link } from "react-router-dom";


import { DEMO_EVENTS } from "./data";

function Events() {
	return (
		<>
			<h1>Profile</h1>
			<ul> 
				{DEMO_EVENTS.map(event => 
				<li key={event.id}>
					{/* <Link to={`/event/${event.id}`}></Link> */}
					<Link to={event.id} relative="path">{event.title} </Link>
				</li>)}
			</ul>
			
		</>
	);
}

export default Events;