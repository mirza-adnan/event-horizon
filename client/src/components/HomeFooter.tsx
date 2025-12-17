
const HomeFooter = () => {
    return(
        <footer className="mt-20 border-t py-10 border-accent text-center">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div>
                    <h4 className="font-semibold text-text-strong mb-4">Platform</h4>
                    <ul className="space-y-2">
                        <li><a className="text-gray-light hover:text-accent hover:cursor-pointer">About Us</a></li>
                        <li><a className="text-gray-light hover:text-accent hover:cursor-pointer">Contact Us</a></li>
                        <li><a className="text-gray-light hover:text-accent hover:cursor-pointer">Reviews</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-semibold text-text-strong mb-4">For Participants</h4>
                    <ul className="space-y-2">
                        <li><a className="text-gray-light hover:text-accent hover:cursor-pointer">Browse Competitions</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-semibold text-text-strong mb-4">For Organizers</h4>
                    <ul className="space-y-2">
                        <li><a className="text-gray-light hover:text-accent hover:cursor-pointer">Requirements</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-semibold text-text-strong mb-4">Legal</h4>
                    <ul className="space-y-2">
                        <li><a className="text-gray-light hover:text-accent hover:cursor-pointer">Privacy Policy</a></li>
                        <li><a className="text-gray-light hover:text-accent hover:cursor-pointer">Terms of Service</a></li>
                        <li><a className="text-gray-light hover:text-accent hover:cursor-pointer">Cookie Policy</a></li>
                    </ul>
                </div>
            </div>
        </footer>
    );
};

export default HomeFooter;