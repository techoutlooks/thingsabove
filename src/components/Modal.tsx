import React, { useState } from "react";
import { Alert, Modal, StyleSheet, Pressable, View, ViewProps, PressableProps } from "react-native";
import styled from "styled-components/native";
import * as atoms from '@/components/uiStyle/atoms'


type Props = { 
  button: any, containerStyle: ViewProps['style'] 
} & ViewProps


export default ({ button, children, containerStyle, style, ...props }: Props) => {

  const [modalVisible, setModalVisible] = useState(false)
  const onPress = () => setModalVisible(true)

  return (
    <Container style={containerStyle}>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        // onRequestClose={() => {
        //   Alert.alert("Modal has been closed.");
        //   setModalVisible(!modalVisible);
        // }}
        {...props}
      >
        <Container style={containerStyle}>
          <View style={[styles.modalView, style]}>
            { children }
            <CloseButton onPress={() => setModalVisible(!modalVisible)} />
          </View>
        </Container>

      </Modal>

      { button({ onPress }) ?? (
        <DefaultOpenButton {...{onPress}} />
      )}

    </Container>
  );
};

const styles = StyleSheet.create({

  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },

  buttonOpen: {
    backgroundColor: "#F194FF",
  },

  modalText: {
    marginBottom: 15,
    textAlign: "center"
  }
});

const Text = styled(atoms.Text)`
  color: ${p => p.theme.colors.cardBg};
  font-weight: bold;
  font-size: 12px;
  text-align: center;
`
const Button = styled(Pressable)`
  border-radius: ${atoms.RADIUS}px;
  padding: 10px;
  elevation: 2;
`
const DefaultOpenButton = styled(Button)
  .attrs({ children: <Text>Show</Text> })
`
  background-color: ${p => p.theme.colors.mutedFg};
`
const CloseButton = styled(Button)
  .attrs({ children: <Text>Close</Text> })
`
  background-color: ${p => p.theme.colors.primaryButtonBg};
`
const Container = styled.View`
  flex: 1;
  margin-top: 22px;
  justify-content: center;
  align-items: center;
`



