import NavBar from "../components/HomePage/HomeNavBar.tsx";
import HeroSection from "../components/HomePage/HeroSection.tsx";
import HomeFooter from "../components/HomePage/HomeFooter.tsx";

function Home() {
    return (
        <div>
            <NavBar />
            <div className="max-w-7xl mx-auto pt-5 px-6">
                <HeroSection />
                <HomeFooter />
            </div>
        </div>
    );
}

export default Home;
