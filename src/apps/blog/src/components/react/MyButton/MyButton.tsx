import { useState } from "react";

import styles from "./MyButton.module.css";

export const MyButton = () => {
  const [count, setCount] = useState(0);

  return (
    <button
      className={styles["fancy-btn"]}
      onClick={() => {
        const newCount = count + 1;
        setCount(newCount);
        alert(`You clicked ${newCount} times`);
      }}
    >
      My Button
    </button>
  );
};
