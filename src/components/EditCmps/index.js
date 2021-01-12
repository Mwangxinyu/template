import {useForceUpdate} from "../../utils";
import {globalCanvas} from "../../utils/globalCanvas";
import useUpdateCanvas from "../hooks/useUpdateCanvas";
import styles from "./index.less";

function EditCmps({selectedCmp, setSelectCmp}) {
  //const cmpToAdd = globalCanvas.getActiveCmp();

  const {data} = selectedCmp; //cmpToAdd;

  const {style = {}} = data || {};

  const [dispatch] = useUpdateCanvas();

  const handleChange = (payload) => {
    dispatch(payload);
    //globalCanvas.setActiveCmp(payload);
    setSelectCmp(payload);
  };

  const handleValueChange = (e) => {
    const newValue = e.target.value;
    let payload = {
      ...selectedCmp,
      data: {
        ...data,
        value: newValue,
      },
    };

    handleChange(payload);
  };

  const handleStyleChange = (e, name) => {
    const newValue = e.target.value;
    let payload = {
      ...selectedCmp,
      data: {
        ...data,
        style: {
          ...style,
          [name]: newValue,
        },
      },
    };

    handleChange(payload);
  };

  return (
    <div className={styles.main}>
      {!data && (
        <div className={styles.empty}>
          <p>编辑区域</p>
        </div>
      )}
      {data && (
        <>
          <div className={styles.title}>{selectedCmp.desc}</div>
          <Item label="描述">
            <input
              className={styles.itemRight}
              type="text"
              value={data.value}
              onChange={(e) => handleValueChange(e)}
            />
          </Item>

          {style.fontSize && (
            <Item label="字体">
              <input
                className={styles.itemRight}
                type="number"
                value={style.fontSize}
                onChange={(e) => handleStyleChange(e, "fontSize")}
              />
            </Item>
          )}
        </>
      )}
    </div>
  );
}

function Item({label, children}) {
  return (
    <div className={styles.item}>
      <label>{label}</label>
      {children}
    </div>
  );
}

export default EditCmps;
