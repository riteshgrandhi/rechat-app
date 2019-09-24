import React, { Fragment, ChangeEvent } from "react";
import styles from "../styles/app.module.scss";
import { IMarc, Logger } from "@common";
import { FaChevronDown, FaChevronRight, FaFile, FaPlus } from "react-icons/fa";
import { FiX, FiCheck } from "react-icons/fi";
import { navigate } from "@reach/router";
import { Config } from "../config/appConfig";
import onClickOutside from "react-onclickoutside";
import { Key } from "ts-keycode-enum";

interface ISideBarProps {
  marcs: IMarc[];
  currentMarcId?: string;
  logger: Logger;
  refreshCallback: () => void;
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
        <div className={styles.marcInfo}>
          <div className={styles.title}></div>
        </div>
        <hr />
        <CollapseMenu
          marcs={this.state.marcs}
          selectedId={this.props.currentMarcId || ""}
          refreshCallback={this.props.refreshCallback}
        />
      </div>
    );
  }
}

interface ICollapseMenuProps {
  marcs: IMarc[];
  selectedId: string;
  refreshCallback: () => void;
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
      selectedId: this.props.selectedId
    };
    this.toggleMenu = this.toggleMenu.bind(this);
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
      <div className={styles.marcList}>
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
          <NewMarcButtonOutClick
            refreshCallback={() => {
              this.setState(
                {
                  selectedId: ""
                },
                this.props.refreshCallback
              );
            }}
          />
          {this.props.marcs.map(m => (
            <div
              key={m.marcId}
              className={`${styles.menuItem} ${
                m.marcId == this.state.selectedId ? styles.selected : ""
              }`}
              onClick={() => {
                this.setState({
                  selectedId: m.marcId
                });
                navigate(`/edit/${m.marcId}`);
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

interface INewMarcButtonProps {
  refreshCallback: () => void;
}

interface INewMarcButtonState {
  isEditing: boolean;
  isLoading: boolean;
  newTitle: string;
}

class NewMarcButton extends React.Component<
  INewMarcButtonProps,
  INewMarcButtonState
> {
  constructor(props: INewMarcButtonProps) {
    super(props);
    this.state = {
      isEditing: false,
      isLoading: false,
      newTitle: ""
    };
    this.onSubmit = this.onSubmit.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
  }

  public handleClickOutside() {
    this.onDismiss();
  }

  private onSubmit() {
    let _title: string = this.state.newTitle;
    if (!_title) {
      return;
    }
    this.setState({
      isLoading: true,
      newTitle: ""
    });
    fetch(`${Config.serverUrl}/api/marcs`, {
      method: "post",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ title: _title })
    })
      .then(() => {
        this.setState(
          {
            isEditing: false,
            isLoading: false
          },
          () => {
            this.props.refreshCallback();
          }
        );
      })
      .catch(err => {
        this.setState(
          {
            isEditing: false,
            isLoading: false
          },
          () => {
            navigate("/error", {
              state: {
                error: err,
                message: `Failed to Create Marc: ${this.state.newTitle}`
              }
            });
          }
        );
      });
  }

  private onDismiss() {
    this.setState({
      isEditing: false,
      isLoading: false
    });
  }

  render() {
    return (
      <Fragment>
        {!(this.state.isEditing || this.state.isLoading) && (
          <div
            className={styles.menuItem}
            onClick={() => {
              this.setState({ isEditing: true });
              this.props.refreshCallback();
            }}
          >
            <FaPlus />
            <span>New Marc</span>
          </div>
        )}
        {this.state.isEditing && (
          <div
            className={`${styles.menuItem} ${styles.newMarc}`}
            onKeyPress={e => {
              if (e.which == Key.Enter) {
                this.onSubmit();
              }
            }}
          >
            <input
              type="text"
              className={styles.embeddedTextBox}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                this.setState({
                  newTitle: event.target.value
                });
              }}
              autoFocus
            ></input>
            <div>
              <FiCheck
                className={styles.sideBarButton}
                onClick={this.onSubmit}
              ></FiCheck>
              <FiX
                className={`${styles.sideBarButton} ${styles.cancel}`}
                onClick={this.onDismiss}
              />
            </div>
          </div>
        )}
      </Fragment>
    );
  }
}

let NewMarcButtonOutClick = onClickOutside(NewMarcButton);
