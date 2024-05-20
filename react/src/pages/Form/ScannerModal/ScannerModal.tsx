import Rodal from 'rodal';
import './ScannerModal.scss';

const customStyles = {
  height: 'auto',
  bottom: 'auto',
  top: '20%',
};
interface Props {
  openScanner: boolean;
  closeScanner: () => void;
  title: string;
}

const ScannerModal = ({ openScanner, closeScanner, title }: Props) => {
  const closeModalHandler = (event) => {
    closeScanner?.();
  };

  return (
    <Rodal
      visible={openScanner}
      animation="zoom"
      onClose={closeModalHandler}
      customStyles={customStyles}
    >
      <div className="modal">
        <div className="modal__header">
          <div className="modal__title">
            <p>{title}</p>
          </div>
        </div>

        <div className="modal__content">test</div>
        {/* <div className="modal__footer">{footer}</div> */}
      </div>
    </Rodal>
  );
};

export default ScannerModal;
