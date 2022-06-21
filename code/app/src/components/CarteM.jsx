import React, { useState, useEffect } from "react";
import {
  MapContainer as Map,
  TileLayer,
  Marker,
  Popup,
  GeoJSON,
  ImageOverlay,
} from "react-leaflet";

export default function CarteM(props) {
  const [regions, setRegions] = useState([]);

  const [tiles, setTiles] = useState({
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
  });

  const [regionStyle, setRegionStyle] = useState({
    default: {
      // color: '#4a83ec',
      color: "black",
      // opacity:0.2,
      opacity: 0.8,
      weight: 0.25,
      fillColor: "blue",
      fillOpacity: 0.5,
    },
    hover: {
      color: "#4a83ec",
      weight: 0.25,
      fillColor: "#1a1d62",
      fillOpacity: 0.5,
    },
    focus: {
      color: "#5d4037",
      weight: 2,
      opacity: 1,
      fillColor: "#1a1d62",
      fillOpacity: 0,
    },
  });

  const [listeRegionStyle, setlisteRegionStyle] = useState([]);

  function changeLayerEffect(index, effect) {
    let temp = listeRegionStyle;
    index > 0
      ? (temp[index] = regionStyle[effect])
      : temp.forEach((element) => {
          element = regionStyle["default"];
        });
    setlisteRegionStyle(temp);
  }

  function prepareRegion(data, layers) {
    for (let i = 0; i < data.length; i++) {
      listeRegionStyle[i] = regionStyle.default;
      layers.push(
        <GeoJSON
          key={"geojson" + i}
          data={data[i]}
          style={() => listeRegionStyle[i]}
          onEachFeature={onEachFeature}
          onmouseover={() => {
            handleMouseHover(i);
          }}
          onmouseout={() => {
            handleMouseOut(i);
          }}
          onclick={() => {
            handleFocus(i);
          }}></GeoJSON>
      );
    }
  }

  function onEachFeature(feature, layer) {
    // layer.bindPopup("ANALANJIROFO");
  }

  function getRegion() {
    console.log("getRegion from Map launched");
    props
      .regionJson("map-get", props.table, {
        thematique: props.thematique,
        year: props.year ? props.year : "2022",
      })
      .then((regions) => {
        const layers = [];
        prepareRegion(regions, layers);
        setRegions(layers);
      });
  }

  function handleMouseHover(index) {
    console.log("tralalalalalalal");
    changeLayerEffect(index, "hover");
  }
  function handleMouseOut(index) {
    listeRegionStyle[index] != regionStyle.focus
      ? changeLayerEffect(index, "default")
      : changeLayerEffect(index, "focus");
  }
  function handleFocus(index) {
    changeLayerEffect(index, "focus");
  }

  useEffect(() => {
    getRegion();
  }, [props.thematique]);

  return (
    <div className="content titled-content map">
      <section className="carte">
        <div className="row">
          <div className="col-md-12 map-div">
            <Map center={[-18.91368, 47.53613]} zoom={6}>
              <TileLayer url={tiles.url} attribution={tiles.attribution} />
              {regions.map((e) => {
                return e;
              })}
              {/* {communes}                   */}
            </Map>
          </div>
        </div>
      </section>
    </div>
  );
}
