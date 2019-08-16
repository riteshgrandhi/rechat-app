import React from "react";
import styles from "./app.module.scss";

export class InfoPanel extends React.Component {
  render() {
    return (
      <div className={styles.infoPanel}>
        <div className={styles.documentInfo}>
          <div>DOCUMENT INFO</div>
        </div>
        <div className={styles.personaInfo}>
          <div>PERSONA</div>
        </div>
      </div>
    );
  }
}
