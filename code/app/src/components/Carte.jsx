// import axios from 'axios';
import React, { createRef, Component } from 'react'
import { MapContainer as Map, TileLayer, Marker, Popup, GeoJSON, ImageOverlay } from 'react-leaflet'

export default class Carte extends Component {

  constructor(props) {
    super(props);

    this.mapRef = createRef();
    this.mapDateRef = createRef();
    this.mapTypeRef = createRef();

    this.state = {
      year: "2016",
      month: "01",
      regions: null,
      communes: null,

      regionLayerReferences: null, //Check rehefa onFocus
      communeLayerReferences: null, //Check rehefa onFocus
      focused: false,
      focusedRegionIndex: null,
      focusedCommuneIndex: null,

      fire:[],

      tiles:{
        url:"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        attribution:'&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      },

      isSatellite: false,

      feuxGeoJson: "",
      fireGeoJson: [],

      // Geojson Style for each state
      focusedStyle:{
        color: '#5d4037',
        weight: 2,
        opacity: 1,
        fillColor: "#1a1d62",
        fillOpacity: 0,
      },
      regionMouseOnStyle:{
        color: '#4a83ec',
        weight: 0.25,
        fillColor: "#1a1d62",
        fillOpacity: 0.5,
      },
      regionMouseOutStyle:{
        color: '#4a83ec',
        weight: 0.25,
        fillColor: "#1a1d62",
        fillOpacity: 0,
      },
      communeMouseOnStyle:{
        color: '#5d4037',
        weight: 0.25,
        fillColor: "#5d4037",
        fillOpacity: 0.5,
      },
      communeMouseOutStyle:{
        color: '#5d4037',
        weight: 0.25,
        fillColor: "#5d4037",
        fillOpacity: 0,
      },

      // Loader for map
      totalRequest:0,
      requestDone:0
    }

    // this.handleYearChange = this.handleYearChange.bind(this);
    // this.handleMonthChange = this.handleMonthChange.bind(this);
    this.getLayers = this.getLayers.bind(this);
  }

  // Formular
  // handleYearChange(e) {
  //   this.setState({year: e.target.value});
  // }

  // handleMonthChange(e) {
  //   this.setState({month: e.target.value});
  // }

  toSatellite() {
    let sat = this.state.isSatellite;
    const newTiles = !sat ? {
      url:"https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiemFjaGFyaWUiLCJhIjoiY2p0cXlubW83MGEyNjRkbDgwYjgzbHpyMCJ9.I_05xIIXbm5EqhqSXTDbJQ",
      attribution:'© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>'
    }:{
      url:"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution:'&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    };
    this.setState({
      tiles:newTiles,
      isSatellite:!sat
    })
  }

  // Utilities
  logMapProperties(map) {
    console.log('Map Properties :');
    console.log('Bounds :');
    console.log(map.getBounds());
    console.log('Zoom :');
    console.log(map.getZoom());
  }

  /* MAP */

  // Layers (GeoJSON) functionalities
  handleMapMouseOver(index, layerRef = this.state.regionLayerReferences, region=true, style=this.state.regionMouseOnStyle) {
    const element = layerRef[index];
    const layer = element.current.leafletElement;

    if(!this.state.focused || (region && this.state.focusedRegionIndex != index) || (!region && this.state.focusedCommuneIndex != index)) {
      layer.setStyle(style);
    }
  }

  handleMapMouseOut(index, layerRef = this.state.regionLayerReferences, region=true, style=this.state.regionMouseOutStyle) {
    const element = layerRef[index];
    const layer = element.current.leafletElement;

    if(!this.state.focused || (region && this.state.focusedRegionIndex != index) || (!region && this.state.focusedCommuneIndex != index)) { //Change if style if it's not on focus and also if none is focused
      layer.setStyle(style);
    }
  }

  focusOnRegion(index, layerRef = this.state.regionLayerReferences, region=true, focusedStyle=this.state.focusedStyle, style=this.state.regionMouseOutStyle) {
    // Allocate variable for current region
    var currentRegion = null;

    for (let i = 0; i < layerRef.length; i++) {
      const element = layerRef[i];
      const layer = element.current.leafletElement;
      
      if(index==i) {
        layer.setStyle(focusedStyle);
        const map = this.mapRef.current.leafletElement;
        map.fitBounds(layer.getBounds());

        // Set the current region
        currentRegion = layer.options.data.properties.NOM_REGION.replace('\'', '_').replace(' ', '_');
        console.log("Current region : ");
        console.log(currentRegion);
      } else {
        layer.setStyle(style);
      }
    }

    if(region) {
      // Get commune
      var commune = this.getLayers('Madagascar', 'Madagascar', 'Communes', currentRegion);
      // Clean communes states before add new commune, it prevent from some bug
      commune.then(date=>{
        this.setState({
          communes:[],
          communeLayerReferences: []
        });
      });
      // Update communes state
      commune.then(data=>{
        console.log("Current commune : ");
        console.log(data);
        const layers = [];
        const refs = [];
        this.handleLayoutLoaded(
          data.features, 
          layers, 
          refs, 
          false, 
          this.state.communeMouseOutStyle, 
          this.state.communeMouseOnStyle, 
          this.state.communeMouseOutStyle,
          this.state.focusedStyle,
          this.state.communeMouseOutStyle);
        this.setState({
          communes:layers,
          communeLayerReferences:refs
        })
      });

      this.setState({
        focused: true,
        focusedRegionIndex: index
      });
    } else {
      this.setState({
        focusedCommuneIndex: index
      });
    }
    
  }

  // Get shapes of region, country, ... from website
  async getLayers(category, country, level, name) {
    // try {
    //   const response = await axios({
    //     method: 'get',
    //     url: 'https://www.rfmrc-ea.org/layers.php?category='+category+'&country='+country+'&level='+level+'&name='+name
    //   });
    //   return await Promise.resolve(response.data);
    // } catch (error) {
    //   console.log(error);
    // }
  }

  // Show shapes of region, country, ... from website on loaded
  handleLayoutLoaded(
    data, 
    layers, 
    refs,
    region = true,
    layerStyle = {
      color: '#4a83ec',
      opacity:0.2,
      weight: 0.25,
      fillColor: "#1a1d62",
      fillOpacity: 0,
    },
    mouseOverStyle = this.state.regionMouseOnStyle,
    mouseOutStyle = this.state.regionMouseOutStyle,
    focusedStyle = this.state.focusedStyle,
    otherStyle = this.state.regionMouseOutStyle
  ) {
    for (let i = 0; i < data.length; i++) {
      const reference = createRef();
      refs.push(reference);

      layers.push(
        <GeoJSON 
          ref={reference}
          key={"geojson"+i} 
          data={data[i]} 
          style={() => (layerStyle)}
          onmouseover={() => {
            this.handleMapMouseOver(i, refs, region, mouseOverStyle)
          }}
          onmouseout={() => {
            this.handleMapMouseOut(i, refs, region, mouseOutStyle)
          }}
          onclick={() => {
            this.focusOnRegion(i, refs, region, focusedStyle, otherStyle);
          }}
        >
        </GeoJSON>
      ); 
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if(this.state.regions === null) {
      console.log(this.props.regionJson);
      this.props.regionJson.then(data=>{
        const layers = [];
        const refs = [];
        this.handleLayoutLoaded(data, layers, refs, true);
        this.setState({
          regions:layers,
          regionLayerReferences:refs
        })
      })
    }
  }

  render() {

    return (
      <div>
        <div className="content titled-content map">
          <section className="carte">
            <div className="row">
              <div className="col-md-12 map-div">
                <Map center={[-18.91368, 47.53613]} zoom={6} ref={this.mapRef}>
                  <TileLayer
                    url={this.state.tiles.url}
                    attribution={this.state.tiles.attribution}
                  />
                  {this.state.regions}
                  {this.state.communes}                  
                </Map>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }
}