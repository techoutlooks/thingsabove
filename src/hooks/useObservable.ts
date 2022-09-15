import {useEffect, useState} from "react";
import { Observable } from "redux";


export const useObservable = <T>(observable: Observable<T>) => {
    const [value, setValue] = useState<T>()
    const [error, setError] = useState<Error>()
  
    useEffect(() => {
      const sub = observable.subscribe(setValue, setError)
      return () => sub.unsubscribe()
    }, [observable])
  
    return [error, value]
  }