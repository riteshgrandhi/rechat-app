import React, {
  FunctionComponent,
  useState,
  Fragment,
  useEffect,
  CSSProperties
} from "react";
import ReactDOM from "react-dom";
import styles from "./../styles/app.module.scss";
import { FiX } from "react-icons/fi";

interface IModalProps {
  title: string;
  showModal: boolean;
  contentClass?: string;
  contentDismissClass?: string;
  contentStyle?: CSSProperties;
  closeDelay?: number;
  onSuccess?: () => void;
  onDismiss?: () => void;
}

export const ShowModal: FunctionComponent<IModalProps> = function(props) {
  const [isOpen, setIsOpen] = useState(props.showModal);
  const [dismissClass, setDismissClass] = useState("");

  const dismiss = async () => {
    let delay = new Promise<void>(resolve => {
      if (props.closeDelay && props.contentDismissClass) {
        setDismissClass(props.contentDismissClass);
        setTimeout(() => {
          resolve();
        }, props.closeDelay * 1000);
      } else {
        resolve();
      }
    });
    await delay;
    setIsOpen(false);
    if (props.onDismiss) {
      props.onDismiss();
    }
  };

  useEffect(() => {
    setIsOpen(props.showModal);
  }, [props.showModal]);

  return (
    <Fragment>
      {isOpen &&
        ReactDOM.createPortal(
          <div className={styles.modal}>
            <div
              className={`${styles.modalContent} ${props.contentClass} ${dismissClass}`}
              // ref={modalRef}
              style={props.contentStyle}>
              <div className={styles.header}>
                <span>{props.title}</span>
                <FiX className={styles.closeButton} onClick={dismiss} />
              </div>
              {props.children}
            </div>
          </div>,
          document.body
        )}
    </Fragment>
  );
};
