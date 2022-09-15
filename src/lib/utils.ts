import React from "react";
import * as FileSystem from 'expo-file-system';

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
