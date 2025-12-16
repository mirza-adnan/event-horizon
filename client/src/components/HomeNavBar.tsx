
const NavBar = () => {
    return (
        <nav className="sticky top-0 z-50 py-3 backdrop-blur-lg border-b border-neutral-700/80">
            <div className="container px-4 mx-auto relative text-sm">
                <div className="flex justify-between items-center">
                    <div className="flex items-center flex-shrink-0">
                        <span className="text-xl tracking-tight hover:cursor-pointer">Event Horizon</span>
                    </div>
                    <ul className="hidden lg:flex ml-14 space-x-12">
                        <li className="hover:cursor-pointer hover:border-b ease-in-out duration-100">About Us</li>
                        <li className="hover:cursor-pointer hover:border-b ease-in-out duration-100">Features</li>
                        <li className="hover:cursor-pointer hover:border-b ease-in-out duration-100">Contact Us</li>
                    </ul>
                    <div className="hidden lg:flex justify-center space-x-12 items-center">
                        <a className="px-3 py-2 border rounded-md hover:bg-white hover:text-black ease-in-out hover:cursor-pointer">
                            Sign In
                        </a>
                        <a className="px-3 py-2 border-0">
                            EN 🌐︎
                        </a>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default NavBar;