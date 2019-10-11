import React, { Fragment, ChangeEvent } from "react";
import styles from "../styles/app.module.scss";
import { IMarc, Logger } from "@common";
import {
  FaChevronDown,
  FaChevronRight,
  FaFile,
  FaPlus,
  FaPen,
  FaHome
} from "react-icons/fa";
import { FiX, FiCheck } from "react-icons/fi";
import { navigate } from "@reach/router";
import onClickOutside from "react-onclickoutside";
import { Key } from "ts-keycode-enum";

import ApiService from "../services/ApiService";
import AuthService from "../services/AuthService";
import ServiceContext from "../services/ServiceContext";

interface ISideBarProps {
  currentMarcId?: string;
  marcs: IMarc[];
  refreshCallback: () => void;
}

interface ISideBarState {
  marcs: IMarc[];
  currentMarc?: IMarc;
}

export class SideBar extends React.Component<ISideBarProps, ISideBarState> {
  static contextType = ServiceContext;
  public context!: React.ContextType<typeof ServiceContext>;

  constructor(props: ISideBarProps) {
    super(props);

    this.onSelectCallback = this.onSelectCallback.bind(this);
    this.state = {
      marcs: props.marcs,
      currentMarc: props.marcs.find(m => m.marcId == props.currentMarcId)
    };
  }

  public componentDidUpdate(prevProps: ISideBarProps) {
    if (prevProps.marcs != this.props.marcs) {
      this.setState({
        marcs: this.props.marcs,
        currentMarc: this.props.marcs.find(
          m => m.marcId == this.props.currentMarcId
        )
      });
    }
  }

  private onSelectCallback(selectedMarcId?: string) {
    if (!selectedMarcId) {
      this.setState({
        currentMarc: undefined
      });
      return;
    }
    this.setState({
      currentMarc: this.state.marcs.find(m => m.marcId == selectedMarcId)
    });
  }

  render() {
    return (
      <div className={styles.infoPanel}>
        <div
          className={`${styles.menuItem} ${styles.main}`}
          onClick={() => {
            this.setState({ currentMarc: undefined }, () => {
              navigate("/");
            });
          }}
        >
          <div className={styles.title}>
            <FaHome /> <span>Home</span>{" "}
          </div>
          <button
            className={`${styles.sideBarButton} ${styles.logoutButton}`}
            onClick={() => {
              this.context.authService.logout();
            }}
          >
            LOGOUT
          </button>
        </div>
        {this.state.currentMarc && (
          <Fragment>
            <hr />
            <div className={styles.marcInfo}>
              <EditMarcTitleOutClick
                refreshCallback={this.props.refreshCallback}
                marc={this.state.currentMarc}
              ></EditMarcTitleOutClick>
            </div>
          </Fragment>
        )}
        <hr />
        <CollapseMenu
          marcs={this.state.marcs}
          selectedId={
            this.state.currentMarc ? this.state.currentMarc.marcId : ""
          }
          refreshCallback={this.props.refreshCallback}
          onSelectCallback={this.onSelectCallback}
        />
      </div>
    );
  }
}

interface ICollapseMenuProps {
  marcs: IMarc[];
  selectedId: string;
  refreshCallback: () => void;
  onSelectCallback: (selectedMarcId?: string) => void;
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

  componentDidUpdate(prevProps: ICollapseMenuProps) {
    if (prevProps.marcs != this.props.marcs) {
      this.setState({
        marcs: this.props.marcs
      });
    }
    if (prevProps.selectedId != this.props.selectedId) {
      this.setState({
        selectedId: this.props.selectedId
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
      <div className={styles.marcList}>
        <div
          onClick={this.toggleMenu}
          className={`${styles.menuItem} ${styles.main}`}
        >
          <a className={styles.title}>Your Marcs </a>
          {this.state.isOpen ? (
            <FaChevronDown className={styles.chevronCollapse} />
          ) : (
            <FaChevronRight className={styles.chevronCollapse} />
          )}
        </div>
        <div className={this.state.isOpen ? styles.open : styles.closed}>
          <AddMarcTitleOutClick
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
                this.setState(
                  {
                    selectedId: m.marcId
                  },
                  () => {
                    this.props.onSelectCallback(this.state.selectedId);
                    navigate(`/edit/${m.marcId}`);
                  }
                );
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

interface IAddEditMarcProps {
  refreshCallback: () => void;
  marc?: IMarc;
}

interface IAddEditMarcState {
  isEditing: boolean;
  isLoading: boolean;
  title: string;
}

class AddMarcTitle extends React.Component<
  IAddEditMarcProps,
  IAddEditMarcState
> {
  static contextType = ServiceContext;
  public context!: React.ContextType<typeof ServiceContext>;

  constructor(props: IAddEditMarcProps) {
    super(props);
    this.state = {
      isEditing: false,
      isLoading: false,
      title: ""
    };
    this.onSubmit = this.onSubmit.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
  }

  public handleClickOutside() {
    this.onDismiss();
  }

  private onSubmit() {
    let _title: string = this.state.title;
    if (!_title) {
      return;
    }
    this.setState({
      isLoading: true,
      title: ""
    });
    this.context.apiService.axiosAuth
      .post("/api/marcs", { title: _title })
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
            navigate("/", {
              // navigate("/error", {
              state: {
                error: err,
                message: `Failed to Create Marc: ${this.state.title}`
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
                  title: event.target.value
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

class EditMarcTitle extends React.Component<
  IAddEditMarcProps,
  IAddEditMarcState
> {
  private _currentTitle: string;
  static contextType = ServiceContext;
  public context!: React.ContextType<typeof ServiceContext>;

  constructor(props: IAddEditMarcProps) {
    super(props);
    this.state = {
      isEditing: false,
      isLoading: false,
      title: props.marc ? props.marc.title : ""
    };
    this._currentTitle = this.state.title;
    this.onSubmit = this.onSubmit.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
  }

  componentDidUpdate(prevProps: IAddEditMarcProps) {
    if (this.props.marc && prevProps.marc != this.props.marc) {
      this.setState({ title: this.props.marc.title });
    }
  }

  public handleClickOutside() {
    this.onDismiss();
  }

  private onSubmit() {
    let _title: string = this.state.title;
    if (!_title || !this.props.marc || this._currentTitle == _title) {
      this.setState({ title: this._currentTitle, isEditing: false });
      return;
    }

    this.setState({
      isLoading: true
    });

    this.context.apiService.axiosAuth
      .put(`/api/marcs/${this.props.marc.marcId}`, { title: _title })
      .then(() => {
        this.setState(
          {
            isEditing: false,
            isLoading: false
          },
          () => {
            this._currentTitle = this.state.title;
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
            navigate("/", {
              // navigate("/error", {
              state: {
                error: err,
                message: `Failed to Edit Marc: ${this.state.title}`
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
          <div className={`${styles.menuItem} ${styles.main}`}>
            <div className={styles.title}>{this.state.title}</div>
            <FaPen
              onClick={() => {
                this.setState({ isEditing: true });
              }}
            ></FaPen>
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
              value={this.state.title}
              className={styles.embeddedTextBox}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                this.setState({
                  title: event.target.value
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

let AddMarcTitleOutClick = onClickOutside(AddMarcTitle);
let EditMarcTitleOutClick = onClickOutside(EditMarcTitle);
