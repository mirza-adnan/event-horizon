import { useState } from "react";

interface NavbarProps {
	onMenuClick: () => void;
}

function Navbar({ onMenuClick }: NavbarProps) {
	const [showNotifications, setShowNotifications] = useState(false);
	const [showProfile, setShowProfile] = useState(false);

	const notifications = [
		{ id: 1, message: "New event registration", time: "5 minutes ago" },
		{ id: 2, message: "Event starting soon", time: "1 hour ago" },
		{ id: 3, message: "New attendee joined", time: "2 hours ago" },
	];

	return (
		<div className="fixed top-0 left-0 right-0 backdrop-blur-lg border-b border-accent bg-background/80 z-50">
			<div className="flex items-center justify-between px-6 py-4">
				<div className="flex items-center gap-4">
					<button
						onClick={onMenuClick}
						className="text-text-strong hover:bg-fill p-2 rounded-lg transition-colors"
						aria-label="Toggle menu"
					>
						<svg
							className="w-6 h-6"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M4 6h16M4 12h16M4 18h16"
							/>
						</svg>
					</button>
					<h1 className="text-2xl font-bold text-accent tracking-wide jaro">
						Organization Dashboard
					</h1>
				</div>

				<div className="flex items-center gap-4 relative">
					{/* Profile Button */}
					<div className="relative">
						<button
							onClick={() => {
								setShowProfile(!showProfile);
								setShowNotifications(false);
							}}
							className="text-text-weak hover:text-accent transition-colors font-medium"
						>
							Profile
						</button>

						{/* Profile Panel */}
						{showProfile && (
							<div className="absolute right-0 mt-2 w-64 bg-fill border border-accent/30 rounded-lg shadow-lg overflow-hidden">
								<div className="p-4 border-b border-accent/20">
									<div className="flex items-center gap-3">
										<div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center">
											<span className="text-accent font-bold text-xl">
												O
											</span>
										</div>
										<div>
											<h3 className="text-text-strong font-semibold">
												Organization Name
											</h3>
											<p className="text-text-weak text-sm">
												org@email.com
											</p>
										</div>
									</div>
								</div>
								<div className="p-2">
									<button className="w-full text-left px-4 py-2 text-text-weak hover:text-accent hover:bg-background rounded transition-colors">
										Settings
									</button>
									<button className="w-full text-left px-4 py-2 text-text-weak hover:text-accent hover:bg-background rounded transition-colors">
										Billing
									</button>
									<button className="w-full text-left px-4 py-2 text-text-weak hover:text-accent hover:bg-background rounded transition-colors">
										Help & Support
									</button>
									<hr className="my-2 border-accent/20" />
									<button className="w-full text-left px-4 py-2 text-danger hover:bg-danger/10 rounded transition-colors">
										Sign Out
									</button>
								</div>
							</div>
						)}
					</div>

					{/* Notification Button */}
					<div className="relative">
						<button
							onClick={() => {
								setShowNotifications(!showNotifications);
								setShowProfile(false);
							}}
							className="relative text-text-weak hover:text-accent p-2 hover:bg-fill rounded-lg transition-colors"
						>
							<svg
								className="w-6 h-6"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
								/>
							</svg>
							{/* Notification Badge */}
							<span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
						</button>

						{/* Notifications Panel */}
						{showNotifications && (
							<div className="absolute right-0 mt-2 w-80 bg-fill border border-accent/30 rounded-lg shadow-lg overflow-hidden">
								<div className="p-4 border-b border-accent/20 flex justify-between items-center">
									<h3 className="text-text-strong font-semibold">
										Notifications
									</h3>
									<button className="text-accent text-sm hover:underline">
										Mark all as read
									</button>
								</div>
								<div className="max-h-96 overflow-y-auto">
									{notifications.map((notif) => (
										<div
											key={notif.id}
											className="p-4 border-b border-accent/10 hover:bg-background transition-colors cursor-pointer"
										>
											<p className="text-text-strong text-sm">
												{notif.message}
											</p>
											<p className="text-text-weak text-xs mt-1">
												{notif.time}
											</p>
										</div>
									))}
								</div>
								<div className="p-3 text-center border-t border-accent/20">
									<button className="text-accent text-sm hover:underline">
										View all notifications
									</button>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Backdrop to close panels when clicking outside */}
			{(showNotifications || showProfile) && (
				<div
					className="fixed inset-0 z-[-1]"
					onClick={() => {
						setShowNotifications(false);
						setShowProfile(false);
					}}
				/>
			)}
		</div>
	);
}

export default Navbar;
