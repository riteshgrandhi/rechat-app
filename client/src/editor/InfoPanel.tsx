import React from "react";
import styles from "./app.module.scss";

export class InfoPanel extends React.Component {
  render() {
    return (
      <div className={styles.infoPanel}>
        <div className={styles.documentInfo}>
          {/* <hr /> */}
          <div className={styles.title}>Document Info</div>
          {/* <hr /> */}
        </div>
        <div className={styles.personaInfo}>
          <hr />
          <div className={styles.title}>Peers</div>
          {/* <hr /> */}
        </div>
      </div>
    );
  }
}
