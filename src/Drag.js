import PointerInteraction from "ol/interaction/Pointer.js";

// Implement the drag interraction
export default class Drag extends PointerInteraction {
    constructor() {
        super({
            handleDownEvent: handleDownEvent,
            handleDragEvent: handleDragEvent,
            handleMoveEvent: handleMoveEvent,
            handleUpEvent: handleUpEvent,
        });

        /**
         * @type {import("../src/ol/coordinate.js").Coordinate}
         * @private
         */
        this.coordinate_ = null;

        /**
         * @type {string|undefined}
         * @private
         */
        this.cursor_ = "pointer";

        /**
         * @type {Feature}
         * @private
         */
        this.feature_ = null;

        /**
         * @type {string|undefined}
         * @private
         */
        this.previousCursor_ = undefined;
    }
}
var deltaXTotal = 0;
var deltaYTotal = 0;

let draggedFeatureIds = [];

let draggedFeatureCount = 0;

var clickPoint;
/**
 * @param {import("../src/ol/MapBrowserEvent.js").default} evt Map browser event.
 * @return {boolean} `true` to start the drag sequence.
 */
function handleDownEvent(evt) {
    clickPoint = JSON.parse(JSON.stringify(evt.coordinate));
    const map = evt.map;
    const feature = map.forEachFeatureAtPixel(evt.pixel, function (feature) {
        return feature;
    });

    if (feature) {
        this.coordinate_ = evt.coordinate;
        this.feature_ = feature;
    }

    return !!feature;
}

/**
 * @param {import("../src/ol/MapBrowserEvent.js").default} evt Map browser event.
 */

function handleDragEvent(evt) {
    const deltaX = evt.coordinate[0] - this.coordinate_[0];
    const deltaY = evt.coordinate[1] - this.coordinate_[1];

    deltaXTotal += deltaX;
    deltaYTotal += deltaY;

    this.coordinate_[0] = evt.coordinate[0];
    this.coordinate_[1] = evt.coordinate[1];

    var points = [clickPoint, [this.coordinate_[0], this.coordinate_[1]]];

    // if (map.getAllLayers().length > 2) {
    //   map.removeLayer(map.getAllLayers()[2])
    // }

    map.getLayers().forEach((layer) => {
        if (layer.getClassName() == "vectorLineLayer") {
            // console.log("delete layers");
            map.removeLayer(layer);
        }
    });

    var featureLine = new Feature({
        geometry: new LineString(points),
    });

    let FlatCoordinates;

    // console.log("this.feature_", this.feature_)

    if (this.feature_.hasOwnProperty("getFlatCoordinates")) {
        FlatCoordinates = this.feature_.getFlatCoordinates();
    }

    // var FlatCoordinates = this.feature_.getFlatCoordinates()
    var coordinates = [[]];

    var i = 0;
    while (i < FlatCoordinates?.length) {
        coordinates[0][i / 2] = [FlatCoordinates[i], FlatCoordinates[i + 1]];
        i = i + 2;
    }

    var featurePolygon = new Feature({
        geometry: new Polygon(coordinates),
    });

    featurePolygon
        .getGeometry()
        .translate(points[1][0] - points[0][0], points[1][1] - points[0][1]);
    var vectorLineSource = new VectorSource({});
    vectorLineSource.addFeature(featureLine);
    vectorLineSource.addFeature(featurePolygon);

    var vectorLineLayer = new VectorLayer({
        className: "vectorLineLayer",
        source: vectorLineSource,
        style: new Style({
            fill: new Fill({ color: "#F6F7F9", weight: 4 }),
            stroke: new Stroke({ color: "#213660", width: 2 }),
        }),
    });

    map.addLayer(vectorLineLayer);
}

/**
 * @param {import("../src/ol/MapBrowserEvent.js").default} evt Event.
 */

function handleMoveEvent(evt) {
    if (this.cursor_) {
        const map = evt.map;
        const feature = map.forEachFeatureAtPixel(evt.pixel, function (feature) {
            return feature;
        });
        const element = evt.map.getTargetElement();
        if (feature) {
            if (element.style.cursor != this.cursor_) {
                this.previousCursor_ = element.style.cursor;
                element.style.cursor = this.cursor_;
            }
        } else if (this.previousCursor_ !== undefined) {
            element.style.cursor = this.previousCursor_;
            this.previousCursor_ = undefined;
        }
    }
}

function handleUpEvent(evt) {
    map.getLayers().forEach((layer) => {
        if (layer.getClassName() == "vectorLineLayer") {
            // console.log("delete layers");
            map.removeLayer(layer);
        }
    });
    // check intance of RenderFeature
    if (this.feature_ instanceof RenderFeature) {
        FlatCoordinates = this.feature_.getFlatCoordinates();
    }

    var coordinates = [[]];
    var i = 0;
    while (i < FlatCoordinates.length) {
        coordinates[0][i / 2] = [FlatCoordinates[i], FlatCoordinates[i + 1]];
        i = i + 2;
    }

    var featureNewPolygon = new Feature({
        geometry: new Polygon(coordinates),
    });

    var points = [clickPoint, [this.coordinate_[0], this.coordinate_[1]]];

    featureNewPolygon
        .getGeometry()
        .translate(points[1][0] - points[0][0], points[1][1] - points[0][1]);

    var featurePolygon = new Feature({
        geometry: new Polygon(coordinates),
    });
    var vectorCommitSource = new VectorSource({});
    var vectorNewCommitSource = new VectorSource({});

    vectorCommitSource.addFeature(featurePolygon);
    vectorNewCommitSource.addFeature(featureNewPolygon);

    var vectorCommitLayer = new VectorLayer({
        source: vectorCommitSource,
        style: new Style({
            fill: new Fill({ color: "#ece8ae", weight: 4 }),
            stroke: new Stroke({ color: "blue", width: 2 }),
        }),
    });

    var vectorNewCommitLayer = new VectorLayer({
        source: vectorNewCommitSource,
        style: new Style({
            fill: new Fill({ color: "rgba(255, 100, 100, 0.3)", weight: 4 }),
            stroke: new Stroke({ color: "rgba(255, 80, 80, 0.9)", width: 2 }),
        }),
    });

    //add the layers
    if (this.feature_ instanceof Feature) {
    }
    const gid = this.feature_.getProperties().gid;
    map.addLayer(vectorCommitLayer);
    map.addLayer(vectorNewCommitLayer);

    if (gid) {
        draggedFeatureIds.push(gid);
    }
    if (deltaXTotal != 0 || deltaYTotal != 0) {

        // Tăng giá trị draggedFeatureCount lên 1
        draggedFeatureCount += 1;
        updateDraggedFeatureCount();
    }

    this.coordinate_ = null;
    this.feature_ = null;
    deltaXTotal = 0;
    deltaYTotal = 0;

    // if (map.getAllLayers().length > 2) {
    //   map.removeLayer(map.getAllLayers()[2]);
    // }

    return false;
}