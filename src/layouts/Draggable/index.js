import {Component} from "react";
import {CanvasContext} from "../../Context";
import {throttle} from "../../utils";
import ContextMenu from "./ContextMenu";
import {
  isButtonComponent,
  isImgComponent,
  isTextComponent,
} from "../Cmps/menus";
// 画布组件
import TextComponent from "../../components/TextComponent";
import ButtonComponent from "../../components/ButtonComponent";
import ImgComponent from "../../components/ImgComponent";
import styles from "./index.less";

// setSelectCmp 选中的组件
// selected 是否是选中的组件，选中的组件加橙色标记边框
export default class Draggable extends Component {
  static contextType = CanvasContext;
  constructor(props, context) {
    super(props);
    this.state = {showContextMenu: false};
  }

  componentDidMount() {
    document
      .getElementById("root")
      .addEventListener("click", this.setShowContextMenu);
    // 注册组件
    this.unregisterCmpsEntity = this.context.registerCmpsEntity(
      this.context.getCmp(this.props.index).onlyKey,
      this
    );
  }

  componentWillUnmount() {
    document
      .getElementById("root")
      .removeEventListener("click", this.setShowContextMenu);

    this.unregisterCmpsEntity();
  }

  onStoreChange = () => {
    this.forceUpdate();
  };

  setShowContextMenu = (e) => {
    e.stopPropagation();
    e.preventDefault();
    this.state.showContextMenu && this.setState({showContextMenu: false});
  };

  handleMouseDown = (e, direction) => {
    e.stopPropagation();
    e.preventDefault();

    const cmp = this.context.getCmp(this.props.index);

    let startX = e.pageX;
    let startY = e.pageY;

    const move = (e) => {
      let x = e.pageX;
      let y = e.pageY;

      let disX = x - startX;
      let disY = y - startY;
      let newStyle = {};

      if (direction) {
        if (direction.indexOf("top") >= 0) {
          disY = 0 - disY;
          newStyle.top = cmp.data.style.top - disY;
        }

        if (direction.indexOf("left") >= 0) {
          disX = 0 - disX;
          newStyle.left = cmp.data.style.left - disX;
        }
      }

      throttle(
        this.context.updateSelectedCmpStyle({
          ...newStyle,
          width: cmp.data.style.width + disX,
          height: cmp.data.style.height + disY,
        })
      );
    };

    const up = () => {
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", up);
    };

    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
  };

  handleDragStart = (e) => {
    this.setActive(e);
    let pageX = e.pageX;
    let pageY = e.pageY;
    e.dataTransfer.setData("startPos", JSON.stringify({pageX, pageY}));
  };

  setActive = (e) => {
    e.stopPropagation();
    const selectCmp = this.context.getSelectedCmp();
    const cmp = this.context.getCmp(this.props.index);
    // if (selectCmp === null || selectCmp.onlyKey !== cmp.onlyKey) {

    this.context.setSelectedCmp(cmp);
  };

  handleContextMenu = (e) => {
    e.preventDefault();
    this.setState({showContextMenu: true});
  };

  render() {
    const {index} = this.props;

    const globalCanvas = this.context;

    const cmp = globalCanvas.getCmp(this.props.index);

    const selectCmp = globalCanvas.getSelectedCmp();

    const selected = selectCmp && selectCmp.onlyKey === cmp.onlyKey;

    const {showContextMenu} = this.state;

    const {style} = cmp.data;

    const top = style.top - 4;
    const left = style.left - 4;
    const width = style.width,
      height = style.height;

    return (
      <>
        <div
          className={
            styles.main + " " + (selected ? "selected" : styles.unselected)
          }
          style={{...style, zIndex: index}}
          draggable={true}
          onDragStart={this.handleDragStart}
          onClick={this.setActive}
          onContextMenu={this.handleContextMenu}>
          {getComponent(cmp)}
        </div>
        {selected && (
          <ul className={styles.stretch}>
            <li
              className="top left"
              style={{top, left}}
              onMouseDown={(e) => this.handleMouseDown(e, "top left")}
            />
            <li
              className="top"
              style={{
                top,
                left: left + width / 2,
              }}
              onMouseDown={(e) => this.handleMouseDown(e, "top")}
            />
            <li
              className="top right"
              style={{top, left: left + width + 2}}
              onMouseDown={(e) => this.handleMouseDown(e, "top right")}
            />
            <li
              className="right"
              style={{
                top: top + height / 2,
                left: left + width + 2,
              }}
              onMouseDown={this.handleMouseDown}
            />
            <li
              className="bottom right"
              style={{
                top: top + height + 2,
                left: left + width + 2,
              }}
              onMouseDown={this.handleMouseDown}
            />
            <li
              className="bottom"
              style={{
                top: top + height + 2,
                left: left + width / 2,
              }}
              onMouseDown={this.handleMouseDown}
            />
            <li
              className="bottom left"
              style={{
                top: top + height + 2,
                left,
              }}
              onMouseDown={(e) => this.handleMouseDown(e, "bottom left")}
            />
            <li
              className="left"
              style={{
                top: top + height / 2,
                left,
              }}
              onMouseDown={(e) => this.handleMouseDown(e, "left")}
            />
          </ul>
        )}
        {showContextMenu && (
          <ContextMenu
            index={index}
            pos={{top: style.top + 10, left: style.left + 60}}
            cmp={cmp}
          />
        )}
      </>
    );
  }
}

function getComponent(cmp) {
  const {data} = cmp;
  let res = null;
  switch (data.type) {
    case isTextComponent:
      res = <TextComponent {...data} />;
      break;
    case isButtonComponent:
      res = <ButtonComponent {...data} />;
      break;
    case isImgComponent:
      res = <ImgComponent {...data} />;
      break;
    default:
      res = null;
  }
  return res;
}