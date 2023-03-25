import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FlagIcon from "../../assets/icons/FlagIcon";
import MapMarkerCheckIcon from "../../assets/icons/MapMarkerCheckIcon";
import PlusCircleIcon from "../../assets/icons/PlusCircleIcon";
import AnimatedField from "../../components/AnimatedField";
import Button from "../../components/Button";
import Input from "../../components/Input";

import c from "./welcome.module.scss";




export default function Welcome() {
  const navigate = useNavigate();
  const [attempted, setAttempted] = useState(false);
  const [startPoint, setStartPoint] = useState("");
  const [checkpoints, setCheckpoints] = useState([{id: 1, value: ""}]);


  useEffect(() => {
    if(process.env.NODE_ENV == "development" && !process.env.REACT_APP_MAP_KEY){
      alert("Please enter your 'Google Javascript Map API Key in to the .env file before test'");
    }
  }, []);


  const preventCharacters = val => {
    return val.replace(/[^0-9.,]/g, "");
  }

  const handleInputChange = (value, id) => {
    setCheckpoints(checkpoints.map(point => {
      if(point.id === id){
        point.value = value;
        point.isValid = validateCoordinate(value);
      }
 
      return point;
    }))
  }

  const addNewCheckpoint = () => {   
    setCheckpoints([
      ...checkpoints,
      {id: checkpoints.length + 1, value: ""}
    ])
  }
 

  const validateCheckpoints = () => {
    return !checkpoints.find(latlong => !latlong.isValid);
  }

  const validateCoordinate = (latlong) => {
    const regexExp = /^((\-?|\+?)?\d+(\.\d+)?),\s*((\-?|\+?)?\d+(\.\d+)?)$/gi;
    return regexExp.test(latlong);
  }

  const redirectToMap = () => { 
    setAttempted(true); 
    if(!validateCheckpoints()){
      alert("Please fill all checkpoints properly")
      return;
    }
    sessionStorage.setItem("waypoints", JSON.stringify([
      startPoint,
      ...checkpoints.map(checkpoint => checkpoint.value)
    ]));
    navigate("/map");
  }
  
  const fillTestData = () => {
    setStartPoint("40.954225,28.809054")
    setCheckpoints([
      {id: 1, value:"40.640496,28.981199", isValid: true},
      {id: 2, value: "40.814437,29.268109", isValid: true},
    ])
  }


  return (
    <AnimatedField className={c.page} >
      <div className={c.content}>
        <h1>Welcome abroad!</h1>
        <h3>Let's create your jurney.</h3>
        
        <Input 
          value={startPoint}
          onChange={val => setStartPoint(preventCharacters(val))}
          label={"Start Point"}
          placeholder="Latitude, Longitude"
          icon={
            <FlagIcon 
              width={15}
              height={15}
            />
          }
          warn={attempted && !validateCoordinate(startPoint)}
        />
        {
          checkpoints.map((checkpoint, index) => (
            <Input  
              key={"checkpoint_input_" + checkpoint.id}
              value={checkpoint.value}
              onChange={val => handleInputChange(val, checkpoint.id)}
              label={"Way Point"}
              placeholder="Latitude, Longitude"
              containerStyle={{marginBottom:  checkpoints.length -1 === index ? 0 : "4%"}}
              warn={attempted && !checkpoint.isValid}
              clearable={index !== 0}
              icon={
                <MapMarkerCheckIcon 
                  style={{marginTop: -3}}
                  width={20}
                  height={20}
                />
              }
            />
          ))
        }
        <Button 
          type="text"
          className={c.checkpointButton}
          onClick={addNewCheckpoint}
        >
          <PlusCircleIcon
            width={18}
            height={18}
          />
          Add Waypoint
        </Button>

        
        <Button
          text="Go!"
          onClick={redirectToMap}
        />

        {
          process.env.NODE_ENV === "development" && (
            <Button 
              type="text"
              className={c.testDataButton}
              onClick={fillTestData}
            >
              Fill Test Data
            </Button> 
          )
        }
      </div>
    </AnimatedField>
  )
}