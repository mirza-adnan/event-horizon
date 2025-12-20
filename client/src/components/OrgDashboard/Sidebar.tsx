import { Link, NavLink } from "react-router-dom";

function Sidebar() {
	const isActive = true;
	const activeLink =
		"flex item-center gap-5 pl-4 pt-3 pb-2.5 rounded-lg text-white text-md m-2 hover:bg-gray-700 hover:text-gray-100 transition colors";
	const normalLink =
		"flex item-center gap-5 pl-4 pt-3 pb-2.5 rounded-lg text-md text-gray-400 hover:text-white m-2 transition colors";

	const links = [
		{
			title: "Events",
			links: [
				{
					name: "Create Event",
					link: "/create-event",
				},
				{
					name: "Current Events",
					link: "/current-events",
				},
				{
					name: "Event History",
					link: "/event-history",
				},
			],
		},
	];

	return (
		<div className="ml-3 h-screen md:overflow-hidden overflow-auto md:hover:overflow-auto pb-10">
			<div className="flex justify-between items-center">
				<Link
					to="/"
					onClick={() => {}}
					className="items-center gap-3 ml-3 mt-4 flex text-xl font-extrabold tracking-tight text-white"
				>
					<span>Sidebar</span>
				</Link>
			</div>

			<div className="mt-10">
				{links.map((item) => (
					<div key={item.title}>
						<p className="text-gray-400 m-3 mt-4 uppercase">
							{item.title}
						</p>
						{item.links.map((link) => (
							<NavLink
								key={link.link}
								to={link.link}
								onClick={() => {}}
								className={({ isActive }) =>
									isActive ? activeLink : normalLink
								}
							>
								<span className="capitalize">{link.name}</span>
							</NavLink>
						))}
					</div>
				))}
			</div>
		</div>
	);
}

export default Sidebar;
