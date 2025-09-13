import React from "react";
import "./Menu.css";
import { useState, useEffect } from "react";

const Menu = (props) => {
  const [isSelected, setIsSelected] = useState(false);
  const { details, changeSelectedItem,selectedMenuId,changeSelectedMenuId } = props;
  const classname = selectedMenuId===details._id
    ? "menu-item-container-button-selected"
    : "menu-item-container-button-not-selected";
  const handleMenuSelection = () => {
    if (!isSelected) {
      changeSelectedItem("/" + details.menu_name);
    } else {
      changeSelectedItem("/");
    }
    changeSelectedMenuId(details._id)
    setIsSelected((prevState) => !prevState);
  };

  return (
    <button onClick={handleMenuSelection} className={classname}>
      <div className="menu-item-container">
        <img src={details.menu_image} alt={details.menu_name} />
        <p>{details.menu_name}</p>
      </div>
    </button>
  );
};

export default Menu;
