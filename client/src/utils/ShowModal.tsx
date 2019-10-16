import React, {
  FunctionComponent,
  useState,
  ReactNode,
  Fragment,
  useEffect,
  useRef
} from "react";
import styles from "./../styles/app.module.scss";
import useOnClickOutside from "./onClickOutsideHook";

interface IModalProps {
  showModal: boolean;
  modal: ReactNode;
  onSuccess?: () => void;
  onDismiss?: () => void;
}

export const ShowModal: FunctionComponent<IModalProps> = function(props) {
  const [isOpen, setIsOpen] = useState(props.showModal);

  const modalRef = useRef(null);

  useOnClickOutside(modalRef, () => {
    setIsOpen(false);
    if (props.onDismiss) {
      props.onDismiss();
    }
  });

  useEffect(() => {
    setIsOpen(props.showModal);
  }, [props.showModal]);

  return (
    <Fragment>
      {isOpen && (
        <div className={styles.modal}>
          <div className={styles.modalContent} ref={modalRef}>
            {props.modal}
          </div>
        </div>
      )}
      {props.children}
    </Fragment>
  );
};
