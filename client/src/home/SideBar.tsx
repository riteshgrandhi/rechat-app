import React, {
  Fragment,
  ChangeEvent,
  useState,
  useEffect,
  FunctionComponent,
  useContext,
  useRef
} from "react";
import styles from "../styles/app.module.scss";
import { IMarc } from "@common";
import {
  FaChevronDown,
  FaChevronRight,
  FaFile,
  FaPlus,
  FaPen,
  FaHome,
  FaUserCircle
} from "react-icons/fa";
import { FiX, FiCheck } from "react-icons/fi";
import { navigate } from "@reach/router";
import { Key } from "ts-keycode-enum";
import ServiceContext from "../services/ServiceContext";
import useOnClickOutside from "../utils/onClickOutsideHook";
import { ShowModal } from "../utils/ShowModal";

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
    let currentUser = this.context.authService.getCurrentUser();
    return (
      <div className={styles.infoPanel}>
        <div className={styles.userDetails}>
          <span className={styles.displayName}>
            <FaUserCircle />
            <span>
              {currentUser.firstName} {currentUser.lastName}
            </span>
          </span>
          <button
            className={`${styles.sideBarButton} ${styles.rightButton}`}
            onClick={() => {
              this.context.authService.logout();
            }}>
            LOGOUT
          </button>
        </div>
        <div
          className={`${styles.menuItem} ${styles.main}`}
          onClick={() => {
            this.setState({ currentMarc: undefined }, () => {
              navigate("/");
            });
          }}>
          <div className={`${styles.title} ${styles.bold}`}>
            <FaHome /> <span>Home</span>{" "}
          </div>
        </div>
        {this.state.currentMarc && (
          <Fragment>
            <hr />
            <div className={styles.marcInfo}>
              <AddEditMarcTitle
                refreshCallback={this.props.refreshCallback}
                marc={this.state.currentMarc}
              />
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

const CollapseMenu: React.FunctionComponent<ICollapseMenuProps> = function(
  props
) {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedId, setSelectedId] = useState(props.selectedId);
  const [marcs, setMarcs] = useState(props.marcs);

  useEffect(() => {
    setMarcs(props.marcs);
  }, [props.marcs]);

  useEffect(() => {
    setSelectedId(props.selectedId);
  }, [props.selectedId]);

  useEffect(() => {
    props.onSelectCallback(selectedId);
    props.refreshCallback();
  }, [selectedId]);

  let toggleMenu = () => {
    let _flag = isOpen;
    _flag = !_flag;
    setIsOpen(_flag);
  };

  return (
    <div className={styles.marcList}>
      <div onClick={toggleMenu} className={`${styles.menuItem} ${styles.main}`}>
        <a className={`${styles.title} ${styles.bold}`}>Your Marcs </a>
        {isOpen ? (
          <FaChevronDown className={styles.chevronCollapse} />
        ) : (
          <FaChevronRight className={styles.chevronCollapse} />
        )}
      </div>
      <div className={isOpen ? styles.open : styles.closed}>
        <AddEditMarcTitle
          refreshCallback={() => {
            setSelectedId("");
          }}
        />
        {marcs.map(m => (
          <div
            key={m.marcId}
            className={`${styles.menuItem} ${
              m.marcId == selectedId ? styles.selected : ""
            }`}
            onClick={() => {
              setSelectedId(m.marcId);
              navigate(`/edit/${m.marcId}`);
            }}>
            <FaFile />
            <span>{m.title}</span>
          </div>
        ))}
      </div>
      <hr />
    </div>
  );
};

interface IAddEditMarcProps {
  refreshCallback: () => void;
  marc?: IMarc;
}

const AddEditMarcTitle: FunctionComponent<IAddEditMarcProps> = function(props) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState(props.marc ? props.marc.title : "");
  const [currentTitle, setCurrentTitle] = useState(title);
  const [showManageModal, setShowManageModal] = useState(false);

  useEffect(() => {
    if (props.marc) {
      setTitle(props.marc.title);
    }
  }, [props.marc]);

  let context = useContext(ServiceContext);

  const onDismiss = () => {
    if (props.marc) {
      setTitle(props.marc.title);
    }
    setIsEditing(false);
    setIsLoading(false);
  };

  const ref = useRef<HTMLDivElement>(null);

  useOnClickOutside(ref, () => {
    onDismiss();
  });

  const onSubmit = () => {
    let _title: string = title;

    if (!_title) {
      return;
    }

    if (props.marc && currentTitle == _title) {
      setTitle(currentTitle);
      return;
    }

    setIsLoading(true);

    (props.marc
      ? context.apiService.axiosAuth.put(`/api/marcs/${props.marc.marcId}`, {
          title: _title
        })
      : context.apiService.axiosAuth.post("/api/marcs", { title: _title })
    )
      .then(() => {
        setIsEditing(false);
        setIsLoading(false);
        if (props.marc) {
          setCurrentTitle(title);
        }
        props.refreshCallback();
      })
      .catch(err => {
        setIsEditing(false);
        setIsLoading(false);
        navigate("/", {
          // navigate("/error", {
          state: {
            error: err,
            message: `Failed to ${
              props.marc ? "Edit" : "Create"
            } Marc: ${title}`
          }
        });
      });
  };

  return (
    <Fragment>
      {!(isEditing || isLoading) &&
        (props.marc ? (
          <div className={`${styles.menuItem} ${styles.main}`}>
            <div className={styles.title}>
              <FaPen
                onClick={() => {
                  setIsEditing(true);
                }}></FaPen>
              <span className={styles.bold}>{title}</span>
            </div>
            <ShowModal
              modal={<div>Hello</div>}
              showModal={showManageModal}
              onDismiss={() => {
                setShowManageModal(false);
              }}>
              <button
                className={`${styles.sideBarButton} ${styles.rightButton}`}
                onClick={() => {
                  setShowManageModal(true);
                }}>
                MANAGE
              </button>
            </ShowModal>
          </div>
        ) : (
          <div
            className={styles.menuItem}
            onClick={() => {
              setIsEditing(true);
            }}>
            <FaPlus />
            <span>New Marc</span>
          </div>
        ))}
      {isEditing && (
        <div
          ref={ref}
          className={`${styles.menuItem} ${styles.newMarc}`}
          onKeyPress={e => {
            if (e.which == Key.Enter) {
              onSubmit();
            }
          }}>
          <input
            type="text"
            value={title}
            className={styles.embeddedTextBox}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              setTitle(event.target.value);
            }}
            autoFocus></input>
          <div>
            <FiCheck
              className={styles.sideBarButton}
              onClick={onSubmit}></FiCheck>
            <FiX
              className={`${styles.sideBarButton} ${styles.cancel}`}
              onClick={onDismiss}
            />
          </div>
        </div>
      )}
    </Fragment>
  );
};
