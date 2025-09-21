import { useState, useEffect } from "react";
import { ClipLoader } from "react-spinners";
import "./FoodItemsList.css";
import FoodItem from "../FoodItem/FoodItem";

const FoodItemsList = ({ selectedMenuItem, searchQuery, authStateVersion, isLogin }) => {
  const [loading, setLoading] = useState(true);
  const [foodItems, setFoodItems] = useState([]);
  const baseUrl = "http://localhost:5555/fooditems";

  useEffect(() => {
    const apiFunction = async () => {
      try {
        let fetchUrl = baseUrl;

        // If search is active → use search param
        if (searchQuery && searchQuery.trim() !== "") {
          fetchUrl = `${baseUrl}?search=${encodeURIComponent(searchQuery)}`;
        } 
        // Else if menu category is selected → fetch category
        else if (selectedMenuItem !== "fooditems") {
          fetchUrl = `http://localhost:5555/${selectedMenuItem}`;
        }

        const response = await fetch(fetchUrl);
        const data = await response.json();
        if (response.ok) {
          setLoading(false);
          setFoodItems(data);
        } else {
          console.log("Something went wrong");
        }
      } catch (error) {
        console.log(error);
      }
    };
    apiFunction();
  }, [selectedMenuItem, searchQuery]);

  return loading ? (
    <div data-testid="loader" style={{ display: "flex", justifyContent: "center", marginTop: "2rem" }}>
      <ClipLoader size={80} color="orange" />
    </div>
  ) : (
    <div className="food-items-container">
      {foodItems.map((eachItem) => (
        <FoodItem 
          key={`${eachItem._id}-${authStateVersion}`} // Force re-mount on auth changes
          details={eachItem}
          authStateVersion={authStateVersion}
          isLogin={isLogin}
        />
      ))}
    </div>
  );
};

export default FoodItemsList;
