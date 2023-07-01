import { useEffect, useRef, useState } from 'react'
import Login from './components/auth/Login';

function App() {
  const [token, setToken] = useState();
  if (!token) {
    return <Login setToken={token} />
  }
  const [count, setCount] = useState(0);
  const [source, setSource] = useState(new VectorTileSource({
    format: new MVT(),
    url: "http://localhost:8080/api/vector/gdam1/{z}/{x}/{y}",
  }));
  const [source_, setSource_] = useState(new VectorTileSource({
    format: new MVT(),
    url: "http://localhost:8080/api/vector/acdb/{z}/{x}/{y}",
  }));
  const [source__, setSource__] = useState(new VectorSource({ wrapX: false }));
  const [vector, setVector] = useState(new VectorLayer({
    source: source__,
    style: function (feature) {
      return styleFunction(feature, showSegments.checked);
    },
  }));
  const [country, setCountry] = useState(new Style({
    stroke: new Stroke({
      color: " black ",
      width: 1,
    }),
    fill: new Fill({
      color: "#ffff",
    }),
    text: new Text({
      font: "20px sans-serif",
    }),
  }));
  const [layers, setLayers] = useState([
    {
      id: 1,
      title: "Bản đồ Việt Nam",
      shown: true,
      layer: new VectorTileLayer({
        source: source,
        style: country,
      }),
      icon: "https://img.icons8.com/bubbles/50/vietnam--v1.png"
    },
    {
      id: 2,
      title: "Mong Duong",
      shown: true,
      layer: new VectorTileLayer({
        source: source_,
        style: country,
      }),
      icon: "https://img.icons8.com/office/50/mine-cart.png"
    },
    {
      id: 3,
      title: "Tọa độ z:x:y",
      shown: true,
      layer: new TileLayer({
        source: new TileDebug(),
      }),
      icon: "https://img.icons8.com/officel/50/grid.png"
    },
    {
      id: 4,
      title: "Nền",
      shown: true,
      layer: vector,
      icon: "https://img.icons8.com/external-flat-design-circle/50/external-background-camping-flat-design-circle.png"
    },
  ]);
  const [map, setMap] = useState(null);
  const [select, setSelect] = useState(new Select());
  const [drag, setDrag] = useState(new Drag());
  const [FlatCoordinates, setFlatCoordinates] = useState([]);
  const [draw, setDraw] = useState(null);
  const [style, setStyle] = useState(new Style({
    fill: new Fill({
      color: "rgba(255, 255, 255, 0.2)",
    }),
    stroke: new Stroke({
      color: "rgba(0, 0, 0, 0.5)",
      lineDash: [10, 10],
      width: 2,
    }),
    image: new CircleStyle({
      radius: 5,
      stroke: new Stroke({
        color: "rgba(0, 0, 0, 0.7)",
      }),
      fill: new Fill({
        color: "rgba(255, 255, 255, 0.2)",
      }),
    }),
  }));
  const [labelStyle, setLabelStyle] = useState(new Style({
    text: new Text({
      font: "14px Calibri,sans-serif",
      fill: new Fill({
        color: "rgba(255, 255, 255, 1)",
      }),
      backgroundFill: new Fill({
        color: "rgba(0, 0, 0, 0.7)",
      }),
      padding: [3, 3, 3, 3],
      textBaseline: "bottom",
      offsetY: -15,
    }),
    image: new RegularShape({
      radius: 8,
      points: 3,
      angle: Math.PI,
      displacement: [0, 10],
      fill: new Fill({
        color: "rgba(0, 0, 0, 0.7)",
      }),
    }),
  }));
  const [tipStyle, setTipStyle] = useState(new Style({
    text: new Text({
      font: "12px Calibri,sans-serif",
      fill: new Fill({
        color: "rgba(255, 255, 255, 1)",
      }),
      backgroundFill: new Fill({
        color: "rgba(0, 0, 0, 0.4)",
      }),
      padding: [2, 2, 2, 2],
      textAlign: "left",
      offsetX: 15,
    }),
  }));
  const [modifyStyle, setModifyStyle] = useState(new Style({
    image: new CircleStyle({
      radius: 5,
      stroke: new Stroke({
        color: "rgba(0, 0, 0, 0.7)",
      }),
      fill: new Fill({
        color: "rgba(0, 0, 0, 0.4)",
      }),
    }),
    text: new Text({
      text: "Drag to modify",
      font: "12px Calibri,sans-serif",
      fill: new Fill({
        color: "rgba(255, 255, 255, 1)",
      }),
      backgroundFill: new Fill({
        color: "rgba(0, 0, 0, 0.7)",
      }),
      padding: [2, 2, 2, 2],
      textAlign: "left",
      offsetX: 15,
    }),
  }));

  const [segmentStyle, setSegmentStyle] = useState(new Style({
    text: new Text({
      font: "12px Calibri,sans-serif",
      fill: new Fill({
        color: "rgba(255, 255, 255, 1)",
      }),
      backgroundFill: new Fill({
        color: "rgba(0, 0, 0, 0.4)",
      }),
      padding: [2, 2, 2, 2],
      textBaseline: "bottom",
      offsetY: -12,
    }),
    image: new RegularShape({
      radius: 6,
      points: 3,
      angle: Math.PI,
      displacement: [0, 8],
      fill: new Fill({
        color: "rgba(0, 0, 0, 0.4)",
      }),
    }),
  }));
  const [segmentStyles, setSegmentStyles] = useState([segmentStyle]);
  const [modify, setModify] = useState(new Modify({ source: source__, style: modifyStyle }));
  const [tipPoint, setTipPoint] = useState(null);
  const [drawMeasure, setDrawMeasure] = useState(null);
  const [selected, setSelected] = useState(null);
  const typeRef = useRef();
  const measureRef = useRef();

  // function
  const handleLayerCheckbox = (e) => {
    let layerId = parseInt(e.target.getAttribute('data-layer-id'));
    console.log(e.target)
    e.target.removeAttribute('checked')
    console.log(e.target)
    let layer = layers.filter(layer => layer.id === layerId)[0];
    layer.shown = !layer.shown;

    if (layer.shown) map.addLayer(layer.layer);
    else map.removeLayer(layer.layer);
  }
  const updateDraggedFeatureCount = (e) => {
    const countElement = document.getElementById("dragged-feature-count");
    countElement.textContent = draggedFeatureCount.toString();
    document.getElementById("dragged-ids").textContent =
      "Danh sách id tính năng đã được kéo: " + draggedFeatureIds.join(",");
  }
  const removeInteractions = () => {
    map.removeInteraction(drag);
  }
  const handleMode = (e) => {
    removeInteractions();
    const modeValue = e.target.value;
    const draggedFeatureSection = document.getElementById("dragged-feature-section");
    const drawFeatureSection = document.getElementById("draw-feature-section");
    const measureFeatureSection = document.getElementById("measure-feature-section");
    switch (modeValue) {
      case "none": {
        draggedFeatureSection.style.display = "none";
        drawFeatureSection.style.display = "none"; // Hide draw-feature-section
        measureFeatureSection.style.display = "none"; // Hide measure-feature-section
        break;
      }
      // case "draw": {
      //   draggedFeatureSection.style.display = "none";
      //   drawFeatureSection.style.display = "block"; // Show draw-feature-section
      //   measureFeatureSection.style.display = "none"; // Hide measure-feature-section
      //   break;
      // }
      case "modify": {
        draggedFeatureSection.style.display = "block";
        drawFeatureSection.style.display = "none"; // Hide draw-feature-section
        measureFeatureSection.style.display = "none"; // Hide measure-feature-section
        map.addInteraction(drag);
        break;
      }
      case "measure": {
        draggedFeatureSection.style.display = "none";
        drawFeatureSection.style.display = "none"; // Hide draw-feature-section
        measureFeatureSection.style.display = "block"; // Hide measure-feature-section
        map.addInteraction(drag);
        break;
      }
      default: {
        // saveButton.style.display = 'none';
        draggedFeatureSection.style.display = "none";
        drawFeatureSection.style.display = "none"; // Hide draw-feature-section
        measureFeatureSection.style.display = "none"; // Hide measure-feature-section
      }
    }
  }
  const handleSave = (e) => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draggedFeatureIds),
    };

    fetch("http://localhost:8080/api/your-endpoint", requestOptions)
      .then((response) => {
        // Handle the response from the server
        if (response.ok) {
          // Handle success
          console.log("Save successful");
        } else {
          // Handle failure
          console.error("Save failed");
        }
      })
      .catch((error) => {
        // Error occurred
        console.error("An error occurred", error);
      });
  }
  // display data of the clicked vector
  const handleMap = (data) => {
    let _map = data;
    const status = document.getElementById("status");
    _map.on("click", function (e) {
      while (document.getElementById("selected").firstChild) {
        document
          .getElementById("selected")
          .removeChild(document.getElementById("selected").firstChild);
      }
      if (selected !== null) {
        setSelected(null);
      }
      let has_f = false, _f = null;
      _map.forEachFeatureAtPixel(e.pixel, function (f) {
        has_f = true;
        _f = f;
        setSelected(f);
        // Tạo nội dung cho popup 
        let popupContent = document.createElement("div");

        let properties = f.getProperties();
        let data = [
          { label: "Quốc gia:", value: properties.COUNTRY },
          { label: "Khu vực:", value: properties.ENGTYPE_1 },
          { label: "Vùng:", value: properties.NAME_1 },
        ];

        for (let i = 0; i < data.length; i++) {
          let paragraph = document.createElement("p");
          paragraph.classList.add("content-popup-class");

          let labelSpan = document.createElement("span");
          labelSpan.classList.add("label-popup-class");
          labelSpan.appendChild(document.createTextNode(data[i].label));

          let valueSpan = document.createElement("span");
          valueSpan.classList.add("value-popup-class");
          valueSpan.appendChild(document.createTextNode(" " + data[i].value));

          paragraph.appendChild(labelSpan);
          paragraph.appendChild(valueSpan);

          popupContent.appendChild(paragraph);
        }


        // Đặt nội dung cho popup
        document.getElementById("popup-content").innerHTML = "";
        document.getElementById("popup-content").appendChild(popupContent);

        // Hiển thị popup
        popup.style.display = "block";
        popup.style.left = e.pixel[0] + "px";
        popup.style.top = e.pixel[1] + "px";
        return true;
      })
      if (has_f) {
        status.innerHTML = _f.get("ECO_NAME");
      } else {
        status.innerHTML = "&nbsp;";
      }

      // Hiển thị hoặc ẩn popup
      if (has_f) {
        popup.style.display = "block";
      } else {
        popup.style.display = "none";
      }
    });
  };
  const addInteraction = () => {
    let value = typeRef.current.value;
    if (value !== "None") {
      setDraw(draw => new Draw({
        source: source__,
        type: typeRef.current.value,
      }));
      map.addInteraction(draw);
    }
  }
  const handleType = (e) => {
    map.removeInteraction(draw);
    addInteraction();
  }
  const handleUndo = (e) => {
    draw.removeLastPoint();
  }
  const formatLength = (line) => {
    const length = getLength(line);
    let output;
    if (length > 100) {
      output = Math.round((length / 1000) * 100) / 100 + " km";
    } else {
      output = Math.round(length * 100) / 100 + " m";
    }
    return output;
  };

  const formatArea = (polygon) => {
    const area = getArea(polygon);
    let output;
    if (area > 10000) {
      output = Math.round((area / 1000000) * 100) / 100 + " km\xB2";
    } else {
      output = Math.round(area * 100) / 100 + " m\xB2";
    }
    return output;
  };
  const styleFunction = (feature, segments, drawType, tip) => {
    const styles = [style];
    const geometry = feature.getGeometry();
    const type = geometry.getType();
    let point, label, line;
    if (!drawType || drawType === type) {
      if (type === "Polygon") {
        point = geometry.getInteriorPoint();
        label = formatArea(geometry);
        line = new LineString(geometry.getCoordinates()[0]);
      } else if (type === "LineString") {
        point = new Point(geometry.getLastCoordinate());
        label = formatLength(geometry);
        line = geometry;
      }
    }
    if (segments && line) {
      let count = 0;
      line.forEachSegment(function (a, b) {
        const segment = new LineString([a, b]);
        const label = formatLength(segment);
        if (segmentStyles.length - 1 < count) {
          segmentStyles.push(segmentStyle.clone());
        }
        const segmentPoint = new Point(segment.getCoordinateAt(0.5));
        segmentStyles[count].setGeometry(segmentPoint);
        segmentStyles[count].getText().setText(label);
        styles.push(segmentStyles[count]);
        count++;
      });
    }
    if (label) {
      labelStyle.setGeometry(point);
      labelStyle.getText().setText(label);
      styles.push(labelStyle);
    }
    if (
      tip &&
      type === "Point" &&
      !modify.getOverlay().getSource().getFeatures().length
    ) {
      setTipPoint(tipPoint => geometry);
      tipStyle.getText().setText(tip);
      styles.push(tipStyle);
    }
    return styles;
  }
  const addMeasureInteraction = () => {
    const drawType = measureRef.current.value;
    if (drawType !== "None-Measure") {
      const activeTip =
        "Click to continue drawing the " +
        (drawType === "Polygon" ? "polygon" : "line");
      const idleTip = "Click to start measuring";
      let tip = idleTip;
      setDrawMeasure(drawMeasure => new Draw({
        source: source__,
        type: drawType,
        style: function (feature) {
          return styleFunction(feature, showSegments.checked, drawType, tip);
        },
      }));
      drawMeasure.on("drawstart", function () {
        if (clearPrevious.checked) {
          source__.clear();
        }
        modify.setActive(false);
        tip = activeTip;
      });
      drawMeasure.on("drawend", function () {
        modifyStyle.setGeometry(tipPoint);
        modify.setActive(true);
        map.once("pointermove", function () {
          modifyStyle.setGeometry();
        });
        tip = idleTip;
      });
      modify.setActive(true);
      map.addInteraction(drawMeasure);
    }
  }
  const handleSelectMeasure = () => {
    map.removeInteraction(drawMeasure);
    addMeasureInteraction();
  }
  const handleShowSegments = () => {
    vector.changed();
    drawMeasure.getOverlay().changed();
  }

  useEffect(() => {
    let data = new Map({
      target: "map",
      layers: layers.filter((e) => e.shown).map((e) => e.layer),
      view: new View({
        center: [0, 0],
        zoom: 2,
      }),
    });
    setMap(data);
    addInteraction();
    data.addInteraction(modify);
    addMeasureInteraction();
    handleMap(data);

  }, []);
  return (
    <>
      <div className="image-container">
        <div className="image-overlay"></div>
        <div className="image-title">
          <p>
            Bản đồ than đá Mong Duong
          </p>
        </div>
      </div>
      <div id="content">
        <div id="menu" className="p-4">
          <div className="img-menu-class">
            <img width="60" height="60" src="https://img.icons8.com/external-microdots-premium-microdot-graphic/60/external-choose-file-document-microdots-premium-microdot-graphic.png" alt="external-choose-file-document-microdots-premium-microdot-graphic" />
          </div>
          <div id="options">
            {
              layers.map((layer, index) => (
                <div className="wrapper-class" key={index}>
                  <div className="checkbox-title-wrapper-class">
                    <input type="checkbox" style={{ marginRight: '5px' }} checked={layer.shown} data-layer-id={layer.id} onChange={handleLayerCheckbox} />
                    <span>{layer.title}</span>
                  </div>
                  <div className="icon-wrapper-class">
                    <i className="icon-class">
                      <img src={layer.icon} alt="Icon" />
                    </i>
                  </div>
                </div>
              ))
            }
          </div>
          {/* <!-- Select mode --> */}
          <select id="mode" className="select-control" onChange={handleMode}>
            <option value="none">Chi tiết</option>
            <option value="modify"> Kéo thả </option>
            <option value="measure">Đo lường </option>
          </select>
          {/* <!-- Button save after Modifying --> */}
          <div id="dragged-feature-section" className="form-group" style={{ display: "none" }}>
            <label htmlFor="dragged-feature-count">Số tính năng đã được kéo:</label>
            <span id="dragged-feature-count">0</span>
            <br />
            <span id="dragged-ids"></span>
            <button id="save-button" onClick={handleSave}>Lưu thông tin</button>
          </div>
          <div id="selected" className="form-group p-4" style={{ display: "none" }}></div>
          <div id="commit"></div>
          {/* <!-- Draw new feature --> */}
          <form>
            <div id="draw-feature-section" className="form-group p-4" style={{ display: "none" }}>
              <label htmlFor="type" className="mb-4">Vẽ một tính năng mới &nbsp;</label>
              <select id="type" className="form-control mb-4 mt-4" ref={typeRef} onChange={handleType}>
                <option value="None">Không</option>
                <option value="Point">Điểm</option>
                <option value="LineString">Đường</option>
                <option value="Polygon">Đa giác</option>
                <option value="Circle">Hình tròn</option>
              </select>
              <button className="btn btn-primary f-right" id="undo" onClick={handleUndo}>Quay lại</button>
            </div>

            {/* <!-- Measurement --> */}
            <div id="measure-feature-section" className="form-group p-4" style={{ display: "none" }}>
              <label htmlFor="typeMeasure">Loại đo lường &nbsp;</label>
              <select id="typeMeasure" className="form-control mt-4 mb-4" onChange={handleSelectMeasure} ref={measureRef}>
                <option value="None-Measure">Không</option>
                <option value="LineString">Độ dài (Đường)</option>
                <option value="Polygon">Vùng (Đa giác)</option>
              </select>
              <br />
              <label htmlFor="segments" className="mb-4">Hiển thị độ dài đoạn: &nbsp;</label>
              <input type="checkbox" id="segments" checked onChange={handleShowSegments} />
              <br />
              <label htmlFor="clear" className="mb-4">Xóa số đo trước đó: &nbsp;</label>
              <input type="checkbox" id="clear" checked />
            </div>
          </form>

        </div>
        <div id="map"></div>
        {/* <!-- Popup container --> */}
        <div id="popup" className="popup">
          <div className="popup-title">Thông tin tính năng</div>
          <div id="popup-content" className="popup-content">
            {/* <!-- Nội dung của popup --> */}
          </div>
        </div>
      </div>
      <span id="status">&nbsp;</span>
    </>
  )
}

export default App
