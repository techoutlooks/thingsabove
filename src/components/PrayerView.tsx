import { useCallback, useReducer, memo } from "react"
import { useDispatch, useSelector } from 'react-redux'

import styled, {useTheme} from "styled-components/native"
import { Animated, FlatList, View, Text, Alert, TouchableOpacity,
  Dimensions, ViewProps, TextProps, LayoutChangeEvent, StyleSheet } from "react-native"
import { Feather } from '@expo/vector-icons'

import Prayer from "@/types/prayer"
import { upsertPrayers, selectPrayerById } from '@/state/prayers';
import { AudioPlayer, PrayActionGroup as PrayActions, SharePrayer } from "@/components";
import { Spacer, RADIUS} from "@/components/uiStyle/atoms"
import  { format, formatDistance } from 'date-fns'


/***
 * <PrayerView />
 */
const UnmemoizedPrayerView = ({ prayerId, style , ...props}
  :{ prayerId: string } & ViewProps ) => {

  const dispatch = useDispatch()
  const prayer = useSelector(selectPrayerById(prayerId))

  const unPublish = () => { 
    Alert.alert("Unpublish prayer ?", 
    "Your prayer partners won't be able to see this prayer anymore!", [
      { text: "Unpublish", 
        onPress: async () => {
          prayer && await dispatch(upsertPrayers([{...prayer, published: false}]))
        } 
      },
      { text: "Cancel", style: "cancel"} ])
  }

  if(!prayer) return (
    <NoData message={`Prayer #${prayerId} not synced!`} />
  )
  return (
    <Container {...props}>

      <Title>{prayer.title}</Title>
      <Description>{prayer?.description}</Description>
      <Spacer height={8}/>
      <Time {...{created_at: prayer.created_at, updated_at: prayer.updated_at }} />

      <Spacer height={12}/>
      <Row>{ 
        prayer?.published && (
          <Tag {...{ name: "Published", onPress: unPublish }} /> )}
      </Row>
      <Spacer height={48}/>

      <Row>
        <PrayActions />
        <SharePrayer {...{ prayer }} />
      </Row>
      <Spacer height={12}/>

      <PrayerPlaylist {...{prayer}} />
      {/* <Spacer height={48}/> */}

    </Container>
  )
}

const PrayerView = memo(UnmemoizedPrayerView)

const PrayerPlaylist = 
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
  border: ${p => p.theme.colors.mutedFg} 1px;
  border-radius: ${RADIUS}px;
`


const Tag = styled(({name, ...props}) => {
  const theme = useTheme()
	return (
		<TouchableOpacity {...props} >
      <Row>
        <Feather name="check-circle" size={24} color={theme.colors.primaryButtonFg} /> 
        <Text style={{color: 'white'}}>{' ' + name}</Text>
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
  font-weight: bold;
  font-size: 14px;
`
const Info = styled.Text.attrs({numberOfLines: 1})`
  font-size: 14px;
  line-height: 28px;
  color: ${p => p.theme.colors.titleFg};
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
  font-weight: bold;
  font-size: 16px;
  color: ${p => p.theme.colors.fg};
`
const Description = styled.Text`
  font-size: 16px;
  // color: ${p => p.theme.colors.titleFg};
`
const Row = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`
const Container = styled.View `
  padding: 16px;
  border-radius: ${RADIUS}px;
  border: ${p => p.theme.colors.mutedFg} 1px;
  // background-color: ${p => p.theme.colors.inputBg}
`

const { height: wHeight } = Dimensions.get("window")
const Y_HEIGHT = wHeight - 64
const Y_MARGIN = 16
const INIT_HEIGHT = 400 + 2*Y_MARGIN

/**
 * Animated <PrayerView /> with dynamic height.
 * Vertical animation driven by `y`
 */
 const UnmemoizedAnimatedPrayerView = ({prayer, index, y }
  : {prayer: Prayer, y: Animated.Value, index: number}) => {

  const [height, setHeight] = useReducer((s,a) => a + 2*Y_MARGIN, INIT_HEIGHT)
  const onLayout = useCallback( ({nativeEvent}) => setHeight(nativeEvent.layout.height), [])

  const position = Animated.subtract(index * height, y);
  const isDisappearing = -height
  const isAppearing = Y_HEIGHT
  const isTop = 0;
  const isBottom = Y_HEIGHT - height

  console.log(`????? prayer.id=${prayer?.id} index=${index} height=${height} -> `, .00001 + index * height)
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
      <UnmemoizedPrayerView {...{ prayerId: prayer.id,  }} /> 
      {/* <PrayerView {...{ prayerId: prayer.id, onLayout }} />  */}

    </Animated.View>
  )
}

const styles = StyleSheet.create({
  card: {
    marginVertical: Y_MARGIN,
    alignSelf: "center",
  },
})

const AnimatedPrayerView = memo(UnmemoizedAnimatedPrayerView)



export { 
  UnmemoizedPrayerView, UnmemoizedAnimatedPrayerView, 
  PrayerView, AnimatedPrayerView 
}

