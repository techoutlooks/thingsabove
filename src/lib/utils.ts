import React from "react";
import { Platform } from 'react-native';


export const isAndroid = () => Platform.OS === 'android'



export type ValueOf<T> = T[keyof T]


export const isempty = (o: Object) => !!o && !Object.keys(o).length

export const trim = (text: string) => text.replace(/^\s+|\s+$/g, '')


/***
 *  Array shallow equality test
 */
export const arrayequal: boolean = 
  <T extends []>(a: T, b: T) => 
    a.length === b.length && a.every((v, i) => v === b[i]);


/**
 * Gets the string type of the component or core html (JSX) element. React Fragments will return type 'react.fragment'. Priority will be given to the prop '__TYPE'.
 *
 * @param {ReactNode} component - The component to type check
 * @returns {string} - The string representation of the type
 */
export const typeOf = (component: React.ReactElement) =>
  component?.props?.__TYPE ||
  component?.type?.toString().replace('Symbol(react.fragment)', 'react.fragment') ||
  undefined;

/**
 * Gets all children by specified type. Checks prop '__TYPE' first and 
 * then the 'type' string to match core html elements. 
 * To find a React Fragment, search for type 'react.fragment'.
 *
 * @param {ReactNode} children - JSX children
 * @param {string[]} types - Types of children to match
 * @returns {ReactNode[]} - Array of matching children
 * @example
 * // Finds all occurrences of ToDo (custom component), div, and React Fragment
 * getChildrenByType(children, ['ToDo', 'div', 'react.fragment']);
 */
export const getChildren = (children, types) =>
  React.Children.toArray(children).filter(child => types.indexOf(typeOf(child)) !== -1);


/***
 * Reads file url, yields base64 encoded string.
 */
export async function urlToBase64(url: string) {
  return urlToBlob(url).then(blob => blobToBase64(blob))
}  

/***
 * Fetch blob data from url
 * using XHR instead of fetch() which is buggy in RN.
 */
export function urlToBlob(url: string): Promise<Blob> {
  
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.onload = () => {
      resolve(xhr.response); }
    xhr.onerror = (e) => {
      reject(new TypeError("Network request failed")) }
    xhr.responseType = "blob";
    xhr.open("GET", url, true);
    xhr.send();
  });
}

/***
 * Convert blob obj -> base64 encoded string
 */
export function blobToBase64(blob: Blob): Promise<string> {
  const reader = new FileReader();
  reader.readAsDataURL(blob);
  return new Promise((resolve) => {
    reader.onloadend = () => {
      resolve(reader.result as string);
    }
  });
};

/***
 * Bolderize text
 * https://stackoverflow.com/a/70390814
 * https://gist.github.com/typekcz/746d737aa4fccbd7455c8d833677def5
 */
// const upperDiff = "𝗔".codePointAt(0) - "A".codePointAt(0)
// const lowerDiff = "𝗮".codePointAt(0) - "a".codePointAt(0)
// const digitDiff = "𝟭".codePointAt(0) - "1".codePointAt(0)

// const isUpper = (n) => n >= 65 && n < 91;
// const isLower = (n) => n >= 97 && n < 123;

// const bolderizeChar = (char: string) => {
//   const n = char.charCodeAt(0);
//   if (isUpper(n)) return String.fromCodePoint(n + upperDiff);
//   if (isLower(n)) return String.fromCodePoint(n + lowerDiff);
//   return char;
// };

// export const bolderize = (word: string) => [...word].map(bolderizeChar).join("");

const boldStyle = {
	upperDiff: ("𝗔".codePointAt(0) - "A".codePointAt(0)), 
	lowerDiff: ("𝗮".codePointAt(0) - "a".codePointAt(0)), 
	digitDiff: ("𝟭".codePointAt(0) - "1".codePointAt(0))
}
export function bolderize(text: string, style=boldStyle) {
  let out = "";
  for(let i = 0; i < text.length; i++){
    if(/[a-z]/.test(text[i])){
      out += String.fromCodePoint(text.codePointAt(i) + style.lowerDiff);
    } else if(/[A-Z]/.test(text[i])){
      out += String.fromCodePoint(text.codePointAt(i) + style.upperDiff);
    } else if(/[0-9]/.test(text[i])){
      out += String.fromCodePoint(text.codePointAt(i) + style.digitDiff);
    } else {
      out += text[i];
    }
  }
  return out;
}