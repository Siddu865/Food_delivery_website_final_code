import { useEffect, useState } from "react";
import { TailSpin } from "react-loader-spinner";
import Menu from "../Menu/Menu";
import "./MenuCard.css";

const MenuCard = (props) => {
  const [loading, setLoading] = useState(true);
  const [menuDetails, setMenuDetails] = useState([]);
  const [selectedMenuId, setSelectedMenuId] = useState(null);
  const { changeSelectedItem } = props;
  const changeSelectedMenuId = (id) => {
    if (id === selectedMenuId) {
      setSelectedMenuId(null);
    } else {
      setSelectedMenuId(id);
    }
  };
  useEffect(() => {
    const apiFunction = async () => {
      try {
        let url = "http://localhost:5555/menu";
        const response = await fetch(url);
        const data = await response.json();
        if (response.ok === true) {
          setMenuDetails(data);
          setLoading(false);
        } else {
          console.log("Something went wrong");
        }
      } catch (error) {
        console.log("something went wrong");
        console.log(error);
      }
    };
    apiFunction();
  }, []);
  return loading ? (
    <div data-testid="loader">
      <TailSpin height="80" width="80" type="threedots" color="orange" />
    </div>
  ) : (
    <div className="menu-card-container">
      {menuDetails.map((eachItem) => (
        <Menu
          changeSelectedItem={changeSelectedItem}
          selectedMenuId={selectedMenuId}
          changeSelectedMenuId={changeSelectedMenuId}
          key={eachItem._id}
          details={eachItem}
        />
      ))}
    </div>
  );
};

export default MenuCard;
