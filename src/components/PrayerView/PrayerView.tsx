import React, { memo } from "react"
import { Alert, ViewProps } from "react-native"
import { useDispatch, useSelector } from 'react-redux'
import { upsertPrayers, selectPrayerById } from '@/state/prayers';
import * as atoms from "@/components/uiStyle/atoms"

import SharePrayerLink from "../SharePrayerLink"
import PostPrayerButton from "../PostPrayerButton"
import { NoData, AudioList, Buttons, EditPrayerButton, 
  Time, Tag, Title, Description, Row, Container } from "./elements"

/***
 * <PrayerView />
 */
const UnmemoizedPrayerView = ({ prayerId,  ...props}
  :{ prayerId: string } & ViewProps ) => {

  const dispatch = useDispatch()
  const prayer = useSelector(selectPrayerById(prayerId))

  const updatePublished = ({published}: {published: boolean}) => { 

    const msgs = {
      publish: { 
        texts: ["Publish prayer ?", "Your prayer will be visible by others"],
        button: "Publish"
      },
      unpublish: {
        texts: ["Unpublish prayer ?", "People you pray with won't be able to see this prayer anymore!"],
        button: "Unpublish"
      }
    }
    msgs[published ? 'publish' : 'unpublish'].texts

    Alert.alert(
      ...(msgs[published ? 'publish' : 'unpublish'].texts as [string, string]), [
      { text: msgs[published ? 'publish' : 'unpublish'].button, 
        onPress: async () => {
          prayer && await dispatch(upsertPrayers([{...prayer, published}]))
        }},
      { text: "Cancel", style: "cancel"} ]
    )
  }

  // console.log(`<PrayerView /> title=${prayer?.title} pictures=`, prayer?.picture_urls)

  if(!prayer) return (
    <NoData message={`Prayer #${prayerId} not synced!`} />
  )
  return (
    <Container {...props}>

      <Title>{prayer.title}</Title>
      <Time {...{created_at: prayer.created_at, updated_at: prayer.updated_at }} />
      <atoms.Spacer height={6} />

      <Row>
        <Tag {...{ 
          name: `${prayer?.published ? 'Published' : 'Unpublished'}`,
          onPress: () => updatePublished({published: !prayer?.published}) 
        }}/> 
      </Row>
      <atoms.Spacer height={18}/>

      <Description>{prayer?.description}</Description>
      <atoms.Spacer height={48}/>

      <Buttons>
        <Row>
          <EditPrayerButton {...{ prayer }} />
          <PostPrayerButton {...{prayers: [prayer]}} />
        </Row>
        <SharePrayerLink {...{ prayer }} />
        
      </Buttons>
      <atoms.Spacer height={12}/>

      <AudioList {...{prayer}} />
      {/* <Spacer height={48}/> */}

    </Container>
  )
}



const PrayerView = memo(UnmemoizedPrayerView)
export { UnmemoizedPrayerView, PrayerView }


