import { useState } from "react";
import Navbar from "../components/OrgDashboard/Navbar";
import Sidebar from "../components/OrgDashboard/Sidebar";

function OrgDashboard() {
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);

	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen);
	};

	return (
		<div className="min-h-screen bg-background">
			<Navbar onMenuClick={toggleSidebar} />

			<div className="flex pt-16">
				{/* Sidebar with conditional rendering */}
				<div
					className={`fixed left-0 top-16 h-full bg-fill border-r border-accent/20 transition-transform duration-300 ease-in-out z-40 ${
						isSidebarOpen ? "translate-x-0" : "-translate-x-full"
					}`}
					style={{ width: "250px" }}
				>
					<Sidebar />
				</div>

				{/* Overlay for mobile */}
				{isSidebarOpen && (
					<div
						className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
						onClick={toggleSidebar}
					/>
				)}

				{/* Main content area */}
				<div
					className={`flex-1 p-6 transition-all duration-300 ${
						isSidebarOpen ? "md:ml-64" : ""
					}`}
				>
					<h2 className="text-3xl font-bold text-text-strong mb-6">
						Welcome to your Dashboard
					</h2>

					{/* Current Events Section */}
					<section className="mb-8">
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-2xl font-semibold text-accent">
								Your Current Events
							</h3>
							<button className="text-text-weak hover:text-accent text-sm transition-colors">
								View All →
							</button>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{/* Event Card 1 */}
							<div className="bg-fill border border-accent/20 rounded-lg p-5 hover:border-accent/40 transition-all hover:shadow-lg">
								<div className="flex items-start justify-between mb-3">
									<span className="px-3 py-1 bg-success/20 text-success rounded-full text-xs font-semibold">
										Active
									</span>
									<span className="text-text-weak text-sm">
										Dec 25, 2025
									</span>
								</div>
								<h4 className="text-xl font-bold text-text-strong mb-2">
									Tech Conference 2025
								</h4>
								<p className="text-text-weak text-sm mb-4 line-clamp-2">
									Annual technology conference featuring the
									latest innovations in AI and software
									development.
								</p>
								<div className="flex items-center justify-between text-sm">
									<span className="text-text-weak">
										👥 250 Registered
									</span>
									<button className="text-accent hover:underline font-medium">
										Manage
									</button>
								</div>
							</div>

							{/* Event Card 2 */}
							<div className="bg-fill border border-accent/20 rounded-lg p-5 hover:border-accent/40 transition-all hover:shadow-lg">
								<div className="flex items-start justify-between mb-3">
									<span className="px-3 py-1 bg-info/20 text-info rounded-full text-xs font-semibold">
										Upcoming
									</span>
									<span className="text-text-weak text-sm">
										Jan 15, 2026
									</span>
								</div>
								<h4 className="text-xl font-bold text-text-strong mb-2">
									Workshop: Web Development
								</h4>
								<p className="text-text-weak text-sm mb-4 line-clamp-2">
									Hands-on workshop covering modern web
									development practices and frameworks.
								</p>
								<div className="flex items-center justify-between text-sm">
									<span className="text-text-weak">
										👥 75 Registered
									</span>
									<button className="text-accent hover:underline font-medium">
										Manage
									</button>
								</div>
							</div>

							{/* Event Card 3 */}
							<div className="bg-fill border border-accent/20 rounded-lg p-5 hover:border-accent/40 transition-all hover:shadow-lg">
								<div className="flex items-start justify-between mb-3">
									<span className="px-3 py-1 bg-success/20 text-success rounded-full text-xs font-semibold">
										Active
									</span>
									<span className="text-text-weak text-sm">
										Dec 28, 2025
									</span>
								</div>
								<h4 className="text-xl font-bold text-text-strong mb-2">
									Networking Meetup
								</h4>
								<p className="text-text-weak text-sm mb-4 line-clamp-2">
									Connect with professionals in the tech
									industry and expand your network.
								</p>
								<div className="flex items-center justify-between text-sm">
									<span className="text-text-weak">
										👥 120 Registered
									</span>
									<button className="text-accent hover:underline font-medium">
										Manage
									</button>
								</div>
							</div>
						</div>
					</section>

					{/* Explore Events Section */}
					<section>
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-2xl font-semibold text-accent">
								Explore Other Events
							</h3>
							<button className="text-text-weak hover:text-accent text-sm transition-colors">
								See More →
							</button>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{/* Explore Event Card 1 */}
							<div className="bg-fill border border-accent/20 rounded-lg p-5 hover:border-accent/40 transition-all hover:shadow-lg">
								<div className="flex items-start justify-between mb-3">
									<span className="px-3 py-1 bg-accent/20 text-accent rounded-full text-xs font-semibold">
										Featured
									</span>
									<span className="text-text-weak text-sm">
										Jan 5, 2026
									</span>
								</div>
								<h4 className="text-xl font-bold text-text-strong mb-2">
									Startup Pitch Competition
								</h4>
								<p className="text-text-weak text-sm mb-3 line-clamp-2">
									Watch innovative startups pitch their ideas
									to industry leaders and investors.
								</p>
								<div className="flex items-center gap-2 mb-4">
									<div className="w-6 h-6 bg-accent/30 rounded-full"></div>
									<span className="text-text-weak text-xs">
										Tech Ventures Inc.
									</span>
								</div>
								<div className="flex items-center justify-between text-sm">
									<span className="text-text-weak">
										👥 500+ Attending
									</span>
									<button className="text-accent hover:underline font-medium">
										Learn More
									</button>
								</div>
							</div>

							{/* Explore Event Card 2 */}
							<div className="bg-fill border border-accent/20 rounded-lg p-5 hover:border-accent/40 transition-all hover:shadow-lg">
								<div className="flex items-start justify-between mb-3">
									<span className="px-3 py-1 bg-accent/20 text-accent rounded-full text-xs font-semibold">
										Featured
									</span>
									<span className="text-text-weak text-sm">
										Jan 10, 2026
									</span>
								</div>
								<h4 className="text-xl font-bold text-text-strong mb-2">
									Design Summit 2026
								</h4>
								<p className="text-text-weak text-sm mb-3 line-clamp-2">
									Explore the future of design with leading
									designers and creative professionals.
								</p>
								<div className="flex items-center gap-2 mb-4">
									<div className="w-6 h-6 bg-accent/30 rounded-full"></div>
									<span className="text-text-weak text-xs">
										Creative Studios
									</span>
								</div>
								<div className="flex items-center justify-between text-sm">
									<span className="text-text-weak">
										👥 350+ Attending
									</span>
									<button className="text-accent hover:underline font-medium">
										Learn More
									</button>
								</div>
							</div>

							{/* Explore Event Card 3 */}
							<div className="bg-fill border border-accent/20 rounded-lg p-5 hover:border-accent/40 transition-all hover:shadow-lg">
								<div className="flex items-start justify-between mb-3">
									<span className="px-3 py-1 bg-accent/20 text-accent rounded-full text-xs font-semibold">
										Featured
									</span>
									<span className="text-text-weak text-sm">
										Jan 20, 2026
									</span>
								</div>
								<h4 className="text-xl font-bold text-text-strong mb-2">
									Data Science Workshop
								</h4>
								<p className="text-text-weak text-sm mb-3 line-clamp-2">
									Learn advanced data science techniques and
									machine learning algorithms.
								</p>
								<div className="flex items-center gap-2 mb-4">
									<div className="w-6 h-6 bg-accent/30 rounded-full"></div>
									<span className="text-text-weak text-xs">
										Data Analytics Co.
									</span>
								</div>
								<div className="flex items-center justify-between text-sm">
									<span className="text-text-weak">
										👥 200+ Attending
									</span>
									<button className="text-accent hover:underline font-medium">
										Learn More
									</button>
								</div>
							</div>
						</div>
					</section>
				</div>
			</div>
		</div>
	);
}

export default OrgDashboard;
