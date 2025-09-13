import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import Header from "../Header/Header";
import MenuCard from "../MenuCard/MenuCard";
import "./HomePage.css";
import FoodItemsList from "../FoodItemsList/FoodItemsList";
import { TiSocialTwitter } from "react-icons/ti";
import { CiFacebook, CiLinkedin } from "react-icons/ci";
import Scrollbar from "smooth-scrollbar";




const HomePage = () => {
  const [selectedMenuItem, setSelectedMenuItem] = useState("fooditems");
  const [activeSection, setActiveSection] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLogin, setIsLogin] = useState(false);

  // Add auth state tracker to force FoodItems re-render on auth changes
  const [authStateVersion, setAuthStateVersion] = useState(0);

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    setActiveSection("foodItems");
    foodItemsRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleLogin = useCallback((status) => {
    console.log("Auth status change:", status);

    if (status === "logout") {
      setIsLogin(false);
      // Increment version to force FoodItem components to reset
      setAuthStateVersion((prev) => prev + 1);
    } else if (status === "login") {
      setIsLogin(true);
      // Increment version to force FoodItem components to re-fetch data
      setAuthStateVersion((prev) => prev + 1);
    }
  }, []);

  const homeRef = useRef(null);
  const menuRef = useRef(null);
  const foodItemsRef = useRef(null);
  const contactRef = useRef(null);

  const changeSelectedItem = (name) => {
    setSelectedMenuItem("fooditems" + name);
  };

  const scrollToSection = useCallback((section) => {
    setActiveSection(section);

    if (section === "home")
      homeRef.current?.scrollIntoView({ behavior: "smooth" });
    else if (section === "menu")
      menuRef.current?.scrollIntoView({ behavior: "smooth" });
    else if (section === "foodItems")
      foodItemsRef.current?.scrollIntoView({ behavior: "smooth" });
    else if (section === "contact")
      contactRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    const options = {
      root: null,
      threshold: 0.2,
      rootMargin: "-50px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      let mostVisibleEntry = null;

      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (
            !mostVisibleEntry ||
            entry.intersectionRatio > mostVisibleEntry.intersectionRatio
          ) {
            mostVisibleEntry = entry;
          }
        }
      });

      if (mostVisibleEntry) {
        setActiveSection(mostVisibleEntry.target.id);
      }
    }, options);

    const sections = [homeRef, menuRef, foodItemsRef, contactRef];
    sections.forEach((ref) => {
      if (ref.current) {
        observer.observe(ref.current);
      }
    });

    return () => {
      sections.forEach((ref) => {
        if (ref.current) observer.unobserve(ref.current);
      });
    };
  }, []);

  const headerProps = useMemo(
    () => ({
      scrollToSection,
      activeSection,
      onSearch: handleSearch,
      handleLogin,
    }),
    [scrollToSection, activeSection, handleSearch, handleLogin]
  );

  const foodItemsProps = useMemo(
    () => ({
      selectedMenuItem,
      searchQuery,
      // Pass auth state version to force re-renders on auth changes
      authStateVersion,
      isLogin,
    }),
    [selectedMenuItem, searchQuery, authStateVersion, isLogin]
  );

  return (
    <div className="home-page">
      <Header {...headerProps} />

      {/* ---------- HOME Section ---------- */}
      <div ref={homeRef} id="home" className="home-page-top-container">
        <h1>
          Order your <br /> favourite food here
        </h1>
        <p>
          Choose from diverse menu featuring a detectable array of dishes <br />
          crafted with the finest ingredients and culinary expertise.
        </p>
      </div>

      {/* ---------- MENU Section ---------- */}
      <div ref={menuRef} id="menu">
        <h1 className="home-page-heading">Explore Our Menu</h1>
        <p>
          Choose from a diverse menu featuring a delectable array of dishes. Our
          mission is to satisfy your cravings and elevate your dining
          experience, one delicious meal at a time.
        </p>
        <MenuCard changeSelectedItem={changeSelectedItem} />
      </div>

      {/* ---------- FOOD ITEMS Section ---------- */}
      <div ref={foodItemsRef} id="foodItems">
        <hr className="separator" />
        <h1 className="home-page-heading">Top dishes near you</h1>
        <FoodItemsList {...foodItemsProps} />
      </div>

      {/* ---------- CONTACT Section ---------- */}
      <footer ref={contactRef} id="contact" className="footer">
        <div className="footer-container">
          <div className="footer-section about">
            <h2 className="logo">Tomato.</h2>
            <p>
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry. Lorem Ipsum has been the industry's standard dummy text
              ever since the 1500s.
            </p>
            <div className="social-icons">
              <CiFacebook />
              <TiSocialTwitter />
              <CiLinkedin />
            </div>
          </div>

          <div className="footer-section company">
            <h3>COMPANY</h3>
            <ul>
              <li>Home</li>
              <li>About us</li>
              <li>Delivery</li>
              <li>Privacy policy</li>
            </ul>
          </div>

          <div className="footer-section contact">
            <h3>GET IN TOUCH</h3>
            <p>+1-212-456-7890</p>
            <p>contact@tomato.dev</p>
          </div>
        </div>
        <hr />
        <p className="footer-bottom">
          Copyright © 2024 Tomato.com - All Rights Reserved.
        </p>
      </footer>
    </div>
  );
};

export default HomePage;
