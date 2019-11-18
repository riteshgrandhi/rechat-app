import React, {
  FunctionComponent,
  useState,
  useEffect,
  Fragment,
  useContext,
  useRef,
  ChangeEvent
} from "react";
import { IMarc, Role } from "@common";
import Dropdown from "react-dropdown";
import "react-dropdown/style.css";
import styles from "../styles/app.module.scss";
import { FiPlus, FiCheck, FiX } from "react-icons/fi";
import ServiceContext from "../services/ServiceContext";
import { FaPlus } from "react-icons/fa";
import { Key } from "ts-keycode-enum";
import useOnClickOutside from "../utils/onClickOutsideHook";

interface IManageMarcProps {
  marc: IMarc;
}

export const ManageMarc: FunctionComponent<IManageMarcProps> = function(props) {
  const [usersList, setUsersList] = useState(props.marc.usersList);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTerm, setFilterTerm] = useState("");

  const StringIsNumber = (value: string | number) =>
    isNaN(Number(value)) === false;

  const rolesArr = Object.keys(Role)
    .filter(StringIsNumber)
    .map((key: any) => ({ value: key, label: Role[key] }));

  return (
    <div className={styles.manageMarc}>
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search Users..."
          className={styles.searchBox}
          onChange={event => {
            setFilterTerm(event.target.value);
          }}
          autoFocus
        />
      </div>
      <div className={styles.userContainer}>
        <Fragment>
          {usersList
            .filter(
              u => u.email.toLowerCase().indexOf(filterTerm.toLowerCase()) >= 0
            )
            .sort((u1, u2) =>
              u1.email.toLowerCase() < u2.email.toLowerCase() ? -1 : 1
            )
            .map(user => (
              <div className={styles.userDiv}>
                {user.email}
                <Dropdown
                  baseClassName={styles.dropdownBase}
                  className={styles.dropdownRoot}
                  controlClassName={styles.dropdownControl}
                  menuClassName={styles.dropdownMenu}
                  // arrowClosed={<FiChevronDown />}
                  // arrowOpen={<FiChevronUp />}
                  options={rolesArr}
                  value={user.role.toString()}
                />
              </div>
            ))}
          <InviteUser />
        </Fragment>
      </div>
    </div>
  );
};

const InviteUser: FunctionComponent = function(props) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  let context = useContext(ServiceContext);

  const onDismiss = () => {
    setIsEditing(false);
    setIsLoading(false);
  };

  const ref = useRef<HTMLDivElement>(null);

  useOnClickOutside(ref, () => {
    onDismiss();
  });

  // const onSubmit = () => {
  //   let _title: string = title;

  //   if (!_title) {
  //     return;
  //   }

  //   if (props.marc && searchTerm == _title) {
  //     setTitle(searchTerm);
  //     return;
  //   }

  //   setIsLoading(true);

  //   (props.marc
  //     ? context.apiService.axiosAuth.put(`/api/marcs/${props.marc.marcId}`, {
  //         title: _title
  //       })
  //     : context.apiService.axiosAuth.post("/api/marcs", { title: _title })
  //   )
  //     .then(() => {
  //       setIsEditing(false);
  //       setIsLoading(false);
  //       if (props.marc) {
  //         setSearchTerm(title);
  //       }
  //       props.refreshCallback();
  //     })
  //     .catch(err => {
  //       setIsEditing(false);
  //       setIsLoading(false);
  //       navigate("/", {
  //         // navigate("/error", {
  //         state: {
  //           error: err,
  //           message: `Failed to ${
  //             props.marc ? "Edit" : "Create"
  //           } Marc: ${title}`
  //         }
  //       });
  //     });
  // };

  return (
    <Fragment>
      {!(isEditing || isLoading) && (
        <div
          className={`${styles.menuItem} ${styles.main}`}
          onClick={() => {
            setIsEditing(true);
          }}>
          <div className={styles.title}>
            <FaPlus /> Invite User
            <span className={styles.bold}></span>
          </div>
        </div>
      )}
      {isEditing && (
        <div
          ref={ref}
          className={`${styles.menuItem} ${styles.newMarc}`}
          onKeyPress={e => {
            if (e.which == Key.Enter) {
              //onSubmit();
            }
          }}>
          <input
            type="text"
            className={styles.embeddedTextBox}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              setSearchTerm(event.target.value);
            }}
            autoFocus></input>
          <div>
            <FiCheck
              className={styles.sideBarButton}
              onClick={() => {}}></FiCheck>
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
