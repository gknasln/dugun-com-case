import React, { useState, useCallback, useEffect, useRef } from "react";
import { GoogleMap, LoadScript, OverlayView, OverlayViewF } from '@react-google-maps/api';
import { useNavigate } from "react-router-dom";

import AnimatedField from "../../components/AnimatedField"; 
import Loader from "../../components/Loader";

import HomeIcon from "../../assets/icons/HomeIcon";
import CenterIcon from "../../assets/icons/CenterIcon";
import FlagIcon from "../../assets/icons/FlagIcon";
import MapMarkerCheckIcon from "../../assets/icons/MapMarkerCheckIcon";
import ErrorIcon from "../../assets/icons/ErrorIcon";

import c from "./map.module.scss";
import classcat from "classcat";
import { applyPolyfils, calculateWindResistance, getDirection, getWindData } from "./utils";



let interval;
export default function Map() {
  const BASE_BOAT_SPEED = 7;

  
  const navigate = useNavigate();
  const mapRef = useRef();
  const [waypoints, setWaypoints] = useState(false);
  const [boatSpeed, setBoatSpeed] = useState(BASE_BOAT_SPEED);
  const [boatDirection, setBoatDirection] = useState(0);
  const [windDirection, setWindDirection] = useState(0);
  const [winSpeed, setWinSpeed] = useState(0);
  const [currentLine, setCurrentLine] = useState(0);
  const [lines, setLines] = useState([]);
  const [status, setStatus] = useState(false);


  useEffect(() => {
    return () => clearInterval(interval);
  }, []);


  useEffect(() => {
    (async() => {
      try {
        if(!waypoints){
          const data = sessionStorage.getItem("waypoints");
          if(!data){
            navigate(-1);
          }else{  
            setWaypoints(JSON.parse(data).map(waypoint => {
              const parts = waypoint.split(",");
              return {lat: parseFloat(parts[0]), lng: parseFloat(parts[1])};
            }));
          }
          return;
        } 

        if(lines.length === 0 || currentLine === -1) return;

        setStatus("loading");
        const windData = await getWindData(waypoints[currentLine]);
        setWindDirection(windData.data.windDirection);
        setWinSpeed(windData.data.windSpeed);
        
        const arrowIcon = {
          icon: {
            path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 6,
            strokeColor: "#00ABAA",
          },
          offset: "100%",
        }
    
        if(currentLine > 0){
          const previosLine = lines[currentLine-1].get("icons")
          if(previosLine.length === 2){
            previosLine.pop();
            lines[currentLine-1].set("icons", previosLine);
          }
        }
    
        const icons = lines[currentLine].get("icons");
        icons.push(arrowIcon);
        lines[currentLine].set("icons", icons);
    
        //distance in km
        const distance = lines[currentLine].getKmDifference();

    
        const direction = getDirection(
          waypoints[currentLine].lat, 
          waypoints[currentLine].lng,
          waypoints[currentLine+1].lat, 
          waypoints[currentLine+1].lng,
        );
        setBoatDirection(direction);
        
        // 1 kt = 1.852 km/h
        const speed = calculateWindResistance(
          windData.data.windDirection, 
          windData.data.windSpeed,
          direction,  //boatDirection
          boatSpeed
        );
        setBoatSpeed(speed);
        const kmSpeed =  speed*1.852;

        let traveledDistance = 0;
        let progress = 0;    
        clearInterval(interval);
        interval = window.setInterval(() => {
          traveledDistance += kmSpeed*0.02; //0.02 per hour since it triggers in every 50ms
          if(traveledDistance > distance){
            traveledDistance = distance;
            clearInterval(interval);
            if(lines.length -1 !== currentLine){
              setCurrentLine(currentLine + 1);
            }else{
              setCurrentLine(-1);
              setBoatSpeed(0);
            }
          }
    
          progress = ((traveledDistance / distance)*100).toFixed(2);
          icons[1].offset = progress + "%";
          lines[currentLine].set("icons", icons);
        }, 20); //1000ms means 1hour
        setStatus(false);
      } catch (error) {
        setStatus("error");
      }
    })();
  }, [lines, currentLine, waypoints]);




  const onLoad = useCallback((map, waypoints) => {
    applyPolyfils();
    mapRef.current = map;

    const dashedIcon = {
      icon: {
        path: "M 0,-1 0,1",
        strokeOpacity: 1,
        scale: 4,
        strokeColor: "#FFF"
      },
      offset: "0",
      repeat: "20px",
    }

    const lineList = [];
    waypoints.forEach((coord, index) => {
      if(waypoints.length - 1 !== index){
        const line = new window.google.maps.Polyline({
          path: [
            coord, 
            waypoints[index + 1]
          ],
          strokeColor: "transparent",
          icons: [
            dashedIcon,
          ],
          map: map,
        });
        lineList.push(line);
      }
    });
    alignMap(map, waypoints);
    setLines(lineList);    
  }, []);


  const alignMap = (map, waypoints) => {
    const bounds = new window.google.maps.LatLngBounds(waypoints[0]);
    waypoints.forEach((coord, index) => {
      bounds.extend(coord);
    });
    map.fitBounds(bounds);
  }


  const handleBackAction = () => {
    sessionStorage.removeItem("waypoints");
    navigate(-1);
  }


  if(!waypoints) return false;

  return (
    <AnimatedField className={c.page} >
      <LoadScript  googleMapsApiKey={process.env.REACT_APP_MAP_KEY}>
        <GoogleMap  
          mapContainerClassName={c.page}
          zoom={10}
          onLoad={(map) => onLoad(map, waypoints)}
          options={{
            fullscreenControl: false,
            zoomControl: false,
            streetViewControl: false,
            mapTypeControl: false,
          }}
        >
          
          <div className={classcat([c.board, c.windBoard])}>
            <div className={c.boardSection} >
              <span>Win Direction</span>
              <b>{windDirection}°</b>
            </div>
            <div className={c.boardSection} >
              <span>Win Speed</span>
              <b>{winSpeed}</b>
            </div>
          </div>

          <div className={classcat([c.board, c.boatBoard])}>
            <div className={c.boardSection} >
              <span>Boat Direction</span>
              <b>{boatDirection}°</b>
            </div>
            <div className={c.boardSection} >
              <span>Boat Speed</span>
              <b>{boatSpeed} kt</b>
            </div>
          </div>

          <div className={classcat([c.board, c.controlBoard])}>
            <button 
              className={c.controlButton}
              onClick={handleBackAction}  
            >
              <HomeIcon  />
              <span>Add New Waypoints</span>
            </button>
            <button 
              className={c.controlButton}
              onClick={() => alignMap(mapRef.current, waypoints)}
            >   
              <CenterIcon />
              <span>Align Center</span>
            </button>
          </div>

          {
            status === "loading" && (
              <div className={classcat([c.board, c.loaderBoard])}>
                <Loader />
                Preparing boat 
              </div>
            )
          }
          {
            status === "error" && (
              <div className={classcat([c.board, c.loaderBoard])}>
                <ErrorIcon 
                  width={50}
                  height={50}
                  fill="red"
                />
                &nbsp;&nbsp;Unexpected error occured.
              </div> 
            )
          }
          
          {
            waypoints.map((coord, index) => {
              return (
                <Overlay 
                  key={coord.lat}
                  coord={coord}
                  index={index}
                  isDone={currentLine >= index || currentLine === -1}
                />
              )
            })
          }
        </GoogleMap>
      </LoadScript>
    </AnimatedField>
  )
}

function Overlay({coord, index, isDone}) {
  return (
    <OverlayViewF
      position={coord}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
    >
      <div 
        className={classcat([c.wayPoint, isDone && c.doneWaypoint])} 
      >
        {
          index === 0 ? (
            <FlagIcon 
              width={15}
              height={15}
              fill={isDone ? "#00ABAA" : "#000"}
            />
          ) : (
            <MapMarkerCheckIcon 
              width={22}
              height={22}
              fill={isDone ? "#00ABAA" : "#000"}
            />
          )
        }
        {index === 0 ? "SP" : "WP " + (index+1)}
      </div>
    </OverlayViewF>
  );
}