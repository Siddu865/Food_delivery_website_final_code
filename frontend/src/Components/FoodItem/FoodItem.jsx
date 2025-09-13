import { useState, useEffect, useRef } from "react";
import "./FoodItem.css";
import Cookies from "js-cookie";
import { useSnackbar } from "notistack";

const FoodItem = ({ details, authStateVersion, isLogin }) => {
  const { enqueueSnackbar } = useSnackbar();
  
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const syncInProgress = useRef(false);

  // Get fresh JWT token on each render to handle dynamic changes
  const jwt_token = Cookies.get("jwt_token");

  // Reset count immediately when logged out
  useEffect(() => {
    if (!jwt_token || !isLogin) {
      console.log(`🚪 User logged out, resetting count for ${details.name}`);
      setCount(0);
      return;
    }
    
    // Fetch cart count when logged in
    const fetchCartCount = async () => {
      console.log(`📡 Fetching cart count for ${details.name}...`);
      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt_token}`,
        },
      };
      try {
        const response = await fetch(
          `http://localhost:5555/eachfooditem/${details._id}`,
          options
        );
        const data = await response.json();
        console.log(`✅ Cart count fetched: ${data} for ${details.name}`);
        setCount(data);
      } catch (error) {
        console.log("❌ Cannot fetch count for", details.name, error);
        setCount(0);
      }
    };
    
    fetchCartCount();
  }, [details._id, jwt_token, isLogin, authStateVersion]); // React to auth changes

  // Sync helper
  const syncWithBackend = async (newCount) => {
    if (!jwt_token) {
      console.log(`🚫 No JWT token, cannot sync for ${details.name}`);
      return;
    }
    
    if (syncInProgress.current) {
      console.log(`⚠️ Sync already in progress for ${details.name}, skipping...`);
      return;
    }
    
    syncInProgress.current = true;
    setIsLoading(true);
    
    console.log(`🔄 SYNC START: ${details.name} -> count: ${newCount}`);
    
    try {
      const payload = { foodId: details._id, count: newCount };
      
      const response = await fetch("http://localhost:5555/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt_token}`,
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`✅ SYNC SUCCESS: ${details.name}`, data);
    } catch (err) {
      console.error(`❌ SYNC FAILED: ${details.name}`, err);
      enqueueSnackbar("Could not sync cart. Please try again.", {
        variant: "error",
      });
      // Revert count on error
      setCount((prev) => {
        const reverted = prev === newCount ? (newCount > 0 ? newCount - 1 : newCount + 1) : prev;
        console.log(`🔄 Reverting count from ${prev} to ${reverted}`);
        return reverted;
      });
    } finally {
      syncInProgress.current = false;
      setIsLoading(false);
      console.log(`🏁 SYNC END: ${details.name}`);
    }
  };

  const increaseCount = () => {
    console.log(`➕ INCREASE CLICKED: ${details.name} (current: ${count})`);
    
    if (!jwt_token) {
      enqueueSnackbar("Please Sign In to Continue", { variant: "error" });
      return;
    }
    
    if (isLoading || syncInProgress.current) {
      console.log(`⚠️ Button click ignored - operation in progress`);
      return;
    }
    
    setCount((prev) => {
      const next = prev + 1;
      console.log(`📈 Count updated: ${details.name} ${prev} -> ${next}`);
      syncWithBackend(next);
      return next;
    });
  };

  const decreaseCount = () => {
    console.log(`➖ DECREASE CLICKED: ${details.name} (current: ${count})`);
    
    if (isLoading || syncInProgress.current) {
      console.log(`⚠️ Button click ignored - operation in progress`);
      return;
    }
    
    setCount((prev) => {
      const next = Math.max(0, prev - 1);
      console.log(`📉 Count updated: ${details.name} ${prev} -> ${next}`);
      syncWithBackend(next);
      return next;
    });
  };

  return (
    <div className="food-item-container">
      <div
        className="food-image-container"
        style={{ backgroundImage: `url('${details.image}')` }}
      >
        {count === 0 ? (
          <button 
            className="add-icon-button" 
            onClick={increaseCount}
            disabled={isLoading}
            style={{ opacity: isLoading ? 0.5 : 1 }}
          >
            <img
              src="https://res.cloudinary.com/ddgdqlgyq/image/upload/v1754125936/add_icon_white_sbyhu8.png"
              alt="add-icon"
              className="add-icon"
            />
          </button>
        ) : (
          <div className="add-product-container">
            <button 
              className="add-icon-button" 
              onClick={decreaseCount}
              disabled={isLoading}
              style={{ opacity: isLoading ? 0.5 : 1 }}
            >
              <img
                src="https://res.cloudinary.com/ddgdqlgyq/image/upload/v1754125936/remove_icon_red_miikmz.png"
                alt="subtract-icon"
                className="add-icon"
              />
            </button>

            <p>{count}</p>
            
            <button 
              className="add-icon-button" 
              onClick={increaseCount}
              disabled={isLoading}
              style={{ opacity: isLoading ? 0.5 : 1 }}
            >
              <img
                src="https://res.cloudinary.com/ddgdqlgyq/image/upload/v1754125936/add_icon_green_er823x.png"
                alt="add-icon"
                className="add-icon"
              />
            </button>
          </div>
        )}
      </div>

      <div className="details-container">
        <h3>{details.name}</h3>
        <p>{details.description}</p>
        <h3 className="price-text">₹{details.price}</h3>
      </div>
    </div>
  );
};

export default FoodItem;