
const LoginSignup = () => {
    return (
        <div className = "container">
            <div className="header">
                <div className = "text" >Sign Up</div>
                <div className="underline"></div>
            </div>
            <div className = "inputs">
                <div className="input">
                    {/* <img src ={} alt=""/> */}
                    <input type="text" />                    
                </div>
                <div className="input">
                    {/* <img src ={} alt=""/> */}
                    <input type="email" />                    
                </div>
                <div className="input">
                    {/* <img src ={} alt=""/> */}
                    <input type="password" />                    
                </div>
            </div>
            <div className="forgot-password">Lost Password ?</div>
            <div className="submit-container">
                <div className="submit">Sign Up</div> 
                <div className="submit">Login</div>  
            </div>
        </div>
    )
}


export default LoginSignup;