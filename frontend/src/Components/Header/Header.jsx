import { useState, useEffect, useRef } from "react";
import "./Header.css";
import Popup from "reactjs-popup";
import { useSnackbar } from "notistack";
import Cookies from "js-cookie";
import { useNavigate, useLocation } from "react-router-dom";
import { IoMdCube } from "react-icons/io";

const Header = ({ scrollToSection, activeSection, onSearch, handleLogin }) => {
  const [registered, setRegistered] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const { enqueueSnackbar } = useSnackbar();
  const [isLogin, setIsLogin] = useState(false);

  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  // Ref to control popup programmatically
  const popupRef = useRef();

  const searchButtonClassName = showSearch
    ? "search-button-active"
    : "search-button-inactive";

  // check login state on mount
  useEffect(() => {
    const token = Cookies.get("jwt_token");
    if (token) {
      setIsLogin(true);
      // Safely call handleLogin only if it's a function
      if (typeof handleLogin === 'function') {
        handleLogin("login");
      }
    }
  }, []); // Remove handleLogin from dependency array to avoid infinite loops

  // ---------- AUTH FUNCTIONS ----------
  const handleRegisterSubmit = async (e, close) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5555/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      if (response.ok) {
        enqueueSnackbar("Registration successful! Please log in.", {
          variant: "success",
        });
        setRegistered(true); // switch to login view
        setUsername("");
        setEmail("");
        setPassword("");
        close();
      } else {
        const msg = await response.text();
        enqueueSnackbar(msg || "Registration failed", { variant: "error" });
      }
    } catch (error) {
      enqueueSnackbar("Server error during registration", { variant: "error" });
    }
  };

  const handleLoginSubmit = async (e, close) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5555/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loginUsername, loginPassword }),
      });

      if (response.ok) {
        const data = await response.json();
        Cookies.set("jwt_token", data.jwt_token, { expires: 1 });
        enqueueSnackbar("Login successful", { variant: "success" });
        setIsLogin(true);
        setLoginUsername("");
        setLoginPassword("");
        close();
        
        // Safely call handleLogin only if it's a function
        if (typeof handleLogin === 'function') {
          handleLogin("login");
        }
      } else {
        const msg = await response.text();
        enqueueSnackbar(msg || "Login failed", { variant: "error" });
      }
    } catch (error) {
      console.log(error);
      enqueueSnackbar("Server error during login", { variant: "error" });
    }
  };

  const handleSignOut = () => {
    Cookies.remove("jwt_token");
    navigate('/')
    // Safely call handleLogin only if it's a function
    if (typeof handleLogin === 'function') {
      handleLogin("logout");
    }
    enqueueSnackbar("Account Signed out", { variant: "success" });
    setIsLogin(false);
  };

  // ---------- NAVIGATION ----------
  const goToCartPage = () => {
    if (isLogin) {
      navigate("/cart");
    } else {
      enqueueSnackbar("Please sign in to view your cart", { variant: "info" });
      // Programmatically open the login popup
      if (popupRef.current) {
        popupRef.current.open();
      }
    }
  };

  const goToOrdersPage = () => {
    if (isLogin) {
      navigate("/orders");
    } else {
      enqueueSnackbar("Please sign in to view your orders", { variant: "info" });
      // Programmatically open the login popup
      if (popupRef.current) {
        popupRef.current.open();
      }
    }
  };

  // ---------- SEARCH ----------
  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(searchQuery);
  };

  const clearSearch = () => {
    setSearchQuery("");
    if (onSearch) onSearch("");
  };

  const getButtonClass = (section) => {
    return activeSection === section
      ? "filter-buttons active"
      : "filter-buttons";
  };

  return (
    <div className="header-container">
      <img
        src="https://res.cloudinary.com/ddgdqlgyq/image/upload/v1754064059/logo_q15roi.png"
        alt="Tomato"
        className="logo"
      />

      {/* If on homepage show 4 buttons, otherwise show "Go Back" */}
      <div className="header-buttons">
        {location.pathname === "/" ? (
          <>
            <button
              className={getButtonClass("home")}
              onClick={() => scrollToSection("home")}
            >
              Home
            </button>
            <button
              className={getButtonClass("menu")}
              onClick={() => scrollToSection("menu")}
            >
              Menu
            </button>
            <button
              className={getButtonClass("foodItems")}
              onClick={() => scrollToSection("foodItems")}
            >
              Food Items
            </button>
            <button
              className={getButtonClass("contact")}
              onClick={() => scrollToSection("contact")}
            >
              Contact Us
            </button>
          </>
        ) : (
          <button
            className="filter-buttons active"
            onClick={() => navigate("/")}
          >
            Go Back To Home
          </button>
        )}
      </div>

      <div className="header-icons">
        {/* Search */}
        <div className="search-container">
          <button className={searchButtonClassName}>
            <img
              src="https://res.cloudinary.com/ddgdqlgyq/image/upload/v1754064077/search_icon_hdc7se.png"
              alt="search"
              onClick={() => setShowSearch((prev) => !prev)}
              style={{ cursor: "pointer" }}
            />
          </button>

          {showSearch && (
            <form onSubmit={handleSearch} className="search-form">
              <input
                type="text"
                value={searchQuery}
                placeholder="Search food by name or category..."
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="search-btn">
                Go
              </button>
              <button type="button" onClick={clearSearch} className="clear-btn">
                ✖
              </button>
            </form>
          )}
        </div>

        {/* Cart */}
        <button onClick={goToCartPage} className="cart-button">
          <img
            src="https://res.cloudinary.com/ddgdqlgyq/image/upload/v1754064058/basket_icon_bhrzta.png"
            alt="cart"
          />
        </button>

        {/* Orders */}
        <button onClick={goToOrdersPage} className="orders-button">
          <IoMdCube className="orders-icon" />
        </button>

        {/* Auth */}
        {!isLogin ? (
          <Popup
            ref={popupRef}
            trigger={<button className="login-button">Sign In / Sign Up</button>}
            modal
            nested
          >
            {(close) => (
              <div className="popup-form">
                {registered ? (
                  <>
                    <div className="sign-in-top-container">
                      <h2>Login</h2>
                      <button
                        className="sign-in-close-button"
                        onClick={() => close()}
                      >
                        <img
                          src="https://res.cloudinary.com/ddgdqlgyq/image/upload/v1754125936/cross_icon_fl61df.png"
                          alt="close"
                        />
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Username"
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                    />
                    <button onClick={(e) => handleLoginSubmit(e, close)}>
                      Login
                    </button>
                    <p>
                      Don't have an account?{" "}
                      <span
                        style={{ cursor: "pointer", color: "blue" }}
                        onClick={() => setRegistered(false)}
                      >
                        Register
                      </span>
                    </p>
                  </>
                ) : (
                  <>
                    <div className="sign-in-top-container">
                      <h2>Register</h2>
                      <button
                        className="sign-in-close-button"
                        onClick={() => close()}
                      >
                        <img
                          src="https://res.cloudinary.com/ddgdqlgyq/image/upload/v1754125936/cross_icon_fl61df.png"
                          alt="close"
                        />
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button onClick={(e) => handleRegisterSubmit(e, close)}>
                      Register
                    </button>
                    <p>
                      Already have an account?{" "}
                      <span
                        style={{ cursor: "pointer", color: "blue" }}
                        onClick={() => setRegistered(true)}
                      >
                        Login
                      </span>
                    </p>
                  </>
                )}
              </div>
            )}
          </Popup>
        ) : (
          <button onClick={handleSignOut} className="sign-out-button">
            Sign Out
          </button>
        )}
      </div>
    </div>
  );
};

export default Header;