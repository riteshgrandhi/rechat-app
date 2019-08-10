import React from "react";
import styles from "./app.module.scss";

export class InfoPanel extends React.Component {
  render() {
    return (
      <div className={styles.infoPanel}>
        <div className={styles.documentInfo}>
          <div>Document Info</div>
        </div>
        <div className={styles.personaInfo}>
          <div>Persona Info</div>
        </div>
      </div>
    );
  }
}
