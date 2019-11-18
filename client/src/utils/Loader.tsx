import React, { FunctionComponent, CSSProperties } from "react";
import extras from "./../styles/extras.module.scss";

interface ILoaderProps {
  iconStyle?: CSSProperties;
}

export const Loader: FunctionComponent<ILoaderProps> = function(props) {
  return (
    <div className={extras.loaderWrapper}>
      <div className={extras.loader}>
        <div style={props.iconStyle}></div>
        <div style={props.iconStyle}></div>
        <div style={props.iconStyle}></div>
        <div style={props.iconStyle}></div>
      </div>
    </div>
  );
};
