import React, { useEffect, useState } from "react";
import "./App.css";
import io from "socket.io-client";

function App() {
  const [dishes, setDishes] = useState([]);

  useEffect(() => {
    const socket = io("https://nosh-dish-backend.onrender.com", {
      transports: ["websocket"],
      withCredentials: true,
    });

    fetch("https://nosh-dish-backend.onrender.com/api/dishes")
      .then((res) => res.json())
      .then(setDishes);

    socket.on("dishUpdated", (updatedDish) => {
      setDishes((prev) =>
        prev.map((d) => (d.dishId === updatedDish.dishId ? updatedDish : d))
      );
    });

    socket.on("dishesSync", (data) => setDishes(data));

    return () => socket.disconnect();
  }, []);

  const [newDish, setNewDish] = useState({
    dishName: "",
    imageUrl: "",
  });

  const handleChange = (e) => {
    setNewDish({ ...newDish, [e.target.name]: e.target.value });
  };

  const addDish = async (e) => {
    e.preventDefault();
    await fetch("https://nosh-dish-backend.onrender.com/api/dishes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newDish, isPublished: true }),
    });
    setNewDish({ dishName: "", imageUrl: "" });
  };

  const toggleStatus = async (dishId) => {
    await fetch(
      `https://nosh-dish-backend.onrender.com/api/dishes/${dishId}/toggle`,
      {
        method: "PATCH",
      }
    );
  };

  return (
    <div className="App">
      <h1>Nosh Dish Dashboard</h1>
      <div className="dish-grid">
        {dishes.map((dish) => (
          <div key={dish.dishId} className="dish-card">
            <img src={dish.imageUrl} alt={dish.dishName} />
            <h3>{dish.dishName}</h3>
            <p>Status: {dish.isPublished ? "Published" : "Unpublished"}</p>
            <button onClick={() => toggleStatus(dish.dishId)}>
              Toggle Status
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={addDish} className="add-dish-form">
        <h2>Add a New Dish</h2>
        <input
          type="text"
          name="dishName"
          placeholder="Dish Name"
          value={newDish.dishName}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="imageUrl"
          placeholder="Image URL"
          value={newDish.imageUrl}
          onChange={handleChange}
          required
        />
        <button type="submit">Add Dish</button>
      </form>
    </div>
  );
}

export default App;
