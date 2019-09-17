import React from "react";
import styles from "../styles/app.module.scss";
import { IMarc } from "@common";
import { FaChevronDown, FaChevronRight, FaFile, FaPlus } from "react-icons/fa";
import { navigate } from "@reach/router";

interface ISideBarProps {
  marcs: IMarc[];
}

interface ISideBarState {
  marcs: IMarc[];
}

export class SideBar extends React.Component<ISideBarProps, ISideBarState> {
  constructor(props: ISideBarProps) {
    super(props);
    this.state = {
      marcs: props.marcs
    };
  }

  public componentDidUpdate(prevProps: ISideBarProps) {
    if (prevProps.marcs != this.props.marcs) {
      this.setState({
        marcs: this.props.marcs
      });
    }
  }

  render() {
    return (
      <div className={styles.infoPanel}>
        {/* <div className={styles.personaInfo}>
          <div className={styles.title}>Peers</div>
        </div> 
        <hr />*/}
        <CollapseMenu marcs={this.state.marcs} />
      </div>
    );
  }
}

interface ICollapseMenuProps {
  marcs: IMarc[];
}
interface ICollapseMenuState {
  isOpen: boolean;
  marcs: IMarc[];
  selectedId: string;
}

class CollapseMenu extends React.Component<
  ICollapseMenuProps,
  ICollapseMenuState
> {
  constructor(props: ICollapseMenuProps) {
    super(props);
    this.state = {
      isOpen: true,
      marcs: this.props.marcs,
      selectedId: ""
    };
    this.toggleMenu = this.toggleMenu.bind(this);
  }

  public componentDidUpdate(prevProps: ICollapseMenuProps) {
    if (prevProps.marcs != this.props.marcs) {
      let _s: string = window.location.pathname.split("/edit/").join("");
      if (this.props.marcs.findIndex(m => m.id == _s) < 0) {
        _s = "";
      }
      this.setState({
        marcs: this.props.marcs,
        selectedId: _s
      });
    }
  }

  private toggleMenu(event: React.MouseEvent) {
    let _flag = this.state.isOpen;
    _flag = !_flag;
    this.setState({
      isOpen: _flag
    });
  }

  render() {
    return (
      <div className={styles.documentInfo}>
        <div
          onClick={this.toggleMenu}
          className={`${styles.menuItem} ${styles.main}`}
        >
          <a className={styles.title}>Your Marcs </a>
          <span className={`${styles.chevronCollapse}`}>
            {this.state.isOpen ? <FaChevronDown /> : <FaChevronRight />}
          </span>
        </div>
        <div className={this.state.isOpen ? styles.open : styles.closed}>
          <div
            className={styles.menuItem}
            onClick={() => {
              this.setState({
                selectedId: ""
              });
              navigate(`/new`);
            }}
          >
            <FaPlus />
            <span>New Marc</span>
          </div>
          {this.props.marcs.map(m => (
            <div
              key={m.id}
              className={`${styles.menuItem} ${
                m.id == this.state.selectedId ? styles.selected : ""
              }`}
              onClick={() => {
                this.setState({
                  selectedId: m.id
                });
                navigate(`/edit/${m.id}`);
              }}
            >
              <FaFile />
              <span>{m.title}</span>
            </div>
          ))}
        </div>
        <hr />
      </div>
    );
  }
}
