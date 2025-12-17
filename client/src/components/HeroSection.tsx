import LinkButton from "./LinkButton";

function HeroSection() {
    return (
        <div className="flex flex-col items-center justify-start min-h-screen text-center mt-32">
            <h1 className="text-8xl font-bold mb-4 bg-gradient-to-r from-accent to-green-400 text-transparent bg-clip-text">
                Event Horizon
            </h1>
            <h2 className="text-3xl font-bold text-text-strong mb-4">
                Your Centralized Event Platform
            </h2>
            <p className="text-xl text-text-weak mb-8 max-w-2xl">
                Discover, organize, and register for events, from institutional
                gatherings to multi-segment conferences.
            </p>
            <div className="flex gap-4 justify-center items-center">
                <LinkButton
                    variant="primary"
                    path="/signup"
                >
                    Sign Up Today
                </LinkButton>
                <LinkButton
                    variant="tertiary"
                    path="organizers/registration"
                >
                    Join as an Organizer
                </LinkButton>
            </div>
        </div>
    );
};

export default HeroSection;