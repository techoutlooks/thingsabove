import { useCallback, useReducer, memo } from "react"
import { useDispatch, useSelector } from 'react-redux'

import styled, {useTheme} from "styled-components/native"
import { Animated, Alert, Dimensions, ViewProps, StyleSheet } from "react-native"


import {Prayer} from "@/types/models"
import { upsertPrayers, selectPrayerById } from '@/state/prayers';
import * as atoms from "@/components/uiStyle/atoms"

import SharePrayerLink from "../SharePrayerLink"
import PostPrayerButton from "../PostPrayerButton"

import { NoData, AudioList, Buttons, EditPrayerButton, 
  Info, Time, Tag, Title, Description, Row, Container } from "./elements"


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




const { height: wHeight } = Dimensions.get("window")
const Y_HEIGHT = wHeight - 64
const Y_MARGIN = 16
const INIT_HEIGHT = 400 + 2*Y_MARGIN

/**
 * Animated <PrayerView /> with dynamic height.
 * Vertical animation driven by `y`
 */
 const UnmemoizedAnimatedPrayerView = ({ prayer, index, y, style }
  : {prayer: Prayer, y: Animated.Value, index: number}) => {

  const [height, setHeight] = useReducer((s,a) => a + 2*Y_MARGIN, INIT_HEIGHT)
  const onLayout = useCallback( ({nativeEvent}) => setHeight(nativeEvent.layout.height), [])

  const position = Animated.subtract(index * height, y);
  const isDisappearing = -height
  const isAppearing = Y_HEIGHT
  const isTop = 0;
  const isBottom = Y_HEIGHT - height

  // console.log(`????? prayer.id=${prayer?.id} index=${index} height=${height} -> `, .00001 + index * height)
  const translateY = Animated.add(
    Animated.add(
      y,
      y.interpolate({
        inputRange: [0, .00001 + index * height],
        outputRange: [0, -index * height],
        extrapolateRight: "clamp",
      })
    ),
    position.interpolate({
      inputRange: [isBottom, isAppearing],
      outputRange: [0, -height / 4],
      extrapolate: "clamp",
    })
  )
  const scale = position.interpolate({
    inputRange: [isDisappearing, isTop, isBottom, isAppearing],
    outputRange: [0.5, 1, 1, 0.5],
    extrapolate: "clamp",
  })

  const opacity = position.interpolate({
    inputRange: [isDisappearing, isTop, isBottom, isAppearing],
    outputRange: [0.5, 1, 1, 0.5],
  })

  return (
    <Animated.View key={index} style={[ styles.card, 
      {opacity, transform: [{ translateY }, { scale }]} 
    ]} >
      <StyledPrayerView {...{ prayerId: prayer.id, style }} /> 
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  card: {
    marginVertical: Y_MARGIN,
    alignSelf: "center",
  },
})

const StyledPrayerView = styled(UnmemoizedPrayerView)`
  background-color: ${p => p.theme.colors.sentMessageBg};
  border-radius: ${atoms.RADIUS}px;
`


const PrayerView = memo(UnmemoizedPrayerView)
const AnimatedPrayerView = memo(UnmemoizedAnimatedPrayerView)

export { 
  UnmemoizedPrayerView, UnmemoizedAnimatedPrayerView, 
  PrayerView, AnimatedPrayerView 
}

