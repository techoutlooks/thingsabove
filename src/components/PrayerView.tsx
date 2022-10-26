import { useCallback, useReducer, memo } from "react"
import { useDispatch, useSelector } from 'react-redux'

import styled, {useTheme} from "styled-components/native"
import { Animated, FlatList, View, Alert, TouchableOpacity,
  Dimensions, ViewProps, TextProps, StyleSheet } from "react-native"
import { Feather } from '@expo/vector-icons'
import  { format, formatDistance } from 'date-fns'

import Prayer from "@/types/prayer"
import { upsertPrayers, selectPrayerById } from '@/state/prayers';
import { Text, Spacer, RADIUS} from "@/components/uiStyle/atoms"

import AudioPlayer from "./AudioPlayer"
import SharePrayer from "./SharePrayer"
import {PrayActionGroup as PrayActions} from "./PrayNow"


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
      <Spacer height={6}/>

      <Row>
        <Tag {...{ 
          name: `${prayer?.published ? 'Published' : 'Unpublished'}`,
          onPress: () => updatePublished({published: !prayer?.published}) 
        }}/> 
      </Row>
      <Spacer height={18}/>

      <Description>{prayer?.description}</Description>
      <Spacer height={48}/>

      <Row>
        <PrayActions />
        <SharePrayer {...{ prayer }} />
      </Row>
      <Spacer height={12}/>

      <AudioList {...{prayer}} />
      {/* <Spacer height={48}/> */}

    </Container>
  )
}


const AudioList = 
  styled(({prayer, style}: {prayer: Prayer} & ViewProps) => {

    const keyExtractor = useCallback((item, i) => item+i, []) 
    const renderItem = ({item: path}) => (<AudioPlayer {...{path }} />)

    if(!prayer) return (
      <NoData message="Your prayer list is empty!" />
    )
    return (
      <View {...{ style }}>
        <FlatList {...{ data: prayer.audio_urls, keyExtractor, renderItem }} />
      </View>
    )
})
`
  border: ${p => p.theme.colors.messageBg} 2px;
  border-radius: ${RADIUS}px;
`


const Tag = styled(({name, ...props}) => {
  const theme = useTheme()
	return (
		<TouchableOpacity {...props} >
      <Row>
        <Feather name="check-circle" size={24} color={theme.colors.primaryButtonFg} /> 
        <Text style={{color: 'white', fontSize: 14}}>{' ' + name}</Text>
      </Row>
		</TouchableOpacity>
	)
})`
	padding: 5px 8px 5px 5px;
	border-radius: ${RADIUS}px;
  background-color: ${p => p.theme.colors.primaryButtonBg}
`
const NoData = styled(({message, ...props}: {message?: string} & TextProps) => (
  <Text {...{children: message, ...props}} />
)).attrs(p => ({ message: 'No content found!', ...p }))`
  font-family: SFProDisplay-Bold;
  font-size: 14px;
`
const Info = styled.Text.attrs({numberOfLines: 1})`
  font-size: 13px;
  line-height: 28px;
  color: ${p => p.theme.colors.titleFg};
  font-family: SFProDisplay-Medium;
`
const Time = styled(({created_at, updated_at, style}) => (
  <Row {...{style}}>
    <Info>{format(new Date(created_at), 'MM/dd/yyyy')}{' '}</Info>
    <Info>(updated:{' '}
      {formatDistance(new Date(updated_at), new Date(), { addSuffix: true })})
    </Info>
  </Row>
))
`
  justify-content: flex-start;
`
const Title = styled.Text`
  font-family: SFProDisplay-Bold;
  font-size: 18px;
  line-height: 20px;
  color: ${p => p.theme.colors.fg};
`
const Description = styled.Text.attrs({numberOfLines: 5})`
  font-size: 15px;
  font-family: SFProDisplay-Medium;

`
const Row = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`
const Container = styled.View `
  padding: 16px;
`

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
  border-radius: ${RADIUS}px;
`


const PrayerView = memo(UnmemoizedPrayerView)
const AnimatedPrayerView = memo(UnmemoizedAnimatedPrayerView)

export { 
  UnmemoizedPrayerView, UnmemoizedAnimatedPrayerView, 
  PrayerView, AnimatedPrayerView 
}

