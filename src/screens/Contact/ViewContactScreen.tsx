import React from 'react';
import { useContact } from "@/hooks"
import ContactScreenCard from './ContactScreenCard';


  // const contact = {
  //   "avatar": [
  //     "b40cd796-b9e1-4c12-bbdb-056f0231bd92.jpg",
  //   ],
  //   "displayName": "Miheret",
  //   "userId": "ea7f233e-a17b-4473-ae83-837f35c911f4",
  //   "username": "Miheret",
  //   "about": "El Shaddai"
  // }
  const userIds = ["ea7f233e-a17b-4473-ae83-837f35c911f4"]


export default ({route }) => {

  const { params: { userId } } = route
  const contact = useContact(userId)

  return (
    <ContactScreenCard {...{ contact }} />
  )
}
