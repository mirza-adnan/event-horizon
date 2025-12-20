import { useState } from "react";
import Navbar from "../components/OrgDashboard/Navbar";
import Sidebar from "../components/OrgDashboard/Sidebar";

function OrgDashboard() {
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);

	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen);
	};

	return (
		<div className="min-h-screen bg-gray-900">
			<Navbar onMenuClick={toggleSidebar} />

			<div className="flex pt-16">
				{/* Sidebar with conditional rendering */}
				<div
					className={`fixed left-0 top-16 h-full bg-gray-800 transition-transform duration-300 ease-in-out z-40 ${
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
					<h2 className="text-2xl font-bold text-white mb-4">
						Welcome to your Dashboard
					</h2>
					{/* Main content here */}
				</div>
			</div>
		</div>
	);
}

export default OrgDashboard;
