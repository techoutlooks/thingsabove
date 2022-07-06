import {Dimensions} from "react-native";

const {width, height} = Dimensions.get('window');


// TYPES
// =====
export enum Sizes { xs = 18, sm = 24, md = 36,  lg = 48, xl = 96 }

// VALUES
// =====
export const CONTAINER_PADDING = 12;
export const CONTAINER_RATIO = 1.6;
export const PADDING = 4;                           // self padding (of inner component) vs. container 
export const RADIUS = 10;                           // default radius of all ui elements
export const WIDTH = width - CONTAINER_PADDING;     // usable width
export const HEIGHT = height - CONTAINER_PADDING;   // usable height