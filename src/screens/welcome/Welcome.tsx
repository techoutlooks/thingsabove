import React from 'react'
import styled from 'styled-components/native'
import {ScreenCard, Button} from '@/components/atoms'


const Welcome = ({navigation}) => {

    return (
        <Container>
            <PrayNowButton onPress={
							() => navigation.navigate('PrayNow') }/>
        </Container>
    )
}


const PrayNowButton = styled(Button).attrs(p =>({
    name: 'mic', size: 'xl'
}))``
    


const Container = styled(ScreenCard)`
    justify-content: center
`

export default Welcome
